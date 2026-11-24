import { analyzeRootDynamics } from './root-dynamics.js';
import { elementRelation } from './elements.js';

const slot=n=>n.position+':'+n.layer;
const anchored=n=>n.layer==='stem'?n.rooted:n.role==='principal';
function category(day,element){
 const r=elementRelation(day,element);
 if(r.type==='same')return 'peer';
 if(r.type==='generate')return r.direction==='left-to-right'?'output':'resource';
 return r.direction==='left-to-right'?'wealth':'officer';
}

/** Observed directed relations only. No effective strength or cancellation. */
export function analyzeSupportNetwork({saju}={}){
 const d=analyzeRootDynamics({saju});
 const nodes=d.nodes.map(n=>({...n,category:category(d.dayMaster.element,n.element),anchored:anchored(n)}));
 const byId=new Map(nodes.map(n=>[n.id,n]));
 const edges=d.edges.map(e=>({...e,fromCategory:byId.get(e.from).category,toCategory:byId.get(e.to).category}));
 const select=(from,to,type)=>edges.filter(e=>e.fromCategory===from&&e.toCategory===to&&e.type===type);
 const incoming=(id,from,type)=>edges.filter(e=>e.to===id&&e.fromCategory===from&&e.type===type);
 const resources=nodes.filter(n=>n.category==='resource').map(n=>{
  const supply=edges.find(e=>e.from===n.id&&e.to==='day:stem'&&e.type==='generate');
  const threats=incoming(n.id,'wealth','control');
  const sources=incoming(n.id,'officer','generate');
  const regulates=edges.filter(e=>e.from===n.id&&e.toCategory==='output'&&e.type==='control');
  return {id:n.id,anchored:n.anchored,supply,wealthControls:threats,officerSupply:sources,outputControls:regulates,
   localAnchoredWealth:threats.filter(e=>e.local&&byId.get(e.from).anchored).map(e=>e.from)};
 });
 const chains=[];
 for(const [kind,first,mid,last,t1,t2] of [
  ['officer-resource-day','officer','resource','peer','generate','generate'],
  ['wealth-resource-day','wealth','resource','peer','control','generate'],
  ['resource-output-officer','resource','output','officer','control','control'],
  ['output-wealth-officer','output','wealth','officer','generate','generate']
 ]){
  for(const a of select(first,mid,t1))for(const b of select(mid,last,t2)){
   if(a.to!==b.from)continue;
   if(last==='peer'&&b.to!=='day:stem')continue;
   const route=[a.from,a.to,b.to].map(id=>byId.get(id));
   if(new Set(route.map(slot)).size!==3)continue;
   chains.push({kind,nodes:route.map(n=>n.id),local:a.local&&b.local,
    anchoredSource:route[0].anchored,anchoredIntermediate:route[1].anchored,confirmed:false});
  }
 }
 const burdens=Object.fromEntries(['output','wealth','officer'].map(c=>[c,nodes.filter(n=>n.category===c).map(n=>({
  id:n.id,anchored:n.anchored,dayRelation:edges.find(e=>e.from===n.id&&e.to==='day:stem'||e.to===n.id&&e.from==='day:stem'),
  controlsReceived:edges.filter(e=>e.to===n.id&&e.type==='control'&&e.from!=='day:stem'),
  generationReceived:edges.filter(e=>e.to===n.id&&e.type==='generate'&&e.from!=='day:stem')
 }))]));
 return {version:'support-network-v1',completeHour:d.completeHour,dayMaster:d.dayMaster,hiddenStemsBasis:d.hiddenStemsBasis,
  nodes,resources,burdens,chains,outputControlsOfficer:select('output','officer','control'),effectsConfirmed:false};
}
