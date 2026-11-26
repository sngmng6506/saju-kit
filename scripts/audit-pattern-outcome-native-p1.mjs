import {readFileSync} from 'node:fs';
import {isDeepStrictEqual} from 'node:util';
import {analyzePatternOutcomeV10,PATTERN_OUTCOME_V10_VERSION,analyzeStrengthDecision,STRENGTH_DECISION_VERSION} from '../src/index.js';
import {projectRegulationStrength} from '../src/features/pattern/outcome-regulation-strength.js';
import {resolveDayDirection} from '../src/features/pattern/outcome-day-balance-direction.js';
import {controls,routeControls,replayModeledCoverage} from './lib/pattern-modeled-consequence-coverage.mjs';

// Native public entry point, not a source-transformed module-body replay.
// Development packets and synthetic literal controls are not independent gold.
const packets=['pattern-outcome-role-policy-source-v1','pattern-modeled-consequence-source-contrast-v1'];
const cases=packets.flatMap(packet=>JSON.parse(readFileSync(new URL('../test/fixtures/'+packet+'.json',import.meta.url),'utf8')).cases.map(c=>({...c,population:'development',packet})))
 .concat([...controls,...routeControls].map(c=>({...c,population:'synthetic'})));
const rows=[],errors=[];
const compare=(errors,field,actual,expected)=>{
 if(!isDeepStrictEqual(actual,expected))errors.push({field,reason:'projection-mismatch'});
};
for(const c of cases)for(const completeHour of [true,false]){
 const scope=completeHour?'complete':'partial',status=completeHour?'diagnostic':'partial',issues=[];
 const row={id:c.id,population:c.population,scope,issues};
 try{
  const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,!completeHour&&i===3?null:{stem:c.pillars[i][0],branch:c.pillars[i][1],text:c.pillars[i]}]))};
  const args={saju,birthBasis:'verified-chart'};
  const native=analyzePatternOutcomeV10({...args,policy:PATTERN_OUTCOME_V10_VERSION});
  const strength=projectRegulationStrength(completeHour?analyzeStrengthDecision({...args,policy:STRENGTH_DECISION_VERSION}):null,completeHour);
  compare(issues,'regulationStrength',native.regulationStrength,strength);
  compare(issues,'completeHour',native.completeHour,completeHour);
  compare(issues,'efficacyReview.status',native.efficacyReview?.status,status);
  const m=native.efficacyReview?.mechanismReview;
  if(!m)throw Error('missing-mechanism-review');
  // Pass the independently calculated production strength to the original
  // core replay. Do not inject a fixture direction or require a direction.
  const r=replayModeledCoverage(c.pillars,completeHour,{strengthHypothesis:strength,includeSynthesisInputs:true});
  if(r.invalid.length)issues.push({field:'core',reason:'invalid-contract',invalid:r.invalid});
  for(const [field,expected] of Object.entries(r.diagnosticFields))compare(issues,field,m[field],expected);
  // Native/replay now share a composition owner. Parity checks integration
  // and transport, not independent correctness of the same implementation.
  const added=['generationSynthesis','interactionDependencies','interactionScenarios','interactionProofs','conditionalJoint','replenishmentReview','burdenReview','strengthSynthesis'];
  for(const field of added){
   const q=m[field];
   if(!q||q.status!==status||q.completeHour!==completeHour||q.selectionAuthority!==false||q.effective!==null)
    issues.push({field,reason:'diagnostic-authority-or-scope'});
  }
  const gen=m.generationSynthesis;
  if(gen?.actions?.some(x=>x.actualReleaseState!=='unresolved'||x.actualSupplyState!=='unresolved'||x.actualReceptionState!=='unresolved'||x.actualBenefitState!=='unresolved'||x.receptionState!=='unresolved'))
   issues.push({field:'generationSynthesis',reason:'generation-effect-promotion'});
  for(const field of ['interactionDependencies','interactionScenarios','interactionProofs','conditionalJoint','replenishmentReview','burdenReview','strengthSynthesis'])
   if(m[field]?.summary?.actualEffectsConfirmed!==0)issues.push({field,reason:'actual-effect-promotion'});
  if(!completeHour&&(m.interactionScenarios?.space?.status!=='partial'||m.interactionProofs?.summary?.analysisStatus!=='partial'||m.conditionalJoint?.analysis?.status!=='partial'))
   issues.push({field:'interactionDiagnostics',reason:'partial-scenario-promotion'});
  compare(issues,'dayDirection',m.dayBalanceDirectionReview?.direction,resolveDayDirection(strength,completeHour));
  const d=native.decisionReview,actions=m.actionSynthesis?.actions;
  if(!d||d.status!=='abstained'||d.selectionAuthority!==false||native.selectionAuthority!==false||
   ['selectedPattern','formed','broken','rescued','assistantGod','patternUsefulGod','usefulElement'].some(k=>native[k]!==null)||
   !d.release?.axes||Object.values(d.release.axes).some(x=>x.authorized!==false))issues.push({field:'decisionReview',reason:'decision-authority-or-invalid-evidence'});
  if(!Array.isArray(actions)||actions.length!==r.actionCount||actions.some(a=>a.actualEffect.state!=='unresolved'||a.actualReceptionState!=='unresolved'||a.actualBenefitState!=='unresolved'||
   a.selectionAuthority!==false||a.effective!==null||!completeHour&&(a.disposition!=='partial'||a.supportedKinds.length||a.objective&&a.objective.fit.state!=='unresolved')))
   issues.push({field:'actionSynthesis',reason:'action-authority-or-scope'});
  if(c.expected!==undefined){
   const q=r.rows.find(a=>a.edgeId==='visible:month>visible:day'&&a.kind===c.kind);
   compare(issues,'synthetic-consequence',q?.state,completeHour?c.expected:'unresolved');
  }
  if(c.expectedRoute!==undefined)compare(issues,'synthetic-route',r.interpositionRoutes.find(p=>p.pathId===JSON.stringify(c.route))?.state,completeHour?c.expectedRoute:'unresolved');
  if(c.edgeId){
   const q=r.rows.find(a=>a.edgeId===c.edgeId&&a.clauseId===c.clauseId);
   if(!q||c.label==='explicit-opposition'&&q.state==='supported')issues.push({field:'source-contrast',reason:'missing-or-contradicted-contrast'});
  }
  row.strength={status:strength.status,direction:strength.direction,grounds:strength.grounds,conflicts:strength.conflicts};
  row.direction=m.dayBalanceDirectionReview?.direction??null;
  row.summary=m.actionSynthesis?.summary??null;
 }catch(e){issues.push({field:'execution',reason:e.message,code:e.code??null});}
 row.passed=issues.length===0;
 rows.push(row);
 if(!row.passed)errors.push({id:c.id,population:c.population,scope,issues});
}
const expectedVariants=cases.length*2;
const historical=rows.filter(r=>r.population==='development'&&r.scope==='complete'&&r.passed);
const directionCounts=Object.fromEntries(['strong','weak','unresolved'].map(direction=>[direction,historical.filter(r=>(r.direction?.direction??'unresolved')===direction).length]));
const passed=errors.length===0&&rows.length===expectedVariants&&expectedVariants>0;
console.log(JSON.stringify({version:'p3-native-outcome-v2',scope:'native-public-v10-composition-parity-and-strength-projection-not-independent-accuracy',
 node:process.version,expectedVariants,executedVariants:rows.length,passedVariants:rows.filter(r=>r.passed).length,
 directionCounts,independentGoldCases:0,selectionAuthority:false,passed,errors,rows},null,2));
if(!passed)process.exitCode=1;
