import {elementRelation} from '../../core/elements.js';
const ORDER=['year','month','day','hour'];
const index=o=>ORDER.indexOf(o.position);
const relation=(a,b)=>elementRelation(a.element,b.element);
const directed=(a,b,kind)=>{const r=relation(a,b);return r.type===kind&&r.direction==='left-to-right';};
const SOURCE='https://www.tianyashuku.com/yijing/9643/814121.html';
const W=['정재','편재'],I=['정인','편인'];
// Physical ordering is not temporal execution. Only visible stems can be
// intervening stems. Hidden endpoints and group aggregates remain separate.
export function observePositionContext(prior,reviews){
 const actors=prior.stemForce.occurrences,byId=new Map(actors.map(o=>[o.id,o]));
 const visible=actors.filter(o=>o.layer==='visible').sort((a,b)=>index(a)-index(b));
 const between=(a,b)=>visible.filter(o=>index(o)>Math.min(index(a),index(b))&&index(o)<Math.max(index(a),index(b)));
 const edge=(e)=>{
  const a=byId.get(e.from),b=byId.get(e.to);
  if(!a||!b)return {from:e.from,to:e.to,kind:e.kind,scope:'aggregate-or-unknown-endpoint',order:null,span:null,intervening:[],effectConfirmed:null};
  const span=Math.abs(index(a)-index(b)),bothVisible=a.layer==='visible'&&b.layer==='visible';
  const intervening=between(a,b).map(o=>({id:o.id,dayReference:o.dayReference,
   controlsSource:directed(o,a,'control'),controlsTarget:directed(o,b,'control'),
   generatesSource:directed(o,a,'generate'),generatesTarget:directed(o,b,'generate'),
   sourceGeneratesIntervenor:directed(a,o,'generate'),targetGeneratesIntervenor:directed(b,o,'generate')}));
  return {from:e.from,to:e.to,kind:e.kind,scope:bothVisible?'visible-stems':'hidden-endpoint-context',
   order:bothVisible?(index(a)<index(b)?'source-before-target':index(a)>index(b)?'source-after-target':'same-pillar'):null,
   span,adjacent:bothVisible?span===1:null,intervening,effectConfirmed:null};
 };
 const wealth=visible.filter(o=>!o.dayReference&&W.includes(o.tenGod)),resources=visible.filter(o=>!o.dayReference&&I.includes(o.tenGod));
 const separation=wealth.flatMap(a=>resources.map(b=>{
  const intervening=between(a,b).map(o=>({id:o.id,dayReference:o.dayReference,wealthToIntervenor:relation(a,o),intervenorToResource:relation(o,b),
   mediatesGeneration:directed(a,o,'generate')&&directed(o,b,'generate')}));
  return {wealth:a.id,resource:b.id,wealthControlsResource:directed(a,b,'control'),span:Math.abs(index(a)-index(b)),
   order:index(a)<index(b)?'wealth-before-resource':'resource-before-wealth',separated:intervening.length>0,
   intervening,noninterferenceConfirmed:null,effective:null};
 }));
 const candidateReviews=reviews.map(q=>({candidateId:q.candidateId,
  witnesses:q.rules.flatMap(r=>r.witnesses.map(w=>({ruleId:r.id,witnessId:w.id,
   // Rescue edges supplement (do not replace) the original damage edges.
   threatWitnessId:w.threatWitnessId??null,
   edges:w.edges.map(edge),anchorEdges:(w.anchorBindings??[]).filter(b=>b.edge).map(b=>edge(b.edge)),
   rolePositions:Object.fromEntries(Object.entries(w.roles).map(([role,id])=>[role,byId.has(id)?{position:byId.get(id).position,layer:byId.get(id).layer}:null])),
   orderEffectConfirmed:null})))}));
 return {source:SOURCE,completeHour:prior.completeHour,visibleOrder:visible.map(o=>o.id),wealthResourceSeparation:separation,
  sourceOrder:prior.qualityReview?.sourceOrder??[],candidateReviews,
  separationEffectConfirmed:null,orderEffectConfirmed:null,selectionAuthority:false};
}
