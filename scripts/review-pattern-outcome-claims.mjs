import {readFileSync,realpathSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,relative,isAbsolute,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildClaimPacket,claimReviewTemplate,adjudicateClaims,evaluateClaimComparisons} from './lib/pattern-outcome-claim-evaluation.mjs';
const root=realpathSync(fileURLToPath(new URL('..',import.meta.url)));
const read=p=>{
 const path=realpathSync(resolve(p)),rel=relative(root,path);
 if(!isAbsolute(rel)&&rel!=='..'&&!rel.startsWith('..'+sep))throw Error('prospective inputs must be outside repository');
 return JSON.parse(readFileSync(path,'utf8').replace(/^\uFEFF/,''));
};
const [mode,intake,draft,...rest]=process.argv.slice(2);
if(!intake||!draft||!['packet','template','summarize','compare'].includes(mode)||
 (['packet','template'].includes(mode)&&rest.length)||(mode==='summarize'&&rest.length<2)||(mode==='compare'&&rest.length<3))
 throw Error('Usage: review-pattern-outcome-claims.mjs packet|template <intake> <draft> | summarize <intake> <draft> <reviewA> <reviewB> [...] | compare <intake> <draft> <external-native-rows> <reviewA> <reviewB> [...]');
const packet=buildClaimPacket(read(intake),read(draft)),digest=createHash('sha256').update(JSON.stringify(packet)).digest('hex');
let output;
if(mode==='packet')output={packetDigest:digest,...packet};
else if(mode==='template')output=claimReviewTemplate(packet,digest);
else if(mode==='summarize')output=adjudicateClaims(packet,digest,rest.map(read));
else output=evaluateClaimComparisons(packet,digest,rest.slice(1).map(read),read(rest[0]));
console.log(JSON.stringify(output,null,2));
if(['invalid-review','invalid-model-output','pending'].includes(output.status))process.exitCode=1;
