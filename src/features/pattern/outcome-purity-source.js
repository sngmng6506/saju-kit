import {elementRelation,stemInfo} from '../../core/elements.js';
const SOURCE='https://www.chenshupaipan.com/books/5/3880.html';
const POS=['year','month','hour'];
// Five explicit day/month clauses in 論用神純雜, not universal family pair rules.
// The Chen water projection is storage context, not a literal hidden 壬.
const defs=[
 {id:'xin-yin-wealth-officer',day:'신',month:'인',from:'갑',to:'병',kind:'generate',orientation:'aligned',conditions:['wealth-officer-effective']},
 {id:'wu-shen-food-wealth',day:'무',month:'신',from:'경',to:'임',kind:'generate',orientation:'aligned',conditions:['food-wealth-effective']},
 {id:'gui-wei-food-killing',day:'계',month:'미',from:'을',to:'기',kind:'control',orientation:'aligned',conditions:['food-killing-balance','day-capacity']},
 {id:'ren-wei-hurting-officer',day:'임',month:'미',from:'을',to:'기',kind:'control',orientation:'opposed',conditions:['actual-officer-injury','rescue-and-exceptions']},
 {id:'jia-chen-wealth-resource',day:'갑',month:'진',from:'무',to:'임',kind:'control',orientation:'opposed',conditions:['storage-access','actual-resource-injury','intervening-roles']}
];
export function observeSourcePurity(saju,reviews,completeHour){
 const pillars=saju.pillars;
 const visible=POS.filter(p=>pillars[p]).map(p=>({id:'visible:'+p,stem:pillars[p].stem,position:p}));
 const candidateIds=id=>reviews.filter(q=>q.anchorIds.includes(id)).map(q=>q.candidateId);
 const motifs=defs.filter(d=>d.day===pillars.day.stem&&d.month===pillars.month.branch).map(d=>{
  const witnesses=visible.filter(a=>a.stem===d.from).flatMap(a=>visible.filter(b=>b.stem===d.to).flatMap(b=>{
   const r=elementRelation(stemInfo(a.stem).element,stemInfo(b.stem).element);
   if(r.type!==d.kind||r.direction!=='left-to-right')return [];
   return [{from:a.id,to:b.id,kind:d.kind,fromCandidateIds:candidateIds(a.id),toCandidateIds:candidateIds(b.id),
    context:'source-pair-observation',effective:null}];
  }));
  return {id:d.id,orientation:d.orientation,source:SOURCE,witnesses,observed:witnesses.length?true:completeHour?false:null,
   unresolvedConditions:[...d.conditions],interpretationConfirmed:null};
 });
 return {source:SOURCE,motifs,completeHour,purityConfirmed:null,mixedConfirmed:null,selectionAuthority:false};
}
