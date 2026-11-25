// Literal predicates only; missing hour prevents an absence conclusion.
const rules={
 'jia-absent':[['absent','갑']], 'ren-absent':[['absent','임']],
 'ding-absent':[['absent','정']], 'gui-absent':[['absent','계']],
 'wu-absent':[['absent','무']], 'bing-absent':[['absent','병']],
 'xin-absent':[['absent','신']], 'ren-gui-visible':[['visible','임'],['visible','계']],
 'geng-present-jia-absent-wu-visible':[['present','경'],['absent','갑'],['visible','무']],
 'wu-visible-review':[['visible','무']], 'gui-visible-review':[['visible','계']]
};
export function observeSourceConditions(profile,structure){
 if(!profile)return [];
 const visible=structure.profiles.flatMap(p=>p.visible);
 const hidden=structure.profiles.flatMap(p=>p.roots.flatMap(r=>r.matches.map(m=>({...m,position:r.position}))));
 return (profile.alternatives??[]).map(a=>{
  const clauses=(Object.hasOwn(rules,a.when)?rules[a.when]:[]).map(([kind,stem])=>{
   const exactVisible=visible.filter(v=>v.stem===stem).map(v=>v.position);
   const exactHidden=hidden.filter(v=>v.stem===stem).map(v=>({position:v.position,role:v.role}));
   const found=kind==='visible'?exactVisible.length>0:exactVisible.length+exactHidden.length>0;
   const matched=found?kind!=='absent':structure.completeHour?kind==='absent':null;
   return {kind,stem,exactVisible,exactHidden,matched};
  });
  const matched=!clauses.length?null:clauses.some(c=>c.matched===false)?false:clauses.every(c=>c.matched===true)?true:null;
  return {when:a.when,clauses,matched,conditionResolved:false,selectionAuthority:false};
 });
}
