import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateArguments} from '../src/features/pattern/outcome-argumentation.js';
import {compileReplenishmentNetwork} from '../src/features/pattern/outcome-replenishment-network.js';
import {compareReplenishmentBurden} from '../src/features/pattern/outcome-burden-comparison.js';
import {synthesizeContextualStrength} from '../src/features/pattern/outcome-strength-synthesis.js';
import {analyzeGuardedFrontier} from '../src/features/pattern/outcome-guarded-frontier.js';
const key=(...xs)=>JSON.stringify(xs);
const node=(id,rootIds=[])=>({id,rootIds});
const action=(kind,from,to)=>({id:key(kind,from,to),kind,from,to,actualOperationState:'unresolved'});
function fixture(completeHour=true){
 const nodes=[node('a',['r']),node('b',['s']),node('c')],links=[{id:'bc',from:'b',to:'c',kind:'generate'}],targets=['a','b','c'];
 const x={completeHour,nodes,links,targets},burden=compareReplenishmentBurden({...x,actions:[action('control','a','b'),action('generate','b','c')],replenishmentPacket:compileReplenishmentNetwork(x).packet});
 return {...x,burden};
}
const row=(q,t)=>q.rows.find(r=>r.targetId===t);
const states=(r,k)=>r.analysis.targets.find(t=>t.id===r[k+'PropositionId']).possibleStates;
test('combined strength retains original proofs and leaves actual judgments open',()=>{
 const f=fixture(),q=synthesizeContextualStrength(f);
 assert.equal(q.status,'diagnostic',q.reason);assert.equal(q.summary.analysisStatus,'diagnostic');
 assert.deepEqual(q.judgments.slice(0,f.burden.judgments.length),f.burden.judgments);
 assert.deepEqual(q.ruleResults.slice(0,f.burden.ruleResults.length),f.burden.ruleResults);
 assert.equal(q.actualStrengthState,'unresolved');assert.equal(q.selectionAuthority,false);
 assert.ok(q.judgments.every(j=>j.state==='unresolved'));
 assert.deepEqual(states(row(q,'b'),'strong'),['supported','opposed','unresolved']);
 assert.deepEqual(states(row(q,'b'),'weak'),['supported','opposed','unresolved']);
});
test('indirect rooted supply is not a deep direct root',()=>{
 const q=synthesizeContextualStrength(fixture()),r=row(q,'c');
 assert.deepEqual(states(r,'strong'),['unresolved']);assert.deepEqual(states(r,'weak'),['unresolved']);
 assert.equal(r.requirements[0].basis,r.direct);assert.ok(r.direct!==r.support);
});
test('all exact local states agree with complete argument replay',()=>{
 const q=synthesizeContextualStrength(fixture()),r=row(q,'b');
 const ids=q.packet.propositions.filter(p=>p.level==='observation'&&(!p.id.startsWith('["strength-guard",')||r.guardIds.includes(p.id))).map(p=>p.id);
 const possible=new Map([r.strongPropositionId,r.weakPropositionId].map(id=>[id,new Set()]));
 let admitted=0;
 for(let mask=0;mask<2**ids.length;mask++){
  const truth=new Set(ids.filter((_,i)=>mask&(1<<i)));
  const evidence=q.packet.propositions.filter(p=>p.level==='observation').map((p,i)=>({id:'f'+i,propositionId:p.id,sign:truth.has(p.id)?'for':'against',refs:[{owner:'fixture',id:p.id,field:'value'}],applicability:'complete-only'}));
  const j=new Map(evaluateArguments({...q.packet,evidence}).judgments.map(j=>[j.id,j.state]));
  if(r.requirements.some(x=>truth.has(x.guard)&&j.get(x.basis)!=='supported'))continue;
  admitted++;
  for(const [id,s] of possible)s.add(j.get(id));
 }
 assert.ok(admitted>0);
 for(const t of r.analysis.targets)assert.deepEqual([...possible.get(t.id)].sort(),[...t.possibleStates].sort());
});
test('partial or tampered evidence does not publish conditional verdicts',()=>{
 const p=synthesizeContextualStrength(fixture(false));
 assert.equal(p.status,'partial');assert.equal(p.summary.analysisStatus,'partial');
 assert.ok(p.rows.every(r=>r.analysis.targets.length===0));
 const f=fixture();
 assert.equal(synthesizeContextualStrength({...f,burden:{...f.burden,judgments:[]}}).reason,'proof-replay');
 assert.equal(synthesizeContextualStrength({...f,nodes:f.nodes.map(n=>n.id==='b'?{...n,rootIds:[]}:n)}).reason,'seed-coverage');
});
test('generic signed terminal analysis preserves all four states and exact exclusion',()=>{
 const args={frontiers:[{id:'p',terms:[['x']]},{id:'n',terms:[['y']]}],guards:['g'],requirements:[{guard:'g',basis:'p'}],targets:['z'],rules:[
  {target:'z',sign:'for',basis:'p',guards:[{id:'g',value:true}]},
  {target:'z',sign:'against',basis:'n',guards:[]}]};
 const q=analyzeGuardedFrontier(args);
 assert.equal(q.status,'diagnostic');assert.deepEqual(q.targets[0].possibleStates,['supported','opposed','conflicting','unresolved']);
 for(const [state,w] of Object.entries(q.targets[0].witnesses)){
  const yes=w.includes('g')&&w.includes('x'),no=w.includes('y');
  assert.equal(yes?(no?'conflicting':'supported'):(no?'opposed':'unresolved'),state);
  assert.ok(!w.includes('g')||w.includes('x'));
 }
 assert.equal(analyzeGuardedFrontier({...args,guards:Array.from({length:9},(_,i)=>'g'+i),requirements:[],rules:[]}).status,'unavailable');
});
test('a required term cannot satisfy a negative monotone condition by adding variables',()=>{
 const q=analyzeGuardedFrontier({frontiers:[{id:'a',terms:[['x','y']]},{id:'b',terms:[['x']]}],guards:[],requirements:[],targets:['t'],rules:[
  {target:'t',sign:'for',basis:'a',guards:[]},{target:'t',sign:'against',basis:'b',guards:[]}]});
 assert.deepEqual(q.targets[0].possibleStates,['opposed','conflicting','unresolved']);
 assert.equal(q.targets[0].witnesses.supported,null);
});

