import {readFileSync} from 'node:fs';
import {buildLiteralStrengthInput} from './lib/pattern-strength-replay.mjs';
import {auditInteractionScope} from './lib/pattern-interaction-scope.mjs';
import {strengthAuditFixtureNames,verifyStrengthAuditInventory} from './lib/strength-audit-inventory.mjs';
const read=name=>JSON.parse(readFileSync(new URL('../test/fixtures/'+name+'.json',import.meta.url),'utf8'));
const audit=read('strength-audit-v1');
verifyStrengthAuditInventory(strengthAuditFixtureNames.map(name=>({name,cases:read(name).cases})),audit);
const rows=audit.entries.map(c=>{
 const id=JSON.stringify([c.fixture,c.id]),primary=c.basis==='explicit'&&c.scope==='natal'&&c.formation==='ordinary'&&c.verification!=='unreviewed';
 try{return {id,primary,...auditInteractionScope(buildLiteralStrengthInput(c.pillars).input)};}
 catch(e){return {id,primary,status:'invalid-evidence',reason:String(e?.message??e)};}
});
function summarize(rows){
 const good=rows.filter(r=>r.status==='diagnostic'),all=good.flatMap(r=>r.rows);
 return {charts:rows.length,evaluated:good.length,invalid:rows.filter(r=>r.status!=='diagnostic').length,unavailable:good.filter(r=>r.summary.analysisStatus!=='diagnostic').length,
 groups:['local-visible','local-hidden','nonlocal-visible','nonlocal-hidden'].map(scope=>({scope,literal:all.filter(r=>r.scope===scope).length,rootedPossible:all.filter(r=>r.scope===scope&&r.localBasisSeededActionPossible===true).length,unevaluated:all.filter(r=>r.scope===scope&&r.localBasisSeededActionPossible===null).length})),
 coResidentPairs:good.reduce((n,r)=>n+r.summary.coResidentPairs,0),dayLocal:good.reduce((n,r)=>n+r.summary.dayLocal,0),dayNonlocal:good.reduce((n,r)=>n+r.summary.dayNonlocal,0),chartsWithDayNonlocal:good.filter(r=>r.summary.dayNonlocal>0).length};
}
const all=summarize(rows),primary=summarize(rows.filter(r=>r.primary));
console.log(JSON.stringify({status:all.invalid?'invalid-evidence':all.unavailable?'incomplete':'diagnostic',all,primary,selectionAuthority:false,actualAccuracy:null,independentGoldCases:0,rows},null,2));
if(all.invalid||all.unavailable)process.exitCode=1;
