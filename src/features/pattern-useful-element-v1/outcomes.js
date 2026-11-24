import { tenGodForStem } from '../../core/natal.js';
import { patternMotifs } from './source.js';
export function observePatternOutcomes(selection,structure,interaction){
 const visible=structure.profiles.flatMap(p=>p.visible.filter(v=>v.position!=='day').map(v=>({position:v.position,stem:v.stem,tenGod:tenGodForStem(structure.dayMaster.stem,v.stem)})));
 const hidden=structure.profiles.flatMap(p=>p.roots.flatMap(r=>r.matches.map(h=>({position:r.position,stem:h.stem,role:h.role,tenGod:tenGodForStem(structure.dayMaster.stem,h.stem)}))));
 const monthDisruptions=interaction.disruptions.filter(d=>d.positions.includes('month')&&['branch.clash','branch.punishmentCandidate','branch.mutualPunishment','branch.selfPunishment','branch.break','branch.harm'].includes(d.type));
 const evaluate=c=>{
  if(c.kind==='contextual')return {...c,matched:null};
  if(c.kind==='month-disruption-absent')return {...c,observations:monthDisruptions,matched:monthDisruptions.length?false:structure.completeHour?true:null};
  const v=visible.filter(x=>c.gods.includes(x.tenGod)),h=hidden.filter(x=>c.gods.includes(x.tenGod));
  const found=c.kind==='visible'?v.length>0:v.length+h.length>0;
  return {...c,visible:v,hidden:h,matched:found?c.kind!=='absent':structure.completeHour?c.kind==='absent':null};
 };
 return selection.candidates.map(candidate=>({
  candidateId:candidate.id,family:candidate.family,
  motifs:patternMotifs(candidate.family).map(m=>{
   const clauses=m.clauses.map(evaluate);
   const predicate=clauses.some(c=>c.matched===false)?false:clauses.every(c=>c.matched===true)?true:null;
   return {...m,clauses,predicate,conditionResolved:false,effectConfirmed:false};
  }),
  formed:null,broken:null,rescued:null,selectionAuthority:false
 }));
}
