import { branchIndex, stemIndex, stemInfo, elementRelation } from './elements.js';
import { createElementObservation } from './element-structure.js';

const ORDER=['year','month','day','hour'];
const PHASES=['장생','목욕','관대','건록','제왕','쇠','병','사','묘','절','태','양'];
const START=['해','오','인','유','인','유','사','자','신','묘'];
const ROLE_ORDER=['principal','middle','residual'];
export const LIFE_STAGE_VERSION='life-stage-yang-forward-yin-reverse-earth-fire-v1';

export function lifeStage(stem,branch){
  const index=stemIndex(stem),b=branchIndex(branch),start=branchIndex(START[index]);
  return PHASES[((b-start)*(index%2===0?1:-1)+12)%12];
}
const distance=(a,b)=>Math.abs(ORDER.indexOf(a)-ORDER.indexOf(b));
const slot=node=>node.position+':'+node.layer;
const local=(a,b)=>distance(a.position,b.position)<=1;

function rootsFor(visible,profile,pillars,clashes){
  return ORDER.filter(position=>pillars[position]!==null).map(position=>{
    const branch=pillars[position].branch;
    const matches=visible.matches.filter(m=>m.position===position);
    return {position,branch,distance:distance(visible.position,position),samePillar:visible.position===position,
      isMonth:position==='month',stage:lifeStage(visible.stem,branch),
      strongestRole:ROLE_ORDER.find(role=>matches.some(m=>m.role===role))??null,matches,
      exposedToClash:clashes.some(c=>c.positions.includes(position)),
      alternativeRootPositions:profile.roots.filter(r=>r.position!==position).map(r=>r.position)};
  });
}

function graph(structure){
  const nodes=structure.profiles.flatMap(p=>[
    ...p.visible.map(v=>({id:v.position+':stem',position:v.position,layer:'stem',element:p.element,
      stem:v.stem,rooted:v.rooted,rootPositions:[...new Set(v.matches.map(m=>m.position))]})),
    ...p.roots.map(r=>({id:r.position+':branch:'+p.element,position:r.position,layer:'branch',
      element:p.element,branch:r.branch,role:r.strongestRole,matches:r.matches})),
  ]);
  const edges=[];
  for(const from of nodes)for(const to of nodes){
    // Different hidden elements within one branch are not independent slots.
    if(slot(from)===slot(to))continue;
    const relation=elementRelation(from.element,to.element);
    if(relation.direction==='left-to-right')edges.push({from:from.id,to:to.id,type:relation.type,
      distance:distance(from.position,to.position),local:local(from,to)});
  }
  const byId=new Map(nodes.map(n=>[n.id,n]));
  const incoming=new Map(nodes.map(n=>[n.id,edges.filter(e=>e.to===n.id)]));
  const paths=[];
  const day=structure.dayMaster.element;
  // Only supportive visible stems (including the day master) are targets.
  // Protection: protector controls threat which controls target.
  // Mediation: threat generates mediator which generates target, while
  // threat also controls target. Distinct physical slots are required.
  for(const target of nodes.filter(n=>n.layer==='stem'&&
    (n.element===day||elementRelation(n.element,day).type==='generate'&&elementRelation(n.element,day).direction==='left-to-right'))){
    for(const threatEdge of incoming.get(target.id).filter(e=>e.type==='control')){
      const threat=byId.get(threatEdge.from);
      for(const first of incoming.get(threat.id).filter(e=>e.type==='control')){
        const protector=byId.get(first.from);
        if(slot(protector)===slot(target))continue;
        paths.push({type:'protection',target:target.id,threat:threat.id,via:protector.id,
          local:first.local&&threatEdge.local,confirmed:false});
      }
      for(const second of incoming.get(target.id).filter(e=>e.type==='generate')){
        const mediator=byId.get(second.from);
        if(slot(mediator)===slot(threat))continue;
        const first=edges.find(e=>e.from===threat.id&&e.to===mediator.id&&e.type==='generate');
        if(first)paths.push({type:'mediation',target:target.id,threat:threat.id,via:mediator.id,
          local:first.local&&second.local,confirmed:false});
      }
    }
  }
  return {nodes,edges,paths};
}

/** Neutral root and protection evidence. No strength score or effect inference. */
export function analyzeRootDynamics({saju}={}){
  const observation=createElementObservation(saju);
  return observeRootDynamics(observation.pillars,observation.structure());
}

export function observeRootDynamics(pillars,structure){
  const month=structure.month;
  const seasonElement={spring:'wood',summer:'fire',autumn:'metal',winter:'water'}[month.season];
  const roots=structure.profiles.flatMap(profile=>profile.visible.map(visible=>({
    position:visible.position,stem:visible.stem,element:profile.element,
    positions:rootsFor(visible,profile,pillars,structure.clashes),
  }))).sort((a,b)=>ORDER.indexOf(a.position)-ORDER.indexOf(b.position));
  const vertical=ORDER.filter(p=>pillars[p]!==null).map(position=>{
    const stem=stemInfo(pillars[position].stem).element;
    const principal=structure.profiles.find(p=>p.principalPositions.includes(position)).element;
    const relation=elementRelation(stem,principal);
    const control=relation.type==='control'?(relation.direction==='left-to-right'?'stem-controls-branch':'branch-controls-stem'):null;
    return {position,stemElement:stem,principalElement:principal,relation,control};
  });
  return {version:'root-dynamics-v1',lifeStageBasis:LIFE_STAGE_VERSION,hiddenStemsBasis:structure.hiddenStemsBasis,
    completeHour:structure.completeHour,dayMaster:structure.dayMaster,
    season:{season:month.season,seasonElement,monthPrincipalElement:month.principalElement,
      earthTransition:['진','술','축','미'].includes(month.branch),seasonToDay:elementRelation(seasonElement,structure.dayMaster.element),
      principalToDay:month.principalToDay,commandResolved:false},
    roots,vertical,...graph(structure),effectsConfirmed:false};
}
