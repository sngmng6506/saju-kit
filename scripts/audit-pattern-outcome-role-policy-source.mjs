import {readFileSync} from 'node:fs';
import {analyzePatternOutcomeV10,PATTERN_OUTCOME_V10_VERSION} from '../src/index.js';
import {analyzeNatalStructure} from '../src/core/natal.js';
import {validateRoleSourcePacket,evaluateRoleSourceCase,summarizeRoleSourceReplay,inspectLiteralSourceChart} from './lib/pattern-outcome-role-policy-source.mjs';
const packet=JSON.parse(readFileSync(new URL('../test/fixtures/pattern-outcome-role-policy-source-v1.json',import.meta.url),'utf8'));
const packetErrors=validateRoleSourcePacket(packet);
if(packetErrors.length){console.log(JSON.stringify({errors:packetErrors},null,2));process.exit(1);}
const rows=[],literalRows=[];
for(const c of packet.cases)for(const partial of [false,true]){
 try{
  const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,partial&&i===3?null:{stem:c.pillars[i][0],branch:c.pillars[i][1],text:c.pillars[i]}]))};
  literalRows.push(inspectLiteralSourceChart(c,analyzeNatalStructure({saju}),{partial}));
  const r=analyzePatternOutcomeV10({saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION});
  rows.push(evaluateRoleSourceCase(c,r,{partial}));
 }catch(e){rows.push({id:c.id,partial,probes:[],errors:[e.name+':'+e.message]});}
}
const report=summarizeRoleSourceReplay(packet,rows);
report.literalRows=literalRows;
report.literalCoverage={expected:report.expectedVariants,executed:literalRows.length,passed:literalRows.filter(r=>!r.errors.length).length};
if(literalRows.length!==report.expectedVariants)report.errors.push('literal-variant-coverage');
for(const r of literalRows)for(const e of r.errors)report.errors.push(r.id+':literal:'+e);
console.log(JSON.stringify(report,null,2));
if(report.errors.length)process.exitCode=1;
