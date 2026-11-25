import {readFileSync} from 'node:fs';
import {analyzePatternOutcomeV10,PATTERN_OUTCOME_V10_VERSION} from '../src/index.js';
import {analyzeNatalStructure} from '../src/core/natal.js';
import {validateRoleSourcePacket,evaluateRoleSourceCase,summarizeRoleSourceReplay,inspectLiteralSourceChart} from './lib/pattern-outcome-role-policy-source.mjs';
import {summarizeGroundedSupplyReview,summarizeInterpositionReview,summarizeRoleDemandReview,summarizeResourceDemandConditions,summarizeOutputDemandConditions,summarizeOfficerDemandConditions} from './lib/pattern-outcome-role-policy-triage.mjs';
const packet=JSON.parse(readFileSync(new URL('../test/fixtures/pattern-outcome-role-policy-source-v1.json',import.meta.url),'utf8'));
const packetErrors=validateRoleSourcePacket(packet);
if(packetErrors.length){console.log(JSON.stringify({errors:packetErrors},null,2));process.exit(1);}
const rows=[],literalRows=[],groundedSupplyRows=[],interpositionRows=[],roleDemandRows=[],resourceDemandRows=[],outputDemandRows=[],officerDemandRows=[];
for(const c of packet.cases)for(const partial of [false,true]){
 try{
  const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,partial&&i===3?null:{stem:c.pillars[i][0],branch:c.pillars[i][1],text:c.pillars[i]}]))};
  literalRows.push(inspectLiteralSourceChart(c,analyzeNatalStructure({saju}),{partial}));
  const r=analyzePatternOutcomeV10({saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION});
  groundedSupplyRows.push(summarizeGroundedSupplyReview(c,r.efficacyReview?.mechanismReview?.groundedSupply,partial));
  interpositionRows.push(summarizeInterpositionReview(c,r.efficacyReview?.mechanismReview?.interpositionReview,partial));
  roleDemandRows.push(summarizeRoleDemandReview(c,r.efficacyReview?.mechanismReview,partial));
  resourceDemandRows.push(summarizeResourceDemandConditions(c,r.efficacyReview?.mechanismReview,partial));
  outputDemandRows.push(summarizeOutputDemandConditions(c,r.efficacyReview?.mechanismReview,partial));
  officerDemandRows.push(summarizeOfficerDemandConditions(c,r.efficacyReview?.mechanismReview,partial));
  rows.push(evaluateRoleSourceCase(c,r,{partial}));
 }catch(e){rows.push({id:c.id,partial,probes:[],errors:[e.name+':'+e.message]});}
}
const report=summarizeRoleSourceReplay(packet,rows);
report.literalRows=literalRows;
report.literalCoverage={expected:report.expectedVariants,executed:literalRows.length,passed:literalRows.filter(r=>!r.errors.length).length};
if(literalRows.length!==report.expectedVariants)report.errors.push('literal-variant-coverage');
for(const r of literalRows)for(const e of r.errors)report.errors.push(r.id+':literal:'+e);
report.groundedSupplyRows=groundedSupplyRows;
report.groundedSupplyCoverage={expected:report.expectedVariants,executed:groundedSupplyRows.length,passed:groundedSupplyRows.filter(r=>!r.errors.length).length};
if(groundedSupplyRows.length!==report.expectedVariants)report.errors.push('grounded-supply-variant-coverage');
for(const r of groundedSupplyRows)for(const e of r.errors)report.errors.push(r.id+':grounded-supply:'+e);
report.interpositionRows=interpositionRows;
report.interpositionCoverage={expected:report.expectedVariants,executed:interpositionRows.length,passed:interpositionRows.filter(r=>!r.errors.length).length};
if(interpositionRows.length!==report.expectedVariants)report.errors.push('interposition-variant-coverage');
for(const r of interpositionRows)for(const e of r.errors)report.errors.push(r.id+':interposition:'+e);
report.roleDemandRows=roleDemandRows;
report.roleDemandCoverage={expected:report.expectedVariants,executed:roleDemandRows.length,passed:roleDemandRows.filter(r=>!r.errors.length).length};
if(roleDemandRows.length!==report.expectedVariants)report.errors.push('role-demand-variant-coverage');
for(const r of roleDemandRows)for(const e of r.errors)report.errors.push(r.id+':role-demand:'+e);
report.resourceDemandRows=resourceDemandRows;
report.resourceDemandCoverage={expected:report.expectedVariants,executed:resourceDemandRows.length,passed:resourceDemandRows.filter(r=>!r.errors.length).length};
if(resourceDemandRows.length!==report.expectedVariants)report.errors.push('resource-demand-variant-coverage');
for(const r of resourceDemandRows)for(const e of r.errors)report.errors.push(r.id+':resource-demand:'+e);
report.outputDemandRows=outputDemandRows;
report.outputDemandCoverage={expected:report.expectedVariants,executed:outputDemandRows.length,passed:outputDemandRows.filter(r=>!r.errors.length).length};
if(outputDemandRows.length!==report.expectedVariants)report.errors.push('output-demand-variant-coverage');
for(const r of outputDemandRows)for(const e of r.errors)report.errors.push(r.id+':output-demand:'+e);
report.officerDemandRows=officerDemandRows;
report.officerDemandCoverage={expected:report.expectedVariants,executed:officerDemandRows.length,passed:officerDemandRows.filter(r=>!r.errors.length).length};
if(officerDemandRows.length!==report.expectedVariants)report.errors.push('officer-demand-variant-coverage');
for(const r of officerDemandRows)for(const e of r.errors)report.errors.push(r.id+':officer-demand:'+e);
console.log(JSON.stringify(report,null,2));
if(report.errors.length)process.exitCode=1;
