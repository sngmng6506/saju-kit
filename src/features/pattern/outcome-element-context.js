import {elementRelation} from '../../core/elements.js';
import {evaluateArguments} from './outcome-argumentation.js';
import {evaluateSourceClauseScenario,sourceEffectClauses} from './outcome-source-effect-policy.js';

export const ELEMENT_CONTEXT_VERSION='p1-4d-element-context-model-v2';
const ELEMENTS=['wood','fire','earth','metal','water'];
const ORDER=['year','month','day','hour'];
const SOURCES=Object.freeze({
 roots:'https://www.donglishuzhai.net/chapter/3719.html',
 commentary:'https://changxianyi.com/guji/ziping/wz-20260914/chapter-007/',
 season:'https://zh.wikisource.org/zh-hant/滴天髓闡微'
});
const axisNames=['visible','seasonSupports','principalSupports','cleanPrincipalRoot','substantialRoot','clearContacts','monthContextClear','noRootedBurdenBasis','noRootedGeneratorBasis','localGroundedControlCoverage','cleanMonthPrincipalRoot','independentLocalResourceBasis','noRootedControllerBasis'];
// These are deliberately narrow, experimental sufficient conditions for
// MODEL hypotheses. They are not definitions of classical 强/弱, nor
// necessary conditions for them. No score, weights or axis voting.
const freezeTerms=xs=>Object.freeze(xs.map(x=>Object.freeze(x)));
const required=(xs,value=true)=>xs.map(axis=>({axis,value}));
const ruleConditions=Object.freeze({
 strong:freezeTerms(required(['visible','seasonSupports','principalSupports','cleanPrincipalRoot','clearContacts','monthContextClear','noRootedBurdenBasis'])),
 strongResource:freezeTerms(required(['visible','seasonSupports','principalSupports','cleanMonthPrincipalRoot','clearContacts','monthContextClear','independentLocalResourceBasis','noRootedControllerBasis'])),
 weak:freezeTerms([...required(['visible','clearContacts','monthContextClear','noRootedGeneratorBasis','localGroundedControlCoverage']),...required(['seasonSupports','principalSupports','substantialRoot'],false)])
});
// Logical implications of the observed axes, not claims about effective
// strength. A null consequent is unknown; only an explicit contradiction
// is rejected here. Preserve the existing strict clean-root input gate.
const implications=Object.freeze([
 ['cleanPrincipalRoot',true,'substantialRoot',true],
 ['cleanMonthPrincipalRoot',true,'cleanPrincipalRoot',true],
 ['cleanMonthPrincipalRoot',true,'substantialRoot',true],
 ['cleanMonthPrincipalRoot',true,'principalSupports',true],
 ['localGroundedControlCoverage',true,'visible',true],
 ['localGroundedControlCoverage',true,'noRootedControllerBasis',false],
 ['localGroundedControlCoverage',true,'noRootedBurdenBasis',false],
 ['independentLocalResourceBasis',true,'visible',true],
 ['independentLocalResourceBasis',true,'noRootedGeneratorBasis',false],
 ['noRootedBurdenBasis',true,'noRootedControllerBasis',true]
].map(Object.freeze));
export function elementContextModelContract(){
 return {version:ELEMENT_CONTEXT_VERSION,axes:[...axisNames],ruleConditions,implications};
}
const index=(xs,f)=>Array.isArray(xs)&&xs.every(x=>x&&typeof x==='object')&&new Set(xs.map(f)).size===xs.length?new Map(xs.map(x=>[f(x),x])):null;
const lit=(propositionId,sign='for')=>({propositionId,sign});
const key=(...x)=>JSON.stringify(x);
const ref=(owner,id,field)=>({owner,id,field});
const eq=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&new Set(a).size===a.length&&new Set(b).size===b.length&&a.every(x=>b.includes(x));
const supports=r=>r.type==='same'||r.type==='generate'&&r.direction==='left-to-right';
const left=(a,b,k)=>{const r=elementRelation(a,b);return r.type===k&&r.direction==='left-to-right';};
const validRelation=(r,e)=>r?.type===e.type&&r?.direction===e.direction;
const noAuthority=x=>x&&x.selectionAuthority===false;
const cleanState='uncontested-substantial-observation';
const donorStates=['grounded-observation','context-review','no-substantial-root-observed','partial'];
const clauseMap=new Map(sourceEffectClauses().map(c=>[c.id,c]));

