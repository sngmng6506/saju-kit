// Common role-policy evidence contract. No rule-specific interpretation.
export const ref=(r,w)=>({ruleId:r.id,witnessId:w.id});
export const key=(r,w)=>JSON.stringify([r,w]);
export const edgeKey=(from,to,kind)=>JSON.stringify([from,to,kind]);
export const validStates=Object.freeze(['supported','opposed','conflicting','unresolved']);
export const premise=(id,state,evidence)=>({id,state,evidence});
export const unknown=(id,evidence=null)=>premise(id,'unresolved',evidence);
export function combinePremises(ps){
 if(ps.some(p=>p.state==='conflicting'))return 'conflicting';
 if(ps.some(p=>p.state==='opposed'))return 'opposed';
 return ps.length&&ps.every(p=>p.state==='supported')?'supported':'unresolved';
}
export const dayDirection=(complete,strength)=>complete&&['strong','weak'].includes(strength?.direction)?strength.direction:null;
export const distinctSlots=(actors,ids)=>ids.every(id=>actors.has(id))&&new Set(ids.map(id=>{const a=actors.get(id);return a.position+':'+a.layer;})).size===ids.length;
export const hasEdge=(w,a,b,k)=>w.edges.some(e=>e.from===a&&e.to===b&&e.kind===k);
const index=(rows,fn)=>{
 if(!Array.isArray(rows))return null;
 const map=new Map(rows.map(row=>[fn(row),row]));
 return map.size===rows.length?map:null;
};
// Strict raw/identity coverage is required for policies that assess raw
// edges. Legacy registry-only consumers retain their narrower contract.
export function createRoleEvidence(review,capacity,mechanism,{prior=null,rootContext=null,flow=null,rawRequired=false}={}){
 if(!review||!capacity||!mechanism||[capacity,mechanism,rootContext,flow].some(x=>x?.status==='invalid-evidence')||
  [mechanism,flow].some(x=>x?.candidateId!=null&&x.candidateId!==review.candidateId))return null;
 const actors=index(capacity.occurrences,o=>o.id);
 const entries=review.rules.flatMap(r=>r.witnesses.map(w=>({r,w})));
 const lookup=index(entries,x=>key(x.r.id,x.w.id));
 const registry=index(mechanism.edges,e=>edgeKey(e.from,e.to,e.kind));
 const routes=index(mechanism.routes,r=>key(r.ruleId,r.witnessId));
 if(!actors||!lookup||!registry||!routes||routes.size!==entries.length||[...lookup.keys()].some(k=>!routes.has(k)))return null;
 const day=[...actors.values()].filter(o=>o.dayReference);
 if(day.length!==1)return null;
 const roots=rootContext?index(rootContext.occurrences,o=>o.id):null;
 if(rootContext&&(!roots||roots.size!==actors.size||[...actors.keys()].some(id=>!roots.has(id))))return null;
 const flowRows=flow?index(flow.routes,r=>key(r.ruleId,r.witnessId)):null;
 if(flow&&(!flowRows||flowRows.size!==lookup.size||[...lookup.keys()].some(k=>!flowRows.has(k))))return null;
 const visible=[...actors.values()].filter(o=>o.layer==='visible');
 let raw=null,original=null;
 if(rawRequired){
  original=index(prior?.stemForce?.occurrences,o=>o.id);
  raw=index(prior?.relativeForce?.edges,e=>edgeKey(e.from,e.to,e.kind));
  if(!original||!raw||original.size!==actors.size||visible.some(o=>o.id!=='visible:'+o.position)||
   new Set(visible.map(o=>o.position)).size!==visible.length||
   [...actors.values()].some(o=>{const a=original.get(o.id);return !a||['position','layer','tenGod','dayReference'].some(k=>a[k]!==o[k]);}))return null;
 }
 return {actors,entries,lookup,registry,routes,day:day[0],roots,flowRows,visible,raw,original,
  distinct:ids=>distinctSlots(actors,ids)};
}
export function createRoleEdgeReader(evidence,complete,assessEdge){
 let invalid=false;
 const {raw,registry}=evidence;
 function edge(from,to,kind,required=true){
  const k=edgeKey(from,to,kind),r=raw.get(k);
  if(!r){if(required)invalid=true;return null;}
  const e=assessEdge({from,to,kind,edgeId:r.id}),old=registry.get(k);
  if(!e||e.from!==from||e.to!==to||e.kind!==kind||e.effective!==null||!validStates.includes(e.status)){
   invalid=true;return null;
  }
  if(old&&(old.status!==e.status||old.effective!==null||JSON.stringify(old.conditions)!==JSON.stringify(e.conditions)))invalid=true;
  return {from,to,kind,edgeId:r.id,status:complete?e.status:'unresolved',conditions:e.conditions,effective:null};
 }
 const bound=(e,a,b,k)=>!!e&&e.from===a&&e.to===b&&e.kind===k&&raw.has(edgeKey(a,b,k))&&e.edgeId===raw.get(edgeKey(a,b,k)).id;
 return {edge,bound,invalid:()=>invalid};
}
export function createRegistryReader(registry,complete,{nullMissingId=false,missingReason=false}={}){
 let invalid=false;
 function directed(from,to,kind,label,required=true){
  const e=registry.get(edgeKey(from,to,kind));
  if(!e){if(required)invalid=true;return unknown(label,{from,to,kind,...(missingReason?{reason:'route-edge-not-projected'}:{})});}
  if(!validStates.includes(e.status)||e.effective!==null){invalid=true;return unknown(label,{from,to,kind});}
  return premise(label,complete?e.status:'unresolved',{from,to,kind,edgeId:nullMissingId?e.id??null:e.id,conditions:e.conditions});
 }
 return {directed,invalid:()=>invalid};
}
