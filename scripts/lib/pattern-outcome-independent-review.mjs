// Review protocol contains no engine predictions or prior expected labels.
// Self-declared independence is not externally verified independence.
const METHODS=['pattern','balance','climate','mediation','remedy','joint','undetermined'];
const ELEMENTS=['wood','fire','earth','metal','water'];
const FAMILIES=['officer','wealth','resource','food','killing','hurting-officer','blade','peer','out-of-scope','undetermined'];
const EFFECTS=['effective','ineffective','undetermined','disputed'];
const BINARY=['yes','no','undetermined','disputed'];
const str=x=>typeof x==='string'&&x.trim().length>0;
const sorted=xs=>[...new Set(xs)].sort();
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const setLabel=(x,allowed)=>x==='undetermined'||Array.isArray(x)&&x.length>0&&x.every(v=>allowed.includes(v))&&new Set(x).size===x.length;
export function buildIndependentPacket(mechanism,prospective,priority){
 const tasks=[];
 for(const c of mechanism.cases)for(const p of c.probes)tasks.push({
  id:'effect:'+c.id+':'+p.id,kind:'effect',pillars:[...c.pillars],source:c.source,
  relation:{from:p.from,to:p.to,kind:p.kind},question:p.kind==='combine'?'Does the source establish role removal for this pair, rather than only combination contact?':'Does the source establish effective directed action for these exact occurrences?'});
 for(const c of prospective.cases.filter(c=>c.eligible===true))tasks.push({
  id:'chart:'+c.id,kind:'chart',pillars:[...c.pillars],source:c.source,
  question:'Record source-supported family, formation, breakage, rescue, purity and clarity separately. Use undetermined or disputed rather than infer missing facts.'});
 for(const c of priority.cases)tasks.push({
  id:'selection:'+c.id,kind:'selection',pillars:[...c.pillars],source:priority.source,
  question:'Which method or joint objective is explicitly supported by the source, if any? Record elements for that objective, not every beneficial element.'});
 if(new Set(tasks.map(t=>t.id)).size!==tasks.length)throw Error('duplicate task identity');
 return {version:'independent-source-review-packet-v1',scope:'source-based-review-not-blind-holdout',tasks,
  instructions:{independence:'Do not consult engine output, expected labels, prior review labels or evaluation reports. Record any prior exposure separately.',
   evidence:'Cite edition, chapter, passage locator and rationale. Do not use historical life outcomes as proof of a force mechanism.',
   effect:{effect:EFFECTS},chart:{family:FAMILIES,formation:BINARY,breakage:BINARY,rescue:BINARY,purity:['pure','mixed','undetermined','disputed'],clarity:['clear','turbid','undetermined','disputed']},
   selection:{method:METHODS,elements:[...ELEMENTS,'undetermined']}}};
}
function normalize(task,label){
 if(!label||typeof label!=='object'||Array.isArray(label))return null;
 let out;
 if(task.kind==='effect'&&EFFECTS.includes(label.effect))out={effect:label.effect};
 if(task.kind==='chart'&&FAMILIES.includes(label.family)&&['formation','breakage','rescue'].every(k=>BINARY.includes(label[k]))&&
  ['pure','mixed','undetermined','disputed'].includes(label.purity)&&['clear','turbid','undetermined','disputed'].includes(label.clarity))
  out={family:label.family,formation:label.formation,breakage:label.breakage,rescue:label.rescue,purity:label.purity,clarity:label.clarity};
 if(task.kind==='selection'&&METHODS.includes(label.method)&&setLabel(label.elements,ELEMENTS)&&
  (label.method!=='undetermined'||label.elements==='undetermined'))
  out={method:label.method,elements:Array.isArray(label.elements)?sorted(label.elements):label.elements};
 return out&&Object.keys(label).length===Object.keys(out).length?out:null;
}
export function reviewTemplate(packet,digest){
 return {packetVersion:packet.version,packetDigest:digest,reviewerId:'',independentOfEngineOutputs:null,priorExposure:'unknown',
  responses:packet.tasks.map(t=>({taskId:t.id,sourceLocator:'',rationale:'',label:null}))};
}
export function validateReview(packet,digest,batch){
 const errors=[],labels=new Map();
 if(!batch||batch.packetVersion!==packet.version||batch.packetDigest!==digest||!str(batch.reviewerId)||batch.independentOfEngineOutputs!==true||
  !['none-declared','prior-source-exposure','unknown'].includes(batch.priorExposure)||!Array.isArray(batch.responses))
  return {errors:['batch-contract'],labels};
 const tasks=new Map(packet.tasks.map(t=>[t.id,t]));
 for(const r of batch.responses){
  const task=tasks.get(r?.taskId),label=task&&normalize(task,r.label);
  if(!task||labels.has(r.taskId)||!str(r.sourceLocator)||!str(r.rationale)||!label){errors.push('response:'+String(r?.taskId));continue;}
  labels.set(r.taskId,label);
 }
 for(const t of packet.tasks)if(!labels.has(t.id))errors.push('missing:'+t.id);
 return {errors,labels};
}
export function summarizeIndependentReviews(packet,digest,batches){
 const base={expectedTasks:packet.tasks.length,verifiedIndependentGold:0,independenceExternallyVerified:false,selectionAuthority:false};
 if(!Array.isArray(batches)||batches.length<2)return {...base,status:'pending',rows:[],errors:[]};
 const ids=batches.map(b=>b?.reviewerId?.trim().toLowerCase());
 const validated=batches.map(b=>validateReview(packet,digest,b));
 const errors=validated.flatMap((r,i)=>r.errors.map(e=>({reviewer:i,error:e})));
 if(new Set(ids).size!==ids.length)errors.push({error:'duplicate-reviewer'});
 if(errors.length)return {...base,status:'invalid-review',rows:[],errors};
 const rows=packet.tasks.map(t=>{
  const labels=validated.map(v=>v.labels.get(t.id));
  const fields=Object.keys(labels[0]).map(field=>{
   const values=labels.map(l=>l[field]),agreed=values.every(v=>eq(v,values[0]));
   const determinate=agreed&&values[0]!=='undetermined'&&values[0]!=='disputed';
   return {field,status:!agreed?'disagreement':determinate?'determinate-agreement-pending-independence':'unresolved-agreement',values};
  });
  return {taskId:t.id,kind:t.kind,fields,status:fields.some(f=>f.status==='disagreement')?'disagreement':fields.every(f=>f.status==='determinate-agreement-pending-independence')?'agreement-pending-external-check':'partially-unresolved'};
 });
 const counts={};for(const r of rows)counts[r.status]=(counts[r.status]??0)+1;
 return {...base,status:'reviewed-pending-external-check',counts,rows,errors:[]};
}
