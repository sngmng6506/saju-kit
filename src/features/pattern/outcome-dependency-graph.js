// Typed identity graph. Links describe references, not effective causation.
// Parallel use of a resource does not prove exclusivity or independent capacity.
const key=(...xs)=>JSON.stringify(xs);
const valid=x=>typeof x==='string'&&x.length>0;
export function createDependencyGraph(){
 const nodes=new Map(),links=new Map();
 const node=(kind,ref)=>{
  if(!valid(kind)||!valid(ref))throw Error('node-identity');
  const id=key(kind,ref);
  if(!nodes.has(id))nodes.set(id,{id,kind,ref});
  return id;
 };
 const link=(from,to,kind,role=null)=>{
  if(!nodes.has(from)||!nodes.has(to)||!valid(kind)||role!==null&&!valid(role))throw Error('link-binding');
  const id=key(from,to,kind,role);
  if(!links.has(id))links.set(id,{id,from,to,kind,role});
 };
 const finish=()=>{
  const order=(a,b)=>a.id<b.id?-1:a.id>b.id?1:0;
  return {nodes:[...nodes.values()].sort(order),links:[...links.values()].sort(order)};
 };
 return {node,link,finish};
}
// Report shared references by distinct consumers, not by link count.
// Callers choose the semantic link types and resource kind explicitly.
export function sharedDependencyUses(graph,{consumerKind,resourceKind,linkKinds}){
 const ns=new Map(graph.nodes.map(n=>[n.id,n])),uses=new Map();
 for(const e of graph.links){
  if(ns.get(e.from)?.kind!==consumerKind||ns.get(e.to)?.kind!==resourceKind||!linkKinds.includes(e.kind))continue;
  if(!uses.has(e.to))uses.set(e.to,new Map());
  const consumers=uses.get(e.to);
  if(!consumers.has(e.from))consumers.set(e.from,[]);
  consumers.get(e.from).push(e.id);
 }
 return [...uses].filter(([,m])=>m.size>1).map(([id,m])=>({resourceId:id,consumers:[...m].map(([consumerId,linkIds])=>({consumerId,linkIds})),exclusiveConfirmed:null,independentCapacityConfirmed:null}));
}
