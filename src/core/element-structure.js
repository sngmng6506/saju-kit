import { validateNatalPillars } from './natal.js';
import { stemInfo, elementRelation } from './elements.js';
import { getHiddenStems, HIDDEN_STEMS_VERSION } from './hidden-stems.js';
import { observeNatalContext } from './natal-context.js';
import { observeNatalRelations } from './natal-relations.js';

const ELEMENTS = ['wood','fire','earth','metal','water'];
const POSITIONS = ['year','month','day','hour'];
const ROLES = ['principal','middle','residual'];

/** Observed elemental positions and possible interactions, not effective strength. */
export function analyzeElementStructure({saju}={}) {
  return createElementObservation(saju).structure();
}

// Lazy, request-owned observation. No cache beyond the caller's lifetime.
// Only validated pillars are accepted by the internal projections.
export function createElementObservation(saju){
  const pillars=validateNatalPillars(saju);
  let context,relations,structure;
  return {
    pillars,
    context:()=>context??=observeNatalContext(pillars),
    relations:()=>relations??=observeNatalRelations(pillars),
    structure:()=>structure??=observeElementStructure(pillars,context??=observeNatalContext(pillars),relations??=observeNatalRelations(pillars)),
  };
}

function observeElementStructure(pillars,context,relations){
  const visible=POSITIONS.flatMap(position=>pillars[position]===null?[]:[{
    position,stem:pillars[position].stem,element:stemInfo(pillars[position].stem).element,
  }]);
  const hidden=POSITIONS.flatMap(position=>pillars[position]===null?[]:
    getHiddenStems(pillars[position].branch).map(entry=>({position,branch:pillars[position].branch,...entry})));
  const profiles=ELEMENTS.map(element=>{
    const stems=visible.filter(v=>v.element===element).map(v=>{
      const matches=context.rootEvidence.find(r=>r.position===v.position).matches;
      return {...v,matches,rooted:matches.some(m=>m.role!=='residual')};
    });
    const roots=POSITIONS.flatMap(position=>{
      const matches=hidden.filter(h=>h.position===position&&h.element===element);
      if(!matches.length)return [];
      const strongestRole=ROLES.find(role=>matches.some(h=>h.role===role));
      return [{position,branch:matches[0].branch,strongestRole,matches}];
    });
    return {element,visible:stems,roots,
      principalPositions:roots.filter(r=>r.strongestRole==='principal').map(r=>r.position),
      present:stems.length>0||roots.length>0};
  });
  const present=profiles.filter(p=>p.present).map(p=>p.element);
  const edges=[];
  for(const from of present)for(const to of present){
    const relation=elementRelation(from,to);
    if(relation.direction==='left-to-right')edges.push({from,to,type:relation.type});
  }
  // A mediator is only a possible two-step generating path between a
  // controlling pair. Presence alone cannot establish successful mediation.
  const mediations=edges.filter(e=>e.type==='control').flatMap(({from,to})=>
    present.filter(v=>edges.some(e=>e.from===from&&e.to===v&&e.type==='generate')&&
      edges.some(e=>e.from===v&&e.to===to&&e.type==='generate')).map(via=>({from,via,to})));
  const clashes=relations.pairs.filter(p=>p.branchSignals.some(s=>s.type==='branch.clash')).map(p=>({
    positions:[p.left,p.right],branches:p.branches,
    affectedRoots:profiles.flatMap(profile=>profile.roots.filter(root=>root.position===p.left||root.position===p.right)
      .map(root=>({element:profile.element,position:root.position,role:root.strongestRole}))),
  }));
  const formations=[
    ...relations.pairs.flatMap(p=>[...p.stemSignals,...p.branchSignals.filter(s=>
      s.type==='branch.sixHarmony'||s.type==='branch.threeHarmonyCandidate'||s.type==='branch.seasonalHarmonyCandidate')]
      .map(s=>({...s,positions:[p.left,p.right]}))),
    ...relations.groups.filter(g=>g.type==='branch.threeHarmony'||g.type==='branch.seasonalHarmony'),
  ];
  return {version:'element-structure-v1',hiddenStemsBasis:HIDDEN_STEMS_VERSION,
    completeHour:context.completeHour,dayMaster:context.dayMaster,month:context.month,
    profiles,edges,mediations,clashes,formations,
    interactionAssessment:'observed-only'};
}
