import { observePathNode } from '../../core/path-node-evidence.js';
import { elementRelation } from '../../core/elements.js';
const ELEMENTS=['wood','fire','earth','metal','water'];
const slot=n=>n.position+':'+n.layer;
const relation=(a,b,type)=>{const r=elementRelation(a,b);return r.type===type&&r.direction==='left-to-right';};
const pathKey=ids=>ids.join('>');
export function observeMediationPairs(dynamics,structure){
 const nodes=dynamics.nodes,byId=new Map(nodes.map(n=>[n.id,n]));
 const nodeEvidence=n=>observePathNode(n,structure);
 const evidence=new Map(nodes.map(n=>[n.id,nodeEvidence(n)]));
 const pairs=[];
 for(const from of ELEMENTS)for(const to of ELEMENTS){
  if(!relation(from,to,'control'))continue;
  const via=ELEMENTS.find(x=>relation(from,x,'generate')&&relation(x,to,'generate'));
  const controls=dynamics.edges.filter(e=>e.type==='control'&&byId.get(e.from).element===from&&byId.get(e.to).element===to);
  if(!controls.length)continue;
  const routes=[];
  for(const control of controls){
   for(const a of dynamics.edges.filter(e=>e.from===control.from&&e.type==='generate'&&byId.get(e.to).element===via)){
    const b=dynamics.edges.find(e=>e.from===a.to&&e.to===control.to&&e.type==='generate');
    if(!b)continue;
    const ids=[a.from,a.to,b.to];
    if(new Set(ids.map(id=>slot(byId.get(id)))).size!==3)continue;
    const mediator=evidence.get(a.to);
    const obstructions=dynamics.edges.filter(e=>e.to===a.to&&e.type==='control'&&!ids.includes(e.from)).map(e=>({
     node:evidence.get(e.from),distance:e.distance,local:e.local
    }));
    routes.push({id:pathKey(ids),nodes:ids.map(id=>evidence.get(id)),
     controlDistance:control.distance,distances:[a.distance,b.distance],
     adjacent:a.distance<=1&&b.distance<=1,oneGap:a.distance<=2&&b.distance<=2,
     mediator,obstructions,confirmed:false});
   }
  }
  const mediatorNodes=nodes.filter(n=>n.element===via&&n.id!=='day:stem').map(n=>evidence.get(n.id));
  const independentRoutes=routes.filter(r=>!r.mediator.dayReference);
  pairs.push({from,to,via,controlCount:controls.length,localControlCount:controls.filter(e=>e.local).length,
   mediatorNodes,routeCount:routes.length,routes,
   adjacentAnchored:independentRoutes.filter(r=>r.adjacent&&r.mediator.anchorObserved).length,
   adjacentIntact:independentRoutes.filter(r=>r.adjacent&&r.mediator.intactSubstantialRoot).length,
   oneGapAnchored:independentRoutes.filter(r=>r.oneGap&&r.mediator.anchorObserved).length,
   absentMediator:mediatorNodes.length===0,confirmed:false});
 }
 return pairs;
}
// Largest two categories is an ordinal diagnostic, not equality or actual conflict.
// Day-master mass is excluded by the existing quantitative kernel.
export function compareConfrontation(pairs,observations,standard,neutral){
 const categories=new Map(observations.map(o=>[o.element,o.category]));
 const key=r=>[r.positionProfile,r.roleProfile,r.rootProfile,r.seasonProfile,r.seasonBasis].join(':');
 const keys=new Set(neutral.map(key));
 if(!standard.length||standard.length!==neutral.length||keys.size!==neutral.length||new Set(standard.map(key)).size!==standard.length||standard.some(r=>!keys.has(key(r))))throw Error('unmatched mediation scenarios');
 const summarize=(rows,a,b)=>{
  let topTwo=0,positive=0;let minRatio=1,maxRatio=0;
  for(const r of rows){
   const x=r.mass[a],y=r.mass[b],hi=Math.max(x,y),lo=Math.min(x,y);
   if(!Number.isSafeInteger(x)||!Number.isSafeInteger(y)||x<0||y<0)throw Error('invalid mediation mass');
   if(lo>0){positive++;if(Object.keys(r.mass).filter(k=>k!==a&&k!==b).every(k=>r.mass[k]<lo))topTwo++;}
   const ratio=hi?lo/hi:0;minRatio=Math.min(minRatio,ratio);maxRatio=Math.max(maxRatio,ratio);
  }
  return {scenarioCount:rows.length,positive,topTwo,minRatio,maxRatio};
 };
 return pairs.map(p=>{
  const a=categories.get(p.from),b=categories.get(p.to);
  const standardEvidence=summarize(standard,a,b),neutralEvidence=summarize(neutral,a,b);
  const robustTopTwo=standardEvidence.topTwo===standard.length&&neutralEvidence.topTwo===neutral.length;
  return {...p,nominalConfrontation:{standard:standardEvidence,neutral:neutralEvidence,robustTopTwo,equalityResolved:false},
   reviewStatus:robustTopTwo?p.absentMediator?'supplement-hypothesis':p.adjacentIntact?'local-route-observed':'access-limited':'not-robust-top-two',
   selectedElement:null};
 });
}
