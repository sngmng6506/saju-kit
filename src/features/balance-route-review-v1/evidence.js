import { enumerateInteractionPaths,allocateInteractionPaths } from '../multihop-interaction-v1/index.js';

const DAY='day:stem';
const slot=n=>n.position+':'+n.layer;
const nodeId=c=>c.role===null?c.slot.slice(0,-4)+':stem':c.slot.slice(0,-6)+':branch:'+c.element;
const sum=xs=>xs.reduce((a,b)=>a+b,0);
const directKind={peer:'peer-assistance',output:'output-drain'};
const extra=[
 ['peer','wealth','control','peer-controls-wealth'],
 ['officer','peer','control','officer-controls-peer'],
 ['output','officer','control','output-controls-officer'],
 ['peer','output','generate','peer-generates-output'],
 ['output','wealth','generate','output-generates-wealth'],
 ['wealth','officer','generate','wealth-generates-officer']
];
// The existing multihop allocator enforces shared origin/node budgets. Extend
// its path vocabulary, not its numerical weights or reservation algorithm.
// All routes coexist in one reservation ledger, independent of assumed strength.
export function enumerateBalanceRoutes(network,maxDistance){
 const byId=new Map(network.nodes.map(n=>[n.id,n]));
 const paths=enumerateInteractionPaths(network,maxDistance).map(p=>{
  const origin=byId.get(p.origin).category,target=byId.get(p.nodes.at(-1)).category;
  const mechanism=p.kind==='generation'?
   ({2:'resource-support',3:'officer-resource-support',4:'wealth-officer-resource-support'}[p.nodes.length]):
   p.kind==='direct-burden'?origin+'-direct-burden':origin+'-controls-'+target;
  if(!mechanism)throw Error('unknown base path');
  return {...p,mechanism};
 });
 const add=(mechanism,nodes)=>paths.push({id:mechanism+':'+nodes.join('>'),kind:'balance-extension',mechanism,nodes,origin:nodes[0]});
 for(const n of network.nodes){
  if(n.id===DAY||!Object.hasOwn(directKind,n.category))continue;
  const distance=Math.abs(['year','month','day','hour'].indexOf(n.position)-2);
  if(distance>maxDistance||slot(n)===slot(byId.get(DAY)))continue;
  // Peer is a same-element assistance hypothesis, not a generation edge.
  // Output drain uses the reverse of day->output generation, for budgeting
  // the output node; neither route allocates day-master mass.
  if(n.category==='peer'&&n.anchored||n.category==='output'&&network.edges.some(e=>e.from===DAY&&e.to===n.id&&e.type==='generate'&&e.distance<=maxDistance))add(directKind[n.category],[n.id,DAY]);
 }
 for(const e of network.edges){
  if(e.distance>maxDistance||e.from===DAY||e.to===DAY)continue;
  const from=byId.get(e.from),to=byId.get(e.to);
  const rule=extra.find(([a,b,t])=>a===from.category&&b===to.category&&t===e.type);
  if(rule)add(rule[3],[e.from,e.to]);
 }
 const unique=new Map(paths.map(p=>[p.id,p]));
 if(unique.size!==paths.length)throw Error('duplicate balance path');
 return [...unique.values()].sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0);
}
const definitions={
 weak:{
  resource:{direct:['resource-support'],coverage:{output:['resource-controls-output'],officer:['officer-resource-support'],wealth:['wealth-officer-resource-support']},review:['wealth-controls-resource']},
  peer:{direct:['peer-assistance'],coverage:{wealth:['peer-controls-wealth']},review:['officer-controls-peer','peer-generates-output']}
 },
 strong:{
  output:{direct:['output-drain'],coverage:{},review:['resource-controls-output','output-controls-officer','output-generates-wealth']},
  wealth:{direct:['wealth-direct-burden'],coverage:{resource:['wealth-controls-resource']},review:['peer-controls-wealth','wealth-generates-officer','wealth-officer-resource-support']},
  officer:{direct:['officer-direct-burden'],coverage:{peer:['officer-controls-peer']},review:['output-controls-officer','officer-resource-support','wealth-generates-officer']}
 }
};
// Direct capacity, multi-burden coverage and competing route reservations are
// independent dimensions, not summed into effective strength or a score.
export function summarizeBalanceRoutes(branch,allocations){
 const rules=definitions[branch.assumedDirection];
 if(!rules)throw Error('invalid balance direction');
 return branch.candidates.map(candidate=>{
  const r=rules[candidate.category];
  if(!r)throw Error('invalid balance category');
  const amount=mechanisms=>sum(allocations.filter(p=>mechanisms.includes(p.mechanism)).map(p=>p.accepted));
  return {category:candidate.category,element:candidate.element,direct:amount(r.direct),
   coverage:Object.fromEntries(Object.entries(r.coverage).map(([k,v])=>[k,amount(v)])),
   competing:Object.fromEntries(r.review.map(k=>[k,amount([k])]))};
 });
}
export function reserveBalanceScenario(network,scenario,paths){
 const masses=Object.fromEntries(network.nodes.filter(n=>n.id!==DAY).map(n=>[n.id,0]));
 for(const c of scenario.contributions){
  const id=nodeId(c);
  if(!Object.hasOwn(masses,id)||!Number.isSafeInteger(c.units)||c.units<0)throw Error('invalid contribution');
  masses[id]+=c.units;
 }
 const result=allocateInteractionPaths(paths,masses);
 // Ledger asserts node capacity, and path origin budgets also bound claims.
 if(result.ledger.some(r=>r.reserved>r.capacity))throw Error('balance capacity exceeded');
 return result;
}
const range=xs=>({min:Math.min(...xs),max:Math.max(...xs)});
export function aggregateBalanceReviews(branch,rows){
 if(!rows.length)throw Error('missing route scenarios');
 const candidates=branch.candidates.map((candidate,i)=>{
  const xs=rows.map(r=>r[i]);
  if(xs.some(r=>r.category!==candidate.category))throw Error('candidate alignment');
  const coverage=Object.fromEntries(Object.keys(xs[0].coverage).map(k=>[k,range(xs.map(r=>r.coverage[k]))]));
  return {category:candidate.category,element:candidate.element,presence:candidate.presence,
   direct:range(xs.map(r=>r.direct)),coverage,
   robustCoverage:Object.keys(coverage).filter(k=>coverage[k].min>0),
   competing:Object.fromEntries(Object.keys(xs[0].competing).map(k=>[k,range(xs.map(r=>r.competing[k]))])),
   effective:null};
 });
 // A deliberately narrow weak-branch diagnostic: compare sets of positive
 // reserved burden coverage only when both candidates have direct access.
 // Strict superset, never count multiple paths as multiple independent causes.
 const directAvailable=candidates.filter(c=>c.direct.min>0);
 const focus=branch.assumedDirection==='weak'&&directAvailable.length===candidates.length?
  directAvailable.filter(c=>directAvailable.every(other=>other===c||
   c.robustCoverage.length>other.robustCoverage.length&&other.robustCoverage.every(k=>c.robustCoverage.includes(k)))).map(c=>c.element):[];
 return {assumedDirection:branch.assumedDirection,scenarioCount:rows.length,candidates,
  coverageFocus:focus,selectedElement:null,ranking:null,confirmed:false};
}
