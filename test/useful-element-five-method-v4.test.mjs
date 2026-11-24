import test from 'node:test';
import assert from 'node:assert/strict';
import {getSaju,analyzeUsefulElementAuthorityV3,analyzeUsefulElementAuthorityV4,USEFUL_ELEMENT_AUTHORITY_V4_VERSION,
 analyzeUsefulElementTransitV3,analyzeUsefulElementTransitV4,USEFUL_ELEMENT_TRANSIT_V4_VERSION,analyzePatternUsefulElementV3,PATTERN_V3_VERSION} from '../src/index.js';
import {collectPatternRoles,observePatternTransit} from '../src/features/useful-element-transit-v4/pattern-arrivals.js';
import {compareFiveMethods} from '../src/features/useful-element-authority-v4/matrix.js';
import {observeTransitEvidence} from '../src/features/useful-element-transit-v1/evidence.js';
const pattern={"status":"diagnostic","selection":{"candidates":[{"id":"principal:신","kind":"month-principal","stems":["신"]}]},"routeReview":{"occurrences":[{"id":"hidden:month:신","position":"month","layer":"hidden","stem":"신","element":"metal"},{"id":"visible:month","position":"month","layer":"visible","stem":"을","element":"wood","roots":[{"position":"year"}]}],"reviews":[{"candidateId":"principal:신","anchorIds":["hidden:month:신"]}]},"qualityReview":{"reviews":[{"candidateId":"principal:신","routes":[{"routeId":"combine-killing-preserve-officer","assistantIds":["visible:month"]}]}]}};
const prior={"review":{"methods":{"balance":{"status":"conditional-branches","branches":[{"assumedDirection":"strong","candidates":[{"element":"metal"}]},{"assumedDirection":"weak","candidates":[{"element":"wood"}]}]},"mediation":{"status":"diagnostic","pairs":[{"from":"fire","to":"metal","via":"earth","nominalConfrontation":{"robustTopTwo":true}}]},"remedy":{"status":"diagnostic","motifs":[{"remedyElement":"water","targetContext":{"dayReference":true},"remedies":[{}]}]}}},"sourceReview":{"climate":{"status":"diagnostic"},"candidates":[{"id":"baseline:0","kind":"baseline-group","stems":["병"]},{"id":"alternative:0","kind":"conditional-alternative","stems":["정"]}]}};
test('five-method matrix separates roles and never grants selection authority',()=>{
 const before=JSON.stringify([prior,pattern]),r=compareFiveMethods(prior,pattern);
 assert.equal(r.methods.length,5);assert.equal(r.elements.length,5);
 assert.equal(r.comparisons.length,2);
 assert.equal(r.elements.find(e=>e.element==='metal').patternAnchors.length,1);
 assert.ok(r.comparisons[0].patternAssistants.outsideBalanceCandidates.includes('wood'));
 assert.ok(!r.comparisons[0].patternAssistants.overlap.includes('metal'));
 assert.equal(r.decision.usefulElement,null);assert.equal(r.decision.selectionAuthority,false);
 assert.equal(JSON.stringify([prior,pattern]),before);
});
const birth={y:2000,m:6,d:15,hh:12,mm:0},saju=getSaju(birth),i={saju,birth,birthBasis:'verified-chart'};
test('authority v4 retains v3 anchor namespace and adds isolated pattern review',()=>{
 const a=analyzeUsefulElementAuthorityV3({...i,policy:'useful-element-authority-v3'});
 const b=analyzeUsefulElementAuthorityV4({...i,policy:USEFUL_ELEMENT_AUTHORITY_V4_VERSION});
 const {version,patternReview,fiveMethodReview,...rest}=b;
 assert.deepEqual(rest,(({version,...r})=>r)(a));
 assert.equal(patternReview.version,PATTERN_V3_VERSION);
 assert.equal(fiveMethodReview.decision.selectionAuthority,false);
 assert.equal(b.usefulElement,null);
 const c=analyzeUsefulElementAuthorityV4({...i,birthBasis:'provisional-chart',policy:USEFUL_ELEMENT_AUTHORITY_V4_VERSION});
 assert.equal(c.fiveMethodReview.decision.status,'unavailable');
});
test('pattern role contacts maintain exact identity without scoring',()=>{
 const roles=collectPatternRoles(pattern),pillar=text=>({stem:text[0],branch:text[1],text});
 const saju={pillars:{year:pillar('경인'),month:pillar('을유'),day:pillar('갑자'),hour:pillar('무진')}};
 const stems='갑을병정무기경신임계',branches='자축인묘진사오미신유술해',p=i=>pillar(stems[i%10]+branches[i%12]);
 let checks=0,contacts=0;
 for(let j=0;j<60;j++)for(const dual of [false,true]){
  const t=observeTransitEvidence({saju,daeun:dual?p((j+13)%60):null,seun:p(j)}),before=JSON.stringify(t);
  for(const row of observePatternTransit(roles,t))for(const l of row.layers){
   const role=roles.find(r=>r.occurrenceId===row.occurrenceId);
   assert.ok(l.arrivals.every(a=>a.exact===(a.stem===role.stem)&&a.sameElementOtherStem===(a.element===role.element&&a.stem!==role.stem)));
   assert.ok(l.rootContacts.every(c=>role.rootPositions.includes(c.position)));
   assert.ok(l.stemCombinationContacts.every(c=>role.layer==='visible'&&c.position===role.position));
   assert.equal(l.favorable,null);assert.equal(l.unfavorable,null);assert.equal(row.confirmed,false);
   checks++;contacts+=l.rootContacts.length+l.stemCombinationContacts.length;
  }
  assert.equal(JSON.stringify(t),before);
 }
 assert.equal(checks,360);assert.equal(contacts,273);
});
test('transit v4 preserves annual calendar and v3 evidence',()=>{
 const args={...i,gender:'여',fromYear:2000,toYear:2012,daeunPolicy:'legacy-day-v1'};
 const a=analyzeUsefulElementTransitV3({...args,policy:'useful-element-transit-v3'});
 const b=analyzeUsefulElementTransitV4({...args,policy:USEFUL_ELEMENT_TRANSIT_V4_VERSION});
 assert.deepEqual(b.daeun,a.daeun);
 for(const [j,y] of b.years.entries()){
  const {patternArrivals,...rest}=y;
  assert.deepEqual(rest,a.years[j]);
  assert.equal(patternArrivals.length,b.patternRoles.length);
 }
 assert.equal(b.score,null);assert.equal(b.confirmed,false);
 const c=analyzeUsefulElementTransitV4({...args,birthBasis:'provisional-chart',policy:USEFUL_ELEMENT_TRANSIT_V4_VERSION});
 assert.equal(c.status,'unavailable');assert.deepEqual(c.patternRoles,[]);
});
