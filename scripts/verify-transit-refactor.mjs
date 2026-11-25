import assert from 'node:assert/strict';
import {verifyRefactor} from './lib/refactor-equivalence.mjs';
const baseline=process.argv[2]??'d8e221df2bb01ea6a40e00a698e7339e59e1346a';
const extra=({old,now,compare})=>{
 assert.deepEqual(Object.keys(now.movementV6).sort(),Object.keys(old.movementV6).sort(),'movementV6 exports');
 const check=(name,input,label,success=true)=>compare(name,input,label,undefined,success);
 for(let v=1;v<=4;v++){
  const name=v===1?'analyzeUsefulElementTransit':'analyzeUsefulElementTransitV'+v,policy='useful-element-transit-v'+v;
  for(const y of [1980,2000,2026])for(const m of [2,5,8,11])for(const gender of ['남','여'])for(const daeunPolicy of ['legacy-day-v1','movement-minute-v6']){
   const birth={y,m,d:9,hh:12,mm:0},saju=old.getSaju(birth);
   const daeun=(daeunPolicy==='legacy-day-v1'?old.getDaeun:old.movementV6.getDaeun)({saju,birth,gender});
   const first=daeun.pillars[0].fromYear;
   for(const [fromYear,toYear] of [[y,y],[Math.max(y,first-1),first+1],[first+9,first+10],[first+30,first+32]]){
    if(toYear<=2100)check(name,{saju,birth,birthBasis:'verified-chart',gender,daeunPolicy,fromYear,toYear,policy},y+'-'+m+' '+gender+' '+daeunPolicy+' '+fromYear);
   }
  }
  const birth={y:1980,m:2,d:9,hh:12,mm:0},saju=old.getSaju(birth),i={saju,birth,birthBasis:'verified-chart',gender:'남',daeunPolicy:'legacy-day-v1',fromYear:1980,toYear:1982,policy};
  for(const x of [null,[],{}, {...i,policy:'wrong'},{...i,birthBasis:'wrong'},{...i,daeunPolicy:'wrong'},{...i,saju:null},{...i,birthBasis:'provisional-chart'},{...i,saju:{pillars:{...saju.pillars,hour:null}}},{...i,birth:null},{...i,birth:{...birth,hh:null}},{...i,birth:{...birth,period:{start:[11,0],end:[13,0]}}},{...i,birth:{...birth,calendar:'lunar'}},{...i,birth:{...birth,d:10}},{...i,gender:'wrong'},{...i,fromYear:1979},{...i,toYear:2100},{...i,fromYear:2101,toYear:2101},{...i,fromYear:2000,toYear:1999}])check(name,x,'transit boundary',false);
 }
 for(const prefix of ['','movementV6.']){
  const api=prefix?old.movementV6:old;
  for(const y of [1955,1980,2000])for(const m of [2,5,8,11])for(const gender of ['남','여'])for(const hh of [12,null]){
   const birth={y,m,d:9,hh,mm:hh===null?null:0},saju=old.getSaju(birth),daeun=api.getDaeun({saju,birth,gender});
   check(prefix+'getDaeun',{saju,birth,gender},'daeun');
   check(prefix+'getYearTimeline',{saju,daeun,endAge:80},'timeline');
   for(const year of [y,daeun.pillars[0].fromYear,daeun.pillars[0].toYear,daeun.pillars[1].fromYear])check(prefix+'getYearSignals',{saju,daeun,year},'annual '+year);
  }
  const birth={y:1980,m:2,d:9,hh:12,mm:0},saju=old.getSaju(birth),daeun=api.getDaeun({saju,birth,gender:'남'});
  for(const i of [null,[],{}, {saju,daeun,endAge:0},{saju,daeun,endAge:121},{saju,daeun,endAge:119},{saju,daeun,anchorYear:2026},{saju,daeun:{...daeun,pillars:[]}}])check(prefix+'getYearTimeline',i,'timeline boundary',false);
  for(const i of [undefined,{}, {saju,daeun,year:1899},{saju,daeun,year:2101},{saju:null,daeun,year:1980},{saju,daeun:null,year:1980},{saju,daeun:{...daeun,pillars:daeun.pillars.slice(1)},year:1980},{saju,daeun,year:2099}])check(prefix+'getYearSignals',i,'annual boundary',false);
 }
};
console.log(JSON.stringify(await verifyRefactor({baseline,policies:[],extra}),null,2));
