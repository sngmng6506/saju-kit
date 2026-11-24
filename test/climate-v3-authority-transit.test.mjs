import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {getSaju,analyzeClimateUsefulElementV2,analyzeClimateUsefulElementV3,CLIMATE_V3_VERSION,
 analyzeUsefulElementAuthorityV2,USEFUL_ELEMENT_AUTHORITY_V2_VERSION,analyzeUsefulElementTransit,analyzeUsefulElementTransitV2,USEFUL_ELEMENT_TRANSIT_V2_VERSION,stemInfo} from '../src/index.js';
import {climateSourceRowV2} from '../src/features/climate-useful-element-v2/source.js';
import {climateSourceRowV3,CLIMATE_V3_COVERAGE} from '../src/features/climate-useful-element-v3/source.js';
import {observeConditionalArrivals} from '../src/features/useful-element-transit-v2/index.js';
import {observeTransitEvidence} from '../src/features/useful-element-transit-v1/evidence.js';
import {chartFromReference} from '../scripts/strength-reference.mjs';
const read=n=>readFile(new URL('../docs/'+n+'.json',import.meta.url),'utf8').then(JSON.parse);
const stems='갑을병정무기경신임계',branches='자축인묘진사오미신유술해';
const climate=i=>analyzeClimateUsefulElementV3({...i,policy:CLIMATE_V3_VERSION});
const authority=i=>analyzeUsefulElementAuthorityV2({...i,policy:USEFUL_ELEMENT_AUTHORITY_V2_VERSION});
const transit=i=>analyzeUsefulElementTransitV2({...i,policy:USEFUL_ELEMENT_TRANSIT_V2_VERSION});
test('63 explicit profiles, legacy source parity, and no unconditional groups in conditional-only cells',()=>{
 let old=0,cells=0,conditional=0,alternatives=0;
 for(const s of stems)for(const b of branches){
  const a=climateSourceRowV2(s,b),r=climateSourceRowV3(s,b);
  if(a){old++;assert.deepEqual(r,a);}
  if(r){cells++;alternatives+=r.alternatives.length;if(!r.groups.length)conditional++;
   assert.ok(r.alternatives.every(x=>x.conditionResolved===false));}
 }
 assert.equal(CLIMATE_V3_COVERAGE,63);assert.equal(cells,63);assert.equal(old,38);assert.equal(conditional,4);assert.equal(alternatives,32);
 assert.deepEqual(climateSourceRowV3('을','오').groups,[]);
 assert.deepEqual(climateSourceRowV3('을','유').alternatives.map(a=>a.groups),[[['계']],[['병'],['계']]]);
 const r=climateSourceRowV3('을','유');r.alternatives[0].groups[0][0]='무';
 assert.deepEqual(climateSourceRowV3('을','유').alternatives[0].groups,[['계']]);
 assert.equal(climateSourceRowV3('을','축'),null);
});
test('100 historical charts retain v2 observations and replay v3 source coverage',async()=>{
 const [corpus,expected]=await Promise.all([read('strength-separated-decision-results'),read('climate-v3-results')]);
 const rows=corpus.rows.map(c=>{
  const saju=chartFromReference(c.pillars),before=JSON.stringify(saju),i={saju,birthBasis:'verified-chart'};
  const a=analyzeClimateUsefulElementV2({...i,policy:'climate-useful-element-v2'}),r=climate(i),p=r.evidence.sourceProfile;
  assert.deepEqual(a.evidence.seasonal,r.evidence.seasonal,c.id);
  if(a.evidence.sourceProfile)assert.deepEqual({...p,alternatives:p.alternatives.map(({evidence,...rest})=>rest)},a.evidence.sourceProfile,c.id);
  for(const alt of p?.alternatives??[]){assert.equal(alt.conditionResolved,false);assert.deepEqual(alt.evidence.map(e=>e.stem),alt.stems);}
  assert.equal(r.usefulElement,null);assert.equal(r.confirmed,false);assert.equal(JSON.stringify(saju),before);
  return {id:c.id,priorProfile:!!a.evidence.sourceProfile,profile:p?{dayStem:p.dayStem,monthBranch:p.monthBranch,groups:p.groups.map(g=>g.map(x=>x.stem)),
   alternatives:p.alternatives.map(x=>({when:x.when,stems:x.stems,conditionResolved:x.conditionResolved,visible:x.evidence.map(e=>e.exactVisible.length),hidden:x.evidence.map(e=>e.exactHidden.length)}))}:null,temporal:r.temporal.status};
 });
 assert.deepEqual(rows,expected.rows);
});
test('actual solstice and equinox boundaries reproduce time predicates without selecting a useful element',async()=>{
 const data=await read('climate-v3-term-results');
 for(const row of data.boundaries)for(const x of row.checks){
  const i={saju:getSaju(x.birth),birth:x.birth,birthBasis:'verified-chart'},r=climate(i);
  assert.deepEqual(r.temporal,x.temporal);
  assert.deepEqual(r.evidence.sourceProfile.groups,[]);
  assert.ok(r.evidence.sourceProfile.alternatives.every(a=>!a.conditionResolved));
  assert.equal(r.usefulElement,null);assert.equal(r.confirmed,false);
 }
 const birth=data.boundaries[0].checks[0].birth,saju=getSaju(birth),i={saju,birthBasis:'verified-chart'};
 assert.equal(climate(i).temporal.reason,'missing-birth-instant');
 assert.equal(climate({...i,birth:{...birth,period:{}}}).temporal.reason,'birth-period');
 assert.equal(climate({...i,birth,saju:{pillars:{...saju.pillars,hour:null}}}).temporal.reason,'missing-hour');
 assert.throws(()=>climate({...i,birth:{...birth,d:birth.d+1}}),{code:'month-command-chart-mismatch'});
 assert.equal(climate({...i,birthBasis:'provisional-chart'}).status,'unavailable');
});
test('authority v2 retains conditional alternatives without issuing selection or unconditional anchors',async()=>{
 const data=await read('climate-v3-term-results'),birth=data.boundaries[0].checks[0].birth;
 const i={saju:getSaju(birth),birth,birthBasis:'verified-chart'};
 const r=authority(i);
 assert.equal(r.authority.status,'withheld');assert.equal(r.authority.selectionAuthority,false);
 assert.equal(r.usefulElement,null);assert.equal(r.favorableElements,null);assert.equal(r.unfavorableElements,null);
 assert.ok(r.conditionalSourceAlternatives.some(a=>a.calendarPredicate?.matched===true));
 assert.ok(r.conditionalSourceAlternatives.every(a=>!a.conditionResolved&&!a.confirmed&&!a.selectionAuthority));
 assert.ok(r.authority.branches.every(b=>b.hypotheses.every(h=>h.origins.every(o=>o.method!=='seasonal-source'))));
 assert.deepEqual(authority({...i,usefulElement:'wood',direction:'strong'}),r);
});
test('all conditional source stems preserve exact and other-polarity arrivals',async()=>{
 const expected=(await read('climate-v3-conditional-arrivals-results')).counts;
 const ganji=Array.from({length:60},(_,i)=>({stem:stems[i%10],branch:branches[i%12],text:stems[i%10]+branches[i%12]}));
 const saju={pillars:{year:ganji[0],month:ganji[2],day:ganji[1],hour:ganji[3]}};
 const counts={cells:0,alternatives:0,transitPairs:0,layerObservations:0,stemRequirementChecks:0,exactOccurrences:0,sameElementOtherStemOccurrences:0,absentOccurrences:0};
 for(const s of stems)for(const b of branches){
  const row=climateSourceRowV3(s,b);if(!row?.alternatives.length)continue;
  counts.cells++;counts.alternatives+=row.alternatives.length;
  const alternatives=row.alternatives.map(a=>({...a,calendarPredicate:null}));
  for(let i=0;i<60;i++){
   counts.transitPairs++;
   const t=observeTransitEvidence({saju,daeun:ganji[(i+13)%60],seun:ganji[i]}),before=JSON.stringify(t);
   const rows=observeConditionalArrivals(alternatives,t.layers);
   assert.equal(rows.length,alternatives.length);
   for(const a of rows){
    assert.equal(a.conditionResolved,false);assert.equal(a.confirmed,false);assert.equal(a.calendarPredicate,null);
    for(const l of a.layers){counts.layerObservations++;
     for(const q of l.requirements){
      counts.stemRequirementChecks++;
      const orig=t.layers.find(x=>x.id===l.id),arr=[orig.stem,...orig.branch.hiddenStems];
      assert.equal(q.exact.length,arr.filter(x=>x.stem===q.stem).length);
      assert.equal(q.sameElementOtherStem.length,arr.filter(x=>x.element===stemInfo(q.stem).element&&x.stem!==q.stem).length);
      counts.exactOccurrences+=q.exact.length;counts.sameElementOtherStemOccurrences+=q.sameElementOtherStem.length;
      if(!q.exact.length&&!q.sameElementOtherStem.length)counts.absentOccurrences++;
     }
    }
   }
   assert.equal(JSON.stringify(t),before);
  }
 }
 assert.deepEqual(counts,expected);
});
test('new transit policy preserves calendar and structural signals from v1, keeps conditional arrivals separate',async()=>{
 const data=await read('climate-v3-term-results');
 const birth=data.boundaries[1].checks[2].birth,saju=getSaju(birth);
 for(const daeunPolicy of ['legacy-day-v1','movement-minute-v6']){
  const i={saju,birth,birthBasis:'verified-chart',gender:'여',daeunPolicy,fromYear:birth.y,toYear:birth.y+12};
  const before=JSON.stringify(i),a=analyzeUsefulElementTransit({...i,policy:'useful-element-transit-v1'}),r=transit(i);
  assert.equal(r.status,'diagnostic');assert.deepEqual(r.daeun,a.daeun);
  assert.equal(r.usefulElement,null);assert.equal(r.score,null);assert.equal(r.confirmed,false);
  for(const [j,y] of r.years.entries()){
   assert.deepEqual(y.seun,a.years[j].seun);assert.deepEqual(y.daeun,a.years[j].daeun);assert.deepEqual(y.transit,a.years[j].transit);
   assert.ok(y.conditionalSourceArrivals.length>0);
   assert.ok(y.conditionalSourceArrivals.every(x=>!x.conditionResolved&&!x.confirmed));
   assert.equal(y.score,null);
  }
  assert.equal(JSON.stringify(i),before);
  assert.equal(transit({...i,birthBasis:'provisional-chart'}).status,'unavailable');
 }
});
