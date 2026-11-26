import {sourceEffectClauses,reviewSourceEffectPolicy} from '../../src/features/pattern/outcome-source-effect-policy.js';
export function summarizeSourceEffectPolicy(c,m,strength,partial){
 const base={id:c.id,partial,effectConfirmed:null},errors=[],counts={actions:0,clauses:0,unresolved:0,undercuts:0,dayAligned:0,dayOpposed:0,dayUnresolved:0};
 const r=m?.sourceEffectReview,argument=m?.argumentReview,supply=m?.groundedSupply,capacity=m?.roleCapacity;
 if(!r||r.status!==(partial?'partial':'diagnostic')||r.completeHour!==!partial||r.selectionAuthority!==false||r.effectConfirmed!==null||!Array.isArray(r.actions)||
  !Array.isArray(capacity?.occurrences)||!Array.isArray(argument?.actions)||!Array.isArray(supply?.actions))return {...base,counts,errors:['source-effect-contract']};
 const registry=new Map(sourceEffectClauses().map(c=>[c.id,c]));
 const expected=reviewSourceEffectPolicy({completeHour:!partial,stemForce:{occurrences:capacity.occurrences}},argument,supply,strength);
 if(JSON.stringify(expected)!==JSON.stringify(r))errors.push('source-effect-replay');
 if(r.clauseCount!==25||registry.size!==25||r.actions.length!==argument.actions.length)errors.push('source-effect-coverage');
 for(const a of r.actions){
  counts.actions++;counts.undercuts+=a.structuralUndercuts.length;
  if(a.actualEffectState!=='unresolved'||a.effectConfirmed!==null||a.structuralUndercuts.some(u=>u.actualEffectRebuttal!==false)||a.clauses.length!==(a.kind==='generate'?3:2))errors.push('source-effect-authority:'+a.edgeId);
  for(const p of a.clauses){
   counts.clauses++;if(p.applicability==='unresolved')counts.unresolved++;
   if(!registry.has(p.clauseId)||p.predicateState!=='unresolved'||p.applicability!=='unresolved'||p.consequenceState!=='not-established'||p.effectConfirmed!==null)errors.push('source-effect-premise:'+a.edgeId+':'+p.clauseId);
   const d=p.dayHypothesisContext;
   if(d){if(d.fit==='aligned')counts.dayAligned++;else if(d.fit==='opposed')counts.dayOpposed++;else counts.dayUnresolved++;
    if(d.substitutionConfirmed!==null)errors.push('source-effect-day-substitution:'+a.edgeId);}
  }
 }
 return {...base,counts,errors};
}
