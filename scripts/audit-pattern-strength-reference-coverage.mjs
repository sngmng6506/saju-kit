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
if(args.length>1||args.some(x=>!['--basis-only','--compare-demand','--compare-supply'].includes(x)))throw Error('Usage: audit-pattern-strength-reference-coverage.mjs [--basis-only | --compare-demand | --compare-supply]');
const basisOnly=args.includes('--basis-only'),compareSupply=args.includes('--compare-supply'),compareDemand=compareSupply||args.includes('--compare-demand');
const alternatives=[...(compareDemand?[{key:'demand',policy:'literal-demand'}]:[]),...(compareSupply?[{key:'supply',policy:'indirect-support'}]:[])];
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
  stage='strengthSynthesis';const input={completeHour:true,nodes:replenishment.nodes,targets:replenishment.targets,burden:burden.analysis};
  const synthesis=check(stage,synthesizeContextualStrength(input));
  stage='referenceObligations';
  const baseline={id,basis,synthesis:observeSynthesisCoverage(synthesis),obligations:observeBurdenObligations(burden,synthesis)};
  for(const {key,policy} of alternatives){
   try{
    const alternate=check(key+'Synthesis',synthesizeContextualStrength({...input,policy}));
    baseline[key+'Synthesis']=observeSynthesisCoverage(alternate);
   }catch(e){baseline[key+'Error']=String(e?.message??e);}
  }
  return baseline;
 }catch(e){return {id,error:stage+': '+String(e?.message??e),...(basis?{basis}:{})};}
});
const report=summarizeReferenceCoverage(cohort,observations);
const comparisons={};
for(const {key} of alternatives){
 const alternate=summarizeReferenceCoverage(cohort,observations.map(o=>o.error?o:o[key+'Error']?{id:o.id,basis:o.basis,error:o[key+'Error']}:{id:o.id,basis:o.basis,synthesis:o[key+'Synthesis']}));
 const changed=observations.filter(o=>!o.error&&!o[key+'Error']&&JSON.stringify(o.synthesis)!==JSON.stringify(o[key+'Synthesis'])).map(o=>({id:o.id,baseline:o.synthesis,[key]:o[key+'Synthesis']}));
 comparisons[key+'Comparison']={primary:alternate.primary,directionDistribution:alternate.directionDistribution,referenceGaps:alternate.referenceGaps,invalid:alternate.invalid,invalidRows:alternate.rows.filter(r=>r.status==='invalid-evidence'),changed,actualAccuracy:null,selectionAuthority:false};
}
if(compareSupply){
 comparisons.supplyComparison.changedFromDemand=observations.filter(o=>!o.error&&!o.demandError&&!o.supplyError&&JSON.stringify(o.demandSynthesis)!==JSON.stringify(o.supplySynthesis)).map(o=>({id:o.id,demand:o.demandSynthesis,supply:o.supplySynthesis}));
}
const passed=report.invalid===0&&Object.values(comparisons).every(c=>c.invalid===0);
console.log(JSON.stringify({...report,sourceInventory,mode:compareSupply?'three-policy-supply-comparison':compareDemand?'paired-demand-comparison':basisOnly?'basis-only':'conditional-synthesis',...comparisons,passed},null,2));
if(!passed)process.exitCode=1;
