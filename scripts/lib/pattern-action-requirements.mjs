// Research policy: requirements for reviewing a mechanism, not proof of efficacy.
export const ACTION_REQUIREMENTS_VERSION='pattern-action-requirements-v2';
const W=['정재','편재'],I=['정인','편인'];
const unique=xs=>[...new Set(xs)].sort();
const pos=['year','month','day','hour'];
const lookup=(a,b,k)=>JSON.stringify([a,b,k]);
const condition=(name,value,category,details={})=>({name,value,category,...details});
const source={resource:'https://www.donglishuzhai.net/chapter/3748.html',resourceParallel:'https://dao.time.actor/ziping-zhenquan-pingzhu/juan-4',killing:'https://www.mastervt.com/books/zipingzhenquanpingzhu/juan-1/chapter-041',order:'https://donglishuzhai.net/chapter/3733.html'};
function purposes(a,b,kind){
 if(kind==='control'&&W.includes(a.tenGod)&&I.includes(b.tenGod))return ['wealth-resource-damage','wealth-resource-regulation'];
 if(kind==='control'&&I.includes(a.tenGod)&&b.tenGod==='식신')return [...(a.tenGod==='편인'?['owl-food-damage']:[]),'resource-food-control','resource-regulates-excess-food'];
 if(kind==='control'&&b.tenGod==='편관'&&['식신','상관'].includes(a.tenGod))return [a.tenGod==='식신'?'food-controls-killing':'hurting-controls-killing'];
 if(kind==='generate'&&a.tenGod==='편관'&&I.includes(b.tenGod))return ['killing-resource-transmission'];
 return ['generic-'+kind];
}
function requiredContext(purpose){
 if(purpose==='wealth-resource-regulation')return ['day-strong','resource-excess','residual-resource-capacity','wealth-control-effective','source-root-criterion-disputed'];
 if(purpose==='wealth-resource-damage')return ['resource-needed','resource-light','wealth-control-effective','rescue-effect'];
 if(['food-controls-killing','hurting-controls-killing'].includes(purpose))return ['day-capacity','output-killing-balance','output-control-effective'];
 if(purpose==='killing-resource-transmission')return ['resource-transmission-effective','day-support-effective','competing-killing-pressure'];
 if(purpose==='owl-food-damage')return ['food-needed','owl-control-effective','rescue-effect'];
 if(purpose==='resource-regulates-excess-food')return ['food-excess','resource-control-effective','residual-food-capacity'];
 return ['net-action-effective'];
}
function idx(xs,label){const m=new Map(xs.map(x=>[x.id,x]));if(m.size!==xs.length)throw Error('duplicate '+label);return m;}
export function reviewActionRequirements(result,layers,interaction){
 const base={version:ACTION_REQUIREMENTS_VERSION,sources:{...source},selectionAuthority:false,confirmedEffects:0};
 if(!result.relativeForce||!result.routeReview||layers.status==='unavailable')return {...base,status:'unavailable',edges:[]};
 if(!Array.isArray(interaction?.formations))throw Error('missing action interaction context');
 const complete=result.completeHour===true&&result.relativeForce.completeHour===true&&interaction.completeHour===true&&layers.status==='research-review';
 const actors=idx(result.routeReview.occurrences,'action actor'),graph=idx(result.relativeForce.edges,'action edge'),layerMap=idx(layers.edges,'layer edge');
 if(graph.size!==layerMap.size)throw Error('action layer graph mismatch');
 const byPair=new Map(result.relativeForce.edges.map(e=>[lookup(e.from,e.to,e.kind),e]));
 const combos=interaction.formations.filter(f=>f.type==='stem.combine'&&f.layer==='stem');
 const visible=[...actors.values()].filter(x=>x.layer==='visible');
 const edges=[...graph.values()].map(e=>{
  const a=actors.get(e.from),b=actors.get(e.to),l=layerMap.get(e.id);
  if(!a||!b||!l||l.from!==e.from||l.to!==e.to||l.kind!==e.kind)throw Error('unbound action edge '+e.id);
  const ap=result.relativeForce.profiles[a.id],bp=result.relativeForce.profiles[b.id];
  if(!ap||!bp)throw Error('missing action force profile');
  const direct=combos.filter(f=>a.layer==='visible'&&b.layer==='visible'&&f.positions.length===2&&f.positions.includes(a.position)&&f.positions.includes(b.position)).map(f=>f.id);
  const otherContacts=combos.filter(f=>[a,b].some(x=>x.layer==='visible'&&f.positions.includes(x.position))&&!direct.includes(f.id)).map(f=>f.id);
  const between=visible.filter(x=>pos.indexOf(x.position)>Math.min(pos.indexOf(a.position),pos.indexOf(b.position))&&pos.indexOf(x.position)<Math.max(pos.indexOf(a.position),pos.indexOf(b.position))).map(x=>({
   id:x.id,controlSource:byPair.get(lookup(x.id,a.id,'control'))?.id??null,controlTarget:byPair.get(lookup(x.id,b.id,'control'))?.id??null,
   generationPath:[byPair.get(lookup(a.id,x.id,'generate'))?.id,byPair.get(lookup(x.id,b.id,'generate'))?.id].filter(Boolean)
  })).map(x=>({...x,generationPath:x.generationPath.length===2?x.generationPath:[]}));
  const context=[
   condition('complete-chart',complete?true:null,'required'),
   condition('directed-relation',true,'required'),
   condition('source-substantial-root',ap.axes.anySubstantial,'supporting'),
   condition('target-substantial-root',bp.axes.anySubstantial,'supporting'),
   condition('locality',Math.abs(pos.indexOf(a.position)-pos.indexOf(b.position))<=1,'supporting'),
   condition('relative-force-evidence',null,'supporting',{relation:e.relative.relation}),
   condition('root-clash-contact',ap.rootClashExposed.length||bp.rootClashExposed.length?true:complete?false:null,'interference',{source:[...ap.rootClashExposed],target:[...bp.rootClashExposed]}),
   condition('local-control-pressure',e.sourceLocalControlNodes.length?true:complete?false:null,'interference',{ids:[...e.sourceLocalControlNodes]}),
   condition('exact-pair-stem-combination',direct.length?true:complete?false:null,'interference',{ids:direct}),
   condition('other-stem-combination',otherContacts.length?true:complete?false:null,'interference',{ids:otherContacts}),
   condition('intervening-control-or-mediation',between.some(x=>x.controlSource||x.controlTarget||x.generationPath.length)?true:complete?false:null,'interference',{between})
  ];
  if(a.layer==='hidden'||b.layer==='hidden')context.push(condition('hidden-participation-effect',null,'required'));
  const outputRole=['식신','상관'].includes(a.tenGod)?a.tenGod:null;
  const hypotheses=purposes(a,b,e.kind).map(purpose=>({purpose,
   outputScope:outputRole==='식신'?'strict-food':outputRole==='상관'?'hurting-only-not-strict-food':null,
   conditions:requiredContext(purpose).map(name=>condition(name,null,'required')),
   effective:null,favorable:null}));
  const structuralReview=!complete?'partial-context':direct.length?'exact-pair-contact-review':a.layer==='hidden'?'hidden-source-review':b.layer==='hidden'?'hidden-target-review':'visible-conditional-review';
  return {id:e.id,from:e.from,to:e.to,kind:e.kind,sourceTenGod:a.tenGod,targetTenGod:b.tenGod,layerKind:l.layerKind,
   context,hypotheses,structuralReview,legacyStatus:l.legacyStatus,legacyReasons:unique([...l.legacyUnresolved,...l.legacyReviewReasons]),
   // These are review priorities, not ordinal strength or effect predictions.
   effective:null,selectionAuthority:false};
 });
 return {...base,status:complete?'research-review':'partial',edges};
}
// Author-scoped terminology probe. Broad output is NOT a new food pattern.
export function observeOutputControllerScope(result,access){
 if(!result.relativeForce||!result.routeReview||access.status==='unavailable')return [];
 const actors=idx(result.routeReview.occurrences,'output actor');
 return access.candidates.filter(c=>c.family==='killing').map(c=>{
  const anchors=new Set(c.scopedAnchorIds);
  const rows=result.relativeForce.edges.filter(e=>e.kind==='control'&&anchors.has(e.to)&&['식신','상관'].includes(actors.get(e.from)?.tenGod)&&!actors.get(e.from)?.dayReference)
   .map(e=>({edgeId:e.id,from:e.from,to:e.to,tenGod:actors.get(e.from).tenGod,
    strictFood:actors.get(e.from).tenGod==='식신',broaderOutput:true,effective:null}));
  return {candidateId:c.candidateId,rows,strictFoodCount:rows.filter(x=>x.strictFood).length,broadOutputCount:rows.length,selectionAuthority:false};
 });
}
export function compareReferenceRequirements(row,requirements){
 const graph=idx(requirements.edges,'requirement edge');
 const probes=row.probes.map(p=>p.alternatives.filter(a=>a.observed).map(a=>{
  const e=graph.get(a.edgeId);if(!e||e.from!==a.from||e.to!==a.to||e.kind!==a.kind)throw Error('unbound reference requirement');
  return {edgeId:e.id,structuralReview:e.structuralReview,sourceTenGod:e.sourceTenGod,targetTenGod:e.targetTenGod,
   purposes:e.hypotheses.map(h=>h.purpose),requiredUnresolved:unique([...e.context,...e.hypotheses.flatMap(h=>h.conditions)].filter(c=>c.category==='required'&&c.value===null).map(c=>c.name))};
 }));
 return {id:row.id,author:row.author,comparable:row.comparable,state:row.state,probes,effective:null};
}
export function summarizeRequirementComparison(rows){
 const eligible=rows.filter(r=>r.comparable);
 return {references:rows.length,comparable:eligible.length,bySourceState:Object.fromEntries(['supported','limited','blocked'].map(state=>{
  const rs=eligible.filter(r=>r.state===state),counts={};
  for(const r of rs)for(const status of unique(r.probes.flat().map(p=>p.structuralReview)))counts[status]=(counts[status]??0)+1;
  return [state,{references:rs.length,reviewTypes:counts}];
 })),confirmedEffects:0,accuracy:null,selectionAuthority:false};
}
