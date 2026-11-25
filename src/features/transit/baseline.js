import { SajuError } from '../../core/error.js';
import { validateNatalPillars } from '../../core/natal.js';
import { getDaeun as legacyDaeun } from '../../core/daeun.js';
import { getDaeun as minuteDaeun } from '../movement-v6/daeun.js';
import { getSeun } from '../../core/year-signals.js';
import { analyzeUsefulElementAuthority } from '../useful-element-authority-v1/index.js';
import { observeTransitEvidence,compareTransitAnchors } from './evidence.js';
export const USEFUL_ELEMENT_TRANSIT_VERSION='useful-element-transit-v1';
const policies={'legacy-day-v1':legacyDaeun,'movement-minute-v6':minuteDaeun};
export function analyzeUsefulElementTransit(input){
 return evaluateUsefulElementTransit(input);
}
// Internal fixed-policy adapter. Existing public API does not accept overrides.
export function evaluateUsefulElementTransit(input,{version=USEFUL_ELEMENT_TRANSIT_VERSION,authorityPolicy='useful-element-authority-v1',authorityAnalyzer=analyzeUsefulElementAuthority}={}){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('transit-input','운세 검토 입력 객체가 필요합니다.');
 if(input.policy!==version)throw new SajuError('transit-policy','운세 검토 정책을 명시해야 합니다.');
 if(!['verified-chart','provisional-chart'].includes(input.birthBasis))throw new SajuError('strength-birth-basis','원국 확정 여부를 명시해야 합니다.');
 if(!Object.hasOwn(policies,input.daeunPolicy))throw new SajuError('transit-daeun-policy','대운 계산 정책을 명시해야 합니다.');
 const {saju,birth,birthBasis,gender,fromYear,toYear}=input,pillars=validateNatalPillars(saju);
 if(!Number.isInteger(fromYear)||!Number.isInteger(toYear)||fromYear<1900||toYear>2100||fromYear>toYear)throw new SajuError('year-range','올바른 연도 구간이 필요합니다.');
 const meta={version,assessment:'conditional-transit-observations-only',daeunPolicy:input.daeunPolicy,
  timeBasis:{annual:'after-ipchun',daeun:'civil-year-band-counting-age',exactDaeunTransitionResolved:false},usefulElement:null,favorableElements:null,unfavorableElements:null,score:null,confirmed:false};
 const unavailable=reason=>({...meta,status:'unavailable',reason,authority:null,daeun:null,years:[]});
 if(birthBasis==='provisional-chart')return unavailable('provisional-chart');
 if(pillars.hour===null)return unavailable('missing-hour');
 if(!birth||birth.hh==null||birth.mm==null||birth.period)return unavailable('missing-exact-birth-time');
 if(birth.calendar!=null&&birth.calendar!=='solar')throw new SajuError('transit-birth-calendar','양력 출생 정보를 입력해야 합니다.');
 if(fromYear<birth.y)throw new SajuError('year-range','출생 연도 이전은 분석하지 않습니다.');
 // Recompute daeun from the birth, not a caller-supplied band or arbitrary pillar.
 const daeun=policies[input.daeunPolicy]({saju,birth,gender});
 if(toYear>daeun.pillars.at(-1).toYear)throw new SajuError('daeun-range','대운 계산 구간 이후의 연도입니다.');
 const authority=authorityAnalyzer({saju,birth,birthBasis,policy:authorityPolicy});
 const years=[];
 for(let year=fromYear;year<=toYear;year++){
  const seun=getSeun(year);
  const band=daeun.pillars.find(x=>x.fromYear<=year&&year<=x.toYear)??null;
  const transit=observeTransitEvidence({saju,daeun:band,seun:seun.pillar});
  years.push({year,seun,daeun:band?{...band}:null,transit,
   hypotheses:compareTransitAnchors(authority.authority,transit),score:null,confirmed:false});
 }
 return {...meta,status:'diagnostic',authority,daeun,years};
}