export function evaluateElementContextModel({completeHour,element,axes,evidenceRefs}={}){
 const bad=()=>({status:'invalid-evidence',element,selectionAuthority:false,effective:null,judgments:[],ruleResults:[]});
 if(typeof completeHour!=='boolean'||!ELEMENTS.includes(element)||!axes||!evidenceRefs||
  Object.keys(axes).length!==axisNames.length||axisNames.some(k=>![true,false,null].includes(axes[k])||
   !Array.isArray(evidenceRefs[k])||!evidenceRefs[k].length))return bad();
 // Impossible input contracts must not manufacture a strength hypothesis.
 if(axes.cleanPrincipalRoot===true&&axes.substantialRoot!==true||
  axes.localGroundedControlCoverage===true&&axes.visible!==true||
  implications.some(([a,av,b,bv])=>axes[a]===av&&axes[b]!==null&&axes[b]!==bv))return bad();
 const observations=axisNames.map(id=>({id,subject:element,kind:'element-context-observation',level:'observation'}));
 const hypotheses=['strong','weak'].map(id=>({id,subject:element,kind:'experimental-element-context-hypothesis',level:'structural-hypothesis'}));
 const evidence=axisNames.filter(k=>axes[k]!==null).map(k=>({id:key(k,axes[k]),...lit(k,axes[k]?'for':'against'),
  refs:evidenceRefs[k],applicability:'complete-only'}));
 const toPremises=terms=>terms.map(({axis,value})=>lit(axis,value?'for':'against'));
 const strongPremises=toPremises(ruleConditions.strong),resourcePremises=toPremises(ruleConditions.strongResource),weakPremises=toPremises(ruleConditions.weak);
 const rule=(id,target,sign,premises)=>({id,policyId:ELEMENT_CONTEXT_VERSION,conclusion:lit(target,sign),premises,
  refs:[ref('experimental-element-context-policy',ELEMENT_CONTEXT_VERSION,'model-conditions')],applicability:'complete-only'});
 const rules=[rule('strong-model','strong','for',strongPremises),rule('weak-model','weak','for',weakPremises),
  rule('strong-contrast','weak','against',strongPremises),rule('weak-contrast','strong','against',weakPremises),
  rule('strong-resource-model','strong','for',resourcePremises),rule('strong-resource-contrast','weak','against',resourcePremises)];
 const r=evaluateArguments({scope:completeHour?'complete':'partial',propositions:[...observations,...hypotheses],evidence,rules});
 if(!['diagnostic','partial'].includes(r.status))return bad();
 const byId=new Map(r.judgments.map(j=>[j.id,j]));
 return {status:r.status,element,selectionAuthority:false,effective:null,strongState:byId.get('strong').state,weakState:byId.get('weak').state,
  hypotheses:r.judgments.filter(j=>j.level==='structural-hypothesis'),judgments:r.judgments,ruleResults:r.ruleResults,
  propositions:[...observations,...hypotheses],evidence,rules};
}

