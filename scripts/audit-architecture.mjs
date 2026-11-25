import {readdirSync,readFileSync} from 'node:fs';
import {resolve,relative,dirname,sep} from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const slash=p=>p.split(sep).join('/');
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(resolve(dir,e.name)):[resolve(dir,e.name)]);
// Project convention: static ESM import/re-export declarations begin a line.
// Literal dynamic imports are also tracked. Nonliteral imports are reported
// separately, never interpreted as evidence of dead code.
export function auditArchitecture(base=root){
 const files=walk(resolve(base,'src')).filter(p=>p.endsWith('.js'));
 const names=new Set(files.map(p=>slash(relative(base,p))));
 const graph=new Map(),missing=[],violations=[],dynamicUnknown=[],hashes=new Map();
 for(const file of files){
  const name=slash(relative(base,file)),body=readFileSync(file,'utf8');
  const digest=createHash('sha256').update(body).digest('hex');
  if(!hashes.has(digest))hashes.set(digest,[]);hashes.get(digest).push(name);
  const specs=[...body.matchAll(/^\s*(?:import|export)\s+(?:(?:[^;'"]*?\bfrom\s*)?)['"]([^'"]+)['"]/gm),...body.matchAll(/\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g)].map(m=>m[1]);
  if(/\bimport\s*\(\s*[^\s'"]/.test(body))dynamicUnknown.push(name);
  const deps=[];
  for(const spec of new Set(specs)){
   if(!spec.startsWith('.')){violations.push({from:name,to:spec,reason:'runtime-external-import'});continue;}
   const dest=slash(relative(base,resolve(dirname(file),spec)));
   if(!names.has(dest)){missing.push({from:name,to:dest});continue;}
   deps.push(dest);
   if(name.startsWith('src/core/')&&dest.startsWith('src/features/'))violations.push({from:name,to:dest,reason:'core-depends-on-feature'});
   if(dest==='src/index.js')violations.push({from:name,to:dest,reason:'internal-depends-on-public-barrel'});
  }
  graph.set(name,deps.sort());
 }
 const cycles=[],visited=new Set(),active=new Set(),stack=[];
 function dfs(n){if(active.has(n)){cycles.push([...stack.slice(stack.indexOf(n)),n]);return;}if(visited.has(n))return;visited.add(n);active.add(n);stack.push(n);for(const d of graph.get(n)??[])dfs(d);stack.pop();active.delete(n);}
 for(const n of graph.keys())dfs(n);
 const reachable=new Set();function mark(n){if(reachable.has(n))return;reachable.add(n);for(const d of graph.get(n)??[])mark(d);}mark('src/index.js');
 const unreachable=[...names].filter(n=>!reachable.has(n)).sort();
 return {sourceFiles:files.length,edges:[...graph.values()].reduce((n,x)=>n+x.length,0),missing,violations,cycles,dynamicUnknown,
  unreachableFromRoot:unreachable,identicalFiles:[...hashes.values()].filter(x=>x.length>1),graph:Object.fromEntries(graph)};
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
 const result=auditArchitecture();
 console.log(JSON.stringify(result,null,2));
 if(result.missing.length||result.cycles.length||result.violations.length)process.exitCode=1;
}
