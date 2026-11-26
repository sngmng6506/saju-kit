const key=(...x)=>JSON.stringify(x);
const eq=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&new Set(a).size===a.length&&new Set(b).size===b.length&&a.every(x=>b.includes(x));
const clearPressure=xs=>Array.isArray(xs)&&xs.every(x=>x.donorState==='no-substantial-root-observed');
// Reuse the original generation screen's observation identities. A
// negative full screen may be decomposed only if its exact source-side
// premises are supported, and its only failed premise is target pressure.
// Missing proof or a contradictory screen is not permission to bypass it.
export function sourceSideScreen(argument,judgments,edge,structural,complete){
 const kinds=['source-basis-screen-met','context-blockers-empty','source-pressure-screen-clear','target-pressure-screen-clear'];
 const ids=kinds.map(k=>key(edge.edgeId,k)),rows=ids.map(id=>judgments.get(id));
 if(rows.some((j,i)=>!j||j.subject!==edge.edgeId||j.kind!==kinds[i]||j.level!=='observation'))return null;
 const expected=complete?[
  ['direct-root-observed','grounded-indirect-path-observed'].includes(edge.sourceBasis),
  edge.contextBlockers.length===0,clearPressure(edge.sourcePressure),clearPressure(edge.targetPressure)
 ]:ids.map(()=>null);
 if(rows.some((j,i)=>j.state!==(expected[i]===null?'unresolved':expected[i]?'supported':'opposed')))return null;
 const rules=argument.rules.filter(r=>r.conclusion.propositionId===structural.id);
 const matches=(r,sign,ps)=>r.policyId==='p1-1-existing-structural-screen-v1'&&r.applicability==='complete-only'&&
  r.conclusion.sign===sign&&!(r.undercutWhen??[]).length&&eq(r.premises.map(p=>key(p.propositionId,p.sign)),ps.map(id=>key(id,sign)));
 if(rules.length!==5||!rules.some(r=>matches(r,'for',ids))||ids.some(id=>!rules.some(r=>matches(r,'against',[id]))))return null;
 if(structural.state!==(!complete?'unresolved':expected.every(Boolean)?'supported':'opposed'))return null;
 return {sourcePremiseIds:ids.slice(0,3),targetPremiseId:ids[3],targetPressureScreenState:rows[3].state,
  sourceScreenState:!complete?'unresolved':expected.slice(0,3).every(Boolean)?'supported':'opposed'};
}
