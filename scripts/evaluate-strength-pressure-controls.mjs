import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {chartFromReference} from './strength-reference.mjs';
import {collectStrengthEvidence,resolveStrengthEvidence} from '../src/features/strength-decision-v1/index.js';
import {analyzeQuantitativeStrength} from '../src/features/strength-quantitative-v3/index.js';
import {summarizePeerScenarios,candidateDirection} from './evaluate-strength-peer-root-access.mjs';

// Frozen research candidate; no reference labels, author, or case IDs enter the decision.
export function evaluateLivePressureCandidate(input){
 const e=collectStrengthEvidence(input),fixed=resolveStrengthEvidence(e);
 if(!fixed.decision)return {fixed:fixed.direction,eligible:false,p1:fixed.direction,p2:fixed.direction,root:null,grounds:[],conflicts:[],stats:null};
 const args={saju:input.saju,birthBasis:input.birthBasis,policy:'strength-quantitative-v3'};
 const floors={mild:80,pronounced:55};
 const stats=Object.fromEntries(['standard','neutral'].map(season=>[season,summarizePeerScenarios(analyzeQuantitativeStrength(args,{seasonMode:season}).quantitative.scenarios,floors)]));
 const eligible=fixed.direction===null&&!fixed.decision.grounds.length&&!fixed.decision.conflicts.length&&stats.standard.allPressure[0];
 const row={fixed:fixed.direction,bucket:eligible?'no-ground-pressure-all':null,stats};
 return {fixed:fixed.direction,eligible,p1:candidateDirection(row,1),p2:candidateDirection(row,2),
  root:e.structure.capacity,grounds:fixed.decision.grounds,conflicts:fixed.decision.conflicts,
  stats:Object.fromEntries(Object.entries(stats).map(([k,s])=>[k,{n:s.n,allPressure:s.allPressure,margins:[s.margin.base,s.margin.full,s.margin.discount]}]))};
}
export async function evaluatePressureControls(){
 const read=async path=>JSON.parse(await readFile(new URL(path,import.meta.url),'utf8'));
 const [fixture,prior]=await Promise.all([read('../test/fixtures/zou-peer-pressure-controls-v1.json'),read('../docs/strength-separated-decision-results.json')]);
 const controls=['H01','H04','W09','XU14'].map(id=>{const c=prior.rows.find(r=>r.id===id);if(!c)throw Error('missing control '+id);return {...c,track:'historical-diagnostic'}});
 const cases=[...fixture.cases.map(c=>({...c,track:'prospective-same-author'})),...controls];
 return cases.map(c=>({id:c.id,pillars:c.pillars,reference:c.reference,track:c.track,...evaluateLivePressureCandidate({saju:chartFromReference(c.pillars),birthBasis:'verified-chart'})}));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(await evaluatePressureControls(),null,2));
