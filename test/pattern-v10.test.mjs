import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeStemForceEvidence,observeRelativeForce,analyzePatternUsefulElementV9,analyzePatternUsefulElementV10,PATTERN_V10_VERSION} from '../src/index.js';
import {compareForceProfiles} from '../src/core/relative-force.js';
const pillar=text=>({stem:text[0],branch:text[1],text});
const chart=ps=>({pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,ps[i]?pillar(ps[i]):null]))});
test('partial order does not convert mixed evidence into a magnitude',()=>{
 const a={axes:{root:true,season:false},rootPositions:['month'],localGenerationNodes:[],localPeerNodes:[]},b={...a,axes:{root:false,season:true}};
 assert.equal(compareForceProfiles(a,b).relation,'mixed-evidence');
 assert.equal(compareForceProfiles(a,{...b,axes:{root:false,season:false}}).relation,'left-evidence-dominates');
 assert.equal(compareForceProfiles(a,a).relation,'same-evidence-profile');
 assert.equal(compareForceProfiles(a,b,{completeHour:false}).relation,'unresolved');
 assert.equal(compareForceProfiles(a,b).forceComparison,null);
});
test('food, killing and day are separate actual participants, not a binary success',()=>{
 const r=observeRelativeForce(analyzeStemForceEvidence({saju:chart(['신유','을유','을묘','정사'])}));
 assert.equal(r.triads.length,1);
 const t=r.triads[0],ids=new Set(r.edges.map(e=>e.id));
 assert.equal(t.food,'visible:hour');assert.equal(t.killing,'visible:year');assert.equal(t.day,'visible:day');
 for(const id of [t.controlEdge,t.dayPressureEdge,t.dayOutputEdge])assert.ok(ids.has(id));
 assert.equal(t.effectiveControl,null);assert.equal(t.dayCapacityConfirmed,null);
});
test('v10 retains all v9 data and marks missing hour unresolved',()=>{
 const saju=chart(['경인','을유','갑자',null]),input={saju,birthBasis:'verified-chart'},a=analyzePatternUsefulElementV9({...input,policy:'pattern-useful-element-v9'}),b=analyzePatternUsefulElementV10({...input,policy:PATTERN_V10_VERSION});
 const {relativeForce,relativePattern,version,...rest}=b;assert.deepEqual(rest,(({version,...r})=>r)(a));
 assert.ok(relativeForce.edges.every(e=>e.screen==='unresolved'&&e.effective===null));assert.equal(relativePattern.selectionAuthority,false);
 assert.equal(b.selectedPattern,null);
 assert.equal(analyzePatternUsefulElementV10({...input,birthBasis:'provisional-chart',policy:PATTERN_V10_VERSION}).relativeForce,null);
});
test('local mediation checks the mediator itself, not the threatening source',()=>{
 const force=analyzeStemForceEvidence({saju:chart(['신유','을유','을묘','정사'])});
 const r=observeRelativeForce(force),byId=new Map(force.occurrences.map(o=>[o.id,o]));
 for(const e of r.edges)for(const p of e.possibleLocalProtection){
  assert.ok(byId.get(e.from).protectionAndMediation.some(w=>w.helper===p.helper&&w.threat===p.threat&&w.edges.some(l=>l.from===p.helper&&l.sourceEvidence.unexposedSubstantialRootPositions.length>0&&l.sourceEvidence.contacts.length===0)));
  assert.ok(e.sourceLocalControlNodes.includes(p.threat));
 }
});
