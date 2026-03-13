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

import { createNewMember } from "./member.js";
import {
  printPointResult,
  printRegisterResult,
  printReservationCancelResult,
  printReservationResult,
  printTotalResult,
} from "./outputView.js";
import { makeReservation, getConfirmedReservation, cancelReservation } from "./reservation.js";

// ────────────────────────────────────────────────────────────
// 전역 상태
// ────────────────────────────────────────────────────────────

let reservations = [];

// ────────────────────────────────────────────────────────────
// 실행 예시
// ────────────────────────────────────────────────────────────

// 맴버 등록
const newMember = createNewMember("M001", "조앤", 100);
printRegisterResult(newMember.name);

const { currentMember: memberAfterReservation1, reservation: res1 } = makeReservation(
  "ROOM-A",
  "2026-03-15",
  10,
  2,
  3,
  newMember,
);
reservations.push(res1);
printReservationResult(res1);
printPointResult(res1.earnedPoints, memberAfterReservation1.points);

const { currentMember: memberAfterReservation2, reservation: res2 } = makeReservation(
  "ROOM-B",
  "2026-03-16",
  14,
  2,
  6,
  memberAfterReservation1,
);
reservations.push(res2);
printReservationResult(res2);
printPointResult(res2.earnedPoints, memberAfterReservation2.points);

const confirmedReservationBeforeCancel = getConfirmedReservation(reservations, memberAfterReservation2);
printTotalResult({ member: memberAfterReservation2, ...confirmedReservationBeforeCancel });

const {
  currentMember: updatedMember,
  earnedPoints,
  penalty,
  points,
} = cancelReservation(memberAfterReservation2, reservations, res2.id, 0.5); // 30분 전 취소 → 패널티 발생
printReservationCancelResult(res2.id, earnedPoints, penalty, points);

const confirmedReservationAfterCancel = getConfirmedReservation(reservations, updatedMember);
printTotalResult({ member: updatedMember, ...confirmedReservationAfterCancel });
