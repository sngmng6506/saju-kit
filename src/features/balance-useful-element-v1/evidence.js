import { classifyElement } from '../strength-hybrid-v1/evidence.js';
import { elementRelation } from '../../core/elements.js';

// Ordinary-chart balance hypotheses only; no ranking, score or effective force.
const categories=['peer','resource','output','wealth','officer'];
const purposes={peer:'assist-day-master',resource:'generate-day-master',output:'drain-day-master',wealth:'expend-day-master',officer:'control-day-master'};
const preferred={strong:['output','wealth','officer'],weak:['resource','peer']};
// Each item identifies a structural concern to review, not a veto or actual effect.
const checks={
 weak:{
  resource:[['wealth','incoming','control','wealth-controls-resource'],['officer','incoming','generate','officer-generates-resource'],['output','outgoing','control','resource-controls-output']],
  peer:[['officer','incoming','control','officer-controls-peer'],['wealth','outgoing','control','peer-controls-wealth'],['output','outgoing','generate','peer-generates-output']]
 },
 strong:{
  output:[['resource','incoming','control','resource-controls-output'],['officer','outgoing','control','output-controls-officer'],['wealth','outgoing','generate','output-generates-wealth']],
  wealth:[['peer','incoming','control','peer-controls-wealth'],['resource','outgoing','control','wealth-controls-resource'],['officer','outgoing','generate','wealth-generates-officer']],
  officer:[['output','incoming','control','output-controls-officer'],['resource','outgoing','generate','officer-generates-resource'],['wealth','incoming','generate','wealth-generates-officer']]
 }
};
const isSubstantial=r=>r.strongestRole==='principal'||r.strongestRole==='middle';

export function observeBalanceElements(structure){
 const day=structure.dayMaster.element;
 const clashed=new Set(structure.clashes.flatMap(c=>c.positions));
 const observations=structure.profiles.map(p=>{
  const visible=p.visible.filter(v=>v.position!=='day').map(v=>({
   position:v.position,stem:v.stem,rootPositions:[...new Set(v.matches.map(m=>m.position))],
   substantialRootPositions:[...new Set(v.matches.filter(m=>m.role!=='residual').map(m=>m.position))],
   unclashedSubstantialRootPositions:[...new Set(v.matches.filter(m=>m.role!=='residual'&&!clashed.has(m.position)).map(m=>m.position))]
  }));
  const roots=p.roots.map(r=>({position:r.position,branch:r.branch,role:r.strongestRole,clashExposed:clashed.has(r.position)}));
  const substantial=p.roots.some(isSubstantial);
  // Day stem is the reference, never a second instance of peer assistance.
  const presence=visible.length?(visible.some(v=>v.substantialRootPositions.length)?'visible-rooted':'visible-no-substantial-root'):
   roots.length?'hidden-only':'absent';
  return {element:p.element,category:classifyElement(day,p.element),presence,visible,roots,
   substantialRoot:substantial,unclashedSubstantialRoot:roots.some(r=>r.role!=='residual'&&!r.clashExposed),
   monthPrincipal:p.element===structure.month.principalElement};
 });
 if(observations.length!==5||new Set(observations.map(o=>o.category)).size!==categories.length||categories.some(c=>!observations.some(o=>o.category===c)))throw Error('balance element partition');
 return observations;
}

export function buildBalanceBranch(observations,direction){
 if(!Object.hasOwn(preferred,direction))throw Error('invalid balance direction');
 const byCategory=new Map(observations.map(o=>[o.category,o]));
 const candidates=preferred[direction].map(category=>{
  const o=byCategory.get(category);
  const interactions=checks[direction][category].map(([other,orientation,type,code])=>{
   const counterpart=byCategory.get(other);
   const from=orientation==='incoming'?counterpart:o,to=orientation==='incoming'?o:counterpart;
   const rel=elementRelation(from.element,to.element);
   if(rel.type!==type||rel.direction!=='left-to-right')throw Error('balance relation contract');
   return {code,from:from.element,to:to.element,type,candidatePresent:o.presence!=='absent',
    counterpartPresent:counterpart.presence!=='absent',effective:null};
  });
  return {element:o.element,category,purpose:purposes[category],presence:o.presence,
   evidence:o,interactions,priority:null,confirmed:false};
 });
 return {assumedDirection:direction,candidates,
  oppositeTendency:observations.filter(o=>!preferred[direction].includes(o.category)).map(o=>({element:o.element,category:o.category})),
  selectedElement:null,ranking:null};
}
