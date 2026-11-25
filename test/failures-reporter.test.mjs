import test from 'node:test';
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import reporter from '../scripts/lib/failures-reporter.mjs';

async function report(events){
 let output='';
 for await(const part of reporter(events))output+=part;
 return output;
}
const ev=(type,data)=>({type,data});
const file=(name)=>({name,file:resolve(name),nesting:0,line:1,column:1});
test('failure reporter reports file progress without counting subtests as files',async()=>{
 const a=file('test/a.test.mjs'),b=file('test/b.test.mjs');
 const output=await report([
  ev('test:enqueue',a),ev('test:enqueue',b),
  ev('test:pass',{...a,name:'hidden pass',line:3}),
  ev('test:summary',{file:a.file}),
  ev('test:complete',a),
  ev('test:fail',{...b,name:'visible failure',line:4,details:{error:new Error('expected detail')}}),
  ev('test:complete',b),
  ev('test:summary',{success:false,counts:{tests:2,passed:1,failed:1,cancelled:0}})
 ]);
 assert.match(output,/PROGRESS \| files: 1\/2 \(50%\)/);
 assert.match(output,/PROGRESS \| files: 2\/2 \(100%\)/);
 assert.doesNotMatch(output,/hidden pass/);
 assert.match(output,/FAIL visible failure/);
 assert.match(output,/expected detail/);
 assert.match(output,/FAIL \| tests: 2 \| pass: 1 \| fail: 1 \| cancelled: 0/);
});
test('failure reporter falls back to completion counts if file discovery is unavailable',async()=>{
 const events=Array.from({length:25},(_,i)=>ev('test:pass',{name:'test '+i,nesting:0,details:{type:'test'}}));
 events.push(ev('test:diagnostic',{nesting:0,message:'tests 25'}),ev('test:diagnostic',{nesting:0,message:'pass 25'}),ev('test:diagnostic',{nesting:0,message:'fail 0'}));
 const output=await report(events);
 assert.match(output,/PROGRESS \| completed test events: 25 \(total not yet known\)/);
 assert.doesNotMatch(output,/100%/);
 assert.match(output,/PASS \| tests: 25 \| pass: 25 \| fail: 0/);
});
