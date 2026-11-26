import {readFileSync,readdirSync} from 'node:fs';
import {resolve,relative,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {controls,routeControls} from './lib/pattern-modeled-consequence-coverage.mjs';
import {extractExposureRecords,combineExposureRecords,mergeExposureInventories,exposureInventoryDrift,screenExposurePacket} from './lib/pattern-outcome-exposure.mjs';
const root=fileURLToPath(new URL('..',import.meta.url));
const args=process.argv.slice(2);
if(args.length&&!(args.length===2&&args[0]==='--candidate'))throw Error('Usage: audit-pattern-outcome-exposure.mjs [--candidate external-intake.json]');
const read=p=>JSON.parse(readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const frozen=read(resolve(root,'docs/pattern-outcome-exposure-snapshot-v1.json'));
if(frozen.version!=='p1-5b-exposure-snapshot-v1'||!Array.isArray(frozen.charts)||!Array.isArray(frozen.urls)||!Array.isArray(frozen.unparsed)||
 !Array.isArray(frozen.manifest)||frozen.counts?.uniqueCharts!==frozen.charts.length||frozen.independentGoldCases!==0)throw Error('invalid frozen exposure snapshot');
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
 if(e.isSymbolicLink())throw Error('unreviewed symlink in fixture tree');
 const p=resolve(dir,e.name);return e.isDirectory()?walk(p):e.isFile()&&e.name.endsWith('.json')?[p]:[];
});
const fixtureDir=resolve(root,'test/fixtures'),paths=walk(fixtureDir).sort();
const rel=p=>relative(root,p).split(sep).join('/');
const records=paths.map(p=>extractExposureRecords(read(p),rel(p)));
records.push(extractExposureRecords({controls,routeControls},'scripts/lib/pattern-modeled-consequence-coverage.mjs'));
const live=combineExposureRecords(records),inventory=mergeExposureInventories(frozen,live),drift=exposureInventoryDrift(frozen,live);
const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const report={version:'p1-5b-exposure-audit-v1',scope:frozen.scope,frozenAgainst:frozen.frozenAgainst,
 frozenCounts:frozen.counts,liveCounts:{fixtureFiles:paths.length,uniqueCharts:live.charts.length,urls:live.urls.length,unparsed:live.unparsed.length},
 mergedUniqueCharts:inventory.charts.length,mergedUnparsed:inventory.unparsed,drift,developmentOverlap:frozen.developmentOverlap,
 inventoryDigest:digest(inventory),independentGoldCases:0,selectionAuthority:false};
if(args.length){
 const path=resolve(args[1]);
 // An intake must not be stored under a fixture tree already visible to
 // engineering. A passed screen is only a queue for blinded review.
 const within=relative(fixtureDir,path);
 if(within===''||within!=='..'&&!within.startsWith('..'+sep)&&!within.includes(':'))throw Error('candidate intake must be outside fixture tree');
 const packet=read(path);
 report.intakeDigest=digest(packet);
 report.intake=screenExposurePacket(packet,inventory);
 if(report.intake.status!=='review-pending')process.exitCode=1;
}
console.log(JSON.stringify(report,null,2));
