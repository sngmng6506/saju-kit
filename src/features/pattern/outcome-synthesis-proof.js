import {evaluateArguments} from './outcome-argumentation.js';
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const unresolved=x=>x==='unresolved';
const index=(xs,f)=>Array.isArray(xs)&&xs.every(x=>x&&typeof x==='object')&&new Set(xs.map(f)).size===xs.length?new Map(xs.map(x=>[f(x),x])):null;

// Replay validates internal proof consistency, not independent truth of
// supplied evidence. Domain consumers still own inventory and source checks.
export const replaySynthesisProof=(owner,scope)=>{
 if(!owner||![owner.propositions,owner.evidence,owner.rules,owner.judgments,owner.ruleResults].every(Array.isArray))return null;
 const r=evaluateArguments({scope,propositions:owner.propositions,evidence:owner.evidence,rules:owner.rules});
 if(r.status!==(scope==='complete'?'diagnostic':'partial')||!same(r.judgments,owner.judgments)||!same(r.ruleResults,owner.ruleResults))return null;
 const judgments=index(r.judgments,j=>j.id),results=index(r.ruleResults,x=>x.id);
 if(!judgments||!results||r.judgments.some(j=>j.level==='effect-hypothesis'&&!unresolved(j.state)))return null;
 return {judgments,rules:owner.rules,results};
};
// References retain exact owner and proposition identity. Alternatives
// remain separate conjunctions, including opposition and undercut paths.
// Missing premises are proof obligations, not negative effect evidence.
export function describeSynthesisProof(g,id,owner){
 const j=g?.judgments.get(id);if(!j)return null;
 const alternatives=g.rules.filter(r=>r.conclusion.propositionId===id).map(r=>{
  const q=g.results.get(r.id);
  return {ruleId:r.id,sign:r.conclusion.sign,status:q.status,missing:q.missing.map(p=>({propositionId:p.propositionId,sign:p.sign,
   kind:g.judgments.get(p.propositionId).kind,state:g.judgments.get(p.propositionId).state})),undercuts:q.undercuts??[]};
 });
 return {owner,propositionId:id,kind:j.kind,subject:j.subject,level:j.level,state:j.state,proof:{support:j.support,opposition:j.opposition},alternatives};
}

// Bind an exported proof to its replayed judgment and expected source.
// Alternatives are presentation data; only signed witnesses are bound here.
export function bindSynthesisProof(g,p,owner,kind,subject){
 const j=g?.judgments.get(p?.propositionId);
 return !!j&&p.owner===owner&&p.kind===kind&&p.subject===subject&&p.level===j.level&&j.kind===kind&&j.subject===subject&&p.state===j.state&&
  same(p.proof,{support:j.support,opposition:j.opposition});
}
export function preservesSynthesisProofs(original,extended){
 return !!original&&!!extended&&[...original.judgments].every(([id,j])=>same(j,extended.judgments.get(id)));
}
