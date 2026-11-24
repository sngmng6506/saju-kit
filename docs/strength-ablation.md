# Decision ablation: multiaxis v3

Frozen engine: b0f1aebd1343ca94090da1f6883661ce55b0830a. Development corpus: 96 charts, 64 directional labels. Eight single-condition variants and baseline. The diagnostic script reconstructs v2 grounds/conflicts and adds v3 route ground, asserts baseline parity for every chart. No runtime policy changed. Removing the wealth exposure gate affects both the v2 resource ground and weak veto; removing root minimum affects strong root and both resource grounds, not weak upper bound. Removing output control substitutes nominal output for residual only in the route decision; it is not a full allocation-model ablation. Route-ground removal measures decision contribution, not performance or graph correctness.

| Variant | Agree | Disagree | Abstain |
|---|---:|---:|---:|
| baseline |33|0|31|
| without-route-ground |33|0|31|
| without-central-root-ground |21|0|43|
| without-root-minimum |33|2|29|
| without-wealth-exposure-gate |31|0|33|
| without-concentrated-pressure-veto |33|2|29|
| without-resource-weak-veto |36|0|28|
| without-output-control |33|0|31|
| without-conditional-resource-gate |33|0|31|

## Findings
Central root ground has unique contribution to 12 correct labels. Removing minimum root gates produces R02 and DH02 false strong. Removing concentrated pressure veto produces W24 and Y01 false strong. Removing wealth exposure gate adds correct XU09 but loses correct XU12, XU13 and W22; XU05 balanced and DW01 review-required change to strong (excluded from binary metrics). Removing resource weak veto restores XU07, XU24, W10 weak (W10 is explicitly formation-dependent). No other chart changes under that variant. Route ground, output control in route decision and positive conditional resource gate each have zero direction changes across all 96 records. Not proof of global redundancy. The alternative policy should be evaluated on unseen independently reviewed cases, especially weak charts with strong resource paths. Do not claim improved population accuracy. Keep graph APIs, do not migrate consumers.

## Reproduction
`node scripts/evaluate-strength-ablation.mjs` and `node --test test/strength-ablation.test.mjs`.
Actual feature modules and equivalent decision function executed via V8 adapter per corpus; baseline parity verified. Unused calendar helper stubbed for full pillars; native runner and snapshot test not yet executed. Seasonal weighting ablation requires recomputation of all downstream masses, not removal of a decision gate; not included in this experiment.

## Seasonal multiplier follow-up
[Seasonal mass ablation](seasonal-ablation.md) recomputes all downstream masses; runtime policy unchanged.
