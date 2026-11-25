import { readdirSync, readFileSync } from 'node:fs';
import { resolve, relative, dirname, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { auditArchitecture } from './audit-architecture.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const slash=p=>p.split(sep).join('/');
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(resolve(dir,e.name)):[resolve(dir,e.name)]);
const isShim=body=>/^(?:\s*export\s+(?:\*|\{[^}]+\})\s+from\s+['"][^'"]+['"];?\s*)+$/.test(body);
function wordCounts(body){
 const counts=new Map();
 for(const [word] of body.matchAll(/[A-Za-z_$][\w$]*/g))counts.set(word,(counts.get(word)??0)+1);
 return counts;
}

// Deliberately conservative textual candidate scan, not a lexical-scope or
// call-graph analysis. Comments, strings and equal names can hide candidates.
// Never infer dead code from missing root reachability or auto-delete.
export function scanSymbols(sources,consumers={}){
 const runtimeCounts=wordCounts(Object.values(sources).join('\n'));
 const externalCounts=Object.entries(consumers).map(([file,body])=>[file,wordCounts(body)]);
 const localCandidates=[],exportCandidates=[];
 for(const [file,body] of Object.entries(sources)){
  const counts=wordCounts(body);
  const add=(name,kind,offset,exported=false)=>{
   const record={file,line:body.slice(0,offset).split('\n').length,name,kind};
   if(exported){
    if(runtimeCounts.get(name)!==1)return;
    const references=externalCounts.filter(([,words])=>words.has(name)).map(([path])=>path).sort();
    exportCandidates.push({...record,references,classification:references.some(p=>/^(test|scripts)\//.test(p))?'research-or-test-reference':references.length?'documented-or-text-reference':'unresolved-export'});
   }else if(counts.get(name)===1)localCandidates.push(record);
  };
  for(const m of body.matchAll(/^[ \t]*(export\s+)?(?:async\s+)?function\s+(\w+)\s*\(|^[ \t]*(export\s+)?(?:const|let|var)\s+(\w+)\s*=/gm))
   add(m[2]??m[4],m[2]?'function':'binding',m.index,Boolean(m[1]??m[3]));
  for(const m of body.matchAll(/^\s*import\s+\{([^}]+)\}\s+from\s+['"][^'"]+['"]/gm))
   for(const item of m[1].split(',')){
    const name=item.trim().split(/\s+as\s+/).at(-1);
    if(name)add(name,'import',m.index);
   }
 }
 return {localCandidates,exportCandidates};
}
export function auditDeadCode(base=root){
 const load=files=>Object.fromEntries(files.map(p=>[slash(relative(base,p)),readFileSync(p,'utf8')]));
 const sources=load(walk(resolve(base,'src')).filter(p=>p.endsWith('.js')));
 const consumers=load(['scripts','test','docs'].flatMap(dir=>walk(resolve(base,dir))).filter(p=>/\.(?:mjs|js|cjs|md)$/.test(p)).concat(readdirSync(base,{withFileTypes:true}).filter(e=>e.isFile()&&e.name.endsWith('.md')).map(e=>resolve(base,e.name))));
 // Do not count the audit's own textual test examples as production consumers.
 delete consumers['scripts/audit-dead-code.mjs'];
 delete consumers['test/dead-code-audit.test.mjs'];
 const graph=auditArchitecture(base);
 const shims=Object.keys(sources).filter(p=>isShim(sources[p])).sort();
 const unreachableCompatibility=graph.unreachableFromRoot.filter(p=>shims.includes(p));
 return {
  scope:{runtimeFiles:Object.keys(sources).length,consumerTextFiles:Object.keys(consumers).length,method:'conservative-identifier-occurrence-scan'},
  architecture:{edges:graph.edges,missing:graph.missing,violations:graph.violations,cycles:graph.cycles,dynamicUnknown:graph.dynamicUnknown,identicalFiles:graph.identicalFiles},
  compatibility:{totalShims:shims.length,unreachableCompatibility,unreachableNonShims:graph.unreachableFromRoot.filter(p=>!shims.includes(p))},
  ...scanSymbols(sources,consumers),
  limitations:['No AST, lexical-scope or complete call-graph analysis.','Comments, strings, shadowed names and re-exports may conceal unused declarations.','Consumer matches are textual leads, not verified calls; external repositories are not scanned.','Candidates require manual review; no automatic deletion.']
 };
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
 const r=auditDeadCode();
 console.log(JSON.stringify(r,null,2));
 // Only actual dependency violations fail this read-only inventory.
 if(r.architecture.missing.length||r.architecture.violations.length||r.architecture.cycles.length)process.exitCode=1;
}
