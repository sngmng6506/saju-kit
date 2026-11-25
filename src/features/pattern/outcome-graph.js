import {stemCombination} from '../../core/relations.js';
const slot=a=>a.position+':'+a.layer;
const sorted=xs=>[...new Set(xs)].sort();
const applicable=(candidate)=>candidate.kind==='month-peer-class'?
 ['blade','peer'].includes(candidate.family):
 ['month-principal','month-hidden-projection'].includes(candidate.kind)&&!['blade','peer'].includes(candidate.family)&&candidate.family!==null;
export function reviewOutcomeGraph(prior,candidate,rules,{storageAnchorIds=null}={}){
 const empty={candidateId:candidate.id,family:candidate.family,formed:null,broken:null,rescued:null,selectionAuthority:false};
 const storageScope=candidate.kind==='month-storage-projection'&&Array.isArray(storageAnchorIds)&&storageAnchorIds.length>0;
 if(!applicable(candidate)&&!storageScope)return {...empty,status:'out-of-scope',reason:'candidate-anchor-not-resolved',anchorIds:[],rules:[],assistantCandidates:[]};
 const actors=prior.routeReview.occurrences,byId=new Map(actors.map(a=>[a.id,a]));
 const edges=new Map(prior.relativeForce.edges.map(e=>[e.id,e]));
 const visible=actors.filter(a=>a.layer==='visible'&&!a.dayReference);
 const day=actors.filter(a=>a.dayReference);
 const anchor=storageScope?actors.filter(a=>a.layer==='visible'&&!a.dayReference&&storageAnchorIds.includes(a.id)&&candidate.stems.includes(a.stem)):candidate.kind==='month-peer-class'?day:actors.filter(a=>!a.dayReference&&candidate.stems.includes(a.stem)&&(a.layer==='visible'||a.position==='month'));
 const pool=role=>role==='anchor'?anchor:role==='day'?day:visible.filter(a=>role.includes(a.tenGod));
 function link(a,b,kind){
  if(kind==='combine'){
   if(a.layer!=='visible'||b.layer!=='visible'||!stemCombination(a.stem,b.stem))return null;
   const contacts=x=>actors.filter(y=>y.layer==='visible'&&y.id!==x.id&&stemCombination(x.stem,y.stem)).map(y=>y.id).sort();
   return {from:a.id,to:b.id,kind,edgeId:null,contact:{fromPartners:contacts(a),toPartners:contacts(b)},screen:'combination-effect-unresolved',effective:null};
  }
  const e=edges.get(a.id+'>'+b.id);
  return e&&e.kind===kind?{from:a.id,to:b.id,kind,edgeId:e.id,screen:e.screen,blockers:[...e.blockers],effective:null}:null;
 }
 function assign(roles,seed){
  let rows=[seed];
  for(const [role,selector] of Object.entries(roles))rows=rows.flatMap(row=>pool(selector).filter(a=>!Object.values(row).some(b=>slot(a)===slot(b))).map(a=>({...row,[role]:a})));
  return rows;
 }
 const results=[];
 for(const def of rules){
  const threat=def.kind==='rescue'?results.find(r=>r.id===def.threat):null;
  if(def.kind==='rescue'&&(!threat||threat.kind!=='damage'))throw new Error('Invalid rescue reference '+def.id);
  const seeds=threat?threat.witnesses.map(w=>({seed:Object.fromEntries(Object.entries(w.roles).map(([k,id])=>[k,byId.get(id)])),threat:w})): [{seed:{},threat:null}];
  const witnesses=seeds.flatMap(({seed,threat})=>assign(def.roles,seed).flatMap(row=>{
   const links=def.edges.map(([a,b,k])=>link(row[a],row[b],k));
   if(links.some(e=>e===null))return [];
   const roles=Object.fromEntries(Object.entries(row).map(([k,a])=>[k,a.id]));
   return [{id:def.id+':'+Object.entries(roles).map(([k,id])=>k+'='+id).join('|'),roles,edges:links,threatWitnessId:threat?.id??null,effective:null}];
  }));
  results.push({id:def.id,kind:def.kind,threatRuleId:def.threat??null,observed:witnesses.length?true:prior.completeHour?false:null,
   witnesses,unresolvedConditions:[...def.unresolved],conditionResolved:false,effective:null});
 }
 const support=results.filter(r=>r.kind==='support'&&r.observed===true);
 const damage=results.filter(r=>r.kind==='damage'&&r.observed===true);
 const rescue=results.filter(r=>r.kind==='rescue'&&r.observed===true);
 const assistantCandidates=sorted([...support,...rescue].flatMap(r=>r.witnesses.flatMap(w=>[w.roles.helper,w.roles.controller].filter(Boolean))))
  .map(id=>({occurrenceId:id,role:'conditional-participant',confirmed:false}));
 return {...empty,status:!prior.completeHour?'partial':support.length&&damage.length?'support-and-damage-observed':damage.length?'damage-observed':support.length?'support-observed':'no-covered-witness',
  anchorIds:anchor.map(a=>a.id),anchorBasis:candidate.kind==='month-peer-class'?'day-reference-proxy':'exact-month-hidden-or-visible-projection',
  rules:results,assistantCandidates,rescueObserved:rescue.length>0?true:prior.completeHour?false:null};
}
