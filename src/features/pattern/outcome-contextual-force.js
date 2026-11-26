import {evaluateArguments} from './outcome-argumentation.js';
import {compareForceCompletionEnvelope} from '../../core/relative-force.js';
export const CONTEXTUAL_FORCE_VERSION='p1-relative-context-principles-v1';
const rootAxes=['exactSubstantial','anySubstantial','ownPillarSubstantial','monthSubstantial'];
const seasonAxes=['principalSupport','seasonSupport'];
const supplyAxes=['localRootedGeneration','localRootedPeer'];
const keys=[...rootAxes,...seasonAxes,...supplyAxes];
const source=Object.freeze({book:'子平真詮',chapter:'論十干得時不旺失時不弱',url:'https://changxianyi.com/guji/ziping/wz-20260914/chapter-007/',
 parallel:'https://zh.wikisource.org/zh-hant/滴天髓闡微#十七、衰旺',authority:'source-rationale-for-context-review-not-comparative-sufficiency'});
const id=(...x)=>JSON.stringify(x),lit=(propositionId,sign='for')=>({propositionId,sign});
const refs=(owner,id,field)=>[{owner,id,field}];
const valid=x=>x&&Object.keys(x).length===keys.length&&keys.every(k=>Object.hasOwn(x,k)&&[true,false,null].includes(x[k]));
const direction=(a,b)=>a===true&&b===false?true:a===false&&b===true?false:a===null||b===null?null:false;
// A scoped challenge to a season-only comparison, not a rule that
// root outranks season or that more axes imply greater strength.
// The source discusses an actor's contextual strength, not a binary
// inter-actor force order; the model only retains contrary evidence.
export function evaluateContextualForceComparison({completeHour,pressureId,left,right}={}){
 const base={version:CONTEXTUAL_FORCE_VERSION,selectionAuthority:false,forceComparison:null,actualControlState:'unresolved',source};
 const empty=()=>({...base,status:'invalid-evidence',views:null,sides:[],propositions:[],evidence:[],rules:[],judgments:[],ruleResults:[]});
 if(typeof completeHour!=='boolean'||typeof pressureId!=='string'||!pressureId||!valid(left)||!valid(right))return empty();
 // Root location/exact observations imply a substantial root, but
 // unknown or contested roots do not establish absence.
 for(const x of [left,right])if(rootAxes.filter(k=>k!=='anySubstantial').some(k=>x[k]===true)&&x.anySubstantial!==true)return empty();
 const select=(x,ks)=>Object.fromEntries(ks.map(k=>[k,x[k]]));
 const views=Object.fromEntries(Object.entries({root:rootAxes,season:seasonAxes,supply:supplyAxes}).map(([k,ks])=>[k,compareForceCompletionEnvelope(select(left,ks),select(right,ks),{completeHour})]));
 const propositions=[],evidence=[],rules=[],sides=[];
 const add=(side,kind,level,value=null,field=kind)=>{
  const p=id(pressureId,side,kind);propositions.push({id:p,subject:id(pressureId,side),kind,level});
  if(completeHour&&level==='observation'&&value!==null){const sign=value?'for':'against';evidence.push({id:id(p,sign),...lit(p,sign),refs:refs('pressure-comparison-axes',pressureId,field),applicability:'complete-only'});}
  return p;
 };
 const rule=(side,kind,conclusion,premises)=>rules.push({id:id(pressureId,side,kind),policyId:CONTEXTUAL_FORCE_VERSION,conclusion:lit(conclusion),premises:premises.map(p=>lit(p)),refs:refs('contextual-force-source-policy',source.chapter,kind),applicability:'complete-only'});
 for(const [side,a,b] of [['controller',left,right],['target',right,left]]){
  // Season-only advantage requires both seasonal axes to be known and
  // no opposing seasonal axis, exactly as in the existing partial order.
  const season=side==='controller'?'right-evidence-dominates':'left-evidence-dominates';
  const disadvantaged=add(side,'season-view-disadvantage','observation',views.season.relation==='unresolved'?null:views.season.relation===season,'season');
  const rooted=add(side,'substantial-root-observed','observation',a.anySubstantial,'anySubstantial');
  const advantages=rootAxes.map(k=>add(side,'relative-root-axis:'+k,'observation',direction(a[k],b[k]),k));
  const generation=add(side,'local-rooted-generation-observed','observation',a.localRootedGeneration,'localRootedGeneration');
  const generationContrast=add(side,'relative-rooted-generation','observation',direction(a.localRootedGeneration,b.localRootedGeneration),'localRootedGeneration');
  const rootCounter=add(side,'root-counterbasis-to-season-order','structural-hypothesis');
  const resourceCounter=add(side,'rooted-resource-counterbasis-to-season-order','structural-hypothesis');
  const challenge=add(side,'season-only-order-incomplete','structural-hypothesis');
  for(const [i,p] of advantages.entries())rule(side,'root-counterbasis:'+rootAxes[i],rootCounter,[disadvantaged,rooted,p]);
  rule(side,'resource-counterbasis',resourceCounter,[disadvantaged,rooted,generation,generationContrast]);
  rule(side,'challenge-from-root',challenge,[rootCounter]);
  rule(side,'challenge-from-resource',challenge,[resourceCounter]);
  sides.push({side,rootCounterPropositionId:rootCounter,resourceCounterPropositionId:resourceCounter,challengePropositionId:challenge});
 }
 const r=evaluateArguments({scope:completeHour?'complete':'partial',propositions,evidence,rules});
 if(!['diagnostic','partial'].includes(r.status))return empty();
 const js=new Map(r.judgments.map(j=>[j.id,j]));
 return {...base,status:r.status,views,sides:sides.map(s=>({...s,rootCounterState:js.get(s.rootCounterPropositionId).state,
  resourceCounterState:js.get(s.resourceCounterPropositionId).state,challengeState:js.get(s.challengePropositionId).state})),propositions,evidence,rules,judgments:r.judgments,ruleResults:r.ruleResults,
  limitations:['not-root-priority','no-actual-force-order','peer-not-independent-resource-proof','unknown-not-absence','not-physical-root-allocation']};
}
