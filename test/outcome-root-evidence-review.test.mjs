import test from 'node:test';
import assert from 'node:assert/strict';
import {replayRootRestrictions,buildRootEvidencePacket,reviewAndReplayRoots} from '../scripts/lib/pattern-root-evidence-review.mjs';
import {buildLiteralStrengthInput} from '../scripts/lib/pattern-strength-replay.mjs';
import {claimReviewTemplate,adjudicateClaims} from '../scripts/lib/pattern-outcome-claim-evaluation.mjs';
import {validRootEvidenceTarget} from '../src/features/pattern/outcome-root-evidence-contract.js';
const key=(...xs)=>JSON.stringify(xs);
const seed=(nodeId,slotId,role)=>({nodeId,slotId,role});
const network={completeHour:true,nodes:[{id:'a',rootIds:['r']},{id:'b',rootIds:['r']},{id:'c',rootIds:[]}],links:[{id:'ac',from:'a',to:'c',kind:'generate'},{id:'bc',from:'b',to:'c',kind:'generate'}],targets:['a','b','c'],seeds:[seed('a','r','principal'),seed('b','r','principal'),seed('c','s','residual')]};
const fixed=(id,value)=>({id,value});
const get=(q,t,p='substantial-baseline')=>q.rows.find(r=>r.targetId===t).policies.find(x=>x.policy===p);
test('shared retention false disables every access to that physical root, not residual alternative',()=>{
 const q=replayRootRestrictions({...network,restrictions:[fixed(key('slot-retained','r'),false)]});
 assert.equal(q.status,'diagnostic',q.reason);
 assert.ok(q.rows.every(r=>!r.policies[0].after.possible));
 assert.equal(get(q,'c','all-constituents').after.possible,true);
 assert.equal(get(q,'c','all-constituents').after.necessary,false);
});
test('conditional access is actor-specific and retention alone does not imply access',()=>{
 const q=replayRootRestrictions({...network,restrictions:[fixed(key('slot-retained','r'),true),fixed(key('root-access','a','r'),false),fixed(key('root-access','b','r'),true)]});
 assert.equal(q.status,'diagnostic',q.reason);
 assert.equal(get(q,'a').after.possible,false);
 assert.equal(get(q,'b').after.necessary,true);
 assert.equal(get(q,'c').after.possible,true);
 assert.equal(get(q,'c').after.necessary,false);
 const r=replayRootRestrictions({...network,restrictions:[fixed(key('slot-retained','r'),true)]});
 assert.equal(get(r,'a').after.necessary,false);
});
test('unknown and duplicated restrictions rejected; missing hour abstains',()=>{
 assert.equal(replayRootRestrictions({...network,restrictions:[fixed('fake',true)]}).reason,'restriction-contract');
 assert.equal(replayRootRestrictions({...network,restrictions:[fixed(key('slot-retained','r'),true),fixed(key('slot-retained','r'),false)]}).reason,'restriction-contract');
 assert.equal(replayRootRestrictions({...network,completeHour:false}).status,'partial');
 assert.equal(validRootEvidenceTarget({kind:'root-condition',predicate:'root-access',slotId:'hidden:day:갑',nodeId:'day:stem'}),true);
 assert.equal(validRootEvidenceTarget({kind:'root-condition',predicate:'root-access',slotId:'hidden:fake:갑',nodeId:'day:stem'}),false);
});
const intake={version:'p1-5b-intake-v1',candidates:[{id:'chart',pillars:['경술','무자','무자','병진'],source:{work:'synthetic review',commentator:'test',edition:'test',chapter:'test',passage:'test',url:'https://example.test'}}]};
const build=p=>buildLiteralStrengthInput(p).input;
test('actual chart review binds exact inventory and separates contact from net retention',()=>{
 const p=buildRootEvidencePacket(intake,build),digest='test-packet';
 const a=p.tasks.find(t=>t.target.predicate==='slot-retained'),contact=p.tasks.find(t=>t.target.predicate==='formation-impairment'||t.target.predicate==='clash-impairment');
 assert.ok(a&&contact);assert.ok(p.tasks.some(t=>t.target.predicate==='root-access'));
 const batch=(id,selected,basis='explicit-condition')=>{
  const q=claimReviewTemplate(p,digest);
  return {...q,reviewerId:id,noEngineOutputConsulted:true,noPriorLabelsConsulted:true,priorExposure:'none-declared',charts:q.charts.map(c=>({...c,scope:'ordinary',rationale:'synthetic test'})),
   responses:q.responses.map(r=>({...r,label:r.taskId===selected?'no':'undetermined',sourceLocator:'test',rationale:'synthetic test',evidenceBasis:r.taskId===selected?basis:'source-silent',sourceExcerpt:r.taskId===selected?'synthetic premise':''}))};
 };
 const x=reviewAndReplayRoots(intake,digest,[batch('A',contact.id),batch('B',contact.id)],build);
 assert.equal(x.status,'diagnostic-unverified-review',x.reason);assert.equal(x.summary.contactClaims,1);assert.equal(x.summary.netRestrictions,0);assert.equal(x.summary.narrowedTargets,0);
 const y=reviewAndReplayRoots(intake,digest,[batch('A',a.id),batch('B',a.id)],build);
 assert.equal(y.status,'diagnostic-unverified-review',y.reason);assert.deepEqual(y.rows[0].restrictions,[fixed(key('slot-retained',a.target.slotId),false)]);
 assert.equal(y.independentGoldCases,0);
 assert.equal(adjudicateClaims(p,digest,[batch('A',a.id),batch('B',a.id,'verdict-only')]).status,'invalid-review');
});
