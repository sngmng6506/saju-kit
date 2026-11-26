// Semantic review targets, not inference rules. These are actor-local,
// natal-scope propositions and are not equivalent to a strength verdict.
const entries=[
 ['deep-root-available','Deep and usable direct-root support of this actor.','Root presence, grade, or day strength alone is not sufficient.'],
 ['control-exceeds-support','Incoming control exceeds this actor\'s available support.','Literal control, controller count, or a weak verdict alone is not sufficient.'],
 ['drain-exceeds-support','Outgoing generation drains more than this actor\'s replenishment can bear.','Output relation, output count, or a weak verdict alone is not sufficient.'],
 ['wealth-demand-exceeds-support','The wealth demand exceeds this actor\'s ability to bear it.','Wealth abundance, an outgoing control relation, or a weak verdict alone is not sufficient.'],
 ['indirect-support-sufficient','Incoming resource/peer support from another origin is sufficient to sustain this actor.','A path, shared root, or a not-weak/strong verdict alone is not sufficient.']
];
export const strengthGuardDefinitions=Object.freeze(entries.map(([id,proposition,nonEquivalent])=>Object.freeze({id,proposition,nonEquivalent,scope:'natal-visible-actor',authority:'review-only'})));
export const strengthGuardIds=Object.freeze(strengthGuardDefinitions.map(g=>g.id));
export const strengthGuardPropositionId=(actorId,guard)=>JSON.stringify(['strength-guard',actorId,guard]);
