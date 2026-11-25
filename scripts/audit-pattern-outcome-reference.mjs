import {readFileSync} from 'node:fs';
import {analyzePatternOutcome,PATTERN_OUTCOME_VERSION} from '../src/index.js';
import {evaluateOutcomeCase,summarizeOutcome} from './lib/pattern-outcome-reference.mjs';
const fixture=JSON.parse(readFileSync(new URL('../test/fixtures/pattern-outcome-reference-v1.json',import.meta.url),'utf8'));
const run=c=>evaluateOutcomeCase(c,analyzePatternOutcome({saju:{pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,c.pillars[i]?{stem:c.pillars[i][0],branch:c.pillars[i][1],text:c.pillars[i]}:null]))},birthBasis:'verified-chart',policy:PATTERN_OUTCOME_VERSION}));
const historical=fixture.cases.map(run),controls=fixture.controls.map(run);
const controlSummary=summarizeOutcome(controls);
console.log(JSON.stringify({version:fixture.version,policy:PATTERN_OUTCOME_VERSION,scope:fixture.scope,historical:summarizeOutcome(historical),controls:controlSummary,rows:historical,controlRows:controls},null,2));
if(controlSummary.byStatus.matched!==controlSummary.probes)process.exitCode=1;
