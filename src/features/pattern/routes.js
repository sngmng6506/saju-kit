import { tenGodForStem } from '../../core/natal.js';
import { elementRelation } from '../../core/elements.js';
const ORDER=['year','month','day','hour'];
const W=['정재','편재'],I=['정인','편인'],B=['비견','겁재'],O=['정관','편관'],E=['식신','상관'];
const source='https://www.donglishuzhai.net/chapter/3721.html';
const assistant='https://donglishuzhai.net/chapter/3728.html';
const outcome='https://www.donglishuzhai.net/chapter/3722.html';
// A directed path is a necessary structural observation, never sufficient
// to establish an effective classical relation. Each route has a role binding.
const definitions={
 officer:[
 ['wealth-generates-officer','support',W,'generate',null,'anchor',source],
 ['hurting-controls-officer','damage',['상관'],'control',null,'anchor',outcome],
 ['resource-controls-hurting','rescue',I,'control',['상관'],'anchor',outcome],
 ['combine-hurting-preserve-officer','rescue',I,'combine',['상관'],'anchor',assistant],
 ['combine-killing-preserve-officer','rescue',B,'combine',['편관'],'anchor',outcome]],
 wealth:[
 ['food-generates-wealth','support',['식신'],'generate',null,'anchor',source],
 ['peer-controls-wealth','damage',B,'control',null,'anchor',outcome],
 ['officer-controls-peer','rescue',O,'control',B,'anchor',outcome],
 ['combine-killing-preserve-wealth','rescue',B,'combine',['편관'],'anchor',assistant]],
 resource:[
 ['officer-generates-resource','support',O,'generate',null,'anchor',source],
 ['wealth-controls-resource','damage',W,'control',null,'anchor',outcome],
 ['peer-controls-wealth','rescue',B,'control',W,'anchor',outcome]],
 food:[
 ['food-generates-wealth','support',W,'generated-by-anchor',null,'anchor',source],
 ['owl-controls-food','damage',['편인'],'control',null,'anchor',outcome],
 ['wealth-controls-owl','rescue',W,'control',['편인'],'anchor',outcome]],
 killing:[
 ['food-controls-killing','support',['식신'],'control',null,'anchor',source],
 ['wealth-generates-killing','damage',W,'generate',null,'anchor',outcome],
 ['resource-controls-food','damage',I,'control',['식신'],'anchor',outcome],
 ['combine-resource-preserve-food','rescue',W,'combine',I,'anchor',assistant],
 ['wealth-controls-resource','rescue',W,'control',I,'anchor',outcome]],
 'hurting-officer':[
 ['hurting-generates-wealth','support',W,'generated-by-anchor',null,'anchor',source],
 ['resource-controls-hurting','support',I,'control',null,'anchor',source],
 ['hurting-controls-officer','damage',['정관'],'controlled-by-anchor',null,'anchor',outcome]],
 blade:[['officer-controls-blade','support',O,'control',null,'day',source]],
 peer:[
 ['officer-controls-peer','support',O,'control',null,'day',source],
 ['peer-output-wealth','support',E,'generate',W,'day',source],
 ['combine-killing-preserve-officer','rescue',B,'combine',['편관'],'day',outcome],
 ['food-controls-killing','rescue',['식신'],'control',['편관'],'day',outcome]]
};
export function buildPatternOccurrences(structure){
 const day=structure.dayMaster.stem,clashed=new Set(structure.clashes.flatMap(c=>c.positions));
 const visible=structure.profiles.flatMap(p=>p.visible.map(v=>({
  id:'visible:'+v.position,position:v.position,layer:'visible',stem:v.stem,element:p.element,
  tenGod:tenGodForStem(day,v.stem),dayReference:v.position==='day',
  roots:v.matches.map(m=>({position:m.position,stem:m.stem,role:m.role,match:m.match,clashExposed:clashed.has(m.position)}))
 })));
 const hidden=structure.profiles.flatMap(p=>p.roots.flatMap(r=>r.matches.map(m=>({
  id:'hidden:'+r.position+':'+m.stem,position:r.position,layer:'hidden',stem:m.stem,element:p.element,
  tenGod:tenGodForStem(day,m.stem),dayReference:false,role:m.role,clashExposed:clashed.has(r.position)
 }))));
 return [...visible,...hidden].sort((a,b)=>ORDER.indexOf(a.position)-ORDER.indexOf(b.position)||a.id.localeCompare(b.id));
}
export function observePatternRoutes(selection,structure,interaction){
 const occurrences=buildPatternOccurrences(structure),actors=occurrences.filter(x=>!x.dayReference);
 const byGod=gods=>actors.filter(x=>gods.includes(x.tenGod));
 const combos=interaction.formations.filter(f=>f.layer==='stem'&&f.type==='stem.combine');
 const link=(a,b,kind)=>{
  if(a.id===b.id)return null;
  const rel=elementRelation(a.element,b.element);
  const pair=kind==='combine'?combos.find(f=>a.layer==='visible'&&b.layer==='visible'&&f.positions.includes(a.position)&&f.positions.includes(b.position)):null;
  const valid=kind==='combine'?!!pair:kind==='generated-by-anchor'?rel.type==='generate'&&rel.direction==='right-to-left':
    kind==='controlled-by-anchor'?rel.type==='control'&&rel.direction==='right-to-left':rel.type===kind&&rel.direction==='left-to-right';
  if(!valid)return null;
  const between=actors.filter(x=>x.layer==='visible'&&ORDER.indexOf(x.position)>Math.min(ORDER.indexOf(a.position),ORDER.indexOf(b.position))&&ORDER.indexOf(x.position)<Math.max(ORDER.indexOf(a.position),ORDER.indexOf(b.position)));
  return {from:a.id,to:b.id,kind,span:Math.abs(ORDER.indexOf(a.position)-ORDER.indexOf(b.position)),
   between:between.map(x=>x.id),combinationId:pair?.id??null,effective:null};
 };
 const reviews=selection.candidates.map(c=>{
  const anchor=actors.filter(x=>c.stems.includes(x.stem));
  const routes=(definitions[c.family]??[]).map(([id,kind,gods,action,targets,anchorKind,url])=>{
   const assistants=byGod(gods),ends=targets?byGod(targets):anchorKind==='day'?occurrences.filter(x=>x.dayReference):anchor;
   const links=assistants.flatMap(a=>ends.map(b=>link(a,b,action)).filter(Boolean));
   // A helper and obstacle relation is insufficient without its pattern target.
   const routeAnchor=anchorKind==='day'?occurrences.filter(x=>x.dayReference):anchor;
   const witnesses=links.map(l=>({...l,anchorIds:routeAnchor.map(x=>x.id)}));
   const matched=witnesses.length&&routeAnchor.length?true:structure.completeHour?false:null;
   return {id,kind,source:url,assistantTenGods:[...gods],links:witnesses,observed:matched,
    conditionResolved:false,effectConfirmed:false,selectionAuthority:false};
  });
  return {candidateId:c.id,anchorIds:anchor.map(x=>x.id),routes,assistantCandidates:[...new Set(routes.filter(r=>r.kind!=='damage'&&r.observed===true).flatMap(r=>r.links.map(l=>l.from)))],
   formed:null,broken:null,rescued:null,assistantGod:null,selectionAuthority:false};
 });
 const officer=byGod(['정관']),killing=byGod(['편관']);
 const mix=(a,b)=>a.length&&b.length?true:structure.completeHour?false:null;
 const visibleOfficer=officer.filter(x=>x.layer==='visible'),visibleKilling=killing.filter(x=>x.layer==='visible');
 return {occurrences,reviews,purity:{
  officerKilling:{visibleCoexistence:mix(visibleOfficer,visibleKilling),anyLayerCoexistence:mix(officer,killing),
   visibleOfficer:visibleOfficer.map(x=>x.id),visibleKilling:visibleKilling.map(x=>x.id),
   combinationContacts:combos.filter(f=>[...visibleOfficer,...visibleKilling].some(x=>f.positions.includes(x.position))).map(f=>({id:f.id,positions:[...f.positions],members:[...f.members],effective:null})),mixedConfirmed:null,clearedConfirmed:null},
  wealthResource:{visibleCoexistence:mix(byGod(W).filter(x=>x.layer==='visible'),byGod(I).filter(x=>x.layer==='visible')),conflictConfirmed:null},
  purityConfirmed:null},selectionAuthority:false,confirmed:false};
}
