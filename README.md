# saju-kit

Dependency-free ESM library for Korean Four Pillars calendar calculations and descriptive traditional signals. Product scoring, localized content, social maps and payment belong to consumers.

## Usage

```js
import { getDayPillar, getSaju, analyzeCompatibility } from 'saju-kit';
const left = getDayPillar({ y: 2000, m: 2, d: 4 });
const right = getDayPillar({ y: 2001, m: 1, d: 1 });
const result = analyzeCompatibility({ left, right, scope: 'day' });
```

- `getDayPillar`: Gregorian civil date, 1900–2100 inclusive, midnight date convention, no birth-time or solar-term dependency. It is a date-only classification, not a complete natal chart or a ruling about late Zi-hour.
- `getSaju`: existing Korean default unchanged. Explicit `timezone: 'Asia/Tokyo'` supports Gregorian dates 1970–2100 under UTC+9; earlier Japanese historical clock and Japanese lunisolar calendar are unsupported. Returned lunar conversion uses existing Korean calendar data. Unknown time on a solar-term date and 23:00 still reject for full-chart calculation. For Japanese day-only results use getDayPillar.
- `stemInfo`, `branchElement`, `elementRelation`: neutral element correspondences; direction is relative to arguments.
- `stemCombination`, `branchPairRelations`, `analyzeBranchGroups`: traditional correspondences, never confirmed transformation. Three-harmony/seasonal two-member matches are candidates only. Cardinal membership is metadata, not a verdict. 午未 associated element is left unresolved because interpretations differ.
- `analyzeCompatibility`: accepts two existing Korean-keyed pillar objects (stem, branch, text). Day scope only, neutral typed signals, no scores. Localize labels outside the engine. Full natal compatibility and transformation judgments not supported.
- `getDaeun`: pass birth.timezone consistently if using Tokyo; existing age convention remains Korean.

## Distribution

Install a fixed Git commit after reviewing source and data licensing; npm publication intentionally disabled (`private: true`). The version is an internal API baseline, not a released npm package. No runtime dependencies. `npm test` runs all regression tests without installing runtime dependencies.

Existing design and sources: [DESIGN.md](DESIGN.md), [NATAL_METHOD.md](NATAL_METHOD.md), [MOVE_RULES.md](MOVE_RULES.md). No scientific prediction claims.

## Versioned movement policy

`movementV6` exposes the existing rent-or-buy-kr minute-based daeun, annual/decadal movement signals, v6 scores and timeline highlights without changing the legacy root API. See [movement contract](docs/movement-v6.md).

## Extended natal observations

Opt in to `branchRelationsV2`, `analyzeBranchGroupsV2`, `analyzeNatalRelations`, `analyzeCrossChartRelations` and `analyzeNatalContext`. The [contract](docs/extended-natal.md) distinguishes observed traditional structures from strength, compatibility scoring or event predictions. Existing APIs are unchanged.

## Experimental day-master strength

[Hybrid strength policy proposal](docs/strength-hybrid-v1.md): traditional structural evidence first, quantitative sensitivity as a cross-check, explicit abstention for incomplete or exceptional charts. The opt-in API is implemented as `analyzeDayMasterStrength({saju, policy:'strength-hybrid-v1', birthBasis:'verified-chart'})`. Existing APIs are unchanged; reference-case validation is pending.

Architecture: [ARCHITECTURE.md](ARCHITECTURE.md).

Classical development-case comparison: [strength reference v1](docs/strength-reference-v1.md). Run `node scripts/evaluate-strength-reference.mjs` to reproduce; this is not empirical validation.

Experimental ordinary-strength v2: `analyzeElementStructure({saju})` and `analyzeOrdinaryStrength({saju, policy:'strength-ordinary-v2', birthBasis:'verified-chart'})`. [Contract](docs/strength-ordinary-v2.md). Special-pattern interpretation is out of scope; not production-ready.

Interaction diagnostics: `analyzeInteractionContext({saju})`, `analyzeInteractionSensitivity({saju, policy:'interaction-sensitivity-v1', birthBasis:'verified-chart'})`. See [contract](docs/interaction-sensitivity-v1.md); hypothetical effects only, no baseline policy changes.

New ordinary-strength reference comparison (Xu commentary): [ordinary-reference-v1](docs/ordinary-reference-v1.md). Reproduce with `node scripts/evaluate-ordinary-reference.mjs`; frozen policies unchanged.

Root-quality diagnostics: `lifeStage(stem, branch)` and `analyzeRootDynamics({saju})`. [Contract](docs/root-dynamics-v1.md). Neutral observations only; no strength changes.

Experimental qualitative v3: `analyzeStructuralStrength({saju,policy:'strength-structural-v3',birthBasis:'verified-chart'})`. [Contract and development comparison](docs/strength-structural-v3.md). Not a final strength classifier.

Experimental quantitative v3: `analyzeQuantitativeStrength({saju,policy:'strength-quantitative-v3',birthBasis:'verified-chart'})`. [Model and development comparison](docs/strength-quantitative-v3.md); not a validated replacement.

Experimental multi-axis strength: `analyzeMultiaxisStrength({saju,policy:'strength-multiaxis-v1',birthBasis:'verified-chart'})`. [Model and comparison](docs/strength-multiaxis-v1.md).

New-source strength comparison: [Wei ordinary references v1](docs/ordinary-wei-reference-v1.md), including a counterexample to the multiaxis root-first rule.

[Support network v1](docs/support-network-v1.md): neutral resource and burden interaction observations.

[Multi-axis strength v2](docs/strength-multiaxis-v2.md): experimental pressure and resource-aware decision policy.

[Resource access v1](docs/resource-access-v1.md): experimental local resource exposure diagnostics.

[Route budget v1](docs/route-budget-v1.md): experimental competing-route allocation diagnostics.

[Output capacity v1](docs/output-capacity-v1.md): experimental target-bounded output diagnostics.

[Integrated multiaxis v3](docs/strength-multiaxis-v3.md): experimental explanation policy; no demonstrated classification gain.

[Strength decision ablation](docs/strength-ablation.md): frozen development comparison.

## Experimental useful-element reviews

```js
import { getSaju, analyzeUsefulElementReview } from 'saju-kit';
const saju = getSaju({ y: 2026, m: 2, d: 9, hh: 12, mm: 0 });
const review = analyzeUsefulElementReview({
  saju, birthBasis: 'verified-chart', policy: 'useful-element-review-v1'
});
```

The opt-in review preserves separate balance, climate, mediation and disease/remedy hypotheses; no final 用神/喜忌, special-pattern or event judgment. The climate source table covers only 11 of 120 stem-month cells; unsupported cells remain unresolved. Partial/provisional inputs have restricted evidence. See [method contracts and evaluation](docs/useful-element-review.md), [balance candidates](docs/balance-useful-element.md), [balance priority diagnostics](docs/balance-priority.md), and [balance route review](docs/balance-route-review.md). New research APIs do not change any movement or existing strength policy.
