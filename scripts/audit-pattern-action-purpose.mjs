import {readFileSync} from 'node:fs';
import {buildLiteralStrengthInput} from './lib/pattern-strength-replay.mjs';
import {auditActionPurpose} from './lib/pattern-action-purpose.mjs';
import {strengthAuditFixtureNames,verifyStrengthAuditInventory} from './lib/strength-audit-inventory.mjs';
const read=name=>JSON.parse(readFileSync(new URL('../test/fixtures/'+name+'.json',import.meta.url),'utf8'));
const audit=read('strength-audit-v1');
verifyStrengthAuditInventory(strengthAuditFixtureNames.map(name=>({name,cases:read(name).cases})),audit);
const rows=audit.entries.map(c=>{
 const id=JSON.stringify([c.fixture,c.id]);
 try{
  const q=auditActionPurpose(buildLiteralStrengthInput(c.pillars).input);
  const valid=q.status==='diagnostic'&&q.balance.every(b=>b.state==='unresolved')&&q.climate.every(b=>b.state==='unresolved'&&b.alignmentState==='unresolved');
  return {id,status:valid?'diagnostic':'invalid-evidence',reason:valid?null:q.reason??'unassumed-effect',summary:q.summary};
 }catch(e){return {id,status:'invalid-evidence',reason:String(e?.message??e)};}
});
const good=rows.filter(r=>r.status==='diagnostic'),fields=['actions','balanceCandidates','climateCandidates','actualEffectsConfirmed'];
console.log(JSON.stringify({status:good.length===rows.length?'diagnostic':'invalid-evidence',charts:rows.length,evaluated:good.length,totals:Object.fromEntries(fields.map(k=>[k,good.reduce((n,r)=>n+r.summary[k],0)])),selectionAuthority:false,actualAccuracy:null,rows},null,2));
if(good.length!==rows.length)process.exitCode=1;
