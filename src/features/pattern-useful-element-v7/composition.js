import { elementRelation,stemInfo } from '../../core/elements.js';
const SOURCE='https://www.donglishuzhai.net/chapter/3723.html';
const PARALLEL='https://www.kaucim.ai/bazi/ziping-zhenquan/lun-yong-shen-bian-hua';
// Only the first two source clauses expressly name a secondary pattern.
const rules=[
 {id:'xin-yin-wealth-officer',day:'신',month:'인',primary:'wealth',principal:'갑',secondary:'officer',secondaryStem:'병',all:['갑','병'],change:['병'],preservers:['갑'],mechanism:'wealth-generates-officer'},
 {id:'yi-shen-officer-resource',day:'을',month:'신',primary:'officer',principal:'경',secondary:'resource',secondaryStem:'임',all:['임','무'],change:['임'],preservers:['무'],mechanism:'wealth-generates-officer-controls-resource'},
 {id:'gui-yin-hurting-wealth',day:'계',month:'인',primary:'hurting-officer',principal:'갑',secondary:null,all:['갑','병'],change:['병'],preservers:['갑'],avoid:['무'],mechanism:'hurting-officer-generates-wealth'},
 {id:'bing-yin-resource-fire-group',day:'병',month:'인',primary:'resource',principal:'갑',secondary:null,all:[],any:['갑','임'],change:[],preservers:['갑','임'],group:['인','오','술'],mechanism:'resource-preserved-despite-fire-group'},
 {id:'bing-shen-wealth-killing',day:'병',month:'신',primary:'wealth',principal:'경',secondary:null,all:['임','무'],change:['임'],preservers:['무'],mechanism:'food-controls-killing-generates-wealth'}
];
const unique=x=>[...new Set(x)].sort();
const projected=c=>['month-hidden-projection','month-storage-projection'].includes(c.kind);
export function observePatternComposition(selection,structure,interaction){
 const meta={source:SOURCE,parallelSource:PARALLEL,selectionAuthority:false,confirmed:false,primary:null,secondary:[],reviews:[],projectedPairs:[]};
 if(!selection||!structure||!interaction)return {...meta,status:'unavailable'};
 const visible=structure.profiles.flatMap(p=>p.visible).filter(v=>v.position!=='day');
 const positions=stem=>visible.filter(v=>v.stem===stem).map(v=>v.position);
 const presence=stem=>positions(stem).length?true:structure.completeHour?false:null;
 const groups=interaction.formations.filter(f=>f.layer==='branch'&&f.complete&&f.positions.includes('month')&&['branch.threeHarmony','branch.seasonalHarmony'].includes(f.type));
 const combos=interaction.formations.filter(f=>f.type==='stem.combine');
 const cs=selection.candidates,direct=cs.filter(projected);
 const pairs=direct.flatMap((a,i)=>direct.slice(i+1).filter(b=>a.family!==b.family).map(b=>({
  candidateIds:[a.id,b.id],families:[a.family,b.family],relation:elementRelation(stemInfo(a.stems[0]).element,stemInfo(b.stems[0]).element),
  compatible:null,secondaryConfirmed:null})));
 const reviews=rules.filter(r=>r.day===structure.dayMaster.stem&&r.month===structure.month.branch).map(r=>{
  const clauses=r.all.map(stem=>({kind:'visible',stem,positions:positions(stem),matched:presence(stem)}));
  if(r.any)clauses.push({kind:'any-visible',stems:[...r.any],positions:r.any.flatMap(positions),matched:r.any.some(s=>presence(s)===true)?true:structure.completeHour?false:null});
  const groupMatches=r.group?groups.filter(f=>f.type==='branch.threeHarmony'&&r.group.every(b=>f.members.includes(b))):[];
  if(r.group)clauses.push({kind:'complete-month-group',formationIds:groupMatches.map(f=>f.id),matched:groupMatches.length?true:structure.completeHour?false:null});
  const matched=clauses.some(c=>c.matched===false)?false:clauses.every(c=>c.matched===true)?true:null;
  const required=unique([...r.all,...(r.any??[]).filter(s=>presence(s)===true)]);
  const activePositions=required.flatMap(positions),allowed=new Set([...required,r.principal]);
  const contacts=combos.filter(f=>f.positions.some(p=>activePositions.includes(p)));
  const dayContacts=contacts.filter(f=>f.positions.includes('day'));
  const otherContacts=contacts.filter(f=>!f.positions.includes('day'));
  const blocked=[];
  if(!structure.completeHour)blocked.push('missing-hour');
  if((r.avoid??[]).some(s=>presence(s)===true))blocked.push('source-explicit-obstacle');
  if(direct.some(c=>c.stems.some(s=>!allowed.has(s))))blocked.push('additional-projected-stem');
  if(groups.some(f=>!groupMatches.some(g=>g.id===f.id)))blocked.push('additional-month-group');
  if(structure.clashes.some(c=>c.positions.includes('month')||groupMatches.some(g=>g.positions.some(p=>c.positions.includes(p)))))blocked.push('month-or-required-group-clash');
  // 丙辛 day contact is intrinsic to the first source example; observe,
  // do not treat it as cancellation. Other required-stem/day contacts
  // remain unresolved. All non-day combination contacts block preference.
  const expectedDayContact=f=>r.id==='xin-yin-wealth-officer'&&f.members.includes('병')&&f.members.includes('신');
  if(otherContacts.length||dayContacts.some(f=>!expectedDayContact(f)))blocked.push('required-stem-combination-contact');
  const primary=cs.find(c=>c.kind==='month-principal'&&c.family===r.primary&&c.stems.includes(r.principal));
  const secondary=r.secondary===null?[]:direct.filter(c=>c.family===r.secondary&&c.stems.includes(r.secondaryStem));
  if(!primary||r.secondary!==null&&!secondary.length)blocked.push('missing-candidate-reference');
  return {id:r.id,primaryFamily:r.primary,explicitSecondaryFamily:r.secondary,mechanism:r.mechanism,clauses,matched,
   changeStems:r.change.map(stem=>({stem,positions:positions(stem)})),
   preservers:r.preservers.filter(s=>presence(s)===true).map(stem=>({stem,positions:positions(stem),role:'preservation-participant'})),
   combinationContacts:contacts.map(f=>({id:f.id,positions:[...f.positions],dayReference:f.positions.includes('day'),effectConfirmed:null})),
   blocked,primaryCandidateId:primary?.id??null,secondaryCandidateIds:secondary.map(c=>c.id),
   eligibleForHypothesis:matched===true&&blocked.length===0,transformationConfirmed:null,preservationConfirmed:null,secondaryConfirmed:null};
 });
 const qualified=reviews.filter(r=>r.eligibleForHypothesis),q=qualified.length===1?qualified[0]:null;
 const primary=q?{family:q.primaryFamily,candidateId:q.primaryCandidateId,role:'original-pattern',confirmed:false}:null;
 const secondary=q?.explicitSecondaryFamily?[{family:q.explicitSecondaryFamily,candidateIds:q.secondaryCandidateIds,role:'explicit-source-secondary-pattern',confirmed:false}]:[];
 return {...meta,status:q?'preservation-hypothesis':reviews.length?'unresolved':'not-applicable',reviews,projectedPairs:pairs,primary,secondary};
}
export function refineCompositionPreference(prior,composition,selection){
 const base={...prior,policy:'month-family-preference-v3'};
 if(composition.status!=='preservation-hypothesis')return base;
 const q=composition.reviews.find(r=>r.eligibleForHypothesis),primary=selection.candidates.find(c=>c.id===q.primaryCandidateId);
 return {...base,status:'hypothesis',reason:null,hypothesis:{family:primary.family,candidateIds:[primary.id],anchorStems:[...primary.stems],
  grounds:['source-scoped-original-pattern-preservation',q.id],exactTenGodResolved:false,effectivePatternResolved:false,selectionAuthority:false,confirmed:false}};
}
