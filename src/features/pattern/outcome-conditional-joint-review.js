import {describeSemanticBridge} from './outcome-semantic-bridges.js';
import {compileJointScenario} from './outcome-joint-constraints.js';
import {evaluateConditionalArguments} from './outcome-conditional-arguments.js';
const VERSION='p2-conditional-joint-review-v1';
const key=(...xs)=>JSON.stringify(xs);
const same=(a,b)=>key(a)===key(b);
// Joint assumptions are explicit hypothetical predicates, not aliases of
// root eligibility, profile dominance or physical transfer. A future
// reviewed bridge must bind those distinct meanings explicitly.
export function reviewConditionalJoint(prior,joint){
 const complete=prior?.completeHour,status=complete?'diagnostic':'partial',scope=complete?'complete':'partial';
 const base={version:VERSION,completeHour:complete,selectionAuthority:false,effective:null};
 const empty=reason=>({...base,status:'invalid-evidence',reason,manifest:[],analysis:null,summary:null});
 if(typeof complete!=='boolean'||[joint].some(x=>!x||x.status!==status||x.completeHour!==complete||x.selectionAuthority!==false||x.effective!==null)||
  !joint.scenario)return empty('upstream');
 try{
  const {assumptions,candidates}=joint.scenario;
  const packet=compileJointScenario({scope,assumptions,candidates});
  if(!packet||assumptions.some(a=>a.state!=='unresolved')||joint.scenario.judgments.some(j=>j.state!=='unresolved'))return empty('scenario-authority');
  const pathsById=new Map(joint.paths.map(p=>[p.pathId,p])),actionsById=new Map((joint.actions??[]).map(a=>[a.edgeId,a]));
  const candidatesById=new Set(candidates.map(c=>c.id));
  if(pathsById.size!==joint.paths.length||actionsById.size!==(joint.actions??[]).length)return empty('bridge-inventory');
  const assumptionBridges=assumptions.map(a=>{
   const identity=JSON.parse(a.id);
   if(!Array.isArray(identity))throw Error('assumption-identity');
   const [kind,...subject]=identity,bridge=describeSemanticBridge(kind,subject);
   if(!bridge||!['leg-operation','source-context','path-operation','path-obstruction','pair-restricts-leg','root-loss-blocks-leg','pressure-relief-operation','external-pressure-relief'].includes(kind))throw Error('assumption-bridge');
   const [ref,edge]=subject;
   const bound=kind==='leg-operation'?candidatesById.has(key('leg-ready',ref)):
    ['source-context','path-operation','path-obstruction'].includes(kind)?pathsById.get(ref)?.scenarioPropositionId===key('path',ref):
    kind==='pair-restricts-leg'?actionsById.get(edge)?.combinationPairIds.includes(ref)&&candidatesById.has(key('leg-ready',edge)):
    kind==='root-loss-blocks-leg'?actionsById.get(edge)?.exposedRootIds.includes(ref)&&candidatesById.has(key('leg-ready',edge)):
    candidatesById.has(key('pressure',ref));
   if(!bound)throw Error('assumption-owner-binding');
   return {id:a.id,...bridge};
  });
  const variables=assumptions.map(a=>({id:a.id,value:null}));
  const bindings=assumptions.map(a=>({propositionId:a.id,formula:{op:'var',id:a.id}}));
  const targets=candidates.map(c=>({id:c.id,propositionId:c.id}));
  const manifest=targets.map(t=>{
   const identity=JSON.parse(t.id);
   if(!Array.isArray(identity)||identity.length!==2||!['path','leg-ready','pressure'].includes(identity[0])||typeof identity[1]!=='string')throw Error('target-identity');
   return {...t,kind:identity[0],reference:identity[1],actualEffectState:'unresolved'};
  });
  const paths=joint.paths.filter(p=>p.scenarioPropositionId!==null);
  if(!same(manifest.filter(m=>m.kind==='path').map(m=>m.id).sort(),paths.map(p=>p.scenarioPropositionId).sort())||
   paths.some(p=>p.scenarioPropositionId!==key('path',p.pathId)||p.actualEffectState!=='unresolved'))return empty('path-coverage');
  const analysis=evaluateConditionalArguments({packet,expected:joint.scenario,variables,bindings,targets});
  if(!['diagnostic','partial','unavailable'].includes(analysis.status)||analysis.admissibleCount===0)return empty('conditional-closure');
  return {...base,status,reason:null,manifest,assumptionBridges,analysis,summary:{analysisStatus:analysis.status,assumptions:variables.length,targets:targets.length,
   invariantSupported:analysis.status==='diagnostic'?analysis.targets.filter(t=>t.invariantState==='supported').length:null,
   possibleSupported:analysis.status==='diagnostic'?analysis.targets.filter(t=>t.counts.supported>0).length:null,
   actualEffectsConfirmed:0},limitations:['explicit-joint-assumptions-not-observed-facts','no-reviewed-force-basis-bridge','conditional-readiness-not-effective-relief','no-selection-authority']};
 }catch(e){return empty(e instanceof Error?e.message:'invalid-reference');}
}
