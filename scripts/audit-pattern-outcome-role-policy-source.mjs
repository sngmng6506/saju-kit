import {readFileSync} from 'node:fs';
import {analyzePatternOutcomeV10,PATTERN_OUTCOME_V10_VERSION} from '../src/index.js';
import {validateRoleSourcePacket,evaluateRoleSourceCase,summarizeRoleSourceReplay} from './lib/pattern-outcome-role-policy-source.mjs';
const packet=JSON.parse(readFileSync(new URL('../test/fixtures/pattern-outcome-role-policy-source-v1.json',import.meta.url),'utf8'));
const packetErrors=validateRoleSourcePacket(packet);
if(packetErrors.length){console.log(JSON.stringify({errors:packetErrors},null,2));process.exit(1);}
const rows=[];
for(const c of packet.cases)for(const partial of [false,true]){
 try{
  const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,partial&&i===3?null:{stem:c.pillars[i][0],branch:c.pillars[i][1],text:c.pillars[i]}]))};
  const r=analyzePatternOutcomeV10({saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION});
  rows.push(evaluateRoleSourceCase(c,r,{partial}));
 }catch(e){rows.push({id:c.id,partial,probes:[],errors:[e.name+':'+e.message]});}
}
const report=summarizeRoleSourceReplay(packet,rows);
console.log(JSON.stringify(report,null,2));
if(report.errors.length)process.exitCode=1;
