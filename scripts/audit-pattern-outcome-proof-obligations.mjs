import {readFileSync} from 'node:fs';
import {replayModeledCoverage} from './lib/pattern-modeled-consequence-coverage.mjs';
import {inspectProofObligations,summarizeObligationTargets} from './lib/pattern-outcome-proof-obligations.mjs';
// Intentionally fixed to previously exposed development packets. No
// prospective inputs, reviewer labels, or command-line overrides.
if(process.argv.length!==2)throw Error('development-only audit accepts no external inputs');
const packets=['pattern-outcome-role-policy-source-v1','pattern-modeled-consequence-source-contrast-v1'];
const cases=packets.flatMap(packet=>JSON.parse(readFileSync(new URL('../test/fixtures/'+packet+'.json',import.meta.url),'utf8')).cases.map(c=>({...c,packet})));
const rows=[],errors=[],families={};
for(const c of cases){
 try{
  const r=replayModeledCoverage(c.pillars,true,{includeSynthesisInputs:true});
  if(r.invalid.length||r.actualEffectPromoted)throw Error('invalid core review');
  const owner=r.synthesisInputs[6],targets=[],metadata=new Map();
  const add=(id,family,identity)=>{
   if(typeof id!=='string'||metadata.has(id))throw Error('invalid target identity');
   targets.push({propositionId:id,sign:'for'});metadata.set(id,{family,identity});
  };
  for(const a of r.synthesis.actions){
   add(a.direct.propositionId,a.kind==='generate'?'direct-release':'direct-injury',a.edgeId);
   add(a.combined.propositionId,a.kind==='generate'?'joint-release':'residual-injury',a.edgeId);
   add(a.actualEffect.propositionId,'actual-action',a.edgeId);
   for(const route of a.interposition.visibleRoutes)add(route.proof.propositionId,route.proof.kind,route.pathId);
  }
  const g=inspectProofObligations(owner,targets);
  if(g.status!=='diagnostic'||g.targets.length!==targets.length)throw Error(g.reason??'proof inspection');
  const nodeIndex=new Map(g.nodes.map(n=>[n.id,n]));
  const details=g.targets.map(t=>{
   const m=metadata.get(nodeIndex.get(t.id).propositionId);
   if(!m)throw Error('target metadata');
   const row={...m,...t};
   (families[m.family]??=[]).push(row);return row;
  });
  rows.push({id:c.id,packet:c.packet,targets:details,nodes:g.nodes});
 }catch(e){errors.push({id:c.id,packet:c.packet,error:e.message});}
}
console.log(JSON.stringify({version:'p1-5e-development-proof-obligations-v1',scope:'previously-exposed-development-only-core-not-native-v10',
 charts:cases.length,executed:rows.length,families:Object.fromEntries(Object.entries(families).map(([k,v])=>[k,summarizeObligationTargets(v)])),
 independentGoldCases:0,selectionAuthority:false,errors,rows},null,2));
if(errors.length||rows.length!==cases.length)process.exitCode=1;
