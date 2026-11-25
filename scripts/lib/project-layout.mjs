import {readdirSync,readFileSync,existsSync} from 'node:fs';
import {resolve,relative,dirname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {TEST_DOMAINS} from './domain-manifest.mjs';

export const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const slash=p=>p.split(sep).join('/');
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(resolve(dir,e.name)):[resolve(dir,e.name)]);
const paths=(base,dir)=>walk(resolve(base,dir)).map(p=>slash(relative(base,p)));

// Separate omission, stale path and multiple ownership. Do not silently
// drop files when a domain has been renamed or a fixture has been added.
export function compareInventory(actual,listed){
 const counts=new Map();
 for(const path of listed)counts.set(path,(counts.get(path)??0)+1);
 const known=new Set(actual);
 return {
  unlisted:actual.filter(p=>!counts.has(p)).sort(),
  missing:[...counts.keys()].filter(p=>!known.has(p)).sort(),
  duplicates:[...counts].filter(([,n])=>n>1).map(([p])=>p).sort()
 };
}
export function discoverTests(base=root){
 return paths(base,'test').filter(p=>p.endsWith('.test.mjs')).sort();
}
export function auditTestLayout(base=root){
 return compareInventory(discoverTests(base),Object.values(TEST_DOMAINS).flat());
}
// Node's default --test discovery also scans outside test/. Keep ordinary
// CLI and helper filenames out of its test-like naming conventions.
export function isTestLikeFilename(path){
 const name=path.split('/').at(-1);
 return /^(?:test|test-.+|.+[-.](?:test|spec))\.(?:js|mjs|cjs)$/.test(name);
}
export function findUnexpectedTestEntries(base=root){
 const rootFiles=readdirSync(base,{withFileTypes:true}).filter(e=>e.isFile()).map(e=>e.name);
 return [...rootFiles,...paths(base,'src'),...paths(base,'scripts')]
  .filter(isTestLikeFilename).sort();
}
export function auditLayout(base=root){
 const domainNames=Object.keys(TEST_DOMAINS);
 const canonical=paths(base,'docs').filter(p=>/\.(md|json)$/.test(p)&&p!=='docs/README.md'&&!p.startsWith('docs/domains/'));
 const fixtures=paths(base,'test/fixtures').filter(p=>p.endsWith('.json'));
 const catalogFiles=domainNames.map(d=>'docs/domains/'+d+'.md');
 const actualCatalog=paths(base,'docs/domains').filter(p=>p.endsWith('.md'));
 const links=[],broken=[];
 for(const file of ['docs/README.md',...catalogFiles]){
  const absolute=resolve(base,file);
  if(!existsSync(absolute)){broken.push({file,target:file});continue;}
  for(const m of readFileSync(absolute,'utf8').matchAll(/\]\(([^)]+)\)/g)){
   const target=m[1];
   if(/^(?:https?:|#)/.test(target))continue;
   const path=resolve(dirname(absolute),target);
   if(!existsSync(path))broken.push({file,target});
   if(file!=='docs/README.md')links.push(slash(relative(base,path)));
  }
 }
 return {
  counts:{testFiles:discoverTests(base).length,documentsAndResults:canonical.length,fixtures:fixtures.length,domains:domainNames.length},
  tests:auditTestLayout(base),
  unexpectedTestEntries:findUnexpectedTestEntries(base),
  catalogs:compareInventory(actualCatalog,catalogFiles),
  documentsAndFixtures:compareInventory([...canonical,...fixtures],links),
  broken
 };
}
export function layoutIsClean(report){
 return report.broken.length===0&&report.unexpectedTestEntries.length===0&&['tests','catalogs','documentsAndFixtures'].every(key=>Object.values(report[key]).every(rows=>rows.length===0));
}
