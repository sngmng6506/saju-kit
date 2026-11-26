import {compileJointScenario} from './outcome-joint-constraints.js';
import {analyzeProofDependencies} from './outcome-proof-dependencies.js';
import {preservesSynthesisProofs,replaySynthesisProof} from './outcome-synthesis-proof.js';
const VERSION='p2-interaction-proof-review-v1';
export function reviewInteractionProofs(prior,joint,modeled,generation,control){
 const complete=prior?.completeHour,status=complete?'diagnostic':'partial',scope=complete?'complete':'partial';
 const base={version:VERSION,completeHour:complete,selectionAuthority:false,effective:null};
 const empty=reason=>({...base,status:'invalid-evidence',reason,graphs:null,summary:null});
 if(typeof complete!=='boolean'||[joint,modeled,generation,control].some(x=>!x||x.status!==status||x.completeHour!==complete||x.selectionAuthority!==false||x.effective!==null)||!joint.scenario)return empty('upstream');
 const mg=replaySynthesisProof(modeled,scope),gg=replaySynthesisProof(generation,scope);
 if(!preservesSynthesisProofs(mg,gg))return empty('original-proof-parity');
 const jointPacket=compileJointScenario({scope,assumptions:joint.scenario.assumptions,candidates:joint.scenario.candidates});
 if(!jointPacket)return empty('joint-packet');
 const packet=x=>({scope,propositions:x.propositions,evidence:x.evidence,rules:x.rules});
 // Generation already contains the modeled DAG. Review it once rather
 // than count its upstream proof graph as another independent graph.
 const graphs={
  joint:analyzeProofDependencies(jointPacket,joint.scenario),
  generation:analyzeProofDependencies(packet(generation),generation),
  control:analyzeProofDependencies(packet(control),control)
 };
 if(Object.values(graphs).some(g=>!['diagnostic','partial','unavailable'].includes(g.status)||g.status==='partial'&&complete||g.status==='diagnostic'&&!complete))return empty('proof-analysis');
 const evaluated=Object.values(graphs).every(g=>g.status==='diagnostic');
 return {...base,status,reason:null,graphs,summary:{analysisStatus:!complete?'partial':evaluated?'diagnostic':'unavailable',
  cycles:evaluated?Object.values(graphs).reduce((n,g)=>n+g.summary.cycles,0):null,
  actualEffectsConfirmed:0},limitations:['separate-proof-namespaces','cycle-not-physical-competition','no-effect-promotion']};
}
