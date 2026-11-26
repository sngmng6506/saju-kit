import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateArguments} from '../src/features/pattern/outcome-argumentation.js';
import {compileReplenishmentNetwork,reviewReplenishmentNetwork} from '../src/features/pattern/outcome-replenishment-network.js';
const key=(...xs)=>JSON.stringify(xs);
const node=(id,rootIds=[])=>({id,rootIds});
const link=(id,from,to,kind='generate')=>({id,from,to,kind});
const input=(nodes,links,targets,completeHour=true)=>({nodes,links,targets,completeHour});
const target=(q,id)=>q.pathAnalysis.targets.find(t=>t.targetId===id);
const judgment=(q,id)=>q.scenario.targets.find(t=>t.id===id);
test('rooted chain uses one physical seed and every explicit path operation',()=>{
 const q=reviewReplenishmentNetwork(input([node('a',['r']),node('b'),node('c')],[link('ab','a','b'),link('bc','b','c')],['b','c']));
 assert.equal(q.status,'diagnostic');assert.equal(q.scenario.admissibleCount,16);
 assert.equal(judgment(q,'b').counts.supported,2);assert.equal(judgment(q,'c').counts.supported,1);
 assert.deepEqual(target(q,'c').alternatives,[{rootId:'r',seedNodeId:'a',nodeIds:['a','b','c'],linkIds:['ab','bc'],requiredAssumptions:[key('slot-retained','r'),key('root-access','a','r'),key('supply-operation','ab'),key('supply-operation','bc')]}]);
 assert.equal(q.actualReplenishmentState,'unresolved');assert.ok(q.judgments.every(j=>j.state==='unresolved'));
});
test('reciprocal peers never self-seed and rooted cycles have only simple paths',()=>{
 const links=[link('ab','a','b','peer'),link('ba','b','a','peer')];
 const q=reviewReplenishmentNetwork(input([node('a'),node('b')],links,['a','b']));
 assert.ok(q.pathAnalysis.targets.every(t=>!t.structurallyReachable));assert.ok(q.scenario.targets.every(t=>t.invariantState==='unresolved'));
 const r=reviewReplenishmentNetwork(input([node('a',['r']),node('b')],links,['a','b']));
 assert.equal(target(r,'a').alternatives.length,1);assert.equal(target(r,'b').alternatives.length,1);
 assert.equal(judgment(r,'a').counts.supported,4);assert.equal(judgment(r,'b').counts.supported,2);
});
test('shared physical root retains one variable and distinct access alternatives',()=>{
 const q=reviewReplenishmentNetwork(input([node('a',['r']),node('b',['r']),node('c')],[link('ac','a','c'),link('bc','b','c')],['a','b','c']));
 assert.equal(q.variables.filter(v=>v.id===key('slot-retained','r')).length,1);
 assert.deepEqual(target(q,'c').distinctRootIds,['r']);
 assert.equal(target(q,'c').alternatives.length,2);
 assert.equal(judgment(q,'c').counts.supported,7);
 assert.equal(q.scenario.sets.whole.supportCount,3);
});
test('every enumerated simple-path witness agrees with proof closure for all assignments',()=>{
 const q=reviewReplenishmentNetwork(input([node('a',['r']),node('b',['r']),node('c')],[link('ab','a','b','peer'),link('ba','b','a','peer'),link('bc','b','c'),link('ac','a','c')],['a','b','c']));
 const vars=q.variables.map(v=>v.id);
 for(let m=0;m<2**vars.length;m++){
  const assignment=Object.fromEntries(vars.map((v,i)=>[v,Boolean(m&(1<<i))]));
  const evidence=vars.map((id,i)=>({id:'f'+i,propositionId:id,sign:assignment[id]?'for':'against',refs:[{owner:'fixture',id,field:'value'}],applicability:'complete-only'}));
  const r=evaluateArguments({...q.packet,evidence});
  for(const t of q.pathAnalysis.targets){
   const expected=t.alternatives.some(a=>a.requiredAssumptions.every(id=>assignment[id]));
   assert.equal(r.judgments.find(j=>j.id===key('replenishment-basis',t.targetId)).state==='supported',expected);
  }
 }
});
test('budgeted enumeration does not discard independently exact path alternatives',()=>{
 const ns=[node('a',Array.from({length:9},(_,i)=>'r'+i))],q=reviewReplenishmentNetwork(input(ns,[],['a']));
 assert.equal(q.pathAnalysis.status,'diagnostic');assert.equal(target(q,'a').alternatives.length,9);
 assert.equal(q.scenario.status,'unavailable');assert.equal(q.actualReplenishmentState,'unresolved');
});
test('partial and malformed graph cannot publish a replenishment judgment',()=>{
 const q=reviewReplenishmentNetwork(input([node('a',['r'])],[],['a'],false));
 assert.equal(q.status,'partial');assert.equal(q.pathAnalysis.status,'partial');assert.deepEqual(q.pathAnalysis.targets,[]);assert.equal(q.scenario,null);
 for(const x of [input([node('a'),node('a')],[],['a']),input([node('a')],[link('x','a','b')],['a']),input([node('a')],[link('x','a','a')],['a']),input([node('a',['r','r'])],[],['a'])])assert.equal(compileReplenishmentNetwork(x).status,'invalid-evidence');
});
test('path output budget never exposes a truncated witness list',()=>{
 const ns=Array.from({length:9},(_,i)=>node('n'+i,i===0?['r']:[])),ls=[];
 for(const a of ns)for(const b of ns)if(a!==b)ls.push(link(a.id+'>'+b.id,a.id,b.id,'peer'));
 const q=reviewReplenishmentNetwork(input(ns,ls,['n8']));
 assert.equal(q.pathAnalysis.status,'unavailable');assert.deepEqual(q.pathAnalysis.targets,[]);
});
