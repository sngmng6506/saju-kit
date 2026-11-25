const fields=['formation','breakage','rescue','assistant','purity','clarity'];
const binary=new Set(['yes','no','undetermined']);
const classes=new Set(['pure','mixed','undetermined']);
const clarity=new Set(['clear','turbid','undetermined']);
const stems=new Set('갑을병정무기경신임계'),branches=new Set('자축인묘진사오미신유술해');
const pos=['year','month','day','hour'];
const cmp=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const sorted=xs=>[...new Set(xs)].sort();
function normalize(label){
 if(!label||!fields.every(f=>Object.hasOwn(label,f))||!['formation','breakage','rescue'].every(f=>binary.has(label[f]))||
 !classes.has(label.purity)||!clarity.has(label.clarity))return null;
 const a=label.assistant;
 if(a!=='undetermined'&&(!Array.isArray(a)||a.some(id=>typeof id!=='string'||!id)))return null;
 return {formation:label.formation,breakage:label.breakage,rescue:label.rescue,assistant:Array.isArray(a)?sorted(a):a,purity:label.purity,clarity:label.clarity};
}
// Full-chart gold only after two different source-based reviewers agree.
// Reviewer identities and independence must be externally verified; a string
// in the file alone cannot establish independence or authorize runtime.
export function adjudicateChart(row){
 if(row.eligible!==true)return {status:'excluded',label:null};
 const rs=row.adjudication?.reviews??[];
 if(rs.length<2)return {status:'pending',label:null};
 const valid=rs.every(r=>typeof r.reviewerId==='string'&&r.reviewerId.trim()&&r.independentOfEngineOutputs===true&&
  typeof r.sourceLocator==='string'&&r.sourceLocator.trim()&&typeof r.rationale==='string'&&r.rationale.trim()&&normalize(r.label));
 if(!valid||new Set(rs.map(r=>r.reviewerId.trim())).size!==rs.length)return {status:'invalid-review',label:null};
 const labels=rs.map(r=>normalize(r.label));
 // Exact occurrence labels, no free-form stem-only labels.
 const validActor=id=>{const [layer,p,s]=id.split(':');const i=pos.indexOf(p);return i>=0&&row.pillars[i]&&
  (layer==='visible'&&s===undefined&&p!=='day'||layer==='hidden'&&stems.has(s)&&id.split(':').length===3||layer==='group'&&false);};
 if(labels.some(l=>Array.isArray(l.assistant)&&l.assistant.some(id=>!validActor(id))))return {status:'invalid-review',label:null};
 if(!labels.every(l=>cmp(l,labels[0])))return {status:'disagreement',label:null};
 return {status:'agreement-pending-external-independence-check',label:labels[0]};
}
export function validateAdjudicationFixture(data,development){
 const errors=[],seen=new Set(),chartKeys=new Set(development.cases.map(c=>JSON.stringify(c.pillars))),devIds=new Set(development.cases.map(c=>c.caseId));
 for(const c of data.sourceClauses){
  if(seen.has(c.id))errors.push('duplicate:'+c.id);seen.add(c.id);
  if(c.kind!=='partial-text-clause'||Object.hasOwn(c,'pillars')||c.finalOutcome!==null||!stems.has(c.day)||!branches.has(c.month)||
    !c.visible.every(s=>stems.has(s))||!c.branchMembers.every(b=>branches.has(b))||c.source.length<2)errors.push('clause:'+c.id);
 }
 for(const c of data.chartQueue){
  if(seen.has(c.id))errors.push('duplicate:'+c.id);seen.add(c.id);
  const k=JSON.stringify(c.pillars);
  if(devIds.has(c.id)||chartKeys.has(k))errors.push('development-or-queue-overlap:'+c.id);
  chartKeys.add(k);
  if(c.split!=='previously-exposed-classical-corpus'||!Array.isArray(c.pillars)||c.pillars.length!==4||!c.pillars.every(p=>typeof p==='string'&&p.length===2&&stems.has(p[0])&&branches.has(p[1])))errors.push('chart:'+c.id);
 }
 return errors;
}
export function summarizeAdjudication(data){
 const rows=data.chartQueue.map(c=>({id:c.id,...adjudicateChart(c)}));
 const byStatus={};for(const r of rows)byStatus[r.status]=(byStatus[r.status]??0)+1;
 return {sourceClauses:data.sourceClauses.length,chartQueue:rows.length,byStatus,
  independentHoldoutCharts:0,verifiedIndependentGoldCharts:0,rows,
  decisionGate:{ready:false,blockers:['no-verified-independent-gold','no-validated-effective-force-labels','native-regression-evidence-required']}};
}
// Report denominators even for exceptions. A runtime error cannot become a
// skipped case, and synthetic controls never inflate historical metrics.
export function summarizeIntegration(rows,expected){
 const errors=rows.filter(r=>r.error).map(r=>({id:r.id,error:r.error}));
 const historical=rows.filter(r=>r.kind==='historical'),controls=rows.filter(r=>r.kind==='control');
 const probes=xs=>xs.flatMap(r=>r.probes??[]);
 const h=probes(historical),c=probes(controls);
 const historicalHits=h.filter(p=>p.status==='matched'&&p.expected==='present').length;
 const controlHits=c.filter(p=>p.status==='matched').length;
 const violations=rows.flatMap(r=>(r.violations??[]).map(v=>({id:r.id,...v})));
 const ids=rows.map(r=>r.id),uniqueIds=new Set(ids).size===ids.length;
 return {historical:{cases:historical.length,expectedCases:expected.historicalCases,hits:historicalHits,total:expected.historicalProbes,
  recall:expected.historicalProbes?historicalHits/expected.historicalProbes:null},
  controls:{cases:controls.length,expectedCases:expected.controlCases,hits:controlHits,total:expected.controlProbes},
  errors,violations,gatePassed:uniqueIds&&!errors.length&&!violations.length&&historical.length===expected.historicalCases&&controls.length===expected.controlCases&&
   h.length===expected.historicalProbes&&c.length===expected.controlProbes&&controlHits===expected.controlProbes};
}
