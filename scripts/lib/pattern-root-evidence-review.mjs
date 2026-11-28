import {buildClaimPacket,adjudicateClaims} from './pattern-outcome-claim-evaluation.mjs';
import {normalizeExposurePillars} from './pattern-outcome-exposure.mjs';
import {auditRootSeedSensitivity} from './pattern-root-seed-sensitivity.mjs';
import {compileReplenishmentNetwork} from '../../src/features/pattern/outcome-replenishment-network.js';
import {evaluateArguments} from '../../src/features/pattern/outcome-argumentation.js';
const key=(...xs)=>JSON.stringify(xs),same=(a,b)=>key(a)===key(b);
const retain=s=>key('slot-retained',s),access=(n,s)=>key('root-access',n,s),basis=n=>key('replenishment-basis',n);
const base={selectionAuthority:false,actualStrengthState:'unresolved',actualRootState:'unresolved',independentGoldCases:0,independenceExternallyVerified:false};
function prepare(intake,buildInput){
 if(!Array.isArray(intake?.candidates)||typeof buildInput!=='function')throw Error('intake-contract');
 const tasks=[],contexts=new Map();
 for(const c of intake.candidates){
  const n=normalizeExposurePillars(c.pillars);
  if(!n?.complete||!n.sexagenary||contexts.has(c.id))throw Error('chart-contract');
  const input=buildInput(n.pillars);
  const audit=auditRootSeedSensitivity(input);
  if(audit.status!=='diagnostic')throw Error('root-inventory:'+audit.reason);
  contexts.set(c.id,{input,audit});
  const add=(predicate,fields)=>{const target={kind:'root-condition',predicate,...fields};tasks.push({id:key(c.id,predicate,...Object.values(fields)),chartId:c.id,target});};
  for(const s of input.root.slots){
   add('slot-retained',{slotId:s.id});
   for(const clashId of s.clashIds){
    add('clash-impairment',{slotId:s.id,clashId});
    const clash=input.root.clashes.find(x=>x.clashId===clashId);
    for(const f of clash.alternatives)add('slot-preservation-by-relief',{slotId:s.id,clashId,formationId:f.formationId});
   }
   for(const formationId of s.competingTargetFormationIds)add('formation-impairment',{slotId:s.id,formationId});
  }
  for(const clash of input.root.clashes)for(const f of clash.alternatives)add('clash-relief',{clashId:clash.clashId,formationId:f.formationId});
  for(const s of audit.seeds)add('root-access',{slotId:s.slotId,nodeId:s.nodeId});
 }
 const p=buildClaimPacket(intake,{version:'p1-5d-claim-draft-v1',tasks});
 return {packet:{...p,scope:'root-source-review-not-independent-gold',instructions:{...p.instructions,rootPolicy:'Slot retention and conditional actor access are distinct. Review local impairment and relief separately from final slot retention. Do not infer net retention from a single contact, or negative evidence from silence. The candidate identities are literal inventory, not predicted effects.'}},contexts};
}
export function buildRootEvidencePacket(intake,buildInput){return prepare(intake,buildInput).packet;}
// Monotone positive network: under fixed signed observations, the
// minimum and maximum assignments bound every completion exactly.
// The reviewed observations are research restrictions, not facts added
// to the baseline. A local contact claim is never a net restriction.
export function replayRootRestrictions({completeHour,nodes,links,targets,seeds,restrictions=[]}={}){
 const empty=(status,reason)=>({...base,status,reason,rows:[]});
 try{
  const c=compileReplenishmentNetwork({completeHour,nodes,links,targets});
  if(!['diagnostic','partial'].includes(c.status)||!Array.isArray(seeds)||!Array.isArray(restrictions))return empty('invalid-evidence','inventory');
  const ids=new Set(nodes.map(n=>n.id)),seen=new Set(),roles=new Map();
  for(const s of seeds){
   if(!s||!ids.has(s.nodeId)||typeof s.slotId!=='string'||!s.slotId||!['principal','middle','residual'].includes(s.role)||seen.has(access(s.nodeId,s.slotId)))return empty('invalid-evidence','seed-contract');
   if(roles.has(s.slotId)&&roles.get(s.slotId)!==s.role)return empty('invalid-evidence','physical-slot-conflict');
   roles.set(s.slotId,s.role);seen.add(access(s.nodeId,s.slotId));
  }
  const sorted=a=>[...a].sort();
  if(!same(sorted(seeds.filter(s=>s.role!=='residual').map(s=>access(s.nodeId,s.slotId))),sorted(nodes.flatMap(n=>n.rootIds.map(r=>access(n.id,r))))))return empty('invalid-evidence','baseline-seed-coverage');
  const expanded=compileReplenishmentNetwork({completeHour,nodes:nodes.map(n=>({...n,rootIds:seeds.filter(s=>s.nodeId===n.id).map(s=>s.slotId)})),links,targets});
  if(expanded.status!==c.status)return empty('invalid-evidence','expanded-network');
  const allowed=new Set(seeds.flatMap(s=>[retain(s.slotId),access(s.nodeId,s.slotId)])),fixed=new Map();
  for(const r of restrictions){
   if(!r||!allowed.has(r.id)||typeof r.value!=='boolean'||fixed.has(r.id))return empty('invalid-evidence','restriction-contract');
   fixed.set(r.id,r.value);
  }
  if(!completeHour)return empty('partial','missing-hour');
  const run=(network,mode,apply)=>{
   const packet=network.packet,obs=packet.propositions.filter(p=>p.level==='observation').map(p=>p.id);
   const truth=new Set(obs.filter(id=>apply&&fixed.has(id)?fixed.get(id):mode==='max'));
   const evidence=obs.map((id,i)=>({id:key('root-review-scenario',i),propositionId:id,sign:truth.has(id)?'for':'against',refs:[{owner:'root-review-scenario',id,field:'hypothetical-only'}],applicability:'complete-only'}));
   const q=evaluateArguments({...packet,evidence});
   if(q.status!=='diagnostic')throw Error('scenario-replay');
   const result=new Map(q.judgments.map(j=>[j.id,j.state==='supported']));
   const eligible=seeds.filter(s=>truth.has(retain(s.slotId))&&truth.has(access(s.nodeId,s.slotId)));
   const reached=new Set(eligible.map(s=>s.nodeId));let change=true;
   while(change){change=false;for(const l of links)if(truth.has(key('supply-operation',l.id))&&reached.has(l.from)&&!reached.has(l.to)){reached.add(l.to);change=true;}}
   if(nodes.some(n=>result.get(basis(n.id))!==reached.has(n.id)))throw Error('graph-parity');
   return {truth,reached,eligible};
  };
  const rows=targets.map(targetId=>({targetId,policies:[],actualRootState:'unresolved'}));
  for(const [policy,network] of [['substantial-baseline',c],['all-constituents',expanded]]){
   const originalMin=run(network,'min',false),originalMax=run(network,'max',false),reviewMin=run(network,'min',true),reviewMax=run(network,'max',true);
   for(const r of rows){
    const states=(lo,hi)=>({possible:hi.reached.has(r.targetId),necessary:lo.reached.has(r.targetId),directPossible:hi.eligible.some(s=>s.nodeId===r.targetId),directNecessary:lo.eligible.some(s=>s.nodeId===r.targetId)});
    const before=states(originalMin,originalMax),after=states(reviewMin,reviewMax);
    if(after.possible&&!before.possible||before.necessary&&!after.necessary||after.necessary&&!after.possible||after.directPossible&&!before.directPossible||after.directNecessary&&!after.directPossible)throw Error('restriction-parity');
    r.policies.push({policy,before,after});
   }
  }
  return {...empty('diagnostic',null),rows,restrictions:[...restrictions],limitations:['signed-review-restrictions-not-established-facts','local-network-only','necessity-within-completions-not-actual-strength']};
 }catch(e){return empty('invalid-evidence',String(e?.message??e));}
}
export function reviewAndReplayRoots(intake,digest,batches,buildInput){
 try{
  const {packet,contexts}=prepare(intake,buildInput);
  const review=adjudicateClaims(packet,digest,batches);
  if(review.status!=='reviewed-pending-external-check')return {...base,status:review.status,review,rows:[]};
  const byTask=new Map(review.rows.map(r=>[r.taskId,r])),rows=[];
  for(const chart of packet.charts){
   const {input,audit}=contexts.get(chart.id),restrictions=[],contactReviews=[];
   for(const task of packet.tasks.filter(t=>t.chartId===chart.id)){
    const r=byTask.get(task.id),t=task.target;
    if(r.agreedLabel===null)continue;
    const value=r.agreedLabel==='yes';
    if(t.predicate==='slot-retained')restrictions.push({id:retain(t.slotId),value});
    else if(t.predicate==='root-access')restrictions.push({id:access(t.nodeId,t.slotId),value});
    else contactReviews.push({target:t,value,status:'local-claim-not-net-retention'});
   }
   const replay=replayRootRestrictions({...input,seeds:audit.seeds,restrictions});
   rows.push({chartId:chart.id,contactReviews,...replay});
  }
  return {...base,status:rows.some(r=>r.status!=='diagnostic')?'invalid-evidence':'diagnostic-unverified-review',review,rows,actualAccuracy:null,
   summary:{charts:rows.length,netRestrictions:rows.reduce((n,r)=>n+(r.restrictions?.length??0),0),contactClaims:rows.reduce((n,r)=>n+r.contactReviews.length,0),narrowedTargets:rows.flatMap(r=>r.rows).filter(r=>r.policies.some(p=>!same(p.before,p.after))).length}};
 }catch(e){return {...base,status:'invalid-evidence',reason:String(e?.message??e),rows:[]};}
}

export function selectRootReviewIntake(intake,selectors=[]){
 if(intake?.version!=='p1-5b-intake-v1'||!Array.isArray(intake.candidates)||!Array.isArray(selectors)||selectors.some(s=>typeof s!=='string'||!s.trim())||new Set(selectors).size!==selectors.length)throw Error('selector-contract');
 if(!selectors.length)return intake;
 const selected=new Set();
 for(const id of selectors){
  const exact=intake.candidates.filter(c=>c.id===id);
  const matches=exact.length?exact:intake.candidates.filter(c=>{try{const x=JSON.parse(c.id);return Array.isArray(x)&&x.length===2&&x[1]===id;}catch{return false;}});
  if(matches.length!==1||selected.has(matches[0].id))throw Error('chart-selector:'+id);
  selected.add(matches[0].id);
 }
 return {...intake,candidates:intake.candidates.filter(c=>selected.has(c.id))};
}
