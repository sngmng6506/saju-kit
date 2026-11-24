import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {getSaju,solarTermInstant} from '../src/core/calendar.js';
import {chartFromReference} from './strength-reference.mjs';
import {analyzeMonthCommandSensitivity,compareCommandElements,COMMAND_SENSITIVITY_VERSION} from '../src/features/strength-command-sensitivity-v1/index.js';

export async function evaluateCommandSensitivity(){
 const fixture=JSON.parse(await readFile(new URL('../test/fixtures/month-command-text-controls-v1.json',import.meta.url),'utf8'));
 const texts=fixture.cases.map(c=>({id:c.id,reference:c.reference,reportedElement:c.reportedElement,comparison:compareCommandElements(chartFromReference(c.pillars),[c.reportedElement])}));
 const births=[];
 for(let i=0;i<24;i+=2){
  const t=solarTermInstant(2026,i);
  for(const days of [2,9,22]){
   const d=new Date(Date.UTC(t.y,t.m-1,t.d+days,12,0));
   births.push({y:d.getUTCFullYear(),m:d.getUTCMonth()+1,d:d.getUTCDate(),hh:12,mm:0});
  }
 }
 for(const d of [9,15])births.push({y:2026,m:2,d,hh:12,mm:0});
 const dates=births.map(birth=>{
  const saju=getSaju(birth),before=JSON.stringify(saju);
  const r=analyzeMonthCommandSensitivity({saju,birth,policy:COMMAND_SENSITIVITY_VERSION,birthBasis:'verified-chart'});
  if(r.status!=='diagnostic'||r.direction!==null||r.commandResolved||r.effectsConfirmed||before!==JSON.stringify(saju))throw Error('diagnostic contract');
  return {birth,month:r.command.month.branch,hypotheses:r.command.hypotheses.map(h=>[h.sourceId,h.mode,h.command?.element??null]),comparison:r.comparison};
 });
 const variants=dates.flatMap(d=>d.comparison.variants.map(v=>({standard:d.comparison.standard.stableDirection,...v})));
 const counts={textControls:texts.length,syntheticDates:dates.length,uniqueElementVariants:variants.length,
  matchedProfiles:variants.reduce((a,v)=>a+v.matched.reduce((s,m)=>s+m.matchedCount,0),0),
  changedQuantitativeDirection:variants.filter(v=>v.stableDirection!==v.standard).length,
  identicalBasisComparisons:variants.flatMap(v=>v.matched).filter(m=>m.identicalBasis).length,
  multipleCommandElements:dates.filter(d=>d.comparison.variants.length>1).length};
 return {counts,texts,dates};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(await evaluateCommandSensitivity(),null,2));
