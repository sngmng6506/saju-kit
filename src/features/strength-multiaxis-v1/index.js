import { SajuError } from '../../core/error.js';
import { validateNatalPillars } from '../../core/natal.js';
import { hourPillar } from '../../core/calendar.js';
import { analyzeRootDynamics } from '../../core/root-dynamics.js';
import { analyzeQuantitativeStrength } from '../strength-quantitative-v3/index.js';
import { classifyElement, isSupport } from '../strength-hybrid-v1/evidence.js';

export const MULTIAXIS_STRENGTH_VERSION='strength-multiaxis-v1';
const ROOT_PROFILES=[
  {id:'month-day',position:{year:15,month:30,day:35,hour:20},role:{principal:100,middle:65,residual:25}},
  {id:'day-local',position:{year:10,month:25,day:40,hour:25},role:{principal:100,middle:50,residual:20}},
];
const BURDENS=['output','wealth','officer'];
const range=values=>({min:Math.min(...values),max:Math.max(...values)});
const anchored=n=>n.layer==='stem'?n.rooted:n.role==='principal';

function roots(dynamics){
  const observations=dynamics.roots.find(r=>r.position==='day').positions;
  const profiles=ROOT_PROFILES.map(p=>{
    const contributions=observations.map(r=>({position:r.position,role:r.strongestRole,
      units:p.position[r.position]*(p.role[r.strongestRole]??0)}));
    return {id:p.id,units:contributions.reduce((n,c)=>n+c.units,0),contributions};
  });
  return {observations,profiles,range:range(profiles.map(p=>p.units/100)),
    centralPrincipal:observations.filter(r=>['month','day'].includes(r.position)&&r.strongestRole==='principal').map(r=>r.position)};
}

function environment(scenarios){
  // Preserve raw nominal mass, rather than divide by total chart mass.
  // Peer hidden stems belong to root evidence; do not count them as external support.
  return scenarios.map(s=>{
    const mass={peerRoot:0,peerStem:0,resource:0,output:0,wealth:0,officer:0};
    for(const c of s.contributions){
      const key=c.category==='peer'?(c.role===null?'peerStem':'peerRoot'):c.category;
      mass[key]+=c.units;
    }
    const support=mass.peerStem+mass.resource;
    const maxPressure=Math.max(...BURDENS.map(k=>mass[k]));
    return {profile:{position:s.positionProfile,role:s.roleProfile,root:s.rootProfile,
      season:s.seasonProfile,basis:s.seasonBasis},mass,support,maxPressure,
      pressureDominates:maxPressure>support};
  });
}

function interactions(dynamics){
  const nodes=new Map(dynamics.nodes.map(n=>[n.id,n]));
  const paths=dynamics.paths.filter(p=>p.target==='day:stem'&&p.local&&anchored(nodes.get(p.threat))&&anchored(nodes.get(p.via)));
  // Group alternatives by actual threat; never count multiple paths as independent force.
  return [...new Set(paths.map(p=>p.threat))].map(threat=>({threat,alternatives:paths.filter(p=>p.threat===threat)
    .map(p=>({type:p.type,via:p.via})),confirmed:false}));
}

function directionFor(root,centralBurden,rows){
  const strong=root.range.min>=40&&root.centralPrincipal.length>0;
  const weak=root.range.max<=20&&centralBurden.length>0&&rows.every(r=>r.pressureDominates);
  // Central principal rooting already excludes two adverse central principal branches.
  // The strong hypothesis tests capacity independently of external pressure.
  return {direction:strong?'strong':weak?'weak':null,
    grounds:[...(strong?['central-root-capacity']:[]),...(weak?['low-root-capacity-and-dominant-pressure']:[])]};
}

function complete(saju,context){
  const dynamics=analyzeRootDynamics({saju}),root=roots(dynamics);
  const q=analyzeQuantitativeStrength({saju,policy:'strength-quantitative-v3',birthBasis:'verified-chart'},context).quantitative;
  const rows=environment(q.scenarios);
  const centralBurden=dynamics.vertical.filter(v=>['month','day'].includes(v.position)&&
    !isSupport(classifyElement(dynamics.dayMaster.element,v.principalElement))).map(v=>v.position);
  const decision=directionFor(root,centralBurden,rows);
  return {root,environment:{scenarios:rows,centralBurden},interactions:interactions(dynamics),...decision};
}

function summarize(results){
  const rows=results.flatMap(r=>r.environment.scenarios);
  const nominal=units=>units/1000000;
  return {rootCapacity:range(results.flatMap(r=>[r.root.range.min,r.root.range.max])),
    externalSupport:range(rows.map(r=>nominal(r.support))),
    pressure:Object.fromEntries(BURDENS.map(k=>[k,range(rows.map(r=>nominal(r.mass[k])))])),
    scenarioCount:rows.length};
}

/** Experimental independent axes and explicit directional hypothesis, not a final classification. */
export function analyzeMultiaxisStrength(input,context){
  if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('strength-input','강약 분석 입력 객체가 필요합니다.');
  const {saju,policy,birthBasis}=input;
  if(policy!==MULTIAXIS_STRENGTH_VERSION)throw new SajuError('strength-policy','다축 강약 정책을 명시해야 합니다.');
  if(!['verified-chart','provisional-chart'].includes(birthBasis))throw new SajuError('strength-birth-basis','원국 확정 여부를 명시해야 합니다.');
  const pillars=validateNatalPillars(saju),completeHour=pillars.hour!==null;
  const meta={version:MULTIAXIS_STRENGTH_VERSION,completeHour,scope:'ordinary-chart-assumption',
    assessment:'experimental-multiaxis',specialPatternAssessment:'not-assessed',interactionAssessment:'observed-only'};
  if(birthBasis==='provisional-chart')return {...meta,status:'provisional',direction:null,axes:null,detail:null,caveats:['provisional-chart']};
  const caveats=['weights-unvalidated','month-command-unresolved','effective-interaction-unmodeled'];
  if(!completeHour){
    const results=Array.from({length:12},(_,i)=>complete({pillars:{...pillars,hour:hourPillar(pillars.day.stem,i*2)}},context));
    return {...meta,status:'partial',direction:null,axes:summarize(results),detail:null,completionCount:12,caveats:[...caveats,'missing-hour']};
  }
  const detail=complete(saju,context);
  return {...meta,status:detail.direction?'hypothesis':'unresolved',direction:detail.direction,
    axes:summarize([detail]),detail,completionCount:1,caveats};
}
