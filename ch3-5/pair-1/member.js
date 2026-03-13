const { GRADE } = require("./data");
const { getUpdateValueAtKey } = require("./utils");

//[C]
function createMember(id, name, grade, points, totalUsageHours) {
  return {
    id: id,
    name: name,
    grade: grade,
    points: points,
    totalUsageHours: totalUsageHours,
  };
}

//[C]
function calculateGrade(totalUsageHours, gradeConfig) {
  if (totalUsageHours >= gradeConfig.master.minHours) {
    return GRADE[2];
  }

  if (totalUsageHours >= gradeConfig.honor.minHours) {
    return GRADE[1];
  }

  if (totalUsageHours >= gradeConfig.normal.minHours) {
    return GRADE[0];
  }
}

//[C]
function getUpdatedGradeMemberInfo(memberObject, gradeConfig) {
  const newMemberObject = { ...memberObject };
  const newGrade = calculateGrade(newMemberObject.totalUsageHours, gradeConfig);

  return getUpdateValueAtKey(newMemberObject, "grade", newGrade);
}

module.exports = {
  createMember,
  calculateGrade,
  getUpdatedGradeMemberInfo,
};
