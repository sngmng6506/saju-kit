import { analyzeSupportNetwork } from '../../core/support-network.js';
import { analyzeQuantitativeStrength } from '../strength-quantitative-v3/index.js';
import { SajuError } from '../../core/error.js';

export const MULTIHOP_VERSION='multihop-interaction-v1';
const DAY='day:stem';
const slot=n=>n.position+':'+n.layer;
const nodeId=c=>c.role===null?c.slot.slice(0,-4)+':stem':c.slot.slice(0,-6)+':branch:'+c.element;
const sum=xs=>xs.reduce((a,b)=>a+b,0);
const next={wealth:'officer',officer:'resource',resource:'peer'};
const modes=[{id:'adjacent',maxDistance:1},{id:'one-gap',maxDistance:2}];

// Only acyclic generation paths ending at the day master, direct burdens,
// and single control paths. No cycles, no repeated physical slot, no
// assertion of transformation. The wider mode is a locality stress test.
export function enumerateInteractionPaths(network,maxDistance){
 if(![1,2].includes(maxDistance))throw Error('invalid locality');
 const byId=new Map(network.nodes.map(n=>[n.id,n]));
 const edges=network.edges.filter(e=>e.distance<=maxDistance);
 const paths=[];
 function add(kind,nodes){paths.push({id:kind+':'+nodes.join('>'),kind,nodes,origin:nodes[0]});}
 function walk(nodes){
  const from=byId.get(nodes.at(-1)),category=next[from.category];
  for(const e of edges.filter(e=>e.from===from.id&&e.type==='generate'&&e.toCategory===category)){
   const to=byId.get(e.to);
   if(nodes.some(id=>slot(byId.get(id))===slot(to)))continue;
   if(to.id===DAY){add('generation',[...nodes,DAY]);continue;}
   if(['officer','resource'].includes(to.category)&&to.anchored)walk([...nodes,to.id]);
  }
 }
 for(const n of network.nodes){
  if(!['wealth','officer','resource'].includes(n.category))continue;
  if(n.category!=='resource'||n.anchored)walk([n.id]);
  for(const e of edges.filter(e=>e.from===n.id)){
   const to=byId.get(e.to);
   if(to.id===DAY&&e.type==='control'&&['wealth','officer'].includes(n.category)){
    // Wealth is controlled by the day master, so its direct burden is handled below.
    add('direct-burden',[n.id,DAY]);
   }
   if(e.type==='control'&&((n.category==='wealth'&&to.category==='resource'&&to.anchored)||
    (n.category==='resource'&&n.anchored&&to.category==='output')))add('control',[n.id,to.id]);
  }
  if(n.category==='wealth'&&edges.some(e=>e.from===DAY&&e.to===n.id&&e.type==='control'))add('direct-burden',[n.id,DAY]);
 }
 const unique=new Map(paths.map(p=>[p.id,p]));
 return [...unique.values()].sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0);
}

// One request budget per origin, one shared capacity per non-day node.
// All requested paths are scaled against the same original demand snapshot;
// minimum bottleneck ratio, integer floor, no redistribution. Each accepted
// path reserves its capacity at ALL nodes atomically. No flow is created.
export function allocateInteractionPaths(paths,masses){
 const ids=new Set();
 for(const p of paths){
  if(ids.has(p.id)||p.nodes.length<2||p.nodes[0]!==p.origin||p.origin===DAY||new Set(p.nodes).size!==p.nodes.length||p.nodes.slice(0,-1).includes(DAY))throw Error('invalid path');
  ids.add(p.id);
  for(const id of p.nodes.filter(x=>x!==DAY))if(!Number.isSafeInteger(masses[id])||masses[id]<0)throw Error('invalid node capacity');
 }
 const sorted=[...paths].sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0);
 const byOrigin=new Map();
 for(const p of sorted){if(!byOrigin.has(p.origin))byOrigin.set(p.origin,[]);byOrigin.get(p.origin).push(p);}
 const requests=[];
 for(const [id,ps] of byOrigin){
  const mass=masses[id];
  ps.forEach((p,i)=>requests.push({...p,requested:Math.floor(mass/ps.length)+(i<mass%ps.length?1:0)}));
 }
 const demand={};
 for(const p of requests)for(const id of p.nodes.filter(x=>x!==DAY))demand[id]=(demand[id]??0)+p.requested;
 const allocations=requests.map(p=>{
  let num=1n,den=1n;
  for(const id of p.nodes.filter(x=>x!==DAY)){
   const d=BigInt(demand[id]),c=BigInt(masses[id]);
   if(d>0n&&c*den<num*d){num=c;den=d;}
  }
  const accepted=Number(BigInt(p.requested)*num/den);
  return {...p,accepted,rejected:p.requested-accepted};
 });
 const ledger=Object.keys(demand).sort().map(id=>({id,capacity:masses[id],requested:demand[id],
  reserved:sum(allocations.filter(p=>p.nodes.includes(id)).map(p=>p.accepted))}));
 if(ledger.some(x=>x.reserved>x.capacity))throw Error('capacity exceeded');
 return {allocations,ledger};
}

