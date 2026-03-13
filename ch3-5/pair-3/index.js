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
import { gradeConfig } from "./constants.js";
import { printPointResult, printRegisterResult, printReservationResult } from "./outputView.js";
import { makeReservation } from "./reservation.js";

// ────────────────────────────────────────────────────────────
// 전역 상태
// ────────────────────────────────────────────────────────────

let currentMember = null; // Action
let reservations = []; // Action

// ────────────────────────────────────────────────────────────
// 예약 취소 함수
// ────────────────────────────────────────────────────────────

function findTargetReservation(reservationId) {
  const reservation = reservations.find((res) => res.id === reservationId);

  if (!reservation || reservation.status === "cancelled") {
    printInvalidReservationCancel();
    return;
  }

  return reservation;
}

function calcPenalty(hoursUntilStart, reservation) {
  const penaltyRate = gradeConfig[currentMember.grade].penaltyRate;

  if (hoursUntilStart < 1) {
    return Math.floor((reservation.earnedPoints * penaltyRate) / 100);
  }
  if (hoursUntilStart < 24) {
    return Math.floor((reservation.earnedPoints * 20) / 100);
  }

  return 0;
}

function cancelReservation(reservationId, hoursUntilStart) {
  if (!currentMember) {
    printLoginRequiredMessage();
    return;
  }

  // 예약 찾기
  const targetReservation = findTargetReservation(reservationId);

  // 취소 시점에 따른 패널티 계산
  // 24시간 이상 전: 패널티 없음
  // 24시간 미만:    적립 포인트의 20%
  // 1시간 미만:     적립 포인트 × 등급별 penaltyRate

  const penalty = calcPenalty(hoursUntilStart, targetReservation);

  // Action 암묵적 출력
  currentMember.points -= targetReservation.earnedPoints;
  currentMember.points -= penalty;
  currentMember.totalUsageHours -= targetReservation.duration;
  currentMember.grade = getGradeFromHours(currentMember.totalUsageHours);

  targetReservation.status = "cancelled";

  // Action 암묵적 출력
  console.log("예약이 취소되었습니다: " + reservationId);
  console.log("포인트 회수: -" + targetReservation.earnedPoints + "P  |  패널티: -" + penalty + "P");
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

// 맴버 등록
const newMember = createNewMember("M001", "조앤", 100);
printRegisterResult(newMember.name);
currentMember = newMember;

var res1 = makeReservation("ROOM-A", "2026-03-15", 10, 2, 3, currentMember);
reservations.push(res1);
printReservationResult(res1);
printPointResult(res1.earnedPoints, currentMember.points);

var res2 = makeReservation("ROOM-B", "2026-03-16", 14, 2, 6, currentMember);
reservations.push(res2);
printReservationResult(res2);
printPointResult(res2.earnedPoints, currentMember.points);

printMemberSummary();

cancelReservation(res1.id, 0.5); // 30분 전 취소 → 패널티 발생

printMemberSummary();
