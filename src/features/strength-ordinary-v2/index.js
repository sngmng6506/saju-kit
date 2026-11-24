import { SajuError } from '../../core/error.js';
import { validateNatalPillars } from '../../core/natal.js';
import { HIDDEN_STEMS_VERSION } from '../../core/hidden-stems.js';
import { analyzeElementStructure } from '../../core/element-structure.js';
// Reuse the fixed v1 observation and quantitative policy for a controlled
// comparison. Do not reuse its special-pattern/relationship abstention gate.
import { collectEvidence, classifyElement, isSupport, CATEGORIES } from '../strength-hybrid-v1/evidence.js';
import { quantify } from '../strength-hybrid-v1/quantitative.js';

export const ORDINARY_STRENGTH_POLICY_VERSION='strength-ordinary-v2';

export function structuralDirection(structure) {
  const counts=Object.fromEntries(CATEGORIES.map(c=>[c,{rootedStems:0,principalBranches:0}]));
  for(const p of structure.profiles){
    const category=classifyElement(structure.dayMaster.element,p.element);
    counts[category].rootedStems=p.visible.filter(v=>v.position!=='day'&&v.rooted).length;
    counts[category].principalBranches=p.principalPositions.length;
  }
  const margins={};
  for(const key of ['rootedStems','principalBranches']){
    margins[key]=CATEGORIES.reduce((sum,c)=>sum+(isSupport(c)?1:-1)*counts[c][key],0);
  }
  const a=margins.rootedStems,b=margins.principalBranches;
  const category=a>=0&&b>=0&&(a>0||b>0)?'strong':
    a<=0&&b<=0&&(a<0||b<0)?'weak':'mixed';
  return {rule:'two-channel-dominance-v1',category,counts,margins};
}

export function ordinaryDecision(direction,quantitative,completeHour){
  if(!completeHour)return {status:'partial',category:null};
  if(direction!==quantitative.stableCategory)return {status:'unresolved',category:null};
  const category=direction==='strong'&&quantitative.min>=85?'very-strong':
    direction==='weak'&&quantitative.max<=15?'very-weak':direction;
  return {status:'candidate',category};
}

/**
 * Conditional ordinary-chart assessment. No special-pattern classification,
 * transformation, force transfer, root deletion, or favorable-element ruling.
 */
export function analyzeOrdinaryStrength(input){
  if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('strength-input','강약 분석 입력 객체가 필요합니다.');
  const {saju,policy,birthBasis}=input;
  if(policy!==ORDINARY_STRENGTH_POLICY_VERSION)throw new SajuError('strength-policy','일반 강약 정책을 명시해야 합니다.');
  if(!['verified-chart','provisional-chart'].includes(birthBasis))throw new SajuError('strength-birth-basis','원국 확정 여부를 명시해야 합니다.');
  const pillars=validateNatalPillars(saju);
  const completeHour=pillars.hour!==null;
  const meta={version:ORDINARY_STRENGTH_POLICY_VERSION,hiddenStemsBasis:HIDDEN_STEMS_VERSION,completeHour,
    scope:'ordinary-chart-assumption',specialPatternAssessment:'not-assessed',
    interactionAssessment:'observed-only'};
  if(birthBasis==='provisional-chart')return {...meta,status:'provisional',category:null,structure:null,
    qualitative:null,quantitative:null,caveats:['provisional-chart']};
  const structure=analyzeElementStructure({saju});
  const qualitative=structuralDirection(structure);
  const quantitative=quantify(collectEvidence(saju));
  const caveats=[];
  if(structure.formations.length)caveats.push('formation-effects-unmodeled');
  if(structure.clashes.length)caveats.push('clash-effects-unmodeled');
  if(!completeHour)caveats.push('missing-hour');
  return {...meta,...ordinaryDecision(qualitative.category,quantitative,completeHour),
    structure,qualitative,quantitative,caveats};
}
