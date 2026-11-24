import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {analyzePatternUsefulElement,analyzePatternUsefulElementV2,PATTERN_V2_VERSION} from '../src/index.js';
const pillar=text=>({stem:text[0],branch:text[1],text});
const chart=ps=>({pillars:Object.fromEntries(['year','month','day','hour'].map((pos,i)=>[pos,ps[i]?pillar(ps[i]):null]))});
const run=saju=>analyzePatternUsefulElementV2({saju,birthBasis:'verified-chart',policy:PATTERN_V2_VERSION});
test('frozen literary cases report candidate and route coverage without claiming selection accuracy',async()=>{
 const fixtures=JSON.parse(await readFile(new URL('./fixtures/pattern-classical-v1.json',import.meta.url),'utf8'));
 const expected=JSON.parse(await readFile(new URL('../docs/pattern-classical-v1-results.json',import.meta.url),'utf8'));
 const rows=fixtures.map(f=>{
  const saju=chart(f.pillars),r=run(saju),cs=r.selection.candidates.filter(c=>c.family===f.family),by=new Map(r.routeReview.occurrences.map(x=>[x.id,x]));
  const routes=r.routeReview.reviews.filter(q=>cs.some(c=>c.id===q.candidateId)).flatMap(q=>q.routes.filter(x=>x.id===f.route&&x.observed===true));
  const hit=f.route?routes.some(q=>q.links.some(l=>(!f.assistantStem||by.get(l.from).stem===f.assistantStem)&&(!f.obstacleStem||by.get(l.to).stem===f.obstacleStem))):null;
  assert.equal(r.selectedPattern,null);assert.equal(r.assistantGod,null);
  return {id:f.id,candidateObserved:cs.length>0,routeObserved:hit,candidateIds:cs.map(c=>c.id)};
 });
 assert.deepEqual(rows,expected);
});
test('v2 preserves v1 and withholds absence for unknown hour',()=>{
 const saju=chart(['경인','을유','갑자',null]);
 const a=analyzePatternUsefulElement({saju,birthBasis:'verified-chart',policy:'pattern-useful-element-v1'}),b=run(saju);
 const {routeReview,version,...rest}=b;
 assert.deepEqual(rest,(({version,...r})=>r)(a));
 assert.ok(routeReview.reviews.flatMap(q=>q.routes).every(r=>r.observed!==false&&!r.effectConfirmed&&!r.conditionResolved));
 assert.equal(b.assistantGod,null);assert.equal(routeReview.purity.officerKilling.mixedConfirmed,null);
});
test('all 120 keys and complete/partial charts retain occurrence references and abstention',()=>{
 const stems='갑을병정무기경신임계',branches='자축인묘진사오미신유술해',p=i=>stems[i%10]+branches[i%12];
 let links=0,routeChecks=0;
 for(let d=0;d<10;d++)for(let m=0;m<12;m++)for(const partial of [false,true]){
  const saju=chart([p((m+3)%60),p(m),p(d),partial?null:p((d+m+9)%60)]),before=JSON.stringify(saju),r=run(saju),map=new Map(r.routeReview.occurrences.map(x=>[x.id,x]));
  assert.equal(r.selectedPattern,null);assert.equal(r.assistantGod,null);
  for(const q of r.routeReview.reviews)for(const x of q.routes){
   routeChecks++;assert.equal(x.effectConfirmed,false);assert.equal(x.conditionResolved,false);
   if(partial)assert.notEqual(x.observed,false);
   for(const l of x.links){links++;assert.ok(map.has(l.from)&&map.has(l.to)&&l.from!==l.to);assert.equal(l.effective,null);}
  }
  assert.equal(JSON.stringify(saju),before);
 }
 assert.equal(links,5031);assert.equal(routeChecks,1550);
});
