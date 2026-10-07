const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');

// A deliberately small DOM fixture for state transitions and event wiring.
// This does not replace a real-browser check of layout, native dialogs, or clipboard permissions.
function loadApp() {
  const nodes = new Map();
  const downloads = [];
  let document;
  class Element {
    constructor(tag = 'div') {
      this.tagName = tag.toUpperCase();
      this.attributes = {};
      this.listeners = {};
      this.style = {};
      this.dataset = {};
      this.classList = { add() {}, remove() {}, toggle() {} };
      this.value = '';
      this.textContent = '';
      this.hidden = false;
      this.open = false;
      this.disabled = false;
      this.returnValue = '';
    }
    set id(value) { this._id = value; nodes.set(value, this); }
    get id() { return this._id; }
    set innerHTML(value) { this._html = value; registerMarkup(value); }
    get innerHTML() { return this._html || ''; }
    setAttribute(name, value) { this.attributes[name] = String(value); }
    getAttribute(name) { return this.attributes[name]; }
    appendChild() {}
    remove() {}
    select() {}
    focus() { document.activeElement = this; }
    click() {
      if (this.tagName === 'A' && this.download) downloads.push({ name: this.download, href: this.href });
      this.onclick?.({ target: this });
    }
    querySelector(selector) {
      assert.equal(selector, 'summary');
      return this.summary || (this.summary = new Element('summary'));
    }
    addEventListener(name, fn) { (this.listeners[name] ||= []).push(fn); }
    dispatchEvent(event) { for (const fn of this.listeners[event.type] || []) fn(event); }
    showModal() { this.open = true; }
    close(value = '') { this.returnValue = value; this.open = false; this.dispatchEvent({ type: 'close' }); }
  }
  function registerMarkup(markup) {
    for (const match of markup.matchAll(/<([a-z][a-z0-9]*)\b([^>]*)>/gi)) {
      const id = match[2].match(/\bid="([^"]+)"/);
      if (!id) continue;
      const element = new Element(match[1]);
      element.id = id[1];
      element.hidden = /\shidden(?:\s|$)/.test(match[2]);
      element.open = /\sopen(?:\s|$)/.test(match[2]);
    }
  }
  document = new Element('document');
  document.getElementById = id => {
    assert(nodes.has(id), `Missing DOM element: ${id}`);
    return nodes.get(id);
  };
  document.createElement = tag => new Element(tag);
  document.body = new Element('body');
  const workspace = new Element();
  document.querySelector = selector => {
    assert.equal(selector, '.workspace');
    return workspace;
  };
  registerMarkup(html);
  const clipboard = { text: '', reject: false, async writeText(text) { if (this.reject) throw new Error('Denied'); this.text = text; } };
  let seed = 37;
  const math = Object.create(Math);
  math.random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const context = vm.createContext({
    document, navigator: { clipboard }, Math: math, console, Event,
    setTimeout: () => 0, clearTimeout() {}, Blob, URL
  });
  for (const file of ['data.js', 'purposes.js', 'app.js', 'treatment-data.js', 'planner.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, 'dist', file), 'utf8'), context, { filename: file });
  }
  return {
    get: document.getElementById,
    run: code => vm.runInContext(code, context),
    read: code => JSON.parse(vm.runInContext(`JSON.stringify(${code})`, context)),
    clipboard,
    downloads
  };
}

test('initial view is compact and loads all three candidates without opening details', () => {
  const app = loadApp();
  assert.equal(app.read('planner.candidates.length'), 3);
  for (const id of ['chapterNotes', 'comparisonSettings', 'originalExercise', 'selectedPlan', 'treatment-details-0', 'treatment-details-1', 'treatment-details-2']) {
    assert.equal(app.get(id).open, false);
  }
  assert.equal(app.get('selectedPlan').hidden, true);
  assert.equal(/<details\b[^>]*\sopen(?:\s|>)/.test(html), false);
});

