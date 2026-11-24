import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {chartFromReference} from './strength-reference.mjs';
import {weakPathChecks,candidateDirections} from './evaluate-strength-weak-paths.mjs';
import {analyzeMultiaxisStrength} from '../src/features/strength-multiaxis-v1/index.js';
import {analyzeMultiaxisStrengthV3} from '../src/features/strength-multiaxis-v3/index.js';
import {analyzeMultiaxisStrengthV4} from '../src/features/strength-multiaxis-v4/index.js';
import {analyzeRootDynamics} from '../src/core/root-dynamics.js';

export async function evaluateZouHoldout(){
 const fixture=JSON.parse(await readFile(new URL('../test/fixtures/ordinary-zou-holdout-v1.json',import.meta.url),'utf8'));
 const variants=['v3','G0-v4','G1-any-principal','G2-unclashed-principal','G3-local-rooted-peer','G4-neutral-direction','G5-include-peer-root-mass'];
 const rows=fixture.cases.map(c=>{
  const args={saju:chartFromReference(c.pillars),birthBasis:'verified-chart'};
  const v1=analyzeMultiaxisStrength({...args,policy:'strength-multiaxis-v1'});
  const v3=analyzeMultiaxisStrengthV3({...args,policy:'strength-multiaxis-v3'});
  const v4=analyzeMultiaxisStrengthV4({...args,policy:'strength-multiaxis-v4'});
  const neutral=analyzeMultiaxisStrengthV3({...args,policy:'strength-multiaxis-v3'},{seasonMode:'neutral'});
  const dynamics=analyzeRootDynamics({saju:args.saju});
  const checks=weakPathChecks(v1,dynamics,neutral);
  return {id:c.id,pillars:c.pillars,reference:c.reference,group:c.formation==='ordinary'?'primary':'secondary',v3:v3.direction,v4:v4.direction,checks,results:candidateDirections(v4.direction,checks),root:v1.axes.rootCapacity,grounds:v4.decision.grounds,conflicts:v4.decision.conflicts,gate:v4.seasonRobustness.required,neutral:neutral.direction};
 });
 function metrics(rs){
  return Object.fromEntries(variants.map((id,i)=>{
   const predictions=rs.map(r=>i===0?r.v3:r.results[i-1]);
   const agree=predictions.filter((p,j)=>p===rs[j].reference).length,abstain=predictions.filter(p=>p===null).length,disagree=rs.length-agree-abstain;
   return [id,{n:rs.length,agree,disagree,abstain,coverage:rs.length?(agree+disagree)/rs.length:null,conditionalAgreement:agree+disagree?agree/(agree+disagree):null}];
  }));
 }
 return {variants,metrics:{primary:metrics(rows.filter(r=>r.group==='primary')),secondary:metrics(rows.filter(r=>r.group==='secondary')),all:metrics(rows)},rows};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(await evaluateZouHoldout(),null,2));
