import {readCapacityComparison} from '../../src/features/pattern/outcome-role-priority.js';
const sorted=xs=>[...new Set(xs)].sort();
// Source claims and inferred comparison proxies are different denominators.
export function evaluateRoleContrast(fixture,capacity,comparisons){
 const rows=[];
 for(const p of fixture.probes){
  const c=readCapacityComparison(comparisons,p.left,p.right);
  const status=c.status==='invalid-evidence'?'invalid-evidence':c.status==='not-comparable'?'not-comparable':
   c.relation===p.expected?'aligned-profile':c.relation==='left-evidence-dominates'||c.relation==='right-evidence-dominates'?'opposed-profile':
   c.relation==='mixed-evidence'?'mixed-profile':c.relation==='same-evidence-profile'?'equal-profile':'unresolved';
  rows.push({...p,observedRelation:c.relation,status,cautions:c.cautions,effectAgreement:null});
 }
 return {id:fixture.id,rows,integrityPassed:capacity.status!=='invalid-evidence'&&comparisons.status!=='invalid-evidence'&&rows.every(r=>r.status!=='invalid-evidence'),effectAgreement:null};
}
export function summarizeRoleContrasts(data,rows){
 const expected=data.cases.flatMap(c=>c.probes.map(p=>JSON.stringify([c.id,p.id]))),actual=rows.flatMap(c=>c.rows.map(p=>JSON.stringify([c.id,p.id])));
 const errors=[];
 if(new Set(expected).size!==expected.length||expected.length!==actual.length||new Set(actual).size!==actual.length||expected.some(k=>!actual.includes(k))||
  data.cases.length!==rows.length||new Set(rows.map(r=>r.id)).size!==rows.length||rows.some(r=>!r.integrityPassed))errors.push('coverage-or-integrity');
 const counts={};
 for(const c of rows)for(const p of c.rows){const k=p.basis+':'+p.status;counts[k]=(counts[k]??0)+1;}
 return {expectedProbes:expected.length,executedProbes:actual.length,counts,errors,independentGold:0,effectAgreement:null};
}
