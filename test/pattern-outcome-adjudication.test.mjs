import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {adjudicateChart,validateAdjudicationFixture,summarizeAdjudication,summarizeIntegration} from '../scripts/lib/pattern-outcome-adjudication.mjs';
const read=n=>JSON.parse(readFileSync(new URL('./fixtures/'+n,import.meta.url),'utf8'));
const data=read('pattern-outcome-adjudication-v1.json'),dev=read('pattern-outcome-reference-v1.json');
const label={formation:'undetermined',breakage:'undetermined',rescue:'undetermined',assistant:['visible:year'],purity:'undetermined',clarity:'undetermined'};
const reviewer=(id,l=label)=>({reviewerId:id,independentOfEngineOutputs:true,sourceLocator:'chapter/example',rationale:'source-based justification',label:l});
const row=reviews=>({eligible:true,pillars:['갑자','병인','신유','무자'],adjudication:{reviews}});
test('frozen queue and text clauses exclude development charts and do not fabricate full chart labels',()=>{
 assert.deepEqual(validateAdjudicationFixture(data,dev),[]);
 const s=summarizeAdjudication(data);assert.equal(s.sourceClauses,7);assert.equal(s.independentHoldoutCharts,0);assert.equal(s.verifiedIndependentGoldCharts,0);assert.equal(s.decisionGate.ready,false);
});
test('one reviewer or duplicated reviewer cannot yield agreed labels',()=>{
 assert.equal(adjudicateChart(row([reviewer('a')])).status,'pending');
 assert.equal(adjudicateChart(row([reviewer('a'),reviewer('a')])).status,'invalid-review');
});
test('conflicting and independent but agreeing labels remain separate',()=>{
 assert.equal(adjudicateChart(row([reviewer('a'),reviewer('b',{...label,rescue:'yes'})])).status,'disagreement');
 assert.equal(adjudicateChart(row([reviewer('a'),reviewer('b')])).status,'agreement-pending-external-independence-check');
});
test('missing rationale, engine-aware reviewer or stem-only assistant fail validation',()=>{
 assert.equal(adjudicateChart(row([reviewer('a'),{...reviewer('b'),rationale:''}])).status,'invalid-review');
 assert.equal(adjudicateChart(row([reviewer('a'),{...reviewer('b'),independentOfEngineOutputs:false}])).status,'invalid-review');
 assert.equal(adjudicateChart(row([reviewer('a',{...label,assistant:['갑']}),reviewer('b',{...label,assistant:['갑']})])).status,'invalid-review');
});
test('assistant hidden occurrence must actually exist in the specified branch',()=>{
 const labels=id=>({...label,assistant:[id]});
 const check=id=>adjudicateChart(row([reviewer('a',labels(id)),reviewer('b',labels(id))])).status;
 assert.equal(check('hidden:year:계'),'agreement-pending-external-independence-check');
 assert.equal(check('hidden:year:병'),'invalid-review');
 assert.equal(check('visible:year:'),'invalid-review');
 assert.equal(check('visible:day'),'invalid-review');
});
test('runtime failures retain the fixed historical denominator and fail the integration gate',()=>{
 const s=summarizeIntegration([{id:'h',kind:'historical',error:{message:'boom'}},{id:'c',kind:'control',probes:[{status:'matched'}]}],{historicalCases:1,historicalProbes:2,controlCases:1,controlProbes:1});
 assert.equal(s.historical.total,2);assert.equal(s.historical.recall,0);assert.equal(s.errors.length,1);assert.equal(s.gatePassed,false);
});
test('historical misses remain diagnostic, but control mismatch or authority leakage fails',()=>{
 const h={id:'h',kind:'historical',probes:[{expected:'present',status:'mismatch'}]},c={id:'c',kind:'control',probes:[{status:'matched'}]},n={historicalCases:1,historicalProbes:1,controlCases:1,controlProbes:1};
 assert.equal(summarizeIntegration([h,c],n).gatePassed,true);
 assert.equal(summarizeIntegration([h,{...c,probes:[{status:'mismatch'}]}],n).gatePassed,false);
 assert.equal(summarizeIntegration([{...h,violations:[{kind:'premature-authority'}]},c],n).gatePassed,false);
});
