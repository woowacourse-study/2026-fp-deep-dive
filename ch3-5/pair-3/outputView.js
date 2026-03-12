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
