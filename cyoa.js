(() => {
  "use strict";

  const STORAGE_KEY = "laika-team01-cyoa-v2";
  const LEGACY_KEY = "laika-standalone-cyoa-v1";
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
  "id": "companion",
  "title": "조사 1팀과의 첫 접점",
  "description": "그 사건 이후, 당신의 이야기는 어떤 경로로 조사 1팀에 닿았습니까?",
  "mode": "single",
  "min": 1,
  "max": 1,
  "rule": "1개 선택 · 비용 없음",
  "choices": [
    {
      "id": "contact_laika",
      "title": "면담실의 라이카",
      "body": "당신의 진술을 다시 듣고 싶다는 연락이 왔다. 면담실에서 라이카는 따뜻한 잔을 내밀고, 기록에서 빠진 대목을 물었다.",
      "effect": "팀장과 직접 면담",
      "code": "CONTACT / 01",
      "cost": 0
    },
    {
      "id": "contact_field",
      "title": "현장에서 만난 조사요원",
      "body": "현장에 남아 있던 당신은 조사 1팀의 요원과 마주쳤다. 당신이 알려 준 단서가 조사에 도움이 되었고, 사건 뒤에도 연락이 이어졌다.",
      "effect": "현장 협력",
      "code": "CONTACT / 02",
      "cost": 0
    },
    {
      "id": "contact_record",
      "title": "당신의 기록을 읽은 분석관",
      "body": "아무도 읽지 않을 줄 알았던 보고서에 답장이 왔다. 조사 1팀의 분석관은 당신의 관측을 직접 확인하고 싶어 했다.",
      "effect": "기록을 통한 연결",
      "code": "CONTACT / 03",
      "cost": 0
    },
    {
      "id": "contact_medical",
      "title": "치료실에서 이어진 대화",
      "body": "사건 이후 치료를 받던 중, 연구청 의료진에게 이상현상의 흔적을 설명했다. 당신의 동의를 얻은 의료진이 조사 1팀에 면담을 연결했다.",
      "effect": "회복 이후의 접촉",
      "code": "CONTACT / 04",
      "cost": 0
    },
    {
      "id": "contact_liaison",
      "title": "연구청에서 온 연락",
      "body": "당신의 이력을 검토한 연구청 연락관이 조사 1팀의 협력 요청을 전달했다. 조건을 듣고 판단할 시간은 당신에게 주어졌다.",
      "effect": "공식 연락",
      "code": "CONTACT / 05",
      "cost": 0
    },
    {
      "id": "contact_tip",
      "title": "당신이 먼저 보낸 제보",
      "body": "다른 사람을 기다리는 대신 직접 자료를 보냈다. 며칠 뒤 조사 1팀에서 답장이 왔다. 그들이 확인하고 싶은 것은 자료를 모은 당신이었다.",
      "effect": "자발적 접촉",
      "code": "CONTACT / 06",
      "cost": 0
    }
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
  "id": "relationship",
  "title": "그 제안을 받아들인 이유",
  "description": "조사 1팀과 함께 일할 기회가 생겼습니다. 당신은 왜 이 팀에 들어가기로 했습니까?",
  "mode": "single",
  "min": 1,
  "max": 1,
  "rule": "1개 선택 · 비용 없음",
  "choices": [
    {
      "id": "join_answer",
      "title": "남겨진 의문을 쫓기 위해",
      "body": "그 사건은 끝났다고 기록됐지만, 당신에게는 아직 설명되지 않은 부분이 있다. 조사 1팀에서라면 그 질문을 계속할 수 있다.",
      "effect": "미해결 의문",
      "code": "JOIN / 01",
      "cost": 0
    },
    {
      "id": "join_protect",
      "title": "다음 사람은 구하기 위해",
      "body": "당신이 겪은 일을 다른 사람도 겪을 수 있다. 이제는 사건 바깥에서 기다리기보다, 대응하는 쪽에 서기로 했다.",
      "effect": "구조와 보호",
      "code": "JOIN / 02",
      "cost": 0
    },
    {
      "id": "join_research",
      "title": "혼자서는 닿지 못할 진실 때문에",
      "body": "당신의 지식과 능력에는 한계가 있다. 동료의 검증과 연구청의 자료가 필요했고, 그만큼 당신의 관측도 팀에 내놓기로 했다.",
      "effect": "공동 조사",
      "code": "JOIN / 03",
      "cost": 0
    },
    {
      "id": "join_return",
      "title": "구조받은 뒤 스스로 지원",
      "body": "한때 조사 대상이었던 당신은 회복한 뒤 다시 문을 두드렸다. 빚을 갚으라는 요구 때문이 아니라, 이번에는 누군가를 데리고 돌아오고 싶어서다.",
      "effect": "구조 대상에서 팀원으로",
      "code": "JOIN / 04",
      "cost": 0
    },
    {
      "id": "join_trust",
      "title": "당신의 말을 들어준 사람 때문에",
      "body": "쉽게 설명되지 않는 진술 앞에서도 라이카는 자리를 뜨지 않았다. 모든 답을 믿는 것은 아니지만, 질문을 함께 견딜 사람은 믿어 보기로 했다.",
      "effect": "면담에서 시작된 신뢰",
      "code": "JOIN / 05",
      "cost": 0
    },
    {
      "id": "join_place",
      "title": "힘을 숨기지 않아도 될 자리를 찾아",
      "body": "혼자 힘을 감추며 버티는 데 지쳤다. 위험과 한계를 팀에 알리고, 그것까지 고려하며 함께 일할 자리를 선택했다.",
      "effect": "함께 감당할 동료",
      "code": "JOIN / 06",
      "cost": 0
    }
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

  // The story ends at entry into Team 01; it does not resolve the earlier incident.
  const chapterOrder = ['career', 'incident', 'origin', 'traits', 'mystery', 'companion', 'relationship', 'equipment', 'price'];
  sections.sort((a, b) => chapterOrder.indexOf(a.id) - chapterOrder.indexOf(b.id));
  const chapterCopy = {
    career: ['사건 이전의 당신', '조사 1팀의 문을 두드리기 전, 당신에게도 익숙한 일상이 있었습니다. 그때 당신은 무엇으로 살아갔습니까?'],
    incident: ['일상을 끊어 놓은 사건', '그날 이후, 이상현상은 남의 이야기가 아니게 되었습니다. 당신을 연구청의 시야에 들어오게 한 사건을 고르십시오.'],
    origin: ['당신에게 깃든 힘', '사건을 설명하려면 당신이 가진 힘부터 이야기해야 합니다. 사건 전부터 지녔을 수도, 사건을 겪으며 얻었을 수도 있습니다.'],
    traits: ['그때 드러난 당신의 모습', '위기 앞에서 당신은 어떤 사람이었습니까? 두 가지 태도를 골라 그날의 당신을 남기십시오.'],
    mystery: ['조사 1팀이 주목한 능력', '당신이 해낼 수 있는 일은 무엇입니까? 함께 조사하게 될 동료들에게 보여 줄 신비를 고르십시오.'],
    equipment: ['첫 출근에 챙긴 것', '합류를 결정한 뒤, 당신은 현장에 가져갈 장비를 준비합니다. 앞으로 동료들과 돌아오기 위해 필요한 것을 고르십시오.'],
    price: ['합류 전에 밝혀야 할 대가', '팀에 들어가도 힘의 대가는 사라지지 않습니다. 앞으로 함께 일할 사람들에게 알려 두어야 할 한계를 고르십시오.']
  };
  sections.forEach((section, index) => {
    section.number = String(index + 1).padStart(2, '0');
    if (chapterCopy[section.id]) [section.title, section.description] = chapterCopy[section.id];
  });
  const routes = sections.find(section => section.id === 'relationship').choices;
  Object.assign(routes.find(choice => choice.id === 'join_return'), {
    requires: () => isSelected('incident_rescued'), lockText: '사건에서 「ERAC 조사에 의해 구조됨」을 선택하면 열립니다.'
  });
  Object.assign(routes.find(choice => choice.id === 'join_trust'), {
    requires: () => isSelected('contact_laika'), lockText: '첫 접점에서 「면담실의 라이카」를 선택하면 열립니다.'
  });

  const choiceMap = new Map();
  sections.forEach(section => {
    section.choices.forEach(choice => {
      choice.sectionId = section.id;
      choiceMap.set(choice.id, choice);
    });
  });

  const state = { selected: new Set(), chapter: 0 };
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
        : `${next.title}: 선택을 완료해 주세요.`;
    } else {
      els.status.textContent = "조사 1팀 합류 기록이 완성되었습니다. 당신의 첫 출근을 확인하십시오.";
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
    const contact = selectedInSection('companion')[0];
    const reason = selectedInSection('relationship')[0];
    return [
      `이름은 ${displayName()}. 조사 1팀에 오기 전에는 ${firstTitle('career')} 일을 했다. 일상을 바꾼 것은 ‘${firstTitle('incident')}’ 사건이었다.`,
      `힘의 기원은 ${firstTitle('origin')}. 당시의 행동에서는 ${titles('traits').join(', ')} 같은 태도가 드러났다. 팀에는 ${titles('mystery').join(', ')} 능력을 활용할 수 있다고 알렸다.`,
      contact.body,
      reason.body,
      `합류를 결정한 뒤 ${titles('equipment').join(', ')} 장비를 챙겼다. 동료들에게는 ‘${firstTitle('price')}’라는 대가도 알렸다. 힘의 한계를 숨기지 않는 것이 함께 일하기 위한 첫 약속이었다.`,
      `첫 출근 날, ${displayName()}의 이름이 ERAC 조사 1팀의 새 합류 기록에 남았다. 팀장 라이카와 함께할 조사는 이제부터다.`
    ].join('\n\n');
  }

  function renderResult() {
    renderIdentity();

    if (!characterComplete()) {
      els.resultState.textContent = "작성 중";
      els.resultState.classList.remove("result-state-ready");
      els.resultSummary.textContent = "각 장면과 마지막 대가를 선택하면, 조사 1팀에 오게 된 당신의 이야기가 완성됩니다.";
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
      "소속: 황실 이상현상 연구청 · 조사 1팀 / 팀장: 라이카.",
      "기록은 팀에 합류한 시점까지입니다. 과거 사건의 진상과 앞으로의 조사는 아직 열려 있습니다."
    ];
    els.resultNotes.innerHTML = notes.map(note => `<li>${note}</li>`).join("");
  }

  function buildReportText() {
    const lines = [
      "LAIKA / ERAC 조사 1팀 합류 기록",
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
      lines.push("조사 1팀에 오기까지");
      lines.push(characterSummary());
      lines.push("");
    }

    lines.push("※ 첫 출근까지의 기록입니다. 이후 조사의 결말은 결정하지 않습니다.");
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
      els.copy.textContent = "합류 기록 복사";
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
      const currentSave = localStorage.getItem(STORAGE_KEY);
      const legacySave = currentSave === null ? localStorage.getItem(LEGACY_KEY) : null;
      const saved = JSON.parse(currentSave || legacySave || "[]");
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
      if (legacySave && state.selected.size) {
        const notice = document.querySelector('#migration-notice');
        notice.hidden = false;
        notice.textContent = '이전 기록의 직업·사건·능력·장비·대가를 불러왔습니다. 첫 접점과 합류 이유는 새로 선택해 주세요.';
      }
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
      localStorage.setItem(STORAGE_KEY, "[]");
      localStorage.removeItem(IDENTITY_KEY);
    } catch {
      // Ignore storage failures.
    }
    document.querySelector('#migration-notice').hidden = true;
    render();
    goToChapter(0);
  }

  function render() {
    renderSections();
    renderStatus();
    renderSummary();
    renderResult();
    renderChapter();
  }

  function sceneText(id) {
    const career = firstTitle('career') || '아직 기록되지 않은 직업';
    const incident = firstTitle('incident');
    const contact = firstTitle('companion');
    const prelude = incident ? `‘${incident}’ 이후, 당신의 삶에는 설명해야 할 것이 남았습니다. ` : '';
    const scenes = {
      career: '문패에는 황실 이상현상 연구청, 조사 1팀이라고 적혀 있습니다. 하지만 당신의 이야기는 이 문 앞에서 시작되지 않습니다. 그보다 전, 익숙했던 일상으로 돌아갑니다.',
      incident: `당시 당신의 직업은 ${career}. 익숙한 지식과 경험만으로는 설명할 수 없는 일이 벌어졌습니다. 그 사건이 연구청과 당신을 잇는 첫 실마리가 됩니다.`,
      origin: prelude + '당신의 힘 역시 그중 하나였습니다. 처음 힘을 얻었던 순간을 떠올립니다. 사건 이전의 일이든, 바로 그 사건 속의 일이든 괜찮습니다.',
      traits: prelude + '진술서에는 사건의 경과가 적혔지만, 그 순간 당신이 어떤 사람이었는지까지 담기지는 않았습니다. 당신의 행동을 설명하는 두 가지 태도를 남깁니다.',
      mystery: `직업은 ${career}, 힘의 기원은 ${firstTitle('origin') || '미정'}. 조사 1팀이 묻는 것은 힘의 크기만이 아닙니다. 그 힘으로 무엇을 알아내고, 누구를 도울 수 있는지가 중요합니다.`,
      companion: prelude + '어떤 만남은 현장에서, 어떤 만남은 한 장의 보고서에서 시작됩니다. 조사 1팀과 당신의 이야기가 처음 겹친 순간을 고릅니다.',
      relationship: contact ? `첫 접점은 ‘${contact}’였습니다. 연락과 확인을 거친 뒤, 함께 일해 보자는 제안이 도착했습니다. 문을 통과할지 결정하는 것은 당신입니다.` : '조사 1팀과 함께 일할 기회가 생겼습니다. 먼저 첫 접점을 정하면 그 만남에 이어지는 합류 이유를 선택할 수 있습니다.',
      equipment: `‘${firstTitle('relationship') || '아직 정하지 않은 이유'}’. 마음을 정한 뒤에는 실제 준비가 남았습니다. 첫 출근을 앞두고 현장에 가져갈 장비를 확인합니다.`,
      price: '입을 다물고 지나갈 수도 있는 질문이 하나 남았습니다. 힘을 쓰고 난 뒤, 당신에게는 무엇이 남습니까? 앞으로 곁에 설 동료들에게 그 대가를 알립니다.'
    };
    return scenes[id];
  }

  function goToChapter(index) {
    state.chapter = Math.max(0, Math.min(sections.length - 1, index));
    renderChapter();
    const scene = document.querySelector('#scene-intro');
    scene.focus({ preventScroll: true });
    scene.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderChapter() {
    const section = sections[state.chapter];
    const nav = document.querySelector('#chapter-nav');
    if (!nav.children.length) sections.forEach((chapter, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.addEventListener('click', () => goToChapter(index));
      nav.append(button);
    });
    sections.forEach((chapter, index) => {
      const button = nav.children[index];
      button.textContent = `${chapter.number} ${chapter.title}${sectionComplete(chapter) ? ' ✓' : ''}`;
      if (index === state.chapter) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
      document.querySelector(`[data-section="${chapter.id}"]`).hidden = index !== state.chapter;
    });
    document.querySelector('#scene-number').textContent = `CHAPTER ${section.number} / 09`;
    document.querySelector('#scene-title').textContent = section.title;
    document.querySelector('#scene-text').textContent = sceneText(section.id);
    document.querySelector('#chapter-prev').disabled = state.chapter === 0;
    const last = state.chapter === sections.length - 1;
    document.querySelector('#chapter-next').textContent = last ? '합류 기록 보기' : '다음 장면';
    document.querySelector('#chapter-next').disabled = last ? !characterComplete() : !sectionComplete(section);
    document.querySelector('#chapter-hint').textContent = last
      ? (characterComplete() ? '첫 출근을 앞둔 당신의 기록이 준비되었습니다.' : '모든 장면을 선택하고 구성점을 확인해 주세요.')
      : (sectionComplete(section) ? '선택은 나중에 바꿀 수 있습니다.' : `이 장면에서 ${section.min}개를 선택해 주세요.`);
  }

  document.querySelector('#chapter-prev').addEventListener('click', () => goToChapter(state.chapter - 1));
  document.querySelector('#chapter-next').addEventListener('click', () => {
    if (state.chapter < sections.length - 1) goToChapter(state.chapter + 1);
    else {
      const result = document.querySelector('#result-title');
      result.setAttribute('tabindex', '-1');
      result.focus({ preventScroll: true });
      result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  [els.name, els.codename, els.age].forEach(input => {
    input.addEventListener("input", syncIdentity);
  });
  document.querySelector("#reset-top").addEventListener("click", resetAll);
  document.querySelector("#reset-side").addEventListener("click", resetAll);
  document.querySelector("#copy-report").addEventListener("click", copyReport);

  restore();
  render();
})();
