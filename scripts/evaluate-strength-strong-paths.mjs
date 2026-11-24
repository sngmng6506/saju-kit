import {cp,mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {chartFromReference} from './strength-reference.mjs';
import {analyzeMultiaxisStrengthV3} from '../src/features/strength-multiaxis-v3/index.js';
import {analyzeMultiaxisStrengthV4} from '../src/features/strength-multiaxis-v4/index.js';
const root=fileURLToPath(new URL('../',import.meta.url));
const names=['E0','E1','E2','E3','E4'];
const read=async n=>JSON.parse(await readFile(join(root,'docs',n+'.json'),'utf8'));
async function patch(base,path,needle){
 const p=join(base,path),source=await readFile(p,'utf8');
 if(source.split(needle).length!==2)throw Error('patch target changed: '+path);
 await writeFile(p,source.replace(needle,'{}'));
}
function metrics(rows){
 return Object.fromEntries(names.map((id,j)=>{
  const agree=rows.filter(r=>r.results[j]===r.reference).length;
  const abstain=rows.filter(r=>r.results[j]===null).length,disagree=rows.length-agree-abstain;
  return [id,{n:rows.length,agree,disagree,abstain,coverage:rows.length?(agree+disagree)/rows.length:null,conditionalAgreement:agree+disagree?agree/(agree+disagree):null}];
 }));
}
export async function evaluateStrongPaths(){
 const dir=await mkdtemp(join(tmpdir(),'saju-strong-paths-'));
 try{
  const engines=[analyzeMultiaxisStrengthV3];
  for(const [id,nominal,bounded] of [['E1',false,true],['E2',true,false],['E3',false,false]]){
   const base=join(dir,id);
   await cp(join(root,'src'),join(base,'src'),{recursive:true});
   await writeFile(join(base,'package.json'),JSON.stringify({type:'module'}));
   if(!nominal)await patch(base,'src/features/strength-multiaxis-v2/index.js',"grounds.push('local-resource-and-robust-support');");
   if(!bounded)await patch(base,'src/features/strength-multiaxis-v3/index.js',"grounds.push('bounded-route-support');");
   engines.push((await import(pathToFileURL(join(base,'src/features/strength-multiaxis-v3/index.js')).href)).analyzeMultiaxisStrengthV3);
  }
  engines.push(analyzeMultiaxisStrengthV4);
  const [a,z]=await Promise.all([read('strength-audited-results'),read('strength-zhang-holdout-results')]);
  const corpus=[...a.rows,...z.rows.map(r=>({...r,group:r.formation==='ordinary'?'primary':'secondary'}))];
  const seen=new Set();
  const rows=corpus.map(c=>{
   const key=c.pillars.join(' ');
   if(seen.has(key))throw Error('duplicate chart '+c.id);
   seen.add(key);
   const results=engines.map((fn,j)=>fn({saju:chartFromReference(c.pillars),policy:j===4?'strength-multiaxis-v4':'strength-multiaxis-v3',birthBasis:'verified-chart'}).direction);
   if(results[0]!==c.results[0])throw Error('historical baseline changed '+c.id);
   return {id:c.id,pillars:c.pillars,reference:c.reference,group:c.group,results};
  });
  return {note:'Retrospective exposed cases only; E4 is experimental',variants:names,metrics:{primary:metrics(rows.filter(r=>r.group==='primary')),secondary:metrics(rows.filter(r=>r.group==='secondary')),all:metrics(rows)},rows};
 }finally{await rm(dir,{recursive:true,force:true});}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(await evaluateStrongPaths(),null,2));
