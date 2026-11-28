import {readFileSync} from 'node:fs';
import {buildLiteralStrengthInput} from './lib/pattern-strength-replay.mjs';
import {auditRootIndependentOperation} from './lib/pattern-root-independent-operation.mjs';
import {strengthAuditFixtureNames,verifyStrengthAuditInventory} from './lib/strength-audit-inventory.mjs';
const read=name=>JSON.parse(readFileSync(new URL('../test/fixtures/'+name+'.json',import.meta.url),'utf8'));
const audit=read('strength-audit-v1');
verifyStrengthAuditInventory(strengthAuditFixtureNames.map(name=>({name,cases:read(name).cases})),audit);
const rows=audit.entries.map(c=>{
 const id=JSON.stringify([c.fixture,c.id]),primary=c.basis==='explicit'&&c.scope==='natal'&&c.formation==='ordinary'&&c.verification!=='unreviewed';
 try{return {id,primary,...auditRootIndependentOperation(buildLiteralStrengthInput(c.pillars).input)};}
 catch(e){return {id,primary,status:'invalid-evidence',reason:String(e?.message??e)};}
});
function summarize(rows){
 const good=rows.filter(r=>r.status==='diagnostic');
 const fields=['actions','rootedActions','noRootActions','newActionPossibilities','visibleRootlessActionSources','transfers','targets','newSupplyPossibilities','noRootSupplyPossibilities'];
 return {charts:rows.length,evaluated:good.length,invalid:rows.filter(r=>r.status==='invalid-evidence').length,unavailable:rows.filter(r=>r.status==='unavailable').length,totals:Object.fromEntries(fields.map(k=>[k,good.reduce((n,r)=>n+r.summary[k],0)])),newTargets:good.flatMap(r=>r.targets.filter(t=>!t.rootedPossible&&t.receivedBasisPossible).map(t=>({chartId:r.id,targetId:t.targetId,witness:t.witness})))};
}
const all=summarize(rows),primary=summarize(rows.filter(r=>r.primary));
console.log(JSON.stringify({status:all.invalid?'invalid-evidence':all.evaluated!==all.charts?'incomplete':'diagnostic',all,primary,selectionAuthority:false,actualAccuracy:null,independentGoldCases:0,rows},null,2));
if(all.evaluated!==all.charts)process.exitCode=1;
