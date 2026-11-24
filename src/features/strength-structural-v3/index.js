import { SajuError } from '../../core/error.js';
import { validateNatalPillars } from '../../core/natal.js';
import { HIDDEN_STEMS_VERSION } from '../../core/hidden-stems.js';
import { analyzeRootDynamics } from '../../core/root-dynamics.js';
import { classifyElement, isSupport, CATEGORIES } from '../strength-hybrid-v1/evidence.js';

export const STRUCTURAL_STRENGTH_VERSION='strength-structural-v3';
const near=position=>position!=='year';
const substantial=role=>role==='principal'||role==='middle';
const anchored=node=>node.layer==='stem'?node.rooted:node.role==='principal';
const slot=node=>node.position+':'+node.layer;

/** Structural hypotheses, not measured power. Conflicting grounds stay unresolved. */
export function structuralHypothesis(dynamics){
  const day=dynamics.dayMaster.element;
  const category=node=>classifyElement(day,node.element);
  const dayRoots=dynamics.roots.find(r=>r.position==='day').positions.filter(p=>p.matches.length);
  const deep=dayRoots.filter(r=>substantial(r.strongestRole));
  const nearby=deep.filter(r=>near(r.position));
  const principalCentral=deep.filter(r=>['month','day'].includes(r.position)&&r.strongestRole==='principal');
  const seasonalSupport=isSupport(classifyElement(day,dynamics.season.seasonElement));
  const principalSupport=isSupport(classifyElement(day,dynamics.season.monthPrincipalElement));
  const season=seasonalSupport===principalSupport?(seasonalSupport?'supportive':'adverse'):'mixed';
  const nodes=dynamics.nodes.filter(n=>n.id!=='day:stem');
  // Branch peer roots already belong to the root channel.
  const independentSupport=nodes.filter(n=>near(n.position)&&anchored(n)&&isSupport(category(n))&&
    (n.layer==='stem'||category(n)==='resource'));
  const burdens=Object.fromEntries(CATEGORIES.filter(c=>!isSupport(c)).map(c=>{
    const relevant=nodes.filter(n=>category(n)===c&&anchored(n));
    return [c,{rootedStems:relevant.filter(n=>n.layer==='stem').map(n=>n.id),
      principalBranches:relevant.filter(n=>n.layer==='branch').map(n=>n.id)}];
  }));
  const concentrated=Object.entries(burdens).filter(([,b])=>
    (b.rootedStems.length>=2&&b.principalBranches.length>=1)||
    (b.rootedStems.length>=1&&b.principalBranches.length>=2)).map(([c])=>c);
  const byId=new Map(dynamics.nodes.map(n=>[n.id,n]));
  // An anchored path can raise a conflict, but cannot confirm cancellation.
  const paths=dynamics.paths.filter(p=>p.local&&p.target==='day:stem'&&
    anchored(byId.get(p.via))&&anchored(byId.get(p.threat)));
  const strongGrounds=[],weakGrounds=[],conflicts=[];
  if(deep.length>=2&&nearby.length)strongGrounds.push('distributed-substantial-roots');
  if(nearby.length&&season==='supportive'&&independentSupport.length)strongGrounds.push('season-root-support');
  if(principalCentral.length&&independentSupport.length)strongGrounds.push('central-principal-root-support');
  const localBurden=nodes.some(n=>near(n.position)&&anchored(n)&&!isSupport(category(n)));
  if(!deep.length&&season==='adverse'&&localBurden)weakGrounds.push('shallow-or-absent-roots-adverse-season');
  if(!nearby.length&&deep.length<=1&&season==='adverse'&&concentrated.length)weakGrounds.push('remote-root-concentrated-burden');
  if(strongGrounds.length&&concentrated.length)conflicts.push('root-support-versus-concentrated-burden');
  if(weakGrounds.length&&independentSupport.length)conflicts.push('weak-root-versus-local-support');
  if(weakGrounds.length&&dayRoots.length&&paths.length)conflicts.push('weak-root-versus-protection-or-mediation');
  const direction=conflicts.length||Boolean(strongGrounds.length)===Boolean(weakGrounds.length)?null:
    strongGrounds.length?'strong':'weak';
  return {direction,strongGrounds,weakGrounds,conflicts,evidence:{
    dayRootPositions:dayRoots.map(r=>({position:r.position,role:r.strongestRole,stage:r.stage,exposedToClash:r.exposedToClash})),
    substantialRootPositions:deep.map(r=>r.position),nearbyRootPositions:nearby.map(r=>r.position),
    centralPrincipalPositions:principalCentral.map(r=>r.position),
    season,seasonalSupport,principalSupport,independentSupport:independentSupport.map(n=>n.id),
    burdens,concentratedBurdenCategories:concentrated,localAnchoredPaths:paths,
    intermediateSlots:[...new Set(paths.map(p=>slot(byId.get(p.via))))]}};
}

export function analyzeStructuralStrength(input){
  if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('strength-input','강약 분석 입력 객체가 필요합니다.');
  const {saju,policy,birthBasis}=input;
  if(policy!==STRUCTURAL_STRENGTH_VERSION)throw new SajuError('strength-policy','정성 강약 정책을 명시해야 합니다.');
  if(!['verified-chart','provisional-chart'].includes(birthBasis))throw new SajuError('strength-birth-basis','원국 확정 여부를 명시해야 합니다.');
  const pillars=validateNatalPillars(saju),completeHour=pillars.hour!==null;
  const meta={version:STRUCTURAL_STRENGTH_VERSION,hiddenStemsBasis:HIDDEN_STEMS_VERSION,completeHour,
    scope:'ordinary-chart-assumption',specialPatternAssessment:'not-assessed',assessment:'experimental-qualitative-only'};
  if(birthBasis==='provisional-chart')return {...meta,status:'provisional',direction:null,hypothesis:null,caveats:['provisional-chart']};
  const hypothesis=structuralHypothesis(analyzeRootDynamics({saju}));
  const caveats=['effective-interaction-unmodeled','quantitative-cross-check-pending'];
  if(!completeHour)caveats.push('missing-hour');
  return {...meta,status:!completeHour?'partial':hypothesis.direction?'hypothesis':'unresolved',
    direction:completeHour?hypothesis.direction:null,hypothesis,caveats};
}
