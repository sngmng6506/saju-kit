import {stemCombination} from '../../core/relations.js';
const ORDER=['year','month','day','hour'];
const index=(xs,f)=>Array.isArray(xs)&&new Set(xs.map(f)).size===xs.length?new Map(xs.map(x=>[f(x),x])):null;
const uniq=xs=>[...new Set(xs)].sort();
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const pairKey=(a,b)=>JSON.stringify([a,b].sort());
const span=(a,b)=>Math.abs(ORDER.indexOf(a.position)-ORDER.indexOf(b.position));
const absent={restrictionConfirmed:null,retentionConfirmed:null,transformationConfirmed:null,effective:null};
// Contact evidence belongs to an exact pair, not an entire ten-god or
// element. Preserve original actions; no rewriting or inferred release.
export function observeCombinationResidualContext(prior,formation,combination,root,supply){
 const complete=prior?.completeHour,status=complete?'diagnostic':'partial';
 const base={version:'combination-residual-context-v1',completeHour:complete,selectionAuthority:false,...absent};
 const empty=()=>({...base,status:'invalid-evidence',pairs:[],participants:[],actions:[]});
 if(typeof complete!=='boolean'||[formation,combination,root,supply].some(x=>!x||x.status!==status||x.completeHour!==complete)||
  formation.effectsConfirmed!==false||combination.selectionAuthority!==false||combination.removalConfirmed!==null||combination.transformationConfirmed!==null||
  root.selectionAuthority!==false||root.rootEffectConfirmed!==null||supply.selectionAuthority!==false||supply.effectiveSupply!==null)return empty();
 const actors=index(prior.stemForce?.occurrences,a=>a.id),roots=index(root.occurrences,a=>a.id),slots=index(root.slots,a=>a.id),
  obs=index(supply.occurrences,a=>a.id),nodes=index(supply.nodes,n=>n.nodeId),raw=index(prior.relativeForce?.edges,e=>e.id),actions=index(supply.actions,e=>e.edgeId),
  forms=index(formation.formations,f=>f.id),pairs=index(combination.pairs,p=>p.id);
 if(!actors||!roots||!slots||!obs||!nodes||!raw||!actions||!forms||!pairs||actors.size!==roots.size||actors.size!==obs.size||raw.size!==actions.size)return empty();
 const visible=[...actors.values()].filter(a=>a.layer==='visible').sort((a,b)=>ORDER.indexOf(a.position)-ORDER.indexOf(b.position));
 if(!same(visible.map(a=>a.position),complete?ORDER:ORDER.slice(0,3)))return empty();
 const byPair=new Map(),contactIds=new Map(visible.map(a=>[a.id,[]]));
 for(let i=0;i<visible.length;i++)for(let j=i+1;j<visible.length;j++){
  const a=visible[i],b=visible[j],id=pairKey(a.id,b.id),literal=stemCombination(a.stem,b.stem),p=pairs.get(id);
  if(!!literal!==!!p)return empty();if(!p)continue;
  const f=forms.get(p.formationId);
  if(!f||f.classification!=='stem-pair'||f.layer!=='stem'||f.transformationConfirmed!==null||p.removalConfirmed!==null||p.effective!==null||
   p.transformation?.transformationConfirmed!==null||p.associatedElement!==literal.associatedElement||f.target!==p.associatedElement||
   !same(p.participants,[a.id,b.id])||!same(f.positions,[a.position,b.position])||p.distance!==span(a,b)||
   p.dayReferenceInvolved!==!!(a.dayReference||b.dayReference)||!a.contacts.includes(f.id)||!b.contacts.includes(f.id))return empty();
  const expected=[a,b].flatMap(x=>visible.filter(y=>y!==a&&y!==b&&stemCombination(x.stem,y.stem)).map(y=>({
   participantId:x.id,partnerId:y.id,partnerDistance:span(x,y),currentDistance:p.distance,
   positionRelation:span(x,y)<p.distance?'closer':span(x,y)===p.distance?'equidistant':'farther',dayReferenceInvolved:y.dayReference})));
  if(!same(p.competing,expected))return empty();
  const between=visible.slice(i+1,j).map(m=>({occurrenceId:m.id,controlsParticipantIds:[a,b].filter(x=>actions.get(m.id+'>'+x.id)?.kind==='control').map(x=>x.id)}));
  if(!same(p.intervening,between))return empty();
  const blocked=between.some(m=>m.controlsParticipantIds.length),comparable=expected.some(x=>x.positionRelation!=='farther');
  const contactHypothesis=!complete?'unresolved':blocked?'intervening-control-review':comparable?'competing-partner-review':p.distance>1?'remote-contact-review':'local-contact-hypothesis';
  if(p.contactHypothesis!==contactHypothesis)return empty();
  const competitors=expected.map(x=>({...x,pairId:pairKey(x.participantId,x.partnerId)}));
  if(competitors.some(x=>!pairs.has(x.pairId)))return empty();
  byPair.set(id,{id,formationId:f.id,participants:[a.id,b.id],span:p.distance,associatedElement:p.associatedElement,
   contactHypothesis,dayReferenceInvolved:p.dayReferenceInvolved,scope:p.dayReferenceInvolved?'self-combination-not-external-removal':'external-role-restriction-review',
   competitors,intervening:between,transformationContext:p.transformation.context,
   monthSupports:p.transformation.monthSupports,seasonSupports:p.transformation.seasonSupports,...absent});
  contactIds.get(a.id).push(id);contactIds.get(b.id).push(id);
 }
 if(byPair.size!==pairs.size||[...forms.values()].filter(f=>f.classification==='stem-pair').length!==pairs.size)return empty();
 for(const a of visible)if(!same(uniq(a.contacts),uniq(contactIds.get(a.id).map(id=>byPair.get(id).formationId))))return empty();
 const participants=[];
 for(const a of visible){
  const ids=contactIds.get(a.id);if(!ids.length)continue;
  const r=roots.get(a.id),s=obs.get(a.id);
  if(!r||!s||r.layer!=='visible'||s.layer!=='visible'||s.effectiveSupply!==null||s.directRoot?.preservationConfirmed!==null||r.rootPreservedConfirmed!==null||
   !same(s.directRoot.uncontestedRootIds,r.uncontestedRootIds)||!same(s.directRoot.contestedRootIds,r.contestedRootIds)||s.directRoot.state!==r.rootAxes.anySubstantial)return empty();
  const rs=[];
  for(const x of r.roots){
   const h=slots.get(x.id);
   if(!h||h.element!==a.element||h.state!==x.state||h.role!==x.role||h.effectiveRoot!==null)return empty();
   rs.push({id:x.id,state:x.state,role:x.role,match:x.match,formationIds:[...h.formationIds],clashIds:[...h.clashIds]});
  }
  const incoming=[];
  for(const id of s.groundedPathIds){
   const p=s.paths.find(p=>p.id===id),n=p&&nodes.get(p.donor.nodeId);
   if(!p||!n||!same(n,p.donor)||p.recipientId!==a.id||p.upstream!=='observed'||p.effectiveSupply!==null||n.independentSupplyConfirmed!==null)return empty();
   incoming.push({pathId:id,donorNodeId:n.nodeId,groundedRootIds:[...n.groundedRootIds],readiness:p.readiness,concerns:[...p.concerns],effective:null});
  }
  // Same ten-god alternatives are literal candidates, not substitutes.
  const alternatives=[...actors.values()].filter(b=>b.id!==a.id&&!b.dayReference&&!a.dayReference&&b.tenGod===a.tenGod).map(b=>({
   id:b.id,layer:b.layer,contactPairIds:contactIds.get(b.id)??[],access:b.layer!=='visible'?'hidden-access-review':contactIds.get(b.id).length?'other-contact-review':'no-stem-pair-observed',
   substitutionConfirmed:null}));
  participants.push({id:a.id,dayReference:a.dayReference,tenGod:a.tenGod,element:a.element,pairIds:[...ids],
   originalRoots:rs,uncontestedRootIds:[...r.uncontestedRootIds],contestedRootIds:[...r.contestedRootIds],incoming,
   retainedEvidence:!complete?'partial':r.uncontestedRootIds.length?'original-root-observed':incoming.length?'original-supply-observed':r.contestedRootIds.length?'original-root-context-review':'original-basis-not-established',
   alternatives,...absent});
 }
 const affectedActions=[];
 for(const e of actions.values()){
  const a=actors.get(e.from),b=actors.get(e.to),q=raw.get(e.edgeId);
  if(!a||!b||!q||q.from!==e.from||q.to!==e.to||q.kind!==e.kind||e.effective!==null||q.effective!==null||e.selectionAuthority!==false)return empty();
  const fromPairs=contactIds.get(a.id)??[],toPairs=contactIds.get(b.id)??[];
  if(!fromPairs.length&&!toPairs.length)continue;
  affectedActions.push({edgeId:e.edgeId,from:e.from,to:e.to,kind:e.kind,fromPairIds:[...fromPairs],toPairIds:[...toPairs],
   samePairIds:fromPairs.filter(id=>toPairs.includes(id)),originalGenerationScreen:e.generationScreen,originalContextBlockers:[...e.contextBlockers],
   access:a.layer==='visible'&&b.layer==='visible'?'visible':'hidden-endpoint-review',...absent});
 }
 return {...base,status,pairs:[...byPair.values()],participants,actions:affectedActions,
  limitations:['stem-pair-not-combination-effect','self-combination-not-external-removal','remote-contact-not-automatic-release','original-root-not-effective-retention','same-ten-god-not-substitution','no-transformation-or-screen-promotion']};
}
