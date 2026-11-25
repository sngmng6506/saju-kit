import { observePathNode } from '../../core/path-node-evidence.js';
import { analyzeRootDynamics } from '../../core/root-dynamics.js';
import { analyzeElementStructure } from '../../core/element-structure.js';
import { elementRelation } from '../../core/elements.js';
import { SajuError } from '../../core/error.js';
export const REMEDY_EVIDENCE_VERSION='remedy-evidence-v1';
const ELEMENTS=['wood','fire','earth','metal','water'];
const slot=n=>n.position+':'+n.layer;
const controls=(a,b)=>{const r=elementRelation(a,b);return r.type==='control'&&r.direction==='left-to-right';};
export function observeRemedyEvidence(dynamics,structure){
 const byId=new Map(dynamics.nodes.map(n=>[n.id,n]));
 const evidence=n=>observePathNode(n,structure);
 const control=dynamics.edges.filter(e=>e.type==='control');
 const month=dynamics.nodes.find(n=>n.position==='month'&&n.layer==='branch'&&n.role==='principal');
 return control.map(e=>{
  const threat=byId.get(e.from),target=byId.get(e.to);
  const remedyElement=ELEMENTS.find(x=>controls(x,threat.element));
  const remedies=control.filter(r=>r.to===threat.id&&byId.get(r.from).element===remedyElement).flatMap(r=>{
   const remedy=byId.get(r.from);
   if(new Set([slot(remedy),slot(threat),slot(target)]).size!==3)return [];
   return [{remedy:evidence(remedy),distance:r.distance,adjacent:r.local&&e.local,
    obstructions:control.filter(x=>x.to===remedy.id&&x.from!==target.id&&x.from!==threat.id).map(x=>({node:evidence(byId.get(x.from)),distance:x.distance})),confirmed:false}];
  });
  // These are contextual signals only, not selection of a desirable target.
  const receivesMonthGeneration=dynamics.edges.some(x=>x.type==='generate'&&x.from===month?.id&&x.to===target.id);
  return {target:evidence(target),threat:evidence(threat),remedyElement,distance:e.distance,
   targetContext:{dayReference:target.id==='day:stem',monthPrincipal:target.id===month?.id,
    sameElementAsMonth:target.element===month?.element,receivesMonthGeneration},
   remedies,nonDayRemedyNodes:dynamics.nodes.filter(n=>n.id!=='day:stem'&&n.element===remedyElement).map(evidence),
   diseaseConfirmed:false,remedyConfirmed:false};
 });
}
export function analyzeRemedyEvidence(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('remedy-input','병약 분석 입력 객체가 필요합니다.');
 if(input.policy!==REMEDY_EVIDENCE_VERSION)throw new SajuError('remedy-policy','병약 정책을 명시해야 합니다.');
 if(!['verified-chart','provisional-chart'].includes(input.birthBasis))throw new SajuError('strength-birth-basis','원국 확정 여부를 명시해야 합니다.');
 const structure=analyzeElementStructure({saju:input.saju});
 const meta={version:REMEDY_EVIDENCE_VERSION,assessment:'protection-motif-only',completeHour:structure.completeHour,usefulElement:null,confirmed:false};
 if(input.birthBasis==='provisional-chart')return {...meta,status:'unavailable',reason:'provisional-chart',motifs:[]};
 return {...meta,status:structure.completeHour?'diagnostic':'partial',
  motifs:observeRemedyEvidence(analyzeRootDynamics({saju:input.saju}),structure)};
}
