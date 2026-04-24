# 📚 스터디룸 예약 시스템 리팩토링

## 👥 페어 구성

|     팀     |                                                          팀원                                                           |                                                           팀원                                                            |
| :--------: | :---------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------: |
| **Pair 1** |   <a href="https://github.com/JetProc"><img src="https://github.com/JetProc.png" width="80"><br><sub>파라디</sub></a>   |   <a href="https://github.com/lee-eojin"><img src="https://github.com/lee-eojin.png" width="80"><br><sub>레스</sub></a>   |
| **Pair 2** | <a href="https://github.com/bigcloud07"><img src="https://github.com/bigcloud07.png" width="80"><br><sub>루멘</sub></a> | <a href="https://github.com/bel1c10ud"><img src="https://github.com/bel1c10ud.png" width="80"><br><sub>클라우디</sub></a> |
| **Pair 3** |    <a href="https://github.com/vlmbuyd"><img src="https://github.com/vlmbuyd.png" width="80"><br><sub>유월</sub></a>    |   <a href="https://github.com/geongyu09"><img src="https://github.com/geongyu09.png" width="80"><br><sub>도넛</sub></a>   |

## 🚀 설치 및 실행

```bash
npm install
```

| 명령어 | 설명 |
| --- | --- |
| `npm run start-base` | 원본 코드 실행 |
| `npm run start-pair1` | pair-1 결과물 실행 |
| `npm run start-pair2` | pair-2 결과물 실행 |
| `npm run start-pair3` | pair-3 결과물 실행 |

## 🔄 작업 워크플로우 (Fork & PR)

1. **Clone**: 스터디 공통 레포지토리를 로컬 환경으로 가져옵니다.

   ```bash
   git clone https://github.com/[본인아이디]/2026-FP-DEEP-DIVE.git
   ```

2. **Branch 생성 및 이동**: 본인 페어의 작업 브랜치를 생성합니다.

   ```bash
   git checkout -b part1/practice/pair-1
   ```

3. **작업 진행**: `base-code.js`를 본인 페어 디렉토리(e.g. `pair-1/index.js`)로 복사한 뒤 리팩토링합니다.

   (❗️주의: 병합 충돌 방지를 위해 **본인 페어 디렉토리 외부 파일은 절대 수정하지 않습니다**)

4. **Commit & Push**: 코드 및 `pair-N/README.md` 작성 완료 후 Push합니다.

5. **Pull Request**: 본인 브랜치에서 `main` 브랜치로 PR을 생성합니다.

6. **Code Review & Merge**: 함께 코드 리뷰 후 아래 승인 요건 충족 시 merge합니다.

✅ **PR 및 코드 리뷰 규칙**

- PR 제출: 각 페어의 대표가 페어당 1개의 PR을 제출합니다.
- 코드 리뷰: 스터디원 누구나 모든 PR에 자유롭게 의견과 리뷰를 남길 수 있습니다.
- 승인(approve) 권한: 각 페어의 페어장만 approve할 수 있습니다.
- merge 조건: 본인 페어를 제외한 나머지 두 페어장의 approve를 모두 받아야 합니다.

---

## 문제 설명

`base-code.js`는 우테코 크루들이 스터디룸을 예약하고 관리하는 시스템입니다.

기능은 동작하지만, **액션·계산·데이터가 뒤섞여 있고 전역 상태를 함수 안에서 직접 읽고 수정**하는 코드가 곳곳에 숨어 있습니다.
Chapter 3~5에서 학습한 내용을 적용해 이 코드를 리팩토링하는 것이 이번 과제의 목표입니다.

---

## 도메인 및 플로우

```
멤버 등록
 └─ registerMember(id, name, points)
     → 이름과 초기 포인트로 멤버를 등록한다. 초기 등급은 normal.

예약
 └─ makeReservation(roomId, date, startHour, duration, attendees)
     → 룸과 시간을 지정해 예약한다.
     → 이용 요금(pricePerHour × duration)에 비례해 포인트가 적립된다.
     → 예약 후 누적 사용 시간을 기준으로 등급이 자동 갱신된다.

예약 취소
 └─ cancelReservation(reservationId, hoursUntilStart)
     → 예약 시작까지 남은 시간에 따라 패널티가 다르게 부과된다.
     → 적립된 포인트는 회수되고, 조건에 따라 패널티 포인트가 추가 차감된다.
```

---

## 핵심 데이터 구조

```js
// 멤버
{ id, name, grade, points, totalUsageHours }

// 스터디룸 (rooms 배열)
{ id, name, capacity, pricePerHour }

// 예약 (reservations 배열)
{ id, memberId, memberName, roomId, roomName,
  date, startHour, duration, attendees,
  fee, earnedPoints, status }

// 등급 설정 (gradeConfig)
{
  normal: { minHours: 0,  pointRate: 1, penaltyRate: 50 },
  honor:  { minHours: 20, pointRate: 2, penaltyRate: 30 },
  master: { minHours: 50, pointRate: 3, penaltyRate: 10 },
}
```

---

## 기능 명세

### 예약 검증 (`makeReservation`)

| 조건                     | 처리      |
| ------------------------ | --------- |
| 존재하지 않는 룸 ID      | 예약 거부 |
| 참석 인원 > 룸 수용 인원 | 예약 거부 |

