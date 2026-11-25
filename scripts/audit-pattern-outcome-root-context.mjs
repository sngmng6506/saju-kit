import {readFileSync} from 'node:fs';
import {analyzeStemForceEvidence} from '../src/core/stem-force.js';
import {observeRelativeForce} from '../src/core/relative-force.js';
import {analyzeFormationEvidence} from '../src/core/formation-evidence.js';
import {observeRootContext} from '../src/features/pattern/outcome-root-context.js';
const data=JSON.parse(readFileSync(new URL('../test/fixtures/pattern-outcome-role-flow-source-v1.json',import.meta.url),'utf8'));
const rows=[],errors=[];
for(const c of data.cases){
 try{
  const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,{stem:c.pillars[i][0],branch:c.pillars[i][1],text:c.pillars[i]}]))};
  const stemForce=analyzeStemForceEvidence({saju}),relativeForce=observeRelativeForce(stemForce),formation=analyzeFormationEvidence({saju});
  const result=observeRootContext({completeHour:stemForce.completeHour,stemForce,relativeForce},formation);
  if(result.status!=='diagnostic'||result.selectionAuthority!==false||result.rootEffectConfirmed!==null||result.slots.some(s=>s.effectiveRoot!==null||s.accessConfirmed!==null))errors.push(c.id+':integrity');
  rows.push({id:c.id,source:c.source,locator:c.locator,reading:c.reading,result,effectAgreement:null});
 }catch(e){errors.push({id:c.id,error:e.message});}
}
console.log(JSON.stringify({scope:'exposed source contrasts, core sensitivity not force accuracy',independentGold:0,expectedCases:data.cases.length,executedCases:rows.length,errors,rows},null,2));
if(errors.length||rows.length!==data.cases.length)process.exitCode=1;
