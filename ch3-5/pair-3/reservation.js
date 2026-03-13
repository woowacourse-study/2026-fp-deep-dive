import { gradeConfig, rooms } from "./constants.js";
import { updateMembershipStatus } from "./member.js";
import { printInvalidRoom } from "./outputView.js";

// ────────────────────────────────────────────────────────────
// 예약 관련 함수
// ────────────────────────────────────────────────────────────
// 예약 생성 함수 [Action]
export function makeReservation(roomId, date, startHour, duration, attendees, member) {
  let currentMember = { ...member };

  const room = getRoomById(roomId);

  // 인원 초과 확인
  if (attendees > room.capacity) {
    printCapacityExcess(room.capacity);
    return null;
  }

  // 포인트 계산
  const earnedPoints = calcEarnedPoints(currentMember.grade, calcFee(room, duration));

  // 멤버십 정보(포인트, 사용시간, 등급) 업데이트
  currentMember = updateMembershipStatus(currentMember, earnedPoints, duration);

  const reservation = {
    id: "RES-" + Math.random(), // [Action]
    memberId: currentMember.id,
    memberName: currentMember.name,
    roomId: roomId,
    roomName: room.name,
    date: date,
    startHour: startHour,
    duration: duration,
    attendees: attendees,
    fee: calcFee(room, duration),
    earnedPoints: earnedPoints,
    status: "confirmed",
  };

  return { currentMember, reservation };
}

export function getRoomById(roomId) {
  const room = rooms.find(({ id }) => roomId == id);

  // TODO: throw error 상위에서 에러 catch 처리
  if (!room) printInvalidRoom();

  return room;
}

export function calcFee(room, duration) {
  return room.pricePerHour * duration;
}

export function calcEarnedPoints(grade, fee) {
  const pointRate = gradeConfig[grade].pointRate;
  const earnedPoints = Math.floor((fee * pointRate) / 100);
  return earnedPoints;
}

// ────────────────────────────────────────────────────────────
// 예약 취소 함수
// ────────────────────────────────────────────────────────────
// 예약된 정보에서 예약 ID로 예약을 찾는 함수 [Calc]
export function findTargetReservation(reservations, reservationId) {
  const reservation = reservations.find((res) => res.id === reservationId);

  if (!reservation || reservation.status === "cancelled") {
    printInvalidReservationCancel();
    return;
  }

  return reservation;
}

// 페널티 계산 함수 [Calc]
export function calcPenalty(member, hoursUntilStart, reservation) {
  const penaltyRate = gradeConfig[member.grade].penaltyRate;

  if (hoursUntilStart < 1) {
    return Math.floor((reservation.earnedPoints * penaltyRate) / 100);
  }
  if (hoursUntilStart < 24) {
    return Math.floor((reservation.earnedPoints * 20) / 100);
  }

  return 0;
}

// 예약 취소 함수 [Action]
export function cancelReservation(member, reservations, reservationId, hoursUntilStart) {
  if (!member) {
    printLoginRequiredMessage();
    return;
  }

  // 예약 찾기
  const targetReservation = findTargetReservation(reservations, reservationId);

  // 취소 시점에 따른 패널티 계산
  // 24시간 이상 전: 패널티 없음
  // 24시간 미만:    적립 포인트의 20%
  // 1시간 미만:     적립 포인트 × 등급별 penaltyRate

  const penalty = calcPenalty(member, hoursUntilStart, targetReservation);

  const currentMember = updateMembershipStatus(
    member,
    targetReservation.earnedPoints - penalty,
    targetReservation.duration,
  );

  targetReservation.status = "cancelled";

  return { currentMember, earnedPoints: targetReservation.earnedPoints, penalty, points: member.points };
}

// ────────────────────────────────────────────────────────────
// 조회 및 요약 함수
// ────────────────────────────────────────────────────────────
// 회원의 예약 내역에서 확정된 예약과 총 결제 금액을 반환하는 함수 [Calc]
export function getConfirmedReservation(reservations, member) {
  const confirmed = [];
  let totalFee = 0;

  reservations.forEach((reservation) => {
    if (reservation.memberId === member.id && reservation.status === "confirmed") {
      confirmed.push(reservation);
      totalFee += reservation.fee;
    }
  });

  return { confirmed, totalFee };
}
