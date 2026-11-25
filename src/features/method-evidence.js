import { createElementObservation } from '../core/element-structure.js';
import { observeRootDynamics } from '../core/root-dynamics.js';
import { observeInteractionContext } from '../core/interaction-context.js';
import { observeFormationEvidence } from '../core/formation-evidence.js';
import { createStrengthEvidenceProvider } from './strength/request-evidence.js';

// Private synchronous request scope. Each season mode has its own quantitative
// cache. The method review can reuse neutral structural evidence without
// merging doctrine decisions or granting any selection authority.
export function createMethodEvidence(){
 const observations=new Map(),roots=new Map(),interactions=new Map(),formations=new Map();
 const observation=saju=>{
  if(!observations.has(saju))observations.set(saju,createElementObservation(saju));
  return observations.get(saju);
 };
 const dynamics=saju=>{
  if(!roots.has(saju)){
   const o=observation(saju);
   roots.set(saju,observeRootDynamics(o.pillars,o.structure()));
  }
  return roots.get(saju);
 };
 const structure=saju=>observation(saju).structure();
 const interaction=saju=>{
  if(!interactions.has(saju)){
   const o=observation(saju);interactions.set(saju,observeInteractionContext(o.pillars,o.structure(),o.relations()));
  }
  return interactions.get(saju);
 };
 const formation=saju=>{
  if(!formations.has(saju))formations.set(saju,observeFormationEvidence(observation(saju).pillars,structure(saju),interaction(saju)));
  return formations.get(saju);
 };
 const standard=createStrengthEvidenceProvider(undefined,dynamics,structure);
 const neutral=createStrengthEvidenceProvider({seasonMode:'neutral'},dynamics,structure);
 return {
  standard,neutral,observation,structure,interaction,formation,
  context:saju=>observation(saju).context(),
 };
}
