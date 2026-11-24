import { analyzeSupportNetwork } from '../../core/support-network.js';
import { analyzeQuantitativeStrength } from '../strength-quantitative-v3/index.js';
import { SajuError } from '../../core/error.js';

export const RESOURCE_ACCESS_VERSION='resource-access-v1';
const nodeId=c=>c.role===null?c.slot.slice(0,-4)+':stem':c.slot.slice(0,-6)+':branch:'+c.element;
const range=xs=>({min:Math.min(...xs)/1000000,max:Math.max(...xs)/1000000});
function assess(network,scenarios){
 const nodes=new Map(network.nodes.map(n=>[n.id,n]));
 const resources=network.resources.filter(r=>r.supply.local);
 const records=resources.map(r=>({
  id:r.id,anchored:r.anchored,
  wealth:[...new Set(r.wealthControls.filter(e=>e.local).map(e=>e.from))],
  officer:[...new Set(r.officerSupply.filter(e=>e.local).map(e=>e.from))],
  output:[...new Set(r.outputControls.filter(e=>e.local).map(e=>e.to))],
 }));
 const rows=scenarios.map(s=>{
  const masses=new Map();
  for(const c of s.contributions){const id=nodeId(c);masses.set(id,(masses.get(id)||0)+c.units);}
  const mass=id=>masses.get(id)??0;
  const sum=ids=>[...new Set(ids)].reduce((a,id)=>a+mass(id),0);
  const routes=records.map(r=>{
   const resource=mass(r.id),wealth=sum(r.wealth),officer=sum(r.officer);
   return {id:r.id,resource,wealth,officer,output:sum(r.output),
    wealthExceedsResource:wealth>resource,officerExceedsWealth:officer>wealth};
  });
  const local=sum(records.map(r=>r.id));
  const anchoredLocal=sum(records.filter(r=>r.anchored).map(r=>r.id));
  // Exposure-conditioned bounds are separate scenarios, not a subtraction
  // of wealth from resource or an assertion that a route has been destroyed.
  const exposed=sum(routes.filter(r=>r.wealthExceedsResource).map(r=>r.id));
  const accessible=local-exposed;
  return {profile:{position:s.positionProfile,role:s.roleProfile,root:s.rootProfile,season:s.seasonProfile,basis:s.seasonBasis},
   totalResource:s.mass.resource,local,anchoredLocal,exposed,accessible,routes};
 });
 return {resources:records.map(r=>({...r,element:nodes.get(r.id).element})),rows,
  ranges:Object.fromEntries(['totalResource','local','anchoredLocal','exposed','accessible'].map(k=>[k,range(rows.map(r=>r[k]))])),
  routeDiagnostics:records.map(r=>({id:r.id,resource:range(rows.map(s=>s.routes.find(x=>x.id===r.id).resource)),
   wealth:range(rows.map(s=>s.routes.find(x=>x.id===r.id).wealth)),
   officer:range(rows.map(s=>s.routes.find(x=>x.id===r.id).officer)),
   exposure:rows.every(s=>s.routes.find(x=>x.id===r.id).wealthExceedsResource)?'all':
    rows.some(s=>s.routes.find(x=>x.id===r.id).wealthExceedsResource)?'some':'none'}))};
}
export function analyzeResourceAccess(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('strength-input','분석 입력 객체가 필요합니다.');
 if(input.policy!==RESOURCE_ACCESS_VERSION)throw new SajuError('strength-policy','인성 경로 정책을 명시해야 합니다.');
 const q=analyzeQuantitativeStrength({saju:input.saju,birthBasis:input.birthBasis,policy:'strength-quantitative-v3'});
 const meta={version:RESOURCE_ACCESS_VERSION,completeHour:q.completeHour,assessment:'hypothetical-exposure-only',effectsConfirmed:false};
 if(q.status==='provisional'||!q.completeHour)return {...meta,status:q.status,analysis:null};
 return {...meta,status:'diagnostic',analysis:assess(analyzeSupportNetwork({saju:input.saju}),q.quantitative.scenarios)};
}
