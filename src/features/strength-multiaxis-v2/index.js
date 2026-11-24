import { SajuError } from '../../core/error.js';
import { analyzeSupportNetwork } from '../../core/support-network.js';
import { analyzeMultiaxisStrength } from '../strength-multiaxis-v1/index.js';

export const MULTIAXIS_V2_VERSION='strength-multiaxis-v2';
const categories=['output','wealth','officer'];

export function assessNetwork(base,network){
 const nodes=new Map(network.nodes.map(n=>[n.id,n]));
 const resources=network.resources.filter(n=>n.anchored&&n.supply.local);
 const unchallenged=resources.filter(n=>!n.localAnchoredWealth.length);
 const principal=Object.fromEntries(categories.map(c=>[c,network.burdens[c].filter(n=>nodes.get(n.id).layer==='branch'&&n.anchored).map(n=>n.id)]));
 const rows=base.detail.environment.scenarios;
 const dominant=categories.filter(c=>rows.every(r=>r.mass[c]>r.support));
 const concentrated=dominant.filter(c=>principal[c].length>=2);
 const supportDominates=rows.every(r=>categories.every(c=>r.support>r.mass[c]));
 const grounds=[],conflicts=[];
 if(base.direction==='strong')grounds.push('central-root-capacity');
 if(base.direction==='weak')grounds.push('low-root-capacity-and-dominant-pressure');
 // Require local unchallenged resource AND some literal root; no inferred transfer.
 if(unchallenged.length>=1&&base.axes.rootCapacity.min>0&&supportDominates)
  grounds.push('local-resource-and-robust-support');
 const strong=grounds.some(g=>g!=='low-root-capacity-and-dominant-pressure');
 const weak=grounds.includes('low-root-capacity-and-dominant-pressure');
 if(strong&&concentrated.length)conflicts.push('concentrated-pressure-versus-support');
 if(weak&&unchallenged.length)conflicts.push('local-resource-versus-weak');
 if(strong&&weak)conflicts.push('opposing-grounds');
 return {direction:conflicts.length?null:strong?'strong':weak?'weak':null,grounds,conflicts,
  evidence:{localAnchoredResources:resources.map(n=>n.id),unchallengedResources:unchallenged.map(n=>n.id),
   principalBurdenNodes:principal,dominantBurdenCategories:dominant,concentratedBurdenCategories:concentrated,
   supportDominates,chains:network.chains.filter(c=>c.local&&c.anchoredSource&&c.anchoredIntermediate)}};
}
export function analyzeMultiaxisStrengthV2(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('strength-input','강약 분석 입력 객체가 필요합니다.');
 if(input.policy!==MULTIAXIS_V2_VERSION)throw new SajuError('strength-policy','다축 v2 정책을 명시해야 합니다.');
 const base=analyzeMultiaxisStrength({saju:input.saju,birthBasis:input.birthBasis,policy:'strength-multiaxis-v1'});
 const meta={...base,version:MULTIAXIS_V2_VERSION,baselinePolicy:base.version,baselineDirection:base.direction};
 if(!base.completeHour||base.status==='provisional')return {...meta,decision:null};
 const decision=assessNetwork(base,analyzeSupportNetwork({saju:input.saju}));
 return {...meta,status:decision.direction?'hypothesis':'unresolved',direction:decision.direction,decision};
}
