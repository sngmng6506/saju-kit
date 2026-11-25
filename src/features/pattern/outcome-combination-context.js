import {stemCombination} from '../../core/relations.js';
import {elementRelation} from '../../core/elements.js';
const ORDER=['year','month','day','hour'];
const sorted=xs=>[...new Set(xs)].sort();
const pairKey=(a,b)=>JSON.stringify([a,b].sort());
const distance=(a,b)=>Math.abs(ORDER.indexOf(a.position)-ORDER.indexOf(b.position));
const control=(a,b)=>{const r=elementRelation(a.element,b.element);return r.type==='control'&&r.direction==='left-to-right';};
const source='https://changxianyi.com/guji/ziping/nlc-peihe-review-20261005/rigan-he-er-buhe/';
const commentary='https://yiology.net/books/%E5%91%BD/%E5%85%AB%E5%AD%97%E5%91%BD%E7%90%86/%E5%AD%90%E5%B9%B3%E7%9C%9F%E8%AF%A0/7';
const observed=(n,complete)=>n>0?true:complete?false:null;
// Keep the literal natal chart unchanged. Positional preference is only
// a source-inspired contact hypothesis, not an actual allocation.
export function observeCombinationContext(prior,formation){
 const complete=prior.completeHour;
 const base={version:'outcome-combination-context-v1',source,commentary,completeHour:complete,selectionAuthority:false,transformationConfirmed:null,removalConfirmed:null};
 if(!formation||formation.completeHour!==complete)return {...base,status:'invalid-evidence',pairs:[],branchFormations:[]};
 const visible=prior.stemForce.occurrences.filter(o=>o.layer==='visible').sort((a,b)=>ORDER.indexOf(a.position)-ORDER.indexOf(b.position));
 const byPos=new Map(visible.map(o=>[o.position,o]));
 const raw=formation.formations.filter(f=>f.classification==='stem-pair');
 const pairRows=new Map();
 for(const f of raw){
  const [a,b]=f.positions.map(p=>byPos.get(p));
  if(f.positions.length!==2||!a||!b||a.id===b.id||stemCombination(a.stem,b.stem)?.associatedElement!==f.target||pairRows.has(pairKey(a.id,b.id)))
   return {...base,status:'invalid-evidence',pairs:[],branchFormations:[]};
  pairRows.set(pairKey(a.id,b.id),f);
 }
 const pairs=[];
 for(let i=0;i<visible.length;i++)for(let j=i+1;j<visible.length;j++){
  const a=visible[i],b=visible[j],combo=stemCombination(a.stem,b.stem);
  if(!combo)continue;
  const f=pairRows.get(pairKey(a.id,b.id));
  if(!f)return {...base,status:'invalid-evidence',pairs:[],branchFormations:[]};
  const participants=[a,b],d=distance(a,b);
  const competing=participants.flatMap((p,k)=>visible.filter(o=>!participants.includes(o)&&stemCombination(p.stem,o.stem)).map(o=>({
   participantId:p.id,partnerId:o.id,partnerDistance:distance(p,o),currentDistance:d,
   positionRelation:distance(p,o)<d?'closer':distance(p,o)===d?'equidistant':'farther',dayReferenceInvolved:o.dayReference
  })));
  const intervening=visible.filter(o=>ORDER.indexOf(o.position)>ORDER.indexOf(a.position)&&ORDER.indexOf(o.position)<ORDER.indexOf(b.position)).map(o=>({
   occurrenceId:o.id,controlsParticipantIds:participants.filter(p=>control(o,p)).map(p=>p.id)
  }));
  const blocked=intervening.some(o=>o.controlsParticipantIds.length);
  const day=participants.some(o=>o.dayReference);
  const comparableCompetition=competing.some(c=>c.positionRelation!=='farther');
  const contactHypothesis=!complete?'unresolved':blocked?'intervening-control-review':comparableCompetition?'competing-partner-review':d>1?'remote-contact-review':'local-contact-hypothesis';
  const rootEvidence=participants.map(o=>({occurrenceId:o.id,stem:o.stem,tenGod:o.tenGod,element:o.element,
   originalSubstantialRootPositions:sorted(o.roots.filter(r=>r.role!=='residual'&&!r.clashExposed).map(r=>r.position)),
   originalExactRootPositions:sorted(o.roots.filter(r=>r.role!=='residual'&&!r.clashExposed&&r.match==='exact-stem').map(r=>r.position)),
   clashExposedRootPositions:sorted(o.roots.filter(r=>r.clashExposed).map(r=>r.position)),originalRoleRetained:null}));
  const targetRoots=f.roots.filter(r=>r.role!=='residual'&&!r.clashExposed).map(r=>r.position);
  const external=f.visible.filter(v=>!v.participating&&!v.isDayMaster&&v.outsideUnclashedRoots.length).map(v=>'visible:'+v.position);
  const originalRootIds=rootEvidence.filter(o=>o.element!==f.target&&o.originalSubstantialRootPositions.length).map(o=>o.occurrenceId);
  const transformationContext=!complete?'unresolved':f.flags.monthSupports&&f.flags.seasonSupports&&targetRoots.length&&external.length&&originalRootIds.length?'competing-original-and-target-root-evidence':
   f.flags.monthSupports&&f.flags.seasonSupports&&targetRoots.length&&external.length&&contactHypothesis==='local-contact-hypothesis'&&!f.flags.directClash&&!f.flags.competingTarget?'target-supply-hypothesis':'target-supply-review';
  pairs.push({id:pairKey(a.id,b.id),formationId:f.id,participants:participants.map(o=>o.id),associatedElement:f.target,distance:d,dayReferenceInvolved:day,competing,intervening,
   contactHypothesis,removalScope:day?'self-combination-not-external-removal':'external-combination-review',
   removalHypothesis:day?'not-external-removal':contactHypothesis==='local-contact-hypothesis'?'local-role-restriction-review':'role-restriction-unresolved',
   transformation:{context:transformationContext,monthSupports:f.flags.monthSupports,seasonSupports:f.flags.seasonSupports,
    targetSubstantialRootPositions:sorted(targetRoots),externalRootedProjectionIds:external,originalRootIds,rootEvidence,
    limitations:[...f.limitations],transformationConfirmed:null},
   competingPartnerObserved:observed(competing.length,complete),removalConfirmed:null,effective:null});
 }
 if(pairs.length!==pairRows.size)return {...base,status:'invalid-evidence',pairs:[],branchFormations:[]};
 // Preserve complete vs partial branch contacts without treating a six
 // harmony, cardinal pair or assembly as an interchangeable free stem.
 const branchFormations=formation.formations.filter(f=>f.layer==='branch').map(f=>({
  formationId:f.id,classification:f.classification,positions:[...f.positions],associatedElement:f.target,
  structurallyComplete:f.flags.structurallyComplete,monthSupports:f.flags.monthSupports,seasonSupports:f.flags.seasonSupports,
  clashIds:f.clashOverlap.map(c=>c.id),competingIds:f.competingOverlaps.map(c=>c.id),
  targetSupplyScreen:f.contextScreen,affectedRoots:f.affectedRoots.map(r=>({...r})),limitations:[...f.limitations],transformationConfirmed:null
 }));
 return {...base,status:complete?'diagnostic':'partial',pairs,branchFormations,limitations:['no-automatic-removal','no-stem-or-branch-rewrite','positional-preference-not-allocation','ordinary-pattern-scope-only']};
}
// Role restriction is candidate-local and directed: a symmetric pair does
// not by itself identify which participant should lose its role.
export function observeCombinationRoles(review,context,prior){
 const base={candidateId:review.candidateId,selectionAuthority:false,removalConfirmed:null};
 if(review.status==='out-of-scope')return {...base,status:'out-of-scope',routes:[]};
 if(context.status==='invalid-evidence')return {...base,status:'invalid-evidence',routes:[]};
 const byId=new Map(prior.stemForce.occurrences.map(o=>[o.id,o])),pairs=new Map(context.pairs.map(p=>[p.id,p]));
 const routes=[];
 for(const r of review.rules)for(const w of r.witnesses){
  for(const e of w.edges.filter(e=>e.kind==='combine')){
   const pair=pairs.get(pairKey(e.from,e.to));
   if(!pair)return {...base,status:'invalid-evidence',routes:[]};
   const obstacle=w.roles.obstacle,helper=w.roles.helper;
   const intended=r.kind==='rescue'&&obstacle&&helper&&pair.participants.includes(obstacle)&&pair.participants.includes(helper)&&obstacle!==helper;
   const target=intended?byId.get(obstacle):null;
   const retained=target?[...byId.values()].filter(o=>o.id!==target.id&&!pair.participants.includes(o.id)&&o.tenGod===target.tenGod&&!o.dayReference):[];
   const protectedIds=sorted([...review.anchorIds,...Object.entries(w.roles).filter(([role])=>role!=='obstacle'&&role!=='helper').map(([,id])=>id)]);
   routes.push({ruleId:r.id,witnessId:w.id,pairId:pair.id,intendedObstacleId:target?.id??null,helperId:intended?helper:null,
    roleRestrictionHypothesis:intended?pair.removalHypothesis:'no-directed-removal-intent',
    originalRoleRoots:target?pair.transformation.rootEvidence.find(o=>o.occurrenceId===target.id)??null:null,
    otherSameTenGodOccurrences:retained.map(o=>({occurrenceId:o.id,layer:o.layer,accessConfirmed:null})),
    protectedRoleContacts:protectedIds.filter(id=>pair.participants.includes(id)),protectedRolePreserved:null,
    removalConfirmed:null,transformationConfirmed:null});
  }
 }
 return {...base,status:context.completeHour?'diagnostic':'partial',routes};
}
