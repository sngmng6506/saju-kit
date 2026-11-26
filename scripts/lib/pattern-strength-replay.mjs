import {analyzeStemForceEvidence} from '../../src/core/stem-force.js';
import {observeRelativeForce} from '../../src/core/relative-force.js';
import {analyzeFormationEvidence} from '../../src/core/formation-evidence.js';
import {observeRootContext} from '../../src/features/pattern/outcome-root-context.js';
import {observeGroundedSupply} from '../../src/features/pattern/outcome-grounded-supply.js';
import {reviewReplenishment} from '../../src/features/pattern/outcome-replenishment-review.js';
import {reviewBurden} from '../../src/features/pattern/outcome-burden-review.js';
import {inspectActionDiagnostics} from '../../src/features/pattern/outcome-action-diagnostic-contract.js';
import {observeReferenceBasis} from './pattern-strength-reference-coverage.mjs';
import {normalizeExposurePillars} from './pattern-outcome-exposure.mjs';
// Shared literal-chart replay. No reference labels or reviewer decisions
// are accepted by the chart-derived calculation.
export function buildLiteralStrengthInput(pillars,{basisOnly=false,onStage=()=>{},onBasis=()=>{}}={}){
 onStage('rootContext');
 const p=normalizeExposurePillars(pillars);
 if(!p?.complete||!p.sexagenary)throw Error('pillar-contract');
 const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((x,i)=>[x,{stem:p.pillars[i][0],branch:p.pillars[i][1],text:p.pillars[i]}]))};
 const stemForce=analyzeStemForceEvidence({saju}),prior={completeHour:true,stemForce,relativeForce:observeRelativeForce(stemForce)};
 const root=observeRootContext(prior,analyzeFormationEvidence({saju})),basis=observeReferenceBasis(prior,root);
 onBasis(basis);
 if(basisOnly)return {basis};
 const check=(owner,r)=>{
  const issues=inspectActionDiagnostics({[owner]:r},true);
  if(issues.length)throw Error(JSON.stringify(issues));
  return r;
 };
 onStage('groundedSupply');const supply=check('groundedSupply',observeGroundedSupply(prior,root));
 onStage('replenishmentReview');const replenishment=check('replenishmentReview',reviewReplenishment(prior,root,supply));
 onStage('burdenReview');const burden=check('burdenReview',reviewBurden(prior,replenishment));
 return {basis,burden,input:{completeHour:true,nodes:replenishment.nodes,targets:replenishment.targets,burden:burden.analysis}};
}
