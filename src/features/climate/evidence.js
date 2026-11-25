import { stemInfo } from '../../core/elements.js';
import { climateSourceRow,CLIMATE_SOURCE_COVERAGE } from './source-v1.js';
export function climateEvidence(context,structure,{lookup=climateSourceRow,coverage=CLIMATE_SOURCE_COVERAGE,projectAlternatives=false}={}){
 const {dayMaster,month}=context;
 // Xu commentary names these seasonal cases, not a universal thermometer.
 const seasonalNeed=month.season==='winter'&&['metal','water'].includes(dayMaster.element)?'warmth-review':
  month.season==='summer'&&['wood','fire'].includes(dayMaster.element)?'heat-dryness-review':null;
 const seasonCandidate=seasonalNeed==='warmth-review'?'fire':seasonalNeed==='heat-dryness-review'?'water':null;
 const clashed=new Set(structure.clashes.flatMap(c=>c.positions));
 function elementEvidence(element){
  const p=structure.profiles.find(x=>x.element===element);
  return {element,visible:p.visible.filter(v=>v.position!=='day').map(v=>({position:v.position,stem:v.stem})),
   roots:p.roots.map(r=>({position:r.position,role:r.strongestRole,clashExposed:clashed.has(r.position)})),
   presentOutsideDay:p.visible.some(v=>v.position!=='day')||p.roots.length>0};
 }
 function stemEvidence(stem){
  const element=stemInfo(stem).element,p=structure.profiles.find(x=>x.element===element);
  return {stem,element,exactVisible:p.visible.filter(v=>v.position!=='day'&&v.stem===stem).map(v=>v.position),
   exactHidden:p.roots.flatMap(r=>r.matches.filter(m=>m.stem===stem).map(m=>({position:r.position,role:m.role,clashExposed:clashed.has(r.position)}))),
   elementalEvidence:elementEvidence(element)};
 }
 const source=lookup(dayMaster.stem,month.branch);
 return {seasonal:{sourceId:'xu-ziping-commentary-climate',source:'https://dao.time.actor/ziping-zhenquan-pingzhu/juan-2',
  season:month.season,need:seasonalNeed,candidate:seasonCandidate?elementEvidence(seasonCandidate):null,
  heatResolved:false,moistureResolved:false},
  sourceProfile:source?{...source,groups:source.groups.map(g=>g.map(stemEvidence)),...(projectAlternatives?{alternatives:(source.alternatives??[]).map(a=>({...a,evidence:a.stems.map(stemEvidence)}))}:{}),qualifiersResolved:false}:null,
  sourceCoverage:{covered:coverage,total:120},usefulElement:null,confirmed:false};
}
