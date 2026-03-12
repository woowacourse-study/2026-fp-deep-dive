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

// 누적 사용 시간에 따라 등급을 갱신한다 [Calc]
export function getUpdatedMemberGrade(member) {
  const hours = member.totalUsageHours; // Action 암묵적 입력
  const grade = getGradeFromHours(hours);
  member.grade = grade;
  return member;
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

// 멤버 등록 [Action]
export function registerMember(id, name, points) {
  currentMember = createNewMember(id, name, points);
  printRegisterResult(currentMember.name);
}

// 멤버 등급 업데이트 [Action]
export function updateMemberGrade() {
  currentMember = getUpdatedMemberGrade(currentMember);
}
