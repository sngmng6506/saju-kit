import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeSupportNetwork} from '../src/index.js';
const p=text=>({stem:text[0],branch:text[1],text});
const chart=(y,m,d,h=null)=>({pillars:{year:p(y),month:p(m),day:p(d),hour:h===null?null:p(h)}});
const run=saju=>analyzeSupportNetwork({saju});
test('resource supply, wealth control, officer generation and output control remain directed',()=>{
 const r=run(chart('경신','임자','갑인','병오'));
 const resource=r.resources.find(x=>x.id==='month:stem');
 assert.equal(resource.anchored,true);
 assert.equal(resource.supply.to,'day:stem');
 assert.ok(resource.officerSupply.some(e=>e.from==='year:stem'));
 assert.ok(resource.outputControls.some(e=>e.to==='hour:stem'));
 assert.ok(r.outputControlsOfficer.some(e=>e.from==='hour:stem'&&e.to==='year:stem'));
 assert.ok(r.chains.some(c=>c.kind==='officer-resource-day'&&c.nodes.join(',')==='year:stem,month:stem,day:stem'));
});
test('wealth control of resource is not automatic loss of support',()=>{
 const r=run(chart('기미','임신','갑인','병인'));
 const resource=r.resources.find(x=>x.id==='month:stem');
 assert.ok(resource.wealthControls.some(e=>e.from==='year:stem'));
 assert.ok(resource.localAnchoredWealth.includes('year:stem'));
 assert.equal(resource.supply.to,'day:stem');
 assert.equal(r.effectsConfirmed,false);
});
test('all chains use distinct physical slots and existing directed relations',()=>{
 const r=run(chart('병신','병신','무술','경신'));
 const byId=new Map(r.nodes.map(n=>[n.id,n]));
 for(const c of r.chains){
  assert.equal(new Set(c.nodes.map(id=>{const n=byId.get(id);return n.position+':'+n.layer})).size,3);
  assert.equal(c.confirmed,false);
 }
 assert.ok(r.burdens.output.some(n=>n.id==='month:branch:metal'&&n.anchored));
 assert.ok(r.resources.some(n=>n.id==='month:stem'&&n.outputControls.length));
 assert.equal(new Set(r.chains.map(c=>c.kind+':'+c.nodes.join(','))).size,r.chains.length);
});
test('pressure direction distinguishes drain, expenditure and control',()=>{
 const r=run(chart('경신','임자','갑인','병오'));
 assert.equal(r.burdens.output.find(n=>n.id==='hour:stem').dayRelation.from,'day:stem');
 assert.equal(r.burdens.officer.find(n=>n.id==='year:stem').dayRelation.to,'day:stem');
 assert.equal(r.burdens.wealth.find(n=>n.id==='day:branch:earth').dayRelation.type,'control');
});
test('partial observations deterministic, private and immutable',()=>{
 const saju=chart('경신','임자','갑인');saju.privateMarker='secret';
 const before=JSON.stringify(saju),r=run(saju);
 assert.equal(r.completeHour,false);assert.ok(r.nodes.every(n=>n.position!=='hour'));
 assert.deepEqual(run(saju),r);assert.equal(JSON.stringify(saju),before);
 assert.ok(!JSON.stringify(r).includes('privateMarker'));
 assert.throws(()=>run(chart('갑축','을묘','갑진')));
});
