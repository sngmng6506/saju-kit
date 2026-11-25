import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzePatternOutcomeV8,analyzePatternOutcomeV9,PATTERN_OUTCOME_V8_VERSION,PATTERN_OUTCOME_V9_VERSION} from '../src/index.js';
import {observeSourcePurity} from '../src/features/pattern/outcome-purity-source.js';
import {observeCandidateClarity} from '../src/features/pattern/outcome-clarity.js';
import {observeCompoundTopology} from '../src/features/pattern/outcome-compound-topology.js';
import {observeAssistantNecessity} from '../src/features/pattern/outcome-assistant.js';
const chart=ps=>({pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,ps[i]?{stem:ps[i][0],branch:ps[i][1],text:ps[i]}:null]))});
const w=(id,roles,edges=[],extra={})=>({id,roles,edges,...extra,effective:null});
const e=(from,to,kind='control')=>({from,to,kind,effective:null});
const r=(id,kind,witnesses,extra={})=>({id,kind,witnesses,...extra});
const q=rules=>({candidateId:'c',status:'diagnostic',family:'officer',anchorIds:['officer'],rules});
const run=(review,visibleIds=[],complete=true)=>{
 const c=observeCompoundTopology(review,complete),a=observeAssistantNecessity(review,c,complete);
 return observeCandidateClarity(review,c,a,visibleIds,complete);
};
test('five source clauses distinguish aligned control from opposed control without verdict',()=>{
 for(const [ps,orientation,kind] of [
  [['갑자','병인','신유','무자'],'aligned','generate'],
  [['경자','임신','무오','갑인'],'aligned','generate'],
  [['을묘','기미','계유','신유'],'aligned','control'],
  [['을묘','기미','임신','경자'],'opposed','control'],
  [['무자','임진','갑인','병인'],'opposed','control']
 ]){
  const a=observeSourcePurity(chart(ps),[],true);assert.equal(a.motifs.length,1);
  assert.equal(a.motifs[0].orientation,orientation);assert.equal(a.motifs[0].observed,true);
  assert.equal(a.motifs[0].witnesses[0].kind,kind);assert.equal(a.purityConfirmed,null);
 }
});
test('source clauses are scoped to day/month and exact visible occurrences, not same element',()=>{
 assert.equal(observeSourcePurity(chart(['갑자','병오','신유','무자']),[],true).motifs.length,0);
 const a=observeSourcePurity(chart(['을묘','병인','신유','무자']),[],true);
 assert.equal(a.motifs[0].observed,false);
 const b=observeSourcePurity(chart(['을묘','병인','신유',null]),[],false);
 assert.equal(b.motifs[0].observed,null);
});
test('support and adversity coexist without a purity judgement; victim is not adversary',()=>{
 const a=run(q([r('s','support',[w('s',{helper:'wealth',target:'officer'},[e('wealth','officer','generate')])]),
 r('d','damage',[w('d',{obstacle:'output',target:'officer'},[e('output','officer')])])]));
 assert.equal(a.observations.ordinarySupportObserved,true);assert.equal(a.observations.adversityObserved,true);
 assert.equal(a.participants.find(p=>p.occurrenceId==='officer').adverseRoles.length,0);
 assert.equal(a.cleanConfirmed,null);assert.equal(a.turbidConfirmed,null);assert.equal(a.blockers.uncoveredThreats.length,1);
});
test('rescue alternatives do not clear adversity or turn unidentified participants into idle gods',()=>{
 const d=r('d','damage',[w('d',{obstacle:'output',target:'officer'},[e('output','officer')])]);
 const h=r('h','rescue',[w('h',{obstacle:'output',target:'officer',helper:'resource'},[e('resource','output')],{threatWitnessId:'d'})],{threatRuleId:'d'});
 const a=run(q([d,h]),['visible:day','unused']);
 assert.equal(a.blockers.conditionalRescueThreats.length,1);assert.equal(a.threatCoverage[0].resolved,null);
 assert.equal(a.observations.adversityObserved,true);assert.equal(a.clearedConfirmed,null);
 assert.equal(a.participants.find(p=>p.occurrenceId==='unused').idleConfirmed,null);
 assert.equal(a.observations.unclassifiedVisibleIds[0],'unused');
});
test('dual helper and obstacle roles are explicit, not inferred from victim status',()=>{
 const a=run(q([r('s','support',[w('s',{helper:'resource',target:'officer'})]),r('d','damage',[w('d',{obstacle:'resource',target:'officer'})])]));
 assert.deepEqual(a.dualRoleIds,['resource']);assert.equal(a.participants.find(p=>p.occurrenceId==='resource').harmfulConfirmed,null);
});
test('regulation remains conditional, and assistant injury is linked to the exact participant',()=>{
 const a=run(q([r('s','support',[w('s',{helper:'resource',target:'officer'})]),
 r('d','damage',[w('d',{obstacle:'wealth',target:'resource'},[e('wealth','resource')])]),
 r('reg','support',[w('reg',{helper:'wealth',target:'resource'},[e('wealth','resource')],{alternativeDamageRuleId:'d'})],{impact:'conditional-regulation-not-confirmed-support'})]));
 assert.equal(a.blockers.assistantInjury[0].occurrenceId,'resource');assert.equal(a.blockers.competingRegulation.length,1);
 assert.equal(a.participants.find(p=>p.occurrenceId==='wealth').support.length,0);
});
test('partial and invalid evidence fail closed and no-rule case is not clear',()=>{
 const a=run(q([]),['unused'],false);assert.equal(a.status,'partial');assert.equal(a.observations.adversityObserved,null);assert.equal(a.cleanConfirmed,null);
 const b=run(q([]),[],true);assert.equal(b.observations.adversityObserved,false);assert.equal(b.cleanConfirmed,null);
 const bad=observeCandidateClarity(q([]),{candidateId:'wrong'},null,[],true);assert.equal(bad.status,'invalid-evidence');
});
test('V9 retains V8 result and separates source and candidate reviews',()=>{
 const args={saju:chart(['갑자','병인','신유','무자']),birthBasis:'verified-chart'};
 const a=analyzePatternOutcomeV8({...args,policy:PATTERN_OUTCOME_V8_VERSION}),b=analyzePatternOutcomeV9({...args,policy:PATTERN_OUTCOME_V9_VERSION});
 const {purityReview,clarityReview,version,scope,...rest}=b;
 assert.deepEqual(rest,Object.fromEntries(Object.entries(a).filter(([k])=>!['version','scope'].includes(k))));
 assert.equal(purityReview.motifs[0].observed,true);assert.equal(clarityReview.length,b.reviews.length);
 assert.ok(clarityReview.every(q=>q.selectionAuthority===false&&q.cleanConfirmed===null));
 const p=analyzePatternOutcomeV9({...args,birthBasis:'provisional-chart',policy:PATTERN_OUTCOME_V9_VERSION});assert.equal(p.purityReview,null);assert.equal(p.clarityReview,null);
});
