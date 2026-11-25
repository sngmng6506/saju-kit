import { patternFamily } from '../pattern-useful-element-v1/source.js';
const STORAGE=new Set(['진','술','축','미']);
const SOURCE=Object.freeze({month:'https://www.donglishuzhai.net/chapter/3721.html',change:'https://www.donglishuzhai.net/chapter/3723.html',mixed:'https://donglishuzhai.net/chapter/3729.html',peer:'https://www.kaucim.ai/bazi/ziping-zhenquan/lun-jian-lu-yue-jie'});
const unique=x=>[...new Set(x)].sort();
const families=xs=>unique(xs.map(x=>x.family).filter(Boolean));
// A structural preference is not a confirmed 格局, 用神 or 相神.
// No positive/negative motif counts, numerical scores or fixture lookups.
export function resolvePatternPreference(selection,monthBranch,completeHour){
 const base={policy:'month-family-preference-v1',sources:{...SOURCE},selectionAuthority:false,confirmed:false,
  selectedUsefulStem:null,selectedAssistantStem:null,hypothesis:null};
 const stop=(reason,observations=null)=>({...base,status:'abstained',reason,observations});
 if(selection===null)return stop('unavailable-chart');
 const cs=selection.candidates;
 const principal=cs.find(c=>c.kind==='month-principal');
 const peer=cs.find(c=>c.kind==='month-peer-class');
 const direct=cs.filter(c=>c.kind==='month-hidden-projection'||c.kind==='month-storage-projection');
 const formation=cs.filter(c=>c.kind==='month-formation').map(c=>({id:c.id,families:unique((c.possibleTenGods??[]).map(patternFamily).filter(Boolean))}));
 const obs={principalFamily:principal?.family??null,peerClass:peer?.peerClass??null,projectedFamilies:families(direct),
  exactProjectionIds:direct.filter(c=>c.kind==='month-hidden-projection').map(c=>c.id),
  storageProjectionIds:direct.filter(c=>c.kind==='month-storage-projection').map(c=>c.id),formations:formation,storageMonth:STORAGE.has(monthBranch)};
 if(!completeHour)return stop('missing-hour',obs);
 if(!principal?.family)return stop('missing-principal',obs);
 let family,grounds,ids;
 if(peer){
  // Month lu/blade determines the classification basis, not the useful
  // god; a genuine alternate projection or incompatible group stays open.
  if(direct.some(c=>c.family!==peer.family&&c.family!=='peer'&&!(peer.family==='blade'&&c.stems.every(s=>principal.stems.includes(s)))))
   return stop('peer-class-versus-projection',obs);
  family=peer.family;grounds=['month-peer-class'];ids=[peer.id];
 }else if(direct.length){
  if(obs.projectedFamilies.length!==1)return stop('competing-projected-families',obs);
  family=obs.projectedFamilies[0];
  if(family==='peer')return stop('peer-class-unresolved',obs);
  grounds=[obs.storageMonth?'mixed-month-single-projected-family':family===principal.family?'principal-family-projected':'single-alternate-family-projected'];
  ids=direct.map(c=>c.id);
 }else{
  if(obs.storageMonth)return stop('mixed-month-without-projection',obs);
  if(principal.family==='peer')return stop('peer-class-unresolved',obs);
  family=principal.family;grounds=['month-principal-without-alternate-projection'];ids=[principal.id];
 }
 // Even a complete group is not established transformation. Incompatible
 // or unresolved group polarity blocks a unique family preference.
 if(formation.some(f=>f.families.length!==1||f.families[0]!==family))
  return stop('competing-or-unresolved-month-formation',obs);
 if(formation.length)grounds.push('month-formation-family-compatible');
 const stems=unique(cs.filter(c=>ids.includes(c.id)).flatMap(c=>c.stems));
 return {...base,status:'hypothesis',reason:null,observations:obs,
  hypothesis:{family,candidateIds:ids,anchorStems:stems,grounds,exactTenGodResolved:false,
   effectivePatternResolved:false,selectionAuthority:false,confirmed:false}};
}
