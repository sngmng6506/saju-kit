import test from 'node:test';
import assert from 'node:assert/strict';
import {observeGeneralPurity} from '../src/features/pattern/outcome-purity-general.js';
import {observeRouteInjury} from '../src/features/pattern/outcome-route-injury.js';
import {analyzePatternOutcomeV10,PATTERN_OUTCOME_V10_VERSION} from '../src/index.js';
const o=(id,stem,tenGod)=>({id:'visible:'+id,position:id,layer:'visible',stem,tenGod,dayReference:id==='day'});
const e=(from,to,kind)=>({id:from+'>'+to,from,to,kind,screen:'requires-review',blockers:[],effective:null});
const ctx=(occurrences,edges,completeHour=true)=>({completeHour,stemForce:{occurrences},relativeForce:{edges}});
const q=(candidateId,anchorIds,rules=[])=>({candidateId,anchorIds,rules,status:'diagnostic',anchorBasis:'exact-month-hidden-or-visible-projection'});
const valid={status:'consistent'};
const a=o('year','갑','정재'),b=o('month','병','정관'),c=o('hour','임','편인');
test('distinct visible projected anchors are deduplicated across candidates',()=>{
 const edge=e(a.id,b.id,'generate'),prior=ctx([a,b,c],[edge]),reviews=[q('a',[a.id]),q('alias',[a.id]),q('b',[b.id])];
 const r=observeGeneralPurity(prior,reviews,[valid]);
 assert.equal(r.pairs.length,1);assert.deepEqual(r.pairs[0].from.candidateIds,['a','alias']);
 assert.equal(r.pairs[0].orientation,'aligned');assert.equal(r.purityConfirmed,null);
 assert.equal(observeGeneralPurity(prior,[q('a',[a.id])],[valid]).pairs.length,0);
});
test('control can be aligned or opposed depending on exact roles, and uncovered is not negative',()=>{
 for(const [from,to,orientation] of [[o('year','을','식신'),o('month','기','편관'),'aligned'],[o('year','을','상관'),o('month','기','정관'),'opposed']]){
  const r=observeGeneralPurity(ctx([from,to],[e(from.id,to.id,'control')]),[q('x',[from.id]),q('y',[to.id])],[valid]);
  assert.equal(r.pairs[0].orientation,orientation);assert.equal(r.mixedConfirmed,null);
 }
 const x=observeGeneralPurity(ctx([a,c],[e(c.id,a.id,'generate')]),[q('a',[a.id]),q('c',[c.id])],[valid]);
 assert.equal(x.pairs.length,0);assert.equal(x.unclassifiedPairs.length,1);
});
test('storage and partial conditions remain unresolved, invalid integrity suppresses pairs',()=>{
 const prior=ctx([a,b],[e(a.id,b.id,'generate')],false),reviews=[{...q('a',[a.id]),storageProjection:{}},q('b',[b.id])];
 const r=observeGeneralPurity(prior,reviews,[valid]);assert.equal(r.status,'partial');
 assert.ok(r.pairs[0].unresolvedConditions.includes('storage-access-and-family-unresolved'));
 assert.equal(observeGeneralPurity(prior,reviews,[{status:'invalid-evidence'}]).pairs.length,0);
});
const w=(id,roles,edges)=>({id,roles,edges,effective:null});
const rule=(id,kind,witnesses)=>({id,kind,witnesses});
const assistant=(id,ruleId,witnessId,kind='support')=>({status:'diagnostic',candidates:[{occurrenceId:id,roles:[{role:'helper',kind,ruleId,witnessId}]}]});
const access={groups:[],edges:[]},compound={violations:[]};
test('support assistant injury observes control and combination, excludes intentional route edge',()=>{
 const helper=o('month','계','정인'),other=o('hour','무','편재'),target=o('year','정','상관');
 const route=w('w',{helper:helper.id,target:target.id},[e(helper.id,target.id,'control')]);
 const prior=ctx([helper,other,target],[e(other.id,helper.id,'control'),...route.edges]);
 const result=observeRouteInjury(prior,access,q('c',[target.id],[rule('s','support',[route])]),compound,assistant(helper.id,'s','w'),valid);
 assert.deepEqual(result.contacts.map(c=>c.contact.kind).sort(),['combine','control']);
 assert.ok(result.contacts.every(c=>c.route.witnessId==='w'&&c.injuryConfirmed===null&&c.routeLost===null));
});
test('intentional combination does not injure itself, third competing partner still visible',()=>{
 const helper=o('month','임','편인'),target=o('year','정','상관'),day=o('day','정','비견');
 const route=w('w',{helper:helper.id,obstacle:target.id},[e(helper.id,target.id,'combine')]);
 const r=observeRouteInjury(ctx([helper,target,day],[]),access,q('c',[target.id],[rule('r','rescue',[route])]),compound,assistant(helper.id,'r','w','rescue'),valid);
 assert.equal(r.contacts.length,1);assert.equal(r.contacts[0].obstacleId,day.id);assert.equal(r.contacts[0].dayReferenceInvolved,true);
 assert.equal(observeRouteInjury(ctx([helper,target,day],[]),access,q('c',[target.id]),compound,assistant(helper.id,'r','w','rescue'),{status:'invalid-evidence'}).contacts.length,0);
});
test('native generalized purity extends exact source motif and V10 remains unauthorized',()=>{
 const ps=['갑자','병인','신유','기축'],saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,{stem:ps[i][0],branch:ps[i][1],text:ps[i]}]))};
 const r=analyzePatternOutcomeV10({saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION});
 assert.ok(r.purityReview.generalized.pairs.some(p=>p.clauseId==='wealth-officer-generation'));
 assert.equal(r.decisionReview.purity.value,null);assert.equal(r.decisionReview.purity.authorized,false);
 assert.deepEqual(r.decisionReview.purity.evidence.generalized,r.purityReview.generalized);
 assert.ok(r.clarityReview.every(q=>q.routeInjury.selectionAuthority===false));
});
