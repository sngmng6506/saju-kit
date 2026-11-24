import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {analyzeClimateUsefulElement,CLIMATE_USEFUL_ELEMENT_VERSION,
 analyzeMediationUsefulElement,MEDIATION_USEFUL_ELEMENT_VERSION,
 analyzeRemedyEvidence,REMEDY_EVIDENCE_VERSION,analyzeUsefulElementReview,USEFUL_ELEMENT_REVIEW_VERSION,
 analyzeBalanceUsefulElement,elementRelation} from '../src/index.js';
import {climateSourceRow,CLIMATE_SOURCE_COVERAGE} from '../src/features/climate-useful-element-v1/source.js';
import {chartFromReference} from '../scripts/strength-reference.mjs';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8').then(JSON.parse);
const input=pillars=>({saju:chartFromReference(pillars),birthBasis:'verified-chart'});
const compactPair=p=>({from:p.from,to:p.to,via:p.via,controlCount:p.controlCount,localControlCount:p.localControlCount,
 routeCount:p.routeCount,adjacentAnchored:p.adjacentAnchored,adjacentIntact:p.adjacentIntact,oneGapAnchored:p.oneGapAnchored,
 absentMediator:p.absentMediator,reviewStatus:p.reviewStatus,nominalConfrontation:p.nominalConfrontation});
