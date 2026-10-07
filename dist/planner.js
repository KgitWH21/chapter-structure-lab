'use strict';

const TREATMENT_LANES = [
  { name: 'Straightforward', level: 'grounded' },
  { name: 'Unexpected', level: 'exploratory' },
  { name: 'Experimental', level: 'wild' }
];
const planner = {
  notes: { happens: '', changes: '', reader: '' },
  candidates: [],
  selected: null,
  context: '',
  nextId: 1,
  pending: null
};

function optionById(options, id) {
  return options.find(option => option.id === id);
}

function pick(items, avoid = []) {
  const fresh = items.filter(item => !avoid.includes(item.id));
  const pool = fresh.length ? fresh : items;
  return pool[Math.floor(Math.random() * pool.length)];
}

function plannerContext() {
  return JSON.stringify([
    state.usePurpose, state.usePurpose ? state.purpose : null, state.focus,
    state.lockOpening, state.lockOpening ? state.opening : null,
    state.lockStructure, state.lockStructure ? state.structure : null
  ]);
}

function buildCandidate(lane, index, earlier = []) {
  const previous = planner.candidates[index];
  let opening = null;
  let structure = null;
  let pairing = '';
  const kept = [];
  if (state.focus !== 'structure') {
    const openings = CATALOG.openings.filter(o => lane.level !== 'grounded' || groundedOpenings.includes(o.id));
    opening = state.lockOpening ? current().opening : pick(openings, [previous?.opening?.id, ...earlier.map(c => c.opening?.id)]);
    if (state.lockOpening) kept.push('opening');
  }
  if (state.focus !== 'opening') {
    const structures = CATALOG.structures.filter(s => s.level === lane.level);
    const mapped = state.usePurpose ? structures.filter(s => purpose().structures.includes(s.id)) : structures;
    structure = state.lockStructure ? current().structure : pick(mapped.length ? mapped : structures, [previous?.structure?.id]);
    if (state.lockStructure) kept.push('structure');
    if (state.usePurpose && !purpose().structures.includes(structure.id)) {
      pairing = state.lockStructure
        ? 'Free pairing · locked structure is not mapped to this purpose.'
        : `Free pairing · no mapped ${lane.name.toLowerCase()} form.`;
    }
  }
  const order = previous ? pick(INFORMATION_ORDERS, [previous.order]).id : 'blueprint';
  const ending = previous ? pick(CHAPTER_ENDINGS, [previous.ending]).id : ['decision', 'revelation', 'image'][index];
  return {
    id: planner.nextId++, label: lane.name, opening, structure,
    purpose: state.usePurpose ? purpose() : null, focus: state.focus,
    order, ending, pairing, kept
  };
}

function generateCandidates(announce = false) {
  const candidates = [];
  TREATMENT_LANES.forEach((lane, index) => candidates.push(buildCandidate(lane, index, candidates)));
  planner.candidates = candidates;
  planner.context = plannerContext();
  candidates.forEach(renderCandidate);
  updatePlanSummary();
  if (announce) notify('Three new options. Your chapter notes and selected plan are kept.');
}

function fillOptions(select, options) {
  select.innerHTML = options.map(option => `<option value="${option.id}">${esc(option.name)}</option>`).join('');
}

