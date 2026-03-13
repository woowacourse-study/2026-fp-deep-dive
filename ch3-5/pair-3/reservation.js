import { gradeConfig, rooms } from "./constants.js";
import { getGradeFromHours } from "./member.js";
import { printInvalidRoom } from "./outputView.js";

export function makeReservation(roomId, date, startHour, duration, attendees, member) {
  let currentMember = { ...member };

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

  const reservation = {
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

  return reservation;
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

export function updateMembershipStatus(member, earnedPoints, duration) {
  const result = { ...member };

  result.points += earnedPoints;
  result.totalUsageHours += duration;
  result.grade = getGradeFromHours(result.totalUsageHours);

  return result;
}
