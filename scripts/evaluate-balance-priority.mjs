import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {chartFromReference} from './strength-reference.mjs';
import {analyzeElementStructure} from '../src/core/element-structure.js';
import {analyzeQuantitativeStrength} from '../src/features/strength-quantitative-v3/index.js';
import {observeBalanceElements,buildBalanceBranch} from '../src/features/balance-useful-element-v1/evidence.js';
import {reviewBalancePriority} from '../src/features/balance-priority-v1/evidence.js';
export function evaluatePriorityBranches(saju,directions){
 const obs=observeBalanceElements(analyzeElementStructure({saju}));
 const args={saju,birthBasis:'verified-chart',policy:'strength-quantitative-v3'};
 const standard=analyzeQuantitativeStrength(args).quantitative.scenarios;
 const neutral=analyzeQuantitativeStrength(args,{seasonMode:'neutral'}).quantitative.scenarios;
 return directions.map(d=>reviewBalancePriority(buildBalanceBranch(obs,d),standard,neutral));
}
export async function evaluateBalancePriority(){
 const read=async p=>JSON.parse(await readFile(new URL('../'+p,import.meta.url),'utf8'));
 const fixture=await read('test/fixtures/balance-useful-element-text-v1.json');
 const corpus=(await read('docs/strength-separated-decision-results.json')).rows;
 const texts=fixture.cases.map(c=>{
  const [review]=evaluatePriorityBranches(chartFromReference(c.pillars),[c.direction]);
  const matching=corpus.find(r=>r.pillars.join('')===c.pillars.join(''));
  return {id:c.id,direction:c.direction,referenceElement:c.referenceElement,knownStrengthRecord:matching?.id??null,review,
   outcome:!review.reviewFocus.length?'abstain':review.reviewFocus.some(x=>x.element===c.referenceElement)?review.reviewFocus.length===1?'single-focus-match':'multiple-focus-includes':'focus-excludes-reference'};
 });
 const rows=corpus.map(c=>({id:c.id,priorDirection:c.fixed,reviews:evaluatePriorityBranches(chartFromReference(c.pillars),['strong','weak'])}));
 const counts={charts:rows.length,reviews:rows.length*2,statuses:{},textOutcomes:{}};
 for(const x of rows.flatMap(r=>r.reviews))counts.statuses[x.status]=(counts.statuses[x.status]??0)+1;
 for(const x of texts)counts.textOutcomes[x.outcome]=(counts.textOutcomes[x.outcome]??0)+1;
 return {counts,texts,rows};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(await evaluateBalancePriority(),null,2));
