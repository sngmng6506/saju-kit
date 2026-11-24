import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {getSaju,analyzeMonthCommandSensitivity,COMMAND_SENSITIVITY_VERSION} from '../src/index.js';
import {compareCommandElements} from '../src/features/strength-command-sensitivity-v1/index.js';
import {analyzeQuantitativeStrength} from '../src/features/strength-quantitative-v3/index.js';
import {analyzeMultiaxisStrengthV4} from '../src/features/strength-multiaxis-v4/index.js';
import {chartFromReference} from '../scripts/strength-reference.mjs';
import {evaluateCommandSensitivity} from '../scripts/evaluate-strength-command-sensitivity.mjs';

const birth={y:2026,m:2,d:9,hh:12,mm:0};
const input=()=>({saju:getSaju(birth),birth,policy:COMMAND_SENSITIVITY_VERSION,birthBasis:'verified-chart'});
test('recorded 38 synthetic dates and two text controls replay',async()=>{
 const expected=JSON.parse(await readFile(new URL('../docs/strength-command-sensitivity-results.json',import.meta.url),'utf8'));
 const actual=await evaluateCommandSensitivity();
 for(const k of ['counts','texts','dates'])assert.deepEqual(actual[k],expected[k]);
});
test('source disagreement remains distinct; no caller-selected element authority',()=>{
 const i=input(),r=analyzeMonthCommandSensitivity({...i,element:'metal'});
 assert.deepEqual(r.comparison.variants.map(v=>v.element),['fire','earth']);
 assert.equal(r.direction,null);assert.equal(r.commandResolved,false);assert.equal(r.effectsConfirmed,false);
 assert.deepEqual(compareCommandElements(i.saju,['fire','fire']),compareCommandElements(i.saju,['fire']));
 assert.throws(()=>compareCommandElements(i.saju,['invalid']),{code:'strength-season-basis'});
 const q={saju:i.saju,birthBasis:'verified-chart',policy:'strength-quantitative-v3'};
 assert.deepEqual(analyzeQuantitativeStrength(q,{seasonBasis:'metal'}),analyzeQuantitativeStrength(q));
});
test('missing birth, incomplete or provisional chart cannot produce timed sensitivity',()=>{
 const i=input();
 assert.equal(analyzeMonthCommandSensitivity({...i,birth:null}).reason,'missing-birth-instant');
 assert.equal(analyzeMonthCommandSensitivity({...i,birthBasis:'provisional-chart'}).reason,'provisional-chart');
 assert.equal(analyzeMonthCommandSensitivity({...i,saju:{pillars:{...i.saju.pillars,hour:null}}}).reason,'missing-hour');
 assert.throws(()=>analyzeMonthCommandSensitivity({...i,birth:{...birth,d:10}}),{code:'month-command-chart-mismatch'});
});
test('all historical chart-only baselines preserved; no invented command',async()=>{
 const corpus=JSON.parse(await readFile(new URL('../docs/strength-separated-decision-results.json',import.meta.url),'utf8')).rows;
 assert.equal(corpus.length,100);
 for(const c of corpus){
  const saju=chartFromReference(c.pillars);
  assert.equal(analyzeMonthCommandSensitivity({saju,birthBasis:'verified-chart',policy:COMMAND_SENSITIVITY_VERSION}).reason,'missing-birth-instant',c.id);
  assert.equal(analyzeMultiaxisStrengthV4({saju,birthBasis:'verified-chart',policy:'strength-multiaxis-v4'}).direction,c.fixed,c.id);
 }
});
