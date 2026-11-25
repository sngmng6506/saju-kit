import test from 'node:test';
import assert from 'node:assert/strict';
import {createEffectContext,observeWitnessEfficacy} from '../src/features/pattern/outcome-efficacy.js';
import {analyzePatternOutcomeIntegrated,analyzePatternOutcomeEfficacy,PATTERN_OUTCOME_INTEGRATED_VERSION,PATTERN_OUTCOME_EFFICACY_VERSION} from '../src/index.js';
const actor=(id,stem,layer='visible')=>({id,stem,layer,position:id.split(':')[1],tenGod:'test'});
const profile={axes:{anySubstantial:true},rootPositions:['year'],rootClashExposed:[],localGenerationNodes:[],localControlNodes:[],contacts:[]};
const relative={relation:'right-evidence-dominates',sharedRootPositions:[],sharedGenerationNodes:[],sharedPeerNodes:[],forceComparison:null};
const e=(from,to,kind='control')=>({from,to,kind,edgeId:from+'>'+to});
const raw=(from,to,kind,extra={})=>({id:from+'>'+to,from,to,kind,blockers:[],screen:'root-and-locality-screen-met',relative,...extra});
const context=(actors,edges,completeHour=true,groups=[],groupEdges=[])=>createEffectContext({completeHour,stemForce:{occurrences:actors},relativeForce:{profiles:Object.fromEntries(actors.map(o=>[o.id,profile])),edges}},{groups,edges:groupEdges});
const a=actor('visible:year','갑'),b=actor('visible:month','무'),c=actor('visible:hour','기');
test('target dominance is a control concern, not automatic failure or generation concern',()=>{
 const ctx=context([a,b],[raw(a.id,b.id,'control')]);
 const x=ctx.assess(e(a.id,b.id));assert.equal(x.status,'requires-review');assert.ok(x.blockers.includes('target-evidence-dominates-control-source'));assert.equal(x.effective,null);
 const g=context([a,b],[raw(a.id,b.id,'generate')]).assess(e(a.id,b.id,'generate'));
 assert.equal(g.status,'root-locality-screen-met');assert.equal(g.effective,null);
});
test('missing hour and hidden access never pass an edge screen',()=>{
 const h=actor('hidden:day:무','무','hidden');
 const x=context([a,h],[raw(a.id,h.id,'control')],false).assess(e(a.id,h.id));
 assert.ok(x.blockers.includes('missing-hour'));assert.ok(x.blockers.includes('hidden-participant-access-unresolved'));assert.equal(x.status,'requires-review');
});
test('combination contacts retain competition including day stem, no removal authority',()=>{
 const d=actor('visible:day','갑'),ctx=context([a,c,d],[]);
 const x=ctx.assess({from:a.id,to:c.id,kind:'combine'});
 assert.ok(x.blockers.includes('competing-combination'));assert.equal(x.combination.exclusiveObserved,false);assert.equal(x.combination.removalConfirmed,null);
 assert.equal(ctx.assess({from:a.id,to:d.id,kind:'combine'}).status,'invalid-evidence');
});
test('group edge cannot be promoted by a clean ordinary screen',()=>{
 const g={id:'group:g',formationId:'g',slots:['branch:year','branch:month','branch:day'],limitations:[],clashIds:[],competingContacts:[]};
 const ctx=context([a],[],true,[g],[raw(a.id,g.id,'generate',{relative:null})]);
 assert.ok(ctx.assess(e(a.id,g.id,'generate')).blockers.includes('formation-transformation-unresolved'));
});
const pass={status:'root-locality-screen-met',effective:null},review={candidateId:'c',status:'diagnostic',rules:[{id:'s',kind:'support',unresolvedConditions:['actual-effect'],witnesses:[{id:'w',roles:{helper:a.id,target:b.id},edges:[e(a.id,b.id)],anchorBindings:[{anchorId:c.id,edge:{kind:'bad'}},{anchorId:a.id,edge:e(a.id,b.id)}]}]}]};
const comp={violations:[],threatCoverage:[]},integrity={status:'consistent'};
test('anchor alternatives are disjunctive, mandatory edges conjunctive, unresolved conditions retained',()=>{
 const ctx={assess:e=>e.kind==='bad'?{status:'requires-review',effective:null}:pass};
 const r=observeWitnessEfficacy(review,integrity,comp,ctx,true);
 assert.equal(r.witnesses[0].status,'edge-screens-met');assert.equal(r.witnesses[0].effective,null);
 assert.deepEqual(r.witnesses[0].unresolvedConditions,['actual-effect']);
 const bad=observeWitnessEfficacy(review,integrity,comp,{assess:()=>({status:'requires-review'})},true);
 assert.equal(bad.witnesses[0].status,'requires-review');
});
test('storage, co-presence and conditional regulation cannot pass witness screen',()=>{
 const q={...review,storageProjection:{},rules:[{id:'s',kind:'support',impact:'conditional-regulation-not-confirmed-support',unresolvedConditions:[],witnesses:[{id:'w',roles:{},edges:[],regulation:{conditions:{dayCapacity:'opposing-hypothesis'}}}]}]};
 const r=observeWitnessEfficacy(q,integrity,comp,{assess:()=>pass},true).witnesses[0];
 for(const f of ['storage-access-and-family-unresolved','co-presence-only','day-capacity-opposing-hypothesis','excess-or-deficiency-unresolved'])assert.ok(r.flags.includes(f));
 assert.equal(r.status,'requires-review');
});
test('integrity failure fails closed; invalid edge is not hidden by an alternative',()=>{
 assert.equal(observeWitnessEfficacy(review,{status:'invalid-evidence'},comp,{assess:()=>pass},true).witnesses.length,0);
 const r=observeWitnessEfficacy(review,integrity,comp,{assess:e=>e.kind==='bad'?{status:'invalid-evidence'}:pass},true);
 assert.equal(r.status,'invalid-evidence');
});
test('rescue screens retain exact threats and never cancel adversity',()=>{
 const q={...review,rules:[{id:'d',kind:'damage',unresolvedConditions:[],witnesses:[{id:'d1',roles:{},edges:[e(a.id,b.id)]}]},{id:'r',kind:'rescue',unresolvedConditions:[],witnesses:[{id:'r1',roles:{},edges:[e(a.id,b.id)],threatWitnessId:'d1'}]}]};
 const r=observeWitnessEfficacy(q,integrity,{violations:[],threatCoverage:[{threat:{ruleId:'d',witnessId:'d1'},alternatives:[{ruleId:'r',witnessId:'r1'}],coverage:'structural-route-observed'}]},{assess:()=>pass},true);
 assert.equal(r.threats[0].alternatives[0].status,'edge-screens-met');assert.equal(r.threats[0].resolutionConfirmed,null);assert.equal(r.rescued,null);
});
test('native efficacy preserves integrated fields and cannot grant authority',()=>{
 const ps=['정묘','신유','갑자','임신'],saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,{stem:ps[i][0],branch:ps[i][1],text:ps[i]}]))},args={saju,birthBasis:'verified-chart'};
 const a=analyzePatternOutcomeIntegrated({...args,policy:PATTERN_OUTCOME_INTEGRATED_VERSION}),b=analyzePatternOutcomeEfficacy({...args,policy:PATTERN_OUTCOME_EFFICACY_VERSION});
 const {efficacyReview,version,scope,...rest}=b;
 assert.deepEqual(rest,Object.fromEntries(Object.entries(a).filter(([k])=>!['version','scope'].includes(k))));
 assert.equal(efficacyReview.status,'diagnostic');assert.equal(efficacyReview.effective,null);assert.ok(efficacyReview.candidates.every(q=>q.selectionAuthority===false&&q.witnesses.every(w=>w.effective===null)));
 assert.equal(analyzePatternOutcomeEfficacy({...args,birthBasis:'provisional-chart',policy:PATTERN_OUTCOME_EFFICACY_VERSION}).efficacyReview,null);
});

test('target-is-anchor satisfies identity only, unlike same-branch co-presence',()=>{
 const q={...review,rules:[{...review.rules[0],witnesses:[{...review.rules[0].witnesses[0],roles:{target:a.id},anchorBindings:[{anchorId:a.id,targetId:a.id,basis:'target-is-anchor',edge:null,independentSlots:false}]}]}]};
 const run=()=>observeWitnessEfficacy(q,integrity,comp,{assess:()=>pass},true).witnesses[0];
 assert.equal(run().status,'edge-screens-met');assert.equal(run().anchorAlternatives[0].identityOnly,true);
 q.rules[0].witnesses[0].anchorBindings[0].basis='same-branch-constituent-context';
 assert.equal(run().status,'requires-review');assert.equal(run().effective,null);
});
