export function printRegisterResult(name) {
  console.log(name + "님이 등록되었습니다.");
}

export function printLoginRequiredMessage() {
  console.log("로그인이 필요합니다.");
}

export function printInvalidRoom(roomId) {
  console.log("존재하지 않는 룸입니다: " + roomId);
}

export function printCapacityExcess(capacity) {
  console.log("인원이 초과되었습니다. 최대 수용 인원: " + capacity + "명");
}

export function printInvalidReservationCancel() {
  console.log("취소할 수 없는 예약입니다.");
}

export function printReservationCancelResult(reservationId, earnedPoints, penalty, points) {
  console.log("예약이 취소되었습니다: " + reservationId);
  console.log("포인트 회수: -" + earnedPoints + "P  |  패널티: -" + penalty + "P");
  console.log("현재 포인트: " + points + "P");
}

export function printReservationResult(reservation) {
  console.log(
    "예약 완료! [" +
      reservation.roomName +
      "] " +
      reservation.date +
      " " +
      reservation.startHour +
      "시 (" +
      reservation.duration +
      "시간)",
  );
}

export function printPointResult(earnedPoints, points) {
  console.log("적립 포인트: +" + earnedPoints + "P  |  보유 포인트: " + points + "P");
}

export function printMemberSummary(member, confirmed, totalFee) {
  console.log("========== 멤버 요약 ==========");
  console.log("이름     : " + member.name);
  console.log("등급     : " + member.grade);
  console.log("포인트   : " + member.points + "P");
  console.log("누적사용 : " + member.totalUsageHours + "시간  /  " + totalFee.toLocaleString() + "원");
  console.log("확정예약 : " + confirmed.length + "건");
}

export function printConfirmedReservation(confirmed) {
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
        "원",
    );
  }
  console.log("===============================");
}

export function printTotalResult({ member, confirmed, totalFee }) {
  printMemberSummary(member, confirmed, totalFee);
  printConfirmedReservation(confirmed);
}
