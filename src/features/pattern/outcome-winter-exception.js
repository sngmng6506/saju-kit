import {analyzeClimateUsefulElementV5,CLIMATE_V5_VERSION} from '../climate/requirement-review.js';
const SOURCE='https://donglishuzhai.net/chapter/3754.html';
const WINTER=new Set(['해','자','축']);
const W=['정재','편재'],I=['정인','편인'];
const tri=(xs,complete)=>xs.length?true:complete?false:null;
export function projectWinterClimate(input){
 const c=analyzeClimateUsefulElementV5({saju:input.saju,birthBasis:input.birthBasis,policy:CLIMATE_V5_VERSION});
 return {policy:c.version,status:c.status,section:c.evidence?.sourceProfile?.section??null,
  requirements:(c.requirementContext?.requirements??[]).map(r=>({stem:r.stem,element:r.element,exactVisible:[...r.exactVisible],
   exactRootOutsideClash:r.exactRootOutsideClash,effectiveSupply:null})),usefulElement:null,confirmed:false};
}
export function reviewWinterOfficer(prior,review,monthBranch,climate){
 if(review.status==='out-of-scope'||review.family!=='hurting-officer')return review;
 const actors=prior.stemForce.occurrences,day=actors.find(o=>o.dayReference),visible=actors.filter(o=>o.layer==='visible'&&!o.dayReference);
 const winter=day.element==='metal'&&WINTER.has(monthBranch);
 const targets=actors.filter(o=>review.anchorIds.includes(o.id)&&o.layer==='hidden'&&o.position==='month'&&o.tenGod==='상관'&&o.element==='water');
 const officers=visible.filter(o=>o.tenGod==='정관'),hurting=visible.filter(o=>o.tenGod==='상관');
 const wealth=visible.filter(o=>W.includes(o.tenGod)),resource=visible.filter(o=>I.includes(o.tenGod));
 const id='hurting-winter-metal-water-officer-exception';
 const witnesses=winter?targets.flatMap(target=>officers.map(officer=>{
  const e=prior.relativeForce.edges.find(e=>e.from===target.id&&e.to===officer.id&&e.kind==='control');
  if(!e)return null;
  const absence=hurting.length?false:prior.completeHour?true:null;
  const conditions={winterMetal:true,monthlyHiddenHurting:true,visibleOfficer:true,
   noVisibleHurting:absence,visibleWealth:tri(wealth,prior.completeHour),visibleResource:tri(resource,prior.completeHour),
   officerExactUnclashedSubstantialRoots:officer.roots.filter(r=>r.match==='exact-stem'&&r.role!=='residual'&&!r.clashExposed).map(r=>r.position),
   officerEffective:null,climateAdequate:null};
  const flags=[conditions.noVisibleHurting,conditions.visibleWealth,conditions.visibleResource];
  return {id:id+':target='+target.id+'|officer='+officer.id,roles:{target:target.id,officer:officer.id},
   edges:[{from:e.from,to:e.to,kind:e.kind,edgeId:e.id,screen:e.screen,blockers:[...e.blockers],effective:null}],
   source:SOURCE,conditions,visibleHurtingIds:hurting.map(o=>o.id),wealthIds:wealth.map(o=>o.id),resourceIds:resource.map(o=>o.id),
   climatePolicy:climate?.policy??null,contextScreen:flags.includes(false)?'source-condition-opposed':flags.includes(null)?'source-condition-unresolved':'observed-source-subclauses',
   exceptionApplied:null,threatWitnessId:null,effective:null};
 }).filter(Boolean)):[];
 const r={id,kind:'exception',threatRuleId:null,witnesses,observed:witnesses.length?true:!winter||prior.completeHour?false:null,
  unresolvedConditions:['resource-and-wealth-effective','officer-root-effective','climate-adequacy','actual-exception-applicability'],
  conditionResolved:false,effective:null};
 return {...review,rules:[...review.rules,r]};
}
export function needsWinterClimate(prior,monthBranch){
 return WINTER.has(monthBranch)&&prior.stemForce.occurrences.some(o=>o.dayReference&&o.element==='metal');
}
