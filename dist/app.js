'use strict';
const $ = id => document.getElementById(id);
const state = { opening:14, structure:5, ending:'decision', purpose:1, usePurpose:true, lockPurpose:false, purposeCategory:'all', lockOpening:false, lockStructure:false, lockEnding:false, level:'exploratory', focus:'both', length:'short', examples:true };
const esc = x => String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const groundedOpenings=[1,2,3,4,6,7,8,10,11,12,14,16,17,19,20,21,23,24,25,26,40,58,68,72,75,78,80];
function current(){return {opening:CATALOG.openings.find(x=>x.id===state.opening),structure:CATALOG.structures.find(x=>x.id===state.structure),ending:ENDINGS.find(x=>x.id===state.ending)}}
function basePool(type){
 if(type==='opening')return CATALOG.openings.filter(x=>state.level!=='grounded'||groundedOpenings.includes(x.id));
 if(type==='ending')return ENDINGS.filter(x=>state.level==='wild'||(state.level==='grounded'?x.level==='grounded':x.level!=='wild'));
 return CATALOG.structures.filter(x=>state.level==='wild'||(state.level==='grounded'?x.level==='grounded':x.level!=='wild'));
}
function purpose(){return PURPOSES.find(x=>x.id===state.purpose)}
function pool(type){const list=basePool(type);return type==='structure'&&state.usePurpose?list.filter(x=>purpose().structures.includes(x.id)):list}
function choose(type){const list=pool(type).filter(x=>x.id!==state[type]);if(!list.length)return false;state[type]=list[Math.floor(Math.random()*list.length)].id;return true}
function purposePool(){return PURPOSES.filter(p=>(state.purposeCategory==='all'||p.category===state.purposeCategory)&&(state.focus==='opening'||(state.lockStructure?p.structures.includes(state.structure):basePool('structure').some(s=>p.structures.includes(s.id)))))}
function choosePurpose(){const list=purposePool().filter(p=>p.id!==state.purpose);if(!list.length)return false;state.purpose=list[Math.floor(Math.random()*list.length)].id;return true}
function selectPurpose(id){if(!Number.isInteger(id)||!PURPOSES.some(p=>p.id===id))throw new Error('That scene purpose isn’t available.');state.purpose=id;if(state.usePurpose&&state.focus!=='opening'&&!state.lockStructure&&!pool('structure').some(x=>x.id===state.structure))choose('structure');render();return snapshot()}

