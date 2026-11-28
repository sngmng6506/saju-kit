import {readFileSync} from 'node:fs';
import {buildLiteralStrengthInput} from './lib/pattern-strength-replay.mjs';
import {auditRootSeedSensitivity} from './lib/pattern-root-seed-sensitivity.mjs';
import {strengthAuditFixtureNames,verifyStrengthAuditInventory} from './lib/strength-audit-inventory.mjs';
const read=name=>JSON.parse(readFileSync(new URL('../test/fixtures/'+name+'.json',import.meta.url),'utf8'));
const audit=read('strength-audit-v1');
verifyStrengthAuditInventory(strengthAuditFixtureNames.map(name=>({name,cases:read(name).cases})),audit);
const rows=audit.entries.map(c=>{
 const id=JSON.stringify([c.fixture,c.id]),primary=c.basis==='explicit'&&c.scope==='natal'&&c.formation==='ordinary'&&c.verification!=='unreviewed';
 try{return {id,primary,...auditRootSeedSensitivity(buildLiteralStrengthInput(c.pillars).input)};}
 catch(e){return {id,primary,status:'invalid-evidence',reason:String(e?.message??e)};}
});
function summarize(rows){
 const good=rows.filter(r=>r.status==='diagnostic'),all=good.flatMap(r=>r.rows);
 return {charts:rows.length,evaluated:good.length,invalid:rows.filter(r=>r.status==='invalid-evidence').length,unavailable:rows.filter(r=>r.status==='unavailable').length,
 totals:Object.fromEntries(['physicalSlots','seedCandidates','residualSeeds','residualOnlyAlternatives','newReachability'].map(k=>[k,good.reduce((n,r)=>n+r.summary[k],0)])),
 policies:(all[0]?.policies??[]).map(p=>({id:p.id,reachable:all.filter(r=>r.policies.find(a=>a.id===p.id).reachable).length,direct:all.filter(r=>r.policies.find(a=>a.id===p.id).directPossible).length})),
 newTargets:good.flatMap(r=>r.rows.filter(t=>!t.policies[0].reachable&&t.policies[1].reachable).map(t=>({chartId:r.id,targetId:t.targetId,witness:t.residualAlternativeWitness})))};
}
const all=summarize(rows),primary=summarize(rows.filter(r=>r.primary));
console.log(JSON.stringify({status:all.invalid?'invalid-evidence':all.evaluated!==all.charts?'incomplete':'diagnostic',all,primary,selectionAuthority:false,actualAccuracy:null,independentGoldCases:0,rows},null,2));
if(all.evaluated!==all.charts)process.exitCode=1;
