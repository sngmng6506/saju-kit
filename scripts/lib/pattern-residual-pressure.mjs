import {evaluateArguments} from '../../src/features/pattern/outcome-argumentation.js';
import {positiveProofFrontier,comparePositiveFrontiers} from '../../src/features/pattern/outcome-positive-frontier.js';
import {auditBurdenSourceConditions} from './pattern-strength-source-conditions.mjs';
const key=(...xs)=>JSON.stringify(xs),same=(a,b)=>key(a)===key(b),lit=propositionId=>({propositionId,sign:'for'});
const VERSION='p3-residual-pressure-v1';
// Generic positive fragment: pressure and candidate full relief share
// exact modeled action premises. "Uncovered" is local and hypothetical;
// it is not a proof of actual residual magnitude or lack of other relief.
export function compileResidualPressure({packet,pressures}={}){
 const empty=reason=>({status:'invalid-evidence',reason});
 try{
  const baseline=evaluateArguments(packet);
  if(!['diagnostic','partial'].includes(baseline.status)||packet.evidence.length||!Array.isArray(pressures))return empty('packet');
  const props=new Map(packet.propositions.map(p=>[p.id,p])),propositions=[...packet.propositions],rules=[...packet.rules],rows=[],seen=new Set();
  const add=(id,subject,kind,level)=>{
   if(props.has(id))throw Error('duplicate-proposition');
   const p={id,subject,kind,level};props.set(id,p);propositions.push(p);return id;
  };
  const valid=x=>typeof x==='string'&&x.length>0;
  const validBasis=xs=>Array.isArray(xs)&&xs.length>0&&new Set(xs).size===xs.length&&xs.every(x=>props.get(x)?.level==='structural-hypothesis'&&packet.propositions.some(p=>p.id===x));
  const rule=(id,out,required)=>rules.push({id,policyId:VERSION,conclusion:lit(out),premises:required.map(lit),refs:[{owner:'residual-pressure-policy',id,field:'conditional-only'}],applicability:'complete-only'});
  for(const p of pressures){
   if(!p||!valid(p.id)||seen.has(p.id)||!validBasis(p.basis)||!Array.isArray(p.relief))return empty('pressure-contract');
   seen.add(p.id);
   const pressureGuard=add(key('pressure-effective',p.id),p.id,'hypothetical-pressure-exists','observation');
   const pressure=add(key('modeled-pressure',p.id),p.id,'conditional-pressure','structural-hypothesis');
   const fullRelief=add(key('modeled-full-relief',p.id),p.id,'conditional-local-full-relief','structural-hypothesis');
   rule(key('pressure-rule',p.id),pressure,[...p.basis,pressureGuard]);
   const routes=[],routeIds=new Set();
   for(const r of p.relief){
    if(!r||!valid(r.id)||routeIds.has(r.id)||!validBasis(r.basis))return empty('relief-contract');
    routeIds.add(r.id);
    const guard=add(key('full-relief-effective',p.id,r.id),p.id,'hypothetical-exact-pressure-fully-relieved','observation');
    const propositionId=add(key('full-relief-route',p.id,r.id),p.id,'conditional-exact-pressure-full-relief','structural-hypothesis');
    rule(key('relief-rule',p.id,r.id),propositionId,[pressure,...r.basis,guard]);
    rule(key('relief-alternative',p.id,r.id),fullRelief,[propositionId]);
    routes.push({...r,guard,propositionId,actualReliefState:'unresolved'});
   }
   rows.push({...p,pressureGuard,pressure,fullRelief,relief:routes,actualResidualState:'unresolved'});
  }
  const combined={...packet,propositions,rules},result=evaluateArguments(combined);
  if(result.status!==baseline.status||!same(result.judgments.slice(0,baseline.judgments.length),baseline.judgments)||!same(result.ruleResults.slice(0,baseline.ruleResults.length),baseline.ruleResults))return empty('proof-parity');
  const frontier=positiveProofFrontier(combined);
  if(!['diagnostic','partial','unavailable'].includes(frontier.status))return empty('frontier');
  const fs=new Map(frontier.frontiers.map(f=>[f.id,f.terms]));
  for(const p of rows){
   if(frontier.status!=='diagnostic'){p.comparison=null;continue;}
   const c=comparePositiveFrontiers(fs.get(p.pressure),fs.get(p.fullRelief));
   if(c.status!=='diagnostic'){p.comparison=c;continue;}
   if(c.rightPossible&&c.rightImpliesLeft!==true||c.witnesses.rightOnly!==null)return empty('relief-without-pressure');
   const witnesses={uncovered:c.witnesses.leftOnly,fullyRelieved:c.witnesses.both,inactive:c.witnesses.neither};
   for(const [name,w] of Object.entries(witnesses)){
    if(w===null)continue;
    const yes=new Set(w),evidence=propositions.filter(x=>x.level==='observation').map((x,i)=>({id:key('residual-witness',i),...lit(x.id),sign:yes.has(x.id)?'for':'against',refs:[{owner:'residual-witness',id:x.id,field:'hypothetical'}],applicability:'complete-only'}));
    const rr=evaluateArguments({...combined,evidence}),js=new Map(rr.judgments.map(j=>[j.id,j.state]));
    if(rr.status!=='diagnostic'||(js.get(p.pressure)==='supported')!==(name!=='inactive')||(js.get(p.fullRelief)==='supported')!==(name==='fullyRelieved'))return empty('witness-replay');
   }
   p.comparison={status:'diagnostic',pressurePossible:c.leftPossible,localFullReliefPossible:c.rightPossible,localUncoveredPossible:witnesses.uncovered!==null,witnesses,actualResidualState:'unresolved'};
  }
  return {status:baseline.status,reason:null,packet:combined,judgments:result.judgments,ruleResults:result.ruleResults,frontierStatus:frontier.status,rows,selectionAuthority:false,effective:null,actualResidualState:'unresolved'};
 }catch(e){return empty(String(e?.message??e));}
}
// Source-specific adapter: exact pressure edge, and for resource loss
// the exact protected supply edge. Direct wealth demand is not equated
// with damage to resource. Routes do not cancel unrelated pressures.
export function auditResidualPressure(input){
 const base={version:VERSION,selectionAuthority:false,effective:null,actualStrengthState:'unresolved',actualResidualState:'unresolved',actualMagnitudeComparison:'unresolved'};
 const empty=reason=>({...base,status:'invalid-evidence',reason,rows:[],summary:null});
 const source=auditBurdenSourceConditions(input);
 if(!['diagnostic','partial'].includes(source.status))return empty(source.reason);
 if(source.status==='partial')return {...base,status:'partial',reason:null,rows:[],summary:null};
 try{
  const actions=new Map(input.burden.actionRows.map(a=>[a.id,a])),day='day:stem',pressures=new Map();
  const add=(kind,edge,supply=null)=>{
   const id=key(kind,edge.id,supply?.id??null);
   if(!pressures.has(id))pressures.set(id,{id,kind,pressureActionId:edge.id,protectedSupplyActionId:supply?.id??null,basis:[edge.propositionId,...(supply?[supply.propositionId]:[])],relief:[]});
   return pressures.get(id);
  };
  for(const a of actions.values()){
   if(a.kind==='control'&&a.to===day)add('incoming-control',a);
   if(a.kind==='generate'&&a.from===day)add('outgoing-generation',a);
   if(a.kind==='control'&&a.from===day)add('wealth-demand',a);
  }
  const edge=(kind,from,to)=>{const a=actions.get(key(kind,from,to));if(!a)throw Error('edge-binding');return a;};
  const bind=(p,c,r,legs)=>{
   if(!legs.every(a=>r.actionIds.includes(a.id)))throw Error('route-binding');
   p.relief.push({id:r.id,sourceContext:c.id,actionIds:legs.map(a=>a.id),basis:[...new Set(legs.map(a=>a.propositionId))]});
  };
  for(const c of source.conditions)for(const r of c.rows){
   const b=r.bindings;
   if(c.id==='control-resource-mediation'){
    const threat=edge('control',b.controller,day);
    bind(add('incoming-control',threat),c,r,[edge('generate',b.controller,b.resource),edge('generate',b.resource,day)]);
   }else if(c.id==='output-resource-restraint'){
    const threat=edge('generate',day,b.output);
    bind(add('outgoing-generation',threat),c,r,[edge('control',b.resource,b.output),edge('generate',b.resource,day)]);
   }else if(c.id==='wealth-resource-interference'||c.id==='peer-protects-resource'){
    const threat=edge('control',b.wealth,b.resource),supply=edge('generate',b.resource,day);
    const p=add('resource-interference',threat,supply);
    if(c.id==='peer-protects-resource')bind(p,c,r,[edge('control',b.peer,b.wealth)]);
   }
  }
  const q=compileResidualPressure({packet:input.burden.packet,pressures:[...pressures.values()]});
  if(q.status!=='diagnostic')return empty(q.reason);
  const evaluated=q.rows.filter(r=>r.comparison?.status==='diagnostic');
  return {...base,status:'diagnostic',reason:null,rows:q.rows,summary:{pressures:q.rows.length,withLocalReliefCandidates:q.rows.filter(r=>r.relief.length).length,
   evaluated:evaluated.length,pressurePossible:evaluated.filter(r=>r.comparison.pressurePossible).length,localFullReliefPossible:evaluated.filter(r=>r.comparison.localFullReliefPossible).length,
   localUncoveredPossible:evaluated.filter(r=>r.comparison.localUncoveredPossible).length,unavailable:q.rows.length-evaluated.length,actualEffectsConfirmed:0},
   limitations:['exact-pressure-not-total-burden','local-full-relief-guard-unreviewed','uncovered-not-actual-residual','no-external-relief-closure','no-capacity-or-allocation','no-strength-authority']};
 }catch(e){return empty(String(e?.message??e));}
}