function notify(msg){$('status').textContent=msg;$('status').classList.add('visible');clearTimeout(notify.timer);notify.timer=setTimeout(()=>$('status').classList.remove('visible'),3000)}
function roll(type='both'){
 if(!['both','opening','structure','purpose','ending'].includes(type))throw new Error('Choose both, opening, structure, purpose, or ending.');
 let changes=0, purposeChanged=false;
 if((type==='both'||type==='purpose')&&state.usePurpose&&!state.lockPurpose){purposeChanged=choosePurpose();if(purposeChanged)changes++}
 if((type==='both'||type==='opening')&&state.focus!=='structure'&&!state.lockOpening){if(choose('opening'))changes++}
 if((type==='both'||type==='structure'||(type==='purpose'&&purposeChanged))&&state.focus!=='opening'&&!state.lockStructure){if(choose('structure'))changes++}
 if((type==='both'||type==='ending')&&!state.lockEnding){if(choose('ending'))changes++}
 render();notify(changes?'New exercise ready.':'Nothing new. Unlock a choice, or widen Explore.');return snapshot();
}
function select(type,id){
 if(type==='purpose')return selectPurpose(id);
 if(!['opening','structure','ending'].includes(type))throw new Error('Choose opening, structure, or ending.');
 const list=type==='opening'?CATALOG.openings:type==='structure'?CATALOG.structures:ENDINGS;
 const match=list.find(x=>String(x.id)===String(id));
 if(!match)throw new Error('That choice isn’t in the catalog.');
 state[type]=match.id;render();return snapshot();
}
function openingTask(){return 'Write the opening in a few sentences. Keep this move. Use your own situation.'}
function randomStructure(){
 if(state.lockStructure) return;
 const list=CATALOG.structures;
 state.structure=list[Math.floor(Math.random()*list.length)].id;
 $('originalExercise').open=true;
 render();
}
function fillEndingSelect(select){
 select.innerHTML=[...new Set(ENDINGS.map(x=>x.category))].map(cat=>`<optgroup label="${esc(cat)}">${ENDINGS.filter(x=>x.category===cat).map(x=>`<option value="${esc(x.id)}">${String(ENDINGS.indexOf(x)+1).padStart(2,'0')} · ${esc(x.name)}</option>`).join('')}</optgroup>`).join('');
}
function snapshot(){const {opening:o,structure:s,ending:e}=current();return {purpose:{id:state.purpose,name:purpose().name,enabled:state.usePurpose,locked:state.lockPurpose,category:state.purposeCategory},opening:{id:o.id,name:o.name,locked:state.lockOpening},structure:{id:s.id,name:s.name,locked:state.lockStructure},ending:{id:e.id,name:e.name,locked:state.lockEnding},level:state.level,focus:state.focus,length:state.length}}
function render(){renderPurpose();const {opening:o,structure:s,ending:e}=current();
 $('openingSelect').value=state.opening;$('structureSelect').value=state.structure;$('endingSelect').value=state.ending;
 $('openingName').textContent=o.name;$('openingDescription').textContent=o.description;$('openingExample').textContent=o.example;$('openingTask').textContent=openingTask();
 $('structureName').textContent=s.name;$('structureDescription').textContent=s.description;$('structureRule').textContent=s.rule;
 $('beats').innerHTML=s.beats.map(b=>`<li><strong>${esc(b.title)}</strong>${state.examples?`<p>${esc(b.example)}</p>`:''}</li>`).join('');
 $('endingName').textContent=e.name;$('endingDescription').textContent=e.description;$('endingExample').textContent=e.example;$('endingTask').textContent=e.task;
 $('structureNumber').textContent=`#${s.id} of ${CATALOG.structures.length}`;
 $('randomStructure').disabled=state.lockStructure;
 for(const type of ['Opening','Structure','Ending']){const locked=state['lock'+type];$('lock'+type).textContent=locked?'Locked':'Lock';$('lock'+type).setAttribute('aria-pressed',String(locked));$('roll'+type).disabled=locked}
 $('openingCard').hidden=state.focus==='structure';$('structureCard').hidden=state.focus==='opening';
 const openingBlocked=state.focus==='structure'||state.lockOpening;
 const structureBlocked=state.focus==='opening'||state.lockStructure;
 const purposeBlocked=!state.usePurpose||state.lockPurpose||!purposePool().some(p=>p.id!==state.purpose);
 $('roll').disabled=purposeBlocked&&openingBlocked&&structureBlocked&&state.lockEnding;
 $('rangeNote').textContent=state.level==='grounded'?'Familiar openings, structures, and endings.':state.level==='exploratory'?'Adds less common forms.':'Full catalog, including experiments.';
 document.dispatchEvent(new Event('exercisechange'));
}
function renderPurpose(){
 const p=purpose();$('purposeSelect').value=state.purpose;$('purposeName').textContent=p.name;$('purposeGoal').textContent=p.goal;$('purposeSeed').textContent=p.seed;
 $('lockPurpose').textContent=state.lockPurpose?'Locked':'Lock';$('lockPurpose').setAttribute('aria-pressed',String(state.lockPurpose));$('lockPurpose').disabled=!state.usePurpose;$('rollPurpose').disabled=!state.usePurpose||state.lockPurpose;$('purposeCategory').disabled=!state.usePurpose;
 $('purposeMatches').hidden=state.focus==='opening';
 $('matchedStructures').innerHTML=p.structures.map(id=>{const s=CATALOG.structures.find(x=>x.id===id);return `<button data-structure="${id}" aria-pressed="${id===state.structure}" title="Use ${esc(s.name)}">${esc(s.name)}</button>`}).join('');
 const mapped=p.structures.includes(state.structure);const count=pool('structure').length;
 $('purposeFit').textContent=!state.usePurpose?'Purpose is off. Structure rolls use the full Explore range.':mapped?`Mapped to this purpose. ${count} ${count===1?'shape':'shapes'} at this Explore level.`:state.lockStructure?'Free pairing. Locked structure stays, even though it isn’t mapped.':'Free pairing. This structure isn’t mapped to the purpose.';
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
fillEndingSelect($('endingSelect'));
$('roll').onclick=()=>roll();$('rollOpening').onclick=()=>roll('opening');$('rollStructure').onclick=()=>roll('structure');$('rollEnding').onclick=()=>roll('ending');
$('randomStructure').onclick=()=>randomStructure();
for(const type of ['Opening','Structure','Ending'])$('lock'+type).onclick=()=>{state['lock'+type]=!state['lock'+type];render()};
$('openingSelect').onchange=e=>select('opening',Number(e.target.value));$('structureSelect').onchange=e=>select('structure',Number(e.target.value));$('endingSelect').onchange=e=>select('ending',e.target.value);
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
render();
