// Independently checked textual motifs. These are scoped to the named
// day/month and do not inherit generic qualifier semantics.
const source='https://zh.wikisource.org/zh-hant/窮通寶鑑';
const definitions={
 '정묘':{section:'三春丁火',witness:'https://sajumania.com/ebook/to01-01/to01-01-05.htm',
  edges:[['경','을','control','remove-wet-yi-review'],['갑','정','generate','feed-ding-review']]},
 '신사':{section:'三夏辛金',witness:'https://sajumania.com/ebook/to01-01/to01-01-09.htm',
  edges:[['임','병','control','summer-fire-review'],['무','임','control','wu-obstruction-review'],['갑','무','control','wood-controls-wu-review']]},
 '임신':{section:'三秋壬水',witness:'https://asklingxi.com/zh-tw/books/qiongtong-baojian/05-lun-shui/09-qi-yue-ren-shui',
  edges:[['무','임','control','contain-ren-review'],['정','무','generate','support-wu-review'],['정','경','control','control-geng-review'],['갑','무','control','jia-obstructs-wu-review'],['경','갑','control','geng-rescue-review']],
  rootReview:{stem:'무',preferred:['진','술'],excluded:['신']}},
 '기묘':{section:'三春己土',witness:'https://sajumania.com/ebook/to01-01/to01-01-07.htm',
  edges:[['갑','기','control','loosen-earth-review'],['계','기','moisten','moisture-review']],
  combinationReview:['갑','기']}
};
export function observeTextualMotifs(structure){
 const d=definitions[structure.dayMaster.stem+structure.month.branch];
 if(!d)return null;
 const visible=structure.profiles.flatMap(p=>p.visible);
 const hidden=structure.profiles.flatMap(p=>p.roots.flatMap(r=>r.matches.map(m=>({position:r.position,branch:r.branch,stem:m.stem,role:m.role}))));
 const locate=stem=>({stem,dayReference:structure.dayMaster.stem===stem,
  visible:visible.filter(v=>v.stem===stem&&v.position!=='day').map(v=>v.position),
  hidden:hidden.filter(h=>h.stem===stem).map(h=>({position:h.position,branch:h.branch,role:h.role}))});
 const clashed=new Set(structure.clashes.flatMap(c=>c.positions));
 const rootReview=d.rootReview?{
  stem:d.rootReview.stem,
  preferredBranches:[...d.rootReview.preferred],excludedBranches:[...d.rootReview.excluded],
  occurrences:hidden.filter(h=>h.stem===d.rootReview.stem).map(h=>({...h,
   sourceClass:d.rootReview.preferred.includes(h.branch)?'named-preferred':d.rootReview.excluded.includes(h.branch)?'named-excluded':'unspecified',
   clashExposed:clashed.has(h.position)})),effectiveRoot:null
 }:null;
 const combinationReview=d.combinationReview?structure.formations.filter(f=>f.type==='stem.combine'&&d.combinationReview.every(s=>f.members.includes(s)))
  .map(f=>({members:[...f.members],positions:[...f.positions],transformationConfirmed:null})):null;
 return {source,section:d.section,witness:d.witness,edges:d.edges.map(([from,to,action,reason])=>({from:locate(from),to:locate(to),action,reason,effective:null})),
  rootReview,combinationReview,sourceConditionsResolved:false,selectionAuthority:false};
}