test('every purpose uses exact range matches when available, otherwise labels a free pairing', () => {
  const app = loadApp();
  const result = app.run(`(() => {
    let checked = 0;
    for (const p of PURPOSES) {
      state.purpose = p.id;
      generateCandidates();
      planner.candidates.forEach((candidate, i) => {
        const range = TREATMENT_LANES[i].level;
        const matches = CATALOG.structures.filter(s => s.level === range && p.structures.includes(s.id));
        if (candidate.structure.level !== range) throw new Error('Incorrect range');
        if (candidate.purpose.id !== p.id) throw new Error('Purpose changed');
        if (matches.length && !p.structures.includes(candidate.structure.id)) throw new Error('Missed mapped form');
        if (!matches.length && !candidate.pairing.startsWith('Free pairing')) throw new Error('Unlabeled mismatch');
        if (matches.length && candidate.pairing) throw new Error('False mismatch');
        checked++;
      });
    }
    return checked;
  })()`);
  assert.equal(result, 384);
});

test('all structures have reading guidance, and mappings and complete catalogs remain valid', () => {
  const app = loadApp();
  assert.deepEqual(app.read('[CATALOG.openings.length, CATALOG.structures.length, PURPOSES.length]'), [81, 101, 128]);
  assert.equal(app.run('CATALOG.structures.every(s => TREATMENT_GUIDANCE[s.category])'), true);
  assert.equal(app.run('PURPOSES.every(p => p.structures.every(id => CATALOG.structures.some(s => s.id === id)))'), true);
});

test('comparison respects every combination of locks and practice scopes', () => {
  const app = loadApp();
  assert.equal(app.run(`(() => {
    let checked = 0;
    for (const focus of ['both', 'opening', 'structure']) for (const usePurpose of [true, false]) for (let mask = 0; mask < 8; mask++) {
      Object.assign(state, { focus, usePurpose, purpose: 1, opening: 14, structure: 5, lockOpening: !!(mask & 1), lockStructure: !!(mask & 2), lockPurpose: !!(mask & 4) });
      const before = JSON.stringify(state);
      generateCandidates();
      if (JSON.stringify(state) !== before) throw new Error('Comparison mutated original state');
      for (const c of planner.candidates) {
        if ((c.opening === null) !== (focus === 'structure')) throw new Error('Opening scope');
        if ((c.structure === null) !== (focus === 'opening')) throw new Error('Structure scope');
        if (c.opening && state.lockOpening && c.opening.id !== 14) throw new Error('Opening lock');
        if (c.structure && state.lockStructure && c.structure.id !== 5) throw new Error('Structure lock');
        if ((c.purpose !== null) !== usePurpose) throw new Error('Purpose toggle');
      }
      checked++;
    }
    return checked;
  })()`), 48);
});

test('chapter notes and disclosure states survive rerolls and edits', () => {
  const app = loadApp();
  app.get('chapterHappens').oninput({ target: { value: 'She returns the keys.' } });
  app.get('chapterChanges').oninput({ target: { value: 'Her departure was expected.' } });
  app.get('chapterNotes').open = true;
  app.get('treatment-details-1').open = true;
  app.get('compare').click();
  app.get('treatment-ending-1').onchange({ target: { value: 'settling' } });
  assert.equal(app.get('chapterNotes').open, true);
  assert.equal(app.get('treatment-details-1').open, true);
  assert.equal(app.read('planner.notes.happens'), 'She returns the keys.');
  assert.equal(app.get('chapterSummary').textContent, 'She returns the keys.');
  assert.equal(app.read('planner.candidates[1].ending'), 'settling');
});

test('selecting a treatment keeps details closed and takes a separate snapshot', () => {
  const app = loadApp();
  app.get('use-treatment-0').click();
  assert.equal(app.get('selectedPlan').hidden, false);
  assert.equal(app.get('selectedPlan').open, false);
  const before = app.read('planner.selected');
  app.get('treatment-ending-0').onchange({ target: { value: 'settling' } });
  app.get('compare').click();
  assert.deepEqual(app.read('planner.selected'), before);
});

