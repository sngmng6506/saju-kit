import { createElementObservation } from '../core/element-structure.js';
import { observeRootDynamics } from '../core/root-dynamics.js';
import { createStrengthEvidenceProvider } from './strength/request-evidence.js';

// Private synchronous request scope. Each season mode has its own quantitative
// cache. The method review can reuse neutral structural evidence without
// merging doctrine decisions or granting any selection authority.
export function createMethodEvidence(){
 const observations=new Map(),roots=new Map();
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
 const standard=createStrengthEvidenceProvider(undefined,dynamics);
 const neutral=createStrengthEvidenceProvider({seasonMode:'neutral'},dynamics);
 return {
  standard,neutral,
  context:saju=>observation(saju).context(),
  structure:saju=>observation(saju).structure(),
 };
}
