import {cp,mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {chartFromReference} from './strength-reference.mjs';
import {analyzeMultiaxisStrengthV3} from '../src/features/strength-multiaxis-v3/index.js';
import {analyzeMultiaxisStrengthV4} from '../src/features/strength-multiaxis-v4/index.js';

const root=fileURLToPath(new URL('../',import.meta.url));
const names=['F0','F1','F2','F3'];
export async function evaluateV4LinHoldout(){
 const dir=await mkdtemp(join(tmpdir(),'saju-v4-lin-'));
 try{
  await cp(join(root,'src'),join(dir,'src'),{recursive:true});
  await writeFile(join(dir,'package.json'),JSON.stringify({type:'module'}));
  const p=join(dir,'src/features/strength-multiaxis-v2/index.js');
  const source=await readFile(p,'utf8'),needle="if(weak&&unchallenged.length)conflicts.push('local-resource-versus-weak');";
  if(source.split(needle).length!==2)throw Error('weak veto patch target changed');
  await writeFile(p,source.replace(needle,''));
  const noVetoV3=(await import(pathToFileURL(join(dir,'src/features/strength-multiaxis-v3/index.js')).href)).analyzeMultiaxisStrengthV3;
  const noVetoV4=(await import(pathToFileURL(join(dir,'src/features/strength-multiaxis-v4/index.js')).href)).analyzeMultiaxisStrengthV4;
  const engines=[analyzeMultiaxisStrengthV3,noVetoV3,analyzeMultiaxisStrengthV4,noVetoV4];
  const fixture=JSON.parse(await readFile(join(root,'test/fixtures/ordinary-lin-holdout-v4-v1.json'),'utf8'));
  const rows=fixture.cases.map(c=>{
   const results=engines.map((fn,j)=>fn({saju:chartFromReference(c.pillars),policy:j<2?'strength-multiaxis-v3':'strength-multiaxis-v4',birthBasis:'verified-chart'}));
   for(const j of [1,3]){
    if(results[j].decision.conflicts.includes('local-resource-versus-weak')||results[j].seasonRobustness?.neutralConflicts.includes('local-resource-versus-weak'))throw Error('weak veto retained');
   }
   return {id:c.id,pillars:c.pillars,reference:c.reference,formation:c.formation,results:results.map(r=>r.direction),grounds:results[0].decision.grounds,conflicts:results[0].decision.conflicts,gateRequired:results[2].seasonRobustness.required,gatePassed:results[2].seasonRobustness.passed};
  });
  function metrics(rs){return Object.fromEntries(names.map((id,j)=>{
   const agree=rs.filter(r=>r.results[j]===r.reference).length,abstain=rs.filter(r=>r.results[j]===null).length,disagree=rs.length-agree-abstain;
   return [id,{n:rs.length,agree,disagree,abstain,coverage:rs.length?(agree+disagree)/rs.length:null,conditionalAgreement:agree+disagree?agree/(agree+disagree):null}];
  }));}
  return {metrics:{primary:metrics(rows.filter(r=>r.formation==='ordinary')),all:metrics(rows)},rows};
 }finally{await rm(dir,{recursive:true,force:true});}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(await evaluateV4LinHoldout(),null,2));