test('edited plans require explicit replacement, with cancel and Escape keeping changes', () => {
  const app = loadApp();
  app.get('use-treatment-0').click();
  app.run(`editBeat(planner.selected.beats[0].id, 'notes', 'She leaves the keys on the table.');`);
  const before = app.read('planner.selected');
  app.get('use-treatment-1').click();
  assert.equal(app.get('replacePlanDialog').open, true);
  assert.deepEqual(app.read('planner.selected'), before);
  app.get('replacePlanDialog').close('cancel');
  assert.deepEqual(app.read('planner.selected'), before);
  app.get('use-treatment-1').click();
  app.get('replacePlanDialog').close();
  assert.deepEqual(app.read('planner.selected'), before);
  app.get('use-treatment-1').click();
  app.get('replacePlanDialog').close('replace');
  assert.equal(app.read('planner.selected.label'), 'Unexpected');
  assert.equal(app.read('planner.selected.dirty'), false);
});

test('reordering retains notes and exports the actual edited sequence', () => {
  const app = loadApp();
  app.get('use-treatment-0').click();
  app.run(`
    editBeat(planner.selected.beats[0].id, 'title', 'The keys arrive');
    editBeat(planner.selected.beats[0].id, 'notes', 'He already cleared the drawer.');
    moveBeat(planner.selected.beats[0].id, 'down');
  `);
  assert.equal(app.read('planner.selected.beats[1].title'), 'The keys arrive');
  assert.equal(app.read('planner.selected.beats[1].notes'), 'He already cleared the drawer.');
  assert.match(app.run('planText()'), /2\. The keys arrive\nHe already cleared the drawer\./);
  const count = app.read('planner.selected.beats.length');
  app.get('addBeat').click();
  assert.equal(app.read('planner.selected.beats.length'), count + 1);
  app.run(`moveBeat(planner.selected.beats.at(-1).id, 'remove');`);
  assert.equal(app.read('planner.selected.beats.length'), count);
  app.run(`while(planner.selected.beats.length > 1) moveBeat(planner.selected.beats[0].id, 'remove'); moveBeat(planner.selected.beats[0].id, 'remove');`);
  assert.equal(app.read('planner.selected.beats.length'), 1);
});

test('copy includes chapter notes, chosen ending/order, and edited beats', async () => {
  const app = loadApp();
  app.get('chapterHappens').oninput({ target: { value: 'She returns the keys.' } });
  app.get('chapterReader').oninput({ target: { value: 'Did he arrange this?' } });
  app.get('use-treatment-0').click();
  app.get('planEnding').onchange({ target: { value: 'image' } });
  app.get('planOrder').onchange({ target: { value: 'aftermath' } });
  app.run(`editBeat(planner.selected.beats[0].id, 'notes', 'A key that no longer fits.');`);
  await app.get('copyPlan').onclick();
  for (const text of ['She returns the keys.', 'Did he arrange this?', 'An unresolved image', 'Consequence → cause', 'A key that no longer fits.']) {
    assert(app.clipboard.text.includes(text), text);
  }
});

test('clipboard failure exposes selectable text without losing the plan', async () => {
  const app = loadApp();
  app.get('use-treatment-0').click();
  const before = app.read('planner.selected');
  app.clipboard.reject = true;
  await app.get('copyPlan').onclick();
  assert.equal(app.get('copyDialog').open, true);
  assert.equal(app.get('copyText').value, app.run('planText()'));
  assert.deepEqual(app.read('planner.selected'), before);
});

test('download contains the complete UTF-8 plan, not the generic exercise', async () => {
  const app = loadApp();
  app.get('chapterHappens').oninput({ target: { value: 'A clé, a key, and a decision.' } });
  app.get('use-treatment-0').click();
  app.run(`editBeat(planner.selected.beats[0].id, 'notes', 'She keeps the clé.');`);
  app.get('downloadPlan').click();
  assert.equal(app.downloads.length, 1);
  assert.equal(app.downloads[0].name, 'chapter-plan.txt');
  const blob = require('node:buffer').resolveObjectURL(app.downloads[0].href);
  assert(blob);
  assert.equal(blob.type, 'text/plain;charset=utf-8');
  assert.equal(await blob.text(), app.run('planText()'));
  URL.revokeObjectURL(app.downloads[0].href);
});

