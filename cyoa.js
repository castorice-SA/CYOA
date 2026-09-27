(() => {
  "use strict";

  const STORAGE_KEY = "laika-standalone-cyoa-v1";
  const IDENTITY_KEY = "laika-standalone-identity-v1";
  const BASE_POINTS = 8;

  const sections = [
    {
      id: "career",
      number: "01",
      title: "직업",
      description: "당신이 세상을 이해하고 생존하는 가장 익숙한 방식입니다. 소속과 힘의 기원과는 별개입니다.",
      mode: "single",
      min: 1,
      max: 1,
      rule: "1개 선택 · 비용 없음",
      choices: [
        { id: "career_scholar", code: "WORK / SCHOLAR", title: "학자", body: "미지의 현상을 분류하고 모호한 것을 규정한다. 현장보다 기록에 강하지만, 기록이 틀렸다면 직접 확인하러 간다.", cost: 0, effect: "분석 · 연구", tags: ["analysis"] },
        { id: "career_detective", code: "WORK / DETECTIVE", title: "탐정", body: "사람과 사건 사이의 빈칸을 추적한다. 진술과 물증의 불일치를 오래 붙잡고 있는 직업.", cost: 0, effect: "추론 · 면담", tags: ["people", "analysis"] },
        { id: "career_mercenary", code: "WORK / MERCENARY", title: "용병", body: "위험한 장소에서 누군가가 살아 돌아올 시간을 번다. 계약보다 생환을 우선하는 사람일 수도 있다.", cost: 0, effect: "전투 · 보호", tags: ["field"] },
        { id: "career_doctor", code: "WORK / DOCTOR", title: "의사", body: "신비와 공상이 몸과 정신에 남기는 흔적을 다룬다. 치료는 때로 현상 분석보다 빠른 결정을 요구한다.", cost: 0, effect: "의료 · 안정", tags: ["care"] },
        { id: "career_official", code: "WORK / OFFICIAL", title: "공무원", body: "절차가 실제 행동으로 이어지게 만든다. 허가와 책임 소재를 남기는 일 역시 생존 기술이다.", cost: 0, effect: "조정 · 절차", tags: ["procedure"] },
        { id: "career_hacker", code: "WORK / HACKER", title: "해커", body: "기계와 정보망에 남은 흔적을 읽는다. 신비가 데이터와 장치에 스며든 시대의 추적자.", cost: 0, effect: "정보 · 침투", tags: ["information"] },
        { id: "career_cleric", code: "WORK / CLERIC", title: "성직자", body: "믿음과 의례, 공동체의 언어로 이상현상에 맞선다. 무엇을 신성이라 부를지는 사람마다 다르다.", cost: 0, effect: "의례 · 정신", tags: ["ritual"] },
        { id: "career_hunter", code: "WORK / HUNTER", title: "사냥꾼", body: "흔적과 지형, 습성을 읽어 목표를 추적한다. 공상체를 상대할 때도 먼저 이동 경로부터 본다.", cost: 0, effect: "추적 · 야전", tags: ["field"] }
      ]
    },
    {
      id: "origin",
      number: "02",
      title: "힘의 기원",
      description: "신비한 힘이 당신에게 들어온 경로입니다. 직업이나 소속과 같은 분류가 아닙니다.",
      mode: "single",
      min: 1,
      max: 1,
      rule: "1개 선택 · 구성점 1",
      choices: [
        { id: "origin_inheritor", code: "ORIGIN / SUCCESSION", title: "전승자", body: "누군가가 남긴 계보, 의식, 술식 또는 권리를 이어받았다. 힘에는 언제나 이전 사용자의 흔적이 남아 있다.", cost: 1, effect: "계승된 신비", tags: ["legacy"] },
        { id: "origin_awakened", code: "ORIGIN / BLOOM", title: "공상 개화자", body: "공상과 심상이 현실에 닿으며 힘이 개화했다. 능력은 당신의 욕망이나 상처와 닮은 모양을 띨 수 있다.", cost: 1, effect: "내면에서 발현", tags: ["imagination"] },
        { id: "origin_contract", code: "ORIGIN / CONTRACT", title: "계약자", body: "인간이 아닌 존재 또는 신비한 체계와 합의를 맺었다. 얻은 힘과 약속의 범위가 정확히 일치하지 않을 수도 있다.", cost: 1, effect: "계약 기반", tags: ["contract"] },
        { id: "origin_otherworld", code: "ORIGIN / OTHERWORLD", title: "이계 기원자", body: "이 세계의 규칙과 완전히 겹치지 않는 곳에서 왔거나 그 영향 아래 태어났다. 당신 자신이 증거가 된다.", cost: 1, effect: "이질적 기원", tags: ["otherworld"] },
        { id: "origin_vein", code: "ORIGIN / LEY", title: "성맥 접속자", body: "세계의 흐름과 직접 연결되어 신비를 끌어쓴다. 장소와 환경의 상태가 능력의 안정성에 영향을 준다.", cost: 1, effect: "환경과 공명", tags: ["ley"] }
      ]
    },
    {
      id: "traits",
      number: "03",
      title: "개인 특성",
      description: "능력치가 아니라, 당신이 위기와 타인을 대하는 방식입니다. 두 가지를 선택하십시오.",
      mode: "multi",
      min: 2,
      max: 2,
      rule: "정확히 2개 · 각 구성점 1",
      choices: [
        { id: "trait_observer", code: "TRAIT / OBSERVE", title: "침착한 관찰", body: "당황하기 전에 주변의 변화부터 센다. 작은 차이를 오래 기억한다.", cost: 1, effect: "관찰에 강함", tags: ["analysis"] },
        { id: "trait_curiosity", code: "TRAIT / CURIOSITY", title: "위험한 호기심", body: "금지된 문과 이해되지 않은 현상을 그냥 지나치지 못한다. 살아남는 이유이자 위험해지는 이유.", cost: 1, effect: "미지에 끌림", tags: ["imagination"] },
        { id: "trait_duty", code: "TRAIT / DUTY", title: "끈질긴 책임감", body: "끝났다고 기록된 일도 누군가 책임져야 한다면 다시 연다. 자신에게 너무 많은 책임을 돌릴 수 있다.", cost: 1, effect: "포기하지 않음", tags: ["procedure"] },
        { id: "trait_empathy", code: "TRAIT / EMPATHY", title: "과잉 공감", body: "타인의 감정과 분위기에 빠르게 반응한다. 사람을 이해하는 만큼 상처도 쉽게 옮겨온다.", cost: 1, effect: "감정 민감", tags: ["people"] },
        { id: "trait_reflex", code: "TRAIT / REFLEX", title: "위기 반사", body: "생각보다 몸이 먼저 움직인다. 한 번의 망설임이 치명적인 현장에서 살아남은 습관.", cost: 1, effect: "즉각 대응", tags: ["field"] },
        { id: "trait_skeptic", code: "TRAIT / DOUBT", title: "의심하는 습관", body: "확실한 설명일수록 한 번 더 반박해 본다. 음모론자가 아니라 틀릴 가능성을 남기는 사람.", cost: 1, effect: "가설 검증", tags: ["analysis"] },
        { id: "trait_discipline", code: "TRAIT / DISCIPLINE", title: "규율 준수", body: "절차와 약속을 쉽게 깨지 않는다. 규칙이 사람을 보호하기 위해 존재한다고 믿는다.", cost: 1, effect: "안정적 운용", tags: ["procedure"] },
        { id: "trait_border", code: "TRAIT / LIMINAL", title: "경계인 감각", body: "어느 집단에도 완전히 속하지 않는 데 익숙하다. 서로 다른 세계의 언어를 중간에서 번역한다.", cost: 1, effect: "낯선 것에 적응", tags: ["otherworld"] }
      ]
    },
    {
      id: "mystery",
      number: "04",
      title: "신비 능력",
      description: "당신이 실제 조사와 생존에서 사용하는 핵심 수단입니다. 하나는 필수, 두 번째는 선택입니다.",
      mode: "multi",
      min: 1,
      max: 2,
      rule: "1~2개 · 각 구성점 2",
      choices: [
        { id: "mystery_perception", code: "MYSTERY / PERCEPTION", title: "신비 지각 및 분석", body: "평범한 감각으로는 지나치는 신비의 흔적을 인지하고, 관측 가능한 조건을 분리해 이해한다.", cost: 2, effect: "관측 · 해석", tags: ["analysis"] },
        { id: "mystery_dismantle", code: "MYSTERY / DISMANTLE", title: "공상 해체", body: "공상체와 공상 현상을 구성 단위로 분석한다. 곧바로 소멸시키는 힘이 아니라 약점과 구조를 찾아내는 이해에 가깝다.", cost: 2, effect: "구조 분석", tags: ["analysis", "imagination"] },
        { id: "mystery_human", code: "MYSTERY / HUMAN", title: "인간 분석", body: "표정과 말투, 선택의 패턴을 통해 사람의 심리를 분석한다. 생각을 마음대로 읽는 능력은 아니다.", cost: 2, effect: "심리 추론", tags: ["people"] },
        { id: "mystery_filter", code: "MYSTERY / FILTER", title: "정보 필터", body: "위험한 정보와 인식성 오염을 걸러내는 1차 방어 수단. 완전한 면역 대신 버틸 시간을 번다.", cost: 2, effect: "인지 방어", tags: ["information"] },
        { id: "mystery_alchemy", code: "MYSTERY / ALCHEMY", title: "연금 구조 해석", body: "물질과 에너지의 구조, 변인과 반응을 계측한다. 무기 제작보다 분석과 실험에 강한 연금술 운용.", cost: 2, effect: "실험 · 계측", tags: ["analysis"] },
        { id: "mystery_logs", code: "MYSTERY / LOGS", title: "연결 로그 추적", body: "기기와 정보망에 남은 연결 이력을 조사한다. 손실된 인간 기억이 아니라 시스템의 흔적을 복원한다.", cost: 2, effect: "디지털 추적", tags: ["information"] },
        { id: "mystery_gate", code: "MYSTERY / GATE", title: "게이트위빙", body: "방문과 표식의 조건을 이용해 공간 사이에 문을 엮는다. 높은 소모와 사전 준비를 감수해야 한다.", cost: 2, effect: "공간 이동", tags: ["field", "ritual"] },
        { id: "mystery_curse", code: "MYSTERY / RITUAL", title: "주술", body: "상징과 준비된 조건을 통해 효과를 누적시키는 신비. 즉흥전보다 사전 설계와 해석이 중요하다.", cost: 2, effect: "상징 · 의식", tags: ["ritual"] }
      ]
    },
    {
      id: "equipment",
      number: "05",
      title: "장비",
      description: "신비만으로 모든 문제를 해결하지 않습니다. 하나는 필수, 여유가 있다면 두 개까지 휴대할 수 있습니다.",
      mode: "multi",
      min: 1,
      max: 2,
      rule: "1~2개 · 각 구성점 1",
      choices: [
        { id: "gear_meter", code: "GEAR / METER", title: "공상 오염 측정기", body: "공간의 불안정성과 오염 변화를 기록하는 휴대 계측기. 수치는 답이 아니라 경고다.", cost: 1, effect: "환경 계측", tags: ["analysis"] },
        { id: "gear_coat", code: "GEAR / COAT", title: "다층 방호 코트", body: "파편과 열, 일부 신비성 접촉을 줄이기 위해 보강한 현장 코트. 모든 위험을 막아주지는 않는다.", cost: 1, effect: "현장 생존", tags: ["field"] },
        { id: "gear_notebook", code: "GEAR / NOTE", title: "봉인식 수첩", body: "관측과 추론을 분리해 기록하고, 위험 정보의 재열람을 제한하는 개인 기록 도구.", cost: 1, effect: "기록 보호", tags: ["information"] },
        { id: "gear_recovery", code: "GEAR / RECOVERY", title: "회수 키트", body: "표본 봉인, 임시 라벨, 증거 포장과 응급 고정을 위한 조사용 묶음. 화려하지 않지만 자주 살아남는다.", cost: 1, effect: "증거 회수", tags: ["field"] },
        { id: "gear_jammer", code: "GEAR / JAMMER", title: "휴대 신호 차단기", body: "위험한 송수신과 반복 신호를 잠시 끊어내는 장비. 원인을 제거하지는 못한다.", cost: 1, effect: "신호 억제", tags: ["information"] },
        { id: "gear_lens", code: "GEAR / LENS", title: "분석 렌즈", body: "육안 관찰을 보조하는 광학·신비 복합 렌즈. 사용자의 해석 능력이 낮으면 잡음만 늘어난다.", cost: 1, effect: "관측 보조", tags: ["analysis"] },
        { id: "gear_anchor", code: "GEAR / ANCHOR", title: "표식 앵커", body: "공간 이동과 귀환 지점을 식별하는 휴대 표식. 경계가 흔들리는 장소에서 길을 잃지 않게 한다.", cost: 1, effect: "귀환 표식", tags: ["field"] },
        { id: "gear_medkit", code: "GEAR / STABILIZE", title: "현장 안정 키트", body: "출혈과 쇼크, 경미한 신비 노출 이후의 기본 처치를 위한 장비. 전문 치료를 대체하지 않는다.", cost: 1, effect: "응급 안정", tags: ["care"] }
      ]
    },
    {
      id: "companion",
      number: "06",
      title: "동료",
      description: "누구와 함께 움직이는지는 능력만큼 큰 선택입니다. 이름이 아니라 역할을 고릅니다.",
      mode: "single",
      min: 1,
      max: 1,
      rule: "1개 선택 · 비용 없음",
      choices: [
        { id: "companion_record", code: "PARTNER / RECORD", title: "기록 분석가", body: "당신의 추론을 그대로 믿지 않고 원문과 수치를 다시 확인한다. 틀렸을 때 가장 먼저 말해주는 사람.", cost: 0, effect: "검증 파트너", tags: ["analysis"] },
        { id: "companion_guard", code: "PARTNER / GUARD", title: "현장 보호자", body: "당신이 관측하는 동안 출입구와 퇴로를 확보한다. 위험한 판단에 몸으로 반대할 수도 있다.", cost: 0, effect: "생존 파트너", tags: ["field"] },
        { id: "companion_medic", code: "PARTNER / MEDIC", title: "의료 담당", body: "부상과 인지 이상을 가장 먼저 알아차린다. 조사 성공보다 살아 돌아오는 일을 우선한다.", cost: 0, effect: "회복 파트너", tags: ["care"] },
        { id: "companion_liaison", code: "PARTNER / LIAISON", title: "연락관", body: "허가와 외부 협력, 구조 요청을 연결한다. 당신의 계획을 기관이 이해할 언어로 바꾼다.", cost: 0, effect: "조정 파트너", tags: ["procedure"] },
        { id: "companion_anomaly", code: "PARTNER / ANOMALOUS", title: "비적대 공상체", body: "인간과 같은 방식으로 세계를 보지 않는 동행자. 도움이 되지만, 인간 사회의 기준으로는 설명하기 어렵다.", cost: 0, effect: "이질적 동행", tags: ["imagination"] },
        { id: "companion_solo", code: "PARTNER / SOLO", title: "단독 활동", body: "고정 동료 없이 임무마다 협력자를 바꾼다. 자유롭지만 당신의 오판을 즉시 막아줄 사람이 없다.", cost: 0, effect: "독립 운용", tags: ["solo"] }
      ]
    },
    {
      id: "incident",
      number: "07",
      title: "당신을 바꾼 사건",
      description: "현재의 당신이 만들어진 계기입니다. 사건의 진상보다, 그 뒤에 무엇이 남았는지가 중요합니다.",
      mode: "single",
      min: 1,
      max: 1,
      rule: "1개 선택 · 비용 없음",
      choices: [
        { id: "incident_zone", code: "PAST / CONTAMINATION", title: "공상 오염 지역 생존", body: "지도에서 사라진 구역에서 살아 나왔다. 이후 당신은 장소가 기억을 가진다는 말을 쉽게 비웃지 않는다.", cost: 0, effect: "생존 경험", tags: ["field"] },
        { id: "incident_failure", code: "PAST / FAILURE", title: "구조 실패", body: "살릴 수 없었던 사람이 있다. 그 경험은 지금도 당신이 철수 명령을 받아들이는 방식을 바꾼다.", cost: 0, effect: "책임의 상처", tags: ["care"] },
        { id: "incident_archive", code: "PAST / FORBIDDEN", title: "금지 기록 접촉", body: "보지 말았어야 할 기록을 읽고 살아남았다. 내용보다 그 기록을 숨겨야 했던 이유가 더 오래 남았다.", cost: 0, effect: "위험 정보 경험", tags: ["information"] },
        { id: "incident_bargain", code: "PAST / PARLEY", title: "공상체와의 협상", body: "적대적이지 않은 공상체와 대화해 사건을 끝낸 적이 있다. 이후 '괴물'이라는 분류를 쉽게 믿지 않는다.", cost: 0, effect: "분류에 대한 의심", tags: ["people", "imagination"] },
        { id: "incident_break", code: "PAST / BREACH", title: "경계 붕괴 목격", body: "공간과 시간의 안정성이 무너지는 순간을 직접 봤다. 현실이 언제나 같은 규칙을 지킨다는 믿음을 잃었다.", cost: 0, effect: "경계 경험", tags: ["otherworld"] },
        { id: "incident_rescued", code: "PAST / RESCUED", title: "ERAC 조사에 의해 구조됨", body: "한때 당신은 조사 대상이거나 구조 대상이었다. 지금의 연구청과 맺는 관계에는 그때의 기억이 따라다닌다.", cost: 0, effect: "기관과의 과거", tags: ["procedure"] }
      ]
    },
    {
      id: "relationship",
      number: "08",
      title: "ERAC와의 관계",
      description: "황실 이상현상 연구청은 이 세계의 유일한 선택지가 아닙니다. 당신이 기관과 어떤 거리에서 살아가는지 정합니다.",
      mode: "single",
      min: 1,
      max: 1,
      rule: "1개 선택 · 비용 없음",
      choices: [
        { id: "relation_agent", code: "ERAC / AGENT", title: "정식 조사요원", body: "연구청의 권한과 장비를 사용하며 그 결과에 대한 보고 책임도 진다.", cost: 0, effect: "내부 인력", tags: ["procedure"] },
        { id: "relation_researcher", code: "ERAC / CONTRACT", title: "외부 계약 연구원", body: "특정 분야의 전문성 때문에 필요할 때 호출된다. 조직의 규율과 개인의 방식 사이에 거리가 있다.", cost: 0, effect: "전문 협력", tags: ["analysis"] },
        { id: "relation_survivor", code: "ERAC / PROTECTED", title: "보호 대상 출신", body: "과거 ERAC의 보호와 감시를 함께 받았다. 지금도 연구청을 완전히 믿지도, 완전히 떠나지도 못한다.", cost: 0, effect: "복합적 신뢰", tags: ["people"] },
        { id: "relation_watch", code: "ERAC / WATCHLIST", title: "감시 대상", body: "당신의 힘이나 기원 때문에 정기적으로 상태를 보고해야 한다. 적은 아니지만 완전한 자유도 없다.", cost: 0, effect: "조건부 자유", tags: ["otherworld"] },
        { id: "relation_informant", code: "ERAC / INFORMANT", title: "비공식 정보원", body: "현장 소문과 비공개 경로를 연구청에 넘긴다. 기록에는 당신의 이름보다 코드가 더 자주 남는다.", cost: 0, effect: "그림자 협력", tags: ["information"] },
        { id: "relation_independent", code: "ERAC / INDEPENDENT", title: "독립 활동자", body: "ERAC의 명령 체계 밖에서 움직인다. 필요할 때 협력하지만 조사 목적과 윤리는 스스로 정한다.", cost: 0, effect: "기관 외부", tags: ["solo"] }
      ]
    },
    {
      id: "price",
      number: "09",
      title: "대가",
      description: "힘은 당신에게 무엇을 요구합니까? 마지막 선택은 결말이 아니라, 앞으로의 모든 장면에 따라붙을 조건입니다.",
      mode: "single",
      min: 1,
      max: 1,
      rule: "1개 선택 · 구성점 +1~2 반환",
      choices: [
        { id: "price_memory", code: "PRICE / MEMORY", title: "기억 마모", body: "큰 힘을 사용할수록 사소한 개인 기억부터 흐려진다. 임무 기록이 때로 당신의 기억보다 믿을 만하다.", cost: 0, refund: 2, effect: "구성점 +2", tags: ["memory"] },
        { id: "price_sense", code: "PRICE / SENSE", title: "감각 과부하", body: "신비를 깊이 인지한 뒤에는 평범한 소리와 빛까지 지나치게 선명해진다. 회복에는 시간과 고립이 필요하다.", cost: 0, refund: 1, effect: "구성점 +1", tags: ["sense"] },
        { id: "price_sleep", code: "PRICE / SLEEP", title: "수면 침식", body: "능력을 쓸수록 잠이 얕아지고 꿈에 현실의 잔향이 섞인다. 깨어 있는 시간만큼 꿈도 관리해야 한다.", cost: 0, refund: 1, effect: "구성점 +1", tags: ["sleep"] },
        { id: "price_mark", code: "PRICE / MARK", title: "신체 표식", body: "힘의 사용 흔적이 몸에 남는다. 숨길 수는 있어도 완전히 지울 수 없고, 숙련자는 그 흔적을 알아본다.", cost: 0, refund: 1, effect: "구성점 +1", tags: ["body"] },
        { id: "price_contract", code: "PRICE / DEBT", title: "계약 채무", body: "힘을 빌린 존재에게 정해진 의무를 갚아야 한다. 명령 복종이 아니라, 어길 경우 대가가 생기는 약속이다.", cost: 0, refund: 2, effect: "구성점 +2", tags: ["contract"], requires: () => isSelected("origin_contract"), lockText: "계약자만 선택할 수 있습니다." },
        { id: "price_identity", code: "PRICE / ANCHOR", title: "존재 흔들림", body: "이 세계에 오래 머물수록 이름, 그림자, 기록 중 하나가 가끔 현실과 어긋난다. 자신을 고정할 앵커가 필요하다.", cost: 0, refund: 2, effect: "구성점 +2", tags: ["otherworld"], requires: () => isSelected("origin_otherworld"), lockText: "이계 기원자만 선택할 수 있습니다." }
      ]
    }
  ];

  const choiceMap = new Map();
  sections.forEach(section => {
    section.choices.forEach(choice => {
      choice.sectionId = section.id;
      choiceMap.set(choice.id, choice);
    });
  });

  const state = { selected: new Set() };
  const identity = { name: "", codename: "", age: "" };

  const els = {
    sections: document.querySelector("#choice-sections"),
    template: document.querySelector("#choice-template"),
    resource: document.querySelector("#resource-value"),
    resourceTotal: document.querySelector("#resource-total"),
    refund: document.querySelector("#refund-value"),
    progress: document.querySelector("#progress-bar"),
    status: document.querySelector("#status-message"),
    count: document.querySelector("#selection-count"),
    summary: document.querySelector("#selection-summary"),
    miniIdentity: document.querySelector("#mini-identity"),
    resultState: document.querySelector("#result-state"),
    resultSummary: document.querySelector("#result-summary"),
    resultRecords: document.querySelector("#result-records"),
    resultNotes: document.querySelector("#result-notes"),
    sheetCodename: document.querySelector("#sheet-codename"),
    sheetName: document.querySelector("#sheet-name"),
    copy: document.querySelector("#copy-report"),
    name: document.querySelector("#character-name"),
    codename: document.querySelector("#character-codename"),
    age: document.querySelector("#character-age")
  };

  function isSelected(id) {
    return state.selected.has(id);
  }

  function selectedChoices() {
    return [...state.selected].map(id => choiceMap.get(id)).filter(Boolean);
  }

  function selectedInSection(sectionId) {
    return selectedChoices().filter(choice => choice.sectionId === sectionId);
  }

  function selectedRefund() {
    return selectedChoices().reduce((sum, choice) => sum + (choice.refund || 0), 0);
  }

  function pointsSpent(excludingIds = []) {
    const excluded = new Set(excludingIds);
    return selectedChoices()
      .filter(choice => !excluded.has(choice.id))
      .reduce((sum, choice) => sum + (choice.cost || 0), 0);
  }

  function totalPoints() {
    return BASE_POINTS + selectedRefund();
  }

  function pointsRemaining() {
    return totalPoints() - pointsSpent();
  }

  function meetsRequirement(choice) {
    return !choice.requires || choice.requires();
  }

  function refundableIds(section, incomingChoice) {
    if (section.mode !== "single") return [];
    return selectedInSection(section.id)
      .filter(choice => choice.id !== incomingChoice.id)
      .map(choice => choice.id);
  }

  function projectedRefund(section, incomingChoice) {
    let refund = selectedRefund();
    if (section.mode === "single") {
      selectedInSection(section.id).forEach(existing => {
        refund -= existing.refund || 0;
      });
    }
    refund += incomingChoice.refund || 0;
    return refund;
  }

  function disabledReason(choice, section) {
    if (isSelected(choice.id)) return "";

    if (!meetsRequirement(choice)) {
      return choice.lockText || "선행 조건이 필요합니다.";
    }

    if (section.mode === "multi" && section.max && selectedInSection(section.id).length >= section.max) {
      return `이 구획에서는 최대 ${section.max}개까지 선택할 수 있습니다.`;
    }

    const excluded = refundableIds(section, choice);
    const spent = pointsSpent(excluded) + (choice.cost || 0);
    const available = BASE_POINTS + projectedRefund(section, choice);
    if (spent > available) {
      return "남은 구성점이 부족합니다. 먼저 대가를 선택하면 일부 점수를 되돌려 받을 수 있습니다.";
    }

    return "";
  }

  function sanitizeSelections() {
    let changed = true;
    while (changed) {
      changed = false;
      for (const choice of selectedChoices()) {
        if (!meetsRequirement(choice)) {
          state.selected.delete(choice.id);
          changed = true;
        }
      }
    }
  }

  function toggleChoice(choice, section) {
    if (isSelected(choice.id)) {
      state.selected.delete(choice.id);
      sanitizeSelections();
      persist();
      render();
      return;
    }

    const reason = disabledReason(choice, section);
    if (reason) {
      els.status.textContent = reason;
      return;
    }

    if (section.mode === "single") {
      selectedInSection(section.id).forEach(existing => state.selected.delete(existing.id));
    }

    state.selected.add(choice.id);
    sanitizeSelections();
    persist();
    render();
  }

  function sectionComplete(section) {
    return selectedInSection(section.id).length >= (section.min || 0);
  }

  function renderSections() {
    if (!els.sections.children.length) {
      sections.forEach(section => {
        const wrapper = document.createElement("section");
        wrapper.className = "choice-section";
        wrapper.dataset.section = section.id;
        wrapper.innerHTML = `
          <div class="section-heading">
            <div>
              <span class="section-number">${section.number}</span>
              <h2>${section.title}</h2>
              <p>${section.description}</p>
            </div>
            <span class="section-rule">${section.rule}</span>
          </div>
          <div class="choice-grid"></div>
        `;

        const grid = wrapper.querySelector(".choice-grid");
        section.choices.forEach(choice => {
          const card = els.template.content.firstElementChild.cloneNode(true);
          card.dataset.choice = choice.id;
          card.querySelector(".choice-code").textContent = choice.code;
          card.querySelector(".choice-title").textContent = choice.title;
          card.querySelector(".choice-body").textContent = choice.body;
          card.querySelector(".choice-effect").textContent = choice.effect || "";
          card.addEventListener("click", () => toggleChoice(choice, section));
          grid.append(card);
        });

        els.sections.append(wrapper);
      });
    }

    sections.forEach(section => {
      section.choices.forEach(choice => {
        const card = document.querySelector(`[data-choice="${choice.id}"]`);
        const selected = isSelected(choice.id);
        const reason = disabledReason(choice, section);

        card.classList.toggle("is-selected", selected);
        card.setAttribute("aria-pressed", String(selected));
        card.disabled = Boolean(reason) && !selected;
        card.querySelector(".choice-state").textContent = selected ? "선택됨" : "선택";
        card.querySelector(".choice-lock").textContent = reason;

        const costParts = [];
        if (choice.cost) costParts.push(`구성점 -${choice.cost}`);
        if (choice.refund) costParts.push(`구성점 +${choice.refund}`);
        card.querySelector(".choice-cost").textContent = costParts.length ? costParts.join(" · ") : "COST / 0";
      });
    });
  }

  function renderStatus() {
    const completeCount = sections.filter(sectionComplete).length;
    const next = sections.find(section => !sectionComplete(section));

    els.resource.textContent = String(pointsRemaining());
    els.resourceTotal.textContent = ` / ${totalPoints()}`;
    els.refund.textContent = String(selectedRefund());
    els.progress.style.width = `${Math.round((completeCount / sections.length) * 100)}%`;
    els.count.textContent = `${state.selected.size} SELECTED`;

    if (pointsRemaining() < 0) {
      els.status.textContent = "구성점이 부족합니다. 능력·장비 선택을 줄이거나 대가를 조정하십시오.";
    } else if (next) {
      const currentCount = selectedInSection(next.id).length;
      const need = Math.max(0, (next.min || 0) - currentCount);
      els.status.textContent = need > 1
        ? `${next.title}: ${need}개를 더 선택하십시오.`
        : `${next.title}을(를) 선택하십시오.`;
    } else {
      els.status.textContent = "캐릭터 기록이 완성되었습니다. 아래 개인 기록 카드를 확인하십시오.";
    }
  }

  function displayName() {
    return identity.codename || identity.name || "미등록 인물";
  }

  function identitySubtitle() {
    const bits = [];
    if (identity.name && identity.codename) bits.push(identity.name);
    if (identity.age) bits.push(`${identity.age}세`);
    return bits.length ? bits.join(" · ") : "기록 작성 중";
  }

  function renderIdentity() {
    els.miniIdentity.innerHTML = `<strong>${escapeHtml(displayName())}</strong><span>${escapeHtml(identitySubtitle())}</span>`;
    els.sheetCodename.textContent = (identity.codename || identity.name || "UNREGISTERED").toUpperCase();
    const nameBits = [];
    if (identity.name) nameBits.push(identity.name);
    if (identity.age) nameBits.push(`${identity.age}세`);
    els.sheetName.textContent = nameBits.length ? nameBits.join(" · ") : "이름 미등록";
  }

  function renderSummary() {
    const groups = sections
      .map(section => ({ section, choices: selectedInSection(section.id) }))
      .filter(group => group.choices.length);

    if (!groups.length) {
      els.summary.innerHTML = '<p class="empty-state">아직 선택된 항목이 없습니다.</p>';
      return;
    }

    els.summary.innerHTML = groups.map(({ section, choices }) => `
      <section class="summary-group">
        <h3>${section.number} / ${section.title}</h3>
        <ul>${choices.map(choice => `<li>${choice.title}</li>`).join("")}</ul>
      </section>
    `).join("");
  }

  function titles(sectionId) {
    return selectedInSection(sectionId).map(choice => choice.title);
  }

  function firstTitle(sectionId) {
    return titles(sectionId)[0] || "";
  }

  function characterComplete() {
    return pointsRemaining() >= 0 && sections.every(sectionComplete);
  }

  function characterSummary() {
    const career = firstTitle("career");
    const origin = firstTitle("origin");
    const relation = firstTitle("relationship");
    const abilities = titles("mystery").join(", ");
    const incident = firstTitle("incident");
    const price = firstTitle("price");

    return `${displayName()}은(는) ${relation}의 위치에서 살아가는 ${career}이다. ${origin}의 방식으로 신비한 힘을 얻었고, 핵심 수단으로 ${abilities}을(를) 사용한다. ${incident}을(를) 지나 현재의 인물이 되었으며, 그 힘에는 ‘${price}’라는 대가가 따라붙는다. 이 기록은 결말이 아니라 시작점이다.`;
  }

  function renderResult() {
    renderIdentity();

    if (!characterComplete()) {
      els.resultState.textContent = "작성 중";
      els.resultState.classList.remove("result-state-ready");
      els.resultSummary.textContent = "마지막 항목인 대가까지 선택하면 지금까지의 선택이 하나의 캐릭터 기록으로 정리됩니다.";
      els.resultRecords.innerHTML = "";
      els.resultNotes.innerHTML = "";
      return;
    }

    els.resultState.textContent = "기록 완료";
    els.resultState.classList.add("result-state-ready");
    els.resultSummary.textContent = characterSummary();

    els.resultRecords.innerHTML = sections.map(section => {
      const values = titles(section.id);
      return `
        <div class="result-record">
          <span>${section.number} · ${section.title}</span>
          <strong>${values.join(" / ")}</strong>
        </div>
      `;
    }).join("");

    const notes = [
      `잔여 구성점: ${pointsRemaining()} / 총 ${totalPoints()}.`,
      "이 기록은 캐릭터의 출발 조건만 정리하며, 이후 사건의 결말이나 생존 여부를 결정하지 않습니다.",
      "능력의 세부 경지·수치·숨겨진 해금 조건은 별도 확장 영역으로 남겨 둡니다."
    ];
    els.resultNotes.innerHTML = notes.map(note => `<li>${note}</li>`).join("");
  }

  function buildReportText() {
    const lines = [
      "LAIKA / ERAC 인물 생성 기록",
      "==========================",
      `표시명: ${displayName()}`,
      identity.name ? `이름: ${identity.name}` : "이름: 미등록",
      identity.codename ? `코드네임: ${identity.codename}` : "코드네임: 미등록",
      identity.age ? `나이: ${identity.age}세` : "나이: 미등록",
      `구성점: ${pointsRemaining()} / ${totalPoints()}`,
      ""
    ];

    sections.forEach(section => {
      const selected = selectedInSection(section.id);
      if (!selected.length) return;
      lines.push(`[${section.number}] ${section.title}`);
      selected.forEach(choice => lines.push(`- ${choice.title}: ${choice.body}`));
      lines.push("");
    });

    if (characterComplete()) {
      lines.push("캐릭터 요약");
      lines.push(characterSummary());
      lines.push("");
    }

    lines.push("※ 이 기록은 캐릭터의 시작점이며 엔딩을 결정하지 않습니다.");
    return lines.join("\n");
  }

  async function copyReport() {
    const text = buildReportText();
    try {
      await navigator.clipboard.writeText(text);
      els.copy.textContent = "복사됨";
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.append(area);
      area.select();
      document.execCommand("copy");
      area.remove();
      els.copy.textContent = "복사됨";
    }
    window.setTimeout(() => {
      els.copy.textContent = "캐릭터 시트 복사";
    }, 1500);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.selected]));
      localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity));
    } catch {
      // Local storage is optional.
    }
  }

  function restore() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(saved)) {
        saved.filter(id => choiceMap.has(id)).forEach(id => state.selected.add(id));
      }

      const savedIdentity = JSON.parse(localStorage.getItem(IDENTITY_KEY) || "{}");
      identity.name = savedIdentity.name || "";
      identity.codename = savedIdentity.codename || "";
      identity.age = savedIdentity.age || "";
      els.name.value = identity.name;
      els.codename.value = identity.codename;
      els.age.value = identity.age;
      sanitizeSelections();
    } catch {
      state.selected.clear();
    }
  }

  function syncIdentity() {
    identity.name = els.name.value.trim();
    identity.codename = els.codename.value.trim();
    identity.age = els.age.value.trim();
    persist();
    renderIdentity();
    renderResult();
  }

  function resetAll() {
    state.selected.clear();
    identity.name = "";
    identity.codename = "";
    identity.age = "";
    els.name.value = "";
    els.codename.value = "";
    els.age.value = "";
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(IDENTITY_KEY);
    } catch {
      // Ignore storage failures.
    }
    render();
    document.querySelector("#choice-sections").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function render() {
    renderSections();
    renderStatus();
    renderSummary();
    renderResult();
  }

  [els.name, els.codename, els.age].forEach(input => {
    input.addEventListener("input", syncIdentity);
  });
  document.querySelector("#reset-top").addEventListener("click", resetAll);
  document.querySelector("#reset-side").addEventListener("click", resetAll);
  document.querySelector("#copy-report").addEventListener("click", copyReport);

  restore();
  render();
})();
