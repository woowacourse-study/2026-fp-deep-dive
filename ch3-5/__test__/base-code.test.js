/**
 * 스터디룸 예약 시스템 동작 검증 테스트
 *
 * [사용법]
 * 1. 프로젝트 루트에서 의존성 설치
 *    npm install
 *
 * 2. 테스트 실행
 *    npm test              ← 원본(base-code.js) 테스트
 *    npm run test:pair1    ← pair-1/index.js 테스트
 *    npm run test:pair2    ← pair-2/index.js 테스트
 *    npm run test:pair3    ← pair-3/index.js 테스트
 */

const vm = require("vm");
const fs = require("fs");
const path = require("path");

// TARGET_FILE 환경변수로 테스트 대상을 바꿀 수 있다
// 기본값: base-code.js
const targetFile = process.env.TARGET_FILE || path.join(__dirname, "..", "base-code.js");

function loadFreshContext() {
  const filePath = path.resolve(targetFile);
  const source = fs.readFileSync(filePath, "utf-8");

  const codeWithoutExecution = source.replace(
    /\/\/ ─+\n\/\/ 실행 예시\n\/\/ ─+[\s\S]*$/,
    ""
  );

  const ctx = {
    console: { log: jest.fn() },
    Date: { now: jest.fn(() => 1000000) },
    Math: Math,
  };

  vm.createContext(ctx);
  vm.runInContext(codeWithoutExecution, ctx);

  return ctx;
}

describe("registerMember", () => {
  test("멤버를 등록하면 올바른 초기 상태가 설정된다", () => {
    const ctx = loadFreshContext();
    ctx.registerMember("M001", "레스", 100);

    expect(ctx.currentMember).toEqual({
      id: "M001",
      name: "레스",
      grade: "normal",
      points: 100,
      totalUsageHours: 0,
    });
    expect(ctx.reservations).toEqual([]);
  });
});

describe("updateMemberGrade", () => {
  test("누적 시간에 따라 normal → honor → master로 등급이 바뀐다", () => {
    const ctx = loadFreshContext();
    ctx.registerMember("M001", "레스", 100);

    ctx.currentMember.totalUsageHours = 19;
    ctx.updateMemberGrade();
    expect(ctx.currentMember.grade).toBe("normal");

    ctx.currentMember.totalUsageHours = 20;
    ctx.updateMemberGrade();
    expect(ctx.currentMember.grade).toBe("honor");

    ctx.currentMember.totalUsageHours = 50;
    ctx.updateMemberGrade();
    expect(ctx.currentMember.grade).toBe("master");
  });
});

describe("makeReservation", () => {
  test("유효한 예약 시 요금, 포인트, 상태가 올바르다", () => {
    const ctx = loadFreshContext();
    ctx.registerMember("M001", "레스", 100);

    const res = ctx.makeReservation("ROOM-A", "2026-03-15", 10, 2, 3);

    expect(res.fee).toBe(2000);
    expect(res.earnedPoints).toBe(20);
    expect(res.status).toBe("confirmed");
    expect(ctx.currentMember.points).toBe(120);
    expect(ctx.currentMember.totalUsageHours).toBe(2);
  });

  test("잘못된 룸이나 인원 초과 시 null을 반환한다", () => {
    const ctx = loadFreshContext();
    ctx.registerMember("M001", "레스", 100);

    expect(ctx.makeReservation("ROOM-Z", "2026-03-15", 10, 2, 3)).toBeNull();
    expect(ctx.makeReservation("ROOM-A", "2026-03-15", 10, 2, 5)).toBeNull();
  });
});

describe("cancelReservation", () => {
  test("1시간 미만 취소 시 패널티가 부과되고 상태가 cancelled로 바뀐다", () => {
    const ctx = loadFreshContext();
    ctx.registerMember("M001", "레스", 100);
    const res = ctx.makeReservation("ROOM-A", "2026-03-15", 10, 2, 3);

    // 120 - 회수 20 - 패널티 floor(20*50/100)=10 = 90
    ctx.cancelReservation(res.id, 0.5);

    expect(ctx.currentMember.points).toBe(90);
    expect(res.status).toBe("cancelled");
    expect(ctx.currentMember.totalUsageHours).toBe(0);
  });

  test("24시간 이상 전 취소 시 패널티가 없다", () => {
    const ctx = loadFreshContext();
    ctx.registerMember("M001", "레스", 100);
    const res = ctx.makeReservation("ROOM-A", "2026-03-15", 10, 2, 3);

    ctx.cancelReservation(res.id, 24);

    expect(ctx.currentMember.points).toBe(100);
  });
});

describe("전체 플로우", () => {
  test("등록 → 예약 2건 → 취소 1건 후 최종 상태가 올바르다", () => {
    const ctx = loadFreshContext();
    ctx.registerMember("M001", "레스", 100);

    const res1 = ctx.makeReservation("ROOM-A", "2026-03-15", 10, 2, 3);
    const res2 = ctx.makeReservation("ROOM-B", "2026-03-16", 14, 2, 6);
    expect(ctx.currentMember.points).toBe(160);

    ctx.cancelReservation(res1.id, 0.5);

    expect(ctx.currentMember.points).toBe(130);
    expect(ctx.currentMember.totalUsageHours).toBe(2);
    expect(res1.status).toBe("cancelled");
    expect(res2.status).toBe("confirmed");
  });
});
