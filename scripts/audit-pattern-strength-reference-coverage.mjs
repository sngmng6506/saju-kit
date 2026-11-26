import {strengthAuditFixtureNames,verifyStrengthAuditInventory} from './lib/strength-audit-inventory.mjs';
import {readFileSync} from 'node:fs';
import {analyzeStemForceEvidence} from '../src/core/stem-force.js';
import {observeRelativeForce} from '../src/core/relative-force.js';
import {analyzeFormationEvidence} from '../src/core/formation-evidence.js';
import {observeRootContext} from '../src/features/pattern/outcome-root-context.js';
import {observeGroundedSupply} from '../src/features/pattern/outcome-grounded-supply.js';
import {reviewReplenishment} from '../src/features/pattern/outcome-replenishment-review.js';
import {reviewBurden} from '../src/features/pattern/outcome-burden-review.js';
import {synthesizeContextualStrength} from '../src/features/pattern/outcome-strength-synthesis.js';
import {inspectActionDiagnostics} from '../src/features/pattern/outcome-action-diagnostic-contract.js';
import {buildReferenceCoverageCohort,observeReferenceBasis,observeSynthesisCoverage,observeBurdenObligations,summarizeReferenceCoverage} from './lib/pattern-strength-reference-coverage.mjs';
const read=name=>JSON.parse(readFileSync(new URL('../test/fixtures/'+name+'.json',import.meta.url),'utf8'));
const args=process.argv.slice(2);
if(args.length>1||args.some(x=>x!=='--basis-only'))throw Error('Usage: audit-pattern-strength-reference-coverage.mjs [--basis-only]');
const basisOnly=args.includes('--basis-only');
const audit=read('strength-audit-v1');
const sourceInventory=verifyStrengthAuditInventory(strengthAuditFixtureNames.map(name=>({name,cases:read(name).cases})),audit);
const cohort=buildReferenceCoverageCohort(audit,read('pattern-classical-v2'));
const observations=cohort.rows.map(({id,pillars})=>{
 let stage='rootContext',basis;
 try{
  const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,{stem:pillars[i][0],branch:pillars[i][1],text:pillars[i]}]))};
  const stemForce=analyzeStemForceEvidence({saju}),prior={completeHour:true,stemForce,relativeForce:observeRelativeForce(stemForce)};
  const root=observeRootContext(prior,analyzeFormationEvidence({saju}));basis=observeReferenceBasis(prior,root);
  if(basisOnly)return {id,basis};
  const check=(owner,r)=>{
   const issues=inspectActionDiagnostics({[owner]:r},true);
   if(issues.length)throw Error(JSON.stringify(issues));
   return r;
  };
  stage='groundedSupply';const supply=check(stage,observeGroundedSupply(prior,root));
  stage='replenishmentReview';const replenishment=check(stage,reviewReplenishment(prior,root,supply));
  stage='burdenReview';const burden=check(stage,reviewBurden(prior,replenishment));
  stage='strengthSynthesis';const synthesis=check(stage,synthesizeContextualStrength({completeHour:true,nodes:replenishment.nodes,targets:replenishment.targets,burden:burden.analysis}));
  stage='referenceObligations';
  return {id,basis,synthesis:observeSynthesisCoverage(synthesis),obligations:observeBurdenObligations(burden,synthesis)};
 }catch(e){return {id,error:stage+': '+String(e?.message??e),...(basis?{basis}:{})};}
});
const report=summarizeReferenceCoverage(cohort,observations);
console.log(JSON.stringify({...report,sourceInventory,mode:basisOnly?'basis-only':'conditional-synthesis',passed:report.invalid===0},null,2));
if(report.invalid)process.exitCode=1;
