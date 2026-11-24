import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {chartFromReference} from './strength-reference.mjs';
import {analyzeMultihopInteraction,MULTIHOP_VERSION} from '../src/features/multihop-interaction-v1/index.js';

export async function evaluateMultihop(){
 const read=async n=>JSON.parse(await readFile(new URL('../docs/'+n+'.json',import.meta.url),'utf8'));
 const [corpus,prior]=await Promise.all([read('strength-separated-decision-results'),read('strength-resource-route-sensitivity-results')]);
 const counts={charts:corpus.rows.length,scenarioRows:0,allocations:0,ledgerRows:0};
 const rows=corpus.rows.map(c=>{
  const args={saju:chartFromReference(c.pillars),policy:MULTIHOP_VERSION,birthBasis:'verified-chart'};
  const stats={};
  for(const season of ['standard','neutral']){
   const r=analyzeMultihopInteraction(args,{seasonMode:season});
   if(r.direction!==null||r.effectsConfirmed!==false)throw Error('diagnostic direction');
   stats[season]=Object.fromEntries(r.analysis.variants.map(v=>{
    for(const row of v.rows){
     counts.scenarioRows++;
     const origin=new Map();
     for(const p of row.allocations){
      counts.allocations++;
      if(p.accepted<0||p.rejected<0||p.accepted+p.rejected!==p.requested)throw Error('allocation');
      origin.set(p.origin,(origin.get(p.origin)??0)+p.accepted);
     }
     for(const l of row.ledger){
      counts.ledgerRows++;
      if(l.reserved>l.capacity||(origin.get(l.id)??0)>l.capacity)throw Error('capacity');
     }
     if(row.diversionMargin<row.nominalMargin)throw Error('margin');
    }
    return [v.id,v.summary];
   }));
  }
  return {id:c.id,reference:c.reference,group:c.group,fixed:c.fixed,candidate:prior.rows.find(r=>r.id===c.id).candidate,stats};
 });
 const summary=Object.fromEntries(['adjacent','one-gap'].map(m=>[m,{
  longPathCases:rows.filter(r=>r.stats.standard[m].longPaths>0).length,
  positiveAll:rows.filter(r=>r.stats.standard[m].longDelivered[0]>0).length,
  pressureChanged:rows.filter(r=>r.stats.standard[m].nominalPressureAll&&!r.stats.standard[m].diversionPressureAll).map(r=>[r.id,r.reference,r.group]),
  candidateRemaining:rows.filter(r=>r.candidate&&r.stats.standard[m].diversionPressureAll&&r.stats.neutral[m].diversionPressureAll).map(r=>[r.id,r.reference,r.group])
 }]));
 return {counts,summary,rows};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(await evaluateMultihop(),null,2));
