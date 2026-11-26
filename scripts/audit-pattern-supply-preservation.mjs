import {readFileSync} from 'node:fs';
import {buildLiteralStrengthInput} from './lib/pattern-strength-replay.mjs';
import {auditSupplyPreservation} from './lib/pattern-supply-preservation.mjs';
import {buildStrengthGuardPacket,retrospectiveGuardIntake} from './lib/pattern-strength-guard-review.mjs';
import {strengthAuditFixtureNames,verifyStrengthAuditInventory} from './lib/strength-audit-inventory.mjs';
const read=name=>JSON.parse(readFileSync(new URL('../test/fixtures/'+name+'.json',import.meta.url),'utf8'));
const audit=read('strength-audit-v1');
verifyStrengthAuditInventory(strengthAuditFixtureNames.map(name=>({name,cases:read(name).cases})),audit);
const packet=buildStrengthGuardPacket(retrospectiveGuardIntake(audit));
const rows=packet.charts.map(c=>{
 try{return {chartId:c.id,...auditSupplyPreservation(buildLiteralStrengthInput(c.pillars).input)};}
 catch(e){return {chartId:c.id,status:'invalid-evidence',reason:String(e?.message??e)};}
});
const good=rows.filter(r=>r.status==='diagnostic'),invalid=rows.filter(r=>r.status==='invalid-evidence'),unavailable=rows.filter(r=>r.status==='unavailable');
const fields=['exposedLinks','pressures','scenarios','conditionPossible','survivalPossible','lossPossible','bothPossible','incomingAlternativePossible','independentOriginPossible'];
const totals=Object.fromEntries(fields.map(k=>[k,good.reduce((n,r)=>n+r.summary[k],0)]));
console.log(JSON.stringify({status:invalid.length?'invalid-evidence':good.length!==rows.length?'incomplete':'diagnostic',charts:rows.length,evaluated:good.length,invalid:invalid.length,unavailable:unavailable.length,totals,selectionAuthority:false,actualAccuracy:null,independentGoldCases:0,rows},null,2));
if(good.length!==rows.length)process.exitCode=1;
