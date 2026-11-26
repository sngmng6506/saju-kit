import {elementRelation} from '../../src/core/elements.js';
import {evaluateArguments} from '../../src/features/pattern/outcome-argumentation.js';
import {positiveProofFrontier} from '../../src/features/pattern/outcome-positive-frontier.js';
import {strengthGuardIds} from '../../src/features/pattern/outcome-strength-guard-contract.js';
const key=(...xs)=>JSON.stringify(xs),same=(a,b)=>key(a)===key(b);
const lit=propositionId=>({propositionId,sign:'for'});
const elements=['wood','fire','earth','metal','water'],positions=['year','month','day','hour'];
const source=(chapter,url,reading)=>({chapter,url,reading});
// Role templates are structural projections of source contexts, not
// sufficient conditions. Every comparative predicate is still open.
const entries=[
 {id:'control-resource-mediation',guard:'control-exceeds-support',roles:['controller','resource'],legs:[['controller','day','control'],['controller','resource','generate'],['resource','day','generate']],source:source('子平真詮評註・論正官','https://ncc.com.tw/fate/paleo/bg/bg_033.htm','A heavy officer with a weak body can be mediated by resource.'),premises:['officer-heavy','body-weak','resource-mediated'],blockers:['prior-strength-verdict','actual-mediation','net-burden-comparison']},
 {id:'output-resource-restraint',guard:'drain-exceeds-support',roles:['output','resource'],legs:[['day','output','generate'],['resource','output','control'],['resource','day','generate']],source:source('子平真詮評註・論傷官','https://dao.time.actor/ziping-zhenquan-pingzhu/juan-3','Resource restrains output and supports the body in the weak-body, strong-output context; excess resource can be adverse.'),premises:['output-strong','body-weak','resource-effective'],blockers:['prior-strength-verdict','actual-restraint','net-drain-comparison']},
 {id:'wealth-resource-interference',guard:'wealth-demand-exceeds-support',roles:['wealth','resource'],legs:[['day','wealth','control'],['wealth','resource','control'],['resource','day','generate']],source:source('子平真詮・論印','https://www.donglishuzhai.net/chapter/3748.html','Light resource with heavy wealth and no peer rescue is an adverse resource-pattern condition; the inverse context can use wealth.'),premises:['resource-light','wealth-heavy','peer-rescue-absent'],blockers:['relative-role-magnitude','actual-resource-loss','pattern-context-not-body-burden']},
 {id:'peer-protects-resource',guard:'wealth-demand-exceeds-support',roles:['wealth','resource','peer'],legs:[['day','wealth','control'],['wealth','resource','control'],['resource','day','generate'],['peer','wealth','control']],source:source('子平真詮評註・論用神成敗救應','https://ncc.com.tw/fate/paleo/bg/bg_033.htm','Where wealth harms resource, peers can restrain wealth and protect resource.'),premises:['resource-injured','wealth-excessive','peer-rescue-effective'],blockers:['actual-resource-loss','actual-peer-rescue','net-burden-comparison']},
 {id:'output-wealth-chain',guard:'drain-exceeds-support',roles:['output','wealth'],legs:[['day','output','generate'],['output','wealth','generate'],['day','wealth','control']],source:source('子平真詮評註・論財','https://ncc.com.tw/fate/paleo/bg/bg_034.htm','Output-to-wealth can be useful in a strong body context; wealth-heavy weak-body context can instead favor peers.'),premises:['body-strong-or-weak','wealth-relative-magnitude','output-effective'],blockers:['prior-strength-verdict','actual-output-and-wealth-action','net-drain-comparison']}
];
export const burdenSourceConditions=()=>JSON.parse(JSON.stringify(entries));
const offset={day:0,output:1,wealth:2,controller:3,resource:4,peer:0};
export function auditBurdenSourceConditions({completeHour,nodes,targets,burden}={}){
 const base={version:'p3-burden-source-conditions-v1',selectionAuthority:false,effective:null,actualStrengthState:'unresolved',actualMagnitudeComparison:'unresolved'};
 const empty=reason=>({...base,status:'invalid-evidence',reason,conditions:[],summary:null});
 if(typeof completeHour!=='boolean'||!Array.isArray(nodes)||!Array.isArray(targets)||burden?.status!==(completeHour?'diagnostic':'partial')||burden.completeHour!==completeHour||burden.selectionAuthority!==false||burden.effective!==null||burden.actualMagnitudeComparison!=='unresolved')return empty('upstream');
 try{
  const ns=new Map(nodes.map(n=>[n.id,n])),ts=new Set(targets),day=ns.get('day:stem');
  if(nodes.length>16||targets.length>4||ns.size!==nodes.length||ts.size!==targets.length||!day||day.position!=='day'||!ts.has(day.id)||nodes.some(n=>!elements.includes(n.element)||!positions.includes(n.position))||targets.some(t=>!ns.has(t)||t!==ns.get(t).position+':stem'))return empty('node-inventory');
  const packet=burden.packet,replay=evaluateArguments(packet);
  if(replay.status!==burden.status||!same(replay.judgments,burden.judgments)||!same(replay.ruleResults,burden.ruleResults)||packet.evidence.length)return empty('proof-replay');
  const expected=[];
  for(const a of nodes)for(const b of nodes){
   if(a.id===b.id||!ts.has(a.id)&&!ts.has(b.id)||Math.abs(positions.indexOf(a.position)-positions.indexOf(b.position))>1)continue;
   const r=elementRelation(a.element,b.element);
   if(['generate','control'].includes(r.type)&&r.direction==='left-to-right')expected.push(key(r.type,a.id,b.id));
  }
  const actions=new Map(burden.actionRows.map(a=>[a.id,a]));
  if(actions.size!==burden.actionRows.length||!same([...actions.keys()].sort(),expected.sort()))return empty('action-coverage');
  const props=new Map(packet.propositions.map(p=>[p.id,p])),ruleMap=new Map(packet.rules.map(r=>[r.id,r]));
  for(const a of actions.values()){
   const p=props.get(a.propositionId),r=ruleMap.get(key('action-rule',a.id));
   if(a.id!==key(a.kind,a.from,a.to)||a.actualOperationState!=='unresolved'||a.propositionId!==key('root-seeded-action',a.id)||p?.level!=='structural-hypothesis'||
    !r||!same(r.conclusion,lit(a.propositionId))||!same(r.premises,[lit(key('replenishment-basis',a.from)),lit(a.operationVariableId)])||props.get(a.operationVariableId)?.level!=='observation')return empty('action-proof-binding');
  }
  if(!completeHour)return {...base,status:'partial',reason:null,conditions:[],summary:{templates:entries.length,actualEffectsConfirmed:0}};
  const propositions=[...packet.propositions],rules=[...packet.rules],conditions=[];
  const dayIndex=elements.indexOf(day.element);
  for(const c of entries){
   if(!strengthGuardIds.includes(c.guard))return empty('guard-registry');
   const rows=[];
   const visit=(i,bindings)=>{
    if(i<c.roles.length){
     const role=c.roles[i],element=elements[(dayIndex+offset[role])%5];
     for(const n of nodes.filter(n=>n.element===element&&!Object.values(bindings).includes(n.id)))visit(i+1,{...bindings,[role]:n.id});
     return;
    }
    const legs=c.legs.map(([from,to,kind])=>actions.get(key(kind,bindings[from],bindings[to])));
    if(legs.some(a=>!a))return;
    const id=key('source-context-candidate',c.id,...c.roles.map(r=>bindings[r]));
    propositions.push({id,kind:'joint-root-seeded-source-context-candidate',subject:day.id,level:'structural-hypothesis'});
    rules.push({id:key('source-context-rule',id),policyId:base.version,conclusion:lit(id),premises:[...new Set(legs.map(a=>a.propositionId))].map(lit),refs:[{owner:'source-condition',id:c.id,field:c.source.url}],applicability:'complete-only'});
    rows.push({id,bindings,actionIds:legs.map(a=>a.id),operationVariableIds:legs.map(a=>a.operationVariableId)});
   };
   visit(0,{day:day.id});
   conditions.push({...c,rows,guardEvidenceState:'unresolved',actualEffectState:'unresolved',authority:'review-obligation-only'});
  }
  const combined={...packet,propositions,rules},frontier=positiveProofFrontier(combined);
  if(!['diagnostic','unavailable'].includes(frontier.status))return empty('frontier-contract');
  const byId=new Map(frontier.frontiers.map(f=>[f.id,f.terms]));
  for(const c of conditions)for(const r of c.rows){
   const terms=byId.get(r.id);
   if(frontier.status==='diagnostic'&&!Array.isArray(terms))return empty('frontier-coverage');
   r.jointRootedBasisPossible=frontier.status==='diagnostic'?terms.length>0:null;
   r.witness=frontier.status==='diagnostic'?(terms[0]??null):null;
   if(r.witness!==null){
    const yes=new Set(r.witness);
    const evidence=propositions.filter(p=>p.level==='observation').map((p,i)=>({id:key('source-context-witness',i),propositionId:p.id,sign:yes.has(p.id)?'for':'against',refs:[{owner:'source-context-witness',id:p.id,field:'hypothetical'}],applicability:'complete-only'}));
    const result=evaluateArguments({...combined,evidence}),j=new Map(result.judgments.map(j=>[j.id,j.state]));
    if(result.status!=='diagnostic'||j.get(r.id)!=='supported'||r.actionIds.some(a=>j.get(actions.get(a).propositionId)!=='supported'))return empty('witness-replay');
   }
  }
  return {...base,status:'diagnostic',reason:null,conditions,summary:{templates:entries.length,analysisStatus:frontier.status,literalContexts:conditions.reduce((n,c)=>n+c.rows.length,0),rootedContexts:frontier.status==='diagnostic'?conditions.reduce((n,c)=>n+c.rows.filter(r=>r.jointRootedBasisPossible).length,0):null,actualEffectsConfirmed:0},
   limitations:['local-visible-incident-action-scope','source-role-context-not-guard-proof','rooted-basis-not-operation','absence-not-refutation','no-strength-authority']};
 }catch(e){return empty(String(e?.message??e));}
}
