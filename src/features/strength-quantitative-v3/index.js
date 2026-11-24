import { SajuError } from '../../core/error.js';
import { validateNatalPillars } from '../../core/natal.js';
import { analyzeElementStructure } from '../../core/element-structure.js';
import { hourPillar } from '../../core/calendar.js';
import { HIDDEN_STEMS_VERSION } from '../../core/hidden-stems.js';
import { classifyElement, CATEGORIES } from '../strength-hybrid-v1/evidence.js';

export const QUANTITATIVE_STRENGTH_VERSION='strength-quantitative-v3';
const POSITIONS=['year','month','day','hour'];
const SLOTS=['yearStem','yearBranch','monthStem','monthBranch','dayBranch','hourStem','hourBranch'];
const WEIGHTS={
  balanced:[10,10,15,20,20,10,15],
  'day-local':[5,8,15,20,27,10,15],
  'month-heavy':[5,9,10,30,21,10,15],
};
const ROLES={
  balanced:{three:{principal:60,middle:30,residual:10},two:{principal:80,residual:20}},
  distributed:{three:{principal:50,middle:30,residual:20},two:{principal:70,residual:30}},
};
const ROOTS={
  mild:{none:80,residual:85,middle:95,principal:100,distanceCost:3},
  pronounced:{none:55,residual:65,middle:85,principal:100,distanceCost:5},
};
// 旺相休囚死 ordering; amplitudes are experimental, not classical constants.
const SEASON={
  mild:{peer:120,output:110,resource:100,officer:90,wealth:80},
  pronounced:{peer:140,output:120,resource:100,officer:80,wealth:60},
};
const SEASON_ELEMENT={spring:'wood',summer:'fire',autumn:'metal',winter:'water'};
const THRESHOLDS=[[40,60],[35,65],[45,55]];
const round=x=>Math.round(x*100)/100;

function evidence(saju){
  const s=analyzeElementStructure({saju}),slots=new Map();
  for(const profile of s.profiles){
    for(const v of profile.visible){
      if(v.position==='day')continue;
      slots.set(v.position+'Stem',{element:profile.element,matches:v.matches.map(m=>({position:m.position,role:m.role}))});
    }
    for(const root of profile.roots){
      const key=root.position+'Branch';
      if(!slots.has(key))slots.set(key,{hidden:[]});
      slots.get(key).hidden.push(...root.matches.map(m=>({element:profile.element,role:m.role})));
    }
  }
  const season=SEASON_ELEMENT[s.month.season],principal=s.month.principalElement;
  return {day:s.dayMaster.element,slots,seasonBases:season===principal?[{id:'season',element:season}]:
    [{id:'season',element:season},{id:'month-principal',element:principal}]};
}

function rootFactor(entry,position,profile){
  return Math.max(profile.none,...entry.matches.map(m=>profile[m.role]-
    profile.distanceCost*Math.abs(POSITIONS.indexOf(position)-POSITIONS.indexOf(m.position))));
}

function compute(e,positionProfile,roleProfile,rootProfile,seasonProfile,basis){
  const mass=Object.fromEntries(CATEGORIES.map(c=>[c,0])),contributions=[];
  const weights=WEIGHTS[positionProfile],roles=ROLES[roleProfile],roots=ROOTS[rootProfile],season=SEASON[seasonProfile];
  function add(slot,element,role,share,root,weight){
    const seasonal=season[classifyElement(basis.element,element)],category=classifyElement(e.day,element);
    const units=weight*share*root*seasonal;
    mass[category]+=units;
    contributions.push({slot,element,role,category,weight,share,rootFactor:root,seasonFactor:seasonal,units});
  }
  for(const [i,slot] of SLOTS.entries()){
    const entry=e.slots.get(slot),weight=weights[i];
    if(entry.hidden){
      const allocation=entry.hidden.length===3?roles.three:roles.two;
      for(const h of entry.hidden)add(slot,h.element,h.role,allocation[h.role],100,weight);
    }else{
      const position=slot.slice(0,-4);
      add(slot,entry.element,null,100,rootFactor(entry,position,roots),weight);
    }
  }
  const total=Object.values(mass).reduce((a,b)=>a+b,0),support=mass.peer+mass.resource;
  return {positionProfile,roleProfile,rootProfile,seasonProfile,seasonBasis:basis.id,seasonElement:basis.element,
    supportUnits:support,totalUnits:total,index:round(100*support/total),
    categories:Object.fromEntries(CATEGORIES.map(c=>[c,round(100*mass[c]/total)])),mass,contributions};
}

