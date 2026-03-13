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

import { createNewMember, getGradeFromHours, updateMembershipStatus } from "./member.js";
import { gradeConfig } from "./constants.js";
import {
  printConfirmedReservation,
  printInvalidMember,
  printMemberSummary,
  printPointResult,
  printRegisterResult,
  printReservationCancelResult,
  printReservationResult,
} from "./outputView.js";
import { makeReservation } from "./reservation.js";

// ────────────────────────────────────────────────────────────
// 전역 상태
// ────────────────────────────────────────────────────────────

let currentMember = null;
let reservations = [];

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

  currentMember = updateMembershipStatus(
    currentMember,
    targetReservation.earnedPoints - penalty,
    targetReservation.duration,
  );

  targetReservation.status = "cancelled";

  return { earnedPoints: targetReservation.earnedPoints, penalty, points: currentMember.points };
}

// ────────────────────────────────────────────────────────────
// 조회 및 요약 함수
// ────────────────────────────────────────────────────────────

function getConfirmedReservation() {
  const confirmed = [];
  let totalFee = 0;

  reservations.forEach((reservation) => {
    if (reservation.memberId === currentMember.id && reservation.status === "confirmed") {
      confirmed.push(reservation);
      totalFee += reservation.fee;
    }
  });

  return { confirmed, totalFee };
}

function printTotalResult({ confirmed, totalFee }) {
  if (!currentMember) {
    printInvalidMember();
    return;
  }

  printMemberSummary(currentMember, confirmed, totalFee);
  printConfirmedReservation(confirmed);
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

const confirmedReservationBeforeCancel = getConfirmedReservation();
printTotalResult(confirmedReservationBeforeCancel);

const { earnedPoints, penalty, points } = cancelReservation(res2.id, 0.5); // 30분 전 취소 → 패널티 발생
printReservationCancelResult(res2.id, earnedPoints, penalty, points);

const confirmedReservationAfterCancel = getConfirmedReservation();
printTotalResult(confirmedReservationAfterCancel);
