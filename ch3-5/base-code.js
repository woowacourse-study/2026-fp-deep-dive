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

// ────────────────────────────────────────────────────────────
// 전역 상태
// ────────────────────────────────────────────────────────────

var currentMember = null;
var reservations = [];

var rooms = [
  { id: "ROOM-A", name: "루비룸", capacity: 4, pricePerHour: 1000 },
  { id: "ROOM-B", name: "자바룸", capacity: 8, pricePerHour: 2000 },
  { id: "ROOM-C", name: "파이썬룸", capacity: 12, pricePerHour: 3000 },
];

var gradeConfig = {
  normal: { minHours: 0, pointRate: 1, penaltyRate: 50 },
  honor: { minHours: 20, pointRate: 2, penaltyRate: 30 },
  master: { minHours: 50, pointRate: 3, penaltyRate: 10 },
};

// ────────────────────────────────────────────────────────────
// 멤버 관련 함수
// ────────────────────────────────────────────────────────────

function registerMember(id, name, points) {
  currentMember = {
    id: id,
    name: name,
    grade: "normal",
    points: points,
    totalUsageHours: 0,
  };
  reservations = [];
  console.log(name + "님이 등록되었습니다.");
}

// 누적 사용 시간에 따라 등급을 갱신한다
function updateMemberGrade() {
  var hours = currentMember.totalUsageHours;
  if (hours >= gradeConfig.master.minHours) {
    currentMember.grade = "master";
  } else if (hours >= gradeConfig.honor.minHours) {
    currentMember.grade = "honor";
  } else {
    currentMember.grade = "normal";
  }
}

// ────────────────────────────────────────────────────────────
// 예약 관련 함수
// ────────────────────────────────────────────────────────────

function makeReservation(roomId, date, startHour, duration, attendees) {
  if (!currentMember) {
    console.log("로그인이 필요합니다.");
    return null;
  }

  // 룸 존재 여부 확인
  var room = null;
  for (var i = 0; i < rooms.length; i++) {
    if (rooms[i].id === roomId) {
      room = rooms[i];
      break;
    }
  }
  if (!room) {
    console.log("존재하지 않는 룸입니다: " + roomId);
    return null;
  }

  // 인원 초과 확인
  if (attendees > room.capacity) {
    console.log("인원이 초과되었습니다. 최대 수용 인원: " + room.capacity + "명");
    return null;
  }

  var fee = room.pricePerHour * duration;
  var pointRate = gradeConfig[currentMember.grade].pointRate;
  var earnedPoints = Math.floor((fee * pointRate) / 100);

  currentMember.points += earnedPoints;
  currentMember.totalUsageHours += duration;
  updateMemberGrade();

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

  reservations.push(reservation);

  console.log("예약 완료! [" + room.name + "] " + date + " " + startHour + "시 (" + duration + "시간)");
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
  var target = null;
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
  var penaltyRate = gradeConfig[currentMember.grade].penaltyRate;
  var penalty = 0;
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

  var confirmed = [];
  var totalFee = 0;
  for (var i = 0; i < reservations.length; i++) {
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
  for (var j = 0; j < confirmed.length; j++) {
    var r = confirmed[j];
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
        "원"
    );
  }
  console.log("===============================");
}

// ────────────────────────────────────────────────────────────
// 실행 예시
// ────────────────────────────────────────────────────────────

registerMember("M001", "조앤", 100);

var res1 = makeReservation("ROOM-A", "2026-03-15", 10, 2, 3);
var res2 = makeReservation("ROOM-B", "2026-03-16", 14, 2, 6);

printMemberSummary();

cancelReservation(res1.id, 0.5); // 30분 전 취소 → 패널티 발생

printMemberSummary();