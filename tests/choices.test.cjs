const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const dataSource = fs.readFileSync(path.join(root, 'cyoa-data.js'), 'utf8');
const engine = fs.readFileSync(path.join(root, 'cyoa.js'), 'utf8');
// Expose the actual model in a test-only VM; production code remains a private closure.
const exposed = engine.replace(/  restore\(\);\s+render\(\);\s*\}\)\(\);\s*$/, '  window.model = {sections, state, restore, sanitizeSelections, characterComplete, pointsRemaining, buildReportText, disabledReason};\n})();');
assert.notEqual(exposed, engine);
function load(saved = {}) {
  const elements = new Map();
  const ctx = vm.createContext({window:{},localStorage:{getItem:k=>saved[k]??null},document:{querySelector:s=>{
    if(!elements.has(s)) elements.set(s,{addEventListener(){},hidden:true,textContent:''});
    return elements.get(s);
  }}});
  vm.runInContext(dataSource,ctx);
  vm.runInContext(exposed,ctx);
  return {model:ctx.window.model,elements};
}
const {model:m} = load();
const all=m.sections.flatMap(s=>s.choices);
assert.deepEqual(Array.from(m.sections.find(s=>s.id==='gender').choices,c=>c.id),['gender_woman','gender_man']);
const ids = new Set(all.map(c=>c.id));
assert.equal(ids.size,all.length,'Choice IDs must be unique for saved selections');
for(const section of m.sections) {
  assert.ok(section.choices.length>=section.min);
  for(const c of section.choices) {
    assert.ok(c.body.includes('\n\n'),c.id+' must display distinct paragraphs');
    for(const requirement of [...(c.requiresAll||[]),...(c.requiresAny||[])]) assert.ok(ids.has(requirement),'Missing prerequisite '+requirement);
  }
}
const base=['background_city','career_engineer','incident_rescued','reaction_record','origin_contract','trait_observer','trait_honesty','friction_solo','mystery_resonance','contact_laika','terms_risk','join_trust','principle_share','gear_recorder','price_contract'];
for(const age of m.sections.find(s=>s.id==='age').choices) for(const gender of m.sections.find(s=>s.id==='gender').choices) {
  m.state.selected.clear();
  [...base,age.id,gender.id].forEach(id=>m.state.selected.add(id));
  assert.equal(m.characterComplete(),true,'Every age and gender can finish the same build');
  assert.equal(m.pointsRemaining(),4,'Demographics do not alter the budget');
  assert.ok(m.buildReportText().includes(age.title));
  assert.ok(m.buildReportText().includes(gender.title));
}
m.state.selected.delete('contact_laika');m.state.selected.add('contact_tip');m.sanitizeSelections();
assert.equal(m.state.selected.has('join_trust'),false,'Changing the first meeting removes the dependent motive');
assert.equal(m.characterComplete(),false);
const old=['career_detective','incident_rescued','origin_contract','trait_observer','trait_empathy','mystery_perception','contact_laika','join_trust','gear_notebook','price_contract'];
const {model:restored,elements} = load({'laika-team01-cyoa-v2':JSON.stringify([...old,'unknown-id']),'laika-standalone-identity-v1':JSON.stringify({name:'STALE_PRIVATE_NAME',codename:'STALE_CODE',age:27})});
restored.restore();
assert.equal(restored.state.selected.size,old.length,'Existing choices survive and unknown IDs are ignored');
assert.equal(restored.characterComplete(),false,'An old completed story needs the newly added chapters');
assert.equal(elements.get('#migration-notice').hidden,false);
assert.doesNotMatch(restored.buildReportText(),/STALE_PRIVATE_NAME|STALE_CODE|이름:|코드네임:/);
const {model:empty} = load({'laika-team01-cyoa-v2':'[]','laika-standalone-cyoa-v1':JSON.stringify(old)});
empty.restore();assert.equal(empty.state.selected.size,0,'Reset must not resurrect a legacy save');
const previousComplete = [...base.filter(id=>!['reaction_record','friction_solo','terms_risk'].includes(id)),'age_young','gender_woman'];
const {model:expandedSave,elements:expandedUi} = load({'laika-team01-cyoa-v2':JSON.stringify(previousComplete)});
expandedSave.restore();
assert.equal(expandedSave.state.selected.size,previousComplete.length,'The prior completed build keeps every old choice');
assert.equal(expandedSave.characterComplete(),false,'New story scenes require explicit choices');
assert.match(expandedUi.get('#migration-notice').textContent,/비어 있는 장면/);
expandedSave.state.selected.add('reaction_record');
expandedSave.state.selected.add('friction_solo');
expandedSave.state.selected.add('terms_risk');
assert.equal(expandedSave.characterComplete(),true,'Choosing the two new scenes completes the preserved build');
assert.ok(expandedSave.buildReportText().endsWith('첫 출근 날, 당신은 ERAC 조사 1팀의 문을 열었다.'));

