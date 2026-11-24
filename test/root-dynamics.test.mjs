import test from 'node:test';
import assert from 'node:assert/strict';
import {lifeStage,analyzeRootDynamics} from '../src/index.js';
const p=text=>({stem:text[0],branch:text[1],text});
const chart=(year,month,day,hour=null)=>({pillars:{year:p(year),month:p(month),day:p(day),hour:hour===null?null:p(hour)}});
const branches=[...'자축인묘진사오미신유술해'];
const stems=[...'갑을병정무기경신임계'];
test('all 120 life stages match independently listed branch sequences',()=>{
 const rows=['해자축인묘진사오미신유술','오사진묘인축자해술유신미','인묘진사오미신유술해자축',
 '유신미오사진묘인축자해술','인묘진사오미신유술해자축','유신미오사진묘인축자해술',
 '사오미신유술해자축인묘진','자해술유신미오사진묘인축','신유술해자축인묘진사오미','묘인축자해술유신미오사진'];
 const phases=['장생','목욕','관대','건록','제왕','쇠','병','사','묘','절','태','양'];
 for(let i=0;i<stems.length;i++)for(const branch of branches)assert.equal(lifeStage(stems[i],branch),phases[rows[i].indexOf(branch)]);
 assert.throws(()=>lifeStage('x','자'));assert.throws(()=>lifeStage('갑','x'));
});
test('life stage never creates a hidden root and actual root never disappears by stage',()=>{
 const r=analyzeRootDynamics({saju:chart('신유','계해','정미','경술')});
 const day=r.roots.find(x=>x.position==='day');
 const year=day.positions.find(x=>x.position==='year');
 assert.equal(year.stage,'장생');assert.equal(year.strongestRole,null);assert.equal(year.matches.length,0);
 assert.equal(day.positions.find(x=>x.position==='day').strongestRole,'residual');
 assert.equal(day.positions.find(x=>x.position==='hour').strongestRole,'middle');
});
test('XU08 exposes three fire root positions and local earth-water-fire protection',()=>{
 const r=analyzeRootDynamics({saju:chart('무술','갑자','정미','경술')});
 const day=r.roots.find(x=>x.position==='day');
 assert.deepEqual(day.positions.filter(p=>p.matches.length).map(p=>[p.position,p.strongestRole]),[['year','middle'],['day','residual'],['hour','middle']]);
 assert.equal(r.season.seasonElement,'water');
 assert.ok(r.paths.some(p=>p.type==='protection'&&p.target==='day:stem'&&p.threat==='month:branch:water'&&p.via==='day:branch:earth'&&p.local));
 assert.ok(r.paths.every(p=>p.confirmed===false));
});
test('XU23 retains two principal day-master roots and their locations',()=>{
 const r=analyzeRootDynamics({saju:chart('기미','기사','갑인','병인')});
 const day=r.roots.find(x=>x.position==='day');
 assert.deepEqual(day.positions.filter(p=>p.strongestRole==='principal').map(p=>[p.position,p.stage,p.distance]),[['day','건록',0],['hour','건록',1]]);
 assert.equal(r.season.seasonElement,'fire');
});
test('transition month separates season and principal, and vertical controls are directional',()=>{
 const r=analyzeRootDynamics({saju:chart('갑신','임진','병자','무인')});
 assert.equal(r.season.earthTransition,true);assert.equal(r.season.seasonElement,'wood');
 assert.equal(r.season.monthPrincipalElement,'earth');assert.equal(r.season.commandResolved,false);
 assert.equal(r.vertical.find(v=>v.position==='year').control,'branch-controls-stem');
 assert.equal(r.vertical.find(v=>v.position==='day').control,'branch-controls-stem');
 const a=analyzeRootDynamics({saju:chart('경인','을묘','갑진')});
 assert.equal(a.vertical.find(v=>v.position==='year').control,'stem-controls-branch');
});
test('paths use existing distinct slots, actual directed edges and retain mediation separately',()=>{
 const r=analyzeRootDynamics({saju:chart('경신','임자','갑인','병오')});
 const nodes=new Map(r.nodes.map(n=>[n.id,n]));
 const slot=n=>n.position+':'+n.layer;
 assert.equal(nodes.size,r.nodes.length);
 assert.ok(r.paths.some(p=>p.type==='mediation'&&p.target==='day:stem'&&p.threat==='year:stem'&&p.via==='month:stem'));
 const edge=(a,b,type)=>r.edges.some(e=>e.from===a&&e.to===b&&e.type===type);
 for(const p of r.paths){
  assert.equal(new Set([p.target,p.threat,p.via].map(id=>slot(nodes.get(id)))).size,3);
  assert.ok(edge(p.threat,p.target,'control'));
  if(p.type==='protection')assert.ok(edge(p.via,p.threat,'control'));
  else {assert.ok(edge(p.threat,p.via,'generate'));assert.ok(edge(p.via,p.target,'generate'));}
 }
 for(const e of r.edges)assert.ok(slot(nodes.get(e.from))!==slot(nodes.get(e.to)));
});
test('clash exposure does not remove root, null hour remains unknown, deterministic and private',()=>{
 const saju=chart('갑신','병인','갑진');saju.privateMarker='private-marker';
 const before=JSON.stringify(saju),r=analyzeRootDynamics({saju});
 assert.equal(r.completeHour,false);
 assert.ok(r.roots.every(x=>x.positions.length===3));
 const root=r.roots.find(x=>x.position==='day').positions.find(x=>x.position==='month');
 assert.equal(root.exposedToClash,true);assert.equal(root.strongestRole,'principal');
 assert.equal(r.effectsConfirmed,false);assert.ok(!JSON.stringify(r).includes('private-marker'));
 assert.deepEqual(analyzeRootDynamics({saju}),r);assert.equal(JSON.stringify(saju),before);
 assert.throws(()=>analyzeRootDynamics({saju:chart('갑축','을묘','갑진')}));
});
