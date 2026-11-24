import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {chartFromReference} from './strength-reference.mjs';
import {analyzeMultiaxisStrengthV4} from '../src/features/strength-multiaxis-v4/index.js';
import {analyzeQuantitativeStrength} from '../src/features/strength-quantitative-v3/index.js';
import {analyzeSupportNetwork} from '../src/core/support-network.js';

export const variants=['fixed-v4','P1','P1-seated-resource-guard','P1-seated-chain-guard'];
export function evaluateFrozenPressure(saju){
 const args={saju,birthBasis:'verified-chart'};
 const r=analyzeMultiaxisStrengthV4({...args,policy:'strength-multiaxis-v4'});
 if(!r.decision)throw Error('complete chart required');
 const n=analyzeSupportNetwork({saju});
 const seated=n.resources.filter(x=>x.id.startsWith('day:branch:')&&x.anchored);
 const seatedChain=n.chains.some(x=>x.kind==='officer-resource-day'&&x.local&&x.anchoredSource&&x.anchoredIntermediate&&seated.some(z=>z.id===x.nodes[1]));
 const stats=Object.fromEntries(['standard','neutral'].map(season=>{
  const rows=analyzeQuantitativeStrength({...args,policy:'strength-quantitative-v3'},{seasonMode:season}).quantitative.scenarios;
  if(!rows.length)throw Error('missing scenarios');
  const max=s=>Math.max(s.mass.output,s.mass.wealth,s.mass.officer);
  return [season,{external:rows.every(s=>max(s)>s.mass.resource+s.contributions.filter(c=>c.category==='peer'&&c.role===null).reduce((a,c)=>a+c.units,0)),
   full:rows.every(s=>max(s)>s.supportUnits)}];
 }));
 const eligible=r.direction===null&&!r.decision.grounds.length&&!r.decision.conflicts.length&&stats.standard.external&&stats.standard.full&&stats.neutral.full;
 return {root:r.axes.rootCapacity,grounds:r.decision.grounds,conflicts:r.decision.conflicts,stats,seated:seated.length>0,seatedChain,eligible,
  predictions:[r.direction,eligible?'weak':r.direction,eligible&&!seated.length?'weak':r.direction,eligible&&!seatedChain?'weak':r.direction]};
}
export async function evaluateYuanProspective(){
 const f=JSON.parse(await readFile(new URL('../test/fixtures/yuan-electronic-prospective-v1.json',import.meta.url),'utf8'));
 const rows=f.cases.map(c=>({id:c.id,pillars:c.pillars,reference:c.reference,group:c.formation==='ordinary'?'primary':'secondary',...evaluateFrozenPressure(chartFromReference(c.pillars))}));
 const metrics=Object.fromEntries(['primary','secondary','all'].map(g=>[g,variants.map((_,i)=>{
  const rs=rows.filter(r=>g==='all'||r.group===g);
  const agree=rs.filter(r=>r.predictions[i]===r.reference).length,abstain=rs.filter(r=>r.predictions[i]===null).length;
  return {n:rs.length,agree,disagree:rs.length-agree-abstain,abstain};
 })]));
 return {variants,metrics,rows};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(await evaluateYuanProspective(),null,2));
