import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {allocateInteractionPaths,enumerateInteractionPaths,analyzeMultihopInteraction,MULTIHOP_VERSION} from '../src/features/multihop-interaction-v1/index.js';
import {chartFromReference} from '../scripts/strength-reference.mjs';
import {evaluateMultihop} from '../scripts/evaluate-strength-multihop.mjs';

const paths=[
 {id:'a',kind:'generation',origin:'w',nodes:['w','o','r','day:stem']},
 {id:'b',kind:'generation',origin:'o',nodes:['o','r','day:stem']},
 {id:'c',kind:'control',origin:'w',nodes:['w','r']}
];
test('shared intermediate capacity and source budget are order invariant',()=>{
 const m={w:100,o:50,r:40},before=JSON.stringify(paths);
 const a=allocateInteractionPaths(paths,m);
 assert.deepEqual(a,allocateInteractionPaths([...paths].reverse(),m));
 assert.equal(JSON.stringify(paths),before);
 assert.deepEqual(a.allocations.map(p=>p.accepted),[13,13,13]);
 assert.deepEqual(a.ledger,[{id:'o',capacity:50,requested:100,reserved:26},{id:'r',capacity:40,requested:150,reserved:39},{id:'w',capacity:100,requested:100,reserved:26}]);
 assert.ok(allocateInteractionPaths(paths,{...m,r:0}).allocations.every(p=>p.accepted===0));
 assert.throws(()=>allocateInteractionPaths([...paths,paths[0]],m),/invalid path/);
 assert.throws(()=>allocateInteractionPaths([{...paths[0],nodes:['w','o','w','day:stem']}],m),/invalid path/);
 assert.throws(()=>allocateInteractionPaths(paths,{...m,r:-1}),/invalid node capacity/);
});
test('locality and distinct physical slots constrain multi-hop enumeration',()=>{
 const nodes=[
 {id:'w',position:'year',layer:'stem',category:'wealth',anchored:true},
 {id:'o',position:'day',layer:'branch',category:'officer',anchored:true},
 {id:'r',position:'day',layer:'branch',category:'resource',anchored:true},
 {id:'r2',position:'hour',layer:'branch',category:'resource',anchored:true},
 {id:'day:stem',position:'day',layer:'stem',category:'peer',anchored:true}
 ];
 const edges=[{from:'w',to:'o',type:'generate',distance:2},{from:'o',to:'r',type:'generate',distance:0},{from:'o',to:'r2',type:'generate',distance:1},{from:'r',to:'day:stem',type:'generate',distance:0},{from:'r2',to:'day:stem',type:'generate',distance:1}];
 const net={nodes,edges};
 assert.equal(enumerateInteractionPaths(net,1).filter(p=>p.nodes.length===4).length,0);
 assert.deepEqual(enumerateInteractionPaths(net,2).filter(p=>p.nodes.length===4).map(p=>p.nodes),[['w','o','r2','day:stem']]);
});
test('provisional and missing hour have no directional or route output',()=>{
 const saju=chartFromReference(['壬申','壬子','戊午','乙卯']);
 for(const input of [{saju,birthBasis:'provisional-chart'},{saju:{pillars:{...saju.pillars,hour:null}},birthBasis:'verified-chart'}]){
  const r=analyzeMultihopInteraction({...input,policy:MULTIHOP_VERSION});
  assert.equal(r.direction,null);assert.equal(r.analysis,null);assert.equal(r.effectsConfirmed,false);
 }
});
test('all historical multi-hop scenario summaries replay',async()=>{
 const expected=JSON.parse(await readFile(new URL('../docs/strength-multihop-results.json',import.meta.url),'utf8'));
 const actual=await evaluateMultihop();
 assert.deepEqual(actual.counts,expected.counts);
 assert.deepEqual(actual.summary,expected.summary);
 assert.deepEqual(actual.rows,expected.rows);
});
