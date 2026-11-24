import { SajuError } from '../../core/error.js';
import { analyzeNatalContext } from '../../core/natal-context.js';
import { analyzeElementStructure } from '../../core/element-structure.js';
import { analyzeInteractionContext } from '../../core/interaction-context.js';
import { observePatternCandidates } from './candidates.js';
import { observePatternOutcomes } from './outcomes.js';
export const PATTERN_USEFUL_ELEMENT_VERSION='pattern-useful-element-v1';
export function analyzePatternUsefulElement(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('pattern-input','격국 분석 입력 객체가 필요합니다.');
 if(input.policy!==PATTERN_USEFUL_ELEMENT_VERSION)throw new SajuError('pattern-policy','격국 분석 정책을 명시해야 합니다.');
 if(!['verified-chart','provisional-chart'].includes(input.birthBasis))throw new SajuError('strength-birth-basis','원국 확정 여부를 명시해야 합니다.');
 const context=analyzeNatalContext({saju:input.saju});
 const meta={version:PATTERN_USEFUL_ELEMENT_VERSION,completeHour:context.completeHour,assessment:'month-pattern-review-only',
  specialPatternsAssessed:false,commandResolved:false,selectedPattern:null,patternUsefulGod:null,assistantGod:null,usefulElement:null,confirmed:false,selectionAuthority:false};
 if(input.birthBasis==='provisional-chart')return {...meta,status:'unavailable',reason:'provisional-chart',selection:null,outcomes:[]};
 const structure=analyzeElementStructure({saju:input.saju}),interaction=analyzeInteractionContext({saju:input.saju});
 const selection=observePatternCandidates(context,interaction);
 return {...meta,status:context.completeHour?'diagnostic':'partial',selection,outcomes:observePatternOutcomes(selection,structure,interaction)};
}
