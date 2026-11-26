import {readFileSync} from 'node:fs';
import {buildLiteralStrengthInput} from './lib/pattern-strength-replay.mjs';
import {auditResidualPressure} from './lib/pattern-residual-pressure.mjs';
import {buildStrengthGuardPacket,retrospectiveGuardIntake} from './lib/pattern-strength-guard-review.mjs';
import {strengthAuditFixtureNames,verifyStrengthAuditInventory} from './lib/strength-audit-inventory.mjs';
const read=name=>JSON.parse(readFileSync(new URL('../test/fixtures/'+name+'.json',import.meta.url),'utf8'));
const audit=read('strength-audit-v1');
verifyStrengthAuditInventory(strengthAuditFixtureNames.map(name=>({name,cases:read(name).cases})),audit);
const packet=buildStrengthGuardPacket(retrospectiveGuardIntake(audit));
const rows=packet.charts.map(c=>{
 try{return {chartId:c.id,...auditResidualPressure(buildLiteralStrengthInput(c.pillars).input)};}
 catch(e){return {chartId:c.id,status:'invalid-evidence',reason:String(e?.message??e)};}
});
const invalid=rows.filter(r=>r.status!=='diagnostic'),good=rows.filter(r=>r.status==='diagnostic');
const all=good.flatMap(r=>r.rows);
const summary=['incoming-control','outgoing-generation','wealth-demand','resource-interference'].map(kind=>{
 const xs=all.filter(r=>r.kind===kind);
 return {kind,pressures:xs.length,reliefCandidates:xs.filter(r=>r.relief.length).length,
  pressurePossible:xs.filter(r=>r.comparison?.pressurePossible===true).length,
  localFullReliefPossible:xs.filter(r=>r.comparison?.localFullReliefPossible===true).length,
  localUncoveredPossible:xs.filter(r=>r.comparison?.localUncoveredPossible===true).length,
  unavailable:xs.filter(r=>r.comparison?.status!=='diagnostic').length};
});
console.log(JSON.stringify({status:invalid.length?'invalid-evidence':'diagnostic',charts:rows.length,invalid:invalid.length,
 chartsWithLocalFullRelief:good.filter(r=>r.summary.localFullReliefPossible>0).length,summary,
 selectionAuthority:false,actualAccuracy:null,independentGoldCases:0,rows},null,2));
if(invalid.length)process.exitCode=1;
