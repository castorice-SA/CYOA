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
const ids = new Set(all.map(c=>c.id));
assert.equal(ids.size,all.length,'Choice IDs must be unique for saved selections');
for(const section of m.sections) {
  assert.ok(section.choices.length>=section.min);
  for(const c of section.choices) {
    assert.ok(c.body.includes('\n\n'),c.id+' must display distinct paragraphs');
    for(const requirement of c.requiresAll||[]) assert.ok(ids.has(requirement),'Missing prerequisite '+requirement);
  }
}
const base=['background_city','career_engineer','incident_rescued','origin_contract','trait_observer','trait_honesty','mystery_resonance','contact_laika','join_trust','principle_share','gear_recorder','price_contract'];
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
console.log('PASS: choice references, all 24 age/gender builds, budget, conditional routes, legacy saves, and removed identity fields.');

// Each prose branch must produce a complete story, including less common backgrounds.
const {model:story} = load();
const storyBase = [...base.filter(id=>id!=='price_contract'),'price_sense','age_thirties','gender_unspecified'];
for (const section of story.sections.filter(s=>['background','career','incident','origin'].includes(s.id))) {
  for (const option of section.choices) {
    story.state.selected = new Set(storyBase.filter(id=>!section.choices.some(c=>c.id===id)));
    story.state.selected.add(option.id);
    assert.equal(story.characterComplete(),true,option.id+' can complete a narrative');
    const report = story.buildReportText();
    assert.ok(option.summary && report.includes(option.summary),option.id+' has narrative prose');
    assert.doesNotMatch(report,/undefined|&#x20;|함께할 조사는 이제부터다|성별 항목은/);
    assert.ok(report.includes('이제 라이카와 동료들 곁에서 첫 조사를 시작할 차례다.'));
  }
}
const guideContext = {window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'world-guide.js'),'utf8'),guideContext);
const guide = guideContext.window.CYOA_WORLD;
for (const section of story.sections) {
  assert.ok(guide.chapters[section.id]?.intro,section.id+' has beginner guidance');
  for (const id of guide.chapters[section.id].terms) assert.ok(guide.terms[id]?.text && guide.terms[id]?.example,'Missing glossary explanation: '+id);
}
console.log('PASS: all 33 narrative branches and glossary coverage for 13 chapters.');
