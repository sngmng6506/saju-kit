import { tenGodForStem } from '../../core/natal.js';
const ORDER=['year','month','day','hour'];
const source='https://donglishuzhai.net/chapter/3744.html';
// Narrow source-inspired guard: visible 七殺 must not silently replace
// a monthly 正官 merely because an opposite-polarity stem is projected.
// Actual combination is still not proven cancellation.
export function refineOfficerPreference(preference,selection,structure,interaction){
 const meta={...preference,policy:'month-family-preference-v2',officerReview:null};
 if(preference.status!=='hypothesis'||preference.hypothesis.family!=='killing'||preference.observations.principalFamily!=='officer')return meta;
 const visible=structure.profiles.flatMap(p=>p.visible).filter(v=>v.position!=='day')
  .map(v=>({...v,tenGod:tenGodForStem(structure.dayMaster.stem,v.stem)}));
 const principal=selection.candidates.find(c=>c.kind==='month-principal'&&c.family==='officer');
 const killings=visible.filter(v=>v.tenGod==='편관');
 const officers=visible.filter(v=>v.tenGod==='정관');
 const combos=interaction.formations.filter(f=>f.type==='stem.combine');
 const contact=position=>combos.filter(f=>f.positions.includes(position));
 const observed=killings.map(k=>{
  const matches=contact(k.position).flatMap(f=>{
   const partner=visible.find(v=>v.position!==k.position&&f.positions.includes(v.position));
   if(!partner||partner.tenGod!=='겁재'||Math.abs(ORDER.indexOf(k.position)-ORDER.indexOf(partner.position))!==1)return [];
   return [{formationId:f.id,killing:k.position,partner:partner.position,uniqueAtBoth:contact(k.position).length===1&&contact(partner.position).length===1}];
  });
  return {position:k.position,matches};
 });
 const allUnique=observed.length>0&&observed.every(o=>o.matches.length===1&&o.matches[0].uniqueAtBoth);
 const officerCombination=officers.some(o=>contact(o.position).length>0);
 const monthClash=structure.clashes.some(c=>c.positions.includes('month'));
 const review={source,observed,allUnique,officerCombination,monthClash,effectiveCancellation:null,confirmed:false};
 // Source preservation is a conditional family hypothesis only. Other
 // formation changes or competing pairings are not resolved here.
 if(!principal||!allUnique||officerCombination||monthClash||preference.observations.formations.length)
  return {...meta,status:'abstained',reason:'officer-killing-preservation-unresolved',hypothesis:null,officerReview:review};
 return {...meta,status:'hypothesis',reason:null,officerReview:review,hypothesis:{
  family:'officer',candidateIds:[principal.id],anchorStems:[...principal.stems],grounds:['monthly-officer-preservation','adjacent-uncontested-peer-killing-combination'],
  exactTenGodResolved:false,effectivePatternResolved:false,selectionAuthority:false,confirmed:false}};
}
