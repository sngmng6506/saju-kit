import { getSaju, solarTermInstant } from './calendar.js';
import { analyzeNatalContext } from './natal-context.js';
import { stemInfo, elementRelation } from './elements.js';
import { SajuError } from './error.js';

export const MONTH_COMMAND_VERSION='month-command-evidence-v1';
const DAY_MINUTES=1440;
const MONTH_BRANCHES=['축','인','묘','진','사','오','미','신','유','술','해','자'];
const POSITIONS=['year','month','day','hour'];
// 三命通會 卷二 論人元司事: preserve original stem/earth notation.
// 艮土 and 坤土 have elemental meaning here, not an inferred stem polarity.
const SANMING={
 인:[['艮土',5],['병',5],['갑',20]],묘:[['갑',7],['을',23]],진:[['을',7],['임',5],['무',18]],
 사:[['무',7],['경',5],['병',18]],오:[['병',7],['정',23]],미:[['정',7],['갑',5],['기',18]],
 신:[['坤土',5],['임',5],['경',20]],유:[['경',7],['신',23]],술:[['신',7],['병',5],['무',18]],
 해:[['무',5],['갑',5],['임',20]],자:[['임',7],['계',23]],축:[['계',7],['경',5],['기',18]]
};
// 子平命術要訣 printed p.8: preserve the printed listing order, which is
// NOT chronological except where the prose explicitly explains 寅.
// 子 totals 26, not 30; do not silently correct. 乙 in 午 is literal.
const ZOU={
 인:[['기',7],['병',5],['갑',18]],묘:[['을',18],['갑',9],['계',3]],진:[['무',18],['을',9],['계',3]],
 사:[['병',18],['무',7],['경',5]],오:[['정',18],['병',9],['을',3]],미:[['기',18],['을',5],['정',7]],
 신:[['경',17],['기',7],['무',3],['임',3]],유:[['신',20],['경',7],['정',3]],술:[['무',18],['신',7],['정',5]],
 해:[['임',18],['갑',5],['무',7]],자:[['계',18],['임',5],['신',3]],축:[['기',18],['계',7],['신',5]]
};
const total=rows=>rows.reduce((s,r)=>s+r[1],0);
function describe([label,days]){
 const stem=['艮土','坤土'].includes(label)?null:label;
 return {label,stem,element:stem===null?'earth':stemInfo(stem).element,days};
}
export function monthCommandSources(branch){
 if(!Object.hasOwn(SANMING,branch))throw new SajuError('branch','올바른 월지가 아닙니다.');
 return [
  {id:'sanming-tonghui-juan2',source:'https://blog.udn.com/article/article_print.jsp?f_ART_ID=3146046&f_CODE=1786569438931&uid=DejaVu',orderResolved:true,nominalDays:total(SANMING[branch]),entries:SANMING[branch].map(describe)},
  {id:'zou-zi-ping-ming-shu-p8',source:'https://upload.wikimedia.org/wikipedia/commons/c/c7/NLC416-13jh000981-42624_%E5%AD%90%E5%B9%B3%E5%91%BD%E8%A1%93%E8%A6%81%E8%A8%A3.pdf',printedPage:8,pdfPageIndex:11,orderResolved:branch==='인',nominalDays:total(ZOU[branch]),entries:ZOU[branch].map(describe)}
 ];
}
const minute=t=>Date.UTC(t.y,t.m-1,t.d,t.hh,t.mm)/60000;
const term=(year,index)=>({...solarTermInstant(year,index),index,branch:MONTH_BRANCHES[index/2]});
// Use the same table/time convention as calendar.js. Explicit birth data
// are required; an hour pillar cannot recover elapsed time since jeol.
function intervalFor(birth,computed){
 const {y,m,d}=computed.solar;
 const at=minute({y,m,d,hh:birth.hh,mm:birth.mm});
 const terms=[y-1,y,y+1].flatMap(year=>Array.from({length:12},(_,i)=>term(year,i*2))).sort((a,b)=>minute(a)-minute(b));
 const i=terms.findIndex(t=>minute(t)>at);
 if(i<1)throw new SajuError('range','절입 구간을 찾을 수 없습니다.');
 const start=terms[i-1],end=terms[i],elapsedMinutes=at-minute(start),durationMinutes=minute(end)-minute(start);
 if(start.branch!==computed.pillars.month.branch||elapsedMinutes<0||elapsedMinutes>=durationMinutes)throw new SajuError('month-command-interval','월주와 절입 구간이 일치하지 않습니다.');
 return {start,end,elapsedMinutes,durationMinutes,timeBasis:'UTC+09:00-table-minute'};
}
// Two explicit computational conventions; neither is asserted classical.
// Literal 24-hour days leave a >30-day tail unresolved. Normalized 30-day
// scale is an engineering sensitivity, not a source's explicit instruction.
// Integer cross multiplication avoids floating boundary ambiguity.
export function resolveCommand(source,elapsedMinutes,durationMinutes,mode){
 if(!['literal-days','normalized-30'].includes(mode))throw new SajuError('month-command-mode','지원하지 않는 사령 시간 정책입니다.');
 if(!Number.isSafeInteger(elapsedMinutes)||!Number.isSafeInteger(durationMinutes)||elapsedMinutes<0||durationMinutes<=elapsedMinutes)
  throw new SajuError('month-command-interval','사령 경과 시간이 올바르지 않습니다.');
 if(!source.orderResolved||source.nominalDays!==30)return {mode,status:'source-unresolved',command:null};
 const num=mode==='literal-days'?elapsedMinutes:elapsedMinutes*30;
 const den=mode==='literal-days'?DAY_MINUTES:durationMinutes;
 let start=0;
 for(const e of source.entries){
  const end=start+e.days;
  if(num<end*den)return {mode,status:'conditional',command:{...e,startDay:start,endDay:end},atBoundary:num===start*den};
  start=end;
 }
 return {mode,status:'outside-nominal-days',command:null};
}
export function analyzeMonthCommand({saju,birth}={}){
 const context=analyzeNatalContext({saju}),sources=monthCommandSources(context.month.branch);
 const meta={version:MONTH_COMMAND_VERSION,month:context.month,completeHour:context.completeHour,
  effectsConfirmed:false,direction:null,commandResolved:false,sources};
 const unresolved=reason=>({...meta,status:'unresolved',reason,interval:null,hypotheses:[]});
 if(birth==null)return unresolved('missing-birth-instant');
 if(typeof birth!=='object'||Array.isArray(birth))throw new SajuError('month-command-birth','출생 입력 객체가 필요합니다.');
 if(birth.hh==null&&birth.mm==null)return unresolved('missing-birth-time');
 const computed=getSaju(birth);
 if(!computed.pillars.hour)return unresolved('unsupported-clock-policy');
 // Full chart consistency for every supplied pillar; no silent replacement.
 for(const p of POSITIONS)if(saju.pillars[p]!==null&&saju.pillars[p].text!==computed.pillars[p].text)
  throw new SajuError('month-command-chart-mismatch','출생 정보와 원국이 일치하지 않습니다.');
 const interval=intervalFor(birth,computed);
 const hypotheses=sources.flatMap(s=>['literal-days','normalized-30'].map(mode=>{
  const r=resolveCommand(s,interval.elapsedMinutes,interval.durationMinutes,mode);
  const c=r.command;
  return {sourceId:s.id,...r,relationToDay:c?elementRelation(c.element,context.dayMaster.element):null,
   literalHiddenStemMatch:c?.stem?context.month.hiddenStems.some(h=>h.stem===c.stem):null};
 }));
 const elements=[...new Set(hypotheses.filter(h=>h.command).map(h=>h.command.element))];
 return {...meta,status:'diagnostic',interval,hypotheses,availableCommandElements:elements,
  allAvailableElementsAgree:elements.length===1,allHypothesesAvailable:hypotheses.every(h=>h.command!==null)};
}
