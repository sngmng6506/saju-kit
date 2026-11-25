import {STRENGTH_SOURCE} from './lib/strength-research-source.mjs';
import {cp, mkdtemp, readFile, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {chartFromReference} from './strength-reference.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const modules=[
 ['strength-quantitative-v3','analyzeQuantitativeStrength'],
 ['strength-multiaxis-v2','analyzeMultiaxisStrengthV2'],
 ['strength-multiaxis-v3','analyzeMultiaxisStrengthV3']
];
const names=['ordinary-xu-v1','ordinary-wei-v1','strength-ditiansui-v1','ordinary-ran-yuan-v1'];
const needle='season[classifyElement(basis.element,element)]';
export async function evaluateSeasonalAblation(){
 const dir=await mkdtemp(join(tmpdir(),'saju-season-ablation-'));
 try{
  await cp(join(root,'src'),join(dir,'src'),{recursive:true});
  await writeFile(join(dir,'package.json'),JSON.stringify({type:'module'}));
  const path=join(dir,STRENGTH_SOURCE.quantitative);
  const source=await readFile(path,'utf8');
  if(source.split(needle).length!==2)throw Error('seasonal patch target changed');
  await writeFile(path,source.replace(needle,'100'));
  const engines=await Promise.all([root,dir].map(base=>Promise.all(modules.map(async ([policy,name])=>(await import(pathToFileURL(join(base,'src/features',policy,'index.js')).href))[name]))));
  const corpora=[];let scenarioCount=0;
  for(const name of names){
   const fixture=JSON.parse(await readFile(join(root,'test/fixtures',name+'.json'),'utf8'));
   const rows=fixture.cases.map(c=>{
    const saju=chartFromReference(c.pillars);
    const results=engines.map((engine,j)=>engine.map((fn,i)=>{
     const x=fn({saju,policy:modules[i][0],birthBasis:'verified-chart'});
     if(j===1&&i===0){
      for(const sc of x.quantitative.scenarios)for(const v of sc.contributions)
       if(v.seasonFactor!==100||v.units!==v.weight*v.share*v.rootFactor*100)throw Error('neutral contribution mismatch '+c.id);
      scenarioCount+=x.quantitative.scenarios.length;
     }
     return x.direction;
    }));
    return {id:c.id,reference:c.reference,results};
   });
   corpora.push({name,rows,metrics:metrics(rows)});
  }
  const rows=corpora.flatMap(c=>c.rows);
  return {total:rows.length,scenarioCount,policies:modules.map(m=>m[0]),totals:metrics(rows),corpora};
 }finally{await rm(dir,{recursive:true,force:true});}
}
function metrics(rows){
 const l=rows.filter(r=>['strong','weak'].includes(r.reference));
 return [0,1].map(j=>modules.map((_,i)=>[
  l.filter(r=>r.results[j][i]===r.reference).length,
  l.filter(r=>r.results[j][i]&&r.results[j][i]!==r.reference).length,
  l.filter(r=>!r.results[j][i]).length
 ]));
}
