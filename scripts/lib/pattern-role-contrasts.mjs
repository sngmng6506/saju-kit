import {allOf} from './pattern-outcome-decision.mjs';
import {reviewEfficacyEdge} from './pattern-efficacy-review.mjs';
export const ROLE_CONTRAST_VERSION='pattern-role-contrast-v1';
const sources={resource:'https://www.kaucim.ai/bazi/ziping-zhenquan/lun-yin-shou',food:'https://www.kaucim.ai/bazi/ziping-zhenquan/lun-yong-shen-cheng-bai-jiu-ying',killing:'https://www.kaucim.ai/bazi/ziping-zhenquan/lun-pian-guan'};
const W=['정재','편재'],I=['정인','편인'],F=['식신'],K=['편관'],OWL=['편인'];
const slot=o=>o.position+':'+o.layer;
// Paths share actual actors, not only ten-god names. A chart-level
// strength hypothesis is an optional proxy, not proof of effective action.
const definitions=[
 {id:'wealth-resource-damage',family:'resource',roles:{wealth:W,resource:'anchor',day:'day'},edges:[['wealth','resource','control'],['resource','day','generate']],conditions:['resource-light','wealth-control-effective','resource-needed']},
 {id:'wealth-resource-regulation',family:'resource',roles:{wealth:W,resource:'anchor',day:'day'},edges:[['wealth','resource','control'],['resource','day','generate']],conditions:['day-strong','resource-excess','resource-root-sufficient','wealth-control-effective']},
 {id:'owl-food-damage',family:'food',roles:{owl:OWL,food:'anchor'},edges:[['owl','food','control']],conditions:['food-needed','owl-control-effective']},
 {id:'owl-food-protected-by-wealth',family:'food',roles:{wealth:W,owl:OWL,food:'anchor'},edges:[['wealth','owl','control'],['owl','food','control']],conditions:['food-needed','wealth-protection-effective']},
 {id:'food-to-killing-resource',family:'food',roles:{food:'anchor',killing:K,resource:I,day:'day'},edges:[['resource','food','control'],['killing','resource','generate'],['resource','day','generate']],conditions:['food-abandonment-permitted','killing-transmitted','resource-effective','wealth-not-interfering']},
 {id:'food-controls-killing',family:'killing',roles:{food:F,killing:'anchor',day:'day'},edges:[['day','food','generate'],['food','killing','control'],['killing','day','control']],conditions:['day-strong','day-capacity','food-killing-balance','food-control-effective']},
 {id:'killing-resource-transmission',family:'killing',roles:{killing:'anchor',resource:I,day:'day'},edges:[['killing','resource','generate'],['resource','day','generate'],['killing','day','control']],conditions:['resource-effective','killing-transmitted','transmission-preferred']},
 {id:'resource-blocks-food-controller',family:'killing',roles:{resource:I,food:F,killing:'anchor'},edges:[['resource','food','control'],['food','killing','control']],conditions:['food-control-needed','resource-control-effective']},
 {id:'resource-regulates-excess-food',family:'killing',roles:{resource:I,food:F,killing:'anchor'},edges:[['resource','food','control'],['food','killing','control']],conditions:['food-excess','resource-control-effective','food-control-retained']},
 {id:'wealth-protects-food-controller',family:'killing',roles:{wealth:W,resource:I,food:F,killing:'anchor'},edges:[['wealth','resource','control'],['resource','food','control'],['food','killing','control']],conditions:['food-control-needed','wealth-protection-effective','wealth-killing-pressure-resolved']}
];
function observeConditions(names,dayStrong){
 return names.map(name=>({name,proxy:name==='day-strong'?dayStrong:null,doctrinalValue:null}));
}
export function reviewRoleContrasts(result,outcome,context,interference){
 const base={version:ROLE_CONTRAST_VERSION,sources:{...sources},selectionAuthority:false,selectedPattern:null};
 if(!result.relativeForce||!result.routeReview||outcome.status==='unavailable')return {...base,status:'unavailable',candidates:[]};
 const complete=result.completeHour===true&&result.relativeForce.completeHour===true;
 const occurrences=result.routeReview.occurrences,byId=new Map(occurrences.map(o=>[o.id,o]));
 const graph=new Map(result.relativeForce.edges.map(e=>[e.id,e]));
 const edgeByPair=new Map(result.relativeForce.edges.map(e=>[JSON.stringify([e.from,e.to,e.kind]),e]));
 if(byId.size!==occurrences.length||graph.size!==result.relativeForce.edges.length||edgeByPair.size!==graph.size)throw Error('duplicate contrast graph identity');
 const lookup=(a,b,k)=>edgeByPair.get(JSON.stringify([a,b,k]));
 const actors=occurrences.filter(o=>!o.dayReference);
 const day=occurrences.find(o=>o.dayReference);
 if(!day)throw Error('missing day occurrence');
 const dayStrong=complete?context?.strength?.dayStrongHypothesis??null:null;
 const assess=e=>reviewEfficacyEdge({from:e.from,to:e.to,kind:e.kind,edgeId:e.id,screen:e.screen},graph,complete);
 const candidates=outcome.candidates.map(c=>{
  const anchor=c.anchorIds.map(id=>{const o=byId.get(id);if(!o)throw Error('unknown contrast anchor '+id);return o;});
  const patterns=definitions.filter(d=>d.family===c.family).map(d=>{
   let assignments=[{}];
   for(const [role,pool] of Object.entries(d.roles)){
    const choices=pool==='anchor'?anchor:pool==='day'?[day]:actors.filter(o=>pool.includes(o.tenGod));
    assignments=assignments.flatMap(a=>choices.filter(o=>!Object.values(a).some(v=>slot(v)===slot(o))).map(o=>({...a,[role]:o})));
   }
   const witnesses=assignments.flatMap(a=>{
    const edges=d.edges.map(([f,t,k])=>lookup(a[f].id,a[t].id,k));
    if(edges.some(e=>!e))return [];
    const roles=Object.fromEntries(Object.entries(a).map(([k,o])=>[k,o.id]));
    const edgeReviews=edges.map(assess);
    const conditions=observeConditions(d.conditions,dayStrong);
    const participants=new Set(Object.values(roles));
    const contacts=(interference?.pairs??[]).filter(p=>p.participants.some(id=>participants.has(id))).map(p=>p.id);
    const additionalEdges=[];
    // Wealth can feed the very killing whose food controller it protects.
    if(a.wealth&&a.killing){const e=lookup(a.wealth.id,a.killing.id,'generate');if(e)additionalEdges.push(assess(e));}
    // A separate relation is preserved, not subtracted from the primary path.
    const status=allOf(conditions.map(k=>k.proxy))===false?'conditional-excluded':
     edgeReviews.some(e=>e.status!=='necessary-screen-met')||contacts.length||additionalEdges.length?'structure-requires-review':'structure-screen-met';
    return [{id:JSON.stringify([d.id,roles]),roles,edges:edgeReviews,additionalEdges,conditions,contacts,status,
     conditionalPredicate:allOf(conditions.map(k=>k.proxy)),effective:null,favorable:null}];
   });
   return {id:d.id,source:sources[d.family],witnesses,observed:witnesses.length?true:complete?false:null,effective:null};
  });
  const rows=id=>patterns.find(p=>p.id===id)?.witnesses??[];
  const contrast=(left,right,keys)=>rows(left).flatMap(a=>rows(right).filter(b=>keys.every(k=>{
   const [l,r]=Array.isArray(k)?k:[k,k];return a.roles[l]===b.roles[r];
  })).map(b=>({left:a.id,right:b.id,sharedRoles:Object.fromEntries(keys.map(k=>{
   const [l,r]=Array.isArray(k)?k:[k,k];return [l===r?l:l+'='+r,a.roles[l]];
  })),resolution:null})));
  const contrasts=[
   ...contrast('wealth-resource-damage','wealth-resource-regulation',['wealth','resource','day']),
   ...contrast('owl-food-damage','food-to-killing-resource',['food',['owl','resource']]),
   ...contrast('owl-food-damage','owl-food-protected-by-wealth',['owl','food']),
   ...contrast('food-controls-killing','killing-resource-transmission',['killing','day']),
   ...contrast('food-controls-killing','resource-blocks-food-controller',['food','killing']),
   ...contrast('resource-blocks-food-controller','resource-regulates-excess-food',['resource','food','killing']),
   ...contrast('resource-blocks-food-controller','wealth-protects-food-controller',['resource','food','killing'])
  ];
  return {candidateId:c.candidateId,family:c.family,patterns,contrasts,formed:null,broken:null,rescued:null,selectionAuthority:false};
 });
 return {...base,status:complete?'research-review':'partial',candidates};
}
export function summarizeRoleContrasts(reviews){
 const cs=reviews.flatMap(r=>r.candidates),ps=cs.flatMap(c=>c.patterns);
 return {charts:reviews.length,partial:reviews.filter(r=>r.status==='partial').length,unavailable:reviews.filter(r=>r.status==='unavailable').length,
  candidates:cs.length,byPattern:Object.fromEntries(definitions.map(d=>{
   const p=ps.filter(p=>p.id===d.id),w=p.flatMap(p=>p.witnesses);
   return [d.id,{candidates:p.length,observed:p.filter(p=>p.observed===true).length,witnesses:w.length,
    screenMet:w.filter(x=>x.status==='structure-screen-met').length,requiresReview:w.filter(x=>x.status==='structure-requires-review').length,
    conditionalExcluded:w.filter(x=>x.status==='conditional-excluded').length}];
  })),contrasts:cs.reduce((n,c)=>n+c.contrasts.length,0),confirmedEffective:0,finalDecisions:0,selectionAuthority:false};
}
