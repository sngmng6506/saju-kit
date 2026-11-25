import {STRENGTH_SOURCE} from './lib/strength-research-source.mjs';
import {cp,mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {chartFromReference} from './strength-reference.mjs';
import {analyzeMultiaxisStrength} from '../src/features/strength-multiaxis-v1/index.js';
import {analyzeMultiaxisStrengthV3} from '../src/features/strength-multiaxis-v3/index.js';
import {analyzeMultiaxisStrengthV4} from '../src/features/strength-multiaxis-v4/index.js';
import {analyzeRootDynamics} from '../src/core/root-dynamics.js';

const root=fileURLToPath(new URL('../',import.meta.url));
export const variants=['G0','G1-any-principal','G2-unclashed-principal','G3-local-rooted-peer','G4-neutral-direction','G5-include-peer-root-mass'];
// Research-only diagnostics. No strength grounds, weights, or directions are changed here.
export function weakPathChecks(base,dynamics,neutral){
 const principal=base.detail.root.observations.filter(r=>r.strongestRole==='principal');
 const intact=principal.filter(r=>!r.exposedToClash);
 const localPeer=dynamics.nodes.filter(n=>n.layer==='stem'&&['month','hour'].includes(n.position)&&n.element===dynamics.dayMaster.element&&n.rooted&&n.rootPositions.some(p=>intact.some(r=>r.position===p)));
 return [principal.length>0,intact.length>0,localPeer.length>0,neutral.direction!=='weak',!base.detail.environment.scenarios.every(r=>r.maxPressure>r.support+r.mass.peerRoot)];
}
export function candidateDirections(direction,checks){
 if(direction==='weak'&&(!Array.isArray(checks)||checks.length!==5||checks.some(v=>typeof v!=='boolean')))throw Error('missing weak-path checks');
 return [direction,...Array.from({length:5},(_,i)=>direction==='weak'&&checks[i]?null:direction)];
}
function metrics(rows,key){
 return Object.fromEntries(['primary','secondary','all'].map(group=>{
  const rs=rows.filter(r=>group==='all'||r.group===group);
  return [group,Object.fromEntries(variants.map((id,i)=>{
   const agree=rs.filter(r=>r[key][i]===r.reference).length,abstain=rs.filter(r=>r[key][i]===null).length,disagree=rs.length-agree-abstain;
   return [id,{n:rs.length,agree,disagree,abstain,coverage:rs.length?(agree+disagree)/rs.length:null,conditionalAgreement:agree+disagree?agree/(agree+disagree):null}];
  }))];
 }));
}
export async function evaluateWeakPaths(){
 const dir=await mkdtemp(join(tmpdir(),'saju-weak-paths-'));
 try{
  await cp(join(root,'src'),join(dir,'src'),{recursive:true});
  await writeFile(join(dir,'package.json'),JSON.stringify({type:'module'}));
  const p=join(dir,STRENGTH_SOURCE.network);
  const source=await readFile(p,'utf8'),needle="if(weak&&unchallenged.length)conflicts.push('local-resource-versus-weak');";
  if(source.split(needle).length!==2)throw Error('weak veto patch target changed');
  await writeFile(p,source.replace(needle,''));
  const noVetoV4=(await import(pathToFileURL(join(dir,'src/features/strength-multiaxis-v4/index.js')).href)).analyzeMultiaxisStrengthV4;
  const read=async name=>JSON.parse(await readFile(join(root,'docs',name+'.json'),'utf8'));
  const corpora=await Promise.all(['strength-audited-results','strength-zhang-holdout-results','strength-v4-lin-holdout-results'].map(read));
  const corpus=corpora.flatMap((f,i)=>f.rows.map(r=>({...r,group:i===0?r.group:r.formation==='ordinary'?'primary':'secondary'})));
  const seen=new Set();
  const rows=corpus.map(c=>{
   const key=c.pillars.join(' ');
   if(seen.has(key))throw Error('duplicate chart '+c.id);
   seen.add(key);
   const args={saju:chartFromReference(c.pillars),birthBasis:'verified-chart'};
   const v4={...args,policy:'strength-multiaxis-v4'};
   const baseline=analyzeMultiaxisStrengthV4(v4).direction,noVeto=noVetoV4(v4).direction;
   let checks=null;
   if(baseline==='weak'||noVeto==='weak'){
    const base=analyzeMultiaxisStrength({...args,policy:'strength-multiaxis-v1'});
    const neutral=analyzeMultiaxisStrengthV3({...args,policy:'strength-multiaxis-v3'},{seasonMode:'neutral'});
    checks=weakPathChecks(base,analyzeRootDynamics({saju:args.saju}),neutral);
   }
   return {id:c.id,pillars:c.pillars,reference:c.reference,group:c.group,baseline,observedNoVeto:noVeto,checks,results:candidateDirections(baseline,checks),noVetoSensitivity:candidateDirections(noVeto,checks)};
  });
  return {note:'Retrospective research only. G4 neutral uses the original veto in both tracks; the no-veto sensitivity is not a fully crossed G4 factorial.',metrics:metrics(rows,'results'),sensitivity:metrics(rows,'noVetoSensitivity'),rows};
 }finally{await rm(dir,{recursive:true,force:true});}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(await evaluateWeakPaths(),null,2));
