# Multi-axis strength v2 (experimental)

Additive policy `analyzeMultiaxisStrengthV2({saju,policy:'strength-multiaxis-v2',birthBasis:'verified-chart'})`. Reuse frozen [v1](strength-multiaxis-v1.md) axes and [support network](support-network-v1.md). Existing validation, partial/provisional behavior and numeric axes remain unchanged. Output includes baselinePolicy, baselineDirection and decision (null for partial/provisional); inherited detail describes the v1 baseline, not the new decision. Top-level direction/status describe v2. No actual cancellation, special patterns, final strength degree or yongsin inferred.

## Rules
Keep v1 directional grounds. Add strong ground when at least one anchored resource node has a local generation edge to day stem and no observed local anchored wealth control, minimum root capacity >0, and external support strictly exceeds every individual burden in every environment scenario. “Unchallenged” is only absence of this specific observed exposure, not immunity. Add conflict to strong grounds if any burden category individually exceeds external support in every scenario and occupies at least two principal branch nodes. Add conflict to weak grounds when unchallenged local resource exists. Opposing grounds also conflict. Any conflict or absence of grounds produces null direction. Retain local anchored chains as evidence only. Counts and thresholds are engineering hypotheses, not classical sufficient conditions. No path sums or modified masses. Special patterns out of scope.

## Development evaluation
Actual source executed in V8 adapter. Four new test cases checked, including W24 conflict, W01 support, W22 challenged resources, partial/provisional and policy validation. 64 Tokyo calendar inputs (same sample as v1) retain identical axes; 16 partial, 36 unresolved, 9 strong, 3 weak. All 83 textual inputs evaluated using actual feature sources (unused calendar helper stubbed for full-pillar inputs only). Native Node suite not run.

| Corpus | Directional n | v1 agree/disagree/abstain | v2 agree/disagree/abstain |
| --- | ---: | --- | --- |
| Xu | 27 | 17/0/10 | 15/0/12 |
| Wei | 23 | 11/1/11 | 13/0/10 |
| Ditiansui ordinary | 4 | 0/0/4 | 0/0/4 |

W01/W02/W20 change unresolved to strong, W24 false strong becomes unresolved, W10 correct weak becomes unresolved. XU07/XU24 correct weak become unresolved. XU04 disputed reference changes to strong and W13 balanced description changes strong to unresolved; neither is scored. Excluded extreme chapter remains outside metrics. Total 28 agreements unchanged, false direction 1→0, abstentions 25→26. No general accuracy improvement established. All three sets are now development evidence; no independent evaluation for v2. Next obtain unseen ordinary examples and assess whether resource exposure and pressure conflicts are sufficient, rather than relaxing gates to fit known charts. No consumer migration.

Reproduce with `node --test test/strength-multiaxis-v2.test.mjs test/multiaxis-v2-reference.test.mjs`.

## Unseen-chart comparison
See [Ran/Yuan references](ordinary-ran-yuan-reference-v1.md). V2 agrees on five of ten directional cases, no opposite direction, five abstentions. No rule changes.
