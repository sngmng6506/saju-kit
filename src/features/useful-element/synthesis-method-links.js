import {stemInfo} from '../../core/elements.js';
const uniq=xs=>[...new Set(xs)];
const key=(a,b,k)=>JSON.stringify([a,b,k]);
const refKey=(c,r,w)=>JSON.stringify([c,r,w]);
const visibleId=p=>'visible:'+p;
// A root-dynamics branch node is aggregated by physical branch and element.
// Never manufacture a single hidden-stem identity from that aggregate.
export function createSynthesisNodeIndex(saju,access){
 const map=new Map(),byOccurrence=new Map();
 const add=(nodeId,occurrenceId,element,layer)=>{
  if(!map.has(nodeId))map.set(nodeId,{nodeId,element,layer,occurrenceIds:[]});
  const row=map.get(nodeId);
  if(row.element!==element||row.layer!==layer||byOccurrence.has(occurrenceId))throw Error('synthesis node identity');
  row.occurrenceIds.push(occurrenceId);byOccurrence.set(occurrenceId,nodeId);
 };
 for(const [p,v] of Object.entries(saju.pillars))if(v)add(p+':stem',visibleId(p),stemInfo(v.stem).element,'stem');
 for(const h of access.hidden)add(h.position+':branch:'+h.element,h.id,h.element,'branch');
 return {map,byOccurrence};
}
// Retain calendar facts and structural predicates without resolving a
// textual prescription. The alternatives are not promoted to baseline.
export function projectSynthesisTiming(climate){
 const base={policy:climate?.version??null,selectionAuthority:false,conditionResolved:false,adequacyConfirmed:null};
 if(!climate)return {...base,status:'unavailable',calendar:null,alternatives:[]};
 const temporal=climate.temporal??null;
 const times=new Map((temporal?.conditions??[]).map(c=>[c.when,c]));
 const structural=new Map((climate.structuralConditions??[]).map(c=>[c.when,c]));
 return {...base,status:temporal?.status??'source-unavailable',calendar:temporal,
  alternatives:(climate.evidence?.sourceProfile?.alternatives??[]).map((a,i)=>({id:'alternative:'+i,when:a.when,stems:[...a.stems],groups:a.groups?.map(g=>[...g])??null,
   calendarPredicate:times.get(a.when)??null,structuralPredicate:structural.get(a.when)??null,conditionResolved:false,selectionAuthority:false}))};
}
export function observeSupplementaryMethods(saju,synthesis,pattern,mediation,remedy){
 const base={selectionAuthority:false,usefulElement:null,confirmed:false};
 const empty=status=>({...base,status,mediation:{pairs:[]},remedy:{motifs:[]},limitations:[]});
 if(!['diagnostic','partial'].includes(synthesis.status))return empty(synthesis.status);
 const {map,byOccurrence}=createSynthesisNodeIndex(saju,pattern.access);
 const candidates=new Map(synthesis.candidates.filter(q=>q.status!=='out-of-scope').map(q=>[q.candidateId,q]));
 const refs=new Map();
 for(const q of candidates.values()){
  for(const [items,role] of [[q.anchors,'anchor'],[q.participants,'participant']]){
   for(const x of items){
    const id=x.occurrenceId??x.id,nodeId=byOccurrence.get(id);
    if(!nodeId||id==='visible:day')continue;
    if(!refs.has(nodeId))refs.set(nodeId,[]);
    refs.get(nodeId).push({candidateId:q.candidateId,occurrenceId:id,role});
   }
  }
 }
 const node=n=>{
  const row=map.get(n.id);
  if(!row||row.element!==n.element||row.layer!==n.layer)throw Error('unmapped supplementary node: '+n.id);
  return {...row,basis:n.layer==='stem'?'exact-visible-occurrence':'shared-branch-element-context',dayReference:n.dayReference,
   anchorObserved:n.anchorObserved,intactSubstantialRoot:n.intactSubstantialRoot,patternRoles:refs.get(n.id)??[],
   balance:synthesis.balance.branches.map(b=>({assumedDirection:b.assumedDirection,membership:b.candidates.some(c=>c.element===n.element)?'candidate':'outside-candidates'})),
   climateBaselineGroupIds:synthesis.climate.groups.filter(g=>g.elements.includes(n.element)).map(g=>g.id),
   climateConditionalAlternativeIds:synthesis.climate.alternatives.filter(g=>g.elements.includes(n.element)).map(g=>g.id),effective:null};
 };
 const edge=e=>{
  const a=byOccurrence.get(e.from),b=byOccurrence.get(e.to);
  return a&&b?key(a,b,e.kind):null;
 };
 // Index exact candidate/witness identities; one alternative anchor at a
 // time. Do not join mandatory edges of separate witnesses into a route.
 const paths=[];
 for(const q of pattern.reviews.filter(q=>candidates.has(q.candidateId)))for(const r of q.rules)for(const w of r.witnesses){
  const mandatory=new Set(w.edges.map(edge).filter(Boolean));
  const variants=[{scope:'mandatory',anchorId:null,edges:mandatory},...(w.anchorBindings??[]).filter(b=>b.edge).map(b=>({scope:'anchor-alternative',anchorId:b.anchorId,edges:new Set([...mandatory,edge(b.edge)].filter(Boolean))}))];
  paths.push({candidateId:q.candidateId,ruleId:r.id,witnessId:w.id,kind:r.kind,threatRuleId:r.threatRuleId??null,threatWitnessId:w.threatWitnessId??null,variants});
 }
 const link=(keys,kind)=>{
  const rows=[];
  for(const p of paths){
   if(kind&&p.kind!==kind)continue;
   const matched=p.variants.filter(v=>keys.every(k=>v.edges.has(k)));
   // Mandatory match subsumes its alternative variants.
   const ms=matched.some(v=>v.scope==='mandatory')?matched.filter(v=>v.scope==='mandatory'):matched;
   for(const v of ms)rows.push({candidateId:p.candidateId,ruleId:p.ruleId,witnessId:p.witnessId,kind:p.kind,scope:v.scope,anchorId:v.anchorId,
    threatRuleId:p.threatRuleId,threatWitnessId:p.threatWitnessId,effective:null});
  }
  return rows;
 };
 const pairs=mediation.pairs.map(p=>({
  from:p.from,to:p.to,via:p.via,reviewStatus:p.reviewStatus??null,robustTopTwo:p.nominalConfrontation?.robustTopTwo??null,
  routeCount:p.routes.length,absentMediator:p.absentMediator,mediatorNodes:p.mediatorNodes.map(node),
  routes:p.routes.map(r=>{
   const nodes=r.nodes.map(node),[a,b,c]=nodes;
   const links=link([key(a.nodeId,b.nodeId,'generate'),key(b.nodeId,c.nodeId,'generate')]);
   return {id:r.id,nodes,adjacent:r.adjacent,oneGap:r.oneGap,obstructionNodeIds:uniq(r.obstructions.map(o=>node(o.node).nodeId)),
    patternLinks:links,linkBasis:nodes.some(n=>n.layer==='branch')?'shared-branch-element-context':'exact-visible-path',effective:null};
  }),effective:null
 }));
 const motifs=remedy.motifs.map((m,i)=>{
  const target=node(m.target),threat=node(m.threat);
  const damages=link([key(threat.nodeId,target.nodeId,'control')],'damage');
  const damageKeys=new Set(damages.map(d=>refKey(d.candidateId,d.ruleId,d.witnessId)));
  return {id:'remedy:'+i,target,threat,remedyElement:m.remedyElement,targetContext:{...m.targetContext},damageLinks:damages,
   remedies:m.remedies.map(r=>{
    const n=node(r.remedy);
    const links=link([key(n.nodeId,threat.nodeId,'control')],'rescue').filter(x=>damageKeys.has(refKey(x.candidateId,x.threatRuleId,x.threatWitnessId)));
    return {node:n,adjacent:r.adjacent,obstructionNodeIds:uniq(r.obstructions.map(o=>node(o.node).nodeId)),rescueLinks:links,
     linkBasis:[target,threat,n].some(n=>n.layer==='branch')?'shared-branch-element-context':'exact-visible-path',effective:null};
   }),diseaseConfirmed:null,remedyConfirmed:null};
 });
 return {...base,status:synthesis.status,mediation:{policy:mediation.version,status:mediation.status,pairs},remedy:{policy:remedy.version,status:remedy.status,motifs},
  limitations:['aggregate-node-not-exact-hidden-stem','structural-route-not-successful-mediation','obstruction-not-confirmed-disease','same-witness-links-not-independent-votes','no-method-priority']};
}