test('page assets resolve under both root and GitHub-style subdirectory URLs', () => {
  const assets = [...html.matchAll(/<(?:script|link)\b[^>]*\b(?:src|href)="([^"]+)"/g)].map(match => match[1]).filter(value => !value.startsWith('data:'));
  assert.equal(assets.length, 6);
  for (const base of ['https://example.test/', 'https://example.test/chapter-lab/']) {
    for (const asset of assets) {
      assert(fs.existsSync(path.join(root, 'dist', asset)), asset);
      assert(new URL(asset, base).href.startsWith(base), asset);
    }
  }
});

test('user input remains text in editor markup and exports', () => {
  const app = loadApp();
  app.get('use-treatment-0').click();
  app.run(`editBeat(planner.selected.beats[0].id, 'title', '<img src=x onerror=alert(1)>');
    editBeat(planner.selected.beats[0].id, 'notes', '</textarea><script>alert(1)</script>'); renderPlan();`);
  assert(!app.get('planBeats').innerHTML.includes('<script>'));
  assert(!app.get('planBeats').innerHTML.includes('<img'));
  assert(app.get('planBeats').innerHTML.includes('&lt;/textarea&gt;'));
  assert(app.run('planText()').includes('<img src=x onerror=alert(1)>'));
});

test('purpose and scope changes refresh candidates while retaining selected-plan context', () => {
  const app = loadApp();
  app.get('use-treatment-0').click();
  const plan = app.read('planner.selected');
  app.get('purposeSelect').onchange({ target: { value: '23' } });
  app.get('focus').onchange({ target: { value: 'opening' } });
  app.get('length').onchange({ target: { value: 'chapter' } });
  assert.equal(app.run('planner.candidates.every(c => c.purpose.id === 23 && c.structure === null)'), true);
  assert.deepEqual(app.read('planner.selected'), plan);
  assert.match(app.get('planContext').textContent, /settings have changed/);
});

test('borrowing an opening retains beat edits; borrowing a structure requires replacement', () => {
  const app = loadApp();
  app.get('use-treatment-0').click();
  app.run(`editBeat(planner.selected.beats[0].id, 'notes', 'Keep this scene note.');`);
  const beats = app.read('planner.selected.beats');
  app.get('borrow-opening-1').click();
  assert.deepEqual(app.read('planner.selected.beats'), beats);
  assert.equal(app.read('planner.selected.opening.id'), app.read('planner.candidates[1].opening.id'));
  app.get('borrow-structure-2').click();
  assert.equal(app.get('replacePlanDialog').open, true);
  app.get('replacePlanDialog').close('cancel');
  assert.deepEqual(app.read('planner.selected.beats'), beats);
  app.get('borrow-structure-2').click();
  app.get('replacePlanDialog').close('replace');
  assert.equal(app.read('planner.selected.structure.id'), app.read('planner.candidates[2].structure.id'));
  assert.equal(app.read('planner.selected.purpose.id'), 1);
  assert.match(app.read('planner.selected.pairing'), /Free pairing/);
});

test('original exercise selection and locked rerolls still work', async () => {
  const app = loadApp();
  app.get('openingSelect').onchange({ target: { value: '81' } });
  app.get('structureSelect').onchange({ target: { value: '101' } });
  app.get('lockOpening').click();
  app.get('lockStructure').click();
  app.get('lockPurpose').click();
  app.get('roll').click();
  assert.equal(app.read('state.opening'), 81);
  assert.equal(app.read('state.structure'), 101);
  assert.equal(app.read('state.purpose'), 1);
  app.get('useExercise').click();
  assert.equal(app.read('planner.selected.opening.id'), 81);
  assert.equal(app.read('planner.selected.structure.id'), 101);
  assert.match(app.read('planner.selected.pairing'), /Free pairing/);
  await app.get('copy').onclick();
  assert.match(app.clipboard.text, /OPENING #81/);
  assert.match(app.clipboard.text, /STRUCTURE #101/);
});