export function evaluateInteractionScenario(network,scenario,paths){
 const masses=Object.fromEntries(network.nodes.filter(n=>n.id!==DAY).map(n=>[n.id,0]));
 for(const c of scenario.contributions){const id=nodeId(c);if(!Object.hasOwn(masses,id))throw Error('unknown contribution');masses[id]+=c.units;}
 const byId=new Map(network.nodes.map(n=>[n.id,n]));
 const {allocations,ledger}=allocateInteractionPaths(paths,masses);
 const delivered=allocations.filter(p=>p.kind==='generation'&&p.nodes.at(-1)===DAY);
 const byCategory=Object.fromEntries(['wealth','officer','resource'].map(k=>[k,sum(delivered.filter(p=>byId.get(p.origin).category===k).map(p=>p.accepted))]));
 const wealth= scenario.mass.wealth-byCategory.wealth,officer=scenario.mass.officer-byCategory.officer;
 if(wealth<0||officer<0||byCategory.resource>scenario.mass.resource)throw Error('origin budget exceeded');
 const nominalSupport=scenario.mass.peer+scenario.mass.resource;
 const nominalMargin=nominalSupport-Math.max(scenario.mass.output,scenario.mass.wealth,scenario.mass.officer);
 // Diversion-only stress test: keep full nominal resource and peer; do not
 // additionally add generation units to support. Control reservations are
 // capacity competitors only, not effective cancellation.
 const diversionMargin=nominalSupport-Math.max(scenario.mass.output,wealth,officer);
 return {profile:{position:scenario.positionProfile,role:scenario.roleProfile,root:scenario.rootProfile,season:scenario.seasonProfile,basis:scenario.seasonBasis},
  allocations,ledger,delivered:byCategory,longDelivered:sum(delivered.filter(p=>p.nodes.length===4).map(p=>p.accepted)),
  nominalMargin,diversionMargin};
}
const range=xs=>[Math.min(...xs),Math.max(...xs)];
export function analyzeMultihopInteraction(input,context){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('strength-input','분석 입력 객체가 필요합니다.');
 if(input.policy!==MULTIHOP_VERSION)throw new SajuError('strength-policy','다단계 경로 정책을 명시해야 합니다.');
 const q=analyzeQuantitativeStrength({...input,policy:'strength-quantitative-v3'},context);
 const meta={version:MULTIHOP_VERSION,assessment:'hypothetical-path-reservation-only',effectsConfirmed:false,direction:null,completeHour:q.completeHour};
 if(q.status==='provisional'||!q.completeHour)return {...meta,status:q.status,analysis:null};
 const network=analyzeSupportNetwork({saju:input.saju});
 const variants=modes.map(mode=>{
  const paths=enumerateInteractionPaths(network,mode.maxDistance);
  const rows=q.quantitative.scenarios.map(s=>evaluateInteractionScenario(network,s,paths));
  return {...mode,paths,rows,summary:{n:rows.length,longPaths:paths.filter(p=>p.kind==='generation'&&p.nodes.length===4).length,
   longDelivered:range(rows.map(r=>r.longDelivered)),wealthDelivered:range(rows.map(r=>r.delivered.wealth)),
   officerDelivered:range(rows.map(r=>r.delivered.officer)),resourceDelivered:range(rows.map(r=>r.delivered.resource)),
   nominalMargin:range(rows.map(r=>r.nominalMargin)),diversionMargin:range(rows.map(r=>r.diversionMargin)),
   nominalPressureAll:rows.every(r=>r.nominalMargin<0),diversionPressureAll:rows.every(r=>r.diversionMargin<0)}};
 });
 return {...meta,status:'diagnostic',analysis:{variants}};
}
