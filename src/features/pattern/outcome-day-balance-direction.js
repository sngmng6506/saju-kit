import {evaluateArguments} from './outcome-argumentation.js';
const VERSION='p1-4a-day-balance-direction-v1';
// Xu commentary, 扶抑: 日元強者抑之，日元弱者扶之.
// This is a directional ordinary-balance objective, NOT a proof of
// effective force, empirical outcome, excess, or the final useful element.
const SOURCE='https://libokang.com/zh-hant/classics/bazi/%E5%AD%90%E5%B9%B3%E7%9C%9F%E8%A9%AE%E8%A9%95%E8%A8%BB/';
const strongGrounds=['central-root-capacity','local-resource-and-robust-support','bounded-route-support'];
const weakGround='low-root-capacity-and-dominant-pressure';
const key=(...x)=>JSON.stringify(x);
const ref=(owner,id,field)=>({owner,id,field});
const lit=(propositionId,sign='for')=>({propositionId,sign});
const index=(xs,f)=>Array.isArray(xs)&&xs.every(x=>x&&typeof x==='object')&&new Set(xs.map(f)).size===xs.length?new Map(xs.map(x=>[f(x),x])):null;
export function resolveDayDirection(strength,complete){
 const base={policy:'strength-decision-v1',scope:'day-master-directional-hypothesis',direction:null,state:'unresolved',refs:[]};
 if(!complete)return {...base,reason:'partial'};
 if(!strength||strength.policy!=='strength-decision-v1'||strength.confirmed!==false||!Array.isArray(strength.grounds)||!Array.isArray(strength.conflicts))return {...base,reason:'strength-contract'};
 if(strength.status!=='hypothesis'||strength.conflicts.length)return {...base,reason:'strength-unresolved-or-conflicting'};
 if(strength.grounds.some(g=>![...strongGrounds,weakGround].includes(g))||new Set(strength.grounds).size!==strength.grounds.length)return {...base,reason:'unknown-or-duplicate-ground'};
 const strong=strength.grounds.some(g=>strongGrounds.includes(g)),weak=strength.grounds.includes(weakGround);
 if(strong===weak||strength.direction!==(strong?'strong':'weak'))return {...base,reason:'direction-ground-mismatch'};
 return {...base,direction:strength.direction,state:'supported',reason:null,refs:['direction','grounds','conflicts'].map(f=>ref('regulationStrength','day',f))};
}
// Only the immediate direction of a day-involving relation is considered.
// Outgoing control is left open: wealth consumption is not direct 泄.
function role(e,day){
 if(e.kind==='generate'&&e.to===day)return {id:'support',desired:'weak'};
 if(e.kind==='generate'&&e.from===day)return {id:'release',desired:'strong'};
 if(e.kind==='control'&&e.to===day)return {id:'restraint',desired:'strong'};
 return null;
}
export function reviewDayBalanceDirection(prior,argument,joint,strength){
 const complete=prior?.completeHour,status=complete?'diagnostic':'partial',base={version:VERSION,completeHour:complete,selectionAuthority:false,effective:null,source:SOURCE};
 const empty=reason=>({...base,status:'invalid-evidence',reason,actions:[],direction:null,judgments:[],rules:[],evidence:[],propositions:[]});
 if(typeof complete!=='boolean'||[argument,joint].some(x=>!x||x.status!==status||x.completeHour!==complete||x.selectionAuthority!==false||x.effective!==null))return empty('upstream');
 const actors=index(prior.stemForce?.occurrences,a=>a.id),actions=index(argument.actions,a=>a.edgeId),judgments=index(argument.judgments,j=>j.id),jointRows=index(joint.actions,a=>a.edgeId);
 if(!actors||!actions||!judgments||!jointRows||actions.size!==jointRows.size)return empty('identity');
 const days=[...actors.values()].filter(a=>a.layer==='visible'&&a.dayReference===true);
 if(days.length!==1||days[0].id!=='visible:day')return empty('day-identity');
 const day=days[0].id,direction=resolveDayDirection(strength,complete);
 const propositions=[],evidence=[],rules=[],rows=[];
 const add=(id,kind,subject,level)=>{propositions.push({id,kind,subject,level});return id;};
 const fact=(id,sign,refs)=>evidence.push({id:key(id,sign),...lit(id,sign),refs,applicability:'complete-only'});
 const rule=(id,target,sign,premises)=>rules.push({id,policyId:VERSION,conclusion:lit(target,sign),premises,refs:[ref('classical-direction-policy',VERSION,'ordinary-balance')],applicability:'complete-only'});
 const strong=add(key(day,'strong-direction'),'day-strength-direction-strong',day,'observation'),weak=add(key(day,'weak-direction'),'day-strength-direction-weak',day,'observation');
 if(direction.direction)fact(direction.direction==='strong'?strong:weak,'for',direction.refs);
 for(const e of actions.values()){
  const j=judgments.get(e.effectPropositionId),s=judgments.get(e.structuralPropositionId),q=jointRows.get(e.edgeId);
  if(!j||j.kind!=='actual-action-effective'||j.level!=='effect-hypothesis'||j.subject!==e.edgeId||j.state!=='unresolved'||j.support?.rank!==null||j.opposition?.rank!==null||
   !s||s.subject!==e.edgeId||s.level!=='structural-hypothesis'||s.kind!==(e.kind==='generate'?'existing-generation-screen-met':'stable-source-profile-dominance')||!['supported','opposed','conflicting','unresolved'].includes(s.state)||
   !q||q.from!==e.from||q.to!==e.to||q.kind!==e.kind||q.effectPropositionId!==j.id||q.actualEffectState!=='unresolved'||
   actors.get(e.from)?.layer!=='visible'||actors.get(e.to)?.layer!=='visible'||!['generate','control'].includes(e.kind))return empty('action-binding');
  const r=role(e,day);if(!r)continue;
  const subject=e.edgeId,d=add(key(subject,'direction-fit'),'ordinary-balance-direction-fit',subject,'structural-hypothesis');
  const screen=add(key(subject,'screen'),'existing-structural-screen-supported',subject,'observation');
  const candidate=add(key(subject,'candidate'),'direction-aligned-structural-candidate',subject,'structural-hypothesis');
  const relation=add(key(subject,'relation'),'day-involving-literal-action',subject,'observation');
  fact(relation,'for',[ref('argumentReview',subject,'kind')]);
  if(s.state==='supported')fact(screen,'for',[ref('argumentReview',s.id,'state')]);
  // Contradictory or failed screens do not establish actual inefficacy.
  if(s.state==='opposed'||s.state==='conflicting')fact(screen,'against',[ref('argumentReview',s.id,'state')]);
  const wanted=r.desired==='strong'?strong:weak,other=r.desired==='strong'?weak:strong;
  rule(key(subject,'fit'),d,'for',[lit(relation),lit(wanted)]);
  rule(key(subject,'misfit'),d,'against',[lit(relation),lit(other)]);
  rule(key(subject,'candidate'),candidate,'for',[lit(d),lit(screen)]);
  // Negative direction-fit is not negative efficacy. No candidate rebuttal
  // or effect rule is inferred from failed support.
  rows.push({edgeId:subject,role:r.id,desiredDirection:r.desired,directionPropositionId:d,candidatePropositionId:candidate,
   originalEffectPropositionId:j.id,structuralPropositionId:s.id,actualEffectState:'unresolved',effective:null});
 }
 const result=evaluateArguments({scope:complete?'complete':'partial',propositions,evidence,rules});
 if(result.status!==status)return empty('evaluation');
 const byId=index(result.judgments,j=>j.id);
 return {...base,status,reason:null,direction,actions:rows.map(r=>({...r,directionFit:byId.get(r.directionPropositionId).state,
  candidateState:byId.get(r.candidatePropositionId).state})),judgments:result.judgments,ruleResults:result.ruleResults,propositions,evidence,rules,
  limitations:['ordinary-balance-objective-only','day-direction-not-element-predicate','structural-candidate-not-effective-force','no-climate-or-pattern-selection','outgoing-control-unassessed','no-effect-rule-promotion']};
}
