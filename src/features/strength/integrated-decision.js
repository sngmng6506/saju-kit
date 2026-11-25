import { createStrengthEvidenceProvider } from './request-evidence.js';
import { SajuError } from '../../core/error.js';
import { evaluateNetworkDecision } from './network-decision.js';
import { evaluateOutputCapacity } from './output-capacity.js';

export const MULTIAXIS_V3_VERSION='strength-multiaxis-v3';
const key=p=>JSON.stringify([p.position,p.role,p.root,p.season,p.basis]);

// Compare matched scenarios, not independently selected range extrema.
export function assessIntegrated(base,capacity){
 const environment=new Map(base.detail.environment.scenarios.map(s=>[key(s.profile),s]));
 const rows=capacity.rows.map(s=>{
  const e=environment.get(key(s.profile));
  if(!e)throw new SajuError('strength-scenario-mismatch','강약 시나리오가 일치하지 않습니다.');
  // Peer branch mass is already represented by root capacity.
  const support=e.mass.peerStem+s.conditionalResource;
  // Keep full wealth/officer pressure: allocation to a route is not
  // evidence that the remaining pressure has disappeared.
  const burden={output:s.outputResidualHypothesis,wealth:e.mass.wealth,officer:e.mass.officer};
  return {profile:s.profile,mode:s.mode,support,burden,peerStem:e.mass.peerStem,
   conditionalResource:s.conditionalResource,nominalOutput:s.outputTotal};
 });
 const robustSupport=rows.every(r=>Object.values(r.burden).every(b=>r.support>b));
 const resourcePresent=rows.every(r=>r.conditionalResource>0);
 const grounds=[...base.decision.grounds],conflicts=[...base.decision.conflicts];
 if(base.axes.rootCapacity.min>0&&resourcePresent&&robustSupport)
  grounds.push('bounded-route-support');
 const strong=grounds.some(g=>g!=='low-root-capacity-and-dominant-pressure');
 const weak=grounds.includes('low-root-capacity-and-dominant-pressure');
 // Prior unresolved conflicts cannot be silently overturned by a hypothetical model.
 if(strong&&weak&&!conflicts.includes('opposing-grounds'))conflicts.push('opposing-grounds');
 return {direction:conflicts.length?null:strong?'strong':weak?'weak':null,grounds,conflicts,
  evidence:{robustSupport,resourcePresent,rows}};
}
export function analyzeMultiaxisStrengthV3(input,context){
 return evaluateIntegratedDecision(input,createStrengthEvidenceProvider(context));
}
export function evaluateIntegratedDecision(input,provider){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('strength-input','강약 분석 입력 객체가 필요합니다.');
 if(input.policy!==MULTIAXIS_V3_VERSION)throw new SajuError('strength-policy','다축 v3 정책을 명시해야 합니다.');
 const args={saju:input.saju,birthBasis:input.birthBasis};
 const base=evaluateNetworkDecision({...args,policy:'strength-multiaxis-v2'},provider);
 const meta={version:MULTIAXIS_V3_VERSION,completeHour:base.completeHour,scope:base.scope,
  assessment:'experimental-integrated',specialPatternAssessment:'not-assessed',interactionAssessment:'hypothetical-only',
  baselinePolicy:base.version,baselineDirection:base.direction,axes:base.axes,caveats:base.caveats,
  baselineDecision:base.decision,completionCount:base.completionCount??null};
 if(!base.decision)return {...meta,status:base.status,direction:null,decision:null};
 const capacity=evaluateOutputCapacity({...args,policy:'output-capacity-v1'},provider);
 const decision=assessIntegrated(base,capacity.analysis);
 return {...meta,status:decision.direction?'hypothesis':'unresolved',direction:decision.direction,decision};
}
