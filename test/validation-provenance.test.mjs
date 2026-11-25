import test from 'node:test';
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {inspectValidationState,validationPassed} from '../scripts/lib/validation-provenance.mjs';
const root=resolve('fixture-root'),output=resolve(root,'outcome-validation','summary.json'),head='a'.repeat(40);
const inspect=({commit=head,dirty='',untracked='',fail=null}={})=>inspectValidationState(root,[output],args=>{
 if(args[0]===fail)return {status:1,stdout:'',stderr:'git failed'};
 return {status:0,stdout:args[0]==='rev-parse'?commit:args[0]==='status'?dirty:untracked};
});
test('validation provenance excludes exact report paths but not other files in output directory',()=>{
 const ok=inspect({untracked:'outcome-validation/summary.json\0'});
 assert.equal(ok.clean,true);assert.deepEqual(ok.untracked,[]);
 const bad=inspect({untracked:'outcome-validation/summary.json\0outcome-validation/unexpected.test.mjs\0src/extra.js\0'});
 assert.equal(bad.clean,false);assert.deepEqual(bad.untracked,['outcome-validation/unexpected.test.mjs','src/extra.js']);
});
test('git failure and invalid HEAD cannot pass provenance checks',()=>{
 for(const fail of ['rev-parse','status','ls-files']){
  const r=inspect({fail});assert.equal(r.clean,false);assert.equal(r.errors.length,1);
 }
 assert.equal(inspect({commit:'not-a-commit'}).clean,false);
});
test('changed HEAD, tracked dirty, untracked content, missing receipts and failed jobs all block a pass',()=>{
 const a=inspect(),jobs=[{passed:true}];
 assert.equal(validationPassed(a,a,jobs),true);
 for(const b of [inspect({commit:'b'.repeat(40)}),inspect({dirty:' M package.json'}),inspect({untracked:'test/new.test.mjs\0'}),inspect({fail:'status'})])assert.equal(validationPassed(a,b,jobs),false);
 assert.equal(validationPassed(a,a,[]),false);
 assert.equal(validationPassed(a,a,[{passed:false}]),false);
});
