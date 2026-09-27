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
    copy: document.querySelector("#copy-report"),
    copyResult: document.querySelector("#copy-result")
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
      return `이 장면에서는 최대 ${section.max}개까지 선택할 수 있습니다.`;
    }

    const excluded = refundableIds(section, choice);
    const spent = pointsSpent(excluded) + (choice.cost || 0);
    const available = BASE_POINTS + projectedRefund(section, choice);
    if (spent > available) {
      return "구성점이 부족합니다. 마지막 장면에서 대가를 선택하면 구성점이 추가됩니다.";
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
      els.status.textContent = "구성점이 부족합니다. 능력·장비 선택을 줄이거나 대가를 조정해 주세요.";
    } else if (next) {
      const currentCount = selectedInSection(next.id).length;
      const need = Math.max(0, (next.min || 0) - currentCount);
      els.status.textContent = need > 1
        ? `${next.title}: ${need}개를 더 선택해 주세요.`
        : `${next.title}: 선택을 완료해 주세요.`;
    } else {
      els.status.textContent = "모든 선택을 마쳤습니다. 아래에서 합류 기록을 확인하세요.";
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
    const chosen = id => selectedInSection(id)[0];
    const quoted = id => titles(id).map(title => `‘${title}’`).join(', ');
    const lastEquipment = titles('equipment').at(-1);
    const equipmentParticle = (lastEquipment.charCodeAt(lastEquipment.length - 1) - 0xAC00) % 28 === 0 ? '를' : '을';
    const contact = selectedInSection('companion')[0];
    const reason = selectedInSection('relationship')[0];
    const principle = selectedInSection('principle')[0];
    return [
      `${chosen('background').summary} ${chosen('career').summary}`,
      chosen('incident').summary,
      chosen('origin').summary,
      contact.body,
      `조사 1팀은 ${quoted('traits')} 같은 태도와 ${quoted('mystery')} 능력에 주목했다. 당신은 할 수 있는 일과 동료의 도움이 필요한 지점을 함께 설명했다.`,
      reason.body,
      principle.body,
      `동료들에게 힘을 쓴 뒤 겪는 어려움도 미리 알렸다. ${chosen('price').body.split('\n\n')[0]}`,
      `ID 카드를 수령할 때 전용 보급품으로 ${quoted('equipment')}${equipmentParticle} 골랐다. 지급받은 물품과 사용 안내를 확인한 뒤 조사 1팀으로 향했다.`,
      '첫 출근 날, 당신은 ERAC 조사 1팀의 문을 열었다.'
    ].join('\n\n');
  }

  function renderResult() {
    renderProfile();
    if (els.copyResult) els.copyResult.disabled = !characterComplete();

    if (!characterComplete()) {
      els.resultState.textContent = "작성 중";
      els.resultState.classList.remove("result-state-ready");
      els.resultSummary.textContent = "모든 장면을 선택하면 첫 출근까지의 기록이 여기에 표시됩니다.";
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
      "소속: 황실 이상현상 연구청 · 조사 1팀 / 본부: 런던 / 팀장: 라이카."
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
      "소속: 황실 이상현상 연구청 · 조사 1팀",
      "본부: 런던 / 팀장: 라이카",
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

    return lines.join("\n").trimEnd();
  }

  async function copyReport() {
    const text = buildReportText();
    try {
      await navigator.clipboard.writeText(text);
      els.copy.textContent = "복사됨";
      if (els.copyResult) els.copyResult.textContent = "복사됨 · 프로필 사진과 함께 제출하세요";
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
      if (els.copyResult) els.copyResult.textContent = "복사됨 · 프로필 사진과 함께 제출하세요";
    }
    window.setTimeout(() => {
      els.copy.textContent = "합류 기록 복사";
      if (els.copyResult) els.copyResult.textContent = "완성된 합류 기록 복사";
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
      const needsGenderUpdate = Array.isArray(saved) && saved.some(id => ['gender_nonbinary', 'gender_unspecified'].includes(id));
      if (Array.isArray(saved)) {
        saved.filter(id => choiceMap.has(id)).forEach(id => state.selected.add(id));
      }

      sanitizeSelections();
      const missingNewChapters = ['age', 'gender', 'background', 'principle'].filter(id => !selectedInSection(id).length);
      if (needsGenderUpdate || (state.selected.size && (legacySave || missingNewChapters.length))) {
        const notice = document.querySelector('#migration-notice');
        notice.hidden = false;
        notice.textContent = needsGenderUpdate
          ? '성별 선택이 여성·남성 두 항목으로 변경되었습니다. 나머지 저장된 선택은 불러왔습니다. 성별을 다시 고르고 비어 있는 장면이 있다면 이어서 작성해 주세요.'
          : '저장된 선택을 불러왔습니다. 비어 있는 장면을 이어서 선택해 주세요.';
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
    if (characterComplete()) document.querySelector('#migration-notice').hidden = true;
    renderSections();
    renderStatus();
    renderSummary();
    renderResult();
    renderChapter();
  }

  function sceneText(id) {
    const scenes = {
      age: '조사 1팀에 합류하는 날, 당신은 몇 살인가요? 나이에 따라 경력이나 능력이 정해지지는 않습니다.',
      gender: '합류 기록에 남길 성별을 고릅니다. 여성과 남성 중 하나를 선택해 주세요.',
      background: '어떤 곳에서 살아왔나요? 오래 머물렀거나 지금의 당신에게 큰 영향을 준 환경을 골라 보세요.',
      principle: '현장에서는 동료와 의견이 다를 수도 있습니다. 그때도 지키고 싶은 원칙은 무엇인가요?',
      career: '연구청에 오기 전에는 어떤 일을 했나요? 그때 익힌 기술과 일하는 방식도 조사 1팀에 가져옵니다.',
      incident: '이상현상은 어떻게 당신의 일상에 들어왔나요? 연구청과 얽히게 된 사건을 골라 보세요.',
      origin: '당신의 힘은 어디에서 왔나요? 사건 이전부터 지녔을 수도, 그날 처음 드러났을 수도 있습니다.',
      traits: '사건을 겪는 동안 당신은 무엇을 보고 어떻게 행동했나요? 그때 드러난 성향을 두 가지 골라 보세요.',
      mystery: '조사 1팀은 당신의 힘이 현장에서 어디에 쓰일지 알고 싶어 합니다. 능력과 그 한계를 함께 살펴보고 골라 보세요.',
      companion: '조사 1팀과는 어디서 처음 만나거나 연락을 주고받았나요? 그 경위를 골라 보세요.',
      relationship: '조사 1팀에서 함께 일하자는 제안을 받았습니다. 당신이 받아들인 이유는 무엇인가요?',
      equipment: '연구청에 처음 출근한 날입니다. ID 카드를 수령하고, 앞으로 조사에 사용할 전용 보급품을 고릅니다. 자신의 능력과 조사 방식에 맞는 물품을 선택해 주세요.',
      price: '힘을 쓴 뒤 겪는 어려움도 동료에게 알려야 합니다. 당신이 감당하는 대가를 골라 보세요.'
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

  function renderWorldGuide(sectionId) {
    const world = window.CYOA_WORLD;
    // During a Pages cache refresh, an older HTML document may load this script.
    if (!world || !document.querySelector('#world-guide-details')) return;
    const guide = world.chapters[sectionId];
    const termMarkup = id => {
      const term = world.terms[id];
      return `<div class="guide-term"><dt>${escapeHtml(term.title)}</dt><dd><p>${escapeHtml(term.text)}</p><p class="guide-example">${escapeHtml(term.example)}</p>${term.notice ? `<p class="guide-submission">${escapeHtml(term.notice)}</p>` : ''}</dd></div>`;
    };
    document.querySelector('#world-guide-title').textContent = guide.title;
    document.querySelector('#world-guide-intro').textContent = guide.intro;
    const terms = document.querySelector('#world-guide-terms');
    terms.innerHTML = guide.terms.map(termMarkup).join('');
    terms.hidden = !guide.terms.length;
    const glossary = document.querySelector('#world-glossary');
    if (!glossary.children.length) glossary.innerHTML = Object.keys(world.terms).map(termMarkup).join('');
  }

  function renderChapter() {
    const section = sections[state.chapter];
    renderWorldGuide(section.id);
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
      ? (characterComplete() ? '완성된 합류 기록을 확인해 주세요.' : '모든 장면을 선택하고 구성점을 확인해 주세요.')
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
  if (els.copyResult) els.copyResult.addEventListener("click", copyReport);

  restore();
  render();
})();