const relation=(a,b,type)=>{const r=elementRelation(a,b);return r.type===type&&r.direction==='left-to-right';};
const slot=n=>n.position+':'+n.layer;
test('source coverage is explicit, no default filling or cross-polarity substitution',()=>{
 const rows=[];
 for(const stem of '갑을병정무기경신임계')for(const branch of '자축인묘진사오미신유술해'){
  const r=climateSourceRow(stem,branch);
  if(r)rows.push(r);
 }
 assert.equal(rows.length,11);assert.equal(CLIMATE_SOURCE_COVERAGE,11);
 assert.deepEqual(climateSourceRow('신','축').groups,[['병'],['임'],['무','기']]);
 assert.deepEqual(climateSourceRow('경','오').groups,[['임'],['계']]);
 assert.deepEqual(climateSourceRow('경','미').groups,[['정'],['갑']]);
 assert.equal(climateSourceRow('임','해'),null);
 const r=climateSourceRow('갑','자');r.groups[0][0]='무';
 assert.deepEqual(climateSourceRow('갑','자').groups,[['정'],['경'],['병']]);
});
test('all 100 live integrated charts reproduce recorded climate, remedy, mediation and prior balance',async()=>{
 const [corpus,cl,me,integrated]=await Promise.all([
  read('docs/strength-separated-decision-results.json'),read('docs/climate-remedy-results.json'),
  read('docs/mediation-useful-element-results.json'),read('docs/useful-element-review-results.json')
 ]);
 for(const [i,c] of corpus.rows.entries()){
  const args=input(c.pillars),before=JSON.stringify(args);
  const r=analyzeUsefulElementReview({...args,policy:USEFUL_ELEMENT_REVIEW_VERSION});
  assert.equal(r.methods.balance.strength.direction,c.fixed,c.id);
  assert.equal(r.confirmed,false);
  for(const k of ['usefulElement','favorableElements','unfavorableElements','ranking'])assert.equal(r[k],null);
  const e=r.methods.climate.evidence,s=e.sourceProfile,motifs=r.methods.remedy.motifs,pairs=r.methods.mediation.pairs;
  assert.deepEqual({id:c.id,priorDirection:c.fixed,seasonal:e.seasonal.candidate?.element??null,
   source:s?{dayStem:s.dayStem,monthBranch:s.monthBranch,groups:s.groups.map(g=>g.map(x=>x.stem))}:null,
   remedyMotifs:motifs.length,remedyPaths:motifs.reduce((a,m)=>a+m.remedies.length,0),
   adjacentRemedyPaths:motifs.reduce((a,m)=>a+m.remedies.filter(x=>x.adjacent).length,0)},cl.rows[i],c.id);
  assert.deepEqual({id:c.id,priorDirection:c.fixed,pairCount:pairs.length,routeCount:pairs.reduce((a,p)=>a+p.routeCount,0),
   robustPairs:pairs.filter(p=>p.nominalConfrontation.robustTopTwo).map(compactPair)},me.rows[i],c.id);
  assert.deepEqual({id:c.id,priorDirection:c.fixed,comparisons:r.comparisons.map(x=>({assumedDirection:x.assumedDirection,...x.comparisons}))},integrated.rows[i],c.id);
  assert.ok(r.comparisons.every(x=>x.selectedElement===null&&!x.confirmed&&x.elements.length===5));
  for(const p of pairs){
   assert.ok(relation(p.from,p.to,'control')&&relation(p.from,p.via,'generate')&&relation(p.via,p.to,'generate'));
   assert.equal(p.nominalConfrontation.equalityResolved,false);
   assert.equal(p.confirmed,false);
   assert.equal(new Set(p.routes.map(x=>x.id)).size,p.routes.length);
   assert.ok(p.routes.every(x=>new Set(x.nodes.map(slot)).size===3&&!x.confirmed));
  }
  for(const m of motifs){
   assert.equal(m.diseaseConfirmed,false);assert.equal(m.remedyConfirmed,false);
   assert.ok(m.remedies.every(x=>new Set([x.remedy,m.threat,m.target].map(slot)).size===3&&relation(x.remedy.element,m.threat.element,'control')));
  }
  assert.equal(JSON.stringify(args),before);
 }
});
test('six explicit method examples and two blocked controls remain separate',async()=>{
 const [fixture,cl,me]=await Promise.all([read('test/fixtures/useful-element-method-controls-v1.json'),
  read('docs/climate-remedy-results.json'),read('docs/mediation-useful-element-results.json')]);
 const actual=fixture.cases.filter(c=>c.method!=='mediation').map(c=>{
  const args=input(c.pillars);
  if(c.method==='climate'){
   const r=analyzeClimateUsefulElement({...args,policy:CLIMATE_USEFUL_ELEMENT_VERSION});
   return {id:c.id,referenceElement:c.referenceElement,seasonal:r.evidence.seasonal.candidate,sourceProfile:r.evidence.sourceProfile};
  }
  const r=analyzeRemedyEvidence({...args,policy:REMEDY_EVIDENCE_VERSION});
  const m=r.motifs.filter(m=>m.target.element===c.target&&m.threat.element===c.threat&&m.remedyElement===c.referenceElement);
  return {id:c.id,target:c.target,threat:c.threat,referenceElement:c.referenceElement,motifs:m.length,
   paths:m.reduce((a,m)=>a+m.remedies.length,0),adjacentPaths:m.reduce((a,m)=>a+m.remedies.filter(r=>r.adjacent).length,0),
   contextualPaths:m.filter(m=>m.targetContext.monthPrincipal||m.targetContext.receivesMonthGeneration).reduce((a,m)=>a+m.remedies.length,0)};
 });
 assert.deepEqual(actual,cl.controls);
 // 午 contains literal 丙 residual under the library convention; this is not
 // the same as a visible 丙 or the principal 丁.
 assert.deepEqual(actual[0].sourceProfile.groups[0][0].exactVisible,[]);
 assert.deepEqual(actual[0].sourceProfile.groups[0][0].exactHidden,[{position:'hour',role:'residual',clashExposed:false}]);
 assert.equal(actual[1].sourceProfile,null);
 const controls=[...fixture.cases.filter(c=>c.method==='mediation'),...fixture.negativeControls].map(c=>{
  const r=analyzeMediationUsefulElement({...input(c.pillars),policy:MEDIATION_USEFUL_ELEMENT_VERSION});
  const p=r.pairs.find(p=>p.from===c.from&&p.to===c.to);
  assert.equal(p.via,c.referenceElement);assert.equal(p.confirmed,false);
  return {id:c.id,referenceElement:c.referenceElement,reference:c.reference??'mediation-in-natal',pair:compactPair(p),
   obstructedRoutes:p.routes.filter(r=>r.obstructions.some(o=>o.local)).length};
 });
 assert.deepEqual(controls,me.controls);
 assert.equal(controls[0].pair.nominalConfrontation.robustTopTwo,false);
 assert.equal(controls[1].pair.nominalConfrontation.robustTopTwo,true);
 assert.ok(controls.slice(2).every(c=>c.obstructedRoutes===c.pair.routeCount&&c.pair.routeCount>0));
 // Explicit winter-earth warmth in the disease/remedy example is outside
 // the limited broad climate cue; lack of cue is NOT a negative judgment.
 const dr=fixture.cases.find(c=>c.id==='DR-X01');
 const climate=analyzeClimateUsefulElement({...input(dr.pillars),policy:CLIMATE_USEFUL_ELEMENT_VERSION});
 assert.equal(climate.evidence.seasonal.need,null);assert.equal(climate.evidence.sourceProfile,null);
});
test('partial and provisional inputs retain boundaries and cannot be ranked',()=>{
 const i=input(['壬辰','癸丑','辛丑','甲午']);
 const args={...i,policy:USEFUL_ELEMENT_REVIEW_VERSION};
 const partial=analyzeUsefulElementReview({...args,saju:{pillars:{...i.saju.pillars,hour:null}}});
 assert.equal(partial.status,'partial');assert.deepEqual(partial.comparisons,[]);
 assert.equal(partial.methods.balance.status,'unavailable');
 assert.equal(partial.methods.climate.status,'partial');
 assert.equal(partial.methods.mediation.status,'partial');
 assert.ok(partial.methods.mediation.pairs.every(p=>!Object.hasOwn(p,'nominalConfrontation')));
 const provisional=analyzeUsefulElementReview({...args,birthBasis:'provisional-chart'});
 assert.equal(provisional.status,'unavailable');assert.deepEqual(provisional.comparisons,[]);
 assert.ok(Object.values(provisional.methods).every(x=>x.status==='unavailable'));
 for(const r of [partial,provisional])assert.equal(r.usefulElement,null);
 assert.throws(()=>analyzeUsefulElementReview({...args,policy:'unknown'}),{code:'useful-element-policy'});
 assert.throws(()=>analyzeUsefulElementReview({...args,birthBasis:'unknown'}),{code:'strength-birth-basis'});
 const full=analyzeUsefulElementReview({...args,usefulElement:'wood',direction:'strong'});
 assert.deepEqual(full,analyzeUsefulElementReview(args));
 assert.deepEqual(full.methods.balance,analyzeBalanceUsefulElement({...i,policy:'balance-useful-element-v1'}));
});