function createCandidateCard(lane, index) {
  const card = document.createElement('article');
  card.className = 'treatment';
  card.id = `treatment-${index}`;
  card.setAttribute('aria-labelledby', `treatment-title-${index}`);
  card.innerHTML = `
    <div class="treatment-heading"><span class="section-label">0${index + 1}</span><h3 id="treatment-title-${index}">${lane.name}</h3></div>
    <dl class="treatment-facts" id="treatment-facts-${index}"></dl>
    <p class="pairing-note" id="treatment-pairing-${index}" hidden></p>
    <p class="lock-note" id="treatment-locks-${index}" hidden></p>
    <button class="use-treatment secondary" id="use-treatment-${index}">Use this</button>
    <details id="treatment-details-${index}">
      <summary>Details<span class="sr-only"> for ${lane.name.toLowerCase()} treatment</span></summary>
      <div id="treatment-guidance-${index}" class="reading-guide"></div>
      <div class="treatment-choices">
        <label>Information order<select id="treatment-order-${index}"></select></label>
        <p class="help" id="treatment-order-guide-${index}"></p>
        <label>Ending<select id="treatment-ending-${index}"></select></label>
        <p class="help" id="treatment-ending-guide-${index}"></p>
      </div>
      <p class="help">Order and ending are choices to try. Adapt your beats if they differ from the blueprint’s sequence or resolution.</p>
      <details id="treatment-beats-${index}"><summary>Original beat preview</summary><ol id="treatment-beat-list-${index}"></ol></details>
      <details id="treatment-examples-${index}"><summary>Examples &amp; exercise rule</summary><div id="treatment-example-text-${index}"></div></details>
      <div class="borrow-actions"><button id="borrow-opening-${index}" class="small">Use opening in plan</button><button id="borrow-structure-${index}" class="small">Use structure in plan</button></div>
    </details>`;
  $('treatments').appendChild(card);
  fillOptions($(`treatment-order-${index}`), INFORMATION_ORDERS);
  fillOptions($(`treatment-ending-${index}`), CHAPTER_ENDINGS);
  for (const [key, options] of [['order', INFORMATION_ORDERS], ['ending', CHAPTER_ENDINGS]]) {
    $(`treatment-${key}-${index}`).onchange = event => {
      if (!optionById(options, event.target.value)) return;
      const candidate = planner.candidates[index];
      candidate[key] = event.target.value;
      // A changed option is a new candidate; never silently mutate the selected plan.
      candidate.id = planner.nextId++;
      renderCandidate(candidate, index);
    };
  }
  $(`use-treatment-${index}`).onclick = () => requestPlan(planner.candidates[index]);
  for (const part of ['opening', 'structure']) {
    $(`borrow-${part}-${index}`).onclick = () => requestPart(part, planner.candidates[index]);
  }
}

function renderCandidate(candidate, index) {
  const { opening, structure } = candidate;
  const facts = [];
  if (opening) facts.push(['Opening', opening.name]);
  if (structure) facts.push(['Structure', structure.name]);
  facts.push(['Information order', optionById(INFORMATION_ORDERS, candidate.order).name]);
  facts.push(['Ending', optionById(CHAPTER_ENDINGS, candidate.ending).name]);
  $(`treatment-facts-${index}`).innerHTML = facts.map(([name, value]) => `<div><dt>${name}</dt><dd>${esc(value)}</dd></div>`).join('');
  $(`treatment-pairing-${index}`).textContent = candidate.pairing;
  $(`treatment-pairing-${index}`).hidden = !candidate.pairing;
  $(`treatment-locks-${index}`).textContent = candidate.kept.length ? `Locked ${candidate.kept.join(' and ')} kept across treatments.` : '';
  $(`treatment-locks-${index}`).hidden = !candidate.kept.length;
  const selected = planner.selected?.candidateId === candidate.id;
  $(`use-treatment-${index}`).textContent = selected ? 'Selected' : 'Use this';
  $(`use-treatment-${index}`).setAttribute('aria-pressed', String(selected));
  for (const part of ['opening', 'structure']) {
    $(`borrow-${part}-${index}`).hidden = !candidate[part];
    $(`borrow-${part}-${index}`).disabled = !planner.selected?.[part];
  }
  const guidance = structure ? STRUCTURE_GUIDANCE[structure.id] || TREATMENT_GUIDANCE[structure.category] : null;
  $(`treatment-guidance-${index}`).innerHTML = guidance
    ? `<p class="help">${STRUCTURE_GUIDANCE[structure.id] ? 'Guidance for this exercise' : `Family guidance · ${esc(structure.category)}`}</p>
       <h4>Useful when</h4><p>${esc(guidance.useful)}</p><h4>Reader effect</h4><p>${esc(guidance.effect)}</p><h4>Watch out for</h4><p>${esc(guidance.caution)}</p>`
    : `<h4>The opening’s move</h4><p>${esc(opening.description)}</p><h4>Try it</h4><p>${esc(openingTask(opening))}</p><h4>Watch out for</h4><p>Give the reader a person, place, or concrete action to follow while the technique creates curiosity.</p>`;
  for (const [key, options] of [['order', INFORMATION_ORDERS], ['ending', CHAPTER_ENDINGS]]) {
    $(`treatment-${key}-${index}`).value = candidate[key];
    $(`treatment-${key}-guide-${index}`).textContent = optionById(options, candidate[key]).guide;
  }
  $(`treatment-beats-${index}`).hidden = !structure;
  $(`treatment-beat-list-${index}`).innerHTML = structure ? structure.beats.map(beat => `<li>${esc(beat.title)}</li>`).join('') : '';
  $(`treatment-example-text-${index}`).innerHTML =
    (opening ? `<h4>${esc(opening.name)}</h4><p>${esc(opening.example)}</p>` : '') +
    (structure ? `<h4>${esc(structure.name)}</h4><p>${esc(structure.rule)}</p><ol>${structure.beats.map(beat => `<li><strong>${esc(beat.title)}</strong><p>${esc(beat.example)}</p></li>`).join('')}</ol>` : '');
}

