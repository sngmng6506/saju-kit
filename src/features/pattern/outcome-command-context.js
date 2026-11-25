import {analyzeMonthCommand} from '../../core/month-command.js';
import {elementRelation} from '../../core/elements.js';
import {compareForceProfiles} from '../../core/relative-force.js';
const uniq=xs=>[...new Set(xs)].sort();
const supported=r=>r.type==='same'||r.type==='generate'&&r.direction==='left-to-right';
const distance=(a,b)=>Math.abs(['year','month','day','hour'].indexOf(a)-['year','month','day','hour'].indexOf(b));
const source='https://taodial.com/zh-hant/learn/classics/san-ming-tong-hui/read/012/';
// Physical branch principal comparison is not clash strength. A clash may
// involve two earth branches and must not invent a controlling side.
export function observeBranchPressure(prior,rootContext,formation){
 const base={selectionAuthority:false,rootDamageConfirmed:null,transformationConfirmed:null};
 const invalid=()=>({...base,status:'invalid-evidence',clashes:[],formations:[]});
 if(rootContext.status==='invalid-evidence'||formation.completeHour!==prior.completeHour)return invalid();
 const slots=rootContext.slots,principals=slots.filter(s=>s.role==='principal');
 const complete=prior.completeHour,occurrences=prior.stemForce.occurrences;
 const clashRows=[];
 for(const c of formation.clashes){
  if(c.positions.length!==2||new Set(c.positions).size!==2)return invalid();
  const rows=c.positions.map(p=>principals.filter(s=>s.position===p));
  if(rows.some(xs=>xs.length!==1))return invalid();
  const [a,b]=rows.map(xs=>xs[0]);
  const relation=elementRelation(a.element,b.element);
  const affected=slots.filter(s=>c.positions.includes(s.position));
  const sides=[a,b].map(s=>{
   const outside=slots.filter(t=>!c.positions.includes(t.position)&&t.element===s.element&&t.state==='uncontested-substantial-observation');
   const opposition=formation.clashes.filter(x=>x.id!==c.id&&x.positions.includes(s.position));
   return {position:s.position,principalId:s.id,element:s.element,monthReference:s.position==='month',
    affectedRootIds:affected.filter(t=>t.position===s.position).map(t=>t.id),
    outsideUncontestedRootIds:outside.map(t=>t.id),otherClashIds:opposition.map(x=>x.id),
    sameElementOutsideSupportObserved:outside.length?true:complete?false:null,damageConfirmed:null};
  });
  const relief=rootContext.clashes.filter(x=>x.clashId===c.id);
  if(relief.length!==1)return invalid();
  clashRows.push({clashId:c.id,positions:[...c.positions],distance:distance(...c.positions),principalRelation:relation,sides,
   reliefAlternatives:relief[0].alternatives,relativeClashStrength:null,damageConfirmed:null});
 }
 const formations=[];
 for(const f of formation.formations.filter(f=>f.layer==='branch')){
  const participants=slots.filter(s=>f.positions.includes(s.position)),outside=slots.filter(s=>!f.positions.includes(s.position));
  const targetRoots=outside.filter(s=>s.element===f.target&&s.state==='uncontested-substantial-observation');
  const originals=participants.filter(s=>s.element!==f.target&&s.role!=='residual').map(s=>{
   const other=outside.filter(t=>t.element===s.element&&t.state==='uncontested-substantial-observation');
   return {rootId:s.id,originalElement:s.element,externalRootIds:other.map(t=>t.id),externalExactRootIds:other.filter(t=>t.stem===s.stem).map(t=>t.id),
    projectionIds:[...s.exactProjectionIds],dayReferenceMatches:s.dayReferenceMatches,originalPreserved:null};
  });
  const visible=occurrences.filter(o=>o.layer==='visible'&&!o.dayReference&&o.element===f.target);
  const external=visible.filter(o=>o.roots.some(r=>targetRoots.some(t=>t.id==='hidden:'+r.position+':'+r.stem)));
  formations.push({formationId:f.id,classification:f.classification,positions:[...f.positions],target:f.target,
   structurallyComplete:f.flags.structurallyComplete,monthSupports:f.flags.monthSupports,seasonSupports:f.flags.seasonSupports,
   clashIds:f.clashOverlap.map(c=>c.id),competingIds:f.competingOverlaps.map(c=>c.id),
   targetExternalRootIds:targetRoots.map(t=>t.id),targetExternalProjectionIds:external.map(o=>o.id),
   originals,reviewContext:!complete?'partial':!f.flags.structurallyComplete?'incomplete-contact':f.flags.directClash||f.flags.competingTarget?'disrupted-formation-review':
    targetRoots.length&&external.length&&originals.some(o=>o.externalRootIds.length)?'competing-original-and-target-supply-review':'formation-supply-review',
   transformationConfirmed:null});
 }
 return {...base,status:complete?'diagnostic':'partial',clashes:clashRows,formations,
  limitations:['principal-relation-not-clash-strength','same-element-clash-not-directed-control','external-supply-not-effective-preservation']};
}
// Each source/mode remains a separate hypothesis. Replace only the two
// season support axes with a command-support axis in the sensitivity model;
// literal natal roots, role identity and original comparisons are untouched.
export function projectMonthCommand(prior,rootContext,formation,command){
 const base={version:'outcome-command-review-v1',source,selectionAuthority:false,commandResolved:false,effectiveForce:null,excessConfirmed:null,deficiencyConfirmed:null};
 const empty=(status,reason)=>({...base,status,reason,command:null,variants:[],comparisonCoverage:[]});
 if(rootContext.status==='invalid-evidence')return empty('invalid-evidence','root-context-invalid');
 if(!command||command.status!=='diagnostic')return {...empty('unresolved',command?.reason??'missing-birth-instant'),command:command??null};
 if(!prior.completeHour)return empty('unresolved','missing-hour');
 const slots=rootContext.slots.filter(s=>s.position==='month'),actors=prior.stemForce.occurrences;
 const profiles=prior.relativeForce.profiles,roots=new Map(rootContext.occurrences.map(r=>[r.id,r]));
 const ids=new Set(),variants=[];
 for(const h of command.hypotheses){
  const id=h.sourceId+':'+h.mode;
  if(ids.has(id))return empty('invalid-evidence','duplicate-command-hypothesis');ids.add(id);
  if(!h.command){variants.push({id,sourceId:h.sourceId,mode:h.mode,status:h.status,command:null,slotIds:[],comparisons:[],formationRelations:[],effectiveForce:null});continue;}
  const c=h.command,exact=c.stem===null?[]:slots.filter(s=>s.stem===c.stem),elementSlots=slots.filter(s=>s.element===c.element);
  // Do not invent a literal hidden stem for 艮土/坤土 or an absent stem.
  const slotBasis=c.stem===null?'element-only-source-notation':exact.length?'exact-literal-hidden-stem':'source-stem-not-in-literal-month';
  if(c.stem!==null&&Boolean(exact.length)!==h.literalHiddenStemMatch)return empty('invalid-evidence','literal-month-stem-mismatch');
  const comparisons=[];
  for(const p of rootContext.comparisons){
   const a=actors.find(o=>o.id===p.left),b=actors.find(o=>o.id===p.right);
   if(!a||!b||!roots.has(a.id)||!roots.has(b.id)||!profiles[a.id]||!profiles[b.id])return empty('invalid-evidence','comparison-identity');
   const profile=o=>{
    const axes=Object.fromEntries(Object.entries(roots.get(o.id).sensitivityAxes).filter(([k])=>!['principalSupport','seasonSupport'].includes(k)));
    axes.commandSupport=supported(elementRelation(c.element,o.element));
    const row=roots.get(o.id);
    return {...profiles[o.id],axes,
     rootPositions:row.roots?uniq(row.roots.filter(r=>row.uncontestedRootIds.includes(r.id)).map(r=>r.position)):profiles[o.id].rootPositions,
     localGenerationNodes:row.localSupply?.generation.observedIds??profiles[o.id].localGenerationNodes,
     localPeerNodes:row.localSupply?.peer.observedIds??profiles[o.id].localPeerNodes};
   };
   const conditional=compareForceProfiles(profile(a),profile(b),{completeHour:true,comparable:true});
   comparisons.push({left:a.id,right:b.id,originalRelation:p.original.relation,rootSensitivityRelation:p.sensitivity.relation,conditional,
    forceComparison:null});
  }
  const formationRelations=formation.formations.filter(f=>f.target!=null).map(f=>({formationId:f.id,relation:elementRelation(c.element,f.target),
   supportsTarget:supported(elementRelation(c.element,f.target)),transformationConfirmed:null}));
  variants.push({id,sourceId:h.sourceId,mode:h.mode,status:h.atBoundary?'boundary-review':h.status,command:{...c},slotBasis,
   slotIds:exact.map(s=>s.id),elementSlotIds:elementSlots.map(s=>s.id),
   slotContexts:elementSlots.map(s=>({id:s.id,state:s.state,exactProjectionIds:[...s.exactProjectionIds]})),
   comparisons,formationRelations,effectiveForce:null});
 }
 const comparisonCoverage=rootContext.comparisons.map(p=>{
  const hypotheses=variants.map(v=>({id:v.id,relation:v.comparisons.find(x=>x.left===p.left&&x.right===p.right)?.conditional.relation??null}));
  const available=hypotheses.filter(h=>h.relation!==null),relations=uniq(available.map(h=>h.relation));
  return {left:p.left,right:p.right,hypotheses,availableCount:available.length,expectedCount:variants.length,
   status:!available.length?'unavailable':relations.length>1?'source-or-mode-sensitive':available.length!==variants.length?'incomplete-source-coverage':
    variants.some(v=>v.status==='boundary-review')?'boundary-review':relations[0]==='unresolved'?'unresolved-agreement':'available-hypotheses-agree',
   forceComparison:null};
 });
 return {...base,status:variants.some(v=>v.command)?'diagnostic':'unresolved',reason:null,command,variants,comparisonCoverage,
  limitations:['source-hypothesis-not-actual-command','element-only-not-stem-identity','no-birth-inference','command-support-not-effective-force','no-weights-or-role-selection']};
}
export function observeMonthCommandReview(input,birth,prior,rootContext,formation){
 // An hour pillar is not an exact timestamp. Preserve the established
 // standalone V10 contract; only internal birth-aware callers forward birth.
 const reason=input.birthBasis==='provisional-chart'?'provisional-chart':!prior.completeHour?'missing-hour':birth?.period!=null?'birth-period':null;
 const command=reason||birth==null?{status:'unresolved',reason:reason??'missing-birth-instant'}:analyzeMonthCommand({saju:input.saju,birth});
 return projectMonthCommand(prior,rootContext,formation,command);
}
