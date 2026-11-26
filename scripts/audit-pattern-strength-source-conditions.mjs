import {readFileSync} from 'node:fs';
import {buildLiteralStrengthInput} from './lib/pattern-strength-replay.mjs';
import {auditBurdenSourceConditions,burdenSourceConditions} from './lib/pattern-strength-source-conditions.mjs';
import {buildStrengthGuardPacket,retrospectiveGuardIntake} from './lib/pattern-strength-guard-review.mjs';
import {strengthAuditFixtureNames,verifyStrengthAuditInventory} from './lib/strength-audit-inventory.mjs';
const read=name=>JSON.parse(readFileSync(new URL('../test/fixtures/'+name+'.json',import.meta.url),'utf8'));
const audit=read('strength-audit-v1');
verifyStrengthAuditInventory(strengthAuditFixtureNames.map(name=>({name,cases:read(name).cases})),audit);
const packet=buildStrengthGuardPacket(retrospectiveGuardIntake(audit));
const rows=packet.charts.map(c=>{
 try{return {chartId:c.id,...auditBurdenSourceConditions(buildLiteralStrengthInput(c.pillars).input)};}
 catch(e){return {chartId:c.id,status:'invalid-evidence',reason:String(e?.message??e)};}
});
const invalid=rows.filter(r=>r.status!=='diagnostic');
const conditions=burdenSourceConditions().map(c=>{
 const cases=rows.flatMap(r=>r.status==='diagnostic'?[r.conditions.find(x=>x.id===c.id)]:[]);
 return {id:c.id,guard:c.guard,literalCharts:cases.filter(x=>x.rows.length>0).length,
  rootedCharts:cases.filter(x=>x.rows.some(r=>r.jointRootedBasisPossible===true)).length,
  unavailableCharts:cases.filter(x=>x.rows.some(r=>r.jointRootedBasisPossible===null)).length,
  literalContexts:cases.reduce((n,x)=>n+x.rows.length,0),guardEvidenceState:'unresolved'};
});
console.log(JSON.stringify({status:invalid.length?'invalid-evidence':'diagnostic',charts:rows.length,invalid:invalid.length,conditions,selectionAuthority:false,actualAccuracy:null,independentGoldCases:0,rows},null,2));
if(invalid.length)process.exitCode=1;
