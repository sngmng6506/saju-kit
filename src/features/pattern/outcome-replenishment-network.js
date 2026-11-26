import {evaluateArguments} from './outcome-argumentation.js';
import {evaluateConditionalArguments} from './outcome-conditional-arguments.js';
export const REPLENISHMENT_VERSION='p3-replenishment-network-v1';
const key=(...xs)=>JSON.stringify(xs);
const valid=x=>typeof x==='string'&&x.length>0;
const unique=xs=>new Set(xs).size===xs.length;
const ref=(owner,id,field)=>({owner,id,field});
const lit=propositionId=>({propositionId,sign:'for'});
const retention=id=>key('slot-retained',id);
const access=(node,slot)=>key('root-access',node,slot);
const operation=id=>key('supply-operation',id);
const basis=id=>key('replenishment-basis',id);
const MAX_PATH_WORK=24000,MAX_ALTERNATIVES=4096;
const envelope={selectionAuthority:false,effective:null,actualReplenishmentState:'unresolved'};
// Only explicitly registered directed paths may propagate a root-seeded
// basis. No conservation, quantity, capacity or operation is inferred.
export function compileReplenishmentNetwork({completeHour,nodes,links,targets}={}){
 const bad=reason=>({...envelope,status:'invalid-evidence',reason});
 if(typeof completeHour!=='boolean'||![nodes,links,targets].every(Array.isArray)||
  nodes.some(n=>!n||!valid(n.id)||!Array.isArray(n.rootIds)||n.rootIds.some(id=>!valid(id))||!unique(n.rootIds))||
  !unique(nodes.map(n=>n.id))||!unique(targets)||targets.some(id=>!valid(id))||
  links.some(l=>!l||!valid(l.id)||!valid(l.from)||!valid(l.to)||l.from===l.to||!['generate','peer'].includes(l.kind))||!unique(links.map(l=>l.id))||
  !unique(links.map(l=>key(l.from,l.to,l.kind))))return bad('identity');
 const ns=new Map(nodes.map(n=>[n.id,n]));
 if(targets.some(id=>!ns.has(id))||links.some(l=>!ns.has(l.from)||!ns.has(l.to)))return bad('endpoint');
 const propositions=[],rules=[],vars=new Map(),scope=completeHour?'complete':'partial';
 const observation=(id,subject,kind)=>{
  if(!vars.has(id)){vars.set(id,{id,value:null});propositions.push({id,subject,kind,level:'observation'});}
  return id;
 };
 const rule=(id,out,requires,refs)=>rules.push({id,policyId:REPLENISHMENT_VERSION,conclusion:lit(basis(out)),premises:requires.map(lit),refs,applicability:'complete-only'});
 for(const n of nodes){
  propositions.push({id:basis(n.id),subject:n.id,kind:'hypothetical-root-seeded-replenishment-basis',level:'structural-hypothesis'});
  for(const s of n.rootIds)rule(key('root-seed',n.id,s),n.id,[observation(retention(s),s,'hypothetical-slot-retention'),observation(access(n.id,s),n.id,'hypothetical-root-access')],
   [ref('replenishment-root-inventory',s,n.id)]);
 }
 for(const l of links)rule(key('supply-link',l.id),l.to,[basis(l.from),observation(operation(l.id),l.id,'hypothetical-supply-operation')],[ref('replenishment-link-inventory',l.id,l.kind)]);
 const packet={scope,propositions,evidence:[],rules},result=evaluateArguments(packet);
 if(result.status!==(completeHour?'diagnostic':'partial'))return bad('argument-contract');
 return {...envelope,status:result.status,reason:null,packet,variables:[...vars.values()],targets:targets.map(id=>({id,propositionId:basis(id)})),judgments:result.judgments,ruleResults:result.ruleResults};
}
// Exact simple-path alternatives are a monotone structural explanation,
// not actual usable flow. Cyclic walks add no necessary gate to reachability.
// Budget failure returns no partial frontier.
export function reviewReplenishmentNetwork(input){
 const c=compileReplenishmentNetwork(input);
 if(c.status==='invalid-evidence')return c;
 const {nodes,links,targets,completeHour}=input;
 const base={...envelope,version:REPLENISHMENT_VERSION,status:c.status,completeHour,reason:null,packet:c.packet,variables:c.variables,judgments:c.judgments,ruleResults:c.ruleResults};
 if(!completeHour)return {...base,pathAnalysis:{status:'partial',targets:[]},scenario:null};
 const incoming=new Map(nodes.map(n=>[n.id,[]])),ns=new Map(nodes.map(n=>[n.id,n]));
 for(const l of links)incoming.get(l.to).push(l);
 let work=0,count=0,exhausted=false;
 const rows=[];
 for(const target of targets){
  const alternatives=[],stack=[{node:target,nodeIds:[target],linkIds:[]}];
  while(stack.length){
   if(++work>MAX_PATH_WORK){exhausted=true;break;}
   const {node,nodeIds,linkIds}=stack.pop();
   for(const rootId of ns.get(node).rootIds){
    if(++count>MAX_ALTERNATIVES){exhausted=true;break;}
    alternatives.push({rootId,seedNodeId:node,nodeIds:[...nodeIds].reverse(),linkIds:[...linkIds].reverse(),
     requiredAssumptions:[retention(rootId),access(node,rootId),...linkIds.slice().reverse().map(operation)]});
   }
   if(exhausted)break;
   for(const l of incoming.get(node))if(!nodeIds.includes(l.from))stack.push({node:l.from,nodeIds:[...nodeIds,l.from],linkIds:[...linkIds,l.id]});
  }
  if(exhausted)break;
  rows.push({targetId:target,alternatives,distinctRootIds:[...new Set(alternatives.map(a=>a.rootId))].sort(),
   structurallyReachable:alternatives.length>0,actualReplenishmentState:'unresolved'});
 }
 const pathAnalysis=exhausted?{status:'unavailable',reason:'path-budget',targets:[]}:{status:'diagnostic',reason:null,targets:rows};
 // Keep exact shared completions where affordable. The path frontier is
 // still useful independently of the Boolean enumeration budget.
 const scenario=evaluateConditionalArguments({packet:c.packet,expected:c,variables:c.variables,
  bindings:c.variables.map(v=>({propositionId:v.id,formula:{op:'var',id:v.id}})),targets:c.targets});
 if(!['diagnostic','unavailable'].includes(scenario.status))return {...base,status:'invalid-evidence',reason:'scenario-'+scenario.reason};
 return {...base,pathAnalysis,scenario,limitations:['root-seeded-hypothetical-reachability-not-throughput','operation-and-access-unreviewed','cycles-not-independent-seeds','shared-root-not-independent-budget','no-selection-authority']};
}
