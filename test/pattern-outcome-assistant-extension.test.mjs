import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzePatternOutcomeV9,analyzePatternOutcomeAssistantExtension,PATTERN_OUTCOME_V9_VERSION,PATTERN_OUTCOME_ASSISTANT_EXTENSION_VERSION} from '../src/index.js';
import {extendAssistantRoutes,observeAssistantCombinationInjury,observeBranchAssistantDependencies} from '../src/features/pattern/outcome-assistant-extension.js';
import {observeCompoundTopology} from '../src/features/pattern/outcome-compound-topology.js';
const chart=ps=>({pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,ps[i]?{stem:ps[i][0],branch:ps[i][1],text:ps[i]}:null]))});
const run=ps=>analyzePatternOutcomeAssistantExtension({saju:chart(ps),birthBasis:'verified-chart',policy:PATTERN_OUTCOME_ASSISTANT_EXTENSION_VERSION});
const all=(r,id)=>r.assistantExtension.candidates.flatMap(q=>q.review.rules.filter(r=>r.id===id).flatMap(r=>r.witnesses));
const w=(id,roles,edges=[],extra={})=>({id,roles,edges,...extra,effective:null});
const rule=(id,kind,witnesses,extra={})=>({id,kind,witnesses,...extra});
const q=(family,rules,anchorIds=['hidden:month:신'])=>({candidateId:'c',family,anchorIds,anchorBasis:family==='peer'?'day-reference-proxy':'exact-month-hidden-or-visible-projection',rules,status:'diagnostic',assistantCandidates:[]});
const access={groups:[],edges:[]};
test('officer combination binds original threat and actual resource helper',()=>{
 const d=rule('officer-hurting','damage',[w('d',{target:'hidden:month:신',obstacle:'visible:year'})]);
 const r=extendAssistantRoutes(q('officer',[d]),chart(['정묘','신유','갑자','임신']),access,true);
 const x=r.rules.find(r=>r.id==='officer-combine-hurting').witnesses[0];
 assert.equal(x.roles.helper,'visible:hour');assert.equal(x.threatWitnessId,'d');assert.equal(x.edges[0].effective,null);
 assert.equal(observeCompoundTopology(r,true).violations.length,0);
 const n=extendAssistantRoutes(q('officer',[d]),chart(['정묘','신유','갑자','계유']),access,true);
 assert.equal(n.rules.find(r=>r.id==='officer-combine-hurting').observed,false);
});
test('killing resource combination restores candidate path with exact food and anchor identities',()=>{
 const d=rule('killing-resource-blocks-food','damage',[w('d',{target:'hidden:month:신',food:'visible:year',obstacle:'visible:month'})]);
 const r=extendAssistantRoutes(q('killing',[d]),chart(['정묘','계유','을축','무인']),access,true);
 const x=r.rules.find(r=>r.id==='killing-combine-resource').witnesses[0];
 assert.equal(x.roles.food,'visible:year');assert.equal(x.roles.helper,'visible:hour');assert.equal(x.threatWitnessId,'d');
 assert.equal(observeCompoundTopology(r,true).violations.length,0);
});
test('existing wealth killing combination not duplicated and missing threat not rescued',()=>{
 const a=q('wealth',[rule('wealth-combine-killing','rescue',[])]);
 assert.equal(extendAssistantRoutes(a,chart(['갑인','병자','무진','기미']),access,true),a);
 const b=extendAssistantRoutes(q('officer',[]),chart(['정묘','신유','갑자',null]),access,false);
 assert.equal(b.rules[0].observed,null);assert.equal(b.rules[0].witnesses.length,0);
});
const group=(id,slots)=>({id,formationId:id.slice(6),kind:'complete-three',element:'wood',includesMonth:true,slots,members:['해','묘','미'],clashIds:[],competingContacts:[]});
test('branch alternatives track physical slots and distinguish shared from replaceable branches',()=>{
 const a=group('group:a',['branch:month','branch:day','branch:year']),b=group('group:b',['branch:month','branch:day','branch:hour']);
 const r=q('peer',[rule('peer-group-output-wealth','support',[w('a',{target:'visible:day',helper:a.id,wealth:'visible:year'},[],{groupId:a.id}),w('b',{target:'visible:day',helper:b.id,wealth:'visible:year'},[],{groupId:b.id})])],['visible:day']);
 const z=observeBranchAssistantDependencies(r,{groups:[a,b]},true)[0];
 assert.equal(z.alternatives.length,2);assert.equal(z.branchMasks.find(x=>x.slot==='branch:day').allObservedAlternativesLost,true);
 assert.equal(z.branchMasks.find(x=>x.slot==='branch:year').allObservedAlternativesLost,false);
 assert.ok(!z.branchMasks.some(x=>x.slot==='branch:month'));assert.equal(z.necessityConfirmed,null);
});
test('assistant combination injury follows valid rescue; unrelated pair cannot cancel it',()=>{
 const d=rule('officer-hurting','damage',[w('d',{obstacle:'visible:year',target:'hidden:month:신'})]);
 const h=rule('officer-resource-rescue','rescue',[w('h',{obstacle:'visible:year',target:'hidden:month:신',helper:'visible:month'},[],{threatWitnessId:'d'})],{threatRuleId:d.id});
 const r=q('officer',[d,h]),z=observeAssistantCombinationInjury(r,observeCompoundTopology(r,true),chart(['정묘','계유','갑자','무진']),true);
 assert.equal(z.length,1);assert.equal(z[0].assistantId,'visible:month');assert.equal(z[0].obstacleId,'visible:hour');assert.equal(z[0].rescueLost,null);
});
test('native integration covers three combination clauses and two injury clauses',()=>{
 assert.ok(all(run(['정묘','신유','갑자','임신']),'officer-combine-hurting').some(w=>w.roles.helper==='visible:hour'));
 assert.ok(all(run(['갑인','병자','무진','기미']),'wealth-combine-killing').some(w=>w.roles.helper==='visible:hour'));
 assert.ok(all(run(['정묘','계유','을축','무인']),'killing-combine-resource').some(w=>w.roles.helper==='visible:hour'));
 const injuries=ps=>run(ps).assistantExtension.candidates.flatMap(q=>q.combinationInjury);
 assert.ok(injuries(['정묘','계유','갑자','무진']).some(w=>w.assistantId==='visible:month'&&w.obstacleId==='visible:hour'));
 assert.ok(injuries(['계묘','기유','정축','갑진']).some(w=>w.assistantId==='visible:month'&&w.obstacleId==='visible:hour'));
});
test('native branch assistant routes require complete month group and actual visible recipient',()=>{
 const a=run(['병자','기해','계묘','기미']);
 assert.ok(all(a,'peer-group-output-wealth').some(w=>w.roles.wealth==='visible:year'));
 assert.ok(a.assistantExtension.candidates.some(q=>q.branchDependencies.some(g=>g.alternatives.some(x=>x.supportingNonMonthSlots.includes('branch:day')&&x.supportingNonMonthSlots.includes('branch:hour')))));
 assert.equal(all(run(['병자','기해','계묘',null]),'peer-group-output-wealth').length,0);
 // Keep the 申子辰 group and every other pillar fixed; only the
 // year stem changes. 癸子 is not a valid sexagenary pillar.
 const projected=run(['임자','무신','경진','무인']);
 const unprojected=run(['갑자','무신','경진','무인']);
 assert.ok(all(projected,'peer-group-output-projection').some(w=>w.roles.projection==='visible:year'));
 assert.equal(all(unprojected,'peer-group-output-projection').length,0);
});
test('V9 inherited contract preserved and new evidence never confirms assistant',()=>{
 const args={saju:chart(['정묘','신유','갑자','임신']),birthBasis:'verified-chart'};
 const a=analyzePatternOutcomeV9({...args,policy:PATTERN_OUTCOME_V9_VERSION}),b=analyzePatternOutcomeAssistantExtension({...args,policy:PATTERN_OUTCOME_ASSISTANT_EXTENSION_VERSION});
 const {assistantExtension,version,scope,...rest}=b;assert.deepEqual(rest,Object.fromEntries(Object.entries(a).filter(([k])=>!['version','scope'].includes(k))));
 assert.ok(assistantExtension.candidates.every(q=>q.assistantConfirmed===null&&q.selectionAuthority===false&&q.compound.violations.length===0));
 assert.equal(analyzePatternOutcomeAssistantExtension({...args,birthBasis:'provisional-chart',policy:PATTERN_OUTCOME_ASSISTANT_EXTENSION_VERSION}).assistantExtension,null);
});
