import { analyzeMonthCommand } from '../../core/month-command.js';
import { solarTermInstant } from '../../core/calendar.js';
const minute=t=>Date.UTC(t.y,t.m-1,t.d,t.hh,t.mm)/60000;
const conditions={'before-summer-solstice':{index:11,side:'before'},'after-summer-solstice':{index:11,side:'after'},
 'before-grain-rain':{index:7,side:'before'},'after-grain-rain':{index:7,side:'after'},
 'before-autumn-equinox':{index:17,side:'before'},'after-autumn-equinox':{index:17,side:'after'}};
// Resolve only explicit astronomical predicates, not textual prescriptions.
// At the minute boundary neither textual "before" nor "after" is asserted.
export function compareClimateTermConditions({saju,birth,completeHour,alternatives}){
 const names=[...new Set(alternatives.map(a=>a.when).filter(k=>Object.hasOwn(conditions,k)))];
 if(!names.length)return {status:'not-applicable',conditions:[]};
 const unavailable=reason=>({status:'unresolved',reason,conditions:names.map(when=>({when,matched:null}))});
 if(!completeHour)return unavailable('missing-hour');
 if(birth==null)return unavailable('missing-birth-instant');
 if(birth.period!=null)return unavailable('birth-period');
 const r=analyzeMonthCommand({saju,birth});
 if(r.status!=='diagnostic')return unavailable(r.reason);
 const at=minute(r.interval.start)+r.interval.elapsedMinutes;
 const checks=names.map(when=>{
  const c=conditions[when];
  if(r.interval.start.index+1!==c.index)throw Error('climate term month mismatch');
  const term=solarTermInstant(r.interval.start.y,c.index),deltaMinutes=at-minute(term);
  return {when,termIndex:c.index,term,deltaMinutes,matched:deltaMinutes===0?null:c.side==='before'?deltaMinutes<0:deltaMinutes>0};
 });
 return {status:checks.every(c=>c.matched!==null)?'observed':'boundary-unresolved',
  timeBasis:r.interval.timeBasis,conditions:checks};
}
