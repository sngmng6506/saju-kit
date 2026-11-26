import {normalizeExposurePillars} from './pattern-outcome-exposure.mjs';
export const strengthAuditFixtureNames=Object.freeze(['ordinary-xu-v1','ordinary-wei-v1','strength-ditiansui-v1','ordinary-ran-yuan-v1','ordinary-xu-holdout-v1','ordinary-lin-scan-v1']);
const key=(fixture,id)=>JSON.stringify([fixture,id]);
const direction=x=>['strong','weak'].includes(x);
export function verifyStrengthAuditInventory(fixtures,audit){
 if(!Array.isArray(fixtures)||fixtures.length!==strengthAuditFixtureNames.length||new Set(fixtures.map(f=>f.name)).size!==fixtures.length||strengthAuditFixtureNames.some(n=>!fixtures.some(f=>f.name===n))||audit?.version!==1||!Array.isArray(audit.entries))throw Error('audit-inventory');
 const records=new Map(),charts=new Set();
 for(const f of fixtures){
  if(!Array.isArray(f.cases))throw Error('fixture-cases');
  for(const c of f.cases){
   if(!direction(c.reference))continue;
   const p=normalizeExposurePillars(c.pillars),id=key(f.name,c.id),chart=JSON.stringify(p?.pillars);
   if(!p?.complete||!p.sexagenary||typeof c.id!=='string'||!c.id||records.has(id)||charts.has(chart))throw Error('fixture-directional-identity:'+id);
   records.set(id,{chart,reference:c.reference,formationDependent:c.formationDependent===true});charts.add(chart);
  }
 }
 const seen=new Set();
 for(const a of audit.entries){
  const id=key(a.fixture,a.id),r=records.get(id),p=normalizeExposurePillars(a.pillars);
  if(!r||seen.has(id)||!p?.complete||!p.sexagenary||JSON.stringify(p.pillars)!==r.chart||a.reference!==r.reference||r.formationDependent&&a.formation==='ordinary')throw Error('stale-audit:'+id);
  seen.add(id);
 }
 if(seen.size!==records.size)throw Error('missing-audit-record');
 return {directional:records.size,fixtures:fixtures.length};
}