function notesText() {
  return [
    ['What happens', planner.notes.happens],
    ['What changes', planner.notes.changes],
    ['Reader feeling / question', planner.notes.reader]
  ].filter(([, value]) => value.trim()).map(([label, value]) => `${label}: ${value}`).join('\n');
}

function requestPlan(candidate) {
  if (planner.selected?.candidateId === candidate.id) {
    $('selectedPlan').open = true;
    $('selectedPlan').querySelector('summary').focus();
    return;
  }
  if (planner.selected?.dirty) {
    planner.pending = { kind: 'replace', candidate };
    $('replacePlanTitle').textContent = 'Replace your edited plan?';
    $('replacePlanMessage').textContent = 'Your chapter notes will stay. The current beat edits will be replaced.';
    $('replacePlanDialog').returnValue = '';
    $('replacePlanDialog').showModal();
    return;
  }
  selectPlan(candidate);
}

function requestPart(part, candidate) {
  const plan = planner.selected;
  if (!['opening', 'structure'].includes(part) || !plan?.[part] || !candidate[part]) return;
  if (plan[part].id === candidate[part].id) {
    notify(`Your plan already uses this ${part}.`);
    return;
  }
  if (part === 'structure' && plan.dirty) {
    planner.pending = { kind: 'structure', candidate };
    $('replacePlanTitle').textContent = 'Replace the beats in your plan?';
    $('replacePlanMessage').textContent = 'The new structure will replace your beat titles and scene notes. Your opening, chapter notes, purpose, order, and ending will stay.';
    $('replacePlanDialog').returnValue = '';
    $('replacePlanDialog').showModal();
    return;
  }
  applyPart(part, candidate);
}

function applyPart(part, candidate) {
  const plan = planner.selected;
  plan[part] = candidate[part];
  if (part === 'structure') {
    plan.beats = candidate.structure.beats.map(beat => ({ id: planner.nextId++, title: beat.title, notes: '' }));
    plan.pairing = plan.purpose && !plan.purpose.structures.includes(candidate.structure.id) ? 'Free pairing · structure is not mapped to this plan’s purpose.' : '';
  }
  plan.label = 'Custom combination';
  plan.candidateId = null;
  plan.dirty = true;
  renderPlan();
  planner.candidates.forEach(renderCandidate);
  notify(`Plan updated with this ${part}.`);
}

function selectPlan(candidate) {
  const beats = candidate.structure ? candidate.structure.beats : [{ title: 'Make the opening’s defining move' }];
  planner.selected = {
    candidateId: candidate.id,
    label: candidate.label,
    opening: candidate.opening,
    structure: candidate.structure,
    purpose: candidate.purpose,
    focus: candidate.focus,
    length: state.length,
    order: candidate.order,
    ending: candidate.ending,
    pairing: candidate.pairing,
    dirty: false,
    beats: beats.map(beat => ({ id: planner.nextId++, title: beat.title, notes: '' }))
  };
  // Keep the catalog controls aligned with the chosen treatment; the plan remains a snapshot.
  if (candidate.opening) state.opening = candidate.opening.id;
  if (candidate.structure) state.structure = candidate.structure.id;
  render();
  renderPlan();
  planner.candidates.forEach(renderCandidate);
  // Selecting is not a request to show more information. Keep the plan collapsed initially.
  $('selectedPlan').querySelector('summary').focus();
  notify('Treatment selected. Expand your selected plan to edit or export it.');
}

function writingTarget(plan) {
  return plan.length === 'outline' ? 'A beat outline' : plan.length === 'short' ? 'A short scene · 300–600 words' : 'A chapter · your own length';
}

