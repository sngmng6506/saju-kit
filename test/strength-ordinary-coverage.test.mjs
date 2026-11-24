import test from 'node:test';
import assert from 'node:assert/strict';
import { getSaju, analyzeDayMasterStrength, analyzeOrdinaryStrength } from '../src/index.js';

// Deterministic engineering sample, not representative population or labelled truth.
test('ordinary v2 coverage snapshot and unchanged quantitative baseline',()=>{
  const v1={},v2={},caveats={};
  let complete=0,partial=0;
  function increment(counts,key){counts[key]=(counts[key]||0)+1;}
  const key=r=>r.status+(r.category?':'+r.category:'');
  for(let y=1990;y<=2000;y++)
    for(let m=1;m<=12;m++)
      for(const d of [10,20])
        for(const hh of [null,0,4,8,12,16,20]){
          const saju=getSaju({y,m,d,hh,mm:hh===null?null:0,timezone:'Asia/Tokyo'});
          const a=analyzeDayMasterStrength({saju,policy:'strength-hybrid-v1',birthBasis:'verified-chart'});
          const b=analyzeOrdinaryStrength({saju,policy:'strength-ordinary-v2',birthBasis:'verified-chart'});
          assert.deepEqual(b.quantitative,a.quantitative);
          if(hh===null){
            partial++;
            assert.equal(b.status,'partial');
            assert.equal(b.category,null);
            continue;
          }
          complete++;
          increment(v1,key(a));
          increment(v2,key(b));
          for(const flag of b.caveats)increment(caveats,flag);
        }
  assert.equal(complete,1584);
  assert.equal(partial,264);
  assert.deepEqual(v1,{'review-required':1155,unresolved:388,'candidate:mixed':18,'candidate:weak':16,'candidate:strong':7});
  assert.deepEqual(v2,{unresolved:1079,'candidate:weak':286,'candidate:very-weak':68,'candidate:mixed':111,'candidate:strong':36,'candidate:very-strong':4});
  assert.deepEqual(caveats,{'formation-effects-unmodeled':1510,'clash-effects-unmodeled':645});
});
