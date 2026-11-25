import { analyzeElementStructure } from '../core/element-structure.js';
import { createStrengthEvidenceProvider } from './strength/request-evidence.js';

// Private synchronous request scope. Each season mode has its own quantitative
// cache. The method review can reuse neutral structural evidence without
// merging doctrine decisions or granting any selection authority.
export function createMethodEvidence(){
 const structures=new Map();
 const standard=createStrengthEvidenceProvider();
 const neutral=createStrengthEvidenceProvider({seasonMode:'neutral'});
 return {
  standard,neutral,
  structure(saju){
   if(!structures.has(saju))structures.set(saju,analyzeElementStructure({saju}));
   return structures.get(saju);
  },
 };
}
