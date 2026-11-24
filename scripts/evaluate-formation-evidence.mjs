import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {chartFromReference} from './strength-reference.mjs';
import {analyzeFormationEvidence} from '../src/core/formation-evidence.js';

export async function evaluateFormationEvidence(){
 const corpus=JSON.parse(await readFile(new URL('../docs/strength-separated-decision-results.json',import.meta.url),'utf8')).rows;
 const rows=corpus.map(c=>{
  const saju=chartFromReference(c.pillars),before=JSON.stringify(saju),r=analyzeFormationEvidence({saju});
  if(JSON.stringify(saju)!==before||r.direction!==null||r.effectsConfirmed!==false||
   r.formations.some(f=>f.transformationConfirmed!==null)||new Set(r.formations.map(f=>f.id)).size!==r.formations.length)
   throw Error('formation evidence contract '+c.id);
  return {id:c.id,reference:c.reference,group:c.group,month:r.month,formations:r.formations.map(f=>({
   id:f.id,classification:f.classification,target:f.target,flags:f.flags,contextScreen:f.contextScreen,limitations:f.limitations}))};
 });
 const all=rows.flatMap(r=>r.formations);
 const classes=Object.fromEntries([...new Set(all.map(f=>f.classification))].sort().map(k=>[k,{
  formations:all.filter(f=>f.classification===k).length,
  charts:rows.filter(r=>r.formations.some(f=>f.classification===k)).length,
  screen:all.filter(f=>f.classification===k&&f.contextScreen==='all-screen-flags-met').length
 }]));
 const flags=Object.fromEntries(Object.keys(all[0].flags).map(k=>[k,all.filter(f=>f.flags[k]).length]));
 return {summary:{charts:rows.length,chartsWithFormations:rows.filter(r=>r.formations.length).length,formations:all.length,
  screenFormations:all.filter(f=>f.contextScreen==='all-screen-flags-met').length,
  screenCharts:rows.filter(r=>r.formations.some(f=>f.contextScreen==='all-screen-flags-met')).length,classes,flags},rows};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(await evaluateFormationEvidence(),null,2));
