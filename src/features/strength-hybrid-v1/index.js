import { SajuError } from '../../core/error.js';
import { validateNatalPillars } from '../../core/natal.js';
import { HIDDEN_STEMS_VERSION } from '../../core/hidden-stems.js';
import { collectEvidence } from './evidence.js';
import { quantify } from './quantitative.js';

export const STRENGTH_POLICY_VERSION='strength-hybrid-v1';

export function qualitativeRule({Mplus,R,Rcentral,S,P}) {
  if(Mplus&&R>=1&&(S>=1||R>=2))return {id:'Q1',category:'strong'};
  if(!Mplus&&R>=2&&Rcentral&&S>=1)return {id:'Q2',category:'strong'};
  if(!Mplus&&R===0&&S<=1&&P>=2)return {id:'Q3',category:'weak'};
  if(Mplus&&R===0&&S===0&&P>=3)return {id:'Q4',category:'weak'};
  if(R>=1&&(S>=1||Mplus)&&P>=2)return {id:'Q5',category:'mixed'};
  return {id:'Q0',category:'unresolved'};
}

export function reviewFlags(evidence,quantitative,completeHour) {
  const flags=[],{pairs,groups}=evidence.relations;
  const includes=(pair,position)=>pair.left===position||pair.right===position;
  if(pairs.some(pair=>includes(pair,'day')&&pair.stemSignals.some(s=>s.type==='stem.combine')))flags.push('day-stem-combination');
  if(groups.some(group=>['branch.threeHarmony','branch.seasonalHarmony'].includes(group.type))||
    pairs.some(pair=>includes(pair,'month')&&pair.branchSignals.some(s=>s.type==='branch.threeHarmonyCandidate'&&s.includesCardinal)))flags.push('branch-formation');
  const vulnerable=new Set(['month',...evidence.roots.filter(root=>root.grade==='substantial').map(root=>root.position)]);
  if(pairs.some(pair=>(vulnerable.has(pair.left)||vulnerable.has(pair.right))&&pair.branchSignals.some(s=>s.type==='branch.clash')))flags.push('root-or-month-clash');
  // With a missing hour, only an entire scenario interval in an extreme
  // band constitutes quantitative evidence; a possible extreme alone does not.
  const extreme=quantitative.scenarios.some(s=>s.upperUnits<=1500||s.lowerUnits>=8500);
  const rootless=evidence.roots.every(root=>root.grade==='none')&&evidence.counters.S===0&&!evidence.counters.Mplus;
  if(extreme||rootless)flags.push('possible-special-pattern');
  if(!completeHour)flags.push('missing-hour');
  return flags;
}

export function decide(qualitative,stable,completeHour,flags) {
  if(flags.some(flag=>flag!=='missing-hour'))return {status:'review-required',category:null};
  if(!completeHour)return {status:'partial',category:null};
  if(stable&&qualitative===stable)return {status:'candidate',category:stable};
  return {status:'unresolved',category:null};
}

export function analyzeDayMasterStrength(input) {
  if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('strength-input','강약 분석 입력 객체가 필요합니다.');
  const {saju,policy,birthBasis}=input;
  if(policy!==STRENGTH_POLICY_VERSION)throw new SajuError('strength-policy','지원하는 강약 정책을 명시해야 합니다.');
  if(!['verified-chart','provisional-chart'].includes(birthBasis))throw new SajuError('strength-birth-basis','원국 확정 여부를 명시해야 합니다.');
  const pillars=validateNatalPillars(saju);
  const completeHour=pillars.hour!==null;
  const meta={version:STRENGTH_POLICY_VERSION,hiddenStemsBasis:HIDDEN_STEMS_VERSION,completeHour};
  if(birthBasis==='provisional-chart')return {...meta,status:'provisional',category:null,evidence:null,quantitative:null,reviewFlags:['provisional-chart']};
  const evidence=collectEvidence(saju);
  evidence.qualitativeRule=qualitativeRule(evidence.counters);
  const quantitative=quantify(evidence);
  const flags=reviewFlags(evidence,quantitative,completeHour);
  return {...meta,...decide(evidence.qualitativeRule.category,quantitative.stableCategory,completeHour,flags),
    evidence,quantitative,reviewFlags:flags};
}
