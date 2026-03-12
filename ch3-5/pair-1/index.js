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

/* utils */
function getValueByKey(object, key, objecKey) {
  return object[key][objecKey];
}

function updateAmountAtKey(originalObject, key, amount) {
  const newObject = { ...originalObject };
  newObject[key] += amount;
  return newObject;
}

function updateValueAtKey(originalObject, key, value) {
  const newObject = { ...originalObject };
  newObject[key] = value;
  return newObject;
}

// ────────────────────────────────────────────────────────────
// 전역 상태
// ────────────────────────────────────────────────────────────

let currentMember = null; //D
let reservations = []; //D

//D
let rooms = [
  { id: "ROOM-A", name: "루비룸", capacity: 4, pricePerHour: 1000 },
  { id: "ROOM-B", name: "자바룸", capacity: 8, pricePerHour: 2000 },
  { id: "ROOM-C", name: "파이썬룸", capacity: 12, pricePerHour: 3000 },
];

//D
let gradeConfig = {
  normal: { minHours: 0, pointRate: 1, penaltyRate: 50 },
  honor: { minHours: 20, pointRate: 2, penaltyRate: 30 },
  master: { minHours: 50, pointRate: 3, penaltyRate: 10 },
};

// ────────────────────────────────────────────────────────────
// 멤버 관련 함수
// ────────────────────────────────────────────────────────────

//C
function createMember(id, name, grade, points, totalUsageHours) {
  return {
    id: id,
    name: name,
    grade: grade,
    points: points,
    totalUsageHours: totalUsageHours,
  };
}
//A
function registerMember(id, name, point) {
  currentMember = createMember(id, name, "normal", point, 0);
  reservations = [];
  console.log(name + "님이 등록되었습니다");
}

// 누적 사용 시간에 따라 등급을 갱신한다
//C
function calculateGrade(totalUsageHours, gradeConfig) {
  if (totalUsageHours >= gradeConfig.master.minHours) {
    return "master";
  }

  if (totalUsageHours >= gradeConfig.honor.minHours) {
    return "honor";
  }

  if (totalUsageHours >= gradeConfig.normal.minHours) {
    return "normal";
  }
}
//A
function getUpdatedGradeMemberInfo(memberObject, gradeConfig) {
  const newMemberObject = { ...memberObject };
  const newGrade = calculateGrade(newMemberObject.totalUsageHours, gradeConfig);

  return updateValueAtKey(newMemberObject, "grade", newGrade);
}

// ────────────────────────────────────────────────────────────
// 예약 관련 함수
// ────────────────────────────────────────────────────────────

function isMemberExist(member) {
  return !member;
}

function findById(array, id) {
  for (let i = 0; i < array.length; i++) {
    if (array[i].id === id) {
      return array[i];
    }
  }
  return null;
}

function calculateFee(pricePerHour, duration) {
  return pricePerHour * duration;
}

function getPointRate(gradeConfig, grade) {
  return getValueByKey(gradeConfig, grade, "pointRate");
}

function calculatePercontage(amount, rate) {
  return Math.floor((amount * rate) / 100);
}

function calculateEarnedPoints(fee, gradeConfig, grade) {
  const pointRate = getPointRate(gradeConfig, grade);
  return calculatePercontage(fee, pointRate);
}

// 인원이 수용량을 초과하는지 판단
function isOverCapacity(attendees, capacity) {
  return attendees > capacity;
}

function makeReservation(roomId, date, startHour, duration, attendees) {
  //멤버가 존재하는지 확인
  if (isMemberExist(currentMember)) {
    console.log("로그인이 필요합니다.");
    return null;
  }

  //룸이 존재하는지 확인
  const roomInfo = findById(rooms, roomId);
  if (!roomInfo) {
    console.log("존재하지 않는 룸입니다: " + roomId);
    return null;
  }

  //룸의 수용인원을 넘지 않는지 확인
  if (isOverCapacity(attendees, roomInfo.capacity)) {
    console.log("인원이 초과되었습니다. 최대 수용 인원: " + roomInfo.capacity + "명");
    return null;
  }

  //가곅 계산 및 포인트 계산
  const fee = calculateFee(roomInfo.pricePerHour, duration);
  const earnedPoints = calculateEarnedPoints(fee, gradeConfig, currentMember.grade);

  //실제 데이터에 포인트 적립 및 누적 시간 누계
  currentMember = updateAmountAtKey(currentMember, "points", earnedPoints);
  currentMember = updateAmountAtKey(currentMember, "totalUsageHours", duration);

  //누적된 시간으로 등급 업데이트
  currentMember = getUpdatedGradeMemberInfo(currentMember, gradeConfig);

  let reservation = {
    id: "RES-" + Date.now(),
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
    status: "confirmed",
  };

  reservations.push(reservation);

  console.log("예약 완료! [" + roomInfo.name + "] " + date + " " + startHour + "시 (" + duration + "시간)");
  console.log("적립 포인트: +" + earnedPoints + "P  |  보유 포인트: " + currentMember.points + "P");
  return reservation;
}

// ────────────────────────────────────────────────────────────
// 예약 취소 함수
// ────────────────────────────────────────────────────────────

function cancelReservation(reservationId, hoursUntilStart) {
  if (!currentMember) {
    console.log("로그인이 필요합니다.");
    return;
  }

  // 예약 찾기
  let target = null;
  for (let i = 0; i < reservations.length; i++) {
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
  let penaltyRate = gradeConfig[currentMember.grade].penaltyRate;
  let penalty = 0;
  if (hoursUntilStart < 1) {
    penalty = Math.floor((target.earnedPoints * penaltyRate) / 100);
  } else if (hoursUntilStart < 24) {
    penalty = Math.floor((target.earnedPoints * 20) / 100);
  }

  currentMember.points -= target.earnedPoints;
  currentMember.points -= penalty;
  currentMember.totalUsageHours -= target.duration;
  updateMemberGrade();

  target.status = "cancelled";

  console.log("예약이 취소되었습니다: " + reservationId);
  console.log("포인트 회수: -" + target.earnedPoints + "P  |  패널티: -" + penalty + "P");
  console.log("현재 포인트: " + currentMember.points + "P");
}

// ────────────────────────────────────────────────────────────
// 조회 및 요약 함수
// ────────────────────────────────────────────────────────────

function printMemberSummary() {
  if (!currentMember) {
    console.log("등록된 멤버가 없습니다.");
    return;
  }

  let confirmed = [];
  let totalFee = 0;
  for (let i = 0; i < reservations.length; i++) {
    if (reservations[i].memberId === currentMember.id && reservations[i].status === "confirmed") {
      confirmed.push(reservations[i]);
      totalFee += reservations[i].fee;
    }
  }

  console.log("========== 멤버 요약 ==========");
  console.log("이름     : " + currentMember.name);
  console.log("등급     : " + currentMember.grade);
  console.log("포인트   : " + currentMember.points + "P");
  console.log("누적사용 : " + currentMember.totalUsageHours + "시간  /  " + totalFee.toLocaleString() + "원");
  console.log("확정예약 : " + confirmed.length + "건");
  for (let j = 0; j < confirmed.length; j++) {
    let r = confirmed[j];
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

registerMember("M001", "조앤", 100);

let res1 = makeReservation("ROOM-A", "2026-03-15", 10, 2, 3);
let res2 = makeReservation("ROOM-B", "2026-03-16", 14, 2, 6);
// let res2 = makeReservation("ROOM-A", "2026-03-16", 14, 2, 6);

printMemberSummary();

cancelReservation(res1.id, 0.5); // 30분 전 취소 → 패널티 발생

printMemberSummary();