// Bind exact physical roots and donor observations. Never count a root
// again merely because another visible occurrence references it.
export function reviewElementContexts(prior,root,supply,source){
 const complete=prior?.completeHour,status=complete?'diagnostic':'partial';
 const base={version:ELEMENT_CONTEXT_VERSION,completeHour:complete,selectionAuthority:false,effective:null,sources:SOURCES};
 const empty=reason=>({...base,status:'invalid-evidence',reason,elements:[],actions:[]});
 if(typeof complete!=='boolean'||[root,supply,source].some(x=>!noAuthority(x)||x.status!==status||x.completeHour!==complete)||
  root.rootEffectConfirmed!==null||supply.effectiveSupply!==null||source.effectConfirmed!==null)return empty('upstream');
 const actors=index(prior.stemForce?.occurrences,a=>a.id),slots=index(root.slots,s=>s.id),ro=index(root.occurrences,a=>a.id),
  nodes=index(supply.nodes,n=>n.nodeId),edges=index(supply.actions,e=>e.edgeId),sourceRows=index(source.actions,e=>e.edgeId);
 if([actors,slots,ro,nodes,edges,sourceRows].some(x=>!x)||ro.size!==actors.size)return empty('identity');
 const visible=[...actors.values()].filter(a=>a.layer==='visible'),hidden=[...actors.values()].filter(a=>a.layer==='hidden');
 const positions=complete?ORDER:ORDER.slice(0,3);
 if(!eq(visible.map(a=>a.position),positions)||slots.size!==hidden.length||
  [...actors.values()].some(a=>!ELEMENTS.includes(a.element)||!positions.includes(a.position)||!['visible','hidden'].includes(a.layer)||
   !Array.isArray(a.contacts)||a.id!==(a.layer==='visible'?'visible:'+a.position:'hidden:'+a.position+':'+a.stem)||
   a.graphNodeId!==(a.layer==='visible'?a.position+':stem':a.position+':branch:'+a.element)||!ro.has(a.id)))return empty('actor-binding');
 for(const a of hidden){
  const s=slots.get(a.id);
  if(!s||s.position!==a.position||s.stem!==a.stem||s.element!==a.element||s.role!==a.hiddenRole||s.effectiveRoot!==null||
   !['principal','middle','residual'].includes(s.role)||!['clash-exposed','formation-contested','residual-context',cleanState].includes(s.state)||
   s.state===cleanState&&s.role==='residual'||s.state==='residual-context'&&s.role!=='residual')return empty('slot-binding');
 }
 // The upstream occurrence root projection must cover every physical
 // same-element substantial slot. Do not accept two mutually consistent
 // but jointly incomplete donor/root rows as proof of clearance.
 for(const a of visible){
  const rr=ro.get(a.id),rs=[...slots.values()].filter(s=>s.element===a.element&&s.role!=='residual');
  if(!eq(rr.uncontestedRootIds,rs.filter(s=>s.state===cleanState).map(s=>s.id))||
   !eq(rr.contestedRootIds,rs.filter(s=>s.state!==cleanState).map(s=>s.id)))return empty('occurrence-root-coverage');
 }
 const groups=new Map();
 for(const a of actors.values()){if(!groups.has(a.graphNodeId))groups.set(a.graphNodeId,[]);groups.get(a.graphNodeId).push(a);}
 if(groups.size!==nodes.size)return empty('node-coverage');
 for(const [id,as] of groups){
  const n=nodes.get(id),a=as[0];
  if(!n||n.element!==a.element||n.position!==a.position||!eq(n.occurrenceIds,as.map(x=>x.id))||!donorStates.includes(n.state)||
   n.independentSupplyConfirmed!==null||!Array.isArray(n.groundedRootIds)||!Array.isArray(n.contestedRootIds)||
   n.groundedRootIds.some(r=>slots.get(r)?.element!==n.element||slots.get(r)?.state!==cleanState)||
   n.contestedRootIds.some(r=>!slots.has(r)||slots.get(r).element!==n.element||slots.get(r).state===cleanState||slots.get(r).role==='residual'))return empty('node-binding');
  const local=a.layer==='visible'?null:as.map(x=>slots.get(x.id)).filter(s=>s.role!=='residual');
  const rr=ro.get(a.id);
  const grounded=local?local.filter(s=>s.state===cleanState).map(s=>s.id):rr.uncontestedRootIds;
  const contested=local?local.filter(s=>s.state!==cleanState).map(s=>s.id):rr.contestedRootIds;
  if(!eq(n.groundedRootIds,grounded)||!eq(n.contestedRootIds,contested)||!eq(n.contacts,a.contacts)||
   as.some(x=>x.element!==a.element||x.position!==a.position||x.layer!==a.layer||!eq(x.contacts,a.contacts)))return empty('node-root-coverage');
  const expectedState=n.groundedRootIds.length&&!a.contacts.length?'grounded-observation':
   n.groundedRootIds.length||n.contestedRootIds.length?'context-review':complete?'no-substantial-root-observed':'partial';
  if(n.state!==expectedState)return empty('node-state');
 }
 const origins=field=>ELEMENTS.filter(e=>[...actors.values()].every(a=>validRelation(a.seasonal?.[field],elementRelation(e,a.element))));
 const season=origins('seasonRelation'),principal=origins('principalRelation');
 if(season.length!==1||principal.length!==1)return empty('season-binding');
 const monthFlags=[...ro.values()].map(r=>r.seasonal?.monthBranchContested);
 if(monthFlags.some(x=>typeof x!=='boolean')||new Set(monthFlags).size!==1)return empty('month-context');
 const monthClear=!monthFlags[0];
 const visibleEdges=[];
 for(const e of edges.values()){
  const a=actors.get(e.from),b=actors.get(e.to);
  if(!a||!b||!['generate','control'].includes(e.kind)||e.edgeId!==e.from+'>'+e.to||!left(a.element,b.element,e.kind)||
   e.effective!==null||e.selectionAuthority!==false)return empty('edge-binding');
  if(a.layer==='visible'&&b.layer==='visible')visibleEdges.push(e);
 }
 const expectedVisible=visible.flatMap(a=>visible.filter(b=>a.id!==b.id&&elementRelation(a.element,b.element).direction==='left-to-right').map(b=>a.id+'>'+b.id));
 if(visibleEdges.length!==sourceRows.size||!eq(visibleEdges.map(e=>e.edgeId),expectedVisible))return empty('source-coverage');
 const allNodes=[...nodes.values()];
 const profiles=[];
 for(const element of ELEMENTS){
  const v=visible.filter(a=>a.element===element),rs=[...slots.values()].filter(s=>s.element===element);
  const substantial=rs.filter(s=>s.role!=='residual'),clean=rs.filter(s=>s.state===cleanState),contested=substantial.filter(s=>s.state!==cleanState);
  const elementActors=[...actors.values()].filter(a=>a.element===element);
  const contacts=elementActors.flatMap(a=>a.contacts);
  const generators=allNodes.filter(n=>left(n.element,element,'generate'));
  const burdens=allNodes.filter(n=>left(n.element,element,'control')||left(element,n.element,'generate')||left(element,n.element,'control'));
  const active=n=>n.state==='grounded-observation'||n.state==='context-review';
  const controllers=allNodes.filter(n=>left(n.element,element,'control'));
  const near=(a,b)=>Math.abs(ORDER.indexOf(a)-ORDER.indexOf(b))<=1;
  const monthPrincipal=clean.filter(s=>s.position==='month'&&s.role==='principal');
  // A resource witness must have its own clean physical root outside the
  // month branch, near the donor AND recipient. Repeated visible references
  // to a shared slot are witnesses, not multiple independent roots.
  const resourceWitnesses=[];
  for(const a of v)for(const n of generators){
   if(n.state!=='grounded-observation'||!near(a.position,n.position)||a.graphNodeId===n.nodeId)continue;
   const rootIds=n.groundedRootIds.filter(id=>{
    const slot=slots.get(id);
    return slot&&slot.position!=='month'&&near(slot.position,a.position)&&near(slot.position,n.position);
   });
   if(rootIds.length)resourceWitnesses.push({recipientId:a.id,donorNodeId:n.nodeId,rootIds});
  }
  const groundedControllers=visibleEdges.filter(e=>e.kind==='control'&&v.some(a=>a.id===e.to)&&
   Math.abs(ORDER.indexOf(actors.get(e.from).position)-ORDER.indexOf(actors.get(e.to).position))<=1&&
   nodes.get(actors.get(e.from).graphNodeId)?.state==='grounded-observation');
  const seasonRelation=elementRelation(season[0],element),principalRelation=elementRelation(principal[0],element);
  const axes={visible:!!v.length,seasonSupports:supports(seasonRelation),principalSupports:supports(principalRelation),
   cleanPrincipalRoot:clean.some(s=>s.role==='principal'),substantialRoot:!!substantial.length,
   clearContacts:!contacts.length&&!contested.length,monthContextClear:monthClear,
   noRootedBurdenBasis:!burdens.some(active),noRootedGeneratorBasis:!generators.some(active),
   localGroundedControlCoverage:!!v.length&&v.every(a=>groundedControllers.some(e=>e.to===a.id)),
   cleanMonthPrincipalRoot:monthPrincipal.length>0,independentLocalResourceBasis:resourceWitnesses.length>0,
   noRootedControllerBasis:!controllers.some(active)};
  // Scope is a gate, not missing-hour negative evidence.
  const scopedAxes=Object.fromEntries(axisNames.map(k=>[k,complete?axes[k]:null]));
  const evidenceRefs={
   visible:[ref('stemForce',prior.stemForce.version??'stem-force-evidence-v1','occurrences')],
   seasonSupports:[ref('stemForce',visible[0].id,'seasonal')],
   principalSupports:[ref('stemForce',visible[0].id,'seasonal')],
   cleanPrincipalRoot:[ref('rootContext',root.version??'root-context-review-v1','slots'),...clean.filter(s=>s.role==='principal').map(s=>ref('rootContext',s.id,'state'))],
   substantialRoot:[ref('rootContext',root.version??'root-context-review-v1','slots'),...substantial.map(s=>ref('rootContext',s.id,'role'))],
   clearContacts:[ref('rootContext',root.version??'root-context-review-v1','slots'),...elementActors.map(a=>ref('stemForce',a.id,'contacts'))],
   monthContextClear:[ref('rootContext','visible:month','seasonal')],
   noRootedBurdenBasis:[ref('groundedSupply',supply.version??'grounded-supply-review-v1','nodes'),...burdens.map(n=>ref('groundedSupply',n.nodeId,'state'))],
   noRootedGeneratorBasis:[ref('groundedSupply',supply.version??'grounded-supply-review-v1','nodes'),...generators.map(n=>ref('groundedSupply',n.nodeId,'state'))],
   localGroundedControlCoverage:[ref('groundedSupply',supply.version??'grounded-supply-review-v1','actions'),...groundedControllers.map(e=>ref('groundedSupply',e.edgeId,'kind'))],
   cleanMonthPrincipalRoot:[ref('rootContext',root.version??'root-context-review-v1','slots'),...monthPrincipal.map(s=>ref('rootContext',s.id,'state'))],
   independentLocalResourceBasis:[ref('groundedSupply',supply.version??'grounded-supply-review-v1','nodes'),
    ...[...new Set(resourceWitnesses.map(w=>w.donorNodeId))].map(id=>ref('groundedSupply',id,'groundedRootIds')),
    ...[...new Set(resourceWitnesses.flatMap(w=>w.rootIds))].map(id=>ref('rootContext',id,'state'))],
   noRootedControllerBasis:[ref('groundedSupply',supply.version??'grounded-supply-review-v1','nodes'),...controllers.map(n=>ref('groundedSupply',n.nodeId,'state'))]
  };
  const model=evaluateElementContextModel({completeHour:complete,element,axes:scopedAxes,evidenceRefs});
  if(model.status!==status)return empty('model-evaluation');
  profiles.push({element,visibleIds:v.map(a=>a.id),slotIds:rs.map(s=>s.id),substantialSlotIds:substantial.map(s=>s.id),
   cleanPrincipalSlotIds:clean.filter(s=>s.role==='principal').map(s=>s.id),contestedSlotIds:contested.map(s=>s.id),
   seasonRelation,principalRelation,seasonalStatus:seasonRelation.type==='same'?'season-element':seasonRelation.type==='generate'&&seasonRelation.direction==='left-to-right'?'season-generated':'other-season-context',
   generatorNodeIds:generators.map(n=>n.nodeId),burdenNodeIds:burdens.map(n=>n.nodeId),controllerNodeIds:controllers.map(n=>n.nodeId),
   monthPrincipalRootIds:monthPrincipal.map(s=>s.id),resourceWitnesses,localGroundedControllerEdgeIds:groundedControllers.map(e=>e.edgeId),
   axes:scopedAxes,model,actualStrengthState:'unresolved',excessState:'unresolved',deficiencyState:'unresolved',resistanceState:'unresolved',effective:null});
 }
 const byElement=new Map(profiles.map(p=>[p.element,p]));
 const actions=[];
 for(const e of visibleEdges){
  const row=sourceRows.get(e.edgeId);
  if(!row||row.from!==e.from||row.to!==e.to||row.kind!==e.kind||row.actualEffectState!=='unresolved'||row.effectConfirmed!==null||
   !Array.isArray(row.clauses)||!row.actualEffectPropositionId)return empty('source-binding');
  const expected=sourceEffectClauses().filter(c=>c.kind===e.kind&&c.fromElement===actors.get(e.from).element&&c.toElement===actors.get(e.to).element);
  if(!eq(row.clauses.map(c=>c.clauseId),expected.map(c=>c.id)))return empty('clause-coverage');
  const clauses=[];
  for(const c of row.clauses){
   const def=clauseMap.get(c.clauseId),a=actors.get(def.role==='source'?e.from:e.to);
   if(c.predicateActorId!==a.id||c.predicateElement!==a.element||c.predicate!==def.predicate||c.predicateState!=='unresolved'||c.effectConfirmed!==null)return empty('predicate-binding');
   const p=byElement.get(a.element),modeled=['strong','weak'].includes(def.predicate)?p.model[def.predicate+'State']:'unresolved';
   // A model contrast does not refute a classical predicate. Only a
   // positive model hypothesis is usable as an explicitly conditional
   // scenario assumption, never as native source evidence.
   const scenario=evaluateSourceClauseScenario(def.id,{scope:complete?'complete':'partial',relationState:'supported',predicateState:modeled==='supported'?'supported':'unresolved'});
   if(scenario.status!==status)return empty('clause-scenario');
   clauses.push({clauseId:def.id,predicateElement:a.element,predicate:def.predicate,modelPredicateState:modeled,
    modeledApplicability:scenario.applicability,modeledConsequence:scenario.conditionalConsequence,
    authority:'experimental-model-assumption-only',actualPredicateState:'unresolved',actualEffectState:'unresolved'});
  }
  actions.push({edgeId:e.edgeId,originalEffectPropositionId:row.actualEffectPropositionId,clauses,actualEffectState:'unresolved',effective:null});
 }
 return {...base,status,reason:null,seasonElement:season[0],monthPrincipalElement:principal[0],elements:profiles,actions,
  limitations:['season-not-effective-strength','model-sufficiency-not-classical-necessity','rooted-burden-basis-not-actual-burden','independent-resource-observation-not-effective-supply','rooted-controller-basis-not-confirmed-control','no-overweight-counting','no-excess-deficiency-or-resistance-resolver','no-effect-promotion']};
}
