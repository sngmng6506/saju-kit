import test from 'node:test';
import assert from 'node:assert/strict';
import {elementContextModelContract,evaluateElementContextModel} from '../src/features/pattern/outcome-element-context.js';
import {auditElementContextCoverage} from '../scripts/lib/pattern-element-context-coverage.mjs';
const contract=elementContextModelContract();
const refs=Object.fromEntries(contract.axes.map(axis=>[axis,[{owner:'fixture',id:axis,field:'value'}]]));
const run=(axes,completeHour=true,element='wood')=>evaluateElementContextModel({completeHour,element,axes,evidenceRefs:refs});
test('all binary axis assignments agree with exact model coverage counts',()=>{
 const r=auditElementContextCoverage();
 assert.equal(r.status,'diagnostic');
 let accepted=0,strong=0,weak=0,overlap=0;
 for(let mask=0;mask<2**contract.axes.length;mask++){
  const axes=Object.fromEntries(contract.axes.map((k,i)=>[k,Boolean(mask&(1<<i))]));
  const q=run(axes);
  if(q.status==='invalid-evidence')continue;
  assert.equal(q.status,'diagnostic');accepted++;
  const a=q.strongState==='supported',b=q.weakState==='supported';
  strong+=Number(a);weak+=Number(b);overlap+=Number(a&&b);
 }
 assert.equal(accepted,r.admissibleCount);assert.equal(strong,r.strongCount);
 assert.equal(weak,r.weakCount);assert.equal(overlap,r.overlapCount);
 assert.equal(r.scenarioCount,2**contract.axes.length);
});
test('source-inspired coverage gaps remain unresolved rather than opposite strength',()=>{
 const r=auditElementContextCoverage(),byId=new Map(r.rows.map(x=>[x.id,x]));
 for(const id of ['off-season-root-resource','in-season-rooted-control']){
  const row=byId.get(id);assert.ok(row.contextCount>0);assert.equal(row.strongExcluded,true);assert.equal(row.weakExcluded,true);
  for(const element of ['wood','fire','earth','metal','water']){
   const q=run(row.contextWitness,true,element);
   assert.equal(q.strongState,'unresolved');assert.equal(q.weakState,'unresolved');
   assert.equal(q.effective,null);assert.equal(q.selectionAuthority,false);
  }
 }
 assert.equal(r.independentGoldCases,0);assert.ok(r.rows.every(x=>x.referenceLabel===null));
});
test('reject logically inconsistent observation axes without guessing unknowns',()=>{
 const axes=Object.fromEntries(contract.axes.map(k=>[k,null]));
 for(const [a,av,b,bv] of contract.implications)assert.equal(run({...axes,[a]:av,[b]:!bv}).status,'invalid-evidence',a+' -> '+b);
 const p=run({...axes,cleanMonthPrincipalRoot:true,principalSupports:null});
 assert.equal(p.status,'diagnostic');assert.equal(p.strongState,'unresolved');
 const partial=run(axes,false);assert.equal(partial.status,'partial');assert.equal(partial.weakState,'unresolved');
});
test('coverage witnesses replay through the original argument engine',()=>{
 const r=auditElementContextCoverage();
 for(const row of r.rows){
  assert.equal(run(row.contextWitness).status,'diagnostic');
  for(const kind of ['strong','weak']){
   const w=row[kind+'Witness'];if(w)assert.equal(run(w)[kind+'State'],'supported');
  }
 }
});
