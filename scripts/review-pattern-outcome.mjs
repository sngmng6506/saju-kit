import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {buildIndependentPacket,reviewTemplate,summarizeIndependentReviews} from './lib/pattern-outcome-independent-review.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../test/fixtures/'+n,import.meta.url),'utf8'));
const packet=buildIndependentPacket(read('pattern-outcome-mechanism-source-v2.json'),read('pattern-outcome-prospective-v1.json'),read('useful-element-priority-source-v1.json'));
const digest=createHash('sha256').update(JSON.stringify(packet)).digest('hex');
const [mode,...paths]=process.argv.slice(2);
let output;
if(mode==='packet'&&!paths.length)output={packetDigest:digest,...packet};
else if(mode==='template'&&!paths.length)output=reviewTemplate(packet,digest);
else if(mode==='summarize'&&paths.length>=2){
 output=summarizeIndependentReviews(packet,digest,paths.map(p=>JSON.parse(readFileSync(p,'utf8').replace(/^\uFEFF/,''))));
 if(output.status==='invalid-review')process.exitCode=1;
}else {console.error('Usage: node scripts/review-pattern-outcome.mjs packet | template | summarize reviewer1.json reviewer2.json');process.exitCode=2;}
if(output)console.log(JSON.stringify(output,null,2));
