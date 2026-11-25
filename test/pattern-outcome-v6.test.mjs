import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {analyzePatternOutcomeV5,analyzePatternOutcomeV6,PATTERN_OUTCOME_V5_VERSION,PATTERN_OUTCOME_V6_VERSION} from '../src/index.js';
import {mapOutcomeReferenceV6} from '../scripts/lib/pattern-outcome-v6-mapping.mjs';
import {evaluateOutcomeCase} from '../scripts/lib/pattern-outcome-reference.mjs';
const chart=ps=>({pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,ps[i]?{stem:ps[i][0],branch:ps[i][1],text:ps[i]}:null]))});
const run=(ps,birthBasis='verified-chart')=>analyzePatternOutcomeV6({saju:chart(ps),birthBasis,policy:PATTERN_OUTCOME_V6_VERSION});
const exception=r=>r.reviews.flatMap(q=>q.rules).filter(q=>q.id==='hurting-winter-metal-water-officer-exception').flatMap(q=>q.witnesses);
test('winter metal-water source exception keeps structural conflict and all efficacy unresolved',()=>{
 const r=run(['무신','갑자','경오','정축']);
 const w=exception(r).find(w=>w.roles.target==='hidden:month:계'&&w.roles.officer==='visible:hour');
 assert.ok(w);assert.equal(w.contextScreen,'observed-source-subclauses');assert.equal(w.conditions.noVisibleHurting,true);
 assert.equal(w.conditions.visibleWealth,true);assert.equal(w.conditions.visibleResource,true);
 assert.ok(w.conditions.officerExactUnclashedSubstantialRoots.includes('day'));
 assert.equal(w.exceptionApplied,null);assert.equal(r.winterClimate.policy,'climate-useful-element-v5');
 assert.equal(r.winterClimate.usefulElement,null);assert.equal(r.formed,null);
 assert.ok(r.positionContext.candidateReviews.some(q=>q.witnesses.some(x=>x.witnessId===w.id&&x.edges[0].order===null)));
});
test('visible hurting and missing auxiliary role oppose the source screen; no automatic exception',()=>{
 const r=run(['계유','갑자','경오','정축']);
 const w=exception(r)[0];assert.ok(w);assert.equal(w.conditions.noVisibleHurting,false);
 assert.equal(w.conditions.visibleResource,false);assert.equal(w.contextScreen,'source-condition-opposed');assert.equal(w.exceptionApplied,null);
});
test('nonwinter metal hurting candidate does not activate the winter exception or climate adapter',()=>{
 const r=run(['무신','갑진','경오','정축']);
 assert.equal(r.winterClimate,null);assert.equal(exception(r).length,0);
});
test('wealth-resource separation observes intervening day without claiming noninterference',()=>{
 const r=run(['정유','기유','무자','임자']);
 const p=r.positionContext.wealthResourceSeparation.find(x=>x.wealth==='visible:hour'&&x.resource==='visible:year');
 assert.ok(p);assert.equal(p.order,'resource-before-wealth');assert.equal(p.span,3);assert.equal(p.separated,true);
 assert.ok(p.intervening.some(x=>x.id==='visible:day'&&x.dayReference));assert.equal(p.noninterferenceConfirmed,null);
 const adjacent=run(['임술','정미','무신','을묘']).positionContext.wealthResourceSeparation.find(x=>x.wealth==='visible:year'&&x.resource==='visible:month');
 assert.ok(adjacent);assert.equal(adjacent.separated,false);assert.equal(adjacent.noninterferenceConfirmed,null);
});
test('source order is scoped and reversed placement stays distinct',()=>{
 const a=run(['정묘','신유','갑자','무진']),b=run(['무진','신유','갑자','정묘']);
 assert.ok(a.positionContext.sourceOrder.flatMap(q=>q.pairs).some(p=>p.orientation==='source-preferred-order'));
 assert.ok(b.positionContext.sourceOrder.flatMap(q=>q.pairs).some(p=>p.orientation==='source-reversed-order'));
 assert.equal(a.positionContext.orderEffectConfirmed,null);
});
test('partial chart and provisional input preserve uncertainty',()=>{
 const r=run(['무신','갑자','경오',null]);assert.equal(r.positionContext.completeHour,false);
 assert.equal(r.winterClimate.status,'partial');assert.equal(exception(r).length,0);
 assert.ok(r.reviews.filter(q=>q.family==='hurting-officer').flatMap(q=>q.rules).filter(q=>q.kind==='exception').every(q=>q.observed===null));
 const p=run(['무신','갑자','경오','정축'],'provisional-chart');assert.equal(p.positionContext,null);assert.equal(p.winterClimate,null);
});
test('V5 reviews remain prefix-identical; frozen final reference probe maps and matches',()=>{
 const saju=chart(['무신','갑자','경오','정축']),birthBasis='verified-chart',before=JSON.stringify(saju);
 const a=analyzePatternOutcomeV5({saju,birthBasis,policy:PATTERN_OUTCOME_V5_VERSION}),b=analyzePatternOutcomeV6({saju,birthBasis,policy:PATTERN_OUTCOME_V6_VERSION});
 for(const q of a.reviews){const n=b.reviews.find(x=>x.candidateId===q.candidateId);assert.deepEqual(n.rules.slice(0,q.rules.length),q.rules);assert.equal(n.status,q.status);}
 assert.deepEqual(a.regulationStrength,b.regulationStrength);assert.equal(JSON.stringify(saju),before);assert.equal(b.selectionAuthority,false);
 const data=JSON.parse(readFileSync(new URL('./fixtures/pattern-outcome-reference-v1.json',import.meta.url),'utf8'));
 const rows=data.cases.map(mapOutcomeReferenceV6);assert.equal(rows.flatMap(r=>r.probes).filter(p=>p.ruleId!==null).length,30);
 const row=rows.find(r=>r.probes.some(p=>p.gap==='metal-water-exception'));
 assert.equal(evaluateOutcomeCase(row,b).probes.find(p=>p.gap==='metal-water-exception').status,'matched');
});
