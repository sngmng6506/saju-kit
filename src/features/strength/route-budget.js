import { analyzeSupportNetwork } from '../../core/support-network.js';
import { analyzeQuantitativeStrength } from './quantitative.js';
import { SajuError } from '../../core/error.js';

export const ROUTE_BUDGET_VERSION='route-budget-v1';
const nodeId=c=>c.role===null?c.slot.slice(0,-4)+':stem':c.slot.slice(0,-6)+':branch:'+c.element;
const range=xs=>({min:Math.min(...xs)/1000000,max:Math.max(...xs)/1000000});

// Equal allocation of integer nominal units, including deterministic remainder.
export function splitBudget(units,targets){
 const ids=[...new Set(targets)].sort();
 return ids.map((id,i)=>({id,units:Math.floor(units/ids.length)+(i<units%ids.length?1:0)}));
}
function model(network,scenario,mode){
 const masses=new Map();
 for(const c of scenario.contributions){const id=nodeId(c);masses.set(id,(masses.get(id)||0)+c.units);}
 const mass=id=>masses.get(id)??0;
 const resources=network.resources.filter(r=>r.supply.local&&r.anchored);
 const budgets=[],allocations=[];
 function allocate(id,category,targets){
  const choices=targets.filter(t=>mode==='all-local'||t.target==='day:stem'||t.anchored);
  const routes=splitBudget(mass(id),choices.map(t=>t.target));
  for(const a of routes){
   const target=choices.find(t=>t.target===a.id);
   allocations.push({source:id,target:a.id,kind:target.kind,units:a.units});
  }
  budgets.push({id,category,units:mass(id),allocated:routes.reduce((n,a)=>n+a.units,0)});
 }
 // A source has one budget across direct and indirect routes.
 for(const n of network.nodes.filter(n=>['officer','wealth','resource'].includes(n.category))){
  const targets=[];
  if(n.category==='resource'){
   const r=resources.find(r=>r.id===n.id);
   if(r){targets.push({target:'day:stem',kind:'resource-day',anchored:true});
    for(const e of r.outputControls.filter(e=>e.local))targets.push({target:e.to,kind:'resource-output',anchored:network.burdens.output.find(b=>b.id===e.to).anchored});}
  }else{
   const b=network.burdens[n.category].find(b=>b.id===n.id);
   if(b.dayRelation.local)targets.push({target:'day:stem',kind:n.category+'-day',anchored:true});
   for(const r of resources){
    const edges=n.category==='officer'?r.officerSupply:r.wealthControls;
    if(edges.some(e=>e.from===n.id&&e.local))targets.push({target:r.id,kind:n.category+'-resource',anchored:true});
   }
  }
  allocate(n.id,n.category,targets);
 }
 const sum=(kind,target)=>allocations.filter(a=>a.kind===kind&&(!target||a.target===target)).reduce((n,a)=>n+a.units,0);
 const routes=resources.map(r=>({id:r.id,own:mass(r.id),direct:allocations.filter(a=>a.source===r.id&&a.kind==='resource-day').reduce((n,a)=>n+a.units,0),
  officer:sum('officer-resource',r.id),wealth:sum('wealth-resource',r.id),
  outputControl:allocations.filter(a=>a.source===r.id&&a.kind==='resource-output').reduce((n,a)=>n+a.units,0)}));
 // No officer units are added to resource supply: generation is not measured transfer.
 // Conditional direct resource excludes routes whose allocated wealth exceeds own mass.
 const eligible=routes.filter(r=>r.wealth<=r.own);
 return {mode,profile:{position:scenario.positionProfile,role:scenario.roleProfile,root:scenario.rootProfile,season:scenario.seasonProfile,basis:scenario.seasonBasis},
  budgets,allocations,routes,directResource:sum('resource-day'),conditionalResource:eligible.reduce((n,r)=>n+r.direct,0),
  officerResource:sum('officer-resource'),directOfficer:sum('officer-day'),directWealth:sum('wealth-day'),outputControl:sum('resource-output')};
}
export function analyzeRouteBudget(input,context){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('strength-input','분석 입력 객체가 필요합니다.');
 if(input.policy!==ROUTE_BUDGET_VERSION)throw new SajuError('strength-policy','경로 배분 정책을 명시해야 합니다.');
 const q=analyzeQuantitativeStrength({saju:input.saju,birthBasis:input.birthBasis,policy:'strength-quantitative-v3'},context);
 const meta={version:ROUTE_BUDGET_VERSION,completeHour:q.completeHour,assessment:'hypothetical-budget-only',effectsConfirmed:false};
 if(q.status==='provisional'||!q.completeHour)return {...meta,status:q.status,analysis:null};
 const network=analyzeSupportNetwork({saju:input.saju});
 const rows=q.quantitative.scenarios.flatMap(s=>['all-local','anchored-targets'].map(mode=>model(network,s,mode)));
 const keys=['directResource','conditionalResource','officerResource','directOfficer','directWealth','outputControl'];
 return {...meta,status:'diagnostic',analysis:{rows,ranges:Object.fromEntries(keys.map(k=>[k,range(rows.map(r=>r[k]))]))}};
}
