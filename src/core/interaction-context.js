import { createElementObservation } from './element-structure.js';
import { elementRelation } from './elements.js';

const ORDER=['year','month','day','hour'];
const sorted=positions=>[...positions].sort((a,b)=>ORDER.indexOf(a)-ORDER.indexOf(b));
const overlap=(a,b)=>a.filter(p=>b.includes(p));

function groupSelections(group){
  // A repeated branch yields alternative occurrence selections, not a
  // four-position three-branch formation.
  let choices=[[]];
  for(const member of group.members){
    choices=choices.flatMap(previous=>group.occurrences.filter(o=>o.branch===member)
      .map(o=>[...previous,o.position]));
  }
  return choices.map(sorted);
}

function locality(positions){
  const indices=positions.map(p=>ORDER.indexOf(p));
  return {span:indices.at(-1)-indices[0],contiguous:indices.at(-1)-indices[0]===indices.length-1,
    includesMonth:positions.includes('month')};
}

/** Position-aware evidence. No transformation, cancellation or effective force asserted. */
export function analyzeInteractionContext({saju}={}){
  const observation=createElementObservation(saju);
  return observeInteractionContext(observation.pillars,observation.structure(),observation.relations());
}

export function observeInteractionContext(pillars,structure,relations){
  const full=structure.formations.filter(f=>f.occurrences);
  const formations=[];
  for(const f of structure.formations){
    const layer=f.type==='stem.combine'?'stem':'branch';
    const group=Boolean(f.occurrences);
    const candidate=f.type.endsWith('Candidate');
    const redundant=candidate&&full.some(g=>g.type+'Candidate'===f.type&&g.members.every(m=>f.members.includes(m)));
    // Complete groups replace their own pair candidates in this diagnostic view.
    // The original observation API still contains the raw pair records.
    if(redundant)continue;
    for(const positions of group?groupSelections(f):[sorted(f.positions)]){
      const month=structure.month;
      const target=f.associatedElement;
      const profile=structure.profiles.find(p=>p.element===target);
      const cardinal=(f.type==='branch.threeHarmony'||f.type==='branch.threeHarmonyCandidate')?f.members[1]:null;
      const cardinalPositions=cardinal?positions.filter(p=>pillars[p].branch===cardinal):[];
      const monthRelation=target?elementRelation(month.principalElement,target):null;
      formations.push({id:f.type+':'+positions.join('-'),type:f.type,layer,positions,
        members:f.members.slice(),associatedElement:target,complete:!candidate,
        ...locality(positions),cardinalPositions,cardinalIsMonth:cardinalPositions.includes('month'),
        monthRelation,
        targetEvidence:profile?{visiblePositions:profile.visible.map(v=>v.position),
          rootedVisiblePositions:profile.visible.filter(v=>v.rooted).map(v=>v.position),
          rootPositions:profile.roots.map(r=>({position:r.position,role:r.strongestRole})),
          externalPrincipalPositions:profile.principalPositions.filter(p=>!positions.includes(p))}:null,
        transformationConfirmed:null});
    }
  }
  const disruptions=relations.pairs.flatMap(p=>p.branchSignals
    .filter(s=>['branch.clash','branch.punishmentCandidate','branch.mutualPunishment','branch.selfPunishment','branch.break','branch.harm'].includes(s.type))
    .map(s=>({id:s.type+':'+p.left+'-'+p.right,type:s.type,positions:[p.left,p.right],branches:p.branches,
      ...locality([p.left,p.right])})));
  const contextual=formations.map(f=>({...f,
    overlaps:formations.filter(g=>g.id!==f.id&&g.layer===f.layer&&overlap(f.positions,g.positions).length)
      .map(g=>({id:g.id,positions:overlap(f.positions,g.positions),
        kind:f.associatedElement===null||g.associatedElement===null?'undetermined-target':
          f.associatedElement===g.associatedElement?'same-target':'different-target'})),
    disruptions:f.layer==='branch'?disruptions.filter(d=>overlap(f.positions,d.positions).length)
      .map(d=>({id:d.id,type:d.type,positions:overlap(f.positions,d.positions)})):[],
  }));
  const clashes=structure.clashes.map(c=>({
    id:'branch.clash:'+c.positions.join('-'),...c,...locality(c.positions),
    endpoints:c.positions.map(position=>({
      position,
      roots:c.affectedRoots.filter(r=>r.position===position).map(r=>{
        const profile=structure.profiles.find(p=>p.element===r.element);
        const alternatives=profile.roots.filter(x=>x.position!==position)
          .map(x=>({position:x.position,role:x.strongestRole}));
        return {...r,alternativeRoots:alternatives,
          soleSubstantialRoot:r.role!=='residual'&&!alternatives.some(x=>x.role!=='residual'),
          affectedVisiblePositions:profile.visible.filter(v=>v.matches.some(m=>m.position===position&&m.role!=='residual'))
            .map(v=>v.position)};
      }),
    })),
    overlappingFormations:contextual.filter(f=>f.layer==='branch'&&overlap(f.positions,c.positions).length).map(f=>f.id),
  }));
  return {version:'interaction-context-v1',completeHour:structure.completeHour,dayMaster:structure.dayMaster,
    formations:contextual,clashes,disruptions,effectsConfirmed:false};
}
