import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createSynthesisNodeIndex,observeSupplementaryMethods,projectSynthesisTiming} from '../src/features/useful-element/synthesis-method-links.js';
import {buildSynthesis} from '../src/features/useful-element/synthesis.js';
import {createMethodEvidence} from '../src/features/method-evidence.js';
import {createStrengthEvidenceProvider} from '../src/features/strength/request-evidence.js';
import {evaluateIntegratedDecision} from '../src/features/strength/integrated-decision.js';
import {buildOutcomeV10} from '../src/features/pattern/outcome-review-v10.js';
import {getSaju,analyzePatternOutcomeV10,analyzeFormationEvidence,analyzeUsefulElementSynthesis,analyzeClimateUsefulElementV5,USEFUL_ELEMENT_SYNTHESIS_VERSION} from '../src/index.js';
const chart=ps=>({pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,ps[i]?{stem:ps[i][0],branch:ps[i][1],text:ps[i]}:null]))});
const v=(p,element,layer='stem')=>({id:p+':'+layer+(layer==='branch'?':'+element:''),position:p,element,layer,dayReference:false,anchorObserved:true,intactSubstantialRoot:true});
const edge=(a,b,kind)=>({from:a,to:b,kind});
const sample=()=>{
 const saju=chart(['경자','임오','갑인','무오']);
 const a=v('year','metal'),b=v('month','water'),c=v('day','wood'),hidden=v('hour','fire','branch');
 c.dayReference=true;
 const access={hidden:[{id:'hidden:hour:병',position:'hour',element:'fire'},{id:'hidden:hour:정',position:'hour',element:'fire'}]};
 const q={candidateId:'c',status:'diagnostic',anchors:[{id:'visible:day'}],participants:[{occurrenceId:'visible:month',element:'water'}]};
 const synthesis={status:'diagnostic',balance:{branches:[{assumedDirection:'weak',candidates:[{element:'water'}]}]},climate:{groups:[{id:'baseline:0',elements:['water']}],alternatives:[]},candidates:[q]};
 const damage={id:'d1',edges:[edge('visible:year','visible:day','control')]};
 const rescue={id:'r1',threatWitnessId:'d1',edges:[edge('hidden:hour:병','visible:year','control')]};
 const support={id:'s1',edges:[edge('visible:year','visible:month','generate'),edge('visible:month','visible:day','generate')]};
 const pattern={access,reviews:[{candidateId:'c',rules:[{id:'d',kind:'damage',witnesses:[damage]},{id:'r',kind:'rescue',threatRuleId:'d',witnesses:[rescue]},{id:'s',kind:'support',witnesses:[support]}]}]};
 const mediation={version:'mediation-useful-element-v1',status:'diagnostic',pairs:[{from:'metal',to:'wood',via:'water',mediatorNodes:[b],routes:[{id:'path',nodes:[a,b,c],adjacent:true,oneGap:true,obstructions:[]}]}]};
 const remedy={version:'remedy-evidence-v1',status:'diagnostic',motifs:[{target:c,threat:a,remedyElement:'fire',targetContext:{dayReference:true},remedies:[{remedy:hidden,adjacent:false,obstructions:[]}]}]};
 return {saju,synthesis,pattern,mediation,remedy};
};
const run=x=>observeSupplementaryMethods(x.saju,x.synthesis,x.pattern,x.mediation,x.remedy);
test('aggregate branch nodes keep all literal identities rather than picking one',()=>{
 const x=sample(),n=createSynthesisNodeIndex(x.saju,x.pattern.access).map.get('hour:branch:fire');
 assert.deepEqual(n.occurrenceIds,['hidden:hour:병','hidden:hour:정']);
 const r=run(x).remedy.motifs[0].remedies[0];assert.equal(r.linkBasis,'shared-branch-element-context');assert.equal(r.effective,null);
});
test('same-witness mediation and bound rescue links retain exact reference',()=>{
 const x=sample(),before=JSON.stringify(x),r=run(x);
 assert.equal(r.mediation.pairs[0].routes[0].patternLinks[0].witnessId,'s1');
 assert.equal(r.remedy.motifs[0].remedies[0].rescueLinks[0].threatWitnessId,'d1');
 assert.equal(r.remedy.motifs[0].remedyConfirmed,null);assert.equal(JSON.stringify(x),before);
});
test('separate witnesses cannot form a linked mediation route and wrong threat cannot link rescue',()=>{
 const x=sample(),rs=x.pattern.reviews[0].rules;
 const s=rs[2].witnesses[0];rs[2].witnesses=[{id:'s1',edges:[s.edges[0]]},{id:'s2',edges:[s.edges[1]]}];
 rs[1].witnesses[0].threatWitnessId='other';
 const r=run(x);assert.deepEqual(r.mediation.pairs[0].routes[0].patternLinks,[]);assert.deepEqual(r.remedy.motifs[0].remedies[0].rescueLinks,[]);
});
test('alternative anchor is not mandatory, unavailable suppresses all supplemental evidence',()=>{
 const x=sample(),s=x.pattern.reviews[0].rules[2].witnesses[0];
 s.anchorBindings=[{anchorId:'visible:day',edge:s.edges.pop()}];
 const r=run(x);assert.equal(r.mediation.pairs[0].routes[0].patternLinks[0].scope,'anchor-alternative');
 x.synthesis.status='unavailable';assert.deepEqual(run(x).mediation.pairs,[]);
});
test('calendar predicate may be true without resolving a textual prescription',()=>{
 const t={when:'before-summer-solstice',matched:true},r=projectSynthesisTiming({version:'climate-useful-element-v5',temporal:{status:'observed',conditions:[t]},structuralConditions:[],evidence:{sourceProfile:{alternatives:[{when:t.when,stems:['계'],groups:[['계']]}]}}});
 assert.equal(r.alternatives[0].calendarPredicate.matched,true);assert.equal(r.alternatives[0].conditionResolved,false);assert.equal(r.adequacyConfirmed,null);assert.equal(r.selectionAuthority,false);
});
test('native shared observation and integrated baseline identity, independent public results unchanged',()=>{
 const saju=chart(['무술','갑자','정미','경술']),p=createMethodEvidence(),other=createMethodEvidence(),args={saju,birthBasis:'verified-chart'};
 assert.equal(p.observation(saju).structure(),p.structure(saju));assert.equal(p.formation(saju),p.formation(saju));assert.deepEqual(p.formation(saju),analyzeFormationEvidence({saju}));
 assert.equal(p.standard.dynamics(saju),p.neutral.dynamics(saju));assert.notEqual(p.structure(saju),other.structure(saju));
 const a={...args,policy:'strength-multiaxis-v3'};
 assert.equal(evaluateIntegratedDecision(a,p.standard),evaluateIntegratedDecision(a,p.standard));assert.notEqual(evaluateIntegratedDecision(a,p.standard),evaluateIntegratedDecision(a,p.neutral));
 const b={...args,policy:'pattern-outcome-decision-v10'};
 assert.deepEqual(buildOutcomeV10(b,p).result,analyzePatternOutcomeV10(b));
});
test('native shared versus separate provider synthesis parity, partial and provisional',()=>{
 const full=chart(['무술','갑자','정미','경술']);
 for(const [saju,birthBasis] of [[full,'verified-chart'],[{pillars:{...full.pillars,hour:null}},'verified-chart'],[full,'provisional-chart']]){
  const i={saju,birthBasis,policy:USEFUL_ELEMENT_SYNTHESIS_VERSION},before=JSON.stringify(i),a=buildSynthesis(i),b=buildSynthesis(i,{shared:false});
  assert.deepEqual(a,b);assert.notEqual(a.status,'invalid-evidence');assert.equal(a.selectionAuthority,false);assert.equal(JSON.stringify(i),before);
 }
});
test('native synthesis forwards exact birth to existing climate term predicate only',()=>{
 const fixture=JSON.parse(readFileSync(new URL('../docs/climate-v3-term-results.json',import.meta.url),'utf8'));
 for(const {birth} of fixture.boundaries[0].checks){
  const saju=getSaju(birth),args={saju,birth,birthBasis:'verified-chart'};
  const c=analyzeClimateUsefulElementV5({...args,policy:'climate-useful-element-v5'});
  const r=analyzeUsefulElementSynthesis({...args,policy:USEFUL_ELEMENT_SYNTHESIS_VERSION});
  assert.equal(r.status,'diagnostic');assert.deepEqual(r.climateTiming.calendar,c.temporal);
  assert.ok(r.climateTiming.alternatives.every(a=>a.conditionResolved===false&&a.selectionAuthority===false));
  assert.equal(r.usefulElement,null);
 }
});

test('request cache separates chart identity, basis, policy and provider; thrown computations are not cached',()=>{
 const p=createStrengthEvidenceProvider(),q=createStrengthEvidenceProvider(),saju={},args={saju,birthBasis:'verified-chart',policy:'strength-multiaxis-v3'};
 let calls=0;const build=()=>({n:++calls});
 const a=p.integrated(args,build);assert.equal(p.integrated({...args},build),a);
 for(const changed of [{...args,saju:{}},{...args,birthBasis:'provisional-chart'},{...args,policy:'other'}])assert.notEqual(p.integrated(changed,build),a);
 assert.notEqual(q.integrated(args,build),a);
 const fresh={...args,saju:{}};
 assert.throws(()=>p.integrated(fresh,()=>{throw Error('fixture');}),/fixture/);
 assert.equal(p.integrated(fresh,build).n,6);
});