function updatePlanSummary() {
  const plan = planner.selected;
  $('selectedPlan').hidden = !plan;
  if (!plan) return;
  $('planSummary').textContent = `${plan.structure?.name || plan.opening.name} · ${plan.beats.length} ${plan.beats.length === 1 ? 'beat' : 'beats'}${plan.dirty ? ' · Edited' : ''}`;
  $('planContext').textContent = plan.purpose?.id !== (state.usePurpose ? state.purpose : undefined) || plan.focus !== state.focus || plan.length !== state.length
    ? 'Comparison settings have changed. This selected plan keeps the purpose, practice scope, and length you chose with it.'
    : 'New options leave this plan intact.';
  $('planDescription').textContent = [plan.opening?.name, plan.structure?.name, writingTarget(plan), plan.purpose ? `Purpose: ${plan.purpose.name}` : 'Your own purpose'].filter(Boolean).join(' · ');
  $('planPairing').textContent = plan.pairing;
  $('planPairing').hidden = !plan.pairing;
  $('planOrderGuide').textContent = optionById(INFORMATION_ORDERS, plan.order).guide;
  $('planEndingGuide').textContent = optionById(CHAPTER_ENDINGS, plan.ending).guide;
}

function renderPlan() {
  const plan = planner.selected;
  updatePlanSummary();
  if (!plan) return;
  $('planOrder').value = plan.order;
  $('planEnding').value = plan.ending;
  $('planBeats').innerHTML = plan.beats.map((beat, index) => `
    <li data-beat="${beat.id}">
      <div class="beat-editor-top"><span class="section-label">Beat ${index + 1}</span><div class="beat-actions">
        <button data-action="up" ${index === 0 ? 'disabled' : ''} aria-label="Move beat ${index + 1} up">↑</button>
        <button data-action="down" ${index === plan.beats.length - 1 ? 'disabled' : ''} aria-label="Move beat ${index + 1} down">↓</button>
        <button data-action="remove" ${plan.beats.length === 1 ? 'disabled' : ''} aria-label="Remove beat ${index + 1}">Remove</button>
      </div></div>
      <label for="beat-title-${beat.id}">Beat title</label>
      <input id="beat-title-${beat.id}" data-field="title" value="${esc(beat.title)}">
      <label for="beat-notes-${beat.id}">Your scene notes</label>
      <textarea id="beat-notes-${beat.id}" data-field="notes" rows="2" placeholder="What happens here in your chapter?">${esc(beat.notes)}</textarea>
    </li>`).join('');
}

function editBeat(id, field, value) {
  const beat = planner.selected?.beats.find(beat => beat.id === id);
  if (!beat || !['title', 'notes'].includes(field)) return;
  beat[field] = value;
  planner.selected.dirty = true;
  updatePlanSummary();
}

function moveBeat(id, action) {
  const plan = planner.selected;
  if (!plan) return;
  const index = plan.beats.findIndex(beat => beat.id === id);
  if (index < 0) return;
  if (action === 'remove' && plan.beats.length > 1) {
    plan.beats.splice(index, 1);
  } else if (action === 'up' && index > 0) {
    [plan.beats[index - 1], plan.beats[index]] = [plan.beats[index], plan.beats[index - 1]];
  } else if (action === 'down' && index < plan.beats.length - 1) {
    [plan.beats[index + 1], plan.beats[index]] = [plan.beats[index], plan.beats[index + 1]];
  } else return;
  plan.dirty = true;
  renderPlan();
  const focusBeat = action === 'remove' ? plan.beats[Math.min(index, plan.beats.length - 1)] : plan.beats.find(beat => beat.id === id);
  $(`beat-title-${focusBeat.id}`).focus();
  notify(action === 'remove' ? 'Beat removed.' : 'Beat moved.');
}

