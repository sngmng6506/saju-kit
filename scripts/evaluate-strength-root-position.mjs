import {STRENGTH_SOURCE} from './lib/strength-research-source.mjs';
import {cp,mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {chartFromReference} from './strength-reference.mjs';
import {analyzeMultiaxisStrengthV3} from '../src/features/strength-multiaxis-v3/index.js';
import {analyzeMultiaxisStrengthV4} from '../src/features/strength-multiaxis-v4/index.js';
const root=fileURLToPath(new URL('../',import.meta.url));
export const variants=[{id:'R0',equal:false,relax:false},{id:'R1',equal:true,relax:false},{id:'R2',equal:false,relax:true},{id:'R3',equal:true,relax:true}];
function replaceOnce(source,needle,replacement){
 if(source.split(needle).length!==2)throw Error('root position patch target changed: '+needle);
 return source.replace(needle,replacement);
}
export function patchRootPosition(source,{equal,relax}){
 if(equal){
  source=replaceOnce(source,'position:{year:15,month:30,day:35,hour:20}','position:{year:25,month:25,day:25,hour:25}');
  source=replaceOnce(source,'position:{year:10,month:25,day:40,hour:25}','position:{year:25,month:25,day:25,hour:25}');
 }
 if(relax)source=replaceOnce(source,'root.range.min>=40&&root.centralPrincipal.length>0',"root.range.min>=40&&root.observations.some(r=>r.strongestRole==='principal')");
 // Legacy ground name intentionally retained only in temporary experimental copies:
 // v4's central-root exemption consequently changes when the root predicate expands.
 return source;
}
function metric(rows,key){
 return Object.fromEntries(variants.map((v,i)=>{
  const agree=rows.filter(r=>r[key][i]===r.reference).length;
  const abstain=rows.filter(r=>r[key][i]===null).length,disagree=rows.length-agree-abstain;
  return [v.id,{n:rows.length,agree,disagree,abstain,coverage:rows.length?(agree+disagree)/rows.length:null,conditionalAgreement:agree+disagree?agree/(agree+disagree):null}];
 }));
}
export async function evaluateRootPosition(){
 const dir=await mkdtemp(join(tmpdir(),'saju-root-position-'));
 try{
  const engines=[[analyzeMultiaxisStrengthV3,analyzeMultiaxisStrengthV4]];
  for(const variant of variants.slice(1)){
   const base=join(dir,variant.id);
   await cp(join(root,'src'),join(base,'src'),{recursive:true});
   await writeFile(join(base,'package.json'),JSON.stringify({type:'module'}));
   const p=join(base,STRENGTH_SOURCE.multiaxis);
   await writeFile(p,patchRootPosition(await readFile(p,'utf8'),variant));
   engines.push([(await import(pathToFileURL(join(base,'src/features/strength-multiaxis-v3/index.js')).href)).analyzeMultiaxisStrengthV3,(await import(pathToFileURL(join(base,'src/features/strength-multiaxis-v4/index.js')).href)).analyzeMultiaxisStrengthV4]);
  }
  const read=async n=>JSON.parse(await readFile(join(root,'docs',n+'.json'),'utf8'));
  const files=await Promise.all(['strength-audited-results','strength-zhang-holdout-results','strength-v4-lin-holdout-results','strength-zou-holdout-results'].map(read));
  const corpus=files.flatMap((f,i)=>f.rows.map(r=>({id:r.id,pillars:r.pillars,reference:r.reference,group:r.group??(r.formation==='ordinary'?'primary':'secondary'),baseline3:i===3?r.v3:r.results[0],baseline4:i===3?r.v4:i===2?r.results[2]:['ZN01','ZN05'].includes(r.id)?null:r.results[0]})));
  const seen=new Set(),ids=new Set();
  const rows=corpus.map(c=>{
   const key=c.pillars.join(' ');
   if(seen.has(key)||ids.has(c.id))throw Error('duplicate '+c.id);
   seen.add(key);ids.add(c.id);
   const args={saju:chartFromReference(c.pillars),birthBasis:'verified-chart'};
   const predictions=engines.map(([v3,v4])=>[v3({...args,policy:'strength-multiaxis-v3'}).direction,v4({...args,policy:'strength-multiaxis-v4'}).direction]);
   const v3=predictions.map(r=>r[0]),v4=predictions.map(r=>r[1]);
   if(v3[0]!==c.baseline3||v4[0]!==c.baseline4)throw Error('baseline changed '+c.id);
   return {id:c.id,pillars:c.pillars,reference:c.reference,group:c.group,v3,v4};
  });
  const metrics=Object.fromEntries(['primary','secondary','all'].map(g=>[g,Object.fromEntries(['v3','v4'].map(k=>[k,metric(rows.filter(r=>g==='all'||r.group===g),k)]))]));
  return {variants,metrics,rows};
 }finally{await rm(dir,{recursive:true,force:true});}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(await evaluateRootPosition(),null,2));
