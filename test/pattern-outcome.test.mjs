import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzePatternOutcome,PATTERN_OUTCOME_VERSION,analyzePatternUsefulElementV10,PATTERN_V10_VERSION} from '../src/index.js';
import {outcomeRules} from '../src/features/pattern/outcome-rules.js';
import {tenGodForStem} from '../src/core/natal.js';
const chart=ps=>({pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,ps[i]?{stem:ps[i][0],branch:ps[i][1],text:ps[i]}:null]))});
const run=(ps,birthBasis='verified-chart')=>analyzePatternOutcome({saju:chart(ps),birthBasis,policy:PATTERN_OUTCOME_VERSION});
const review=(result,family)=>result.reviews.find(r=>r.family===family&&r.anchorIds.length);
const rule=(review,id)=>review.rules.find(r=>r.id===id);
test('all eight families have unique ordered rule references and declared unresolved conditions',()=>{
 for(const family of ['officer','wealth','resource','food','killing','hurting-officer','blade','peer']){
  const rows=outcomeRules(family);
  assert.ok(rows.some(r=>r.kind==='support')&&rows.some(r=>r.kind==='damage')&&rows.some(r=>r.kind==='rescue'));
  assert.equal(new Set(rows.map(r=>r.id)).size,rows.length);
  for(const [i,r] of rows.entries()){
   assert.ok(r.unresolved.length);
   if(r.kind==='rescue')assert.ok(rows.slice(0,i).some(d=>d.id===r.threat&&d.kind==='damage'));
  }
 }
});
test('officer rescue extends the exact hurting witness without removing damage',()=>{
 const q=review(run(['정묘','신유','갑자','계유']),'officer');
 const damage=rule(q,'officer-hurting'),rescue=rule(q,'officer-resource-rescue');
 assert.equal(damage.observed,true);assert.equal(rescue.observed,true);
 for(const w of rescue.witnesses){
  const d=damage.witnesses.find(d=>d.id===w.threatWitnessId);
  assert.ok(d);assert.equal(w.roles.obstacle,d.roles.obstacle);assert.equal(w.roles.target,d.roles.target);
  assert.equal(w.roles.helper,'visible:hour');assert.equal(w.effective,null);
 }
 assert.equal(q.broken,null);assert.equal(q.rescued,null);
});
test('wealth mediation binds peer, output and same wealth target',()=>{
 const q=review(run(['을묘','기축','갑자','병인']),'wealth');
 const r=rule(q,'wealth-food-mediation');
 assert.equal(r.observed,true);
 for(const w of r.witnesses){
  assert.equal(w.roles.obstacle,'visible:year');assert.equal(w.roles.helper,'visible:hour');
  assert.equal(w.edges.length,2);
 }
});
test('missing hour does not become absence; provisional chart exposes no graph',()=>{
 const q=review(run(['정묘','신유','갑자',null]),'officer');
 assert.equal(q.status,'partial');assert.equal(rule(q,'officer-hurting').observed,true);
 assert.equal(rule(q,'officer-resource-rescue').observed,null);
 const provisional=run(['정묘','신유','갑자','계유'],'provisional-chart');
 assert.equal(provisional.status,'unavailable');assert.deepEqual(provisional.reviews,[]);
 assert.throws(()=>analyzePatternOutcome({saju:chart(['정묘','신유','갑자','계유']),birthBasis:'verified-chart',policy:'wrong'}),{code:'pattern-policy'});
});
test('legacy policy remains deterministic and new evidence never grants authority',()=>{
 const saju=chart(['정묘','신유','갑자','계유']),input={saju,birthBasis:'verified-chart'},copy=JSON.stringify(input);
 const old=()=>analyzePatternUsefulElementV10({...input,policy:PATTERN_V10_VERSION});
 const before=old(),result=analyzePatternOutcome({...input,policy:PATTERN_OUTCOME_VERSION});
 assert.deepEqual(old(),before);assert.equal(JSON.stringify(input),copy);
 for(const k of ['formed','broken','rescued','selectedPattern','assistantGod','usefulElement'])assert.equal(result[k],null);
 assert.equal(result.selectionAuthority,false);
 for(const q of result.reviews)for(const r of q.rules)for(const w of r.witnesses){
  assert.equal(w.effective,null);
  assert.equal(new Set(Object.values(w.roles)).size,Object.keys(w.roles).length);
  for(const e of w.edges)if(e.edgeId)assert.ok(before.relativeForce.edges.some(x=>x.id===e.edgeId&&x.kind===e.kind));
 }
});

test('killing obstruction and wealth rescue admit both output polarities without broadening food support',()=>{
 for(const [ps,expectedGod] of [
  [['무술','갑자','정미','경술'],'상관'],
  [['기미','갑자','정미','경술'],'식신']
 ]){
  assert.equal(tenGodForStem('정',ps[0][0]),expectedGod);
  const q=review(run(ps),'killing');
  const d=rule(q,'killing-resource-blocks-food').witnesses.find(w=>w.roles.obstacle==='visible:month'&&w.roles.food==='visible:year'&&w.roles.target==='hidden:month:계');
  assert.ok(d,expectedGod);
  const r=rule(q,'killing-wealth-removes-resource').witnesses.find(w=>w.threatWitnessId===d.id&&w.roles.helper==='visible:hour');
  assert.ok(r);assert.deepEqual(d.edges.map(e=>[e.from,e.to,e.kind]),[['visible:month','visible:year','control'],['visible:year','hidden:month:계','control']]);
  assert.deepEqual(r.edges.map(e=>[e.from,e.to,e.kind]),[['visible:hour','visible:month','control']]);
  assert.equal(rule(q,'killing-food').witnesses.some(w=>w.roles.helper==='visible:year'),expectedGod==='식신');
  assert.ok(rule(q,'killing-wealth').witnesses.some(w=>w.roles.obstacle==='visible:hour'&&w.roles.target==='hidden:month:계'));
  assert.equal(r.effective,null);assert.equal(q.formed,null);assert.equal(q.broken,null);assert.equal(q.rescued,null);
 }
});
test('output obstruction does not invent a missing helper or a non-output role',()=>{
 const q=review(run(['무술','갑자','정미','병술']),'killing');
 assert.ok(rule(q,'killing-resource-blocks-food').observed);
 assert.equal(rule(q,'killing-wealth-removes-resource').observed,false);
 const other=review(run(['병술','갑자','정미','경술']),'killing');
 assert.equal(rule(other,'killing-resource-blocks-food').observed,false);
 assert.equal(rule(other,'killing-wealth-removes-resource').observed,false);
});
