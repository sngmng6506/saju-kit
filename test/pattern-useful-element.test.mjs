import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzePatternUsefulElement,PATTERN_USEFUL_ELEMENT_VERSION,tenGodForStem} from '../src/index.js';
const stems='갑을병정무기경신임계',branches='자축인묘진사오미신유술해';
const p=i=>({stem:stems[i%10],branch:branches[i%12],text:stems[i%10]+branches[i%12]});
const pillar=text=>({stem:text[0],branch:text[1],text});
const chart=(a,b,c,d)=>({pillars:{year:pillar(a),month:pillar(b),day:pillar(c),hour:d?pillar(d):null}});
const analyze=saju=>analyzePatternUsefulElement({saju,policy:PATTERN_USEFUL_ELEMENT_VERSION,birthBasis:'verified-chart'});
test('all 120 day/month keys, complete and partial, preserve candidate identity and withhold authority',()=>{
 let checks=0,motifs=0;const families=new Set();
 for(let d=0;d<10;d++)for(let m=0;m<12;m++)for(const partial of [false,true]){
  const saju={pillars:{year:p((m+3)%60),month:p(m),day:p(d),hour:partial?null:p((d+m+9)%60)}},before=JSON.stringify(saju),r=analyze(saju);
  assert.equal(r.completeHour,!partial);assert.equal(r.selectedPattern,null);assert.equal(r.selectionAuthority,false);
  for(const h of r.selection.monthHidden){
   assert.equal(h.tenGod,tenGodForStem(saju.pillars.day.stem,h.stem));
   if(partial)assert.notEqual(h.projected,false);
   assert.ok(h.exactProjection.every(pos=>pos!=='day'&&saju.pillars[pos].stem===h.stem));checks++;
  }
  assert.equal(new Set(r.selection.candidates.map(c=>c.id)).size,r.selection.candidates.length);
  assert.equal(r.outcomes.length,r.selection.candidates.length);
  for(const c of r.selection.candidates)if(c.family)families.add(c.family);
  for(const o of r.outcomes)for(const x of o.motifs){motifs++;assert.equal(x.conditionResolved,false);assert.equal(x.effectConfirmed,false);if(x.predicate===true)assert.ok(x.clauses.every(c=>c.matched===true));}
  assert.equal(JSON.stringify(saju),before);
 }
 assert.equal(checks,660);assert.equal(motifs,2565);assert.equal(families.size,8);
});
test('source examples and synthetic controls preserve blade, projection and formation hypotheses',()=>{
 assert.equal(analyze(chart('갑인','경오','무신','갑인')).selection.peerClass,'yang-blade');
 assert.equal(analyze(chart('기유','병자','임인','병오')).selection.peerClass,'yang-blade');
 assert.ok(analyze(chart('병인','경인','신유','무술')).selection.alternateProjections.includes('병'));
 const r=analyze(chart('병오','갑인','계축','임술'));
 assert.ok(r.selection.candidates.some(c=>c.kind==='month-formation'&&c.element==='fire'&&c.transformationConfirmed===null));
 assert.equal(r.patternUsefulGod,null);
});
test('provisional charts are withheld and day reference is not a projection',()=>{
 const saju=chart('갑자','병인','갑자',null);
 const r=analyze(saju);
 assert.equal(r.selection.monthHidden.find(h=>h.stem==='갑').exactProjection.includes('day'),false);
 assert.equal(analyzePatternUsefulElement({saju,birthBasis:'provisional-chart',policy:PATTERN_USEFUL_ELEMENT_VERSION}).status,'unavailable');
 assert.throws(()=>analyzePatternUsefulElement({saju,birthBasis:'verified-chart',policy:'other'}));
});
