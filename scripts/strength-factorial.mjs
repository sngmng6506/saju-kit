import {STRENGTH_SOURCE} from './lib/strength-research-source.mjs';
import {cp,mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {chartFromReference} from './strength-reference.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const names=['ordinary-xu-v1','ordinary-wei-v1','strength-ditiansui-v1','ordinary-ran-yuan-v1'];
const variants=[{id:'A',neutral:false,remove:false},{id:'B',neutral:false,remove:true},{id:'C',neutral:true,remove:false},{id:'D',neutral:true,remove:true}];
async function patch(base,path,needle,replacement){
 const p=join(base,path),source=await readFile(p,'utf8');
 if(source.split(needle).length!==2)throw Error('patch target changed: '+path);
 await writeFile(p,source.replace(needle,replacement));
}
function metrics(rows){
 const l=rows.filter(r=>['strong','weak'].includes(r.reference));
 return variants.map((_,j)=>[l.filter(r=>r.results[j]===r.reference).length,l.filter(r=>r.results[j]&&r.results[j]!==r.reference).length,l.filter(r=>!r.results[j]).length]);
}
export async function evaluateStrengthFactorial(fixtureNames=names){
 const dir=await mkdtemp(join(tmpdir(),'saju-factorial-'));
 try{
  const engines=[];
  for(const v of variants){
   const base=v.id==='A'?root:join(dir,v.id);
   if(v.id!=='A'){
    await cp(join(root,'src'),join(base,'src'),{recursive:true});
    await writeFile(join(base,'package.json'),JSON.stringify({type:'module'}));
    if(v.neutral)await patch(base,STRENGTH_SOURCE.quantitative,'season[classifyElement(basis.element,element)]','100');
    if(v.remove)await patch(base,STRENGTH_SOURCE.network,"if(weak&&unchallenged.length)conflicts.push('local-resource-versus-weak');",'');
   }
   engines.push((await import(pathToFileURL(join(base,'src/features/strength-multiaxis-v3/index.js')).href)).analyzeMultiaxisStrengthV3);
  }
  const corpora=[];
  for(const name of fixtureNames){
   const fixture=JSON.parse(await readFile(join(root,'test/fixtures',name+'.json'),'utf8'));
   const rows=fixture.cases.map(c=>{
    const results=engines.map((fn,j)=>{
     const x=fn({saju:chartFromReference(c.pillars),policy:'strength-multiaxis-v3',birthBasis:'verified-chart'});
     if(variants[j].remove&&x.decision.conflicts.includes('local-resource-versus-weak'))throw Error('veto retained');
     return x.direction;
    });
    return {id:c.id,reference:c.reference,formationDependent:c.formationDependent===true,results};
   });
   corpora.push({name,rows,metrics:metrics(rows)});
  }
  const rows=corpora.flatMap(c=>c.rows);
  const totals=metrics(rows);
  return {total:rows.length,variants,totals,agreementInteraction:totals[3][0]-totals[2][0]-totals[1][0]+totals[0][0],corpora};
 }finally{await rm(dir,{recursive:true,force:true});}
}
