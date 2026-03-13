const { registerMember, makeReservation, cancelReservation, printMemberSummary } = require("./service");

registerMember("M001", "조앤", 100);

let res1 = makeReservation("ROOM-A", "2026-03-15", 10, 2, 3);
let res2 = makeReservation("ROOM-B", "2026-03-16", 14, 2, 6);

printMemberSummary();

cancelReservation(res1.id, 0.5); // 30분 전 취소 → 패널티 발생

printMemberSummary();
