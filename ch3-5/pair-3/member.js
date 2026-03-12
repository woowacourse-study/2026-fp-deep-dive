import { gradeConfig } from "./constants.js";
import { printRegisterResult } from "./outputView.js";

// 등록할 멤버 생성 [Calc]
export function createNewMember(id, name, points) {
  return {
    id: id,
    name: name,
    points: points,
    grade: "normal",
    totalUsageHours: 0,
  };
}

// hours로부터 grade 반환 [Calc]
export function getGradeFromHours(hours) {
  if (hours >= gradeConfig.master.minHours) {
    return "master";
  }
  if (hours >= gradeConfig.honor.minHours) {
    return "honor";
  }

  return "normal";
}
