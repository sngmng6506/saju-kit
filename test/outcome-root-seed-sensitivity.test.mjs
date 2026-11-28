import test from 'node:test';
import assert from 'node:assert/strict';
import {compileReplenishmentNetwork} from '../src/features/pattern/outcome-replenishment-network.js';
import {compareRootSeedPolicies} from '../scripts/lib/pattern-root-seed-sensitivity.mjs';
const key=(...xs)=>JSON.stringify(xs);
function fixture(completeHour=true){
 const nodes=[{id:'a',rootIds:['r']},{id:'b',rootIds:[]},{id:'c',rootIds:[]}],links=[{id:'ab',from:'a',to:'b',kind:'generate'},{id:'bc',from:'b',to:'c',kind:'peer'},{id:'ca',from:'c',to:'a',kind:'peer'}],targets=['a','b','c'];
 const seeds=[{nodeId:'a',slotId:'r',role:'principal',position:'month',distance:1,match:'exact-stem',contested:true},{nodeId:'b',slotId:'s',role:'residual',position:'year',distance:2,match:'same-element',contested:false},{nodeId:'c',slotId:'s',role:'residual',position:'year',distance:3,match:'exact-stem',contested:false}];
 const x={completeHour,nodes,links,targets};return {...x,seeds,packet:compileReplenishmentNetwork(x).packet};
}
const get=(r,id)=>r.policies.find(p=>p.id===id);
test('residual root is a distinct conditional seed and does not change original proof',()=>{
 const q=compareRootSeedPolicies(fixture());
 assert.equal(q.status,'diagnostic',q.reason);assert.equal(q.selectionAuthority,false);
 for(const r of q.rows){
  assert.equal(get(r,'substantial-baseline').reachable,true);assert.equal(get(r,'all-constituents').reachable,true);
  assert.equal(get(r,'residual-only').reachable,true);assert.ok(r.residualAlternativeWitness);
  assert.ok(!r.residualAlternativeWitness.assumptions.includes(key('root-access','a','r')));
  assert.equal(get(r,'uncontested-only').reachable,true);assert.equal(get(r,'middle-only').reachable,false);
  assert.equal(r.actualRootState,'unresolved');
 }
 assert.equal(get(q.rows[1],'substantial-baseline').directPossible,false);assert.equal(get(q.rows[1],'all-constituents').directPossible,true);
});
test('residual access can express otherwise unreachable target without implying strength',()=>{
 const x=fixture(),links=x.links.filter(l=>l.id!=='ab'),packet=compileReplenishmentNetwork({...x,links}).packet;
 const q=compareRootSeedPolicies({...x,links,packet});assert.equal(q.status,'diagnostic',q.reason);
 const b=q.rows[1];assert.equal(get(b,'substantial-baseline').reachable,false);assert.equal(get(b,'all-constituents').reachable,true);
 assert.equal(get(b,'near-only').reachable,false);assert.equal(get(b,'exact-or-own-only').directPossible,false);
});
test('baseline coverage, shared physical role and packet identity are mandatory',()=>{
 const x=fixture();
 assert.equal(compareRootSeedPolicies({...x,seeds:x.seeds.slice(1)}).reason,'baseline-seed-coverage');
 assert.equal(compareRootSeedPolicies({...x,seeds:x.seeds.map((s,i)=>i===2?{...s,contested:true}:s)}).reason,'physical-slot-conflict');
 assert.equal(compareRootSeedPolicies({...x,packet:{...x.packet,rules:[]}}).reason,'baseline-network');
 assert.equal(compareRootSeedPolicies(fixture(false)).status,'partial');
});
test('rootless graph has no basis even with cyclic relays',()=>{
 const x=fixture(),nodes=x.nodes.map(n=>({...n,rootIds:[]})),packet=compileReplenishmentNetwork({...x,nodes}).packet;
 const q=compareRootSeedPolicies({...x,nodes,packet,seeds:[]});assert.equal(q.status,'diagnostic',q.reason);
 assert.ok(q.rows.every(r=>r.policies.every(p=>!p.reachable&&!p.directPossible)&&r.residualAlternativeWitness===null));
});
