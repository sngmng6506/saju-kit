// Evaluation-only mapping overlay; never imported by the engine.
// The historical labels and expected roles in the V1 fixture stay frozen.
export const OUTCOME_V2_MAPPINGS=Object.freeze({
 'branch-assembly-threat':'officer-branch-output-damage',
 'branch-assembly-rescue':'officer-branch-resource-rescue',
 'hidden-controller-access':'blade-hidden-controller-damage',
 'hidden-controller-combination':'blade-hidden-controller-combine-output'
});
export function mapOutcomeReferenceV2(row){
 return {...row,probes:row.probes.map(p=>({...p,ruleId:p.ruleId??OUTCOME_V2_MAPPINGS[p.gap]??null}))};
}
