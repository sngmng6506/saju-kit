import { analyzeRootDynamics } from '../../core/root-dynamics.js';
import { observeSupportNetwork } from '../../core/support-network.js';
import { analyzeQuantitativeStrength } from './quantitative.js';

// One provider per synchronous public evaluation. Never accept caller-supplied
// observations or retain charts across requests. Completed hour variants have
// distinct chart objects; neutral-season evaluation has its own provider.
export function createStrengthEvidenceProvider(context){
 const roots=new Map(),networks=new Map(),quantitative=new Map();
 const once=(cache,key,build)=>{
  if(!cache.has(key))cache.set(key,build());
  return cache.get(key);
 };
 const dynamics=saju=>once(roots,saju,()=>analyzeRootDynamics({saju}));
 return {
  dynamics,
  network:saju=>once(networks,saju,()=>observeSupportNetwork(dynamics(saju))),
  quantitative:(saju,birthBasis)=>{
   const byBasis=once(quantitative,saju,()=>new Map());
   return once(byBasis,birthBasis,()=>analyzeQuantitativeStrength({saju,birthBasis,policy:'strength-quantitative-v3'},context));
  },
 };
}
