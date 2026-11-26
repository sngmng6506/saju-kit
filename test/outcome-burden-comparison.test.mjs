import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateArguments} from '../src/features/pattern/outcome-argumentation.js';
import {compileReplenishmentNetwork} from '../src/features/pattern/outcome-replenishment-network.js';
import {compareReplenishmentBurden} from '../src/features/pattern/outcome-burden-comparison.js';
import {positiveProofFrontier,comparePositiveFrontiers} from '../src/features/pattern/outcome-positive-frontier.js';
const key=(...xs)=>JSON.stringify(xs);
const node=(id,rootIds=[])=>({id,rootIds});
const action=(kind,from,to)=>({id:key(kind,from,to),kind,from,to,actualOperationState:'unresolved'});
const build=(nodes,links,targets,actions,completeHour=true)=>{
 const input={nodes,links,targets,completeHour};
 return {...input,actions,replenishmentPacket:compileReplenishmentNetwork(input).packet};
};
const fixture=()=>build([node('a',['r']),node('b',['s']),node('c')],[{id:'bc',from:'b',to:'c',kind:'generate'}],['a','b','c'],[action('control','a','b'),action('generate','b','c')]);
const group=(q,target,kind)=>q.rows.find(r=>r.targetId===target).groups.find(g=>g.kind===kind);
test('one generation operation is both reception basis and outgoing drain candidate',()=>{
 const q=compareReplenishmentBurden(fixture());assert.equal(q.status,'diagnostic');assert.equal(q.frontier.status,'diagnostic');
 const a=q.actionRows.find(a=>a.kind==='generate');
 assert.equal(a.operationVariableId,key('supply-operation','bc'));
 assert.equal(q.packet.propositions.filter(p=>p.id===a.operationVariableId).length,1);
 const g=group(q,'b','outgoing-generation').comparison;
 assert.equal(g.leftImpliesRight,false);assert.equal(g.rightImpliesLeft,true);
 assert.ok(g.witnesses.leftOnly);assert.equal(g.witnesses.rightOnly,null);
 assert.equal(g.actualMagnitudeComparison,'unresolved');
});
test('incoming control and source expenditure share an action without implying magnitude',()=>{
 const q=compareReplenishmentBurden(fixture()),a=group(q,'a','outgoing-control'),b=group(q,'b','incoming-control');
 assert.deepEqual(a.actionIds,b.actionIds);
 const c=b.comparison;
 assert.equal(c.leftImpliesRight,false);assert.equal(c.rightImpliesLeft,false);
 assert.ok(c.witnesses.leftOnly);assert.ok(c.witnesses.rightOnly);assert.ok(c.witnesses.both);
 assert.equal(q.summary.actualEffectsConfirmed,0);
});
test('frontier and all comparison witnesses agree with grounded proof closure',()=>{
 const q=compareReplenishmentBurden(fixture()),vars=q.packet.propositions.filter(p=>p.level==='observation').map(p=>p.id);
 const evaluate=trueIds=>{
  const r=evaluateArguments({...q.packet,evidence:vars.map((id,i)=>({id:'f'+i,propositionId:id,sign:trueIds.includes(id)?'for':'against',refs:[{owner:'fixture',id,field:'value'}],applicability:'complete-only'}))});
  return new Map(r.judgments.map(j=>[j.id,j.state==='supported']));
 };
 for(let mask=0;mask<2**vars.length;mask++){
  const t=vars.filter((_,i)=>mask&(1<<i)),j=evaluate(t);
  for(const f of q.frontier.frontiers)assert.equal(j.get(f.id),f.terms.some(xs=>xs.every(x=>t.includes(x))));
 }
 for(const row of q.rows)for(const g of row.groups)for(const [kind,truth] of Object.entries({leftOnly:[true,false],rightOnly:[false,true],both:[true,true],neither:[false,false]})){
  const w=g.comparison.witnesses[kind];if(w!==null){const j=evaluate(w);assert.deepEqual([j.get(row.supportPropositionId),j.get(g.propositionId)],truth);}
 }
});
test('common physical roots do not create independent support resources',()=>{
 const q=compareReplenishmentBurden(build([node('a',['r']),node('b',['r'])],[],['a','b'],[action('control','a','b')]));
 assert.equal(q.packet.propositions.filter(p=>p.id===key('slot-retained','r')).length,1);
 const g=group(q,'b','incoming-control').comparison;
 assert.equal(g.leftImpliesRight,false);assert.equal(g.rightImpliesLeft,false);
 assert.equal(g.witnesses.both.filter(id=>id===key('slot-retained','r')).length,1);
});
test('unseeded cycles and absent support do not yield vacuous dominance',()=>{
 const q=compareReplenishmentBurden(build([node('a'),node('b')],[{id:'ab',from:'a',to:'b',kind:'peer'},{id:'ba',from:'b',to:'a',kind:'peer'}],['a','b'],[action('control','a','b')]));
 assert.equal(q.frontier.status,'diagnostic');const g=group(q,'b','incoming-control').comparison;
 assert.equal(g.leftPossible,false);assert.equal(g.rightPossible,false);assert.equal(g.leftImpliesRight,null);assert.equal(g.rightImpliesLeft,null);
});
test('partial and malformed inputs preserve authority',()=>{
 const f=fixture(),q=compareReplenishmentBurden(build(f.nodes,f.links,f.targets,f.actions,false));
 assert.equal(q.frontier.status,'partial');assert.ok(q.rows.every(r=>r.groups.every(g=>g.comparison===null)));
 assert.equal(compareReplenishmentBurden({...f,actions:f.actions.slice(0,1)}).reason,'generation-coverage');
 assert.equal(compareReplenishmentBurden({...f,replenishmentPacket:{...f.replenishmentPacket,rules:[]}}).reason,'replenishment-packet');
 assert.equal(positiveProofFrontier({...f.replenishmentPacket,rules:f.replenishmentPacket.rules.map(r=>({...r,undercutWhen:[r.premises[0]]}))}).status,'invalid-evidence');
});
test('frontier absorbs redundant conjunctions and comparison handles empty sides',()=>{
 const f=fixture(),packet=f.replenishmentPacket,base=positiveProofFrontier(packet);
 const r=packet.rules.find(r=>r.premises.length===2),extra={...r,id:'redundant',premises:[...r.premises,{propositionId:packet.propositions.find(p=>p.level==='observation'&&!r.premises.some(x=>x.propositionId===p.id)).id,sign:'for'}]};
 assert.deepEqual(positiveProofFrontier({...packet,rules:[...packet.rules,extra]}),base);
 assert.deepEqual(comparePositiveFrontiers([],[]).witnesses,{leftOnly:null,rightOnly:null,both:null,neither:[]});
});
