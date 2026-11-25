import { analyzeMonthCommand } from '../../core/month-command.js';
import { validateNatalPillars } from '../../core/natal.js';
import { SajuError } from '../../core/error.js';
import { analyzeQuantitativeStrength, quantifyExplicitSeasonBasis } from './quantitative.js';

export const COMMAND_SENSITIVITY_VERSION='strength-command-sensitivity-v1';
const profileKey=r=>[r.positionProfile,r.roleProfile,r.rootProfile,r.seasonProfile].join(':');
const range=xs=>({min:Math.min(...xs),max:Math.max(...xs)});
const round=x=>Math.round(x*100)/100;
const signature=r=>r.contributions.map(({slot,element,role,category,weight,share,rootFactor})=>[slot,element,role,category,weight,share,rootFactor]);
const externalMargin=r=>r.contributions.filter(c=>c.category==='peer'&&c.role===null).reduce((a,c)=>a+c.units,0)+r.mass.resource-Math.max(r.mass.output,r.mass.wealth,r.mass.officer);
const fullMargin=r=>r.supportUnits-Math.max(r.mass.output,r.mass.wealth,r.mass.officer);
function summarizeBasis(q){
 return {min:q.min,max:q.max,stableDirection:q.stableDirection,scenarioCount:q.scenarioCount,
  externalMargin:range(q.scenarios.map(r=>externalMargin(r)/1e6)),
  fullMargin:range(q.scenarios.map(r=>fullMargin(r)/1e6))};
}
// Used by the exact-birth wrapper and source-annotated research fixtures.
// Explicit elements are hypotheses, not automatic evidence of actual command.
export function compareCommandElements(saju,elements){
 if(!Array.isArray(elements)||!elements.length)throw new SajuError('strength-season-basis','비교할 사령 오행이 필요합니다.');
 const args={saju,birthBasis:'verified-chart',policy:'strength-quantitative-v3'};
 const standard=analyzeQuantitativeStrength(args).quantitative;
 const neutral=analyzeQuantitativeStrength(args,{seasonMode:'neutral'}).quantitative;
 if(!standard.scenarios.length)throw new SajuError('strength-season-basis','완전한 원국이 필요합니다.');
 const bases=[...new Set(standard.scenarios.map(r=>r.seasonBasis))];
 const groups=bases.map(id=>({id,rows:standard.scenarios.filter(r=>r.seasonBasis===id)}));
 const variants=[...new Set(elements)].map(element=>{
  const q=quantifyExplicitSeasonBasis(saju,element);
  const matched=groups.map(g=>{
   const map=new Map(g.rows.map(r=>[profileKey(r),r]));
   if(map.size!==g.rows.length||map.size!==q.scenarios.length)throw Error('profile grid mismatch');
   const pairs=q.scenarios.map(r=>{
    const b=map.get(profileKey(r));
    if(!b||JSON.stringify(signature(b))!==JSON.stringify(signature(r)))throw Error('nonseasonal contribution changed');
    return {r,b};
   });
   const neutralSame=element===g.rows[0].seasonElement;
   if(neutralSame&&pairs.some(({r,b})=>r.totalUnits!==b.totalUnits||r.supportUnits!==b.supportUnits||JSON.stringify(r.mass)!==JSON.stringify(b.mass)))throw Error('equal basis mismatch');
   return {basis:g.id,element:g.rows[0].seasonElement,identicalBasis:neutralSame,matchedCount:pairs.length,
    indexDelta:range(pairs.map(({r,b})=>round(100*r.supportUnits/r.totalUnits-100*b.supportUnits/b.totalUnits))),
    externalMarginDelta:range(pairs.map(({r,b})=>(externalMargin(r)-externalMargin(b))/1e6)),
    fullMarginDelta:range(pairs.map(({r,b})=>(fullMargin(r)-fullMargin(b))/1e6))};
  });
  return {element,...summarizeBasis(q),matched};
 });
 return {standard:summarizeBasis(standard),neutral:summarizeBasis(neutral),variants};
}

export function analyzeMonthCommandSensitivity(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('strength-input','강약 분석 입력 객체가 필요합니다.');
 if(input.policy!==COMMAND_SENSITIVITY_VERSION)throw new SajuError('strength-policy','사령 민감도 정책을 명시해야 합니다.');
 if(!['verified-chart','provisional-chart'].includes(input.birthBasis))throw new SajuError('strength-birth-basis','원국 확정 여부를 명시해야 합니다.');
 const pillars=validateNatalPillars(input.saju);
 const meta={version:COMMAND_SENSITIVITY_VERSION,assessment:'conditional-season-basis-only',direction:null,effectsConfirmed:false,commandResolved:false};
 const unresolved=reason=>({...meta,status:'unresolved',reason,command:null,comparison:null});
 if(input.birthBasis==='provisional-chart')return unresolved('provisional-chart');
 if(pillars.hour===null)return unresolved('missing-hour');
 const command=analyzeMonthCommand({saju:input.saju,birth:input.birth});
 if(command.status!=='diagnostic'||!command.availableCommandElements.length)return {...unresolved(command.reason??'no-available-command'),command};
 const comparison=compareCommandElements(input.saju,command.availableCommandElements);
 return {...meta,status:'diagnostic',command,comparison};
}
