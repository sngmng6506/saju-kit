import { observeInteractionContext } from './interaction-context.js';
import { createElementObservation } from './element-structure.js';
import { elementRelation } from './elements.js';

export const FORMATION_EVIDENCE_VERSION='formation-evidence-v1';
const SEASON={spring:'wood',summer:'fire',autumn:'metal',winter:'water'};
const supports=r=>r?.type==='same'||r?.type==='generate'&&r.direction==='left-to-right';

function kind(f){
 if(f.type==='stem.combine')return 'stem-pair';
 if(f.type==='branch.sixHarmony')return 'six-harmony';
 if(f.type==='branch.threeHarmony')return 'complete-three';
 if(f.type==='branch.seasonalHarmony')return 'complete-seasonal';
 if(f.type==='branch.threeHarmonyCandidate')return f.cardinalPositions.length?'cardinal-three-pair':'noncardinal-three-pair';
 if(f.type==='branch.seasonalHarmonyCandidate')return f.members[1]&&f.positions.some(p=>f.branchByPosition?.[p]===f.members[1])?'cardinal-seasonal-pair':'seasonal-pair';
 throw Error('unknown formation type: '+f.type);
}

/** Observations and a conservative context screen, never transformation authority. */
export function analyzeFormationEvidence({saju}={}){
 const observation=createElementObservation(saju),structure=observation.structure();
 const context=observeInteractionContext(observation.pillars,structure,observation.relations());
 const seasonElement=SEASON[structure.month.season],monthPrincipalElement=structure.month.principalElement;
 const day=structure.dayMaster.element;
 const clashed=new Set(context.clashes.flatMap(c=>c.positions));
 const branchByPosition=Object.fromEntries(Object.entries(saju.pillars).filter(([,p])=>p!=null).map(([k,p])=>[k,p.branch]));
 const formations=context.formations.map(f=>{
  const target=f.associatedElement,classification=kind({...f,branchByPosition});
  const profile=structure.profiles.find(p=>p.element===target);
  const occupiedBranches=f.layer==='branch'?f.positions:[];
  const occupiedStems=f.layer==='stem'?f.positions:[];
  const roots=profile?profile.roots.map(r=>({position:r.position,role:r.strongestRole,
   participating:occupiedBranches.includes(r.position),clashExposed:clashed.has(r.position)})):[];
  const visible=profile?profile.visible.map(v=>({
   position:v.position,stem:v.stem,participating:occupiedStems.includes(v.position),
   isDayMaster:v.position==='day',substantialRoots:[...new Set(v.matches.filter(m=>m.role!=='residual').map(m=>m.position))],
   outsideUnclashedRoots:[...new Set(v.matches.filter(m=>m.role!=='residual'&&!occupiedBranches.includes(m.position)&&!clashed.has(m.position)).map(m=>m.position))]
  })):[];
  const monthRelation=target?elementRelation(monthPrincipalElement,target):null;
  const seasonRelation=target?elementRelation(seasonElement,target):null;
  const sameTarget=f.overlaps.filter(x=>x.kind==='same-target');
  const competing=f.overlaps.filter(x=>x.kind!=='same-target');
  const clashOverlap=f.disruptions.filter(x=>x.type==='branch.clash');
  const affectedRoots=structure.profiles.flatMap(p=>p.roots.filter(r=>occupiedBranches.includes(r.position)).map(r=>({
   element:p.element,position:r.position,role:r.strongestRole,isDayRoot:p.element===day,
   clashExposed:clashed.has(r.position),
   outsideRootPositions:p.roots.filter(x=>!occupiedBranches.includes(x.position)).map(x=>x.position)
  })));
  const participantRoots=structure.profiles.flatMap(p=>p.visible.filter(v=>occupiedStems.includes(v.position)).map(v=>({
   position:v.position,element:p.element,rootPositions:[...new Set(v.matches.map(m=>m.position))]
  })));
  const flags={
   targetKnown:target!==null,
   structurallyComplete:f.complete,
   cardinalPair:classification==='cardinal-three-pair',
   contiguous:f.contiguous,
   monthSupports:supports(monthRelation),
   seasonSupports:supports(seasonRelation),
   externalRootedProjection:visible.some(v=>!v.participating&&!v.isDayMaster&&v.outsideUnclashedRoots.length>0),
   directClash:clashOverlap.length>0,
   competingTarget:competing.length>0,
   dayMasterParticipates:occupiedStems.includes('day')
  };
  const limitations=[
   ...(!context.completeHour?['missing-hour']:[]),
   ...(!flags.targetKnown?['unspecified-target']:[]),
   ...(!flags.structurallyComplete&&!flags.cardinalPair?['incomplete-formation']:[]),
   ...(!flags.contiguous?['noncontiguous-positions']:[]),
   ...(!flags.monthSupports?['month-principal-support-not-observed']:[]),
   ...(!flags.seasonSupports?['season-support-not-observed']:[]),
   ...(!flags.externalRootedProjection?['independent-rooted-projection-not-observed']:[]),
   ...(flags.directClash?['overlapping-clash']:[]),
   ...(flags.competingTarget?['competing-or-unspecified-target']:[]),
   ...(flags.dayMasterParticipates?['day-master-reference-involved']:[])
  ];
  return {id:f.id,type:f.type,classification,layer:f.layer,positions:f.positions,members:f.members,
   target,flags,monthRelation,seasonRelation,roots,visible,affectedRoots,participantRoots,
   sameTargetOverlaps:sameTarget,competingOverlaps:competing,clashOverlap,
   otherDisruptions:f.disruptions.filter(x=>x.type!=='branch.clash'),
   // Strict conjunction for research stratification only, not a necessary
   // or sufficient condition of classical transformation.
   contextScreen:limitations.length?'review':'all-screen-flags-met',
   limitations,transformationConfirmed:null};
 });
 return {version:FORMATION_EVIDENCE_VERSION,completeHour:context.completeHour,
  status:context.completeHour?'diagnostic':'partial',month:{seasonElement,monthPrincipalElement,commandResolved:false},
  formations,clashes:context.clashes,effectsConfirmed:false,direction:null};
}
