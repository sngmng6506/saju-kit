# Seasonal mass ablation
Frozen source 9e54b5109f3820574ada63a6e030833b10d84f18. In an isolated source copy replace exactly the quantitative-v3 seasonal factor lookup with 100. Keep monthly position weights, hidden-stem allocation, root factors, seasonal reference identifiers and all downstream decision rules unchanged. Recompute every contribution and route allocation; no runtime policy changes. Duplicate neutral rows retained to preserve paired profiles. This tests the explicit seasonal multiplier only, not removal of all month information.

| Policy | Original agree/disagree/abstain | Neutral agree/disagree/abstain |
| --- | --- | --- |
| quantitative v3 |26/3/35|24/2/38|
| multiaxis v2 |33/0/31|34/0/30|
| multiaxis v3 |33/0/31|34/0/30|

96 charts, 64 directional references, 2712 neutral quantitative scenarios checked against exact product formula. Multiaxis v3 changes XU12 weak to abstain, XU28 and R07 abstain to strong (both strong labels), DW03 weak to abstain (review-required, excluded). Wei corpus direction unchanged. Quantitative v3 loses two agreements and one disagreement. No evidence for universally beneficial seasonal removal. Development data only; retain seasonal policy as baseline. Do not combine this change with weak-veto removal without evaluating interaction. Next compare the four combinations (seasonal/neutral × veto/removed) and validate selected policy on independently reviewed unseen charts.

Actual source executed in two isolated V8 module graphs, with unused calendar helper stubbed for complete pillars. Native reproduction script copies src to a temporary directory, applies exact guarded substitution and cleans up; native script/test not executed here.
Run `node scripts/evaluate-seasonal-ablation.mjs` or `node --test test/seasonal-ablation.test.mjs`.
