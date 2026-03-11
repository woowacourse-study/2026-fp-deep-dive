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
  currentMember = { // 데이터 or 계산(객체를 생성하는 거니까 계산인거 같다.)
    id: id,
    name: name,
    grade: "normal",
    points: points,
    totalUsageHours: 0,
  };
  reservations = []; // 데이터 or 전역 변수니까 액션인거 같기도 하다
  console.log(name + "님이 등록되었습니다."); // 액션
}

// 누적 사용 시간에 따라 등급을 갱신한다
function updateMemberGrade() { // 계산으로 빼낼 수 있을 거 같다. hours 매개변수로 받고 grade를 반환하는 순수함수로 만들 수 있을거 같다.
  // 객체의 프로퍼티를 전달하는 대신 currentMember 객체를 전달하는것도 괜찮은거 같다, 하지만 이유는 확실하지 않다.
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
    console.log("로그인이 필요합니다."); // 액션
    return null;
  }

  // 룸 존재 여부 확인
  var room = null; // 메서드로 대체 가능 rooms.find()
  for (var i = 0; i < rooms.length; i++) { // 계산으로 뺄 수 있을 것 같음
    if (rooms[i].id === roomId) {
      room = rooms[i];
      break;
    }
  }
  if (!room) {
    console.log("존재하지 않는 룸입니다: " + roomId); // 액션 // 계산을 뺄 수 있음
    return null;
  }

  // 인원 초과 확인
  if (attendees > room.capacity) { // 액션, 계산으로 뺼 수 있을 것 같음
    console.log("인원이 초과되었습니다. 최대 수용 인원: " + room.capacity + "명");
    return null;
  }

  var fee = room.pricePerHour * duration; // 계산으로
  var pointRate = gradeConfig[currentMember.grade].pointRate; // 계산으로
  var earnedPoints = Math.floor((fee * pointRate) / 100); // 계산으로

  currentMember.points += earnedPoints; // 액션
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

  reservations.push(reservation); // 액션

  console.log("예약 완료! [" + room.name + "] " + date + " " + startHour + "시 (" + duration + "시간)"); // 액션
  console.log("적립 포인트: +" + earnedPoints + "P  |  보유 포인트: " + currentMember.points + "P");   // 액션
  return reservation;
}

// ────────────────────────────────────────────────────────────
// 예약 취소 함수
// ────────────────────────────────────────────────────────────

function cancelReservation(reservationId, hoursUntilStart) { // 큰 액션
  if (!currentMember) {
    console.log("로그인이 필요합니다."); // 출력때문에 액션이지만 계산으로 빼낼 수 있는 부분이 있다
    return;
  }

  // 예약 찾기, 계산으로 뺄 수 있을 것 같음, 직접 꺼내오지 않고 매개변수를 받아 계산으로 뺄 여지가 있다
  var target = null;
  for (var i = 0; i < reservations.length; i++) {
    if (reservations[i].id === reservationId) {
      target = reservations[i];
      break;
    }
  }

  if (!target || target.status === "cancelled") { // 계산으로 빼고 출력만 담당하는 함수를 만들어 처리 가능
    console.log("취소할 수 없는 예약입니다.");
    return;
  }

  // 취소 시점에 따른 패널티 계산
  // 24시간 이상 전: 패널티 없음
  // 24시간 미만:    적립 포인트의 20%
  // 1시간 미만:     적립 포인트 × 등급별 penaltyRate
  var penaltyRate = gradeConfig[currentMember.grade].penaltyRate; // 밑으로 계산으로 뺄 수 있을 것 같음
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

  console.log("예약이 취소되었습니다: " + reservationId); // 액션
  console.log("포인트 회수: -" + target.earnedPoints + "P  |  패널티: -" + penalty + "P"); 
  console.log("현재 포인트: " + currentMember.points + "P");
}

// ────────────────────────────────────────────────────────────
// 조회 및 요약 함수
// ────────────────────────────────────────────────────────────

function printMemberSummary() {
  if (!currentMember) { // 액션인데 계산으로
    console.log("등록된 멤버가 없습니다.");
    return;
  }

  var confirmed = [];  // 액션
  var totalFee = 0;
  for (var i = 0; i < reservations.length; i++) { // 계산으로 분리 가능
    if (reservations[i].memberId === currentMember.id && reservations[i].status === "confirmed") {
      confirmed.push(reservations[i]);
      totalFee += reservations[i].fee;
    }
  }

  console.log("========== 멤버 요약 =========="); // 액션
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
