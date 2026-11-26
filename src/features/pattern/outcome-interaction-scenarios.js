import {buildSharedForceBasis,compareSharedForceBasis} from './outcome-shared-force-basis.js';
import {evaluateScenarioSpace} from './outcome-scenario-space.js';
import {elementRelation} from '../../core/elements.js';
const key=(...xs)=>JSON.stringify(xs);
const same=(a,b)=>key(a)===key(b);
const uniq=xs=>[...new Set(xs)].sort();
const index=(xs,f)=>Array.isArray(xs)&&xs.every(x=>x&&typeof x==='object')&&new Set(xs.map(f)).size===xs.length?new Map(xs.map(x=>[f(x),x])):null;
const all=(...args)=>({op:'all',args}),any=(...args)=>({op:'any',args}),not=arg=>({op:'not',arg}),variable=id=>({op:'var',id});
const dnf=terms=>any(...terms.map(t=>all(...t.map(variable))));
export const INTERACTION_SCENARIO_VERSION='p2-interaction-scenarios-v1';
// Each query is a precisely named property of the shared basis, NOT an
// assertion of actual generation/control or modeled reception/release.
export function reviewInteractionScenarios(prior,root,pressure,argument,dependencies){
 const complete=prior?.completeHour,status=complete?'diagnostic':'partial';
 const base={version:INTERACTION_SCENARIO_VERSION,completeHour:complete,selectionAuthority:false,effective:null};
 const empty=reason=>({...base,status:'invalid-evidence',reason,manifest:[],space:null,summary:null});
 if(typeof complete!=='boolean'||[root,pressure,argument,dependencies].some(x=>!x||x.status!==status||x.completeHour!==complete||x.selectionAuthority!==false)||
  root.rootEffectConfirmed!==null||[pressure,argument,dependencies].some(x=>x.effective!==null))return empty('upstream');
 try{
  const basis=buildSharedForceBasis(prior,root);
  if(basis.status!==status||!same(basis,pressure.sharedForceBasis))return empty('basis-replay');
  const actors=index(prior.stemForce?.occurrences,a=>a.id),actions=index(argument.actions,a=>a.edgeId),profiles=index(basis.profiles,p=>p.actorId),nodes=index(dependencies.nodes,n=>n.id);
  if(!actors||!actions||!profiles||!nodes)return empty('identity');
  const visible=[...actors.values()].filter(a=>a.layer==='visible');
  const expected=visible.flatMap(a=>visible.filter(b=>a.id!==b.id&&elementRelation(a.element,b.element).direction==='left-to-right').map(b=>({id:a.id+'>'+b.id,from:a.id,to:b.id,kind:elementRelation(a.element,b.element).type})));
  if(expected.length!==actions.size||expected.some(e=>{const a=actions.get(e.id);return !a||a.from!==e.from||a.to!==e.to||a.kind!==e.kind;})||
   !same(uniq([...nodes.values()].filter(n=>n.kind==='action').map(n=>n.ref)),uniq([...actions.keys()])))return empty('coverage');
  const manifest=[],queries=[];
  for(const a of actions.values()){
   const l=profiles.get(a.from),r=profiles.get(a.to);
   if(!l||!r)return empty('profile');
   let formula,kind;
   if(a.kind==='control'){
    const axes=Object.keys(l.axes);
    if(!same(axes,Object.keys(r.axes)))return empty('axis-identity');
    const pairs=axes.map(k=>[dnf(l.axes[k]),dnf(r.axes[k])]);
    formula=all(all(...pairs.map(([x,y])=>any(not(y),x))),any(...pairs.map(([x,y])=>all(x,not(y)))));
    kind='controller-profile-dominance';
   }else if(a.kind==='generate'){
    formula=any(dnf(l.axes.anySubstantial),dnf(l.axes.localRootedGeneration));
    kind='source-root-or-local-generation-basis';
   }else return empty('action-kind');
   const id=key(a.edgeId,kind);
   manifest.push({id,edgeId:a.edgeId,kind,from:a.from,to:a.to,actualEffectState:'unresolved'});
   queries.push({id,formula});
  }
  // There is no independently reviewed physical exclusion policy yet.
  // All restrictions here arise solely from one shared primitive assignment.
  const space=evaluateScenarioSpace({scope:complete?'complete':'partial',variables:basis.primitives.map(p=>({id:p.id,value:p.value})),queries,constraints:[]});
  if(space.status==='invalid-evidence'||space.admissibleCount===0)return empty('scenario-space');
  if(space.status==='diagnostic'){
   const byId=new Map(space.queries.map(q=>[q.id,q]));
   for(const m of manifest.filter(m=>m.kind==='controller-profile-dominance')){
    const p=compareSharedForceBasis(basis,m.from,m.to),q=byId.get(m.id);
    if(p.status!=='diagnostic'||!q||(q.supportCount>0)!==p.possibleRelations.includes('left-evidence-dominates')||
     (q.state==='invariant-in-model')!==(p.invariantRelation==='left-evidence-dominates'))return empty('pairwise-parity');
   }
  }
  const pairs=space.pairs;
  return {...base,status,reason:null,manifest,space,summary:{queries:manifest.length,analysisStatus:space.status,
   individuallyPossibleButJointImpossible:space.status==='diagnostic'?pairs.filter(p=>p.individuallyPossibleButJointImpossible).length:null,
   jointlyPossible:space.status==='diagnostic'?pairs.filter(p=>p.counts.both>0).length:null,actualEffectsConfirmed:0},
   limitations:['shared-basis-properties-not-action-readiness','generation-basis-not-recipient-capacity','model-incompatibility-not-physical-exclusion','no-new-exclusion-policy','no-selection-authority']};
 }catch(e){return empty(e instanceof Error?e.message:'invalid-reference');}
}
