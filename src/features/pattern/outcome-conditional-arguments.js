import {evaluateArguments} from './outcome-argumentation.js';
import {prepareScenarioDomain} from './outcome-scenario-domain.js';
import {analyzeScenarioSets,MAX_SET_QUERIES,unavailableScenarioSets} from './outcome-scenario-sets.js';
const states=['supported','opposed','conflicting','unresolved'];
const key=(...xs)=>JSON.stringify(xs);
const valid=x=>typeof x==='string'&&x.length>0;
const same=(a,b)=>key(a)===key(b);
// Scenario bindings are explicit hypotheses about observation signs.
// They never replace recorded evidence or seed derived propositions.
// One variable may drive several bindings, including opposite formulas.
export function evaluateConditionalArguments({packet,expected=null,variables,bindings,targets,constraints=[]}={}){
 const base={selectionAuthority:false,effective:null};
 const empty=(status,reason)=>({...base,status,reason,scenarioCount:0,admissibleCount:null,variables:[],targets:[],sets:null});
 const original=evaluateArguments(packet);
 if(!['diagnostic','partial'].includes(original.status))return empty(original.status,original.reason);
 if(expected&&(!same(original.judgments,expected.judgments)||!same(original.ruleResults,expected.ruleResults)))return empty('invalid-evidence','proof-replay');
 if(![variables,bindings,targets,constraints].every(Array.isArray)||bindings.some(b=>!b||!valid(b.propositionId))||targets.some(t=>!t||!valid(t.id)||!valid(t.propositionId))||
  new Set(bindings.map(b=>b.propositionId)).size!==bindings.length||new Set(targets.map(t=>t.id)).size!==targets.length||new Set(targets.map(t=>t.propositionId)).size!==targets.length)return empty('invalid-evidence','identity');
 const props=new Map(packet.propositions.map(p=>[p.id,p])),recorded=new Set(packet.evidence.map(e=>e.propositionId));
 if(bindings.some(b=>props.get(b.propositionId)?.level!=='observation'||recorded.has(b.propositionId))||
  targets.some(t=>props.get(t.propositionId)?.level!=='structural-hypothesis'))return empty('invalid-evidence','binding-authority');
 // Bound total repeated proof work before enumeration. This is a
 // conservative operation-size proxy, not a wall-clock guarantee.
 const extraWork=8*(packet.propositions.length+packet.evidence.length+bindings.length+packet.rules.reduce((n,r)=>n+1+r.premises.length+(r.undercutWhen??[]).length,0))+targets.length;
 const domain=prepareScenarioDomain({scope:packet.scope,variables,constraints,queries:bindings.map(b=>({id:b.propositionId,formula:b.formula})),extraWork});
 if(domain.status!=='diagnostic')return empty(domain.status,domain.reason);
 const ids=new Set(packet.evidence.map(e=>e.id));
 const facts=bindings.map(b=>{
  let id=key('conditional-observation',b.propositionId);
  while(ids.has(id))id+=':';
  ids.add(id);
  return {id,propositionId:b.propositionId,refs:[{owner:'conditional-scenario-binding',id:b.propositionId,field:'formula'}],applicability:'complete-only'};
 });
 const aggregate=targets.map(t=>({id:t.id,propositionId:t.propositionId,counts:Object.fromEntries(states.map(s=>[s,0])),witnesses:Object.fromEntries(states.map(s=>[s,null]))}));
 const collectSets=targets.length<=MAX_SET_QUERIES,patterns=new Map();
 let admitted;
 try{
  admitted=domain.visit((read,values,witness)=>{
   const evidence=[...packet.evidence,...facts.map((f,i)=>({...f,sign:values[i]?'for':'against'}))];
   const result=evaluateArguments({...packet,evidence});
   if(result.status!=='diagnostic')throw Error(result.status+':'+result.reason);
   const judgments=new Map(result.judgments.map(j=>[j.id,j]));
   let mask=0;
   aggregate.forEach((a,i)=>{
    const s=judgments.get(a.propositionId).state;
    a.counts[s]++;
    if(a.witnesses[s]===null)a.witnesses[s]=witness();
    // Strict support only: a conflicting judgment is not accepted as a
    // clean condition. Its positive and negative counts remain visible.
    if(collectSets&&s==='supported')mask|=1<<i;
   });
   if(collectSets){
    const old=patterns.get(mask);
    if(old)old.count++;else patterns.set(mask,{mask,count:1,witness:witness()});
   }
  });
 }catch(e){const reason=String(e.message);return empty(reason.startsWith('unavailable:')?'unavailable':'invalid-evidence','closure-'+reason);}
 if(!admitted)return {...empty('diagnostic','no-admissible-completion'),scenarioCount:domain.count,admissibleCount:0,variables:domain.unknown};
 const sets=collectSets?analyzeScenarioSets(targets.map(t=>t.id),[...patterns.values()]):unavailableScenarioSets('set-query-budget');
 return {...base,status:'diagnostic',reason:null,scenarioCount:domain.count,admissibleCount:admitted,variables:domain.unknown,
  targets:aggregate.map(a=>({...a,possibleStates:states.filter(s=>a.counts[s]>0),invariantState:states.find(s=>a.counts[s]===admitted)??null})),sets,
  limitations:['hypothetical-observation-signs-only','strict-support-set-not-conflict','scenario-count-not-probability','no-effect-authority']};
}
