/**
 * 📚 우테코 스터디룸 예약 시스템
 *
 * ⚠️  이 파일은 리팩토링 대상 원본 코드입니다. 수정하지 마세요.
 *
 * [주요 기능]
 * - 멤버 등록 및 등급 관리
 * - 스터디룸 예약
 * - 예약 취소 및 패널티 포인트 부과
 * - 예약 내역 요약 조회
 */

import { createNewMember, getGradeFromHours } from "./member.js";
import { rooms, gradeConfig } from "./constants.js";
import { printLoginRequiredMessage, printRegisterResult } from "./outputView.js";

// ────────────────────────────────────────────────────────────
// 전역 상태
// ────────────────────────────────────────────────────────────

let currentMember = null; // Action
let reservations = []; // Action

// ────────────────────────────────────────────────────────────
// 예약 관련 함수
// ────────────────────────────────────────────────────────────

// 예약 초기화 [Action]
export function resetReservation() {
  reservations = []; // Action 암묵적 출력
}

function getRoomById(roomId) {
  const room = rooms.find(({ id }) => roomId == id);

  // TODO: throw error 상위에서 에러 catch 처리
  if (!room) printInvalidRoom();

  return room;
}

function calcFee(room, duration) {
  return room.pricePerHour * duration;
}

function calcEarnedPoints(grade, fee) {
  const pointRate = gradeConfig[grade].pointRate;
  const earnedPoints = Math.floor((fee * pointRate) / 100);
  return earnedPoints;
}

function updateMembershipStatus(member, earnedPoints, duration) {
  const result = { ...member };

  result.points += earnedPoints;
  result.totalUsageHours += duration;
  result.grade = getGradeFromHours(result.totalUsageHours);

  return result;
}

function makeReservation(roomId, date, startHour, duration, attendees) {
  if (!currentMember) {
    printLoginRequiredMessage();
    return null;
  }

  const room = getRoomById(roomId);

  // 인원 초과 확인
  if (attendees > room.capacity) {
    printCapacityExcess(room.capacity);
    return null;
  }

  const fee = calcFee(room, duration);
  const earnedPoints = calcEarnedPoints(currentMember.grade, fee);

  // 멤버십 정보(포인트, 사용시간, 등급) 업데이트
  currentMember = updateMembershipStatus(currentMember, earnedPoints, duration);

  // Action 암묵적 입력
  var reservation = {
    id: "RES-" + Date.now(),
    memberId: currentMember.id,
    memberName: currentMember.name,
    roomId: roomId,
    roomName: room.name,
    date: date,
    startHour: startHour,
    duration: duration,
    attendees: attendees,
    fee: fee,
    earnedPoints: earnedPoints,
    status: "confirmed",
  };

  reservations.push(reservation); // Action 암묵적 출럭

  // Action 암묵적 출력
  console.log("예약 완료! [" + room.name + "] " + date + " " + startHour + "시 (" + duration + "시간)");
  console.log("적립 포인트: +" + earnedPoints + "P  |  보유 포인트: " + currentMember.points + "P");
  return reservation;
}

// ────────────────────────────────────────────────────────────
// 예약 취소 함수
// ────────────────────────────────────────────────────────────

function cancelReservation(reservationId, hoursUntilStart) {
  // Action 암묵적 입력
  if (!currentMember) {
    console.log("로그인이 필요합니다.");
    return;
  }

  // 예약 찾기
  var target = null;

  // Action 암묵적 입력
  for (var i = 0; i < reservations.length; i++) {
    if (reservations[i].id === reservationId) {
      target = reservations[i];
      break;
    }
  }

  if (!target || target.status === "cancelled") {
    console.log("취소할 수 없는 예약입니다.");
    return;
  }

  // 취소 시점에 따른 패널티 계산
  // 24시간 이상 전: 패널티 없음
  // 24시간 미만:    적립 포인트의 20%
  // 1시간 미만:     적립 포인트 × 등급별 penaltyRate

  // Action 암묵적 입력
  var penaltyRate = gradeConfig[currentMember.grade].penaltyRate;
  var penalty = 0;
  if (hoursUntilStart < 1) {
    // Calc 계산
    penalty = Math.floor((target.earnedPoints * penaltyRate) / 100);
  } else if (hoursUntilStart < 24) {
    penalty = Math.floor((target.earnedPoints * 20) / 100);
  }

  // Action 암묵적 출력
  currentMember.points -= target.earnedPoints;
  currentMember.points -= penalty;
  currentMember.totalUsageHours -= target.duration;
  currentMember.grade = getGradeFromHours(currentMember.totalUsageHours);

  target.status = "cancelled";

  // Action 암묵적 출력
  console.log("예약이 취소되었습니다: " + reservationId);
  console.log("포인트 회수: -" + target.earnedPoints + "P  |  패널티: -" + penalty + "P");
  console.log("현재 포인트: " + currentMember.points + "P");
}

// ────────────────────────────────────────────────────────────
// 조회 및 요약 함수
// ────────────────────────────────────────────────────────────

function printMemberSummary() {
  // Action 암묵적 입력
  if (!currentMember) {
    console.log("등록된 멤버가 없습니다.");
    return;
  }

  var confirmed = [];
  var totalFee = 0;
  // Action 암묵적 입력
  for (var i = 0; i < reservations.length; i++) {
    if (reservations[i].memberId === currentMember.id && reservations[i].status === "confirmed") {
      confirmed.push(reservations[i]);
      totalFee += reservations[i].fee;
    }
  }

  // Action 암묵적 출력
  console.log("========== 멤버 요약 ==========");
  console.log("이름     : " + currentMember.name);
  console.log("등급     : " + currentMember.grade);
  console.log("포인트   : " + currentMember.points + "P");
  console.log("누적사용 : " + currentMember.totalUsageHours + "시간  /  " + totalFee.toLocaleString() + "원");
  console.log("확정예약 : " + confirmed.length + "건");

  for (var j = 0; j < confirmed.length; j++) {
    var r = confirmed[j];

    // Action 암묵적 출력
    console.log(
      "  [" +
        r.roomName +
        "] " +
        r.date +
        "  " +
        r.startHour +
        "시 (" +
        r.duration +
        "시간)  " +
        r.fee.toLocaleString() +
        "원",
    );
  }
  console.log("===============================");
}

// ────────────────────────────────────────────────────────────
// 실행 예시
// ────────────────────────────────────────────────────────────

resetReservation();

// 맴버 등록
const newMember = createNewMember("M001", "조앤", 100);
printRegisterResult(newMember.name);
currentMember = newMember;

console.log(currentMember);

var res1 = makeReservation("ROOM-A", "2026-03-15", 10, 2, 3);
var res2 = makeReservation("ROOM-B", "2026-03-16", 14, 2, 6);

printMemberSummary();

cancelReservation(res1.id, 0.5); // 30분 전 취소 → 패널티 발생

printMemberSummary();
