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

test('accidental operation aliases cannot merge distinct physical relations',()=>{
 const f=fixture(),id=f.actions[0].id;
 const q=build(f.nodes,[{...f.links[0],id}],f.targets,f.actions);
 assert.equal(compareReplenishmentBurden(q).reason,'operation-identity-collision');
});
test('antichain budget refuses an incomplete result',()=>{
 const nodes=Array.from({length:15},(_,i)=>node('n'+i,['r'+i]));
 const f=build(nodes,[],nodes.map(n=>n.id),[]);
 const packet=f.replenishmentPacket,propositions=[...packet.propositions],rules=[...packet.rules];
 // Fifteen independent binary choices create 32,768 incomparable terms.
 for(let i=0;i<15;i++){
  const id='choice'+i,obs='alternative'+i;
  propositions.push({id,kind:'choice',subject:id,level:'structural-hypothesis'},{id:obs,kind:'alternative',subject:obs,level:'observation'});
  for(const p of [key('replenishment-basis','n'+i),obs])rules.push({id:key(id,p),policyId:'test',conclusion:{propositionId:id,sign:'for'},premises:[{propositionId:p,sign:'for'}],refs:[{owner:'test',id,field:'choice'}],applicability:'complete-only'});
 }
 propositions.push({id:'all',kind:'all',subject:'all',level:'structural-hypothesis'});
 rules.push({id:'all',policyId:'test',conclusion:{propositionId:'all',sign:'for'},premises:Array.from({length:15},(_,i)=>({propositionId:'choice'+i,sign:'for'})),refs:[{owner:'test',id:'all',field:'choices'}],applicability:'complete-only'});
 const q=positiveProofFrontier({...packet,propositions,rules});
 assert.equal(q.status,'unavailable');assert.deepEqual(q.frontiers,[]);
});

test('symbolic frontier rejects every graph rejected by canonical proof validation',()=>{
 const packet=fixture().replenishmentPacket,r=packet.rules[0];
 for(const invalid of [
  {...packet,propositions:[...packet.propositions,null]},
  {...packet,rules:[...packet.rules,r]},
  {...packet,rules:packet.rules.map((x,i)=>i?x:{...x,refs:[]})},
  {...packet,rules:packet.rules.map((x,i)=>i?x:{...x,premises:[...x.premises,x.premises[0]]})},
  {...packet,propositions:packet.propositions.map((x,i)=>i?x:{...x,kind:''})}
 ]){
  const canonical=evaluateArguments(invalid),symbolic=positiveProofFrontier(invalid);
  assert.equal(canonical.status,'invalid-evidence');
  assert.equal(symbolic.status,canonical.status);assert.equal(symbolic.reason,canonical.reason);
  assert.deepEqual(symbolic.frontiers,[]);
 }
});

test('fixed positive observations contribute empty assumption terms without hiding other premises',()=>{
 const packet=fixture().replenishmentPacket;
 const r=packet.rules.find(r=>r.id===key('root-seed','a','r'));
 const [first,second]=r.premises;
 const fact=(p,i)=>({id:'fixed'+i,...p,refs:[{owner:'fixture',id:p.propositionId,field:'fixed'}],applicability:'complete-only'});
 const fixed=[fact(first,0)],q=positiveProofFrontier({...packet,evidence:fixed});
 assert.equal(q.status,'diagnostic');
 assert.deepEqual(q.frontiers.find(f=>f.id===r.conclusion.propositionId).terms,[[second.propositionId]]);
 const all=positiveProofFrontier({...packet,evidence:[...fixed,fact(second,1)]});
 assert.deepEqual(all.frontiers.find(f=>f.id===r.conclusion.propositionId).terms,[[]]);
 assert.equal(positiveProofFrontier({...packet,evidence:[{...fixed[0],sign:'against'}]}).reason,'positive-fact-contract');
 assert.equal(positiveProofFrontier({...packet,scope:'partial',evidence:fixed}).status,'partial');
});
