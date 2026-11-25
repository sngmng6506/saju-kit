import {mapOutcomeReferenceV5} from './pattern-outcome-v5-mapping.mjs';
export function mapOutcomeReferenceV6(row){
 const v5=mapOutcomeReferenceV5(row);
 return {...v5,probes:v5.probes.map(p=>({...p,ruleId:p.ruleId??(row.family==='hurting-officer'&&p.gap==='metal-water-exception'?'hurting-winter-metal-water-officer-exception':null)}))};
}
