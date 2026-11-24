import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {chartFromReference} from './strength-reference.mjs';
import {analyzeSupportNetwork} from '../src/core/support-network.js';
import {analyzeQuantitativeStrength} from '../src/features/strength-quantitative-v3/index.js';
import {analyzeOutputCapacity} from '../src/features/output-capacity-v1/index.js';

const sum=xs=>xs.reduce((a,b)=>a+b,0);
const range=xs=>[Math.min(...xs),Math.max(...xs)].map(x=>x/1e6);
export function resourceRouteScenario(s,r,seated){
 if(JSON.stringify(Object.values(r.profile))!==JSON.stringify([s.positionProfile,s.roleProfile,s.rootProfile,s.seasonProfile,s.seasonBasis]))
  throw Error('scenario mismatch');
 const accepted=sum(r.resources.map(x=>x.officerAccepted));
 const requested=sum(r.allocations.filter(x=>x.kind==='officer-resource').map(x=>x.units));
 const wealth=sum(r.resources.map(x=>x.wealthRequested));
 const own=sum(r.resources.map(x=>x.own)),conditional=r.conditionalResource;
 const residualOfficer=s.mass.officer-accepted;
 if(residualOfficer<0||accepted>requested||conditional>own)throw Error('route budget mismatch');
 const margin=s.mass.peer+s.mass.resource-Math.max(s.mass.output,s.mass.wealth,s.mass.officer);
 const routeMargin=s.mass.peer+conditional-Math.max(r.outputResidualHypothesis,s.mass.wealth,s.mass.officer);
 // Hypothetical diversion only. Accepted officer units are not also added to resource.
 // Wealth pressure remains unchanged. This is not a confirmed transfer.
 const reliefMargin=s.mass.peer+conditional-Math.max(r.outputResidualHypothesis,s.mass.wealth,residualOfficer);
 const sr=r.resources.find(x=>seated.some(z=>z.id===x.id));
 return {accepted,requested,wealth,own,conditional,margin,routeMargin,reliefMargin,seatedOwn:sr?.own??0,seatedWealth:sr?.wealthRequested??0,seatedOfficer:sr?.officerAccepted??0,seatedConditional:sr?.conditionalDirect??0};
}
export function summarizeResourceRoutes(q,capacity,seated){
 if(!q.length||capacity.length!==2*q.length)throw Error('incomplete scenarios');
 const rows=capacity.map((r,i)=>resourceRouteScenario(q[Math.floor(i/2)],r,seated));
 const keys=['margin','routeMargin','reliefMargin'];
 return {n:rows.length,allPressure:keys.map(k=>rows.every(r=>r[k]<0)),allSupport:keys.map(k=>rows.every(r=>r[k]>0)),
  ranges:Object.fromEntries(Object.keys(rows[0]).map(k=>[k,range(rows.map(r=>r[k]))]))};
}
export function inspectResourceStructure(network){
 const seated=network.resources.filter(r=>r.id.startsWith('day:branch:')&&r.anchored);
 const chains=network.chains.filter(x=>x.kind==='officer-resource-day'&&x.local&&x.anchoredSource&&x.anchoredIntermediate);
 const seatedChain=chains.some(x=>seated.some(r=>r.id===x.nodes[1]));
 const wealthRoutes=network.resources.filter(r=>r.anchored&&r.supply.local&&r.localAnchoredWealth.length);
 return {seated,seatedChain,chains,wealthRoutes};
}
export async function evaluateResourceRouteSensitivity(){
 const read=async n=>JSON.parse(await readFile(new URL('../docs/'+n+'.json',import.meta.url),'utf8'));
 const [corpus,peer]=await Promise.all([read('strength-separated-decision-results'),read('strength-peer-root-access-results')]);
 return corpus.rows.map(c=>{
  const saju=chartFromReference(c.pillars),args={saju,birthBasis:'verified-chart'};
  const pr=peer.rows.find(r=>r.id===c.id);
  if(!pr)throw Error('missing prior diagnostic '+c.id);
  const {seated,seatedChain,chains,wealthRoutes}=inspectResourceStructure(analyzeSupportNetwork({saju}));
  const stats=Object.fromEntries(['standard','neutral'].map(season=>{
   const qs=analyzeQuantitativeStrength({...args,policy:'strength-quantitative-v3'},{seasonMode:season}).quantitative.scenarios;
   const cr=analyzeOutputCapacity({...args,policy:'output-capacity-v1'},{seasonMode:season}).analysis.rows;
   return [season,summarizeResourceRoutes(qs,cr,seated)];
  }));
  return {id:c.id,reference:c.reference,group:c.group,fixed:c.fixed,candidate:c.fixed===null&&pr.bucket==='no-ground-pressure-all'&&pr.stats.standard.allPressure[1]&&pr.stats.neutral.allPressure[1],
   seated:seated.map(r=>r.id),seatedChain,chains:chains.map(x=>x.nodes),wealthRoutes:wealthRoutes.map(r=>r.id),stats};
 });
}
// Retrospective guard comparison, not a public prediction policy.
export function compareResourceGuards(rows){
 const policies=['fixed','candidate','any-chain','seated','seated-chain'];
 const predictions=rows.map(r=>{
  const eligible=r.candidate&&r.fixed===null;
  return {id:r.id,reference:r.reference,group:r.group,results:[
   r.fixed,eligible?'weak':r.fixed,eligible&&!r.chains.length?'weak':r.fixed,
   eligible&&!r.seated.length?'weak':r.fixed,eligible&&!r.seatedChain?'weak':r.fixed]};
 });
 return Object.fromEntries(['primary','secondary','all'].map(g=>{
  const rs=predictions.filter(r=>g==='all'||r.group===g);
  return [g,Object.fromEntries(policies.map((k,i)=>{
   const agree=rs.filter(r=>r.results[i]===r.reference).length,abstain=rs.filter(r=>r.results[i]===null).length;
   return [k,{n:rs.length,agree,disagree:rs.length-agree-abstain,abstain}];
  }))];
 }));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const rows=await evaluateResourceRouteSensitivity();
 console.log(JSON.stringify({rows,guards:compareResourceGuards(rows)},null,2));
}
