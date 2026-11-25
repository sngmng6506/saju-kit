import { tenGodForStem } from '../../core/natal.js';
import { elementRelation } from '../../core/elements.js';
import { patternFamily } from './candidate-source.js';
const storage=Object.freeze({진:'water',술:'fire',축:'metal',미:'wood'});
const sources=Object.freeze({storage:'https://donglishuzhai.net/chapter/3729.html',wealth:'https://www.donglishuzhai.net/chapter/3746.html',resource:'https://www.donglishuzhai.net/chapter/3748.html',killing:'https://www.donglishuzhai.net/chapter/3752.html',blade:'https://www.donglishuzhai.net/chapter/3756.html',peer:'https://www.donglishuzhai.net/chapter/3758.html',assistant:'https://donglishuzhai.net/chapter/3728.html'});
export function observeStorageProjection(structure){
 const element=storage[structure.month.branch]??null;
 if(element===null)return {element,projections:[],candidates:[],selectionAuthority:false};
 const profile=structure.profiles.find(p=>p.element===element);
 const projections=profile.visible.filter(v=>v.position!=='day').map(v=>({stem:v.stem,position:v.position,
  exactMonthHidden:structure.month.hiddenStems.some(h=>h.stem===v.stem),tenGod:tenGodForStem(structure.dayMaster.stem,v.stem)}));
 const candidates=[...new Set(projections.filter(p=>!p.exactMonthHidden).map(p=>p.stem))].map(stem=>{
  const tenGod=tenGodForStem(structure.dayMaster.stem,stem);
  return {id:'storage:'+stem,kind:'month-storage-projection',stems:[stem],family:patternFamily(tenGod),tenGod,
   positions:projections.filter(p=>p.stem===stem).map(p=>p.position),element,storageBranch:structure.month.branch,
   source:sources.storage,rootEffective:null,selected:false,selectionAuthority:false};
 });
 return {element,projections,candidates,monthClash:structure.clashes.some(c=>c.positions.includes('month')),
  projectionObserved:projections.length?true:structure.completeHour?false:null,selectionAuthority:false};
}
const W=['정재','편재'],I=['정인','편인'],B=['비견','겁재'],O=['정관','편관'],E=['식신','상관'];
// Graph roles are distinct: helper, obstacle, protected target and contextual
// participants. A positive witness does not establish classical efficacy.
const defs=[
 {id:'wealth-output-mediates-peer',family:'wealth',source:'wealth',nodes:{peer:B,helper:E,target:'anchor'},edges:[['peer','helper','generate'],['helper','target','generate'],['peer','target','control']],conditions:['wealth-light','peer-strong','output-effective']},
 {id:'wealth-resource-protects-officer',family:'wealth',source:'wealth',nodes:{helper:I,obstacle:E,target:['정관'],wealth:'anchor'},edges:[['helper','obstacle','control'],['obstacle','target','control'],['wealth','target','generate']],conditions:['resource-wealth-noninterference','officer-preserved']},
 {id:'wealth-resource-separated',family:'wealth',source:'wealth',nodes:{helper:I,output:E,target:'anchor',separator:'peer-or-day'},edges:[['helper','output','control'],['output','target','generate']],conditions:['resource-output-noninterference','wealth-resource-noninterference'],separation:['helper','output','separator']},
 {id:'resource-protects-officer',family:'resource',source:'resource',nodes:{helper:'anchor',obstacle:E,target:['정관']},edges:[['helper','obstacle','control'],['obstacle','target','control'],['target','helper','generate']],conditions:['resource-effective','officer-preserved']},
 {id:'resource-uses-output',family:'resource',source:'resource',nodes:{resource:'anchor',helper:E,day:'day'},edges:[['resource','day','generate'],['day','helper','generate']],conditions:['day-and-resource-strong','output-not-blocked']},
 {id:'resource-excess-wealth',family:'resource',source:'resource',nodes:{helper:W,target:'anchor'},edges:[['helper','target','control']],conditions:['day-and-resource-strong','wealth-root-context']},
 {id:'resource-combines-output',family:'resource',source:'resource',nodes:{helper:'anchor',obstacle:E,target:W},edges:[['helper','obstacle','combine'],['obstacle','target','generate'],['target','helper','control']],conditions:['combination-effective','resource-preserved']},
 {id:'killing-resource-transmission',family:'killing',source:'killing',nodes:{killing:'anchor',helper:I,day:'day'},edges:[['killing','helper','generate'],['helper','day','generate']],conditions:['resource-effective','killing-transmitted','no-competing-control']},
 {id:'blade-resource-protects-controller',family:'blade',source:'blade',nodes:{helper:I,obstacle:E,target:O,day:'day'},edges:[['helper','obstacle','control'],['obstacle','target','control'],['target','day','control']],conditions:['controller-effective','resource-effective']},
 {id:'blade-combines-output',family:'blade',source:'blade',nodes:{helper:I,obstacle:E,target:['정관'],day:'day'},edges:[['helper','obstacle','combine'],['obstacle','target','control'],['target','day','control']],conditions:['combination-effective','officer-preserved']},
 {id:'blade-food-regulates-killing',family:'blade',source:'blade',nodes:{helper:['식신'],target:['편관'],day:'day'},edges:[['helper','target','control'],['target','day','control']],conditions:['killing-excess','controller-preserved']},
 {id:'peer-resource-protects-officer',family:'peer',source:'peer',nodes:{helper:I,obstacle:E,target:['정관'],day:'day'},edges:[['helper','obstacle','control'],['obstacle','target','control'],['target','day','control']],conditions:['resource-effective','officer-preserved']},
 {id:'peer-resource-supports-officer',family:'peer',source:'peer',nodes:{helper:I,target:['정관'],day:'day'},edges:[['target','helper','generate'],['target','day','control']],conditions:['resource-protects-officer','peer-regulated']},
 {id:'peer-combines-wealth-regulates-killing',family:'peer',source:'peer',nodes:{helper:B,obstacle:W,target:['편관'],day:'day'},edges:[['helper','obstacle','combine'],['obstacle','target','generate'],['target','day','control']],conditions:['combination-effective','killing-controlled']},
 {id:'peer-combines-output-preserves-officer',family:'peer',source:'peer',nodes:{helper:I,obstacle:E,target:['정관'],day:'day'},edges:[['helper','obstacle','combine'],['obstacle','target','control'],['target','day','control']],conditions:['combination-effective','officer-preserved']}
];
const order=['year','month','day','hour'],slot=x=>x.position+':'+x.layer;
export function observeRolePaths(selection,occurrences,interaction,completeHour){
 const actors=occurrences.filter(x=>!x.dayReference);
 const combos=interaction.formations.filter(x=>x.type==='stem.combine');
 const link=(a,b,kind)=>{
  if(kind==='combine'){
   const f=combos.find(x=>a.layer==='visible'&&b.layer==='visible'&&x.positions.includes(a.position)&&x.positions.includes(b.position));
   return f?{from:a.id,to:b.id,kind,formationId:f.id,effective:null}:null;
  }
  const r=elementRelation(a.element,b.element);
  return r.type===kind&&r.direction==='left-to-right'?{from:a.id,to:b.id,kind,effective:null}:null;
 };
 return selection.candidates.map(c=>{
  const anchor=actors.filter(a=>c.stems.includes(a.stem));
  const paths=defs.filter(d=>d.family===c.family).map(d=>{
   let assignments=[{}];
   for(const [role,gods] of Object.entries(d.nodes)){
    const pool=gods==='anchor'?anchor:gods==='day'?occurrences.filter(x=>x.dayReference):gods==='peer-or-day'?occurrences.filter(x=>x.dayReference||B.includes(x.tenGod)):actors.filter(a=>gods.includes(a.tenGod));
    assignments=assignments.flatMap(prev=>pool.filter(a=>!Object.values(prev).some(b=>slot(a)===slot(b))).map(a=>({...prev,[role]:a})));
   }
   const witnesses=assignments.flatMap(a=>{
    const edges=d.edges.map(([f,t,k])=>link(a[f],a[t],k));
    if(edges.some(e=>e===null))return [];
    if(d.separation){
     const [x,y,z]=d.separation.map(k=>a[k]);
     if([x,y,z].some(v=>v.layer!=='visible'))return [];
     const i=order.indexOf(z.position);if(i<=Math.min(order.indexOf(x.position),order.indexOf(y.position))||i>=Math.max(order.indexOf(x.position),order.indexOf(y.position)))return [];
    }
    return [{roles:Object.fromEntries(Object.entries(a).map(([k,v])=>[k,v.id])),edges,effective:null}];
   });
   return {id:d.id,source:sources[d.source],witnesses,observed:witnesses.length?true:completeHour?false:null,
    helperIds:[...new Set(witnesses.map(w=>w.roles.helper))],helperRole:d.nodes.helper==='anchor'?'anchor-as-protector':'conditional-role-participant',unresolvedConditions:[...d.conditions],conditionResolved:false,effectConfirmed:false};
  });
  return {candidateId:c.id,paths,selectionAuthority:false};
 });
}
