import { SajuError } from '../../core/error.js';
import { analyzeUsefulElementTransitV3,USEFUL_ELEMENT_TRANSIT_V3_VERSION } from './source-review.js';
import { analyzePatternUsefulElementV3,PATTERN_V3_VERSION } from '../pattern-useful-element-v3/index.js';
import { composeFiveMethodAuthority } from '../useful-element-authority-v4/index.js';
import { collectPatternRoles,observePatternTransit } from './pattern-arrivals.js';
export const USEFUL_ELEMENT_TRANSIT_V4_VERSION='useful-element-transit-v4';
export function analyzeUsefulElementTransitV4(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('transit-input','운세 검토 입력 객체가 필요합니다.');
 if(input.policy!==USEFUL_ELEMENT_TRANSIT_V4_VERSION)throw new SajuError('transit-policy','운세 검토 정책을 명시해야 합니다.');
 const prior=analyzeUsefulElementTransitV3({...input,policy:USEFUL_ELEMENT_TRANSIT_V3_VERSION});
 const base={...prior,version:USEFUL_ELEMENT_TRANSIT_V4_VERSION};
 if(prior.status!=='diagnostic')return {...base,patternRoles:[]};
 const pattern=analyzePatternUsefulElementV3({...input,policy:PATTERN_V3_VERSION});
 const authority=composeFiveMethodAuthority(prior.authority,pattern),patternRoles=collectPatternRoles(pattern);
 return {...base,authority,patternRoles,years:prior.years.map(y=>({...y,patternArrivals:observePatternTransit(patternRoles,y.transit)}))};
}
