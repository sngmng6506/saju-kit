import {cp,mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {chartFromReference} from './strength-reference.mjs';
import {analyzeMultiaxisStrengthV4} from '../src/features/strength-multiaxis-v4/index.js';
import {analyzeNatalRelations} from '../src/core/natal-relations.js';
import {analyzeRootDynamics} from '../src/core/root-dynamics.js';
const root=fileURLToPath(new URL('../',import.meta.url));
export const variants=['C0','C1','C2','C3'];
function replaceOnce(source,needle,replacement){
 if(source.split(needle).length!==2)throw Error('clash patch target changed: '+needle);
 return source.replace(needle,replacement);
}
export function patchDayRoot(source){
 source=replaceOnce(source,'units:p.position[r.position]*(p.role[r.strongestRole]??0)','units:r.exposedToClash?0:p.position[r.position]*(p.role[r.strongestRole]??0)');
 return replaceOnce(source,"['month','day'].includes(r.position)&&r.strongestRole==='principal'","['month','day'].includes(r.position)&&r.strongestRole==='principal'&&!r.exposedToClash");
}
export function patchVisibleRoot(source){
 return replaceOnce(source,'matches:v.matches.map(m=>({position:m.position,role:m.role}))','matches:v.matches.filter(m=>!s.clashes.some(c=>c.positions.includes(m.position))).map(m=>({position:m.position,role:m.role}))');
}
export function observeFormationFlags(saju){
 const r=analyzeNatalRelations({saju}),d=analyzeRootDynamics({saju});
 const clash=r.pairs.filter(p=>p.branchSignals.some(s=>s.type==='branch.clash'));
 const exposed=new Set(clash.flatMap(p=>[p.left,p.right]));
 const full=r.groups.filter(g=>['branch.threeHarmony','branch.seasonalHarmony'].includes(g.type));
 return {clash:clash.length>0,
  clashedDayRoots:d.roots.find(r=>r.position==='day').positions.some(x=>x.strongestRole&&x.exposedToClash),
  fullGroup:full.length>0,fullGroupClash:full.some(g=>g.occurrences.some(x=>exposed.has(x.position))),
  cardinalPair:r.pairs.some(p=>p.branchSignals.some(s=>s.type==='branch.threeHarmonyCandidate'&&s.includesCardinal))};
}
export async function evaluateClashFormation(){
 const dir=await mkdtemp(join(tmpdir(),'saju-clash-formation-'));
 try{
  const engines=[analyzeMultiaxisStrengthV4];
  for(const [id,day,visible] of [['C1',true,false],['C2',false,true],['C3',true,true]]){
   const base=join(dir,id);
   await cp(join(root,'src'),join(base,'src'),{recursive:true});
   await writeFile(join(base,'package.json'),JSON.stringify({type:'module'}));
   for(const [enabled,path,patch] of [[day,'src/features/strength-multiaxis-v1/index.js',patchDayRoot],[visible,'src/features/strength-quantitative-v3/index.js',patchVisibleRoot]]){
    if(enabled){const p=join(base,path);await writeFile(p,patch(await readFile(p,'utf8')));}
   }
   engines.push((await import(pathToFileURL(join(base,'src/features/strength-multiaxis-v4/index.js')).href)).analyzeMultiaxisStrengthV4);
  }
  const corpus=JSON.parse(await readFile(join(root,'docs/strength-separated-decision-results.json'),'utf8')).rows;
  const rows=corpus.map(c=>{
   const saju=chartFromReference(c.pillars),flags=observeFormationFlags(saju);
   const actual=engines.map(fn=>fn({saju,birthBasis:'verified-chart',policy:'strength-multiaxis-v4'}));
   if(actual[0].direction!==c.fixed)throw Error('baseline changed '+c.id);
   if(!flags.clash&&actual.some(x=>x.direction!==actual[0].direction||JSON.stringify(x.axes)!==JSON.stringify(actual[0].axes)))throw Error('no-clash invariant '+c.id);
   return {id:c.id,pillars:c.pillars,reference:c.reference,group:c.group,results:actual.map(x=>x.direction),flags};
  });
  const metrics=Object.fromEntries(['primary','secondary','all'].map(g=>{
   const rs=rows.filter(r=>g==='all'||r.group===g);
   return [g,Object.fromEntries(variants.map((k,i)=>{
    const agree=rs.filter(r=>r.results[i]===r.reference).length,abstain=rs.filter(r=>r.results[i]===null).length;
    return [k,{n:rs.length,agree,disagree:rs.length-agree-abstain,abstain}];
   }))];
  }));
  const formationCounts=Object.fromEntries(Object.keys(rows[0].flags).map(k=>[k,rows.filter(r=>r.flags[k]).length]));
  return {variants,metrics,formationCounts,rows};
 }finally{await rm(dir,{recursive:true,force:true});}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(await evaluateClashFormation(),null,2));
