import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { getSaju, analyzeClimateUsefulElement, analyzeClimateUsefulElementV2, CLIMATE_V2_VERSION,
 analyzeUsefulElementAuthority, USEFUL_ELEMENT_AUTHORITY_VERSION, analyzeUsefulElementTransit, USEFUL_ELEMENT_TRANSIT_VERSION,
 analyzeUsefulElementReview, getSeun } from '../src/index.js';
import { climateSourceRow } from '../src/features/climate-useful-element-v1/source.js';
import { climateSourceRowV2, CLIMATE_V2_COVERAGE } from '../src/features/climate-useful-element-v2/source.js';
import { describeAnchorRelations } from '../src/features/useful-element-authority-v1/evidence.js';
import { observeTransitEvidence, compareTransitAnchors } from '../src/features/useful-element-transit-v1/evidence.js';
import { chartFromReference } from '../scripts/strength-reference.mjs';
const read=p=>readFile(new URL('../docs/'+p+'.json',import.meta.url),'utf8').then(JSON.parse);
const chartInput=pillars=>({saju:chartFromReference(pillars),birthBasis:'verified-chart'});
const climate2=i=>analyzeClimateUsefulElementV2({...i,policy:CLIMATE_V2_VERSION});
const authority=i=>analyzeUsefulElementAuthority({...i,policy:USEFUL_ELEMENT_AUTHORITY_VERSION});
const transit=i=>analyzeUsefulElementTransit({...i,policy:USEFUL_ELEMENT_TRANSIT_VERSION});
test('expanded 38 source cells preserve 11 legacy profiles and conditional alternatives',()=>{
 const rows=[];
 for(const s of '갑을병정무기경신임계')for(const b of '자축인묘진사오미신유술해'){
  const a=climateSourceRow(s,b),v=climateSourceRowV2(s,b);
  if(v)rows.push(v);
  if(a)for(const k of Object.keys(a))assert.deepEqual(v[k],a[k]);
 }
 assert.equal(rows.length,38);assert.equal(CLIMATE_V2_COVERAGE,38);
 assert.equal(rows.reduce((n,r)=>n+r.alternatives.length,0),20);
 assert.ok(rows.every(r=>r.alternatives.every(x=>x.conditionResolved===false)));
 assert.deepEqual(climateSourceRowV2('무','해').groups,[['갑'],['병']]);
 assert.deepEqual(climateSourceRowV2('무','자').groups,[['병'],['갑']]);
 assert.deepEqual(climateSourceRowV2('갑','미').groups,[['정'],['경']]);
 assert.equal(climateSourceRowV2('기','자').sourceGranularity,'season');
 assert.equal(climateSourceRowV2('을','자'),null);
 const r=climateSourceRowV2('계','미');
 assert.ok(r.qualifiers.includes('half-month-dependent'));
 assert.ok(r.alternatives.some(x=>x.when==='early-half-weak-metal'));
 r.groups[0][0]='무';
 assert.deepEqual(climateSourceRowV2('계','미').groups,[['경','신']]);
});
test('100 historical charts replay expanded climate and withheld authority without changing existing review',async()=>{
 const [corpus,exp,old,expected]=await Promise.all(['strength-separated-decision-results','useful-element-expansion-results','climate-remedy-results','useful-element-authority-results'].map(read));
 const rows=[];
 for(const [i,c] of corpus.rows.entries()){
  const input=chartInput(c.pillars),before=JSON.stringify(input);
  const prior=analyzeClimateUsefulElement({...input,policy:'climate-useful-element-v1'});
  const next=climate2(input),p=next.evidence.sourceProfile;
  assert.deepEqual(prior.evidence.seasonal,next.evidence.seasonal,c.id);
  assert.deepEqual({id:c.id,legacyProfile:prior.evidence.sourceProfile!==null,expandedProfile:p?{
   dayStem:p.dayStem,monthBranch:p.monthBranch,groups:p.groups.map(g=>g.map(x=>x.stem)),alternatives:p.alternatives}:null},exp.rows[i],c.id);
  const s=prior.evidence.sourceProfile;
  assert.deepEqual(s?{dayStem:s.dayStem,monthBranch:s.monthBranch,groups:s.groups.map(g=>g.map(x=>x.stem))}:null,old.rows[i].source,c.id);
  const r=authority(input),a=r.authority;
  assert.equal(a.status,'withheld');assert.equal(a.selectionAuthority,false);
  assert.equal(r.review.methods.balance.strength.direction,c.fixed,c.id);
  for(const x of [r,a])for(const k of ['usefulElement','favorableElements','unfavorableElements'])assert.equal(x[k],null,c.id);
  assert.ok(a.methodScopes.every(x=>!x.selectionAuthority));
  assert.ok(a.branches.every(b=>b.selectedElement===null&&!b.confirmed&&b.hypotheses.every(h=>!h.selectionAuthority&&!h.confirmed&&h.relations.length===5&&h.relations.every(x=>x.favorable===null&&x.unfavorable===null))));
  rows.push({id:c.id,priorDirection:c.fixed,branches:a.branches.map(x=>({assumedDirection:x.assumedDirection,oppositeTendencyObserved:x.oppositeTendencyObserved,anchors:x.hypotheses.map(h=>({element:h.element,origins:h.origins})),reasons:x.reasons}))});
  assert.equal(JSON.stringify(input),before);
 }
 assert.deepEqual(rows,expected.rows);
 assert.equal(rows.flatMap(r=>r.branches).filter(b=>b.oppositeTendencyObserved).length,43);
});
test('legacy review remains unchanged by expanded authority',()=>{
 const i=chartInput(['壬辰','癸丑','辛丑','甲午']);
 const original=analyzeUsefulElementReview({...i,policy:'useful-element-review-v1'});
 const r=authority(i);
 assert.deepEqual(r.review.methods.balance,original.methods.balance);
 assert.deepEqual(r.review.methods.mediation,original.methods.mediation);
 assert.deepEqual(r.review.methods.remedy,original.methods.remedy);
 assert.equal(original.methods.climate.evidence.sourceCoverage.covered,11);
 assert.equal(r.review.methods.climate.evidence.sourceCoverage.covered,38);
 assert.deepEqual(analyzeUsefulElementReview({...i,policy:'useful-element-review-v1'}),original);
 assert.deepEqual(authority({...i,direction:'strong',usefulElement:'wood'}),r);
});
test('conditional anchor relations never infer favorable or unfavorable',()=>{
 const rows=describeAnchorRelations('wood');
 assert.deepEqual(Object.fromEntries(rows.map(r=>[r.element,r.relation])),{
 wood:'same-element',fire:'generated-by-anchor',earth:'controlled-by-anchor',metal:'controls-anchor',water:'generates-anchor'});
 assert.ok(rows.every(x=>x.favorable===null&&x.unfavorable===null));
 assert.throws(()=>describeAnchorRelations('invalid'),/invalid useful-element anchor/);
});
test('all 6000 synthetic transit pairs replay group and occurrence invariants',async()=>{
 const [corpus,expected]=await Promise.all(['strength-separated-decision-results','useful-element-expansion-results'].map(read));
 const stems='갑을병정무기경신임계',branches='자축인묘진사오미신유술해';
 const ganji=Array.from({length:60},(_,i)=>({stem:stems[i%10],branch:branches[i%12],text:stems[i%10]+branches[i%12]}));
 const counts={syntheticTransitPairs:0,pairObservations:0,groupObservations:0,newGroups:0,requiredBoth:0,anchorArrivalRelations:0};
 const a={branches:[{assumedDirection:'weak',hypotheses:[{element:'wood',origins:[{method:'seasonal-source',stem:'갑'}],relations:describeAnchorRelations('wood')}]}]};
 for(const c of corpus.rows){
  const {saju}=chartInput(c.pillars),before=JSON.stringify(saju);
  for(let i=0;i<60;i++){
   const r=observeTransitEvidence({saju,daeun:ganji[(i+13)%60],seun:ganji[i]});
   counts.syntheticTransitPairs++;counts.pairObservations+=r.pairs.length;
   assert.equal(r.pairs.length,9);assert.equal(r.layers.length,2);assert.equal(r.effectsConfirmed,false);
   for(const g of r.groups.combined){
    counts.groupObservations++;
    if(g.newMembership)counts.newGroups++;
    if(g.requiredTransitLayers.length===2)counts.requiredBoth++;
    assert.equal(new Set(g.occurrences.map(o=>o.branch)).size,3);
    assert.equal(g.effectsConfirmed,false);
    if(!g.newMembership)assert.deepEqual(g.requiredTransitLayers,[]);
   }
   const h=compareTransitAnchors(a,r)[0].hypotheses[0];
   for(const l of h.layers)for(const x of l.arrivals){
    counts.anchorArrivalRelations++;
    assert.ok(x.relationToAnchor);assert.equal(x.exactSourceStem,x.stem==='갑');
   }
   assert.equal(h.favorable,null);assert.equal(h.unfavorable,null);assert.equal(h.effectsConfirmed,false);
  }
  assert.equal(JSON.stringify(saju),before);
 }
 for(const k of Object.keys(counts))assert.equal(counts[k],expected.counts[k],k);
});
test('real calendar transit wrapper replays all 12 birth/direction/policy combinations',async()=>{
 const expected=await read('useful-element-transit-calendar-results');
 for(const row of expected.rows){
  const saju=getSaju(row.birth),input={saju,birth:row.birth,gender:row.gender,birthBasis:'verified-chart',
   daeunPolicy:row.policy,fromYear:row.birth.y,toYear:row.birth.y+25};
  const before=JSON.stringify(input),r=transit(input);
  assert.equal(r.status,'diagnostic');
  assert.equal(r.daeun.startAge,row.startAge);assert.equal(r.daeun.direction,row.direction);
  assert.equal(r.score,null);assert.equal(r.confirmed,false);
  assert.equal(r.timeBasis.exactDaeunTransitionResolved,false);
  const years=r.years.map(y=>{
   assert.deepEqual(y.seun,getSeun(y.year));assert.equal(y.score,null);assert.equal(y.confirmed,false);
   assert.ok(y.hypotheses.every(b=>!b.confirmed&&b.hypotheses.every(h=>h.favorable===null&&h.unfavorable===null&&!h.effectsConfirmed)));
   return {year:y.year,daeun:y.daeun?.text??null,seun:y.seun.pillar.text,pairCount:y.transit.pairs.length,
    newGroups:y.transit.groups.combined.filter(g=>g.newMembership).map(g=>({type:g.type,members:g.members,requiredTransitLayers:g.requiredTransitLayers}))};
  });
  assert.deepEqual(years,row.years);
  assert.equal(JSON.stringify(input),before);
 }
});
test('partial/provisional/birth mismatch and unsupported timing remain unavailable or reject',()=>{
 const birth={y:2000,m:2,d:9,hh:12,mm:0};
 const saju=getSaju(birth),i={saju,birth,birthBasis:'verified-chart',gender:'남',daeunPolicy:'movement-minute-v6',fromYear:2000,toYear:2025};
 const partial={...i,saju:{pillars:{...saju.pillars,hour:null}}};
 assert.equal(climate2(partial).status,'partial');
 assert.equal(authority(partial).authority.status,'partial');
 assert.deepEqual(authority(partial).authority.branches,[]);
 for(const [x,reason] of [[partial,'missing-hour'],[{...i,birthBasis:'provisional-chart'},'provisional-chart'],[{...i,birth:{...birth,hh:null}},'missing-exact-birth-time'],[{...i,birth:{...birth,period:{start:[11,0],end:[13,0]}}},'missing-exact-birth-time']]){
  const r=transit(x);assert.equal(r.status,'unavailable');assert.equal(r.reason,reason);assert.deepEqual(r.years,[]);assert.equal(r.score,null);
 }
 assert.throws(()=>transit({...i,birth:{...birth,d:10}}),{code:'saju-mismatch'});
 assert.throws(()=>transit({...i,birth:{...birth,calendar:'lunar'}}),{code:'transit-birth-calendar'});
 assert.throws(()=>transit({...i,daeunPolicy:'unknown'}),{code:'transit-daeun-policy'});
 assert.throws(()=>transit({...i,fromYear:1999}),{code:'year-range'});
 // 2000-02-09: both daeun policies cover 2007–2106. Calendar year
 // 2100 is supported; the calendar limit is independent of daeun coverage.
 const lastCalendarYear=transit({...i,fromYear:2100,toYear:2100});
 assert.equal(lastCalendarYear.status,'diagnostic');
 assert.equal(lastCalendarYear.years.length,1);
 assert.equal(lastCalendarYear.years[0].year,2100);
 assert.equal(lastCalendarYear.years[0].daeun.toYear,2106);
 assert.throws(()=>transit({...i,fromYear:2101,toYear:2101}),{code:'year-range'});
 assert.throws(()=>analyzeUsefulElementAuthority({...i,policy:'unknown'}),{code:'useful-element-policy'});
});

