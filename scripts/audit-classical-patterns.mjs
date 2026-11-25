import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {analyzePatternUsefulElementV3,PATTERN_V3_VERSION} from '../src/features/pattern-useful-element-v3/index.js';
import {analyzePatternUsefulElementV4,PATTERN_V4_VERSION} from '../src/features/pattern-useful-element-v4/index.js';
import {analyzePatternUsefulElementV5,PATTERN_V5_VERSION} from '../src/features/pattern-useful-element-v5/index.js';
import {analyzePatternUsefulElementV6,PATTERN_V6_VERSION} from '../src/features/pattern-useful-element-v6/index.js';
import {analyzePatternUsefulElementV7,PATTERN_V7_VERSION} from '../src/features/pattern-useful-element-v7/index.js';
import {analyzePatternUsefulElementV8,PATTERN_V8_VERSION} from '../src/features/pattern-useful-element-v8/index.js';
import {analyzePatternUsefulElementV9,PATTERN_V9_VERSION} from '../src/features/pattern-useful-element-v9/index.js';
import {analyzePatternUsefulElementV10,PATTERN_V10_VERSION} from '../src/features/pattern-useful-element-v10/index.js';
import {reviewPatternOutcome,summarizeReferenceReadiness,summarizeOutcomeReviews} from './lib/pattern-outcome-review.mjs';
import {reviewPatternEfficacy,summarizeEfficacyReviews,EFFICACY_REVIEW_VERSION} from './lib/pattern-efficacy-review.mjs';
import {reviewOutcomeDecision,summarizeOutcomeDecisions,OUTCOME_DECISION_VERSION} from './lib/pattern-outcome-decision.mjs';
import {analyzeStrengthDecision,STRENGTH_DECISION_VERSION} from '../src/features/strength-decision-v1/index.js';
import {reviewPatternContext,summarizePatternContexts,CONTEXT_REVIEW_VERSION} from './lib/pattern-context-review.mjs';
import {reviewPatternInterference,summarizeInterference,STEM_INTERFERENCE_VERSION} from './lib/pattern-stem-interference.mjs';
import {reviewRoleContrasts,summarizeRoleContrasts,ROLE_CONTRAST_VERSION} from './lib/pattern-role-contrasts.mjs';
import {reviewPatternAccess,scopedOutcome,summarizeAccess,ACCESS_REVIEW_VERSION} from './lib/pattern-access-review.mjs';
import {analyzeInteractionContext} from '../src/core/interaction-context.js';
import {reviewLayerMechanisms,summarizeLayerMechanisms,reviewContrastProjections,summarizeContrastProjections,LAYER_REVIEW_VERSION} from './lib/pattern-layer-mechanisms.mjs';
import {inspectActionReferences,evaluateActionReference,summarizeActionReferences,ACTION_REFERENCE_VERSION} from './lib/pattern-action-reference.mjs';
import {runCommentaryReview} from './lib/classical-commentary-evaluation.mjs';
import {evaluateClassicalCase,summarizeClassical} from './lib/classical-pattern-evaluation.mjs';
const data=JSON.parse(await readFile(new URL('../test/fixtures/pattern-classical-v2.json',import.meta.url),'utf8'));
const commentary=JSON.parse(await readFile(new URL('../test/fixtures/pattern-classical-commentary-v1.json',import.meta.url),'utf8'));
const actionReferences=JSON.parse(await readFile(new URL('../test/fixtures/pattern-action-reference-v1.json',import.meta.url),'utf8'));
export function auditActionReferences({includeRows=false}={}){
 const inventory=inspectActionReferences(actionReferences,data,commentary);
 if(inventory.errors.length)throw Error('invalid action reference corpus: '+JSON.stringify(inventory.errors));
 const cache=new Map();
 const rows=actionReferences.cases.map(ref=>{
  const corpus=ref.author==='沈孝瞻'?data:commentary;
  const c=corpus.cases.find(c=>c.id===ref.chartId);
  if(!cache.has(c.id)){
   const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,pillar(c.pillars[i])]))};
   const result=analyzePatternUsefulElementV10({saju,birthBasis:'verified-chart',policy:PATTERN_V10_VERSION});
   const outcome=reviewPatternOutcome(result),access=reviewPatternAccess(result,outcome);
   const layers=reviewLayerMechanisms(result,access,analyzeInteractionContext({saju}));
   const interference=reviewPatternInterference(result,outcome);
   cache.set(c.id,{result,layers,interference});
  }
  const {result,layers,interference}=cache.get(c.id);
  return evaluateActionReference(ref,result,layers,interference);
 });
 return {policy:ACTION_REFERENCE_VERSION,basePolicy:PATTERN_V10_VERSION,inventory,summary:summarizeActionReferences(rows),
  shen:summarizeActionReferences(rows.filter(r=>r.author==='沈孝瞻')),xu:summarizeActionReferences(rows.filter(r=>r.author==='徐樂吾')),
  independentValidation:false,...(includeRows?{rows,partialTemplates:actionReferences.partialTemplates}:{})};
}
export function auditClassicalCommentary(){
 return runCommentaryReview(commentary,data,saju=>analyzePatternUsefulElementV10({saju,birthBasis:'verified-chart',policy:PATTERN_V10_VERSION}),reviewPatternOutcome);
}
const pillar=text=>({stem:text[0],branch:text[1],text});
export function auditClassicalPatterns(policy=PATTERN_V3_VERSION){
 const analyze=policy===PATTERN_V3_VERSION?analyzePatternUsefulElementV3:policy===PATTERN_V4_VERSION?analyzePatternUsefulElementV4:policy===PATTERN_V5_VERSION?analyzePatternUsefulElementV5:policy===PATTERN_V6_VERSION?analyzePatternUsefulElementV6:policy===PATTERN_V7_VERSION?analyzePatternUsefulElementV7:policy===PATTERN_V8_VERSION?analyzePatternUsefulElementV8:policy===PATTERN_V9_VERSION?analyzePatternUsefulElementV9:policy===PATTERN_V10_VERSION?analyzePatternUsefulElementV10:null;
 if(!analyze)throw new Error('unsupported audit policy');
 const rows=data.cases.map(c=>{
  const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,pillar(c.pillars[i])]))};
  return evaluateClassicalCase(c,analyze({saju,birthBasis:'verified-chart',policy}));
 });
 return {version:data.version,policy,summary:summarizeClassical(rows),newReference:summarizeClassical(rows.filter(r=>r.split==='new-reference')),developmentKnown:summarizeClassical(rows.filter(r=>r.split==='development-known')),rows};
}
export function auditPatternOutcomes({includeRows=false}={}){
 const reviews=data.cases.map(c=>{
  const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,pillar(c.pillars[i])]))};
  return {id:c.id,eligible:c.eligible,...reviewPatternOutcome(analyzePatternUsefulElementV10({saju,birthBasis:'verified-chart',policy:PATTERN_V10_VERSION}))};
 });
 return {policy:PATTERN_V10_VERSION,referenceReadiness:summarizeReferenceReadiness(data.cases),all:summarizeOutcomeReviews(reviews),eligible:summarizeOutcomeReviews(reviews.filter(r=>r.eligible)),...(includeRows?{rows:reviews}:{})};
}
export function auditPatternEfficacy({includeRows=false}={}){
 const run=(cases)=>cases.map(c=>{
  const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,pillar(c.pillars[i])]))};
  const result=analyzePatternUsefulElementV10({saju,birthBasis:'verified-chart',policy:PATTERN_V10_VERSION});
  return {id:c.id,...reviewPatternEfficacy(result,reviewPatternOutcome(result))};
 });
 const shen=run(data.cases.filter(c=>c.eligible)),xu=run(commentary.cases);
 return {policy: EFFICACY_REVIEW_VERSION,basePolicy:PATTERN_V10_VERSION,
  shen:{version:data.version,summary:summarizeEfficacyReviews(shen),...(includeRows?{rows:shen}:{})},
  xu:{version:commentary.version,summary:summarizeEfficacyReviews(xu),...(includeRows?{rows:xu}:{})},
  excludedShen:data.cases.filter(c=>!c.eligible).length,independentValidation:false};
}
export function auditOutcomeDecisions({includeRows=false}={}){
 const run=cases=>cases.map(c=>{
  const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,pillar(c.pillars[i])]))};
  const result=analyzePatternUsefulElementV10({saju,birthBasis:'verified-chart',policy:PATTERN_V10_VERSION});
  const outcome=reviewPatternOutcome(result),efficacy=reviewPatternEfficacy(result,outcome);
  return {id:c.id,...reviewOutcomeDecision(result,outcome,efficacy)};
 });
 const shen=run(data.cases.filter(c=>c.eligible)),xu=run(commentary.cases);
 return {policy:OUTCOME_DECISION_VERSION,basePolicy:PATTERN_V10_VERSION,
  shen:{version:data.version,summary:summarizeOutcomeDecisions(shen),...(includeRows?{rows:shen}:{})},
  xu:{version:commentary.version,summary:summarizeOutcomeDecisions(xu),...(includeRows?{rows:xu}:{})},
  excludedShen:data.cases.filter(c=>!c.eligible).length,independentValidation:false};
}
export function auditPatternContexts({includeRows=false}={}){
 const run=cases=>cases.map(c=>{
  const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,pillar(c.pillars[i])]))};
  const args={saju,birthBasis:'verified-chart'};
  const result=analyzePatternUsefulElementV10({...args,policy:PATTERN_V10_VERSION});
  const outcome=reviewPatternOutcome(result),efficacy=reviewPatternEfficacy(result,outcome);
  const decision=reviewOutcomeDecision(result,outcome,efficacy);
  const strength=analyzeStrengthDecision({...args,policy:STRENGTH_DECISION_VERSION});
  return {id:c.id,...reviewPatternContext(result,outcome,efficacy,decision,strength)};
 });
 const shen=run(data.cases.filter(c=>c.eligible)),xu=run(commentary.cases);
 return {policy:CONTEXT_REVIEW_VERSION,basePolicy:PATTERN_V10_VERSION,strengthPolicy:STRENGTH_DECISION_VERSION,
  shen:{version:data.version,summary:summarizePatternContexts(shen),...(includeRows?{rows:shen}:{})},
  xu:{version:commentary.version,summary:summarizePatternContexts(xu),...(includeRows?{rows:xu}:{})},
  excludedShen:data.cases.filter(c=>!c.eligible).length,independentValidation:false};
}
export function auditPatternInterference({includeRows=false}={}){
 const run=cases=>cases.map(c=>{
  const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,pillar(c.pillars[i])]))};
  const result=analyzePatternUsefulElementV10({saju,birthBasis:'verified-chart',policy:PATTERN_V10_VERSION});
  return {id:c.id,...reviewPatternInterference(result,reviewPatternOutcome(result))};
 });
 const shen=run(data.cases.filter(c=>c.eligible)),xu=run(commentary.cases);
 return {policy:STEM_INTERFERENCE_VERSION,basePolicy:PATTERN_V10_VERSION,
  shen:{version:data.version,summary:summarizeInterference(shen),...(includeRows?{rows:shen}:{})},
  xu:{version:commentary.version,summary:summarizeInterference(xu),...(includeRows?{rows:xu}:{})},
  excludedShen:data.cases.filter(c=>!c.eligible).length,independentValidation:false};
}
export function auditRoleContrasts({includeRows=false}={}){
 const run=cases=>cases.map(c=>{
  const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,pillar(c.pillars[i])]))};
  const args={saju,birthBasis:'verified-chart'};
  const result=analyzePatternUsefulElementV10({...args,policy:PATTERN_V10_VERSION});
  const outcome=reviewPatternOutcome(result),efficacy=reviewPatternEfficacy(result,outcome);
  const decision=reviewOutcomeDecision(result,outcome,efficacy);
  const strength=analyzeStrengthDecision({...args,policy:STRENGTH_DECISION_VERSION});
  const context=reviewPatternContext(result,outcome,efficacy,decision,strength);
  const interference=reviewPatternInterference(result,outcome);
  return {id:c.id,...reviewRoleContrasts(result,outcome,context,interference)};
 });
 const shen=run(data.cases.filter(c=>c.eligible)),xu=run(commentary.cases);
 return {policy:ROLE_CONTRAST_VERSION,basePolicy:PATTERN_V10_VERSION,strengthPolicy:STRENGTH_DECISION_VERSION,
  shen:{version:data.version,summary:summarizeRoleContrasts(shen),...(includeRows?{rows:shen}:{})},
  xu:{version:commentary.version,summary:summarizeRoleContrasts(xu),...(includeRows?{rows:xu}:{})},
  excludedShen:data.cases.filter(c=>!c.eligible).length,independentValidation:false};
}
export function auditPatternAccess({includeRows=false}={}){
 const run=cases=>cases.map(c=>{
  const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,pillar(c.pillars[i])]))};
  const result=analyzePatternUsefulElementV10({saju,birthBasis:'verified-chart',policy:PATTERN_V10_VERSION});
  const outcome=reviewPatternOutcome(result),access=reviewPatternAccess(result,outcome);
  const interference=reviewPatternInterference(result,outcome);
  const legacy=reviewRoleContrasts(result,outcome,null,interference);
  const scoped=reviewRoleContrasts(result,scopedOutcome(outcome,access),null,interference);
  return {id:c.id,access,legacy,scoped};
 });
 const summarize=rows=>({access:summarizeAccess(rows.map(r=>r.access)),legacy:summarizeRoleContrasts(rows.map(r=>r.legacy)),scoped:summarizeRoleContrasts(rows.map(r=>r.scoped)),...(includeRows?{rows}:{})});
 return {policy:ACCESS_REVIEW_VERSION,basePolicy:PATTERN_V10_VERSION,
  scope:'structural-anchor-ablation-without-strength-proxy',shen:summarize(run(data.cases.filter(c=>c.eligible))),xu:summarize(run(commentary.cases)),
  excludedShen:data.cases.filter(c=>!c.eligible).length,independentValidation:false};
}
export function auditLayerMechanisms({includeRows=false}={}){
 const run=cases=>cases.map(c=>{
  const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,pillar(c.pillars[i])]))};
  const result=analyzePatternUsefulElementV10({saju,birthBasis:'verified-chart',policy:PATTERN_V10_VERSION});
  const outcome=reviewPatternOutcome(result),access=reviewPatternAccess(result,outcome);
  const interaction=analyzeInteractionContext({saju});
  const layers=reviewLayerMechanisms(result,access,interaction);
  const contrasts=reviewRoleContrasts(result,scopedOutcome(outcome,access),null,reviewPatternInterference(result,outcome));
  return {id:c.id,layers,projections:reviewContrastProjections(contrasts,access,layers)};
 });
 const summarize=rows=>({layers:summarizeLayerMechanisms(rows.map(r=>r.layers)),projections:summarizeContrastProjections(rows.map(r=>r.projections)),...(includeRows?{rows}:{})});
 return {policy:LAYER_REVIEW_VERSION,basePolicy:PATTERN_V10_VERSION,shen:summarize(run(data.cases.filter(c=>c.eligible))),xu:summarize(run(commentary.cases)),
  excludedShen:data.cases.filter(c=>!c.eligible).length,independentValidation:false};
}
export function auditPatternProgression(){
 return [PATTERN_V3_VERSION,PATTERN_V4_VERSION,PATTERN_V5_VERSION,PATTERN_V6_VERSION,PATTERN_V7_VERSION,PATTERN_V8_VERSION,PATTERN_V9_VERSION,PATTERN_V10_VERSION].map(policy=>{
  const {summary,newReference,developmentKnown}=auditClassicalPatterns(policy);
  return {policy,summary,newReference,developmentKnown};
 });
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url)console.log(JSON.stringify(process.argv.includes('--action-references')?auditActionReferences({includeRows:process.argv.includes('--rows')}):process.argv.includes('--layers')?auditLayerMechanisms({includeRows:process.argv.includes('--rows')}):process.argv.includes('--access')?auditPatternAccess({includeRows:process.argv.includes('--rows')}):process.argv.includes('--role-contrasts')?auditRoleContrasts({includeRows:process.argv.includes('--rows')}):process.argv.includes('--interference')?auditPatternInterference({includeRows:process.argv.includes('--rows')}):process.argv.includes('--context')?auditPatternContexts({includeRows:process.argv.includes('--rows')}):process.argv.includes('--decisions')?auditOutcomeDecisions({includeRows:process.argv.includes('--rows')}):process.argv.includes('--efficacy')?auditPatternEfficacy({includeRows:process.argv.includes('--rows')}):process.argv.includes('--commentary')?auditClassicalCommentary():process.argv.includes('--outcomes')?auditPatternOutcomes({includeRows:process.argv.includes('--rows')}):process.argv.includes('--progression')?auditPatternProgression():process.argv.includes('--mixed-compare')?{baseline:auditClassicalPatterns(PATTERN_V7_VERSION),experimental:auditClassicalPatterns(PATTERN_V8_VERSION)}:process.argv.includes('--composition-compare')?{baseline:auditClassicalPatterns(PATTERN_V6_VERSION),experimental:auditClassicalPatterns(PATTERN_V7_VERSION)}:process.argv.includes('--preference-compare')?{baseline:auditClassicalPatterns(PATTERN_V5_VERSION),experimental:auditClassicalPatterns(PATTERN_V6_VERSION)}:process.argv.includes('--preference')?auditClassicalPatterns(PATTERN_V5_VERSION):process.argv.includes('--compare')?{baseline:auditClassicalPatterns(),experimental:auditClassicalPatterns(PATTERN_V4_VERSION)}:auditClassicalPatterns(),null,2));
