/**
 * 📚 우테코 스터디룸 예약 시스템
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

function createMember(id, name, points) {
    return {
        id: id,
        name: name,
        grade: "normal",
        points: points,
        totalUsageHours: 0,
    }
}

function updateCurrentMember(point, totalUsageHours, grade) {
    currentMember.points += point;
    currentMember.totalUsageHours += totalUsageHours;
    currentMember.grade = grade;
}

function registerMember(id, name, points) {
    currentMember = createMember(id, name, points);
    reservations = []; // 데이터 or 전역 변수니까 액션인거 같기도 하다, 위에 전역 변수 reservations 있는데 필요없는 부분 아닌가?
    console.log(name + "님이 등록되었습니다."); // 액션
}


// 누적 사용 시간에 따라 등급을 계산한다.
function getMemberGrade(hours) {
    if (hours >= gradeConfig.master.minHours) {
        return "master";
    }
    else if (hours >= gradeConfig.honor.minHours) {
        return "honor";
    }
    else {
        return "normal";
    }
}

// ────────────────────────────────────────────────────────────
// 예약 관련 함수
// ────────────────────────────────────────────────────────────

function calculateFee(pricePerHour, duration) {
    return pricePerHour * duration;
}

function calculatePointRate(grade) {
    return gradeConfig[grade].pointRate;
}

function calculateEarnedPoints(fee, pointRate) {
    return Math.floor(fee * (pointRate / 100));
}

function validateNotEmptyObject(object, message) {
    if (!object || Object.keys(object).length === 0) {
        throw new Error(message ?? "객체가 비어있습니다.");
    }
}

function makeReservation(roomId, date, startHour, duration, attendees) {
    
    validateNotEmptyObject(currentMember, "등록된 멤버가 없습니다.");

    const room = rooms.find(room => room.id === roomId);

    validateNotEmptyObject(room, "존재하지 않는 룸입니다: " + roomId);

    // 인원 초과 확인
    if (attendees > room.capacity) { // 액션, 계산으로 뺼 수 있을 것 같음
        console.log("인원이 초과되었습니다. 최대 수용 인원: " + room.capacity + "명");
        return null;
    }

    var fee = calculateFee(room.pricePerHour, duration);
    var pointRate = calculatePointRate(currentMember.grade) // 계산으로
    var earnedPoints = calculateEarnedPoints(fee, pointRate); // 계산으로

    updateCurrentMember(earnedPoints, duration, getMemberGrade(currentMember.totalUsageHours));

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

// 취소 시점에 따른 패널티 계산
// 24시간 이상 전: 패널티 없음
// 24시간 미만:    적립 포인트의 20%
// 1시간 미만:     적립 포인트 × 등급별 penaltyRate

function getPenaltyRate(grade) {
    return gradeConfig[grade].penaltyRate;
}

function calculatePenalty(penaltyRate, reservation, hoursUntilStart) {
    if (hoursUntilStart < 1) {
        return Math.floor((reservation.earnedPoints * penaltyRate) / 100);
    }
    if (hoursUntilStart < 24) {
        return Math.floor((reservation.earnedPoints * 20) / 100);
    }
    return 0;
}

// 예약 찾기, 계산으로 뺄 수 있을 것 같음, 직접 꺼내오지 않고 매개변수를 받아 계산으로 뺄 여지가 있다
function findReservationById(reservations, reservationId) {
    return reservations.find(reservation => reservation.id === reservationId);
}


function cancelReservation(reservationId, hoursUntilStart) { // 큰 액션
    validateNotEmptyObject(currentMember, "로그인이 필요합니다.");

    let reservation = findReservationById(reservations, reservationId);

    if (!reservation || reservation.status === "cancelled") { // 계산으로 빼고 출력만 담당하는 함수를 만들어 처리 가능
        console.log("취소할 수 없는 예약입니다.");
        return;
    }

    var penaltyRate = getPenaltyRate(currentMember.grade);
    var penalty = calculatePenalty(penaltyRate, reservation, hoursUntilStart);

    updateCurrentMember(-(reservation.earnedPoints + penalty), -reservation.duration, getMemberGrade(currentMember.totalUsageHours - reservation.duration));

    reservation.status = "cancelled";

    console.log("예약이 취소되었습니다: " + reservationId); // 액션
    console.log("포인트 회수: -" + reservation.earnedPoints + "P  |  패널티: -" + penalty + "P");
    console.log("현재 포인트: " + currentMember.points + "P");
}

// ────────────────────────────────────────────────────────────
// 조회 및 요약 함수
// ────────────────────────────────────────────────────────────

function getConfirmedReservation(currentMember, reservations) {
    return reservations.filter(reservation => reservation.memberId === currentMember.id && reservation.status === "confirmed");
}

function getTotalFee(confirmedReservations) {
    return confirmedReservations.reduce((sum, reservation) => sum = sum + reservation.fee, 0);
}

function printMemberSummary() {
    if (!currentMember) { // 액션인데 계산으로
        console.log("등록된 멤버가 없습니다.");
        return;
    }

    var confirmed = getConfirmedReservation(currentMember, reservations);
    var totalFee = getTotalFee(confirmed);

    console.log("========== 멤버 요약 =========="); // 액션
    console.log("이름     : " + currentMember.name);
    console.log("등급     : " + currentMember.grade);
    console.log("포인트   : " + currentMember.points + "P");
    console.log("누적사용 : " + currentMember.totalUsageHours + "시간  /  " + totalFee.toLocaleString() + "원");
    console.log("확정예약 : " + confirmed.length + "건");

    confirmed.forEach(reservation => {
        console.log(
            "  [" +
            reservation.roomName +
            "] " +
            reservation.date +
            "  " + reservation.startHour +
            "시 (" +
            reservation.duration +
            "시간)  " +
            reservation.fee.toLocaleString() +
            "원"
        );
    })

    console.log("===============================");
}

// ────────────────────────────────────────────────────────────
// 실행 예시
// ────────────────────────────────────────────────────────────

try {
    // registerMember("M001", "조앤", 100);

    var res1 = makeReservation("ROOM-A", "2026-03-15", 10, 2, 3);
    var res2 = makeReservation("ROOM-B", "2026-03-16", 14, 2, 6);

    cancelReservation("RES-1234567890", 0.5);

    printMemberSummary();

    cancelReservation(res1.id, 0.5); // 30분 전 취소 → 패널티 발생

    printMemberSummary();

} catch (error) {
    console.log(error.message);
}

