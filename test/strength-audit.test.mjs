import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fixtureNames,classifyAuditedRows,summarize} from '../scripts/evaluate-strength-audited.mjs';
const read=async n=>JSON.parse(await readFile(new URL('./fixtures/'+n+'.json',import.meta.url),'utf8'));
test('audit overlay partitions all historical rows and rejects stale evidence',async()=>{
 const fixtures=await Promise.all(fixtureNames.map(async name=>({name,cases:(await read(name)).cases})));
 const audit=await read('strength-audit-v1');
 const evaluation={corpora:fixtures.map(f=>({name:f.name,rows:f.cases.map(c=>({id:c.id,reference:c.reference,results:[null,null,null,null]}))}))};
 const g=classifyAuditedRows(fixtures,audit,evaluation);
 assert.deepEqual(Object.fromEntries(Object.entries(g).map(([k,v])=>[k,v.length])),{primary:53,secondary:23,unreviewed:0,nonDirectional:32});
 assert.deepEqual(g.primary.map(r=>r.id),["XU01","XU06","XU07","XU10","XU11","XU12","XU13","XU14","XU16","XU20","XU21","XU23","XU25","XU26","XU27","XU29","XU31","W01","W02","W03","W04","W05","W06","W08","W09","W14","W15","W16","W18","W19","W20","W22","W23","W24","W26","W28","DX02","DX03","DH02","R01","R02","R03","R04","R07","R09","R11","H04","H05","H06","L76","L91","L95","L98"]);
 const stale=structuredClone(audit);stale.entries[0].pillars[0]='甲子';
 assert.throws(()=>classifyAuditedRows(fixtures,stale,evaluation),/stale/);
 const duplicate=structuredClone(audit);duplicate.entries.push(duplicate.entries[0]);
 assert.throws(()=>classifyAuditedRows(fixtures,duplicate,evaluation),/duplicate/);
 const missing=structuredClone(evaluation);missing.corpora[0].rows.pop();
 assert.throws(()=>classifyAuditedRows(fixtures,audit,missing),/incomplete/);
});
test('paired metrics distinguish new errors from improvements',()=>{
 const r=summarize([{reference:'weak',results:[null,'weak',null,null]},{reference:'strong',results:[null,'weak',null,null]},{reference:'strong',results:['strong','weak',null,null]}]);
 assert.deepEqual(r.transitions,{'abstain->agree':1,'abstain->disagree':1,'agree->disagree':1});
 assert.equal(r.policies.B.disagree,2);
 assert.equal(r.policies.B.coverage,1);
 assert.equal(r.policies.B.conditionalAgreement,1/3);
 assert.equal(summarize([]).policies.A.coverage,null);
 assert.equal(summarize([]).policies.A.conditionalAgreement,null);
});
