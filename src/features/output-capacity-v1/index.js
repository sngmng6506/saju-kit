import { analyzeSupportNetwork } from '../../core/support-network.js';
import { analyzeQuantitativeStrength } from '../strength-quantitative-v3/index.js';
import { analyzeRouteBudget } from '../route-budget-v1/index.js';
import { SajuError } from '../../core/error.js';

export const OUTPUT_CAPACITY_VERSION='output-capacity-v1';
const nodeId=c=>c.role===null?c.slot.slice(0,-4)+':stem':c.slot.slice(0,-6)+':branch:'+c.element;
const sum=xs=>xs.reduce((a,b)=>a+b,0);

// Cap an incoming group proportionally, using exact integer largest remainders.
// No redistribution of rejected units: this is a bounded diagnostic, not max flow.
export function capIncoming(edges,capacity){
 const total=sum(edges.map(e=>e.units));
 if(total<=capacity)return edges.map(e=>({...e,accepted:e.units,rejected:0}));
 const denominator=BigInt(total);
 const rows=edges.map(e=>{
  const product=BigInt(e.units)*BigInt(capacity);
  return {...e,accepted:Number(product/denominator),remainder:product%denominator};
 });
 const order=rows.map((e,i)=>({i,remainder:e.remainder,source:e.source})).sort((a,b)=>
  a.remainder>b.remainder?-1:a.remainder<b.remainder?1:a.source<b.source?-1:a.source>b.source?1:a.i-b.i);
 const left=capacity-sum(rows.map(e=>e.accepted));
 for(let i=0;i<left;i++)rows[order[i].i].accepted++;
 return rows.map(({remainder,...e})=>({...e,rejected:e.units-e.accepted}));
}
function evaluate(network,scenario,budget){
 const masses=new Map();
 for(const c of scenario.contributions){const id=nodeId(c);masses.set(id,(masses.get(id)||0)+c.units);}
 const mass=id=>masses.get(id)??0;
 // Opposite effects share one conservative incoming cap; no net-force inference.
 const targets=[...new Set(budget.allocations.filter(a=>a.target!=='day:stem').map(a=>a.target))].sort();
 const bounded=targets.flatMap(target=>capIncoming(budget.allocations.filter(a=>a.target===target),mass(target)));
 const direct=budget.allocations.filter(a=>a.target==='day:stem').map(a=>({...a,accepted:a.units,rejected:0}));
 const allocations=[...bounded,...direct];
 const outputs=network.burdens.output.map(n=>{
  const nominal=mass(n.id);
  const control=sum(bounded.filter(a=>a.target===n.id&&a.kind==='resource-output').map(a=>a.accepted));
  return {id:n.id,local:n.dayRelation.local,anchored:n.anchored,nominal,control,
   residualHypothesis:nominal-control};
 });
 const resources=budget.routes.map(r=>{
  const wealth=sum(bounded.filter(a=>a.target===r.id&&a.kind==='wealth-resource').map(a=>a.accepted));
  const officer=sum(bounded.filter(a=>a.target===r.id&&a.kind==='officer-resource').map(a=>a.accepted));
  // Use requested wealth for exposure: capping must not erase an overload.
  return {id:r.id,own:r.own,direct:r.direct,wealthRequested:r.wealth,wealthAccepted:wealth,officerAccepted:officer,
   conditionalDirect:r.wealth<=r.own?r.direct:0};
 });
 return {mode:budget.mode,profile:budget.profile,allocations,outputs,resources,
  targetCaps:targets.map(id=>({id,capacity:mass(id),accepted:sum(bounded.filter(a=>a.target===id).map(a=>a.accepted))})),
  outputTotal:sum(outputs.map(n=>n.nominal)),outputLocal:sum(outputs.filter(n=>n.local).map(n=>n.nominal)),
  outputControlAccepted:sum(outputs.map(n=>n.control)),outputResidualHypothesis:sum(outputs.map(n=>n.residualHypothesis)),
  conditionalResource:sum(resources.map(n=>n.conditionalDirect)),directOfficer:budget.directOfficer,directWealth:budget.directWealth,
  rejected:sum(allocations.map(a=>a.rejected))};
}
export function analyzeOutputCapacity(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('strength-input','분석 입력 객체가 필요합니다.');
 if(input.policy!==OUTPUT_CAPACITY_VERSION)throw new SajuError('strength-policy','식상 수용 한도 정책을 명시해야 합니다.');
 const args={saju:input.saju,birthBasis:input.birthBasis};
 const budget=analyzeRouteBudget({...args,policy:'route-budget-v1'});
 const meta={version:OUTPUT_CAPACITY_VERSION,completeHour:budget.completeHour,assessment:'hypothetical-target-cap-only',effectsConfirmed:false};
 if(!budget.analysis)return {...meta,status:budget.status,analysis:null};
 const q=analyzeQuantitativeStrength({...args,policy:'strength-quantitative-v3'}).quantitative;
 const network=analyzeSupportNetwork({saju:input.saju});
 const rows=budget.analysis.rows.map((b,i)=>evaluate(network,q.scenarios[Math.floor(i/2)],b));
 const keys=['outputTotal','outputLocal','outputControlAccepted','outputResidualHypothesis','conditionalResource','directOfficer','directWealth','rejected'];
 return {...meta,status:'diagnostic',analysis:{rows,ranges:Object.fromEntries(keys.map(k=>[k,{min:Math.min(...rows.map(r=>r[k]))/1000000,max:Math.max(...rows.map(r=>r[k]))/1000000}]))}};
}
