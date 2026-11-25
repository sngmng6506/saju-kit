import { SajuError } from '../../core/error.js';
import { analyzeRootDynamics } from '../../core/root-dynamics.js';
import { analyzeMultiaxisStrengthV3 } from './integrated-decision.js';

export const STRENGTH_DECISION_VERSION='strength-decision-v1';
const RESOURCE_GROUNDS=['local-resource-and-robust-support','bounded-route-support'];
const WEAK_GROUND='low-root-capacity-and-dominant-pressure';
const CENTRAL_GROUND='central-root-capacity';
const PERIPHERAL_GROUND='peripheral-root-capacity';
const KNOWN_GROUNDS=new Set([CENTRAL_GROUND,WEAK_GROUND,...RESOURCE_GROUNDS]);

// Observation only: no ground or confirmation permission is issued here.
export function observeRootCapacity(axes,dynamics){
 const observations=dynamics.roots.find(r=>r.position==='day').positions;
 const principal=observations.filter(r=>r.strongestRole==='principal');
 const centralPrincipal=principal.filter(r=>['month','day'].includes(r.position)).map(r=>r.position);
 const peripheralPrincipal=principal.filter(r=>['year','hour'].includes(r.position)).map(r=>r.position);
 const capacity={...axes.rootCapacity};
 return {observations,capacity,centralPrincipal,peripheralPrincipal,
  meetsStrongCapacity:capacity.min>=40,
  meetsLowCapacity:capacity.max<=20,
  centralCandidate:capacity.min>=40&&centralPrincipal.length>0,
  peripheralCandidate:capacity.min>=40&&centralPrincipal.length===0&&peripheralPrincipal.length>0};
}

function checkGrounds(result){
 if(result.decision?.grounds.some(g=>!KNOWN_GROUNDS.has(g)))
  throw new SajuError('strength-ground-contract','알 수 없는 강약 근거입니다.');
}
function resourceGrounds(result){
 return RESOURCE_GROUNDS.filter(g=>result?.decision?.grounds.includes(g));
}
function needsNeutral(standard,structure){
 return standard.direction==='strong'&&!structure.centralCandidate;
}

// Existing numerical/route models remain the observation providers.
// Neutral season is a diagnostic stress test, not a second classical doctrine.
export function collectStrengthEvidence(input){
 const args={saju:input.saju,birthBasis:input.birthBasis,policy:'strength-multiaxis-v3'};
 const standard=analyzeMultiaxisStrengthV3(args);
 checkGrounds(standard);
 if(!standard.decision)return {standard,structure:null,environment:null,interaction:null,neutral:null};
 const structure=observeRootCapacity(standard.axes,analyzeRootDynamics({saju:input.saju}));
 if(structure.centralCandidate!==standard.decision.grounds.includes(CENTRAL_GROUND))
  throw new SajuError('strength-ground-contract','중심 통근 근거가 관찰 결과와 일치하지 않습니다.');
 const environment=standard.baselineDecision.evidence;
 const interaction=standard.decision.evidence;
 const neutral=needsNeutral(standard,structure)?analyzeMultiaxisStrengthV3(args,{seasonMode:'neutral'}):null;
 if(neutral)checkGrounds(neutral);
 return {standard,structure,environment,interaction,neutral};
}

// Authority is explicit. Merely observing a peripheral root never exempts it.
// The alternative is a research policy, not exposed by the public entry point.
export function resolveStrengthEvidence(evidence,{peripheralAuthority='observe-only'}={}){
 if(!['observe-only','independent-experimental'].includes(peripheralAuthority))
  throw new SajuError('strength-confirmation-policy','강약 확정 정책이 올바르지 않습니다.');
 const {standard,structure,environment,neutral}=evidence;
 const idle={required:false,passed:null,sharedGrounds:[],neutralDirection:null,neutralGrounds:[],neutralConflicts:[]};
 const authority={centralRoot:false,peripheralRoot:false,resource:false};
 if(!standard.decision)return {direction:null,status:standard.status,decision:null,seasonRobustness:idle,authority,peripheralAuthority};
 checkGrounds(standard);
 if(neutral)checkGrounds(neutral);
 const grounds=[...standard.decision.grounds],conflicts=[...standard.decision.conflicts];
 authority.centralRoot=structure.centralCandidate&&grounds.includes(CENTRAL_GROUND);
 // Do not grant new strong authority against an existing weak or conflict.
 authority.peripheralRoot=peripheralAuthority==='independent-experimental'&&structure.peripheralCandidate&&
  standard.direction!=='weak'&&!conflicts.length;
 if(authority.peripheralRoot){
  grounds.push(PERIPHERAL_GROUND);
  // v2 evaluates this conflict only for an already strong hypothesis.
  // Recheck it if the new authority introduces a strong hypothesis.
  if(environment.concentratedBurdenCategories.length)
   conflicts.push('concentrated-pressure-versus-support');
 }
 const required=standard.direction==='strong'&&!authority.centralRoot&&!authority.peripheralRoot;
 const sharedGrounds=required?resourceGrounds(standard).filter(g=>resourceGrounds(neutral).includes(g)):[];
 const passed=required?neutral?.direction==='strong'&&sharedGrounds.length>0:null;
 authority.resource=required&&passed===true;
 if(required&&!passed)conflicts.push('season-sensitive-resource-support');
 const direction=conflicts.length?null:standard.direction==='weak'?'weak':
  authority.centralRoot||authority.peripheralRoot||authority.resource?'strong':null;
 return {direction,status:direction?'hypothesis':'unresolved',
  decision:{...standard.decision,direction,grounds,conflicts},
  seasonRobustness:{required,passed,sharedGrounds,
   neutralDirection:required?neutral?.direction??null:null,
   neutralGrounds:required?neutral?.decision?.grounds??[]:[],
   neutralConflicts:required?neutral?.decision?.conflicts??[]:[]},
  authority,peripheralAuthority};
}

export function analyzeStrengthDecision(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('strength-input','강약 분석 입력 객체가 필요합니다.');
 if(input.policy!==STRENGTH_DECISION_VERSION)throw new SajuError('strength-policy','강약 결정 정책을 명시해야 합니다.');
 const evidence=collectStrengthEvidence(input);
 const result=resolveStrengthEvidence(evidence);
 const {standard,structure,environment,interaction}=evidence;
 return {...standard,...result,version:STRENGTH_DECISION_VERSION,
  assessment:'experimental-separated-evidence-confirmation',
  baselinePolicy:standard.version,baselineDirection:standard.direction,baselineDecision:standard.decision,
  observations:{structure,environment,interaction}};
}
