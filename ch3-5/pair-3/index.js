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

import { registerMember, updateMemberGrade } from "./member.js";
import { rooms, gradeConfig } from "./constants.js";
import { resetReservation } from "./reservation.js";

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

function makeReservation(roomId, date, startHour, duration, attendees) {
  if (!currentMember) {
    // Action 암묵적 입력
    console.log("로그인이 필요합니다."); // Action 암묵적 출력
    return null;
  }

  // 룸 존재 여부 확인
  var room = null;
  // Action 암묵적 입력
  for (var i = 0; i < rooms.length; i++) {
    if (rooms[i].id === roomId) {
      room = rooms[i]; // Action 암묵적 입력
      break;
    }
  }
  if (!room) {
    console.log("존재하지 않는 룸입니다: " + roomId); // Action 암묵적 출력
    return null;
  }

  // 인원 초과 확인
  if (attendees > room.capacity) {
    console.log("인원이 초과되었습니다. 최대 수용 인원: " + room.capacity + "명"); // Action 암묵적 출력
    return null;
  }

  var fee = room.pricePerHour * duration;
  var pointRate = gradeConfig[currentMember.grade].pointRate; // Action 암묵적 입력
  var earnedPoints = Math.floor((fee * pointRate) / 100);

  // Action 암묵적 출력
  currentMember.points += earnedPoints;
  currentMember.totalUsageHours += duration;

  updateMemberGrade();

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
  updateMemberGrade();

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
registerMember("M001", "조앤", 100);

var res1 = makeReservation("ROOM-A", "2026-03-15", 10, 2, 3);
var res2 = makeReservation("ROOM-B", "2026-03-16", 14, 2, 6);

printMemberSummary();

cancelReservation(res1.id, 0.5); // 30분 전 취소 → 패널티 발생

printMemberSummary();
