import { SajuError } from '../../core/error.js';
import { analyzeBalanceUsefulElement } from './candidates.js';
import { analyzeSupportNetwork } from '../../core/support-network.js';
import { analyzeRootDynamics } from '../../core/root-dynamics.js';
import { analyzeQuantitativeStrength } from '../strength-quantitative-v3/index.js';
import { enumerateBalanceRoutes,reserveBalanceScenario,summarizeBalanceRoutes,aggregateBalanceReviews } from './route-evidence.js';

export const BALANCE_ROUTE_REVIEW_VERSION='balance-route-review-v1';
export function evaluateBalanceRoutes(saju,branches){
 const network={...analyzeSupportNetwork({saju}),edges:analyzeRootDynamics({saju}).edges};
 const args={saju,birthBasis:'verified-chart',policy:'strength-quantitative-v3'};
 const scenarios=['standard','neutral'].flatMap(season=>analyzeQuantitativeStrength(args,{seasonMode:season}).quantitative.scenarios);
 const modes=[1,2].map(distance=>{
  const paths=enumerateBalanceRoutes(network,distance),rows=branches.map(()=>[]);
  let allocations=0,ledgerEntries=0;
  for(const scenario of scenarios){
   const reserved=reserveBalanceScenario(network,scenario,paths);
   allocations+=reserved.allocations.length;ledgerEntries+=reserved.ledger.length;
   branches.forEach((branch,i)=>rows[i].push(summarizeBalanceRoutes(branch,reserved.allocations)));
  }
  return {distance,pathCount:paths.length,allocations,ledgerEntries,reviews:branches.map((b,i)=>aggregateBalanceReviews(b,rows[i]))};
 });
 // Report a focus only if both locality assumptions identify the same
 // singleton. Not a final choice, not a net effect or rank.
 const robustFocus=branches.map((b,i)=>{
  const a=modes[0].reviews[i].coverageFocus,c=modes[1].reviews[i].coverageFocus;
  return {assumedDirection:b.assumedDirection,elements:a.length===1&&c.length===1&&a[0]===c[0]?a:[]};
 });
 return {modes,robustFocus};
}
export function analyzeBalanceRouteReview(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('balance-input','억부용신 분석 입력 객체가 필요합니다.');
 if(input.policy!==BALANCE_ROUTE_REVIEW_VERSION)throw new SajuError('balance-policy','억부 경로 검토 정책을 명시해야 합니다.');
 const {saju,birthBasis}=input;
 const balance=analyzeBalanceUsefulElement({saju,birthBasis,policy:'balance-useful-element-v1'});
 const meta={version:BALANCE_ROUTE_REVIEW_VERSION,assessment:'bounded-structural-route-review-only',confirmed:false,usefulElement:null,ranking:null};
 if(balance.status==='unavailable')return {...meta,status:'unavailable',reason:balance.reason,balance,analysis:null};
 return {...meta,status:balance.status,balance,analysis:evaluateBalanceRoutes(saju,balance.branches)};
}
