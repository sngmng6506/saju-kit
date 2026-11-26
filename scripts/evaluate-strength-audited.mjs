import {readFile} from 'node:fs/promises';
import {evaluateStrengthFactorial} from './strength-factorial.mjs';
import {pathToFileURL} from 'node:url';

import {strengthAuditFixtureNames} from './lib/strength-audit-inventory.mjs';
export const fixtureNames=strengthAuditFixtureNames;
const directional=r=>r==='strong'||r==='weak';
const key=(fixture,id)=>JSON.stringify([fixture,id]);
export function classifyAuditedRows(fixtures,audit,evaluation){
 if(audit.version!==1||!Array.isArray(audit.entries))throw Error('unsupported audit');
 const source=new Map(), reviews=new Map(), seen=new Set();
 for(const {name,cases} of fixtures)for(const c of cases){
  const k=key(name,c.id),p=c.pillars.join(' ');
  if(source.has(k)||seen.has(p))throw Error('duplicate fixture case '+k);
  source.set(k,c);seen.add(p);
 }
 for(const a of audit.entries){
  const k=key(a.fixture,a.id),c=source.get(k);
  if(!c||reviews.has(k)||JSON.stringify(a.pillars)!==JSON.stringify(c.pillars)||a.reference!==c.reference||!directional(a.reference))throw Error('stale or duplicate audit '+k);
  for(const field of ['author','url','locator','evidence','review'])if(typeof a[field]!=='string'||!a[field].trim())throw Error('missing audit field '+field);
  for(const [field,allowed] of Object.entries({basis:['explicit','inferred','ambiguous'],scope:['natal','luck-modified','element-only','ambiguous'],formation:['ordinary','dependent','uncertain'],verification:['unreviewed','electronic-text-checked','scan-checked']}))if(!allowed.includes(a[field]))throw Error('invalid audit field '+field);
  if(c.formationDependent===true&&a.formation==='ordinary')throw Error('formation conflict '+k);
  reviews.set(k,a);
 }
 const groups={primary:[],secondary:[],unreviewed:[],nonDirectional:[]},evaluated=new Set();
 for(const {name,rows} of evaluation.corpora)for(const r of rows){
  const k=key(name,r.id),c=source.get(k),a=reviews.get(k);
  if(!c||evaluated.has(k)||r.reference!==c.reference||!Array.isArray(r.results)||r.results.length!==4||r.results.some(v=>v!==null&&!directional(v)))throw Error('invalid evaluation row '+k);
  evaluated.add(k);
  const group=!directional(r.reference)?'nonDirectional':!a||a.verification==='unreviewed'?'unreviewed':a.basis==='explicit'&&a.scope==='natal'&&a.formation==='ordinary'?'primary':'secondary';
  groups[group].push({...r,fixture:name,audit:a??null});
 }
 if(evaluated.size!==source.size)throw Error('incomplete evaluation');
 return groups;
}
export function summarize(rows){
 const n=rows.length;
 if(rows.some(r=>!directional(r.reference)))throw Error('non-directional summary');
 const policies=Object.fromEntries(['A','B','C','D'].map((id,j)=>{
  const agree=rows.filter(r=>r.results[j]===r.reference).length;
  const abstain=rows.filter(r=>r.results[j]===null).length;
  const disagree=n-agree-abstain;
  return [id,{agree,disagree,abstain,coverage:n?(agree+disagree)/n:null,conditionalAgreement:agree+disagree?agree/(agree+disagree):null}];
 }));
 const transitions={};
 const status=(r,j)=>r.results[j]===null?'abstain':r.results[j]===r.reference?'agree':'disagree';
 for(const r of rows){const k=status(r,0)+'->'+status(r,1);transitions[k]=(transitions[k]??0)+1;}
 return {n,policies,transitions};
}
export async function evaluateAuditedStrength(){
 const read=async name=>JSON.parse(await readFile(new URL('../test/fixtures/'+name+'.json',import.meta.url),'utf8'));
 const fixtures=await Promise.all(fixtureNames.map(async name=>({name,cases:(await read(name)).cases})));
 const audit=await read('strength-audit-v1');
 const evaluation=await evaluateStrengthFactorial(fixtureNames);
 const groups=classifyAuditedRows(fixtures,audit,evaluation);
 return {note:'Retrospective audited subsets, not new independent holdout',groups:Object.fromEntries(Object.entries(groups).map(([k,rows])=>[k,{count:rows.length,...(k==='nonDirectional'?{}:{metrics:summarize(rows)}),rows}])),primaryByVerification:Object.fromEntries(['electronic-text-checked','scan-checked'].map(v=>[v,summarize(groups.primary.filter(r=>r.audit.verification===v))]))};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(await evaluateAuditedStrength(),null,2));
