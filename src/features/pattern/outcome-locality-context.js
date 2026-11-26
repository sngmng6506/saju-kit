import {elementRelation} from '../../core/elements.js';
const order=['year','month','day','hour'];
const pos=a=>order.indexOf(a.position);
const index=(xs,f)=>Array.isArray(xs)&&new Set(xs.map(f)).size===xs.length?new Map(xs.map(x=>[f(x),x])):null;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const pair=(a,b)=>a+'>'+b;
const pressureKey=(a,b)=>JSON.stringify([a,b]);
// Physical position is not propagation time. Intervenors are visible
// occurrences only; branch evidence stays in its original graph scope.
export function observeLocalityContext(prior,supply,interposition,pressureReview){
 const complete=prior?.completeHour,status=complete?'diagnostic':'partial';
 const base={version:'locality-context-v1',completeHour:complete,selectionAuthority:false,effective:null,noninterferenceConfirmed:null};
 const empty=()=>({...base,status:'invalid-evidence',relations:[]});
 const neutral=interposition?.roleNeutral;
 if(typeof complete!=='boolean'||[supply,neutral,pressureReview].some(x=>!x||x.status!==status||x.completeHour!==complete||x.selectionAuthority!==false)||
  supply.effectiveSupply!==null||neutral.effectConfirmed!==null||pressureReview.effective!==null||pressureReview.neutralizationConfirmed!==null)return empty();
 const actors=index(prior.stemForce?.occurrences,a=>a.id),raw=index(prior.relativeForce?.edges,e=>e.id),actions=index(supply.actions,e=>e.edgeId),
  observations=index(supply.occurrences,a=>a.id),pressures=index(pressureReview.pressures,p=>p.id),paths=index(neutral.paths,p=>p.id),dependencyPaths=index(pressureReview.paths,p=>p.id);
 if(!actors||!raw||!actions||!observations||!pressures||!paths||!dependencyPaths||raw.size!==actions.size||actors.size!==observations.size||paths.size!==dependencyPaths.size)return empty();
 const visible=[...actors.values()].filter(a=>a.layer==='visible').sort((a,b)=>pos(a)-pos(b));
 if(!same(visible.map(a=>a.position),complete?order:order.slice(0,3))||visible.some(a=>a.id!=='visible:'+a.position||a.graphNodeId!==a.position+':stem'||!observations.has(a.id)))return empty();
 const relations=[];
 // Check the exact visible relation inventory including reverse edges,
 // so a deleted intermediate action cannot masquerade as noninterference.
 for(const a of visible)for(const b of visible)if(a!==b){
  const r=elementRelation(a.element,b.element),id=pair(a.id,b.id),e=actions.get(id),q=raw.get(id);
  const directed=r.direction==='left-to-right'&&['generate','control'].includes(r.type);
  if(directed!==!!e||directed!==!!q)return empty();
  if(e&&(e.from!==a.id||e.to!==b.id||e.kind!==r.type||q.from!==a.id||q.to!==b.id||q.kind!==r.type||
   e.effective!==null||q.effective!==null||e.selectionAuthority!==false||!Array.isArray(e.contextBlockers)||
   e.contextBlockers.includes('nonadjacent')!==(Math.abs(pos(a)-pos(b))>1)))return empty();
 }
 const edge=(a,b,kind)=>{const e=actions.get(pair(a.id,b.id));return e?.kind===kind?e:null;};
 const ref=e=>e?{edgeId:e.edgeId,kind:e.kind,from:e.from,to:e.to,span:Math.abs(pos(actors.get(e.from))-pos(actors.get(e.to))),
  generationScreen:e.generationScreen,controlComparison:e.controlComparison,effective:null}:null;
 const pressureRef=(a,b)=>{const id=pressureKey(a.graphNodeId,b.graphNodeId),p=pressures.get(id);return p&&p.controllerNodeId===a.graphNodeId&&p.targetNodeId===b.graphNodeId&&p.effective===null&&p.neutralizationConfirmed===null?id:null;};
 for(const a of visible)for(const b of visible){
  const e=actions.get(pair(a.id,b.id));if(!e)continue;
  const span=Math.abs(pos(a)-pos(b)),direction=pos(a)<pos(b)?1:-1;
  const between=visible.filter(m=>Math.min(pos(a),pos(b))<pos(m)&&pos(m)<Math.max(pos(a),pos(b))).sort((x,y)=>direction*(pos(x)-pos(y)));
  const intervenors=[];
  for(const m of between){
   const s=observations.get(m.id);
   if(!s||s.effectiveSupply!==null||s.directRoot?.preservationConfirmed!==null)return empty();
   const roles={sourceToIntervenorGenerate:ref(edge(a,m,'generate')),sourceToIntervenorControl:ref(edge(a,m,'control')),
    intervenorToSourceGenerate:ref(edge(m,a,'generate')),intervenorToSourceControl:ref(edge(m,a,'control')),
    intervenorToTargetGenerate:ref(edge(m,b,'generate')),intervenorToTargetControl:ref(edge(m,b,'control')),
    targetToIntervenorGenerate:ref(edge(b,m,'generate')),targetToIntervenorControl:ref(edge(b,m,'control'))};
   const motifs=[],routeRefs=[];
   if(roles.intervenorToSourceControl)motifs.push('source-controller');
   if(roles.intervenorToTargetControl)motifs.push('target-controller');
   if(roles.intervenorToSourceGenerate)motifs.push('source-supplier');
   if(roles.intervenorToTargetGenerate)motifs.push('target-supplier');
   if(roles.sourceToIntervenorGenerate)motifs.push('alternative-source-output');
   if(roles.sourceToIntervenorControl)motifs.push('alternative-source-control');
   if(roles.targetToIntervenorGenerate)motifs.push('target-output');
   if(roles.targetToIntervenorControl)motifs.push('target-control');
   if(a.element===m.element)motifs.push('source-element-peer');
   if(b.element===m.element)motifs.push('target-element-peer');
   const controllerRefs=[];
   for(const [x,y] of [[m,a],[m,b],[a,m],[b,m]])if(edge(x,y,'control')){
    const id=pressureRef(x,y);if(!id)return empty();controllerRefs.push(id);
   }
   if(e.kind==='control'){
    const candidates=[];
    if(roles.intervenorToSourceControl)candidates.push('protection');
    if(roles.sourceToIntervenorGenerate&&roles.intervenorToTargetGenerate)candidates.push('mediation');
    for(const kind of candidates){
     const id=JSON.stringify([kind,m.graphNodeId,a.graphNodeId,b.graphNodeId]),p=paths.get(id),d=dependencyPaths.get(id);
     if(!p||!d||p.kind!==kind||p.helper!==m.graphNodeId||p.threat!==a.graphNodeId||p.target!==b.graphNodeId||
      p.effectConfirmed!==null||d.effectConfirmed!==null||d.neutralizationConfirmed!==null||d.targetPressureId!==pressureKey(a.graphNodeId,b.graphNodeId))return empty();
     motifs.push(kind==='protection'?'intervening-protection-candidate':'intervening-mediation-candidate');
     routeRefs.push({pathId:id,kind,structuralScreen:p.structuralScreen,structuralDependencyRank:d.structuralDependencyRank,neutralizationConfirmed:null});
    }
   }
   intervenors.push({id:m.id,position:m.position,dayReference:m.dayReference,rootState:s.directRoot.state,
    groundedPathIds:[...s.groundedPathIds],roles,motifs,controllerRefs,routeRefs,effectConfirmed:null});
  }
  // Enumerate only ordered, visible literal generation chains using
  // intervenors; no peer substitution, no arbitrary route outside span.
  const chains=[];
  for(let mask=1;mask<(1<<between.length);mask++){
   const sequence=[a,...between.filter((_,i)=>mask&(1<<i)),b],es=sequence.slice(1).map((x,i)=>edge(sequence[i],x,'generate'));
   if(es.every(Boolean))chains.push({id:JSON.stringify(sequence.map(x=>x.id)),actorIds:sequence.map(x=>x.id),edges:es.map(ref),
    allLegsAdjacent:es.every(x=>ref(x).span===1),effective:null});
  }
  const directPressureId=e.kind==='control'?pressureRef(a,b):null;
  if(e.kind==='control'&&!directPressureId)return empty();
  relations.push({edgeId:e.edgeId,from:a.id,to:b.id,kind:e.kind,span,order:direction===1?'source-before-target':'source-after-target',adjacent:span===1,
   intervenors,chains,directPressureId,originalGenerationScreen:e.generationScreen,originalContextBlockers:[...e.contextBlockers],
   contextState:!complete?'partial':span===1?'adjacent-observation':intervenors.some(m=>m.routeRefs.length)||chains.length?'intervening-route-observed':'intervening-relations-observed',
   localityEffectConfirmed:null,noninterferenceConfirmed:null,effective:null});
 }
 return {...base,status,relations,limitations:['visible-stems-only','position-not-time','intervenor-relations-not-obstruction','no-peer-substitution','no-nonlocal-screen-promotion','no-effect-or-neutralization']};
}
