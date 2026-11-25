import {monthCommandSources,resolveCommand} from '../../src/core/month-command.js';
// Frozen astronomical intervals test computational parity, not historical
// commander truth. Text annotations are nominal-day probes only.
export function replayFrozenCommandIntervals(fixture){
 return fixture.examples.map(e=>{
  const actual=monthCommandSources(e.month).flatMap(s=>['literal-days','normalized-30'].map(mode=>{
   const r=resolveCommand(s,e.elapsed,e.duration,mode);
   return [s.id,mode,r.status,r.command?.label??null];
  }));
  return {birth:e.birth,month:e.month,elapsed:e.elapsed,duration:e.duration,expected:e.commands,actual,
   parity:JSON.stringify(actual)===JSON.stringify(e.commands),available:actual.filter(r=>r[3]!==null).length};
 });
}
export function compareTextCommandAnnotations(fixture){
 const probes={'MC-DT01':15,'MC-DT02':6};
 return fixture.cases.map(c=>{
  if(!Object.hasOwn(probes,c.id)||c.pillars[1][1]!=='寅')throw Error('unreviewed nominal-day probe: '+c.id);
  const nominalDayProbe=probes[c.id];
  const variants=monthCommandSources('인').map(s=>{
   const r=resolveCommand(s,nominalDayProbe*1440,30*1440,'literal-days');
   return {sourceId:s.id,command:r.command,status:r.status,stemMatch:r.command?.stem===c.reportedStem,
    elementMatch:r.command?.element===c.reportedElement,effectAgreement:null};
  });
  return {id:c.id,annotation:c.annotation,reportedStem:c.reportedStem,reportedElement:c.reportedElement,nominalDayProbe,
   basis:'nominal-day-probe-not-exact-birth-or-astronomical-interval',variants,effectAgreement:null};
 });
}
