import { SajuError } from '../../core/error.js';
import { createElementObservation } from '../../core/element-structure.js';
import { observeInteractionContext } from '../../core/interaction-context.js';
import { observeRootDynamics } from '../../core/root-dynamics.js';
import { observeStemForce } from '../../core/stem-force.js';
import { observeRelativeForce } from '../../core/relative-force.js';
import { observePatternCandidates } from './candidates.js';
import { observePatternOutcomes } from './outcomes.js';
import { observePatternRoutes } from './routes.js';
import { observeRouteQuality } from './quality.js';
import { observeStorageProjection, observeRolePaths } from './storage-and-roles.js';
import { resolvePatternPreference } from './preference.js';
import { refineOfficerPreference } from './officer-preservation.js';
import { observePatternComposition, refineCompositionPreference } from './composition.js';
import { observeMixedUse, refineMixedPreference } from './mixed-use.js';
import { observePatternForce } from './force-bindings.js';
import { bindRelativePattern } from './relative-bindings.js';

// All policies keep their original public outputs. This orchestration
// computes shared natal evidence once per request, with no persistent cache.
// Later-stage outputs that replace earlier ones are constructed only once.
export function analyzePatternPolicy(input,revision,provider){
 if(!Number.isInteger(revision)||revision<1||revision>10)throw new SajuError('pattern-policy','격국 분석 정책을 명시해야 합니다.');
 const version='pattern-useful-element-v'+revision;
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('pattern-input','격국 분석 입력 객체가 필요합니다.');
 if(input.policy!==version)throw new SajuError('pattern-policy','격국 분석 정책을 명시해야 합니다.');
 if(!['verified-chart','provisional-chart'].includes(input.birthBasis))throw new SajuError('strength-birth-basis','원국 확정 여부를 명시해야 합니다.');
 const observation=provider?provider.observation(input.saju):createElementObservation(input.saju),context=observation.context();
 const unavailable=input.birthBasis==='provisional-chart';
 const structure=unavailable?null:observation.structure();
 const interaction=unavailable?null:provider?provider.interaction(input.saju):observeInteractionContext(observation.pillars,structure,observation.relations());
 let selection=unavailable?null:observePatternCandidates(context,interaction);
 const storageReview=revision>=4&&!unavailable?observeStorageProjection(structure):null;
 if(storageReview)selection={...selection,candidates:[...selection.candidates,...storageReview.candidates]};
 let result={version,completeHour:context.completeHour,assessment:'month-pattern-review-only',
  specialPatternsAssessed:false,commandResolved:false,selectedPattern:null,patternUsefulGod:null,assistantGod:null,usefulElement:null,confirmed:false,selectionAuthority:false,
  status:unavailable?'unavailable':context.completeHour?'diagnostic':'partial',
  ...(unavailable?{reason:'provisional-chart'}:{}),selection,
  outcomes:unavailable?[]:observePatternOutcomes(selection,structure,interaction)};
 if(revision>=2)result={...result,routeReview:unavailable?null:observePatternRoutes(selection,structure,interaction)};
 if(revision>=3)result={...result,qualityReview:unavailable?null:observeRouteQuality(result,structure,interaction)};
 if(revision>=4)result={...result,storageReview,roleReview:unavailable?[]:observeRolePaths(selection,result.routeReview.occurrences,interaction,structure.completeHour)};
 if(revision>=5)result={...result,preference:resolvePatternPreference(selection,input.saju.pillars.month.branch,result.completeHour)};
 if(revision>=6)result={...result,preference:unavailable?{...result.preference,policy:'month-family-preference-v2',officerReview:null}:
  refineOfficerPreference(result.preference,selection,structure,interaction)};
 if(revision>=7){
  const composition=observePatternComposition(selection,structure,interaction);
  result={...result,composition,preference:refineCompositionPreference(result.preference,composition,selection)};
 }
 if(revision>=8){
  const mixedUse=observeMixedUse(selection,structure,interaction);
  result={...result,mixedUse,preference:refineMixedPreference(result.preference,mixedUse,selection)};
 }
 if(revision>=9){
  const stemForce=unavailable?null:observeStemForce(observation.pillars,provider?provider.standard.dynamics(input.saju):observeRootDynamics(observation.pillars,structure),interaction);
  result={...result,stemForce,patternForce:unavailable?null:observePatternForce(result,stemForce)};
 }
 if(revision>=10){
  const relativeForce=unavailable?null:observeRelativeForce(result.stemForce);
  result={...result,relativeForce,relativePattern:unavailable?null:bindRelativePattern(result,relativeForce)};
 }
 return result;
}
