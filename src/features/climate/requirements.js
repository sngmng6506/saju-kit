import { stemInfo,elementRelation } from '../../core/elements.js';
import { stemCombination } from '../../core/relations.js';
const positions=['year','month','day','hour'];
const relation=(from,to)=>{
 const r=elementRelation(from,to);
 return r.type==='same'?'same-element':r.type==='generate'?
  r.direction==='left-to-right'?'generates-required':'generated-by-required':
  r.direction==='left-to-right'?'controls-required':'controlled-by-required';
};
// Pure observations over an existing structure, not another strength model.
export function observeRequirementContext(stem,structure){
 const element=stemInfo(stem).element;
 const profile=structure.profiles.find(p=>p.element===element);
 const visible=structure.profiles.flatMap(p=>p.visible).sort((a,b)=>positions.indexOf(a.position)-positions.indexOf(b.position));
 const clashed=new Set(structure.clashes.flatMap(c=>c.positions));
 const roots=profile.roots.flatMap(r=>r.matches.map(m=>({
  position:r.position,branch:r.branch,stem:m.stem,role:m.role,
  match:m.stem===stem?'exact-stem':'same-element-other-stem',clashExposed:clashed.has(r.position)
 })));
 const exactVisible=visible.filter(v=>v.stem===stem&&v.position!=='day').map(v=>v.position);
 const otherVisible=visible.filter(v=>v.element===element&&v.stem!==stem&&v.position!=='day').map(v=>({position:v.position,stem:v.stem}));
 const dayReferenceMatches=structure.dayMaster.stem===stem;
 const visibleRelations=visible.filter(v=>v.position!=='day').map(v=>({
  position:v.position,stem:v.stem,relation:relation(v.element,element),
  rootMatches:v.matches.map(m=>({position:m.position,stem:m.stem,role:m.role,match:m.match,clashExposed:clashed.has(m.position)}))
 }));
 const combinations=structure.formations.filter(f=>f.type==='stem.combine'&&f.members.includes(stem))
  .map(f=>({positions:[...f.positions],members:[...f.members],associatedElement:f.associatedElement,transformationConfirmed:null}));
 // A possible partner is not an actual combination if the required stem is absent.
 const visiblePartners=visible.filter(v=>stemCombination(stem,v.stem)!==null)
  .map(v=>({position:v.position,stem:v.stem}));
 const branchFormations=structure.formations.filter(f=>f.type.startsWith('branch.')&&f.associatedElement===element)
  .map(f=>({type:f.type,members:[...f.members],positions:f.positions?[...f.positions]:null,transformationConfirmed:null}));
 const monthRelation=relation(structure.month.principalElement,element);
 return {stem,element,completeHour:structure.completeHour,dayReferenceMatches,exactVisible,otherVisible,roots,
  visibleRelations,visiblePartners,combinations,branchFormations,monthRelation,
  exactRootOutsideClash:roots.some(r=>r.match==='exact-stem'&&!r.clashExposed)?true:structure.completeHour?false:null,
  effectiveRoot:null,effectiveSupply:null,excess:null,obstructionConfirmed:null,transformationConfirmed:null,confirmed:false};
}
export function observeClimateRequirements(profile,structure){
 if(!profile)return null;
 const stems=[...new Set([...profile.groups.flat().map(x=>x.stem),...profile.alternatives.flatMap(a=>a.stems)])];
 return {requirements:stems.map(stem=>observeRequirementContext(stem,structure)),
  baselineGroups:profile.groups.map(g=>g.map(x=>x.stem)),
  alternatives:profile.alternatives.map(a=>({when:a.when,stems:[...a.stems],conditionResolved:false})),
  effectiveClimateResolved:false,selectionAuthority:false};
}