### 포인트 적립

```
이용 요금    = pricePerHour × duration
적립 포인트  = floor(이용 요금 × pointRate / 100)
```

pointRate는 예약 시점의 멤버 등급에 따라 결정됩니다.

### 등급 갱신 (`updateMemberGrade`)

누적 사용 시간(`totalUsageHours`)을 기준으로 예약·취소 후 자동 갱신됩니다.

| 누적 사용 시간 | 등급   |
| -------------- | ------ |
| 50시간 이상    | master |
| 20시간 이상    | honor  |
| 20시간 미만    | normal |

### 취소 패널티 (`cancelReservation`)

| 취소 시점 (`hoursUntilStart`) | 패널티                             |
| ----------------------------- | ---------------------------------- |
| 24시간 이상 전                | 없음                               |
| 1시간 이상 ~ 24시간 미만      | 적립 포인트의 20%                  |
| 1시간 미만                    | 적립 포인트 × 등급별 `penaltyRate` |

취소 시 적립 포인트는 전액 회수되고, 패널티가 추가로 차감됩니다.

---

## 체크포인트

### Chapter 3 — 액션·계산·데이터 분류하기

코드에 있는 모든 함수와 코드 조각에 **A(액션) / C(계산) / D(데이터)** 레이블을 붙여보세요.

- `gradeConfig`, `rooms`, 생성된 `reservation` 객체는 세 가지 중 무엇인가요?
- `makeReservation`은 전체가 액션인가요? 그 이유는 무엇인가요?
- 계산처럼 생겼지만 실제로는 액션인 코드 조각이 있나요?

### Chapter 4 — 계산 빼내기

`makeReservation`과 `cancelReservation` 안에서 계산을 추출해보세요.

- **암묵적 입력**을 찾아보세요: 함수 인자가 아닌데 함수 안에서 읽고 있는 값이 있나요?
- **암묵적 출력**을 찾아보세요: `return`이 아닌데 함수 밖으로 영향을 미치는 코드가 있나요?
- 추출한 계산 함수는 인자만으로 동작하나요? 전역 변수를 하나도 참조하지 않나요?

### Chapter 5 — 더 좋은 액션 만들기

- `updateMemberGrade`는 암묵적 입력과 암묵적 출력이 모두 있습니다. 어떻게 개선할 수 있을까요?
- `makeReservation`은 검증 → 계산 → 상태 변경 → 로그를 한 함수에서 처리합니다. 어떻게 나눌 수 있을까요?
- 카피-온-라이트 패턴을 적용할 수 있는 곳은 어디인가요?

---

## 리팩토링 힌트

막혀서 방향을 잡기 어려울 때만 확인해보세요.

<details>
<summary>힌트 1 — 어디서부터 시작할까요?</summary>

가장 작고 독립적인 계산부터 추출하면 실마리가 보입니다.

`makeReservation` 안의 이 코드를 보세요.

```js
var fee = room.pricePerHour * duration;
var pointRate = gradeConfig[currentMember.grade].pointRate;
var earnedPoints = Math.floor((fee * pointRate) / 100);
```

이 로직을 별도 함수로 만들려면 어떤 값을 인자로 받아야 할까요?
`currentMember` 전체가 필요한가요, 아니면 일부만 있으면 되나요?

</details>

<details>
<summary>힌트 2 — updateMemberGrade 를 계산으로 바꾸려면?</summary>

지금 `updateMemberGrade`는 `currentMember`를 직접 읽고 직접 수정합니다.
암묵적 입력과 암묵적 출력이 모두 존재하는 전형적인 액션입니다.

필요한 값을 인자로 받고 새 등급을 반환하는 순수 함수로 바꿔보세요.

```js
// 이런 형태로 만들 수 있을까요?
function calcGrade(totalUsageHours) { ... }
```

</details>

<details>
<summary>힌트 3 — 카피-온-라이트는 어디에 적용하나요?</summary>

아래 코드들은 전역 상태를 직접 변경합니다.

```js
currentMember.points += earnedPoints; // makeReservation
currentMember.totalUsageHours += duration;

target.status = "cancelled"; // cancelReservation
```

원본 객체를 수정하는 대신, 변경된 새 객체를 만들어 반환하고
호출부에서 전역에 반영하는 방식으로 바꿔보세요.

</details>

---

## 리팩토링 전후 결과 비교

리팩토링 완료 후 아래 실행 결과가 원본과 동일한지 확인하세요.

```js
registerMember("M001", "조앤", 100);

var res1 = makeReservation("ROOM-A", "2026-03-15", 10, 2, 3);
var res2 = makeReservation("ROOM-B", "2026-03-16", 14, 2, 6);

printMemberSummary();

cancelReservation(res1.id, 0.5); // 30분 전 취소 → 패널티 발생

printMemberSummary();
```

---

## 페어 README 작성 가이드

`pair-N/README.md`에 아래 내용을 자유롭게 기록해보세요.

- 액션·계산·데이터로 분류한 결과
- 리팩토링하면서 가장 고민했던 지점
- 처음 예상과 달랐던 점
- 페어와 의견이 달랐던 부분과 최종 결론
