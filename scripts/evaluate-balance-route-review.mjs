import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {chartFromReference} from './strength-reference.mjs';
import {analyzeElementStructure} from '../src/core/element-structure.js';
import {observeBalanceElements,buildBalanceBranch} from '../src/features/balance-useful-element-v1/evidence.js';
import {evaluateBalanceRoutes} from '../src/features/balance-route-review-v1/index.js';

export function reviewDirections(saju,directions){
 const obs=observeBalanceElements(analyzeElementStructure({saju}));
 return evaluateBalanceRoutes(saju,directions.map(d=>buildBalanceBranch(obs,d)));
}
export function compactReview(id,priorDirection,analysis){
 return {id,priorDirection,robustFocus:analysis.robustFocus,modes:analysis.modes.map(m=>({
  distance:m.distance,pathCount:m.pathCount,allocations:m.allocations,ledgerEntries:m.ledgerEntries,
  scenarioCount:m.reviews[0].scenarioCount,focus:m.reviews.map(x=>x.coverageFocus)
 }))};
}
export async function evaluateBalanceRouteReview(){
 const read=async p=>JSON.parse(await readFile(new URL('../'+p,import.meta.url),'utf8'));
 const fixture=await read('test/fixtures/balance-useful-element-text-v1.json');
 const corpus=(await read('docs/strength-separated-decision-results.json')).rows;
 const texts=fixture.cases.map(c=>{
  const analysis=reviewDirections(chartFromReference(c.pillars),[c.direction]);
  const focus=analysis.robustFocus[0].elements;
  return {id:c.id,direction:c.direction,referenceElement:c.referenceElement,analysis,
   outcome:c.direction==='strong'?'not-evaluated':!focus.length?'abstain':focus.includes(c.referenceElement)?'focus-match':'focus-excludes-reference'};
 });
 const rows=corpus.map(c=>compactReview(c.id,c.fixed,reviewDirections(chartFromReference(c.pillars),['strong','weak'])));
 const total=k=>rows.reduce((s,r)=>s+r.modes.reduce((a,m)=>a+m[k],0),0);
 const counts={charts:rows.length,textControls:texts.length,allocations:total('allocations'),ledgerEntries:total('ledgerEntries'),
  scenarioModeEvaluations:total('scenarioCount'),weakFocus:rows.filter(r=>r.robustFocus[1].elements.length).length,textOutcomes:{}};
 for(const t of texts)counts.textOutcomes[t.outcome]=(counts.textOutcomes[t.outcome]??0)+1;
 return {counts,texts,rows};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(await evaluateBalanceRouteReview(),null,2));
