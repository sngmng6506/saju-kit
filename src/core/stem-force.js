import { observeRootDynamics,lifeStage } from './root-dynamics.js';
import { observeInteractionContext } from './interaction-context.js';
import { createElementObservation } from './element-structure.js';
import { elementRelation } from './elements.js';
import { tenGodForStem } from './natal.js';
const ORDER=['year','month','day','hour'];
const distance=(a,b)=>Math.abs(ORDER.indexOf(a)-ORDER.indexOf(b));
const slot=n=>n.position+':'+n.layer;
const unique=xs=>[...new Set(xs)];
const observed=(xs,complete)=>xs.length?true:complete?false:null;
const SOURCE=Object.freeze({roots:'https://donglishuzhai.net/chapter/3719.html',quality:'https://www.kaucim.ai/bazi/ziping-zhenquan/lun-yong-shen-ge-ju-gao-di'});
export const STEM_FORCE_VERSION='stem-force-evidence-v1';
// One physical occurrence per visible stem / hidden stem; branch slots are
// not independent supply budgets. Reuse the core graph for directed edges.
export function observeStemForce(pillars,dynamics,interaction){
 const complete=dynamics.completeHour;
 const nodes=dynamics.nodes,byId=new Map(nodes.map(n=>[n.id,n]));
 const combos=interaction.formations.filter(f=>f.type==='stem.combine');
 const groups=interaction.formations.filter(f=>f.layer==='branch'&&f.complete);
 const clashed=new Set(interaction.clashes.flatMap(c=>c.positions));
 const contacts=n=>n.layer==='stem'?combos.filter(f=>f.positions.includes(n.position)).map(f=>f.id):
  groups.filter(f=>f.positions.includes(n.position)).map(f=>f.id);
 const nodeEvidence=n=>{
  const rs=n.layer==='stem'?dynamics.roots.find(r=>r.position===n.position).positions.flatMap(p=>p.matches.map(m=>({...m,stage:p.stage,clashExposed:p.exposedToClash}))):
   n.matches.map(m=>({...m,position:n.position,branch:n.branch,match:'hidden-occurrence',clashExposed:clashed.has(n.position)}));
  const substantial=rs.filter(r=>r.role!=='residual');
  return {id:n.id,position:n.position,layer:n.layer,element:n.element,
   rootPositions:unique(rs.map(r=>r.position)),substantialRootPositions:unique(substantial.map(r=>r.position)),
   unexposedSubstantialRootPositions:unique(substantial.filter(r=>!r.clashExposed).map(r=>r.position)),
   contacts:contacts(n),dayReference:n.layer==='stem'&&n.position==='day'};
 };
 const evidence=Object.fromEntries(nodes.map(n=>[n.id,nodeEvidence(n)]));
 const incoming=id=>dynamics.edges.filter(e=>e.to===id);
 const outgoing=id=>dynamics.edges.filter(e=>e.from===id);
 const edgeEvidence=e=>({from:e.from,to:e.to,type:e.type,distance:e.distance,local:e.local,
  sourceEvidence:evidence[e.from],targetEvidence:evidence[e.to],effectConfirmed:null});
 const occurrences=nodes.flatMap(n=>n.layer==='stem'?[{id:'visible:'+n.position,stem:n.stem,node:n}]:
  n.matches.map(m=>({id:'hidden:'+n.position+':'+m.stem,stem:m.stem,node:n,role:m.role})));
 const rows=occurrences.map(o=>{
  const n=o.node,element=n.element;
  // Hidden stem is a local constituent, not another free visible stem.
  // Its element roots elsewhere are contextual, not independently accessible.
  const branchRoots=nodes.filter(x=>x.layer==='branch'&&x.element===element).flatMap(x=>x.matches.map(m=>({
   position:x.position,branch:x.branch,stem:m.stem,role:m.role,match:m.stem===o.stem?'exact-stem':'same-element',
   distance:distance(n.position,x.position),stage:lifeStage(o.stem,x.branch),clashExposed:clashed.has(x.position)})));
  const substantial=branchRoots.filter(r=>r.role!=='residual'),unexposed=substantial.filter(r=>!r.clashExposed);
  const support=incoming(n.id).filter(e=>e.type==='generate').map(edgeEvidence);
  const pressure=incoming(n.id).filter(e=>e.type==='control').map(edgeEvidence);
  const drains=outgoing(n.id).filter(e=>e.type==='generate'||e.type==='control').map(edgeEvidence);
  const peers=nodes.filter(x=>x.element===element&&slot(x)!==slot(n)).map(x=>evidence[x.id]);
  const paths=[];
  for(const t of incoming(n.id).filter(e=>e.type==='control')){
   const threat=byId.get(t.from);
   for(const p of incoming(threat.id).filter(e=>e.type==='control')){
    const helper=byId.get(p.from);
    if(new Set([slot(helper),slot(threat),slot(n)]).size!==3)continue;
    paths.push({kind:'protection',helper:helper.id,threat:threat.id,target:n.id,edges:[edgeEvidence(p),edgeEvidence(t)],effective:null});
   }
   for(const m of incoming(n.id).filter(e=>e.type==='generate')){
    const mediator=byId.get(m.from);
    if(new Set([slot(mediator),slot(threat),slot(n)]).size!==3)continue;
    const first=outgoing(threat.id).find(e=>e.to===mediator.id&&e.type==='generate');
    if(first)paths.push({kind:'mediation',helper:mediator.id,threat:threat.id,target:n.id,edges:[edgeEvidence(first),edgeEvidence(m),edgeEvidence(t)],effective:null});
   }
  }
  const monthStage=lifeStage(o.stem,pillars.month.branch);
  const seasonal={seasonRelation:elementRelation(dynamics.season.seasonElement,element),
   principalRelation:elementRelation(dynamics.season.monthPrincipalElement,element),monthStage,commandResolved:false};
  const rootBasis={exactSubstantial:unique(substantial.filter(r=>r.match==='exact-stem').map(r=>r.position)),
   sameElementSubstantial:unique(substantial.filter(r=>r.match==='same-element').map(r=>r.position)),
   residual:unique(branchRoots.filter(r=>r.role==='residual').map(r=>r.position)),unexposedSubstantial:unique(unexposed.map(r=>r.position)),
   monthRoots:branchRoots.filter(r=>r.position==='month'),clashExposed:unique(branchRoots.filter(r=>r.clashExposed).map(r=>r.position)),
   substantialObserved:observed(substantial,complete),unexposedSubstantialObserved:observed(unexposed,complete)};
  const supportBasis=support.filter(e=>e.sourceEvidence.unexposedSubstantialRootPositions.length);
  const pressureBasis=pressure.filter(e=>e.sourceEvidence.unexposedSubstantialRootPositions.length);
  // Mutually independent observations, not summed strength or proof of no force.
  const diagnostics={unexposedSubstantialRoot:observed(unexposed,complete),
   rootedGeneratingSource:observed(supportBasis,complete),rootedControllingSource:observed(pressureBasis,complete),
   rootClashObserved:observed(branchRoots.filter(r=>r.clashExposed),complete),
   combinationOrGroupContact:observed(contacts(n),complete)};
  const basis=unexposed.length?'substantial-root-evidence':substantial.length?'clash-exposed-substantial-roots-only':
   branchRoots.length?'residual-root-evidence':complete?'no-literal-root-observed':'root-absence-unresolved';
  return {id:o.id,graphNodeId:n.id,position:n.position,layer:n.layer==='stem'?'visible':'hidden',stem:o.stem,element,
   tenGod:tenGodForStem(dynamics.dayMaster.stem,o.stem),dayReference:n.layer==='stem'&&n.position==='day',hiddenRole:o.role??null,
   seasonal,roots:branchRoots,rootBasis,rootEvidenceKind:basis,diagnostics,peers,generationReceived:support,controlReceived:pressure,outputAndControl:drains,
   protectionAndMediation:paths,contacts:contacts(n),effectiveForce:null,forceClass:null,confirmed:false};
 });
 return {version:STEM_FORCE_VERSION,sources:{...SOURCE},completeHour:complete,occurrences:rows,selectionAuthority:false,effectsConfirmed:false};
}
export function analyzeStemForceEvidence({saju}={}){
 const observation=createElementObservation(saju),structure=observation.structure(),pillars=observation.pillars;
 return observeStemForce(pillars,observeRootDynamics(pillars,structure),observeInteractionContext(pillars,structure,observation.relations()));
}
