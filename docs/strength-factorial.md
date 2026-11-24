# Seasonal multiplier × resource weak-veto factorial experiment

Frozen source: 28a0e0a99d6cb12eb0fca3719a016270c314bb38. Four isolated module graphs. A: unchanged; B: remove exactly local-resource-versus-weak conflict insertion in v2; C: neutralize seasonal multiplier to 100; D: both. Keep all other gates, monthly weights, hidden stems, root factors and route recomputation. No runtime change.

| Group | Agreement | Disagreement | Abstain |
| --- | ---: | ---: | ---: |
| A |33|0|31|
| B |36|0|28|
| C |34|0|30|
| D |37|0|27|

96 charts, 64 directional labels. Agreement interaction contrast D-C-B+A = 0 cases. Veto removal restores XU07, XU24, W10 to weak with either seasonal setting. Neutralization loses XU12 weak agreement and restores XU28/R07 strong agreement with either veto setting. DW03 (review-required) changes weak to abstention with neutralization; excluded from metrics. No interaction in observed direction changes; no claim of general independence. W10 is formation-dependent. All charts are development data, not independent evaluation. D has highest development coverage (57.8125%) but loses an existing agreement; B improves coverage (56.25%) without losing a baseline direction on this set. Prefer B as conservative candidate for independent validation; retain A as runtime baseline. No claim of predictive accuracy.

Actual feature sources evaluated in four isolated V8 module graphs with guarded substitutions, unused calendar helper stubbed for complete pillars. Native reproduction scripts and snapshot test authored, not run natively.
Run `node scripts/evaluate-strength-factorial.mjs` or `node --test test/strength-factorial.test.mjs`.