m.state.selected = new Set([...base,'age_young','gender_woman'].filter(id=>id!=='reaction_record'));
m.state.selected.add('reaction_evacuate');
m.state.selected.delete('incident_rescued');
m.state.selected.add('incident_dream');
m.sanitizeSelections();
assert.equal(m.state.selected.has('reaction_evacuate'),false,'Changing to a nonphysical incident clears an incompatible response');
assert.equal(m.characterComplete(),false,'The response must be chosen again after the incident changes');
console.log('PASS: choice references, all 12 age/gender builds, budget, conditional routes, legacy saves, and removed identity fields.');

// Each prose branch must produce a complete story, including less common backgrounds.
const {model:story} = load();
const storyBase = [...base.filter(id=>id!=='price_contract'),'price_sense','age_thirties','gender_woman'];
for (const section of story.sections.filter(s=>['background','career','incident','reaction','origin','friction','terms'].includes(s.id))) {
  for (const option of section.choices) {
    story.state.selected = new Set(storyBase.filter(id=>!section.choices.some(c=>c.id===id)));
    story.state.selected.add(option.id);
    if (option.requiresAny && !option.requiresAny.some(id=>story.state.selected.has(id))) {
      const required = option.requiresAny[0];
      const requiredSection = story.sections.find(s=>s.choices.some(c=>c.id===required));
      requiredSection.choices.forEach(c=>story.state.selected.delete(c.id));
      story.state.selected.add(required);
    }
    assert.equal(story.disabledReason(option,section),'',option.id+' has a valid story prerequisite');
    assert.equal(story.characterComplete(),true,option.id+' can complete a narrative');
    const report = story.buildReportText();
    assert.ok(option.summary && report.includes(option.summary),option.id+' has narrative prose');
    assert.doesNotMatch(report,/undefined|&#x20;|함께할 조사는 이제부터다|성별 항목은/);
    assert.ok(report.endsWith('첫 출근 날, 당신은 ERAC 조사 1팀의 문을 열었다.'));
    assert.ok(report.includes('ID 카드를 수령할 때 전용 보급품으로'));
  }
}
const guideContext = {window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'world-guide.js'),'utf8'),guideContext);
const guide = guideContext.window.CYOA_WORLD;
for (const section of story.sections) {
  assert.ok(guide.chapters[section.id]?.intro,section.id+' has beginner guidance');
  for (const id of guide.chapters[section.id].terms) assert.ok(guide.terms[id]?.text && guide.terms[id]?.example,'Missing glossary explanation: '+id);
}
console.log('PASS: all narrative branches and glossary coverage for 16 chapters.');

for (const retired of ['gender_nonbinary','gender_unspecified']) {
  const savedChoices = [...storyBase.filter(id=>id!=='gender_woman'),retired];
  const {model:upgraded,elements:ui} = load({'laika-team01-cyoa-v2':JSON.stringify(savedChoices)});
  upgraded.restore();
  assert.equal(upgraded.state.selected.size,savedChoices.length-1,'Only the retired gender selection is removed');
  assert.equal(upgraded.characterComplete(),false,'Retired gender needs an explicit new selection');
  assert.match(ui.get('#migration-notice').textContent,/성별.*여성·남성/);
  assert.ok(upgraded.state.selected.has('career_engineer'));
  upgraded.state.selected.add('gender_man');
  assert.equal(upgraded.characterComplete(),true);
}

// Every choice must fit at least one valid build, including the new abilities and costs.
const {model:coverage} = load();
const defaults = [...storyBase.filter(id=>!['join_trust','price_sense'].includes(id)),'join_answer','price_memory'];
for (const section of coverage.sections) for (const choice of section.choices) {
  coverage.state.selected = new Set(defaults.filter(id=>!section.choices.some(c=>c.id===id)));
  coverage.state.selected.add(choice.id);
  if (section.min > 1) coverage.state.selected.add(section.choices.find(c=>c.id!==choice.id).id);
  const needed = [...(choice.requiresAll || [])];
  if (choice.requiresAny && !choice.requiresAny.some(id=>coverage.state.selected.has(id))) needed.push(choice.requiresAny[0]);
  for (const req of needed) {
    const reqSection = coverage.sections.find(s=>s.choices.some(c=>c.id===req));
    if (reqSection.mode==='single') reqSection.choices.forEach(c=>coverage.state.selected.delete(c.id));
    coverage.state.selected.add(req);
  }
  assert.equal(coverage.disabledReason(choice,section),'');
  assert.equal(coverage.characterComplete(),true,choice.id+' completes within budget');
  const report=coverage.buildReportText();
  assert.ok(report.includes(choice.title));
  assert.doesNotMatch(report,/undefined|&#x20;/);
  assert.ok(report.includes('본부: 런던'));
}
assert.equal(all.length,181);
console.log('PASS: all 181 choices can complete; retired gender saves retain other selections.');
