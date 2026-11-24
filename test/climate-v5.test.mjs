import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeElementStructure,analyzeClimateUsefulElementV4,analyzeClimateUsefulElementV5,CLIMATE_V5_VERSION} from '../src/index.js';
import {observeRequirementContext} from '../src/features/climate-useful-element-v5/requirements.js';
import {observeTextualMotifs} from '../src/features/climate-useful-element-v5/motifs.js';
const stems='갑을병정무기경신임계',branches='자축인묘진사오미신유술해';
const p=i=>({stem:stems[i%10],branch:branches[i%12],text:stems[i%10]+branches[i%12]});
const pillar=text=>({stem:text[0],branch:text[1],text});
const chart=(year,month,day,hour)=>({pillars:{year:pillar(year),month:pillar(month),day:pillar(day),hour:hour?pillar(hour):null}});
test('requirement evidence preserves identity, missing hour and no authority',()=>{
 for(let i=0;i<60;i++)for(const partial of [false,true]){
  const saju={pillars:{year:p(i),month:p((i+11)%60),day:p((i+22)%60),hour:partial?null:p((i+33)%60)}};
  const st=analyzeElementStructure({saju}),before=JSON.stringify(st);
  for(const s of stems){
   const r=observeRequirementContext(s,st);
   assert.deepEqual(r.exactVisible,st.profiles.flatMap(x=>x.visible).filter(x=>x.stem===s&&x.position!=='day').map(x=>x.position));
   assert.ok(r.roots.every(x=>(x.stem===s)===(x.match==='exact-stem')));
   assert.equal(r.visibleRelations.length,partial?2:3);
   assert.equal(r.effectiveSupply,null);assert.equal(r.obstructionConfirmed,null);assert.equal(r.confirmed,false);
   if(partial)assert.notEqual(r.exactRootOutsideClash,false);
  }
  assert.equal(JSON.stringify(st),before);
 }
});
test('Ren-Shen root specificity does not equate root presence with effective supply',()=>{
 const saju=chart('무진','경신','임술','정미'),st=analyzeElementStructure({saju});
 const r=observeTextualMotifs(st);
 assert.ok(r.rootReview.occurrences.some(x=>x.branch==='신'&&x.sourceClass==='named-excluded'));
 assert.ok(r.rootReview.occurrences.some(x=>x.branch==='진'&&x.sourceClass==='named-preferred'&&x.clashExposed));
 assert.equal(r.rootReview.effectiveRoot,null);
 assert.equal(r.selectionAuthority,false);
});
test('v5 is additive relative to v4 and never confirms a remedy',()=>{
 const saju=chart('무진','경신','임술','정미'),i={saju,birthBasis:'verified-chart'};
 const a=analyzeClimateUsefulElementV4({...i,policy:'climate-useful-element-v4'});
 const b=analyzeClimateUsefulElementV5({...i,policy:CLIMATE_V5_VERSION});
 const {requirementContext,textualMotifs,version,...rest}=b;
 assert.deepEqual(rest,(({version,...r})=>r)(a));
 assert.equal(requirementContext.selectionAuthority,false);assert.equal(textualMotifs.selectionAuthority,false);
 assert.equal(b.usefulElement,null);assert.equal(b.confirmed,false);
 const unavailable=analyzeClimateUsefulElementV5({...i,birthBasis:'provisional-chart',policy:CLIMATE_V5_VERSION});
 assert.equal(unavailable.requirementContext,null);assert.equal(unavailable.textualMotifs,null);
});
