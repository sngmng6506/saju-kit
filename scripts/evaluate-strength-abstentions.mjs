import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {chartFromReference} from './strength-reference.mjs';
import {collectStrengthEvidence,resolveStrengthEvidence} from '../src/features/strength-decision-v1/index.js';
import {analyzeMultiaxisStrength} from '../src/features/strength-multiaxis-v1/index.js';

export function abstentionBucket(decision,flags){
 if(decision.direction!==null)throw Error('expected abstention');
 if(decision.conflicts.length)return 'conflict';
 if(decision.grounds.length)return 'unresolved-other';
 return flags.pressureAll?'no-ground-pressure-all':flags.rootLow?'no-ground-low-root':'no-ground-other';
}
export async function evaluateAbstentions(){
 const corpus=JSON.parse(await readFile(new URL('../docs/strength-separated-decision-results.json',import.meta.url),'utf8')).rows;
 const rows=corpus.filter(r=>r.fixed===null).map(c=>{
  const args={saju:chartFromReference(c.pillars),birthBasis:'verified-chart'};
  const e=collectStrengthEvidence(args),r=resolveStrengthEvidence(e);
  const a=analyzeMultiaxisStrength({...args,policy:'strength-multiaxis-v1'});
  if(!r.decision||r.direction!==null)throw Error('historical abstention changed '+c.id);
  const scenarios=a.detail.environment.scenarios;
  if(!scenarios.length)throw Error('missing scenarios '+c.id);
  const flags={rootLow:e.structure.meetsLowCapacity,rootHigh:e.structure.meetsStrongCapacity,
   central:e.structure.centralCandidate,peripheral:e.structure.peripheralCandidate,
   centralBurden:a.detail.environment.centralBurden.length>0,
   pressureAll:scenarios.every(x=>x.pressureDominates),supportAll:scenarios.every(x=>x.support>x.maxPressure),
   localResource:e.environment.unchallengedResources.length>0,routeSupport:e.interaction.robustSupport,routeResource:e.interaction.resourcePresent};
  return {id:c.id,pillars:c.pillars,reference:c.reference,group:c.group,root:e.structure.capacity,
   grounds:r.decision.grounds,conflicts:r.decision.conflicts,flags,
   dominant:e.environment.dominantBurdenCategories,concentrated:e.environment.concentratedBurdenCategories,
   bucket:abstentionBucket(r.decision,flags)};
 });
 const counts=rs=>Object.fromEntries([...new Set(rs.map(r=>r.bucket))].sort().map(k=>{
  const x=rs.filter(r=>r.bucket===k);
  return [k,{n:x.length,strong:x.filter(r=>r.reference==='strong').length,weak:x.filter(r=>r.reference==='weak').length}];
 }));
 const metrics=Object.fromEntries(['primary','secondary','all'].map(g=>[g,counts(rows.filter(r=>g==='all'||r.group===g))]));
 return {metrics,rows};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(await evaluateAbstentions(),null,2));
