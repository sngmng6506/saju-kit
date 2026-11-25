import {readFileSync} from 'node:fs';
import {chartFromReference} from './strength-reference.mjs';
import {analyzeUsefulElementSynthesis,USEFUL_ELEMENT_SYNTHESIS_VERSION} from '../src/index.js';
const data=JSON.parse(readFileSync(new URL('../test/fixtures/useful-element-method-controls-v1.json',import.meta.url),'utf8'));
const rows=[],errors=[];
for(const c of [...data.cases,...data.negativeControls]){
 try{
  const saju=chartFromReference(c.pillars),r=analyzeUsefulElementSynthesis({saju,birthBasis:'verified-chart',policy:USEFUL_ELEMENT_SYNTHESIS_VERSION}),s=r.supplementaryMethods;
  if(r.status!=='diagnostic'||s.selectionAuthority!==false||r.usefulElement!==null||s.usefulElement!==null||s.mediation.pairs.some(p=>p.effective!==null||p.routes.some(r=>r.effective!==null))||s.remedy.motifs.some(m=>m.diseaseConfirmed!==null||m.remedyConfirmed!==null||m.remedies.some(r=>r.effective!==null)))errors.push(c.id+':integrity');
  const method=c.method??'mediation';
  let observations;
  if(method==='mediation')observations=s.mediation.pairs.filter(p=>p.from===c.from&&p.to===c.to&&p.via===c.referenceElement).map(p=>({routeCount:p.routeCount,reviewStatus:p.reviewStatus,robustTopTwo:p.robustTopTwo,obstructedRoutes:p.routes.filter(r=>r.obstructionNodeIds.length).length,linkedRoutes:p.routes.filter(r=>r.patternLinks.length).length}));
  else if(method==='disease-remedy')observations=s.remedy.motifs.filter(m=>m.target.element===c.target&&m.threat.element===c.threat&&m.remedyElement===c.referenceElement).map(m=>({target:m.target.nodeId,threat:m.threat.nodeId,remedies:m.remedies.length,linkedRescues:m.remedies.filter(r=>r.rescueLinks.length).length}));
  else observations=r.elements.filter(e=>e.element===c.referenceElement&&(e.climateBaselineGroupIds.length||e.climateConditionalAlternativeIds.length)).map(e=>({baselineGroupIds:e.climateBaselineGroupIds,conditionalAlternativeIds:e.climateConditionalAlternativeIds}));
  rows.push({id:c.id,method,referenceElement:c.referenceElement,reference:c.reference??'source-use-assertion',note:c.note,observations,scopeObserved:observations.length>0,referenceRouteObserved:method==='mediation'?observations.some(o=>o.routeCount>0):method==='disease-remedy'?observations.some(o=>o.remedies>0):null,effectAgreement:null});
 }catch(e){errors.push({id:c.id,error:e.message});}
}
console.log(JSON.stringify({source:data.source,scope:'reused source method controls not independent gold; structure and effect distinguished',expectedCases:data.cases.length+data.negativeControls.length,executedCases:rows.length,independentGold:0,errors,rows},null,2));
if(errors.length||rows.length!==data.cases.length+data.negativeControls.length)process.exitCode=1;
