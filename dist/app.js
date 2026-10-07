'use strict';
const $ = id => document.getElementById(id);
const state = { opening:14, structure:5, purpose:1, usePurpose:true, lockPurpose:false, purposeCategory:'all', lockOpening:false, lockStructure:false, level:'exploratory', focus:'both', length:'short', examples:true };
const esc = x => String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const groundedOpenings=[1,2,3,4,6,7,8,10,11,12,14,16,17,19,20,21,23,24,25,26,40,58,68,72,75,78,80];
function current(){return {opening:CATALOG.openings.find(x=>x.id===state.opening),structure:CATALOG.structures.find(x=>x.id===state.structure)}}
function basePool(type){return type==='opening'?CATALOG.openings.filter(x=>state.level!=='grounded'||groundedOpenings.includes(x.id)):CATALOG.structures.filter(x=>state.level==='wild'||(state.level==='grounded'?x.level==='grounded':x.level!=='wild'))}
function purpose(){return PURPOSES.find(x=>x.id===state.purpose)}
function pool(type){const list=basePool(type);return type==='structure'&&state.usePurpose?list.filter(x=>purpose().structures.includes(x.id)):list}
function choose(type){const list=pool(type).filter(x=>x.id!==state[type]);if(!list.length)return false;state[type]=list[Math.floor(Math.random()*list.length)].id;return true}
function purposePool(){return PURPOSES.filter(p=>(state.purposeCategory==='all'||p.category===state.purposeCategory)&&(state.focus==='opening'||(state.lockStructure?p.structures.includes(state.structure):basePool('structure').some(s=>p.structures.includes(s.id)))))}
function choosePurpose(){const list=purposePool().filter(p=>p.id!==state.purpose);if(!list.length)return false;state.purpose=list[Math.floor(Math.random()*list.length)].id;return true}
function selectPurpose(id){if(!Number.isInteger(id)||!PURPOSES.some(p=>p.id===id))throw new Error('That scene purpose isn’t available.');state.purpose=id;if(state.usePurpose&&state.focus!=='opening'&&!state.lockStructure&&!pool('structure').some(x=>x.id===state.structure))choose('structure');render();return snapshot()}

