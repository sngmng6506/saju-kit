// Four-valued, monotone, explicit signed evidence. No negation by failure,
// no score/vote counting, no default priorities, no cyclic self-support.
// A rule's conclusion is about its declared proposition, not another one.
// Optional observation-only undercuts are evaluated before closure. They
// restrict a rule, not the truth of its conclusion; no recursive defeat.
export const ARGUMENTATION_VERSION='outcome-argumentation-v1';
const signs=['for','against'];
const validText=x=>typeof x==='string'&&x.length>0;
const index=(xs,f)=>Array.isArray(xs)&&xs.every(x=>x&&typeof x==='object'&&!Array.isArray(x))&&new Set(xs.map(f)).size===xs.length?new Map(xs.map(x=>[f(x),x])):null;
const literalKey=x=>JSON.stringify([x.propositionId,x.sign]);
const state=(p,n)=>p?n?'conflicting':'supported':n?'opposed':'unresolved';
const limit=Object.freeze({propositions:12000,evidence:24000,rules:24000,premises:32});
export function evaluateArguments(input){
 const base={version:ARGUMENTATION_VERSION,selectionAuthority:false,effective:null};
 const empty=(status,reason)=>({...base,status,reason,judgments:[],ruleResults:[]});
 if(!input||!['complete','partial'].includes(input.scope)||![input.propositions,input.evidence,input.rules].every(Array.isArray))return empty('invalid-evidence','shape');
 const {propositions,evidence,rules,scope}=input;
 if(propositions.length>limit.propositions||evidence.length>limit.evidence||rules.length>limit.rules)return empty('unavailable','budget-exceeded');
 const props=index(propositions,p=>p.id),facts=index(evidence,e=>e.id),ruleMap=index(rules,r=>r.id);
 if(!props||!facts||!ruleMap||propositions.some(p=>!validText(p.id)||!validText(p.kind)||!['observation','structural-hypothesis','effect-hypothesis'].includes(p.level)||!validText(p.subject)))return empty('invalid-evidence','identity');
 const literal=x=>x&&props.has(x.propositionId)&&signs.includes(x.sign);
 const refs=x=>Array.isArray(x)&&x.length>0&&x.length<=32&&x.every(r=>r&&validText(r.owner)&&validText(r.id)&&validText(r.field));
 // No direct evidence may assert effective force. Rules cannot promote
 // effect hypotheses in v1 either; later reviewed policy needs a new gate.
 if(evidence.some(e=>!validText(e.id)||!literal(e)||!refs(e.refs)||props.get(e.propositionId).level==='effect-hypothesis'||
  !['observed','complete-only'].includes(e.applicability)))return empty('invalid-evidence','fact-contract');
 for(const r of rules){
  const u=r.undercutWhen===undefined?[]:r.undercutWhen;
  if(!Array.isArray(u)||u.length>limit.premises||u.some(p=>!literal(p)||props.get(p.propositionId).level!=='observation')||
   new Set(u.map(literalKey)).size!==u.length)return empty('invalid-evidence','undercut-contract');
  if(!validText(r.id)||!validText(r.policyId)||!literal(r.conclusion)||!Array.isArray(r.premises)||!r.premises.length||r.premises.length>limit.premises||
   r.premises.some(p=>!literal(p))||new Set(r.premises.map(literalKey)).size!==r.premises.length||
   !refs(r.refs)||!['observed','complete-only'].includes(r.applicability)||
   props.get(r.conclusion.propositionId).level!=='structural-hypothesis'||
   r.premises.some(p=>props.get(p.propositionId).level==='effect-hypothesis'))return empty('invalid-evidence','rule-contract');
 }
 const available=x=>x.applicability==='observed'||scope==='complete';
 const ranks=new Map(),witnesses=new Map();
 for(const f of evidence.filter(available)){
  const k=literalKey(f);ranks.set(k,0);if(!witnesses.has(k))witnesses.set(k,[]);
  witnesses.get(k).push({kind:'evidence',id:f.id});
 }
 // Synchronous rounds; only first-rank witnesses form the proof DAG.
 // Later applicable rules remain visible but cannot become circular proofs.
 // Snapshot explicit observation evidence before any rule can fire.
 // A conflicting observation still supplies the declared undercut sign;
 // its contrary proof is retained, not used as a priority.
 const attacks=new Map(rules.map(r=>[r.id,(r.undercutWhen??[]).filter(p=>ranks.has(literalKey(p))).map(p=>({
  ...p,witnesses:[...witnesses.get(literalKey(p))]}))]));
 const eligible=rules.filter(r=>available(r)&&attacks.get(r.id).length===0),waiting=new Map(),unmet=new Map(),byRule=new Map(eligible.map(r=>[r.id,r]));
 for(const r of eligible){
  const missing=r.premises.map(literalKey).filter(k=>!ranks.has(k));unmet.set(r.id,missing.length);
  for(const k of missing){if(!waiting.has(k))waiting.set(k,[]);waiting.get(k).push(r.id);}
 }
 let ready=eligible.filter(r=>unmet.get(r.id)===0),rank=1;
 while(ready.length){
  const added=new Set();
  for(const r of ready){
   const k=literalKey(r.conclusion);
   if(!ranks.has(k)){ranks.set(k,rank);witnesses.set(k,[]);added.add(k);}
   if(ranks.get(k)===rank)witnesses.get(k).push({kind:'rule',id:r.id});
  }
  const next=[];
  for(const k of added)for(const id of waiting.get(k)??[]){const n=unmet.get(id)-1;unmet.set(id,n);if(n===0)next.push(byRule.get(id));}
  ready=next;rank++;
 }
 const judgments=propositions.map(p=>{
  const read=sign=>{const k=literalKey({propositionId:p.id,sign});return {rank:ranks.get(k)??null,witnesses:witnesses.get(k)??[]};};
  const support=read('for'),opposition=read('against');
  return {id:p.id,kind:p.kind,level:p.level,subject:p.subject,state:state(support.rank!==null,opposition.rank!==null),support,opposition,effective:null};
 });
 const ruleResults=rules.map(r=>{
  const missing=r.premises.filter(p=>!ranks.has(literalKey(p))),k=literalKey(r.conclusion);
  const undercuts=attacks.get(r.id);
  return {id:r.id,status:!available(r)?'scope-unresolved':undercuts.length?'undercut':missing.length?'premises-unresolved':'applicable',
   missing,firstRankWitness:!!witnesses.get(k)?.some(w=>w.kind==='rule'&&w.id===r.id),
   ...(r.undercutWhen===undefined?{}:{undercuts})};
 });
 return {...base,status:scope==='complete'?'diagnostic':'partial',reason:null,judgments,ruleResults};
}
