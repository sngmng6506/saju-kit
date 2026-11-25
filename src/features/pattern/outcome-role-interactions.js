import {key,edgeKey,validStates} from './outcome-role-contract.js';
// Project declared relationships only. JointOutcome owns the general
// route allocation search; this module never performs a second search.
const rk=r=>key(r.ruleId,r.witnessId);
const uniq=xs=>[...new Set(xs)].sort();
export function observeRoleInteractions(review,capacity,rootContext,policies,complete){
 const base={version:'role-interaction-contract-v1',candidateId:review.candidateId,selectionAuthority:false,selectedObjective:null,netEffectConfirmed:null};
 const empty=status=>({...base,status,interpretations:[],anchorAlternatives:[],simultaneousContexts:[],sharedEvidence:[]});
 if(review.status==='out-of-scope'||!['resource','killing'].includes(review.family))return empty('out-of-scope');
 const {objectiveReview,killingStrategies,killingWealth,resourceStrategies}=policies;
 if(!capacity||!rootContext||capacity.status==='invalid-evidence'||rootContext.status==='invalid-evidence'||
  [objectiveReview,killingStrategies,killingWealth,resourceStrategies].some(p=>!p||p.candidateId!==review.candidateId||p.status==='invalid-evidence'||p.selectionAuthority!==false))return empty('invalid-evidence');
 const actors=new Map(capacity.occurrences.map(o=>[o.id,o])),roots=new Map(rootContext.occurrences.map(o=>[o.id,o]));
 const entries=review.rules.flatMap(r=>r.witnesses.map(w=>({r,w})));
 const routes=new Map(entries.map(({r,w})=>[key(r.id,w.id),w]));
 if(actors.size!==capacity.occurrences.length||roots.size!==rootContext.occurrences.length||actors.size!==roots.size||
  [...actors.keys()].some(id=>!roots.has(id))||routes.size!==entries.length)return empty('invalid-evidence');
 const interpretations=[],anchorAlternatives=[],simultaneousContexts=[],sharedEvidence=[];
 const ids=new Set();
 let invalid=false;
 const record=(bucket,row)=>{
  if(ids.has(row.id)){invalid=true;return;}
  ids.add(row.id);bucket.push({...row,effectConfirmed:null});
 };
 const relation=e=>({from:e.from,to:e.to,kind:e.kind});
 const readRefs=refs=>refs.every(r=>r&&routes.has(rk(r)));
 const objectives=xs=>xs.map(o=>({id:o.objective??o.id,status:o.conditionalStatus}));
 const checked=xs=>Array.isArray(xs)&&xs.every(o=>typeof(o.objective??o.id)==='string'&&validStates.includes(o.conditionalStatus)&&o.effectConfirmed===null&&o.actualDemand===null);
 const rootIds=id=>roots.get(id)?.uncontestedRootIds??[];
 const shared=(contextId,groups)=>{
  // A literal root can support several occurrences, but is not several
  // independent supplies. Only observed shared root IDs are recorded.
  const inventory=new Map();
  for(const g of groups)for(const id of uniq(g.actorIds)){
   if(!actors.has(id)){invalid=true;continue;}
   for(const rootId of uniq(rootIds(id))){
    if(!inventory.has(rootId))inventory.set(rootId,[]);
    const uses=inventory.get(rootId);
    if(!uses.some(x=>x.groupId===g.id&&x.occurrenceId===id))uses.push({groupId:g.id,occurrenceId:id});
   }
  }
  const sharedRoots=[...inventory].filter(([,uses])=>new Set(uses.map(x=>x.groupId)).size>1).map(([rootId,uses])=>({rootId,uses,independentSupplyConfirmed:null}));
  if(sharedRoots.length)record(sharedEvidence,{id:JSON.stringify(['shared',contextId]),contextId,sharedRoots,independentSupplyConfirmed:null});
 };
 // D1: competing interpretations of the same exact intervention. Their
 // premise statuses are not votes, nor proof of logical exclusivity.
 const grouped=new Map();
 for(const o of objectiveReview.objectives){
  if(!checked([o])||!readRefs([o.route,...o.relatedRoutes])){invalid=true;continue;}
  const id=JSON.stringify([o.clause,rk(o.route)]);
  if(!grouped.has(id))grouped.set(id,[]);
  grouped.get(id).push(o);
 }
 for(const [k,os] of grouped)if(os.length>1){
  if(new Set(os.map(o=>o.objective)).size!==os.length){invalid=true;continue;}
  record(interpretations,{id:JSON.stringify(['interpretations',k]),route:os[0].route,kind:'competing-interpretations',objectives:objectives(os),exclusiveConfirmed:null});
 }
 // D2: explicitly paired food and mediation contexts on the same killing.
 const food=new Map(killingStrategies.food.map(x=>[rk(x.route),x])),med=new Map(killingStrategies.mediation.map(x=>[x.id,x]));
 if(food.size!==killingStrategies.food.length||med.size!==killingStrategies.mediation.length)return empty('invalid-evidence');
 for(const c of killingStrategies.comparisons){
  const f=food.get(rk(c.foodRoute)),m=med.get(c.mediationContextId);
  if(!f||!m||!readRefs([c.foodRoute])||f.killingId!==m.killingId||f.dayId!==m.dayId||
   c.killingId!==f.killingId||c.dayId!==f.dayId||c.effectConfirmed!==null){invalid=true;continue;}
  const id=JSON.stringify(['food-mediation',rk(c.foodRoute),m.id]);
  const expected=edgeKey(f.killingId,f.dayId,'control');
  if(c.sharedRelations.length!==1||edgeKey(c.sharedRelations[0].from,c.sharedRelations[0].to,c.sharedRelations[0].kind)!==expected||
   c.crossContact&&(c.crossContact.from!==m.resourceId||c.crossContact.to!==f.foodId||c.crossContact.kind!=='control'||
    !validStates.includes(c.crossContact.status)||c.crossContact.effective!==null)){invalid=true;continue;}
  record(simultaneousContexts,{id,kind:'food-mediation-contact',foodRoute:c.foodRoute,mediationContextId:m.id,
   relationStatus:complete?c.interferenceStatus:'partial',sharedRelations:c.sharedRelations.map(relation),contact:c.crossContact??null,
   simultaneousEffectConfirmed:null});
  shared(id,[{id:'food',actorIds:[f.foodId,f.killingId,f.dayId]},{id:'mediation',actorIds:[m.resourceId,m.killingId,m.dayId]}]);
 }
 // D3: explicitly bound rescue and supply are simultaneous structural
 // relations, not alternatives or two independent wealth occurrences.
 for(const x of killingWealth.dualRoles){
  if(!readRefs([x.rescue,x.supply,x.boundThreat])||!checked(x.objectives)||x.netEffectConfirmed!==null){invalid=true;continue;}
  const id=JSON.stringify(['wealth-dual',rk(x.rescue),rk(x.supply),rk(x.boundThreat)]);
  record(simultaneousContexts,{id,kind:'bound-wealth-rescue-and-supply',rescue:x.rescue,supply:x.supply,boundThreat:x.boundThreat,
   sharedActorIds:[x.wealthId,x.killingId],objectives:objectives(x.objectives),simultaneousEffectConfirmed:null});
  shared(id,[{id:'rescue',actorIds:[x.wealthId,x.resourceId,x.outputId,x.killingId]},{id:'supply',actorIds:[x.wealthId,x.killingId]}]);
 }
 // D4: anchor bindings of one output witness are alternative
 // hypothetical allocations, not combined evidence for the same path.
 const drains=new Map();
 for(const x of resourceStrategies.outputDrain){
  if(!readRefs([x.route])||!checked(x.objectives)||!actors.has(x.anchorId)||!actors.has(x.outputId)||!actors.has(x.dayId)||
   !(routes.get(rk(x.route)).anchorBindings??[]).some(b=>b.anchorId===x.anchorId)){invalid=true;continue;}
  const k=rk(x.route);if(!drains.has(k))drains.set(k,[]);drains.get(k).push(x);
 }
 for(const [k,xs] of drains){
  const expected=routes.get(k).anchorBindings.map(b=>b.anchorId),actual=xs.map(x=>x.anchorId);
  if(new Set(actual).size!==actual.length||actual.length!==expected.length||expected.some(id=>!actual.includes(id))||
   xs.some(x=>x.outputId!==xs[0].outputId||x.dayId!==xs[0].dayId)){invalid=true;continue;}
  if(xs.length<2)continue;
  const id=JSON.stringify(['anchor-options',k]);
  record(anchorAlternatives,{id,kind:'one-anchor-per-hypothetical-route',route:xs[0].route,
   options:xs.map(x=>({anchorId:x.anchorId,pathConditionalStatus:x.pathConditionalStatus,objectives:objectives(x.objectives)})),
   selectedAnchorId:null,simultaneousSupplyConfirmed:null});
  shared(id,xs.map(x=>({id:x.anchorId,actorIds:[x.anchorId,x.outputId,x.dayId]})));
 }
 return invalid?empty('invalid-evidence'):{...base,status:complete?'diagnostic':'partial',interpretations,anchorAlternatives,simultaneousContexts,sharedEvidence,
  limitations:['declared-relationships-only','joint-outcome-owns-general-allocation','shared-roots-not-additive','no-interpretation-voting','no-confirmed-conflict-or-effect']};
}
