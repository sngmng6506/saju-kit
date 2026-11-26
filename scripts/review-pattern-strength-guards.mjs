import {readFileSync,realpathSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,relative,isAbsolute,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildStrengthGuardPacket,retrospectiveGuardIntake,compileReviewedGuardRestrictions,replayReviewedGuards,surveyGuardSensitivity} from './lib/pattern-strength-guard-review.mjs';
import {claimReviewTemplate} from './lib/pattern-outcome-claim-evaluation.mjs';
import {buildLiteralStrengthInput} from './lib/pattern-strength-replay.mjs';
import {strengthAuditFixtureNames,verifyStrengthAuditInventory} from './lib/strength-audit-inventory.mjs';
const root=realpathSync(fileURLToPath(new URL('..',import.meta.url)));
const read=p=>{
 const path=realpathSync(resolve(p)),rel=relative(root,path);
 if(!isAbsolute(rel)&&rel!=='..'&&!rel.startsWith('..'+sep))throw Error('review inputs must be outside repository');
 return JSON.parse(readFileSync(path,'utf8').replace(/^\uFEFF/,''));
};
const [mode,source,...reviews]=process.argv.slice(2);
if(!source||!['packet','template','sensitivity','summarize','replay'].includes(mode)||(['packet','template','sensitivity'].includes(mode)?reviews.length!==0:reviews.length<2))
 throw Error('Usage: review-pattern-strength-guards.mjs packet|template|sensitivity <retrospective|external-intake> | summarize|replay <retrospective|external-intake> <reviewA> <reviewB> [...]');
const local=name=>JSON.parse(readFileSync(new URL('../test/fixtures/'+name+'.json',import.meta.url),'utf8'));
let intake;
if(source==='retrospective'){
 const audit=local('strength-audit-v1');
 verifyStrengthAuditInventory(strengthAuditFixtureNames.map(name=>({name,cases:local(name).cases})),audit);
 intake=retrospectiveGuardIntake(audit);
}else intake=read(source);
const packet=buildStrengthGuardPacket(intake),digest=createHash('sha256').update(JSON.stringify(packet)).digest('hex');
let output;
if(mode==='packet')output={packetDigest:digest,...packet};
else if(mode==='template')output=claimReviewTemplate(packet,digest);
else if(mode==='sensitivity'){
 const rows=packet.charts.map(c=>{try{return {chartId:c.id,...surveyGuardSensitivity(buildLiteralStrengthInput(c.pillars).input)};}catch(e){return {chartId:c.id,status:'invalid-evidence',reason:String(e?.message??e),rows:[]};}});
 output={status:rows.some(r=>r.status==='invalid-evidence')?'invalid-evidence':'diagnostic',selectionAuthority:false,actualAccuracy:null,rows};
}
else if(mode==='summarize')output=compileReviewedGuardRestrictions(packet,digest,reviews.map(read));
else output=replayReviewedGuards(packet,digest,reviews.map(read),pillars=>buildLiteralStrengthInput(pillars).input);
console.log(JSON.stringify(output,null,2));
if(['invalid-review','invalid-evidence','pending'].includes(output.status))process.exitCode=1;
