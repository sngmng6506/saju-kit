import {readFileSync} from 'node:fs';
import {buildLiteralStrengthInput} from './lib/pattern-strength-replay.mjs';
import {auditExtendedSupply} from './lib/pattern-extended-supply.mjs';
import {strengthAuditFixtureNames,verifyStrengthAuditInventory} from './lib/strength-audit-inventory.mjs';
const read=name=>JSON.parse(readFileSync(new URL('../test/fixtures/'+name+'.json',import.meta.url),'utf8'));
const audit=read('strength-audit-v1');
verifyStrengthAuditInventory(strengthAuditFixtureNames.map(name=>({name,cases:read(name).cases})),audit);
const rows=audit.entries.map(c=>{
 const id=JSON.stringify([c.fixture,c.id]),primary=c.basis==='explicit'&&c.scope==='natal'&&c.formation==='ordinary'&&c.verification!=='unreviewed';
 try{return {id,primary,...auditExtendedSupply(buildLiteralStrengthInput(c.pillars).input)};}
 catch(e){return {id,primary,status:'invalid-evidence',reason:String(e?.message??e)};}
});
function summarize(rows){
 const good=rows.filter(r=>r.status==='diagnostic'),all=good.flatMap(r=>r.rows);
 const fields=['localLinks','extraLinks','nonlocalLinks','hiddenRecipientLinks','targets','newReachability','extensionOnly','jointFamiliesRequired'];
 return {charts:rows.length,evaluated:good.length,invalid:rows.filter(r=>r.status==='invalid-evidence').length,unavailable:rows.filter(r=>r.status==='unavailable').length,
 totals:Object.fromEntries(fields.map(k=>[k,good.reduce((n,r)=>n+r.summary[k],0)])),
 ablation:['local-only','nonlocal-only','hidden-local-only','both'].map(policy=>({policy,reachable:all.filter(r=>r.ablation.find(a=>a.policy===policy).reachable).length,extensionOnly:all.filter(r=>r.ablation.find(a=>a.policy===policy).extensionOnlyPossible).length})),
 newTargets:good.flatMap(r=>r.rows.filter(t=>!t.baselinePossible&&t.extendedPossible).map(t=>({chartId:r.id,targetId:t.targetId,scope:t.scope,ablation:t.ablation})))};
}
const all=summarize(rows),primary=summarize(rows.filter(r=>r.primary));
console.log(JSON.stringify({status:all.invalid?'invalid-evidence':all.evaluated!==all.charts?'incomplete':'diagnostic',all,primary,selectionAuthority:false,actualAccuracy:null,independentGoldCases:0,rows},null,2));
if(all.evaluated!==all.charts)process.exitCode=1;
