import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzePatternUsefulElementV2,analyzePatternUsefulElementV3,PATTERN_V3_VERSION} from '../src/index.js';
import {observeSourceOrder} from '../src/features/pattern-useful-element-v3/quality.js';
const pillar=text=>({stem:text[0],branch:text[1],text});
const chart=ps=>({pillars:Object.fromEntries(['year','month','day','hour'].map((pos,i)=>[pos,ps[i]?pillar(ps[i]):null]))});
const run=saju=>analyzePatternUsefulElementV3({saju,birthBasis:'verified-chart',policy:PATTERN_V3_VERSION});
test('four source order examples distinguish reverse and unknown positions',()=>{
 for(const [day,month,a,b] of [["갑","유","정","무"],["갑","자","기","계"],["임","인","경","병"],["기","묘","계","신"]]){
  const occ=(x,y)=>[{id:'a',stem:x,position:'year',layer:'visible',dayReference:false},{id:'b',stem:y,position:'hour',layer:'visible',dayReference:false}];
  assert.equal(observeSourceOrder(day,month,occ(a,b),true)[0].pairs[0].orientation,'source-preferred-order');
  assert.equal(observeSourceOrder(day,month,occ(b,a),true)[0].pairs[0].orientation,'source-reversed-order');
  assert.equal(observeSourceOrder(day,month,[],false)[0].status,'unresolved');
 }
});
test('actual officer rescue references a distinct target and v2 remains unchanged',()=>{
 const saju=chart(['경인','을유','갑자','무진']),r=run(saju);
 const a=analyzePatternUsefulElementV2({saju,birthBasis:'verified-chart',policy:'pattern-useful-element-v2'});
 const {qualityReview,version,...rest}=r;
 assert.deepEqual(rest,(({version,...rest})=>rest)(a));
 const route=qualityReview.reviews.find(x=>x.candidateId==='principal:신').routes.find(x=>x.routeId==='combine-killing-preserve-officer');
 assert.equal(route.structurallySupported,true);
 assert.ok(route.links.some(l=>l.rescueWitnesses.some(w=>w.target==='hidden:month:신')));
 assert.equal(route.effectConfirmed,false);assert.equal(r.assistantGod,null);
});
test('complete and partial factorial charts preserve scope and reference contracts',()=>{
 const stems='갑을병정무기경신임계',branches='자축인묘진사오미신유술해',p=i=>stems[i%10]+branches[i%12];
 let links=0,qualified=0,rescue=0,endpoints=0;
 for(let d=0;d<10;d++)for(let m=0;m<12;m++)for(const partial of [false,true]){
  const saju=chart([p((m+3)%60),p(m),p(d),partial?null:p((d+m+9)%60)]),before=JSON.stringify(saju),r=run(saju),q=r.qualityReview;
  assert.equal(q.selectionAuthority,false);assert.equal(r.assistantGod,null);
  endpoints+=Object.keys(q.endpoints).length;
  for(const review of q.reviews)for(const route of review.routes){
   assert.equal(route.effectConfirmed,false);assert.equal(route.force,null);
   if(partial)assert.notEqual(route.structurallySupported,false);
   qualified+=route.qualifiedStructuralLinks;
   for(const l of route.links){links++;assert.ok(q.endpoints[l.from]&&q.endpoints[l.to]);
    for(const w of l.rescueWitnesses){rescue++;assert.ok(w.target!==w.obstacle&&w.target!==w.helper);assert.equal(w.effective,null);}
   }
  }
  assert.equal(JSON.stringify(saju),before);
 }
 assert.deepEqual({links,qualified,rescue,endpoints},{links:5031,qualified:4092,rescue:1797,endpoints:3138});
});