function planText() {
  const plan = planner.selected;
  if (!plan) return '';
  const lines = ['CHAPTER STRUCTURE LAB — YOUR PLAN', '', notesText(), '', `Treatment: ${plan.label}`, `Write: ${writingTarget(plan)}`];
  if (plan.purpose) lines.push(`Scene purpose: ${plan.purpose.name}`, plan.purpose.goal);
  if (plan.opening) lines.push(`Opening: ${plan.opening.name}`, plan.opening.description);
  if (plan.structure) lines.push(`Structure inspiration: ${plan.structure.name}`, `Original exercise rule: ${plan.structure.rule}`);
  if (plan.pairing) lines.push(plan.pairing);
  const order = optionById(INFORMATION_ORDERS, plan.order);
  const ending = optionById(CHAPTER_ENDINGS, plan.ending);
  lines.push('', `Information order: ${order.name}`, order.guide, `Ending: ${ending.name}`, ending.guide,
    '', 'YOUR BEATS', 'This plan can depart from the original blueprint. Check that its sequence and ending work together.', '');
  plan.beats.forEach((beat, index) => lines.push(`${index + 1}. ${beat.title || 'Untitled beat'}`, beat.notes || '(Add your scene notes.)', ''));
  return lines.join('\n');
}

function renderPlanner() {
  $('comparisonPurpose').textContent = state.usePurpose ? purpose().name : 'Use your own purpose';
  $('comparisonScope').textContent = state.focus === 'opening' ? 'Opening only' : state.focus === 'structure' ? 'Structure only' : 'Opening + structure';
  if (planner.context !== plannerContext()) generateCandidates();
  updatePlanSummary();
}

TREATMENT_LANES.forEach(createCandidateCard);
fillOptions($('planOrder'), INFORMATION_ORDERS);
fillOptions($('planEnding'), CHAPTER_ENDINGS);
for (const [field, id] of [['happens', 'chapterHappens'], ['changes', 'chapterChanges'], ['reader', 'chapterReader']]) {
  $(id).oninput = event => {
    planner.notes[field] = event.target.value;
    const summary = planner.notes.happens.trim().replace(/\s+/g, ' ');
    $('chapterSummary').textContent = summary ? (summary.length > 90 ? `${summary.slice(0, 90)}…` : summary) : notesText() ? 'Notes added' : 'Add a few notes';
  };
}
$('compare').onclick = () => generateCandidates(true);
document.addEventListener('exercisechange', renderPlanner);
$('replacePlanDialog').addEventListener('close', () => {
  const pending = planner.pending;
  planner.pending = null;
  if ($('replacePlanDialog').returnValue === 'replace' && pending) {
    if (pending.kind === 'replace') selectPlan(pending.candidate);
    else applyPart('structure', pending.candidate);
  }
});
for (const [key, options] of [['order', INFORMATION_ORDERS], ['ending', CHAPTER_ENDINGS]]) {
  $(key === 'order' ? 'planOrder' : 'planEnding').onchange = event => {
    if (!planner.selected || !optionById(options, event.target.value)) return;
    planner.selected[key] = event.target.value;
    planner.selected.dirty = true;
    updatePlanSummary();
  };
}
$('planBeats').oninput = event => {
  const row = event.target.closest('[data-beat]');
  if (row) editBeat(Number(row.dataset.beat), event.target.dataset.field, event.target.value);
};
$('planBeats').onclick = event => {
  const button = event.target.closest('button[data-action]');
  if (button) moveBeat(Number(button.closest('[data-beat]').dataset.beat), button.dataset.action);
};
$('addBeat').onclick = () => {
  if (!planner.selected) return;
  const beat = { id: planner.nextId++, title: 'New beat', notes: '' };
  planner.selected.beats.push(beat);
  planner.selected.dirty = true;
  renderPlan();
  $(`beat-title-${beat.id}`).focus();
  $(`beat-title-${beat.id}`).select();
};
$('copyPlan').onclick = () => copyText(planText(), 'Chapter plan copied.');
$('downloadPlan').onclick = () => {
  if (!planner.selected) return;
  const url = URL.createObjectURL(new Blob([planText()], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'chapter-plan.txt';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
$('useExercise').onclick = () => {
  const { opening, structure } = current();
  requestPlan({
    id: planner.nextId++, label: 'Catalog combination',
    opening: state.focus === 'structure' ? null : opening,
    structure: state.focus === 'opening' ? null : structure,
    purpose: state.usePurpose ? purpose() : null, focus: state.focus,
    order: 'blueprint', ending: 'decision',
    pairing: state.focus !== 'opening' && state.usePurpose && !purpose().structures.includes(structure.id) ? 'Free pairing · structure is not mapped to this purpose.' : ''
  });
};
renderPlanner();
