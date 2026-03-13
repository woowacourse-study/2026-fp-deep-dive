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
