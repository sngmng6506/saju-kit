export { SajuError } from './core/error.js';
export { getSaju, getDayPillar, lunarToSolar, solarToLunar, solarTermInstant } from './core/calendar.js';
export { daeunDirection, daeunSu, getDaeun } from './core/daeun.js';
export { branchRelation, getSeun, getYearSignals, getYeokmaBranch } from './core/year-signals.js';
export { analyzeNatalStructure, tenGodForStem, findHiddenStemOccurrences } from './core/natal.js';
export { getHiddenStems, HIDDEN_STEMS_VERSION } from './core/hidden-stems.js';
export { explainYearSignals } from './core/year-explanation.js';
export { getYearTimeline } from './core/year-timeline.js';
export { summarizeMovementSignals, MOVEMENT_INDEX_VERSION } from './core/movement-presentation.js';
export { stemInfo, branchElement, elementRelation } from './core/elements.js';
export { stemCombination, branchPairRelations, analyzeBranchGroups } from './core/relations.js';
export { analyzeCompatibility } from './features/compatibility.js';

export * as movementV6 from './features/movement-v6/index.js';

export { branchRelationsV2, analyzeBranchGroupsV2, EXTENDED_RELATIONS_VERSION } from './core/extended-relations.js';
export { analyzeNatalRelations, analyzeCrossChartRelations } from './core/natal-relations.js';
export { analyzeNatalContext } from './core/natal-context.js';

export { analyzeDayMasterStrength, STRENGTH_POLICY_VERSION } from './features/strength-hybrid-v1/index.js';

export { analyzeElementStructure } from './core/element-structure.js';
export { analyzeOrdinaryStrength, ORDINARY_STRENGTH_POLICY_VERSION } from './features/strength-ordinary-v2/index.js';

export { analyzeInteractionContext } from './core/interaction-context.js';
export { analyzeInteractionSensitivity, INTERACTION_SENSITIVITY_VERSION } from './features/interaction-sensitivity-v1/index.js';

export { lifeStage, analyzeRootDynamics, LIFE_STAGE_VERSION } from './core/root-dynamics.js';

export { analyzeStructuralStrength, STRUCTURAL_STRENGTH_VERSION } from './features/strength-structural-v3/index.js';

export { analyzeQuantitativeStrength, QUANTITATIVE_STRENGTH_VERSION } from './features/strength-quantitative-v3/index.js';

export { analyzeMultiaxisStrength, MULTIAXIS_STRENGTH_VERSION } from './features/strength-multiaxis-v1/index.js';

export { analyzeSupportNetwork } from './core/support-network.js';

export { analyzeMultiaxisStrengthV2, MULTIAXIS_V2_VERSION } from './features/strength-multiaxis-v2/index.js';

export { analyzeResourceAccess, RESOURCE_ACCESS_VERSION } from './features/resource-access-v1/index.js';

export { analyzeRouteBudget, ROUTE_BUDGET_VERSION } from './features/route-budget-v1/index.js';

export { analyzeOutputCapacity, OUTPUT_CAPACITY_VERSION } from './features/output-capacity-v1/index.js';

export { analyzeMultiaxisStrengthV3, MULTIAXIS_V3_VERSION } from './features/strength-multiaxis-v3/index.js';

export { analyzeMultiaxisStrengthV4, MULTIAXIS_V4_VERSION } from './features/strength-multiaxis-v4/index.js';

export { analyzeStrengthDecision, STRENGTH_DECISION_VERSION } from './features/strength-decision-v1/index.js';

export { analyzeFormationEvidence, FORMATION_EVIDENCE_VERSION } from './core/formation-evidence.js';

export { analyzeMonthCommand, monthCommandSources, MONTH_COMMAND_VERSION } from './core/month-command.js';

export { analyzeMonthCommandSensitivity, COMMAND_SENSITIVITY_VERSION } from './features/strength-command-sensitivity-v1/index.js';

export { analyzeBalanceUsefulElement, BALANCE_USEFUL_ELEMENT_VERSION } from './features/balance-useful-element-v1/index.js';

export { analyzeBalancePriority, BALANCE_PRIORITY_VERSION } from './features/balance-priority-v1/index.js';

export { analyzeBalanceRouteReview, BALANCE_ROUTE_REVIEW_VERSION } from './features/balance-route-review-v1/index.js';