import {replayModeledCoverage,controls,routeControls} from '../scripts/lib/pattern-modeled-consequence-coverage.mjs';
for(const c of [...controls,...routeControls])for(const complete of [true,false]){
 test('native strength synthesis replay '+c.id+' '+complete,()=>{
  const r=replayModeledCoverage(c.pillars,complete,{includeSynthesisInputs:true}),q=r.strengthSynthesis;
  assert.deepEqual(r.invalid,[]);
  assert.deepEqual(q,synthesizeContextualStrength(r.strengthSynthesisInput));
  assert.equal(q.status,complete?'diagnostic':'partial');
  assert.equal(q.selectionAuthority,false);assert.equal(q.effective,null);
  assert.equal(q.actualStrengthState,'unresolved');assert.equal(q.summary.actualEffectsConfirmed,0);
  assert.equal(q.rows.length,complete?4:3);
  if(!complete)assert.equal(q.summary.analysisStatus,'partial');
 });
}

test('literal demand policy does not require a rooted source to express possible weakness',()=>{
 const x={completeHour:true,nodes:[node('a'),node('b',['r'])],links:[],targets:['a']};
 const burden=compareReplenishmentBurden({...x,actions:[action('control','a','b'),action('generate','a','b')],replenishmentPacket:compileReplenishmentNetwork(x).packet});
 const v1=synthesizeContextualStrength({...x,burden}),v2=synthesizeContextualStrength({...x,burden,policy:'literal-demand'});
 assert.equal(v1.status,'diagnostic',v1.reason);assert.equal(v2.status,'diagnostic',v2.reason);
 assert.deepEqual(states(row(v1,'a'),'weak'),['unresolved']);
 assert.deepEqual(states(row(v2,'a'),'weak'),['supported','unresolved']);
 assert.deepEqual(v2.judgments.slice(0,burden.judgments.length),burden.judgments);
 assert.equal(v2.actualStrengthState,'unresolved');assert.equal(v2.selectionAuthority,false);
 assert.equal(v2.packet.evidence.length,2);
 assert.ok(v2.packet.evidence.every(f=>f.propositionId.startsWith('["literal-action-observed",')));
 assert.equal(v2.judgments.find(j=>j.id===row(v2,'a').exposure['outgoing-control']).state,'supported');
 assert.equal(v2.judgments.find(j=>j.id===row(v2,'a').expenditure).state,'unresolved');
});
test('literal demand alternative retains baseline strong possibilities but adds explicit wealth guard',()=>{
 const x={completeHour:true,nodes:[node('a',['r']),node('b',['s'])],links:[],targets:['a']};
 const burden=compareReplenishmentBurden({...x,actions:[action('control','a','b')],replenishmentPacket:compileReplenishmentNetwork(x).packet});
 const a=synthesizeContextualStrength({...x,burden,policy:'literal-demand'}),r=row(a,'a');
 assert.equal(a.status,'diagnostic',a.reason);
 assert.deepEqual(states(r,'strong'),['supported','opposed','unresolved']);
 assert.deepEqual(states(r,'weak'),['supported','opposed','unresolved']);
 const guard=key('strength-guard','a','wealth-demand-exceeds-support');
 assert.ok(r.guardIds.includes(guard));assert.equal(a.judgments.find(j=>j.id===guard).state,'unresolved');
 assert.ok(r.analysis.targets.find(t=>t.id===r.weakPropositionId).witnesses.supported.includes(guard));
 assert.equal(a.judgments.find(j=>j.id===r.weakPropositionId).state,'unresolved');
});
test('demand policy does not infer weakness from absence of support or absent literal action',()=>{
 const x={completeHour:true,nodes:[node('a')],links:[],targets:['a']};
 const burden=compareReplenishmentBurden({...x,actions:[],replenishmentPacket:compileReplenishmentNetwork(x).packet});
 const q=synthesizeContextualStrength({...x,burden,policy:'literal-demand'});
 assert.equal(q.status,'diagnostic');assert.deepEqual(states(row(q,'a'),'weak'),['unresolved']);
 const f=fixture(false),p=synthesizeContextualStrength({...f,policy:'literal-demand'});
 assert.equal(p.status,'partial');assert.ok(p.judgments.every(j=>j.state==='unresolved'));
});
test('literal demand evidence is fixed and exact actor states match exhaustive replay',()=>{
 const f=fixture(),q=synthesizeContextualStrength({...f,policy:'literal-demand'}),r=row(q,'b');
 assert.equal(q.status,'diagnostic',q.reason);
 const fixed=new Set(q.packet.evidence.map(e=>e.propositionId));
 const ids=q.packet.propositions.filter(p=>p.level==='observation'&&!fixed.has(p.id)&&(!p.id.startsWith('["strength-guard",')||r.guardIds.includes(p.id))).map(p=>p.id);
 const possible=new Map([r.strongPropositionId,r.weakPropositionId].map(id=>[id,new Set()]));
 for(let mask=0;mask<2**ids.length;mask++){
  const truth=new Set(ids.filter((_,i)=>mask&(1<<i)));
  const evidence=[...q.packet.evidence,...q.packet.propositions.filter(p=>p.level==='observation'&&!fixed.has(p.id)).map((p,i)=>({id:'f'+i,propositionId:p.id,sign:truth.has(p.id)?'for':'against',refs:[{owner:'fixture',id:p.id,field:'value'}],applicability:'complete-only'}))];
  const j=new Map(evaluateArguments({...q.packet,evidence}).judgments.map(j=>[j.id,j.state]));
  if(r.requirements.some(x=>truth.has(x.guard)&&j.get(x.basis)!=='supported'))continue;
  for(const [id,s] of possible)s.add(j.get(id));
 }
 for(const t of r.analysis.targets)assert.deepEqual([...possible.get(t.id)].sort(),[...t.possibleStates].sort());
});
test('literal exposure cannot be fabricated by editing group or action inventory',()=>{
 const f=fixture(),b=f.burden;
 assert.equal(synthesizeContextualStrength({...f,burden:{...b,actionRows:b.actionRows.slice(1)},policy:'literal-demand'}).reason,'action-coverage');
 const rows=b.rows.map(r=>r.targetId==='b'?{...r,groups:r.groups.map(g=>g.kind==='outgoing-control'?{...g,actionIds:['fake']}:g)}:r);
 assert.equal(synthesizeContextualStrength({...f,burden:{...b,rows},policy:'literal-demand'}).reason,'exposure-coverage');
});