function scenariosFor(saju){
  const e=evidence(saju),rows=[];
  for(const position of Object.keys(WEIGHTS))for(const role of Object.keys(ROLES))
    for(const root of Object.keys(ROOTS))for(const season of Object.keys(SEASON))for(const basis of e.seasonBases)
      rows.push(compute(e,position,role,root,season,basis));
  return rows;
}
// Totals are <= 140,000,000. Use BigInt for exact cross-product ordering.
function compare(a,b){
  const d=BigInt(a.supportUnits)*BigInt(b.totalUnits)-BigInt(b.supportUnits)*BigInt(a.totalUnits);
  return d<0n?-1:d>0n?1:0;
}
function summarize(rows){
  const min=rows.reduce((a,b)=>compare(a,b)<=0?a:b),max=rows.reduce((a,b)=>compare(a,b)>=0?a:b);
  const thresholdSensitivity=THRESHOLDS.map(([weak,strong])=>({weak,strong,
    direction:100*min.supportUnits>=strong*min.totalUnits?'strong':
      100*max.supportUnits<=weak*max.totalUnits?'weak':null}));
  const stable=thresholdSensitivity.every(r=>r.direction===thresholdSensitivity[0].direction)?thresholdSensitivity[0].direction:null;
  return {min:min.index,max:max.index,thresholdSensitivity,stableDirection:stable};
}

/** Standalone quantitative hypothesis, not final strength or probability. */
export function analyzeQuantitativeStrength(input){
  if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('strength-input','강약 분석 입력 객체가 필요합니다.');
  const {saju,policy,birthBasis}=input;
  if(policy!==QUANTITATIVE_STRENGTH_VERSION)throw new SajuError('strength-policy','정량 강약 정책을 명시해야 합니다.');
  if(!['verified-chart','provisional-chart'].includes(birthBasis))throw new SajuError('strength-birth-basis','원국 확정 여부를 명시해야 합니다.');
  const pillars=validateNatalPillars(saju),completeHour=pillars.hour!==null;
  const meta={version:QUANTITATIVE_STRENGTH_VERSION,hiddenStemsBasis:HIDDEN_STEMS_VERSION,completeHour,
    scope:'ordinary-chart-assumption',specialPatternAssessment:'not-assessed',assessment:'experimental-quantitative-only'};
  if(birthBasis==='provisional-chart')return {...meta,status:'provisional',direction:null,quantitative:null,caveats:['provisional-chart']};
  const caveats=['effective-interaction-unmodeled','weights-unvalidated','month-command-unresolved'];
  if(!completeHour){
    // Missing hour can also change the anchoring of the other visible stems.
    const completions=Array.from({length:12},(_,i)=>hourPillar(pillars.day.stem,i*2));
    const rows=completions.flatMap(hour=>scenariosFor({pillars:{...pillars,hour}}));
    return {...meta,status:'partial',direction:null,quantitative:{...summarize(rows),stableDirection:null,
      baseline:null,scenarios:[],scenarioCount:rows.length,completionCount:12,rangeBasis:'fixed-year-month-day-hour-completions'},
      caveats:[...caveats,'missing-hour']};
  }
  const scenarios=scenariosFor(saju),summary=summarize(scenarios);
  return {...meta,status:summary.stableDirection?'hypothesis':'unresolved',direction:summary.stableDirection,
    quantitative:{...summary,baseline:scenarios[0],scenarios,scenarioCount:scenarios.length,completionCount:1,
      rangeBasis:'profile-sensitivity'},caveats};
}
