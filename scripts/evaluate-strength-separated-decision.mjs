import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {chartFromReference} from './strength-reference.mjs';
import {collectStrengthEvidence,resolveStrengthEvidence} from '../src/features/strength-decision-v1/index.js';
import {analyzeMultiaxisStrengthV4} from '../src/features/strength-multiaxis-v4/index.js';
import assert from 'node:assert/strict';

export async function evaluateSeparatedDecision(){
 const corpus=JSON.parse(await readFile(new URL('../docs/strength-root-position-results.json',import.meta.url),'utf8')).rows;
 const rows=corpus.map(c=>{
  const args={saju:chartFromReference(c.pillars),birthBasis:'verified-chart'};
  const evidence=collectStrengthEvidence(args),before=JSON.stringify(evidence);
  const fixed=resolveStrengthEvidence(evidence);
  const experimental=resolveStrengthEvidence(evidence,{peripheralAuthority:'independent-experimental'});
  const old=analyzeMultiaxisStrengthV4({...args,policy:'strength-multiaxis-v4'});
  for(const key of ['direction','status','decision','seasonRobustness'])assert.deepEqual(fixed[key],old[key],c.id+' '+key);
  assert.equal(fixed.direction,c.v4[0],c.id+' historical direction');
  assert.equal(JSON.stringify(evidence),before,c.id+' mutated');
  return {id:c.id,pillars:c.pillars,reference:c.reference,group:c.group,fixed:fixed.direction,experimental:experimental.direction,peripheralCandidate:evidence.structure.peripheralCandidate,centralCandidate:evidence.structure.centralCandidate};
 });
 const metrics=Object.fromEntries(['primary','secondary','all'].map(g=>{
  const rs=rows.filter(r=>g==='all'||r.group===g);
  return [g,Object.fromEntries(['fixed','experimental'].map(k=>{
   const agree=rs.filter(r=>r[k]===r.reference).length,abstain=rs.filter(r=>r[k]===null).length,disagree=rs.length-agree-abstain;
   return [k,{n:rs.length,agree,disagree,abstain,coverage:rs.length?(agree+disagree)/rs.length:null,conditionalAgreement:agree+disagree?agree/(agree+disagree):null}];
  }))];
 }));
 return {metrics,rows};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(await evaluateSeparatedDecision(),null,2));
