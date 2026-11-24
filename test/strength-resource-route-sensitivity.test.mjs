import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {evaluateResourceRouteSensitivity,compareResourceGuards,resourceRouteScenario} from '../scripts/evaluate-strength-resource-route-sensitivity.mjs';
test('officer diversion cannot duplicate units as resource or erase wealth',()=>{
 const s={positionProfile:'p',roleProfile:'r',rootProfile:'x',seasonProfile:'s',seasonBasis:'b',mass:{peer:5,resource:10,output:2,wealth:20,officer:30}};
 const r={profile:{position:'p',role:'r',root:'x',season:'s',basis:'b'},resources:[{id:'day:branch:fire',officerAccepted:4,wealthRequested:12,own:10,conditionalDirect:0}],allocations:[{kind:'officer-resource',units:5}],conditionalResource:0,outputResidualHypothesis:2};
 const result=resourceRouteScenario(s,r,[{id:'day:branch:fire'}]);
 assert.equal(result.margin,-15);assert.equal(result.routeMargin,-25);assert.equal(result.reliefMargin,-21);
 assert.equal(result.seatedConditional,0);
 assert.throws(()=>resourceRouteScenario(s,{...r,resources:[{...r.resources[0],officerAccepted:31}]},[]),/budget/);
});
test('100 resource route diagnostics preserve H01 and W09 counterexamples',async()=>{
 const expected=JSON.parse(await readFile(new URL('../docs/strength-resource-route-sensitivity-results.json',import.meta.url),'utf8'));
 const rows=await evaluateResourceRouteSensitivity();
 assert.deepEqual(rows,expected.rows);
 const h=rows.find(r=>r.id==='H01'),w=rows.find(r=>r.id==='W09');
 assert.equal(h.seatedChain,true);assert.equal(w.seatedChain,false);
 assert.equal(h.candidate,true);assert.equal(w.candidate,true);
 assert.deepEqual(h.stats.standard.ranges.seatedConditional,[0,0]);
 assert.ok(rows.filter(r=>r.candidate).every(r=>r.stats.standard.allPressure[2]&&r.stats.neutral.allPressure[2]));
 const metrics=compareResourceGuards(rows);
 assert.deepEqual(metrics.all.candidate,{n:100,agree:57,disagree:3,abstain:40});
 assert.deepEqual(metrics.all['seated-chain'],{n:100,agree:57,disagree:2,abstain:41});
 assert.deepEqual(metrics.all['any-chain'],{n:100,agree:56,disagree:2,abstain:42});
});
