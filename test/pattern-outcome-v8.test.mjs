import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzePatternOutcomeV7,analyzePatternOutcomeV8,PATTERN_OUTCOME_V7_VERSION,PATTERN_OUTCOME_V8_VERSION} from '../src/index.js';
import {observeAssistantNecessity} from '../src/features/pattern/outcome-assistant.js';
import {observeCompoundTopology} from '../src/features/pattern/outcome-compound-topology.js';
const w=(id,roles,edges=[],extra={})=>({id,roles,edges,...extra,effective:null});
const e=(from,to,kind='control')=>({from,to,kind,effective:null});
const r=(id,kind,witnesses,extra={})=>({id,kind,witnesses,...extra});
const q=(rules,anchorIds=['officer'])=>({candidateId:'c',family:'officer',status:'diagnostic',anchorIds,rules});
const run=(review,complete=true)=>observeAssistantNecessity(review,observeCompoundTopology(review,complete),complete);
const by=(a,id)=>a.candidates.find(c=>c.occurrenceId===id);
const damage=r('injury','damage',[w('d',{target:'officer',obstacle:'output'},[e('output','officer')])]);
const rescue=(helpers)=>r('repair','rescue',helpers.map(h=>w('r:'+h,{target:'officer',obstacle:'output',helper:h},[e(h,'output')],{threatWitnessId:'d'})),{threatRuleId:'injury'});
test('single helper loss removes only the exact observed rescue route, never confirms assistant',()=>{
 const a=run(q([damage,rescue(['resource'])])),c=by(a,'resource');
 assert.equal(c.classification,'observed-route-dependent');assert.equal(c.mask.threats[0].state,'all-observed-alternatives-lost');
 assert.equal(c.assistantConfirmed,null);assert.equal(a.assistantGod,null);
});
test('two alternative helpers have joint but not individual observed dependency',()=>{
 const a=run(q([damage,rescue(['resource1','resource2'])]));
 assert.equal(by(a,'resource1').mask.threats[0].state,'some-alternatives-lost');
 assert.equal(by(a,'resource1').observedRouteDependencyKeys.length,0);
 assert.equal(a.pairDependencies.length,1);assert.equal(a.pairDependencies[0].jointOnlyDependencyKeys.length,1);
});
test('masking a participant in the threat is not loss of rescue for a surviving threat',()=>{
 const s=r('support','support',[w('s',{target:'officer',helper:'output'})]);
 const a=run(q([s,damage,rescue(['resource'])])),c=by(a,'output');
 assert.equal(c.mask.threats[0].state,'threat-masked');assert.equal(c.mask.damageMasked.length,1);
 assert.ok(!c.observedRouteDependencyKeys.some(k=>k.startsWith('threat:')));
});
test('support alternatives are scoped to identical rule and target, not arbitrary favorable routes',()=>{
 const s=r('support','support',[w('a',{target:'officer',helper:'wealth1'}),w('b',{target:'officer',helper:'wealth2'}),w('c',{target:'officer2',helper:'wealth1'})]);
 const a=run(q([s])),c=by(a,'wealth1');
 assert.equal(c.mask.supportGroups.find(g=>g.target==='officer').state,'some-alternatives-lost');
 assert.equal(c.mask.supportGroups.find(g=>g.target==='officer2').state,'all-observed-alternatives-lost');
});
test('explicit anchor bindings are alternatives; helper alias is not a second independent actor',()=>{
 const s=r('support','support',[w('a',{target:'officer',helper:'resource'},[],{anchorBindings:[{anchorId:'anchor1'},{anchorId:'anchor2'}]}),
  w('b',{target:'officer',helper:'anchor1'})]);
 const a=run(q([s],['anchor1','anchor2'])),c=by(a,'anchor1');
 assert.equal(c.classification,'anchor-and-assistant-role-alias');assert.equal(c.mask.supportGroups[0].remaining[0].witnessId,'a');
});
test('regulation-only participants do not acquire ordinary support dependency',()=>{
 const s=r('reg','support',[w('a',{target:'officer',helper:'wealth'})],{impact:'conditional-regulation-not-confirmed-support'});
 const c=by(run(q([s])),'wealth');assert.equal(c.classification,'conditional-regulation-only');
 assert.equal(c.mask.regulationLost.length,1);assert.equal(c.observedRouteDependencyKeys.length,0);
});
test('assistant injury is retained with exact witness references and no effect verdict',()=>{
 const s=r('support','support',[w('s',{target:'officer',helper:'resource'})]);
 const d=r('injury','damage',[w('d',{target:'officer',obstacle:'output'},[e('output','resource')])]);
 const c=by(run(q([s,d])),'resource');
 assert.equal(c.potentialInjury.supportDamage.length,1);assert.equal(c.potentialInjury.confirmed,null);
});
test('partial, invalid and out-of-scope inputs cannot grant assistant authority',()=>{
 const a=run(q([damage,rescue(['resource'])]),false);assert.equal(a.status,'partial');assert.equal(a.necessityConfirmed,null);
 const bad=observeAssistantNecessity(q([damage]),{candidateId:'c',violations:[{}]},true);
 assert.equal(bad.status,'invalid-evidence');assert.equal(bad.candidates.length,0);
 const excluded=observeAssistantNecessity({...q([]),status:'out-of-scope'},null,true);
 assert.equal(excluded.status,'out-of-scope');assert.equal(excluded.assistantGod,null);
});
test('V8 preserves entire V7 evidence and adds separate assistant review',()=>{
 const ps=['정묘','신유','갑자','계유'],saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,{stem:ps[i][0],branch:ps[i][1],text:ps[i]}]))};
 const args={saju,birthBasis:'verified-chart'},before=JSON.stringify(saju);
 const a=analyzePatternOutcomeV7({...args,policy:PATTERN_OUTCOME_V7_VERSION}),b=analyzePatternOutcomeV8({...args,policy:PATTERN_OUTCOME_V8_VERSION});
 const {assistantReview,version,scope,...rest}=b;
 assert.deepEqual(rest,Object.fromEntries(Object.entries(a).filter(([k])=>!['version','scope'].includes(k))));
 assert.ok(assistantReview.some(q=>q.candidates.some(c=>c.occurrenceId==='visible:hour')));
 assert.ok(assistantReview.every(q=>q.assistantGod===null&&q.selectionAuthority===false));assert.equal(JSON.stringify(saju),before);
 assert.equal(analyzePatternOutcomeV8({...args,birthBasis:'provisional-chart',policy:PATTERN_OUTCOME_V8_VERSION}).assistantReview,null);
 assert.throws(()=>analyzePatternOutcomeV8({...args,policy:PATTERN_OUTCOME_V7_VERSION}),{code:'pattern-policy'});
});
