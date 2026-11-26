import {evaluateArguments} from './outcome-argumentation.js';
// Exact minimal positive assumption sets for an observation-only,
// positive Horn packet. This is not a solver for signed/defeasible rules.
const key=(...xs)=>JSON.stringify(xs);
const subset=(a,b)=>a.every(x=>b.includes(x));
const canon=xs=>[...new Set(xs)].sort();
const MAX_WORK=300000,MAX_TERMS=8192;
export function positiveProofFrontier(packet){
 const empty=(status,reason)=>({status,reason,frontiers:[],selectionAuthority:false,effective:null});
 if(!packet||!['complete','partial'].includes(packet.scope)||![packet.propositions,packet.evidence,packet.rules].every(Array.isArray)||packet.evidence.length)return empty('invalid-evidence','packet');
 // The signed engine owns identity, provenance, rule and resource
 // validation. The symbolic fragment may narrow that contract, never
 // accept a graph the canonical engine rejects.
 const baseline=evaluateArguments(packet);
 if(!['diagnostic','partial'].includes(baseline.status))return empty(baseline.status,baseline.reason);
 const props=new Map(packet.propositions.map(p=>[p.id,p]));
 const valid=x=>typeof x==='string'&&x.length>0;
 if(props.size!==packet.propositions.length||packet.propositions.some(p=>!valid(p.id)||!['observation','structural-hypothesis'].includes(p.level))||
  packet.rules.some(r=>r.applicability!=='complete-only'||r.conclusion?.sign!=='for'||props.get(r.conclusion.propositionId)?.level!=='structural-hypothesis'||!Array.isArray(r.premises)||!r.premises.length||r.premises.some(p=>p.sign!=='for'||!props.has(p.propositionId))||(r.undercutWhen??[]).length))return empty('invalid-evidence','positive-contract');
 if(packet.scope==='partial')return empty('partial','missing-hour');
 const terms=new Map(packet.propositions.map(p=>[p.id,p.level==='observation'?[[p.id]]:[]]));
 let work=0,total=packet.propositions.filter(p=>p.level==='observation').length;
 const tick=()=>{if(++work>MAX_WORK)throw Error('work-budget');};
 const insert=(xs,t)=>{
  for(const x of xs){tick();if(subset(x,t))return false;}
  for(let i=xs.length-1;i>=0;i--){tick();if(subset(t,xs[i]))xs.splice(i,1);}
  xs.push(t);return true;
 };
 try{
  if(total>MAX_TERMS)throw Error('term-budget');
  let changed=true;
  while(changed){
   changed=false;
   for(const r of packet.rules){
    tick();let products=[[]];
    for(const p of r.premises){
     const next=[];
     for(const a of products)for(const b of terms.get(p.propositionId)){
      tick();insert(next,canon([...a,...b]));if(next.length>MAX_TERMS)throw Error('term-budget');
     }
     products=next;if(!products.length)break;
    }
    const out=terms.get(r.conclusion.propositionId);
    for(const t of products){const before=out.length;if(insert(out,t)){changed=true;total+=out.length-before;if(total>MAX_TERMS)throw Error('term-budget');}}
   }
  }
  const sort=(a,b)=>a.length-b.length||(key(a)<key(b)?-1:key(a)>key(b)?1:0);
  return {status:'diagnostic',reason:null,frontiers:[...terms].filter(([id])=>props.get(id).level==='structural-hypothesis').map(([id,xs])=>({id,terms:xs.sort(sort)})),selectionAuthority:false,effective:null};
 }catch(e){return empty('unavailable',e.message);}
}
// A term is a minimal true-set; all absent variables are false in a witness.
// Implication A=>B iff each minimal term of A contains a term of B.
// Empty antecedents are reported separately (no vacuous comparative claim).
export function comparePositiveFrontiers(a,b){
 let work=0;
 const counter=(xs,ys)=>{for(const x of xs){let found=false;for(const y of ys){if(++work>MAX_WORK)throw Error('comparison-budget');if(subset(y,x)){found=true;break;}}if(!found)return x;}return null;};
 try{
  const leftOnly=counter(a,b),rightOnly=counter(b,a);
  return {status:'diagnostic',leftPossible:a.length>0,rightPossible:b.length>0,
   leftImpliesRight:a.length?leftOnly===null:null,rightImpliesLeft:b.length?rightOnly===null:null,
   witnesses:{leftOnly,rightOnly,both:a.length&&b.length?canon([...a[0],...b[0]]):null,neither:!a.some(t=>!t.length)&&!b.some(t=>!t.length)?[]:null},
   actualMagnitudeComparison:'unresolved'};
 }catch(e){return {status:'unavailable',reason:e.message,actualMagnitudeComparison:'unresolved'};}
}
