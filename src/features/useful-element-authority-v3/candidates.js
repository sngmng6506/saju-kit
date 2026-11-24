// Source candidates have their own namespace: they do not alter authority anchors.
export function projectSourceCandidates(climate){
 const p=climate.evidence?.sourceProfile;
 if(!p)return [];
 const temporal=new Map((climate.temporal?.conditions??[]).map(c=>[c.when,c]));
 const structural=new Map((climate.structuralConditions??[]).map(c=>[c.when,c]));
 const groups=p.groups.map((g,i)=>({id:'baseline:'+i,kind:'baseline-group',order:i+1,when:null,stems:g.map(s=>s.stem),groups:[g.map(s=>s.stem)],calendarPredicate:null,structuralPredicate:null}));
 const alternatives=p.alternatives.map((a,i)=>({id:'alternative:'+i,kind:'conditional-alternative',order:i+1,when:a.when,stems:[...a.stems],
  groups:a.groups?.map(g=>[...g])??null,calendarPredicate:temporal.get(a.when)??null,structuralPredicate:structural.get(a.when)??null}));
 return [...groups,...alternatives].map(c=>({...c,sourceId:p.sourceId,section:p.section,
  conditionResolved:false,selectionAuthority:false,confirmed:false}));
}