export { analyzeClimateUsefulElement, CLIMATE_USEFUL_ELEMENT_VERSION } from './features/climate-useful-element-v1/index.js';
export { analyzeMediationUsefulElement, MEDIATION_USEFUL_ELEMENT_VERSION } from './features/mediation-useful-element-v1/index.js';
export { analyzeRemedyEvidence, REMEDY_EVIDENCE_VERSION } from './features/remedy-evidence-v1/index.js';
export { analyzeUsefulElementReview, USEFUL_ELEMENT_REVIEW_VERSION } from './features/useful-element-review-v1/index.js';

export { analyzeClimateUsefulElementV2, CLIMATE_V2_VERSION } from './features/climate-useful-element-v2/index.js';
export { analyzeUsefulElementAuthority, USEFUL_ELEMENT_AUTHORITY_VERSION } from './features/useful-element-authority-v1/index.js';
export { analyzeUsefulElementTransit, USEFUL_ELEMENT_TRANSIT_VERSION } from './features/useful-element-transit-v1/index.js';

export { analyzeClimateUsefulElementV3, CLIMATE_V3_VERSION } from './features/climate-useful-element-v3/index.js';
export { analyzeUsefulElementAuthorityV2, USEFUL_ELEMENT_AUTHORITY_V2_VERSION } from './features/useful-element-authority-v2/index.js';
export { analyzeUsefulElementTransitV2, USEFUL_ELEMENT_TRANSIT_V2_VERSION } from './features/useful-element-transit-v2/index.js';

export { analyzeClimateUsefulElementV4, CLIMATE_V4_VERSION } from './features/climate-useful-element-v4/index.js';

export { analyzeClimateUsefulElementV5, CLIMATE_V5_VERSION } from './features/climate-useful-element-v5/index.js';

export { analyzeUsefulElementAuthorityV3, USEFUL_ELEMENT_AUTHORITY_V3_VERSION } from './features/useful-element-authority-v3/index.js';
export { analyzeUsefulElementTransitV3, USEFUL_ELEMENT_TRANSIT_V3_VERSION } from './features/useful-element-transit-v3/index.js';

export { analyzePatternUsefulElement, PATTERN_USEFUL_ELEMENT_VERSION } from './features/pattern-useful-element-v1/index.js';

export { analyzePatternUsefulElementV2, PATTERN_V2_VERSION } from './features/pattern-useful-element-v2/index.js';

export { analyzePatternUsefulElementV3, PATTERN_V3_VERSION } from './features/pattern-useful-element-v3/index.js';

export { analyzeUsefulElementAuthorityV4, USEFUL_ELEMENT_AUTHORITY_V4_VERSION } from './features/useful-element-authority-v4/index.js';
export { analyzeUsefulElementTransitV4, USEFUL_ELEMENT_TRANSIT_V4_VERSION } from './features/useful-element-transit-v4/index.js';

export { analyzePatternUsefulElementV4, PATTERN_V4_VERSION } from './features/pattern-useful-element-v4/index.js';

export { analyzePatternUsefulElementV5, PATTERN_V5_VERSION } from './features/pattern-useful-element-v5/index.js';

export { analyzePatternUsefulElementV6, PATTERN_V6_VERSION } from './features/pattern-useful-element-v6/index.js';

export { analyzePatternUsefulElementV7, PATTERN_V7_VERSION } from './features/pattern-useful-element-v7/index.js';

export { analyzePatternUsefulElementV8, PATTERN_V8_VERSION } from './features/pattern-useful-element-v8/index.js';

export { analyzeStemForceEvidence, STEM_FORCE_VERSION } from './core/stem-force.js';
export { analyzePatternUsefulElementV9, PATTERN_V9_VERSION } from './features/pattern-useful-element-v9/index.js';

export { observeRelativeForce, RELATIVE_FORCE_VERSION } from './core/relative-force.js';
export { analyzePatternUsefulElementV10, PATTERN_V10_VERSION } from './features/pattern-useful-element-v10/index.js';

export { analyzePatternOutcome, PATTERN_OUTCOME_VERSION } from './features/pattern/outcome-review.js';

export { analyzePatternOutcomeV2, PATTERN_OUTCOME_V2_VERSION } from './features/pattern/outcome-review-v2.js';

export { analyzePatternOutcomeV3, PATTERN_OUTCOME_V3_VERSION } from './features/pattern/outcome-review-v3.js';

export { analyzePatternOutcomeV4, PATTERN_OUTCOME_V4_VERSION } from './features/pattern/outcome-review-v4.js';

export { analyzePatternOutcomeV5, PATTERN_OUTCOME_V5_VERSION } from './features/pattern/outcome-review-v5.js';
