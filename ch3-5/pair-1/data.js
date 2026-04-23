//D
const GRADE = ["normal", "honor", "master"];
const STATUS = { CONFIRMED: "confirmed", CANCELLED: "canclled" };
const PENALTY_PERCENT_UNTIL_ONE_DAY = 20;

//D
const rooms = [
  { id: "ROOM-A", name: "루비룸", capacity: 4, pricePerHour: 1000 },
  { id: "ROOM-B", name: "자바룸", capacity: 8, pricePerHour: 2000 },
  { id: "ROOM-C", name: "파이썬룸", capacity: 12, pricePerHour: 3000 },
];

//D
const gradeConfig = {
  normal: { minHours: 0, pointRate: 1, penaltyRate: 50 },
  honor: { minHours: 20, pointRate: 2, penaltyRate: 30 },
  master: { minHours: 50, pointRate: 3, penaltyRate: 10 },
};

module.exports = {
  GRADE,
  STATUS,
  PENALTY_PERCENT_UNTIL_ONE_DAY,
  rooms,
  gradeConfig,
};
