import {readFileSync} from 'node:fs';
import {analyzePatternOutcomeV2,analyzePatternOutcomeV3,PATTERN_OUTCOME_V2_VERSION,PATTERN_OUTCOME_V3_VERSION} from '../src/index.js';
import {evaluateOutcomeCase,summarizeOutcome} from './lib/pattern-outcome-reference.mjs';
import {mapOutcomeReferenceV2} from './lib/pattern-outcome-v2-mapping.mjs';
import {mapOutcomeReferenceV3} from './lib/pattern-outcome-v3-mapping.mjs';
const data=JSON.parse(readFileSync(new URL('../test/fixtures/pattern-outcome-reference-v1.json',import.meta.url),'utf8'));
const chart=c=>({pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,c.pillars[i]?{stem:c.pillars[i][0],branch:c.pillars[i][1],text:c.pillars[i]}:null]))});
const run=(rows,fn,policy,map)=>rows.map(c=>evaluateOutcomeCase(map(c),fn({saju:chart(c),birthBasis:'verified-chart',policy})));
const baseline=run(data.cases,analyzePatternOutcomeV2,PATTERN_OUTCOME_V2_VERSION,mapOutcomeReferenceV2);
const candidate=run(data.cases,analyzePatternOutcomeV3,PATTERN_OUTCOME_V3_VERSION,mapOutcomeReferenceV3);
const controls=run(data.controls,analyzePatternOutcomeV3,PATTERN_OUTCOME_V3_VERSION,mapOutcomeReferenceV3);
const flatten=rows=>rows.flatMap(r=>r.probes.map(p=>({...p,key:r.id+':'+p.id})));
const before=flatten(baseline),after=flatten(candidate),byKey=new Map(after.map(p=>[p.key,p]));
const regressions=before.filter(p=>p.status==='matched'&&byKey.get(p.key)?.status!=='matched').map(p=>p.key);
const gained=after.filter(p=>p.status==='matched'&&before.find(b=>b.key===p.key)?.status!=='matched').map(p=>p.key);
const fixed=x=>({hits:x.filter(p=>p.status==='matched'&&p.expected==='present').length,total:x.filter(p=>p.expected==='present').length});
const controlSummary=summarizeOutcome(controls);
console.log(JSON.stringify({fixture:data.version,scope:'fixed-denominator structural role probes; not final outcome accuracy',
 baseline:{policy:PATTERN_OUTCOME_V2_VERSION,summary:summarizeOutcome(baseline),allPositive:fixed(before)},
 candidate:{policy:PATTERN_OUTCOME_V3_VERSION,summary:summarizeOutcome(candidate),allPositive:fixed(after)},
 regressions,gained,controls:controlSummary,rows:candidate,controlRows:controls},null,2));
if(regressions.length||controlSummary.byStatus.matched!==controlSummary.probes)process.exitCode=1;
