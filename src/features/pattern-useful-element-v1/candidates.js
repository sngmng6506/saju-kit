import { tenGodForStem } from '../../core/natal.js';
import { LU,BLADE,patternFamily,PATTERN_SOURCES } from './source.js';
export function observePatternCandidates(context,interaction){
 const {dayMaster,month,completeHour}=context;
 const family=god=>patternFamily(god);
 const rows=month.hiddenStems.map(h=>{
  const entry=context.projectionEvidence.find(p=>p.position==='month'&&p.stem===h.stem);
  const exact=entry.matches.filter(m=>m.position!=='day'&&m.match==='exact-stem').map(m=>m.position);
  const same=entry.matches.filter(m=>m.position!=='day'&&m.match==='same-element').map(m=>({position:m.position,stem:m.stem}));
  return {...h,exactProjection:exact,sameElementProjection:same,projected:exact.length?true:completeHour?false:null};
 });
 const candidates=[];
 const add=(id,kind,tenGod,stems,extra={})=>candidates.push({id,kind,tenGod,family:family(tenGod),stems,...extra,selected:false,selectionAuthority:false});
 const principal=rows.find(r=>r.role==='principal');
 add('principal:'+principal.stem,'month-principal',principal.tenGod,[principal.stem]);
 for(const r of rows.filter(r=>r.projected===true))add('projected:'+r.stem,'month-hidden-projection',r.tenGod,[r.stem],{positions:r.exactProjection});
 // Branch group membership can raise a change hypothesis, not establish 化.
 for(const f of interaction.formations.filter(f=>f.layer==='branch'&&f.complete&&f.positions.includes('month')&&['branch.threeHarmony','branch.seasonalHarmony'].includes(f.type)&&f.associatedElement)){
  const godPairs=({wood:['갑','을'],fire:['병','정'],earth:['무','기'],metal:['경','신'],water:['임','계']})[f.associatedElement];
  candidates.push({id:'formation:'+f.id,kind:'month-formation',family:null,tenGod:null,stems:godPairs,
   possibleTenGods:godPairs.map(s=>tenGodForStem(dayMaster.stem,s)),formationId:f.id,element:f.associatedElement,
   transformationConfirmed:null,selected:false,selectionAuthority:false});
 }
 const lu=LU[dayMaster.stem]===month.branch,blade=BLADE[dayMaster.stem]===month.branch;
 const peerClass=blade?'yang-blade':lu?'established-lu':principal.tenGod==='겁재'?'month-rob-wealth':null;
 // Wu/Horse blade convention is independent of the hidden principal.
 if(peerClass)candidates.push({id:'peer:'+peerClass,kind:'month-peer-class',family:blade?'blade':'peer',
  tenGod:null,stems:[],peerClass,selected:false,selectionAuthority:false});
 return {sources:{...PATTERN_SOURCES},monthHidden:rows,peerClass,
  principalStem:principal.stem,principalProjected:principal.projected,
  alternateProjections:rows.filter(r=>r.role!=='principal'&&r.projected===true).map(r=>r.stem),
  candidates,selectionResolved:false,selectedPattern:null};
}
