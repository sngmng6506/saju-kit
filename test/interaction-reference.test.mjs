import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { analyzeInteractionSensitivity } from '../src/index.js';
import { chartFromReference } from '../scripts/strength-reference.mjs';

test('interaction diagnostic snapshot, excluding extreme chapter from ordinary subset',()=>{
 const fixture=JSON.parse(readFileSync(new URL('./fixtures/strength-ditiansui-v1.json',import.meta.url),'utf8'));
 function aggregate(cases){
  const result={cases:cases.length,formationCount:0,simulated:0,skipped:0,quantitativeChanged:0,
    clashScenarios:0,structuralChanged:0,candidateChanged:0,formationSensitiveCases:0,clashSensitiveCases:0};
  for(const c of cases){
   const r=analyzeInteractionSensitivity({saju:chartFromReference(c.pillars),policy:'interaction-sensitivity-v1',birthBasis:'verified-chart'});
   const simulated=r.formationScenarios.filter(s=>s.status==='simulated');
   const changed=simulated.filter(s=>s.quantitativeCategoryChanged).length;
   const structural=r.clashScenarios.filter(s=>s.structuralDirectionChanged).length;
   result.formationCount+=r.context.formations.length;
   result.simulated+=simulated.length;
   result.skipped+=r.formationScenarios.length-simulated.length;
   result.quantitativeChanged+=changed;
   result.clashScenarios+=r.clashScenarios.length;
   result.structuralChanged+=structural;
   result.candidateChanged+=r.clashScenarios.filter(s=>s.candidateChanged).length;
   result.formationSensitiveCases+=Number(changed>0);
   result.clashSensitiveCases+=Number(structural>0);
  }
  return result;
 }
 assert.deepEqual(aggregate(fixture.cases),{cases:26,formationCount:77,simulated:40,skipped:37,quantitativeChanged:14,clashScenarios:12,structuralChanged:3,candidateChanged:0,formationSensitiveCases:9,clashSensitiveCases:2});
 assert.deepEqual(aggregate(fixture.cases.filter(c=>c.source!=='extreme')),{cases:6,formationCount:19,simulated:8,skipped:11,quantitativeChanged:5,clashScenarios:6,structuralChanged:2,candidateChanged:0,formationSensitiveCases:4,clashSensitiveCases:1});
});
