# Laika CYOA

Laika 세계관의 캐릭터 생성 전용 공개 사이트입니다.

- 사이트: https://castorice-sa.github.io/CYOA/
- 저장소: https://github.com/castorice-SA/CYOA
- 기존 라이카 프로필: https://castorice-sa.github.io/Laika/

## 구성

직업 → 힘의 기원 → 개인 특성 → 신비 능력 → 장비 → 동료 → 과거 사건 → ERAC와의 관계 → 대가.

기본 구성점 8점으로 캐릭터를 만들고, 대가에 따라 1~2점을 돌려받습니다. 선택 결과는 개인 기록 카드로 정리되며 캐릭터 시트를 복사할 수 있습니다. 엔딩은 결정하지 않습니다.

입력한 이름과 선택은 해당 브라우저의 localStorage에 저장됩니다. 서버로 전송하지 않으며 기존 Laika 사이트의 저장 기록과 분리됩니다.

## 개발과 배포

HTML, CSS, JavaScript로 구성된 정적 사이트로 별도 설치나 빌드가 필요하지 않습니다. `index.html`을 열거나 정적 웹 서버로 실행할 수 있습니다. GitHub Pages는 `main` 브랜치의 루트를 배포합니다.

- `index.html`: CYOA 첫 화면
- `cyoa.js`: 선택 규칙, 구성점, 개인 기록, 저장과 복사
- `cyoa.css`: 반응형 스타일
- `assets/`: 기존 프로젝트의 ERAC 문장과 배경 이미지
- `docs/`: 기존 세계관 조사 및 기관 설정

## 원본

기존 `castorice-SA/Laika`의 `feat/cyoa-homepage` 브랜치, 커밋 `a8bcc23fdd134bf96e3a7aebb0fb5256ed4f7f83`에서 CYOA와 필요한 이미지 및 세계관 문서만 분리했습니다. 원본 PR #1은 이 사이트의 배포에 필요하지 않습니다. 이후 CYOA 수정은 이 저장소에서 진행합니다.

직업 및 힘의 기원 등 조사된 분류와 프로젝트 전용 창작 설정은 구분하며, 세부 선택지를 원작 공식 설정으로 단정하지 않습니다.
