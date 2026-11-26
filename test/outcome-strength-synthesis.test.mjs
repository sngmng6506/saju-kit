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
