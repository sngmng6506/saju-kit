import { SajuError } from '../../core/error.js';
import { analyzeInteractionContext } from '../../core/interaction-context.js';
import { analyzeOrdinaryStrength, structuralDirection, ordinaryDecision } from '../strength-ordinary-v2/index.js';
import { collectEvidence, classifyElement } from '../strength-hybrid-v1/evidence.js';
import { quantify } from '../strength-hybrid-v1/quantitative.js';

export const INTERACTION_SENSITIVITY_VERSION='interaction-sensitivity-v1';

function eligible(f){
  if(!f.associatedElement)return 'unspecified-target';
  if(f.layer==='stem'&&f.positions.includes('day'))return 'day-master-reference-would-change';
  if(!f.complete&&!f.cardinalPositions.length)return 'incomplete-without-cardinal';
  return null;
}

/** A one-relation-at-a-time diagnostic, not a new strength classifier.
 * Formation: hypothetically reallocate participating slots to target element.
 * Clash: hypothetically make one endpoint's root matches unavailable.
 * These independent stress tests never edit the chart or combine their deltas.
 */
export function analyzeInteractionSensitivity(input){
  if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('strength-input','강약 분석 입력 객체가 필요합니다.');
  if(input.policy!==INTERACTION_SENSITIVITY_VERSION)throw new SajuError('strength-policy','합충 민감도 정책을 명시해야 합니다.');
  const {saju,birthBasis}=input;
  const baseline=analyzeOrdinaryStrength({saju,birthBasis,policy:'strength-ordinary-v2'});
  const meta={version:INTERACTION_SENSITIVITY_VERSION,baselinePolicy:baseline.version,
    completeHour:baseline.completeHour,assessment:'hypothetical-only',specialPatternAssessment:'not-assessed'};
  if(baseline.status==='provisional')return {...meta,status:'provisional',baseline:null,context:null,formationScenarios:[],clashScenarios:[]};
  const context=analyzeInteractionContext({saju});
  const evidence=collectEvidence(saju);
  const q=baseline.quantitative;
  const formationScenarios=context.formations.map(f=>{
    const reason=eligible(f);
    if(reason)return {id:f.id,status:'not-modeled',reason};
    const category=classifyElement(evidence.dayMaster.element,f.associatedElement);
    const changed={...evidence,
      stems:evidence.stems.map(s=>f.layer==='stem'&&f.positions.includes(s.position)?{...s,category}:s),
      branches:evidence.branches.map(b=>f.layer==='branch'&&f.positions.includes(b.position)
        ?{...b,hiddenStems:b.hiddenStems.map(h=>({...h,category}))}:b)};
    const simulated=quantify(changed);
    const deltas=simulated.scenarios.map((s,i)=>(s.lowerUnits-q.scenarios[i].lowerUnits)/100);
    return {id:f.id,status:'simulated',assumption:'full-slot-reallocation-only',
      associatedElement:f.associatedElement,range:{min:simulated.min,max:simulated.max},
      delta:{min:Math.min(...deltas),max:Math.max(...deltas)},
      stableCategory:simulated.stableCategory,
      quantitativeCategoryChanged:simulated.stableCategory!==q.stableCategory};
  });
  const clashScenarios=context.clashes.flatMap(c=>c.endpoints.map(({position})=>{
    const unavailable=[];
    const profiles=baseline.structure.profiles.map(p=>({...p,visible:p.visible.map(v=>{
      const rooted=v.matches.some(m=>m.role!=='residual'&&m.position!==position);
      if(v.rooted&&!rooted)unavailable.push({element:p.element,position:v.position,stem:v.stem});
      return {...v,rooted};
    })}));
    const direction=structuralDirection({...baseline.structure,profiles});
    const decision=ordinaryDecision(direction.category,q,baseline.completeHour);
    return {id:c.id+':'+position,clashId:c.id,position,assumption:'one-endpoint-root-access-unavailable',
      unavailable,qualitative:direction,conditionalDecision:decision,
      structuralDirectionChanged:direction.category!==baseline.qualitative.category,
      candidateChanged:decision.category!==baseline.category};
  }));
  return {...meta,status:baseline.completeHour?'diagnostic':'partial',baseline:{status:baseline.status,
    category:baseline.category,qualitative:baseline.qualitative,range:{min:q.min,max:q.max},stableCategory:q.stableCategory},
    context,formationScenarios,clashScenarios};
}
