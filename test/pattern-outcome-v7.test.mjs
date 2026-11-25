import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzePatternOutcomeV6,analyzePatternOutcomeV7,PATTERN_OUTCOME_V6_VERSION,PATTERN_OUTCOME_V7_VERSION} from '../src/index.js';
import {observeCompoundTopology} from '../src/features/pattern/outcome-compound-topology.js';
import {observeCompoundMotifs} from '../src/features/pattern/outcome-compound-motifs.js';
const w=(id,roles,edges=[],extra={})=>({id,roles,edges,...extra,effective:null});
const e=(from,to,kind='control')=>({from,to,kind,effective:null});
const rule=(id,kind,witnesses,extra={})=>({id,kind,witnesses,...extra});
const q=(family,rules)=>({candidateId:'candidate',family,status:'diagnostic',rules});
const support=rule('officer-wealth','support',[w('s',{helper:'wealth',target:'officer'},[e('wealth','officer','generate')])]);
const damage=rule('officer-hurting','damage',[w('d1',{obstacle:'output1',target:'officer'},[e('output1','officer')]),w('d2',{obstacle:'output2',target:'officer'},[e('output2','officer')])]);
const rescue=rule('officer-resource-rescue','rescue',[w('r1',{obstacle:'output1',target:'officer',helper:'resource'},[e('resource','output1')],{threatWitnessId:'d1'})],{threatRuleId:'officer-hurting'});
test('one rescue does not cover a second occurrence of the same threat rule',()=>{
 const a=observeCompoundTopology(q('officer',[support,damage,rescue]),true);
 assert.equal(a.counts.damage,2);assert.equal(a.counts.threatsWithRoute,1);assert.equal(a.allObservedThreatsHaveRoute,false);
 assert.equal(a.threatCoverage[0].resolved,null);assert.equal(a.threatCoverage[1].coverage,'no-covered-route');
 assert.equal(a.formed,null);assert.equal(a.rescued,null);
 const b=observeCompoundTopology(q('officer',[support,damage,rescue]),false);
 assert.equal(b.allObservedThreatsHaveRoute,null);assert.equal(b.threatCoverage[1].coverage,'route-unknown');
});
test('a mismatched rescue reference never enters the coverage ledger',()=>{
 const wrong=rule('officer-resource-rescue','rescue',[w('r1',{obstacle:'output2',target:'officer',helper:'resource'},[],{threatWitnessId:'d1'})],{threatRuleId:'officer-hurting'});
 const a=observeCompoundTopology(q('officer',[damage,wrong]),true);
 assert.equal(a.status,'invalid-evidence');assert.equal(a.violations[0].kind,'invalid-rescue-reference');assert.equal(a.counts.validRescue,0);
 assert.equal(a.allObservedThreatsHaveRoute,null);
});
test('rescue preserves exact anchor alternatives, relation and distinct helper',()=>{
 const binding=(id)=>({anchorId:id,targetId:'officer',basis:'directed-generation',independentSlots:true,edge:e(id,'officer','generate'),effective:null});
 const bindings=[binding('wealth1'),binding('wealth2')];
 const d=rule('d','damage',[w('d1',{target:'officer',obstacle:'output'},[e('output','officer')],{anchorBindings:bindings})]);
 const run=(bs,helper='resource')=>observeCompoundTopology(q('wealth',[d,rule('r','rescue',[w('r1',{target:'officer',obstacle:'output',helper},[e(helper,'output')],{anchorBindings:bs,threatWitnessId:'d1'})],{threatRuleId:'d'})]),true);
 assert.equal(run([...bindings].reverse()).counts.validRescue,1);
 for(const bad of [[],[bindings[0]], [bindings[0],binding('other')], [bindings[0],{...bindings[1],edge:e('officer','wealth2','generate')}]]){
  const a=run(bad);assert.equal(a.status,'invalid-evidence');assert.equal(a.counts.validRescue,0);
 }
 assert.equal(run(bindings,'output').counts.validRescue,0);
 // Helper may be an anchor alternative; it must not alias a mandatory threat role.
 assert.equal(run(bindings,'wealth1').counts.validRescue,1);
});
test('duplicate witness references are flagged rather than promoted',()=>{
 const a=observeCompoundTopology(q('officer',[damage,damage,rescue]),true);
 assert.equal(a.status,'invalid-evidence');assert.ok(a.violations.some(v=>v.kind==='duplicate-witness'));
});
test('same day reference is not compound causation and same-element alias is not identity',()=>{
 const s=rule('s','support',[w('s',{target:'visible:day',helper:'officer1'})]);
 const d=rule('d','damage',[w('d',{target:'visible:day',obstacle:'officer2'})]);
 assert.deepEqual(observeCompoundTopology(q('peer',[s,d]),true).supportDamage,[]);
 assert.equal(observeCompoundTopology(q('peer',[s,d]),true).supportWithAdversityObserved,false);
});
test('a rescue can touch another support role; shared helper alternatives are not independent',()=>{
 const s=rule('s','support',[w('s',{target:'officer',helper:'output1'})]);
 const rr=rule('officer-resource-rescue','rescue',[...rescue.witnesses,w('r2',{obstacle:'output2',target:'officer',helper:'resource'},[e('resource','output2')],{threatWitnessId:'d2'})],{threatRuleId:'officer-hurting'});
 const a=observeCompoundTopology(q('officer',[s,damage,rr]),true);
 assert.equal(a.rescueInteractions.length,1);assert.equal(a.rescueInteractions[0].rescue.witnessId,'r1');
 assert.equal(a.rescueAlternatives[0].sharedParticipantAlternatives[0].witnessId,'r2');
 assert.equal(a.allObservedThreatsHaveRoute,true);assert.ok(a.threatCoverage.every(t=>t.resolved===null));
});
test('conditional regulation and damage share exact intervention without creating ordinary support',()=>{
 const d=rule('resource-wealth','damage',[w('d',{obstacle:'wealth',target:'resource'},[e('wealth','resource')])]);
 const s=rule('resource-wealth-regulation','support',[w('r',{helper:'wealth',target:'resource'},[e('wealth','resource')],{alternativeDamageRuleId:'resource-wealth'})],{impact:'conditional-regulation-not-confirmed-support'});
 const a=observeCompoundTopology(q('resource',[s,d]),true);
 assert.equal(a.counts.support,0);assert.equal(a.counts.regulation,1);assert.equal(a.competingRegulation.length,1);assert.equal(a.competingRegulation[0].preferredInterpretation,null);
});
test('source motif binds exact target and distinguishes missing rules from negative observation',()=>{
 const a=observeCompoundMotifs(q('officer',[support,damage]),true)[0];
 assert.equal(a.observed,true);assert.equal(a.witnesses.length,2);assert.equal(a.outcomeConfirmed,null);
 const d=rule('officer-hurting','damage',[w('d',{target:'other-officer',obstacle:'output1'})]);
 assert.equal(observeCompoundMotifs(q('officer',[support,d]),true)[0].observed,false);
 assert.equal(observeCompoundMotifs(q('officer',[support,d]),false)[0].observed,null);
 assert.equal(observeCompoundMotifs(q('officer',[support]),true)[0].observed,null);
});
test('killing food obstruction motif requires same food and monthly killing',()=>{
 const s=rule('killing-food','support',[w('s',{helper:'food1',target:'killing'})]);
 const d=rule('killing-resource-blocks-food','damage',[w('d',{food:'food2',target:'killing',obstacle:'resource'}),w('d2',{food:'food1',target:'killing',obstacle:'resource'})]);
 const a=observeCompoundMotifs(q('killing',[s,d]),true)[0];assert.equal(a.witnesses.length,1);assert.equal(a.witnesses[0].right.witnessId,'d2');
});
test('V7 retains all V6 fields except version/scope and adds candidate-scoped compound evidence',()=>{
 const ps=['정묘','신유','갑자','계유'],saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,{stem:ps[i][0],branch:ps[i][1],text:ps[i]}]))};
 const args={saju,birthBasis:'verified-chart'},before=JSON.stringify(saju);
 const a=analyzePatternOutcomeV6({...args,policy:PATTERN_OUTCOME_V6_VERSION});
 const b=analyzePatternOutcomeV7({...args,policy:PATTERN_OUTCOME_V7_VERSION});
 const {compoundReview,version,scope,...rest}=b;
 assert.deepEqual(rest,Object.fromEntries(Object.entries(a).filter(([k])=>!['version','scope'].includes(k))));
 assert.equal(compoundReview.length,b.reviews.length);assert.ok(compoundReview.every(q=>q.violations.length===0&&q.selectionAuthority===false));
 assert.ok(compoundReview.some(q=>q.damageWithRescueObserved===true));assert.equal(JSON.stringify(saju),before);
 assert.equal(analyzePatternOutcomeV7({...args,birthBasis:'provisional-chart',policy:PATTERN_OUTCOME_V7_VERSION}).compoundReview,null);
 assert.throws(()=>analyzePatternOutcomeV7({...args,policy:PATTERN_OUTCOME_V6_VERSION}),{code:'pattern-policy'});
});

test('inherited damage edges do not become new rescue interference',()=>{
 const d=rule('d','damage',[w('d',{obstacle:'x',target:'k'},[e('x','k')])]);
 const s=rule('s','support',[w('s',{helper:'wealth',target:'k'},[e('wealth','k','generate')])]);
 const r=rule('r','rescue',[w('r',{obstacle:'x',target:'k',helper:'h'},[e('x','k'),e('h','x')],{threatWitnessId:'d'})],{threatRuleId:'d'});
 const result=observeCompoundTopology(q('officer',[s,d,r]),true);
 assert.equal(result.supportDamage.length,1);
 assert.deepEqual(result.rescueInteractions,[]);
 assert.equal(result.counts.validRescue,1);
});
