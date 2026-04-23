const { GRADE, STATUS, rooms, gradeConfig } = require("./data");
const {
  getValueByKeys,
  getUpdateAmountAtKey,
  getUpdateValueAtKey,
  addElemToArray,
  findById,
  replaceById,
  checkValueExist,
} = require("./utils");
const { createMember, getUpdatedGradeMemberInfo } = require("./member");
const {
  calculateFee,
  calculateEarnedPoints,
  isOverCapacity,
  createReservation,
  isCancellabe,
  calculatePenaltyPoint,
  calculateTotalFee,
  getConfirmedReservations,
} = require("./reservation");

// ────────────────────────────────────────────────────────────
// 전역 상태
// ────────────────────────────────────────────────────────────

let currentMember = null; //D
let reservations = []; //D

//[A] - 전역 변수 currentMember, reservations의 값을 변경하기 때문
function registerMember(id, name, point) {
  currentMember = createMember(id, name, GRADE[0], point, 0);
  reservations = [];
  console.log(`${name}님이 등록되었습니다`);
}

//[A]
function makeReservation(roomId, date, startHour, duration, attendees) {
  //멤버가 존재하는지 확인
  checkValueExist(currentMember, "로그인이 필요합니다.");

  //룸이 존재하는지 확인
  const roomInfo = findById(rooms, roomId);
  checkValueExist(roomInfo, `존재하지 않는 룸입니다: ${roomId}`);

  //룸의 수용 인원을 넘지 않는지 확인
  if (isOverCapacity(attendees, roomInfo.capacity)) {
    console.log(`인원이 초과되었습니다. 최대 수용 인원: ${roomInfo.capacity} 명`);
    return null;
  }

  //가격 계산 및 포인트 계산
  const fee = calculateFee(roomInfo.pricePerHour, duration);
  const earnedPoints = calculateEarnedPoints(fee, gradeConfig, currentMember.grade);

  //실제 데이터에 포인트 적립 및 누적 시간 누계
  currentMember = getUpdateAmountAtKey(currentMember, "points", earnedPoints);
  currentMember = getUpdateAmountAtKey(currentMember, "totalUsageHours", duration);

  //누적된 시간으로 등급 업데이트
  currentMember = getUpdatedGradeMemberInfo(currentMember, gradeConfig);

  //새로운 예약 객체 생성
  const newReservation = createReservation({
    memberId: currentMember.id,
    memberName: currentMember.name,
    roomId: roomId,
    roomName: roomInfo.name,
    date: date,
    startHour: startHour,
    duration: duration,
    attendees: attendees,
    fee: fee,
    earnedPoints: earnedPoints,
    status: STATUS.CONFIRMED,
  });

  //기존 예약 리스트에 새로운 예약 추가
  reservations = addElemToArray(reservations, newReservation);

  //출력
  console.log(`예약 완료! [${roomInfo.name}] ${date} ${startHour}시 (${duration}시간)`);
  console.log(`적립 포인트: +${earnedPoints}P  |  보유 포인트: ${currentMember.points}P`);

  return newReservation;
}

//[A]
function cancelReservation(reservationId, hoursUntilStart) {
  //멤버가 존재하는지 확인
  checkValueExist(currentMember, "로그인이 필요합니다.");

  // 예약 찾기
  let targetReservation = findById(reservations, reservationId);

  checkValueExist(isCancellabe(targetReservation), "취소할 수 없는 예약입니다.");

  // 취소 시점에 따른 패널티 계산
  const penaltyRate = getValueByKeys(gradeConfig, [currentMember.grade, "penaltyRate"]);

  const penaltyPoint = calculatePenaltyPoint(targetReservation.earnedPoints, penaltyRate, hoursUntilStart);

  // 패널티 포인트 차감 및 누적 시간 차감
  currentMember = getUpdateAmountAtKey(currentMember, "points", -1 * targetReservation.earnedPoints);
  currentMember = getUpdateAmountAtKey(currentMember, "points", -1 * penaltyPoint);
  currentMember = getUpdateAmountAtKey(currentMember, "totalUsageHours", -1 * targetReservation.duration);

  // 차감된 누적 시간이 반영된 등급 업데이트
  currentMember = getUpdatedGradeMemberInfo(currentMember, gradeConfig);

  //취소된 예약 객체 생성 및 실제로 취소 상태 반영
  const cancelledReservation = getUpdateValueAtKey(targetReservation, "status", STATUS.CANCELLED);
  reservations = replaceById(reservations, reservationId, cancelledReservation);

  //출력
  console.log(`예약이 취소되었습니다: ${reservationId}`);
  console.log(`포인트 회수: -${targetReservation.earnedPoints}P  |  패널티: -${penaltyPoint}P`);
  console.log(`현재 포인트: ${currentMember.points}P`);
}

//[A]
function printMemberSummary() {
  //멤버가 존재하는지 확인
  checkValueExist(currentMember, "등록된 멤버가 없습니다.");

  const confirmedReservations = getConfirmedReservations(reservations, currentMember.id);
  const totalFee = calculateTotalFee(confirmedReservations);

  console.log(`========== 멤버 요약 ==========`);
  console.log(`이름     : ${currentMember.name}`);
  console.log(`등급     : ${currentMember.grade}`);
  console.log(`포인트   : ${currentMember.points}P`);
  console.log(`누적사용 : ${currentMember.totalUsageHours}시간  /  ${totalFee.toLocaleString()}원`);
  console.log(`확정예약 : ${confirmedReservations.length}건`);

  for (let i = 0; i < confirmedReservations.length; i++) {
    const reservation = confirmedReservations[i];
    console.log(
      `  [${reservation.roomName}] ${reservation.date}  ${reservation.startHour}시 (${reservation.duration}시간)  ${reservation.fee.toLocaleString()}원`,
    );
  }
  console.log("===============================");
}

module.exports = {
  registerMember,
  makeReservation,
  cancelReservation,
  printMemberSummary,
};