function notify(msg){$('status').textContent=msg;$('status').classList.add('visible');clearTimeout(notify.timer);notify.timer=setTimeout(()=>$('status').classList.remove('visible'),3000)}
function roll(type='both'){
 if(!['both','opening','structure','purpose'].includes(type))throw new Error('Choose both, opening, structure, or purpose.');
 let changes=0, purposeChanged=false;
 if((type==='both'||type==='purpose')&&state.usePurpose&&!state.lockPurpose){purposeChanged=choosePurpose();if(purposeChanged)changes++}
 if((type==='both'||type==='opening')&&state.focus!=='structure'&&!state.lockOpening){if(choose('opening'))changes++}
 if((type==='both'||type==='structure'||(type==='purpose'&&purposeChanged))&&state.focus!=='opening'&&!state.lockStructure){if(choose('structure'))changes++}
 render();notify(changes?'New challenge ready.':'No different match here. Unlock a choice, change the family, or widen Explore.');return snapshot();
}
function select(type,id){if(type==='purpose')return selectPurpose(id);if(!['opening','structure'].includes(type))throw new Error('Choose opening or structure.');const list=type==='opening'?CATALOG.openings:CATALOG.structures;if(!Number.isInteger(id)||!list.some(x=>x.id===id))throw new Error('That catalog number isn’t available.');state[type]=id;render();return snapshot()}
function openingTask(o){return `Write 2–5 opening sentences using ${o.name.replace(/^The /,'').toLowerCase()}. Establish who or what we’re following before the reader loses their footing. Keep the technique’s effect; invent your own situation.`}
function brief(){const {opening:o,structure:s}=current();let target=state.length==='outline'?`Draft ${state.focus==='opening'?'an opening sketch':`a ${s.beats.length}-beat outline`}`:state.length==='short'?'Write a 300–600 word scene':'Write a chapter at the length your story needs';let device=state.focus==='opening'?`using ${o.name}`:state.focus==='structure'?`following ${s.name}`:`opening with ${o.name}, then following ${s.name}`;return `${target} ${device}.${state.usePurpose?` Scene purpose: ${purpose().name.toLowerCase()}. ${purpose().goal}`:' Use your own characters or borrow the example’s situation.'}`}
function rules(){const {opening:o,structure:s}=current();const list=[];if(state.usePurpose)list.push(`Give the scene a clear job: ${purpose().goal}`);if(state.focus!=='structure')list.push(`Make the opening’s defining move in the first paragraph: ${o.description}`);if(state.focus!=='opening'){list.push(`Follow the ${s.beats.length} movements in order. Each beat can be a paragraph, scene, or section.`);list.push(s.rule)}if(state.focus==='both')list.push('Fold the opening technique into the first structural beat. The two examples demonstrate their forms separately; your draft brings them together.');return list}
function check(){
 const base=state.focus==='opening'?'Read it back: What does the opening make the reader notice, expect, or question?':state.focus==='structure'?'Read it back: Can you point to every movement? What changes between the first beat and the last?':'Read it back: Does the opening lead naturally into the first beat? Can you trace the structure through the scene?';
 return base+(state.usePurpose?` Scene job: ${purpose().goal} Can you point to the moment that does it?`:'');
}
function challengeText(){const {opening:o,structure:s}=current();const out=['CHAPTER STRUCTURE LAB','',brief(),''];if(state.usePurpose){const p=purpose();out.push(`SCENE PURPOSE #${p.id}: ${p.name}`,p.goal,`Quick idea: ${p.seed}`,`Mapped structures: ${p.structures.map(id=>CATALOG.structures.find(s=>s.id===id).name).join('; ')}`,'');}if(state.focus!=='structure')out.push(`OPENING #${o.id}: ${o.name}`,o.description,'',`Example: ${o.example}`,'',openingTask(o),'');if(state.focus!=='opening')out.push(`STRUCTURE #${s.id}: ${s.name}`,s.description,'',`Exercise rule: ${s.rule}`,'',...s.beats.map((b,i)=>`${i+1}. ${b.title}\n   Example: ${b.example}`),'');out.push('YOUR CHALLENGE',...rules().map(x=>`• ${x}`),'',check());return out.join('\n')}
function snapshot(){const {opening:o,structure:s}=current();return {purpose:{id:state.purpose,name:purpose().name,enabled:state.usePurpose,locked:state.lockPurpose,category:state.purposeCategory},opening:{id:o.id,name:o.name,locked:state.lockOpening},structure:{id:s.id,name:s.name,locked:state.lockStructure},level:state.level,focus:state.focus,length:state.length,brief:brief()}}
function render(){renderPurpose();const {opening:o,structure:s}=current();$('openingSelect').value=state.opening;$('structureSelect').value=state.structure;
 $('openingName').textContent=o.name;$('openingDescription').textContent=o.description;$('openingExample').textContent=o.example;$('openingTask').textContent=openingTask(o);$('openingSource').textContent=o.text;
 $('structureName').textContent=s.name;$('structureDescription').textContent=s.description;$('structureRule').textContent=s.rule;
 $('beats').innerHTML=s.beats.map(b=>`<li><strong>${esc(b.title)}</strong>${state.examples?`<p>${esc(b.example)}</p>`:''}</li>`).join('');
 for(const type of ['Opening','Structure']){const locked=state['lock'+type];$('lock'+type).textContent=locked?'Locked':'Lock';$('lock'+type).setAttribute('aria-pressed',String(locked));$('roll'+type).disabled=locked}
 $('openingCard').hidden=state.focus==='structure';$('structureCard').hidden=state.focus==='opening';document.querySelector('.workspace').classList.toggle('single',state.focus!=='both');
 $('roll').disabled=(!state.usePurpose||state.lockPurpose||!purposePool().some(p=>p.id!==state.purpose))&&(state.focus==='opening'?state.lockOpening:state.focus==='structure'?state.lockStructure:state.lockOpening&&state.lockStructure);
 $('challengeTitle').textContent=state.focus==='opening'?'Write a way in.':state.focus==='structure'?'Give the scene its shape.':'Write the combination.';
 $('challengeBrief').textContent=brief();$('challengeRules').innerHTML='<ul>'+rules().map(r=>`<li>${esc(r)}</li>`).join('')+'</ul>';$('selfCheck').textContent=check();
 $('rangeNote').textContent=state.level==='grounded'?'Rolls practical, familiar forms. Purpose matching guides structure rolls.':state.level==='exploratory'?'Adds less familiar patterns. Purpose matching guides structure rolls.':'Rolls the entire collection, including experimental page adaptations. Purpose matching still applies.';
 document.dispatchEvent(new Event('exercisechange'));
}
function renderPurpose(){
 const p=purpose();$('purposeSelect').value=state.purpose;$('purposeName').textContent=p.name;$('purposeGoal').textContent=p.goal;$('purposeSeed').textContent=p.seed;
 $('lockPurpose').textContent=state.lockPurpose?'Locked':'Lock';$('lockPurpose').setAttribute('aria-pressed',String(state.lockPurpose));$('lockPurpose').disabled=!state.usePurpose;$('rollPurpose').disabled=!state.usePurpose||state.lockPurpose;$('purposeCategory').disabled=!state.usePurpose;
 $('purposeMatches').hidden=state.focus==='opening';
 $('matchedStructures').innerHTML=p.structures.map(id=>{const s=CATALOG.structures.find(x=>x.id===id);return `<button data-structure="${id}" aria-pressed="${id===state.structure}" title="Use ${esc(s.name)}">${esc(s.name)}</button>`}).join('');
 const mapped=p.structures.includes(state.structure);const count=pool('structure').length;
 $('purposeFit').textContent=!state.usePurpose?'Scene purpose is off. Structure rolls use the full Explore range.':mapped?`This structure is mapped to your purpose. ${count} mapped ${count===1?'shape is':'shapes are'} available at this Explore level.`:`${state.lockStructure?'Your locked structure is kept.':'You’ve chosen a free pairing.'} It isn’t in this purpose’s mapped set. ${state.lockStructure?'Unlock it to roll a mapped shape.':'Reroll the structure or choose a mapped shape above.'}`;
}
$('purposeSelect').innerHTML=[...new Set(PURPOSES.map(p=>p.category))].map(cat=>`<optgroup label="${esc(cat)}">${PURPOSES.filter(p=>p.category===cat).map(p=>`<option value="${p.id}">${p.id} · ${esc(p.name)}</option>`).join('')}</optgroup>`).join('');
$('purposeCategory').innerHTML='<option value="all">All 128 purposes</option>'+[...new Set(PURPOSES.map(p=>p.category))].map(cat=>`<option value="${esc(cat)}">${esc(cat)}</option>`).join('');
$('purposeSelect').onchange=e=>selectPurpose(Number(e.target.value));
$('purposeCategory').onchange=e=>{state.purposeCategory=e.target.value;render()};
$('rollPurpose').onclick=()=>roll('purpose');
$('lockPurpose').onclick=()=>{state.lockPurpose=!state.lockPurpose;render()};
$('usePurpose').onchange=e=>{state.usePurpose=e.target.checked;if(state.usePurpose&&state.focus!=='opening'&&!state.lockStructure&&!pool('structure').some(s=>s.id===state.structure))choose('structure');render()};
$('matchedStructures').onclick=e=>{const button=e.target.closest('button[data-structure]');if(button)select('structure',Number(button.dataset.structure))};
$('openingSelect').innerHTML=CATALOG.openings.map(x=>`<option value="${x.id}">${String(x.id).padStart(2,'0')} · ${esc(x.name)}</option>`).join('');
$('structureSelect').innerHTML=[...new Set(CATALOG.structures.map(x=>x.category))].map(cat=>`<optgroup label="${esc(cat)}">${CATALOG.structures.filter(x=>x.category===cat).map(x=>`<option value="${x.id}">${String(x.id).padStart(2,'0')} · ${esc(x.name)}</option>`).join('')}</optgroup>`).join('');
$('roll').onclick=()=>roll();$('rollOpening').onclick=()=>roll('opening');$('rollStructure').onclick=()=>roll('structure');
for(const type of ['Opening','Structure'])$('lock'+type).onclick=()=>{state['lock'+type]=!state['lock'+type];render()};
$('openingSelect').onchange=e=>select('opening',Number(e.target.value));$('structureSelect').onchange=e=>select('structure',Number(e.target.value));
for(const key of ['level','focus','length'])$(key).onchange=e=>{state[key]=e.target.value;render()};$('showExamples').onchange=e=>{state.examples=e.target.checked;render()};
async function copyText(text, message='Copied.') {
 try {
  await navigator.clipboard.writeText(text);
  notify(message);
 } catch {
  $('copyText').value=text;
  $('copyDialog').showModal();
  $('copyText').focus();
  $('copyText').select();
 }
}
$('copy').onclick=()=>copyText(challengeText(),'Challenge copied.');
render();
if(document.modelContext?.registerTool){const lifecycle=new AbortController();window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});const tools=[{name:'read_writing_challenge',description:'Read the visible purpose, opening, structure, and complete writing exercise.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute(){return {state:snapshot(),text:challengeText()}}},{name:'roll_writing_challenge',description:'Roll unlocked choices using the visible settings. Target both rolls purpose, opening, and structure; purpose rolls a purpose and an unlocked mapped structure. Locks are preserved.',inputSchema:{type:'object',properties:{target:{type:'string',enum:['both','opening','structure','purpose']}},required:['target'],additionalProperties:false},annotations:{readOnlyHint:false},execute(input){if(!input||!['both','opening','structure','purpose'].includes(input.target))throw new Error('Choose both, opening, structure, or purpose.');return roll(input.target)}},{name:'select_writing_form',description:'Select a purpose, opening, or structure by catalog number. Choosing a purpose updates an unlocked structure when matching is on.',inputSchema:{type:'object',properties:{type:{type:'string',enum:['opening','structure','purpose']},id:{type:'integer',minimum:1,maximum:128}},required:['type','id'],additionalProperties:false},annotations:{readOnlyHint:false},execute(input){if(!input)throw new Error('Provide a type and number.');return select(input.type,input.id)}}];for(const t of tools){try{Promise.resolve(document.modelContext.registerTool(t,{signal:lifecycle.signal})).catch(()=>{})}catch{}}}
