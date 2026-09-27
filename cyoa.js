(() => {
  "use strict";

  const STORAGE_KEY = "laika-team01-cyoa-v2";
  const LEGACY_KEY = "laika-standalone-cyoa-v1";
  const BASE_POINTS = 8;

  const sections = window.CYOA_DATA;
  document.querySelector('#chapter-total').textContent = String(sections.length);
  document.querySelector('#choice-total').textContent = String(sections.reduce((count, section) => count + section.choices.length, 0));

  const choiceMap = new Map();
  sections.forEach(section => {
    section.choices.forEach(choice => {
      choice.sectionId = section.id;
      choiceMap.set(choice.id, choice);
    });
  });

  const state = { selected: new Set(), chapter: 0 };

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
    miniProfile: document.querySelector("#mini-profile"),
    resultState: document.querySelector("#result-state"),
    resultSummary: document.querySelector("#result-summary"),
    resultRecords: document.querySelector("#result-records"),
    resultNotes: document.querySelector("#result-notes"),
    sheetSubject: document.querySelector("#sheet-subject"),
    sheetProfile: document.querySelector("#sheet-profile"),
    copy: document.querySelector("#copy-report")
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
    return !choice.requiresAll || choice.requiresAll.every(isSelected);
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

  function renderProfile() {
    const age = firstTitle('age') || '나이 미선택';
    const gender = firstTitle('gender') || '성별 미선택';
    els.miniProfile.innerHTML = '<strong>조사 1팀의 새로운 동료</strong><span>' + escapeHtml(age + ' · ' + gender) + '</span>';
    els.sheetSubject.textContent = '당신의 합류 기록';
    els.sheetProfile.textContent = age + ' · ' + gender;
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
    const principle = selectedInSection('principle')[0];
    return [
      `합류 당시의 나이대는 ${firstTitle('age')}, 성별 항목은 ‘${firstTitle('gender')}’로 남겼다. 삶의 배경으로 고른 것은 ‘${firstTitle('background')}’. 조사 1팀에 오기 전에는 ${firstTitle('career')} 일을 했다.`,
      `일상을 바꾼 것은 ‘${firstTitle('incident')}’ 사건이었다. 힘의 기원은 ${firstTitle('origin')}. 당시의 행동에서는 ${titles('traits').join(', ')} 같은 태도가 드러났다. 팀에는 ${titles('mystery').join(', ')} 능력을 활용할 수 있다고 알렸다.`,
      contact.body,
      reason.body,
      `함께 일하며 지킬 약속은 ‘${firstTitle('principle')}’. ${principle.body}`,
      `합류를 결정한 뒤 ${titles('equipment').join(', ')} 장비를 챙겼다. 동료들에게는 ‘${firstTitle('price')}’라는 대가도 알렸다. 힘의 한계를 숨기지 않는 것이 함께 일하기 위한 첫 약속이었다.`,
      '첫 출근 날, 당신은 ERAC 조사 1팀의 문을 열었다. 팀장 라이카와 함께할 조사는 이제부터다.'
    ].join('\n\n');
  }

  function renderResult() {
    renderProfile();

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
      `나이: ${firstTitle('age') || '미선택'}`,
      `성별: ${firstTitle('gender') || '미선택'}`,
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

      sanitizeSelections();
      const missingNewChapters = ['age', 'gender', 'background', 'principle'].filter(id => !selectedInSection(id).length);
      if (state.selected.size && (legacySave || missingNewChapters.length)) {
        const notice = document.querySelector('#migration-notice');
        notice.hidden = false;
        notice.textContent = '저장된 선택을 불러왔습니다. 나이·성별·살아온 자리·팀에서 지킬 약속 등 비어 있는 장면을 이어서 선택해 주세요.';
      }
    } catch {
      state.selected.clear();
    }
  }

  function resetAll() {
    state.selected.clear();
    try {
      localStorage.setItem(STORAGE_KEY, "[]");
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
      age: '아직 쓰이지 않은 합류 기록의 첫 장을 펼칩니다. 당신이 이 문 앞에 오기까지 얼마나 많은 계절이 지나갔을까요? 처음 배우는 일이 많을 수도, 오래 해 온 일을 다른 방식으로 이어갈 수도 있습니다. 지금의 나이대를 선택하십시오.',
      gender: '당신을 기록하는 몇 개의 항목이 당신 전체를 설명할 수는 없습니다. 성별은 능력이나 성격을 미리 정하는 조건이 아닙니다. 원하는 항목을 고르고 다음 장면에서 당신만의 배경을 이어 갑니다.',
      background: '당신에게 익숙한 풍경을 떠올립니다. 매일 듣던 소리와 자주 만나던 사람, 어디서나 먼저 확인하게 되는 것들은 살아온 장소에서 배웠을지 모릅니다. 구체적인 국적을 정하기보다 그 생활의 모양을 하나 고릅니다.',
      principle: '팀에 들어가겠다는 대답만으로 함께 일하는 방법까지 정해지지는 않습니다. 의견이 갈리거나 위험이 커졌을 때 무엇을 기준으로 말할지 생각합니다. 완벽히 지킬 수 있다는 장담보다, 흔들릴 때 동료와 다시 확인할 약속을 남깁니다.',
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
    document.querySelector('#scene-number').textContent = `CHAPTER ${section.number} / ${String(sections.length).padStart(2, "0")}`;
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

  document.querySelector("#reset-top").addEventListener("click", resetAll);
  document.querySelector("#reset-side").addEventListener("click", resetAll);
  document.querySelector("#copy-report").addEventListener("click", copyReport);

  restore();
  render();
})();
