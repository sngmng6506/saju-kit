import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

export const FIXTURES=['ordinary-xu-v1','ordinary-wei-v1','strength-ditiansui-v1','ordinary-ran-yuan-v1','ordinary-xu-holdout-v1','ordinary-lin-scan-v1','ordinary-zhang-holdout-v1','ordinary-lin-holdout-v4-v1','ordinary-zou-holdout-v1','zou-peer-pressure-controls-v1','month-command-text-controls-v1'];
export const REPORTS=['strength-root-position-results','strength-separated-decision-results','strength-abstention-results','strength-peer-root-access-results','strength-resource-route-sensitivity-results','strength-multihop-results','strength-clash-formation-results','formation-evidence-results'];
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const direction=x=>x==='strong'||x==='weak';
const sorted=xs=>[...xs].sort();
const groups=['primary','secondary','all'];

export function auditResearchRecords(fixtures,reports){
 const issues=[],check=(ok,where,reason)=>{if(!ok)issues.push({where,reason});};
 const records=FIXTURES.flatMap(name=>{
  const f=fixtures[name];
  if(!Array.isArray(f?.cases)){check(false,name,'missing-cases');return [];}
  return f.cases.map(c=>({...c,fixture:name}));
 });
 const refs=new Map(),charts=new Set();
 for(const c of records){
  const where=c.fixture+':'+c.id;
  check(typeof c.id==='string'&&c.id.length>0,where,'invalid-id');
  check(Array.isArray(c.pillars)&&c.pillars.length===4,where,'invalid-pillars');
  const key=JSON.stringify(c.pillars);
  check(!refs.has(c.id),where,'duplicate-fixture-id');
  check(!charts.has(key),where,'duplicate-fixture-chart');
  refs.set(c.id,c);charts.add(key);
 }
 const base=reports['strength-separated-decision-results']?.rows??[];
 const byId=new Map(base.map(c=>[c.id,c]));
 check(base.length>0,'baseline','missing-baseline');
 const abstentions=base.filter(r=>r.fixed===null).map(r=>r.id);
 for(const c of base){
  const f=refs.get(c.id);
  check(Boolean(f),'baseline:'+c.id,'missing-reference');
  if(f){
   check(equal(c.pillars,f.pillars),'baseline:'+c.id,'reference-pillars-mismatch');
   const labels=[f.reference,f.direction].filter(direction);
   check(labels.length>0&&labels.every(x=>x===c.reference),'baseline:'+c.id,'reference-direction-mismatch');
  }
  check(direction(c.reference),'baseline:'+c.id,'non-directional-reference');
  check(direction(c.fixed)||c.fixed===null,'baseline:'+c.id,'invalid-prediction');
  check(['primary','secondary'].includes(c.group),'baseline:'+c.id,'invalid-group');
 }
 const coverage={};
 for(const name of REPORTS){
  const rows=reports[name]?.rows;
  if(!Array.isArray(rows)){check(false,name,'missing-rows');continue;}
  const ids=rows.map(r=>r.id);
  check(new Set(ids).size===ids.length,name,'duplicate-report-id');
  const expected=name==='strength-abstention-results'?abstentions:base.map(r=>r.id);
  check(equal(sorted(ids),sorted(expected)),name,'report-id-set-mismatch');
  coverage[name]=rows.length;
  for(const r of rows){
   const b=byId.get(r.id),where=name+':'+r.id;
   if(!b){check(false,where,'unknown-chart');continue;}
   for(const k of ['reference','group','pillars','fixed'])
    if(Object.hasOwn(r,k))check(equal(r[k],b[k]),where,k+'-mismatch');
   if(name==='strength-root-position-results'){
    check(r.v4?.[0]===b.fixed,where,'v4-baseline-mismatch');
    check(r.v4?.[2]===b.experimental,where,'peripheral-experiment-mismatch');
   }
   if(name==='strength-clash-formation-results')check(r.results?.[0]===b.fixed,where,'clash-baseline-mismatch');
  }
 }
 const ab=reports['strength-abstention-results']?.rows??[],peer=reports['strength-peer-root-access-results']?.rows??[];
 const buckets=new Map(ab.map(r=>[r.id,r.bucket]));
 const candidates=new Set();
 for(const r of peer){
  check(r.bucket===(buckets.get(r.id)??null),'peer:'+r.id,'abstention-bucket-mismatch');
  if(r.fixed===null&&r.bucket==='no-ground-pressure-all'&&r.stats?.standard?.allPressure?.[1]&&r.stats?.neutral?.allPressure?.[1])candidates.add(r.id);
 }
 for(const name of ['strength-resource-route-sensitivity-results','strength-multihop-results'])
  for(const r of reports[name]?.rows??[])
   check(r.candidate===candidates.has(r.id),name+':'+r.id,'pressure-candidate-mismatch');
 // Recalculate reported categorical metrics rather than trust stored summaries.
 const metricChecks=[];
 function compareMetric(name,group,key,rows,predict,stored){
  const predictions=rows.map(predict);
  const agree=rows.filter((r,i)=>predictions[i]===r.reference).length;
  const abstain=predictions.filter(x=>x===null).length,disagree=rows.length-agree-abstain;
  const expected={n:rows.length,agree,disagree,abstain,coverage:rows.length?(agree+disagree)/rows.length:null,
   conditionalAgreement:agree+disagree?agree/(agree+disagree):null};
  const where=name+':'+group+':'+key;
  check(predictions.every(x=>direction(x)||x===null),where,'invalid-prediction');
  check(Boolean(stored),where,'missing-metric');
  for(const k of ['n','agree','disagree','abstain'])check(stored?.[k]===expected[k],where,k+'-metric-mismatch');
  for(const k of ['coverage','conditionalAgreement'])if(stored&&Object.hasOwn(stored,k))check(stored[k]===expected[k],where,k+'-metric-mismatch');
  metricChecks.push(where);
 }
 for(const g of groups){
  const select=rows=>rows.filter(r=>g==='all'||r.group===g);
  for(const k of ['fixed','experimental'])compareMetric('separated',g,k,select(base),r=>r[k],reports['strength-separated-decision-results']?.metrics?.[g]?.[k]);
  const root=reports['strength-root-position-results'];
  for(const k of ['v3','v4'])for(let i=0;i<4;i++)compareMetric('root',g,k+':R'+i,select(root?.rows??[]),r=>r[k]?.[i],root?.metrics?.[g]?.[k]?.['R'+i]);
  const clash=reports['strength-clash-formation-results'];
  for(let i=0;i<4;i++)compareMetric('clash',g,'C'+i,select(clash?.rows??[]),r=>r.results?.[i],clash?.metrics?.[g]?.['C'+i]);
  const rows=select(ab),stored=reports['strength-abstention-results']?.metrics?.[g]??{};
  const keys=new Set([...rows.map(r=>r.bucket),...Object.keys(stored)]);
  for(const k of keys){
   const rs=rows.filter(r=>r.bucket===k);
   const expected={n:rs.length,strong:rs.filter(r=>r.reference==='strong').length,weak:rs.filter(r=>r.reference==='weak').length};
   check(equal(stored[k],expected),'abstention:'+g+':'+k,'bucket-metric-mismatch');
  }
 }
 return {ok:issues.length===0,fixtureCount:FIXTURES.length,referenceCount:records.length,uniqueCharts:charts.size,uniqueIds:refs.size,
  baselineCount:base.length,abstentionCount:abstentions.length,reportRows:coverage,metricChecks:metricChecks.length,
  pressureCandidates:sorted(candidates),issues};
}
export async function auditResearchFiles(){
 const load=async(path,names)=>Object.fromEntries(await Promise.all(names.map(async n=>[n,JSON.parse(await readFile(new URL(path+n+'.json',import.meta.url),'utf8'))])));
 const [fixtures,reports]=await Promise.all([load('../test/fixtures/',FIXTURES),load('../docs/',REPORTS)]);
 return auditResearchRecords(fixtures,reports);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const result=await auditResearchFiles();
 console.log(JSON.stringify(result,null,2));
 if(!result.ok)process.exitCode=1;
}
