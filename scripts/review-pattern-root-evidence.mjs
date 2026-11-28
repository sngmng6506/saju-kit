import {readFileSync,realpathSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,relative,isAbsolute,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildRootEvidencePacket,reviewAndReplayRoots,selectRootReviewIntake} from './lib/pattern-root-evidence-review.mjs';
import {claimReviewTemplate} from './lib/pattern-outcome-claim-evaluation.mjs';
import {retrospectiveGuardIntake} from './lib/pattern-strength-guard-review.mjs';
import {buildLiteralStrengthInput} from './lib/pattern-strength-replay.mjs';
import {strengthAuditFixtureNames,verifyStrengthAuditInventory} from './lib/strength-audit-inventory.mjs';
const root=realpathSync(fileURLToPath(new URL('..',import.meta.url)));
const read=p=>{
 const path=realpathSync(resolve(p)),rel=relative(root,path);
 if(!isAbsolute(rel)&&rel!=='..'&&!rel.startsWith('..'+sep))throw Error('review inputs must be outside repository');
 return JSON.parse(readFileSync(path,'utf8').replace(/^\uFEFF/,''));
};
const [mode,source,...args]=process.argv.slice(2),selectors=[],reviews=[];
for(let i=0;i<args.length;i++){
 if(args[i]==='--chart'){if(!args[i+1]||args[i+1].startsWith('--'))throw Error('missing-chart-selector');selectors.push(args[++i]);}
 else if(args[i].startsWith('--'))throw Error('unknown-option:'+args[i]);
 else reviews.push(args[i]);
}
if(!source||!['packet','template','inventory','replay'].includes(mode)||(mode==='replay'?reviews.length<2:reviews.length!==0))throw Error('Usage: review-pattern-root-evidence.mjs packet|template|inventory <retrospective|external-intake> [--chart ID ...] | replay <retrospective|external-intake> <reviewA> <reviewB> [...] [--chart ID ...]');
const local=name=>JSON.parse(readFileSync(new URL('../test/fixtures/'+name+'.json',import.meta.url),'utf8'));
let intake;
if(source==='retrospective'){
 const audit=local('strength-audit-v1');
 verifyStrengthAuditInventory(strengthAuditFixtureNames.map(name=>({name,cases:local(name).cases})),audit);
 intake=retrospectiveGuardIntake(audit);
}else intake=read(source);
intake=selectRootReviewIntake(intake,selectors);
const build=pillars=>buildLiteralStrengthInput(pillars).input;
const packet=buildRootEvidencePacket(intake,build),digest=createHash('sha256').update(JSON.stringify(packet)).digest('hex');
let output;
if(mode==='packet')output={packetDigest:digest,...packet};
else if(mode==='template')output=claimReviewTemplate(packet,digest);
else if(mode==='inventory'){
 const counts=tasks=>Object.fromEntries([...new Set(tasks.map(t=>t.target.predicate))].map(p=>[p,tasks.filter(t=>t.target.predicate===p).length]));
 output={status:'diagnostic',packetDigest:digest,charts:packet.charts.length,tasks:packet.tasks.length,counts:counts(packet.tasks),byChart:packet.charts.map(c=>({chartId:c.id,counts:counts(packet.tasks.filter(t=>t.chartId===c.id))})),selectionAuthority:false,independentGoldCases:0};
}else output=reviewAndReplayRoots(intake,digest,reviews.map(read),build);
console.log(JSON.stringify(output,null,2));
if(['invalid-review','invalid-evidence','pending'].includes(output.status))process.exitCode=1;
