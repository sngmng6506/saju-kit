import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {analyzeBalanceRouteReview,BALANCE_ROUTE_REVIEW_VERSION,analyzeBalanceUsefulElement} from '../src/index.js';
import {chartFromReference} from '../scripts/strength-reference.mjs';
import {evaluateBalanceRouteReview} from '../scripts/evaluate-balance-route-review.mjs';
import {aggregateBalanceReviews,reserveBalanceScenario} from '../src/features/balance-route-review-v1/evidence.js';

test('100 chart summaries and four textual controls replay',async()=>{
 const expected=JSON.parse(await readFile(new URL('../docs/balance-route-review-results.json',import.meta.url),'utf8'));
 const actual=await evaluateBalanceRouteReview();
 for(const k of ['counts','texts','rows'])assert.deepEqual(actual[k],expected[k]);
 assert.equal(actual.texts[0].analysis.modes[0].reviews[0].candidates[0].robustCoverage.length,3);
 assert.deepEqual(actual.texts[0].analysis.modes[1].reviews[0].coverageFocus,['metal']);
 assert.deepEqual(actual.texts[0].analysis.robustFocus[0].elements,[]);
 assert.equal(actual.rows.filter(r=>r.priorDirection==='weak'&&r.robustFocus[1].elements.length).length,0);
});
test('shared reservation cannot double spend an intermediate',()=>{
 const network={nodes:[{id:'month:stem'},{id:'day:branch:metal'},{id:'hour:stem'},{id:'day:stem'}]};
 const scenario={contributions:[
  {slot:'monthStem',role:null,units:100},{slot:'dayBranch',role:'principal',element:'metal',units:40},{slot:'hourStem',role:null,units:50}
 ]};
 const paths=[
  {id:'a',origin:'month:stem',nodes:['month:stem','day:branch:metal','day:stem']},
  {id:'b',origin:'day:branch:metal',nodes:['day:branch:metal','day:stem']},
  {id:'c',origin:'hour:stem',nodes:['hour:stem','day:branch:metal']}
 ];
 const r=reserveBalanceScenario(network,scenario,paths);
 assert.deepEqual(r,reserveBalanceScenario(network,scenario,[...paths].reverse()));
 assert.ok(r.ledger.every(x=>x.reserved<=x.capacity));
 assert.equal(r.ledger.find(x=>x.id==='day:branch:metal').requested,190);
});
test('strict coverage superset requires direct access from both candidates',()=>{
 const branch={assumedDirection:'weak',candidates:[{category:'resource',element:'metal',presence:'hidden-only'},{category:'peer',element:'water',presence:'hidden-only'}]};
 const rows=[{category:'resource',direct:10,coverage:{wealth:1,officer:1,output:1},competing:{}},{category:'peer',direct:5,coverage:{wealth:1},competing:{}}];
 assert.deepEqual(aggregateBalanceReviews(branch,[rows]).coverageFocus,['metal']);
 assert.deepEqual(aggregateBalanceReviews(branch,[[rows[0],{...rows[1],direct:0}]]).coverageFocus,[]);
 assert.deepEqual(aggregateBalanceReviews(branch,[[{...rows[0],coverage:{wealth:1,officer:0,output:0}},rows[1]]]).coverageFocus,[]);
});
test('public wrapper preserves prior decisions and keeps hypotheses conditional',()=>{
 const saju=chartFromReference(['壬申','壬子','戊午','乙卯']);
 const input={saju,birthBasis:'verified-chart',policy:BALANCE_ROUTE_REVIEW_VERSION};
 const before=JSON.stringify(input),r=analyzeBalanceRouteReview(input);
 assert.deepEqual(r.balance,analyzeBalanceUsefulElement({...input,policy:'balance-useful-element-v1'}));
 assert.equal(r.balance.strength.direction,null);
 assert.equal(r.analysis.robustFocus.length,2);
 assert.equal(r.usefulElement,null);assert.equal(r.ranking,null);assert.equal(r.confirmed,false);
 assert.equal(JSON.stringify(input),before);
 for(const x of [{...input,birthBasis:'provisional-chart'},{...input,saju:{pillars:{...saju.pillars,hour:null}}}]){
  const result=analyzeBalanceRouteReview(x);assert.equal(result.status,'unavailable');assert.equal(result.analysis,null);
 }
 assert.throws(()=>analyzeBalanceRouteReview({...input,policy:'unknown'}),{code:'balance-policy'});
});
