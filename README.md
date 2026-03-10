# 2026-FP-DEEP-DIVE

## 🎯 스터디 목적

'쏙쏙 들어오는 함수형 코딩' 도서를 기반으로 함수형 프로그래밍의 핵심을 학습합니다.
페어 프로그래밍으로 '냄새나는' 코드를 리팩토링하며 액션·계산·데이터의 분리, 불변성 유지,
부수 효과 통제 및 선언적 프로그래밍 기법을 실제 코드에 적용하는 감각을 기르는 것을 목적으로 합니다.

## 👥 스터디 구성원

|     팀     |                                                          팀원                                                           |                                                           팀원                                                            |
| :--------: | :---------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------: |
| **Pair 1** |   <a href="https://github.com/JetProc"><img src="https://github.com/JetProc.png" width="80"><br><sub>파라디</sub></a>   |   <a href="https://github.com/lee-eojin"><img src="https://github.com/lee-eojin.png" width="80"><br><sub>레스</sub></a>   |
| **Pair 2** | <a href="https://github.com/bigcloud07"><img src="https://github.com/bigcloud07.png" width="80"><br><sub>루멘</sub></a> | <a href="https://github.com/bel1c10ud"><img src="https://github.com/bel1c10ud.png" width="80"><br><sub>클라우디</sub></a> |
| **Pair 3** |    <a href="https://github.com/vlmbuyd"><img src="https://github.com/vlmbuyd.png" width="80"><br><sub>유월</sub></a>    |   <a href="https://github.com/geongyu09"><img src="https://github.com/geongyu09.png" width="80"><br><sub>도넛</sub></a>   |

## 📁 폴더 구조

```text
2026-FP-DEEP-DIVE/
├── .github/
├── action-calc-data/     # 과제 디렉토리
│   ├── base-code.js      # 리팩토링 대상이 되는 원본 코드 (수정 금지)
│   ├── pair-1/           # 각 페어별 작업 디렉토리
│   │   ├── index.js        # 작업을 진행한 최종 코드
│   │   └── README.md       # 고민한 점 등을 기록
│   ├── pair-2/
│   └── pair-3/
├── .gitignore
└── README.md
```

## 🔄 작업 워크플로우 (Fork & PR)

1. **Fork**: 본 스터디 원본 레포지토리를 각자의 GitHub 계정으로 Fork 합니다.

2. **Clone**: fork 한 레포지토리를 로컬 환경으로 가져옵니다.

   ```bash
   git clone https://github.com/[본인아이디]/2026-FP-DEEP-DIVE.git
   ```

3. **작업 진행**: 해당 과제 디렉토리(e.g. `action-calc-data/`) 내의 `base-code.js` 코드를 본인 페어의 디렉토리(e.g. `pair-1/index.js`)로 복사한 뒤 리팩토링을 진행합니다.

   (❗️주의: 병합 충돌을 방지하기 위해 **본인 페어의 디렉토리 외부 파일은 절대 수정하지 않습니다**)

4. **Commit & Push**: 코드 작성 및 해당 폴더의 `README.md` 작성이 완료되면 본인의 fork 레포지토리에 Push 합니다.

5. **Pull Request**: 본인의 fork 레포지토리에서 원본 레포지토리의 `main` 브랜치로 PR을 생성합니다.

6. **Code Review & Merge**: 각 조의 PR이 등록되면 다 함께 코드 리뷰를 진행하고, 아래의 승인 요건이 충족되면 `main`에 merge 합니다.

✅ **PR 및 코드 리뷰 규칙**

- PR 제출: 각 페어의 대표가 페어당 1개의 PR을 제출합니다.
- 코드 리뷰: 스터디원 누구나 모든 PR에 자유롭게 의견과 리뷰를 남길 수 있습니다.
- 승인(approve) 권한: PR에 대한 approve는 각 페어의 페어장만 가능합니다.
- merge 조건: 본인 페어를 제외한 나머지 두 페어장의 approve를 모두 받은 PR에 한해서만 merge가 가능합니다.
