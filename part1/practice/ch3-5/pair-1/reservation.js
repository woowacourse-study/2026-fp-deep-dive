const { STATUS, PENALTY_PERCENT_UNTIL_ONE_DAY } = require("./data");
const { getValueByKeys, filterByKey, calculatePercentage } = require("./utils");

// ────────────────────────────────────────────────────────────
// 예약 관련 함수
// ────────────────────────────────────────────────────────────

//[C]
function calculateFee(pricePerHour, duration) {
  return pricePerHour * duration;
}

//[C]
function getPointRate(gradeConfig, grade) {
  return getValueByKeys(gradeConfig, [grade, "pointRate"]);
}

//[C]
function calculateEarnedPoints(fee, gradeConfig, grade) {
  const pointRate = getPointRate(gradeConfig, grade);
  return calculatePercentage(fee, pointRate);
}

//[C]
function isOverCapacity(attendees, capacity) {
  return attendees > capacity;
}

//[A] - Random가 호출 시점마다 달라지기 때문
function createReservation(params) {
  const { memberId, memberName, roomId, roomName, date, startHour, duration, attendees, fee, earnedPoints, status } =
    params;

  const id = `RES-${Math.random()}`;

  return {
    id,
    memberId,
    memberName,
    roomId,
    roomName,
    date,
    startHour,
    duration,
    attendees,
    fee,
    earnedPoints,
    status,
  };
}

// ────────────────────────────────────────────────────────────
// 예약 취소 함수
// ────────────────────────────────────────────────────────────

//[C]
function isCancellabe(reservation) {
  return reservation !== null && reservation.status !== STATUS.CANCELLED;
}

//[C]
function calculatePenaltyPercent(penaltyRate, hoursUntilStart) {
  if (hoursUntilStart < 1) return penaltyRate;
  if (hoursUntilStart < 24) return PENALTY_PERCENT_UNTIL_ONE_DAY;
  return 0;
}

//[C]
function calculatePenaltyPoint(earnedPoints, penaltyRate, hoursUntilStart) {
  const penaltyPercent = calculatePenaltyPercent(penaltyRate, hoursUntilStart);
  return calculatePercentage(earnedPoints, penaltyPercent);
}

// ────────────────────────────────────────────────────────────
// 조회 및 요약 함수
// ────────────────────────────────────────────────────────────

//[C]
function calculateTotalFee(reservations) {
  let total = 0;
  for (let i = 0; i < reservations.length; i++) {
    total += reservations[i].fee;
  }
  return total;
}

//[C]
function getConfirmedReservations(reservations, memberId) {
  let targetMemberRervations = filterByKey(reservations, "memberId", memberId);
  let confirmedReservations = filterByKey(targetMemberRervations, "status", STATUS.CONFIRMED);

  return confirmedReservations;
}

module.exports = {
  calculateFee,
  getPointRate,
  calculateEarnedPoints,
  isOverCapacity,
  createReservation,
  isCancellabe,
  calculatePenaltyPercent,
  calculatePenaltyPoint,
  calculateTotalFee,
  getConfirmedReservations,
};