test('transit accepts the last daeun band year and rejects the first uncovered year for both policies',()=>{
 const birth={y:1980,m:2,d:9,hh:12,mm:0};
 const saju=getSaju(birth);
 // Both policies give startAge=8, ten inclusive bands, 1987–2086.
 // The year after the last band is still inside the annual calendar range.
 for(const daeunPolicy of ['legacy-day-v1','movement-minute-v6']){
  const input={saju,birth,birthBasis:'verified-chart',gender:'남',daeunPolicy,fromYear:2086,toYear:2086};
  const result=transit(input);
  assert.equal(result.status,'diagnostic',daeunPolicy);
  assert.equal(result.daeun.startAge,8,daeunPolicy);
  assert.equal(result.daeun.pillars.length,10,daeunPolicy);
  assert.equal(result.daeun.pillars.at(-1).toYear,2086,daeunPolicy);
  assert.equal(result.years.length,1,daeunPolicy);
  assert.equal(result.years[0].year,2086,daeunPolicy);
  assert.deepEqual(result.years[0].daeun,result.daeun.pillars.at(-1),daeunPolicy);
  assert.throws(()=>transit({...input,toYear:2087}),{code:'daeun-range'});
  assert.throws(()=>transit({...input,fromYear:2087,toYear:2087}),{code:'daeun-range'});
 }
});
