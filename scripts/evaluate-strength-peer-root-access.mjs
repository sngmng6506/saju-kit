import {STRENGTH_SOURCE} from './lib/strength-research-source.mjs';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {chartFromReference} from './strength-reference.mjs';
import {analyzeQuantitativeStrength} from '../src/features/strength-quantitative-v3/index.js';
import {analyzeRootDynamics} from '../src/core/root-dynamics.js';

export const modes=['external','include-peer-branch','include-peer-branch-remove-peer-stem-root-premium'];
const sum=xs=>xs.reduce((a,x)=>a+x.units,0);
const range=xs=>[Math.min(...xs),Math.max(...xs)];
export function peerRootScenario(s,floors){
 const floor=floors[s.rootProfile];
 if(!Number.isInteger(floor))throw Error('unknown root profile');
 const stems=s.contributions.filter(x=>x.category==='peer'&&x.role===null);
 const branches=s.contributions.filter(x=>x.category==='peer'&&x.role!==null);
 const stem=sum(stems),root=sum(branches);
 const premium=stems.reduce((a,x)=>a+x.weight*x.share*(x.rootFactor-floor)*x.seasonFactor,0);
 if(stem+root!==s.mass.peer||premium<0||premium>stem)throw Error('peer mass accounting mismatch');
 const base=stem+s.mass.resource,pressure=Math.max(s.mass.output,s.mass.wealth,s.mass.officer);
 return {stem,root,premium,base,pressure,full:base+root,discount:base+root-premium};
}
export function summarizePeerScenarios(scenarios,floors){
 if(!scenarios.length)throw Error('missing scenarios');
 const xs=scenarios.map(s=>peerRootScenario(s,floors)),keys=['base','full','discount'];
 return {n:xs.length,margin:Object.fromEntries(keys.map(k=>[k,range(xs.map(x=>x[k]-x.pressure))])),
  allPressure:keys.map(k=>xs.every(x=>x.pressure>x[k])),allSupport:keys.map(k=>xs.every(x=>x[k]>x.pressure)),
  root:range(xs.map(x=>x.root)),premium:range(xs.map(x=>x.premium))};
}
// Research-only promotion: preserves every existing direction and every conflict.
// Bucket is derived from the historical abstention diagnostics, not reference labels.
export function candidateDirection(row,index){
 if(![1,2].includes(index))throw Error('unknown candidate');
 if(row.fixed!==null||row.bucket!=='no-ground-pressure-all')return row.fixed;
 return row.stats.standard.allPressure[index]&&row.stats.neutral.allPressure[index]?'weak':null;
}
export function summarizeCandidates(rows){
 const candidates=rows.map(r=>({id:r.id,group:r.group,reference:r.reference,fixed:r.fixed,p1:candidateDirection(r,1),p2:candidateDirection(r,2)}));
 const metrics=Object.fromEntries(['primary','secondary','all'].map(g=>{
  const rs=candidates.filter(r=>g==='all'||r.group===g);
  return [g,Object.fromEntries(['fixed','p1','p2'].map(k=>{
   const agree=rs.filter(r=>r[k]===r.reference).length,abstain=rs.filter(r=>r[k]===null).length;
   return [k,{n:rs.length,agree,disagree:rs.length-agree-abstain,abstain}];
  }))];
 }));
 return {metrics,changes:candidates.filter(r=>r.p1!==r.fixed||r.p2!==r.fixed)};
}
export async function evaluatePeerRootAccess(){
 const read=async n=>JSON.parse(await readFile(new URL('../docs/'+n+'.json',import.meta.url),'utf8'));
 const [corpus,ab]=await Promise.all([read('strength-separated-decision-results'),read('strength-abstention-results')]);
 const src=await readFile(new URL('../'+STRENGTH_SOURCE.quantitative,import.meta.url),'utf8');
 const floors=Object.fromEntries([...src.matchAll(/(mild|pronounced):\{none:(\d+),residual:/g)].map(m=>[m[1],+m[2]]));
 if(floors.mild!==80||floors.pronounced!==55)throw Error('root floor profile changed; review diagnostic');
 const rows=corpus.rows.map(c=>{
  const saju=chartFromReference(c.pillars),dyn=analyzeRootDynamics({saju});
  const args={saju,policy:'strength-quantitative-v3',birthBasis:'verified-chart'};
  const peer=dyn.roots.filter(r=>r.position!=='day'&&r.element===dyn.dayMaster.element);
  const connections=peer.flatMap(r=>r.positions.filter(x=>x.strongestRole).map(x=>({stem:r.position,root:x.position,role:x.strongestRole,clash:x.exposedToClash})));
  const uniqueRoots=[...new Set(connections.map(x=>x.root))];
  const stats=Object.fromEntries(['standard','neutral'].map(season=>[season,summarizePeerScenarios(analyzeQuantitativeStrength(args,{seasonMode:season}).quantitative.scenarios,floors)]));
  const bucket=ab.rows.find(r=>r.id===c.id)?.bucket??null;
  return {id:c.id,reference:c.reference,group:c.group,fixed:c.fixed,bucket,connections,uniqueRoots,stats};
 });
 const subset=rows.filter(r=>r.group==='primary'&&r.bucket==='no-ground-pressure-all');
 const summary=['standard','neutral'].map(season=>[0,1,2].map(i=>({
  pressure:subset.filter(r=>r.stats[season].allPressure[i]).length,
  weak:subset.filter(r=>r.stats[season].allPressure[i]&&r.reference==='weak').length,
  strong:subset.filter(r=>r.stats[season].allPressure[i]&&r.reference==='strong').length,
  support:subset.filter(r=>r.stats[season].allSupport[i]).length
 })));
 return {modes,summary,rows,candidates:summarizeCandidates(rows)};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(await evaluatePeerRootAccess(),null,2));
