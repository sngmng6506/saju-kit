import test from 'node:test';
import assert from 'node:assert/strict';
import {getSaju,solarTermInstant,analyzeClimateUsefulElementV3,analyzeClimateUsefulElementV4,CLIMATE_V4_VERSION} from '../src/index.js';
import {climateSourceRowV3} from '../src/features/climate-useful-element-v3/source.js';
import {climateSourceRowV4,CLIMATE_V4_COVERAGE} from '../src/features/climate-useful-element-v4/source.js';
import {observeSourceConditions} from '../src/features/climate-useful-element-v4/conditions.js';
test('v4 covers all keys without altering v3 source rows',()=>{
 let previous=0,conditional=0,alternatives=0;
 for(const stem of '갑을병정무기경신임계')for(const branch of '자축인묘진사오미신유술해'){
  const old=climateSourceRowV3(stem,branch),row=climateSourceRowV4(stem,branch);
  assert.ok(row);if(old){previous++;assert.deepEqual(row,old);}
  if(!row.groups.length)conditional++;
  alternatives+=row.alternatives.length;
  assert.ok(row.alternatives.every(a=>a.conditionResolved===false));
 }
 assert.equal(CLIMATE_V4_COVERAGE,120);assert.equal(previous,63);
 assert.equal(conditional,10);assert.equal(alternatives,125);
 assert.equal(climateSourceRowV4('을','축').sourceGranularity,'season');
 assert.deepEqual(climateSourceRowV4('을','축').groups,[]);
 assert.deepEqual(climateSourceRowV4('임','미').groups,[]);
 const row=climateSourceRowV4('정','묘');row.groups[0][0]='계';
 assert.equal(climateSourceRowV4('정','묘').groups[0][0],'경');
});
test('literal source conditions are three-valued and never grant authority',()=>{
 const profile={alternatives:[{when:'ren-absent'},{when:'jia-absent'},{when:'unknown'}]};
 const structure={completeHour:true,profiles:[{visible:[{stem:'임',position:'year'}],roots:[]}]};
 const evalFor=s=>observeSourceConditions(profile,s);
 assert.deepEqual(evalFor(structure).map(x=>x.matched),[false,true,null]);
 assert.deepEqual(evalFor({...structure,completeHour:false}).map(x=>x.matched),[false,null,null]);
 assert.deepEqual(evalFor({completeHour:false,profiles:[{visible:[],roots:[{position:'month',matches:[{stem:'갑',role:'principal'}]}]}]}).map(x=>x.matched),[null,false,null]);
 assert.ok(evalFor(structure).every(x=>!x.conditionResolved&&!x.selectionAuthority));
});
test('v4 chart review preserves prior profiles and withholds selection',()=>{
 const birth={y:2000,m:6,d:15,hh:12,mm:0},saju=getSaju(birth);
 const args={saju,birth,birthBasis:'verified-chart'};
 const old=analyzeClimateUsefulElementV3({...args,policy:'climate-useful-element-v3'});
 const result=analyzeClimateUsefulElementV4({...args,policy:CLIMATE_V4_VERSION});
 assert.deepEqual(result.evidence.seasonal,old.evidence.seasonal);
 if(old.evidence.sourceProfile)assert.deepEqual(result.evidence.sourceProfile,old.evidence.sourceProfile);
 assert.equal(result.evidence.sourceCoverage.covered,120);assert.equal(result.usefulElement,null);assert.equal(result.confirmed,false);
 assert.equal(analyzeClimateUsefulElementV4({...args,birthBasis:'provisional-chart',policy:CLIMATE_V4_VERSION}).status,'unavailable');
 assert.throws(()=>analyzeClimateUsefulElementV4({...args,policy:'climate-useful-element-v3'}));
});
test('grain rain boundary preserves uncertainty',()=>{
 const dateAt=(t,delta)=>{const d=new Date(Date.UTC(t.y,t.m-1,t.d,t.hh,t.mm)+delta*60000);return {y:d.getUTCFullYear(),m:d.getUTCMonth()+1,d:d.getUTCDate(),hh:d.getUTCHours(),mm:d.getUTCMinutes()};};
 let checked=0;
 for(let y=2000;y<2060;y++){
  const term=solarTermInstant(y,7),birth=dateAt(term,0),saju=getSaju(birth);
  if(saju.pillars.day.stem!=='계'||saju.pillars.month.branch!=='진')continue;
  for(const delta of [-1,0,1]){
   const b=dateAt(term,delta),chart=getSaju(b);
   if(chart.pillars.day.stem!=='계')continue;
   const r=analyzeClimateUsefulElementV4({saju:chart,birth:b,birthBasis:'verified-chart',policy:CLIMATE_V4_VERSION});
   assert.deepEqual(r.temporal.conditions.map(c=>c.matched),delta===0?[null,null]:[delta<0,delta>0]);
   assert.equal(r.confirmed,false);checked++;
  }
  if(checked>=3)break;
 }
 assert.ok(checked>=3);
});
