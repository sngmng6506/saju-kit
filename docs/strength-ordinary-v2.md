# Ordinary strength v2 (experimental)

## Scope
The user elected to exclude special-pattern interpretation (following, dominant, transformation patterns) from the current product scope. The new policy is conditional on ordinary-chart interpretation; it neither detects nor rules out special patterns. Very strong/weak are degrees on a provisional ordinary support model, not special patterns. V1 remains frozen, including its classical-reference baseline.

## Public APIs
```js
analyzeElementStructure({saju})
analyzeOrdinaryStrength({saju, policy:'strength-ordinary-v2', birthBasis:'verified-chart'})
```
Both accept validated year/month/day pillars and hour pillar or null, using the existing Korean stem/branch contract. The second requires explicit policy and chart basis. Errors: SajuError strength-input/strength-policy/strength-birth-basis and existing pillar errors. Verified-chart means calendar-resolved input, not verified identity or historical birth data. Provisional returns no analysis; partial returns observations and a quantitative range but no category. No birth-date or arbitrary metadata echoed.

Core structure returns all five elemental profiles: visible stems, exact/same-element hidden-stem matches, rooted visible stems (principal or middle match), root positions and highest role at each position, principal positions. Includes day stem as an observation. Each position counts once per element. Different elements can occur in a single branch's hidden stems. Edges are directed generating/controlling relations between present elements; mediation is a possible two-step generating path between a controlling pair. No implication of operative 통관 or force transfer. Formation candidates, complete groups and clashes retain actual positions and affected roots. Root exposure is not root destruction. A pair candidate remains a candidate even if a complete group is also present; these observations are not additive points.

## Conditional decision policy
Structural channels: counts of rooted visible stems excluding day stem, and counts of principal branch positions. Each channel preserves peer/resource/output/wealth/officer counts. Define its margin as support minus burden. Both nonnegative with at least one positive -> strong; both nonpositive with at least one negative -> weak; opposite signs or both zero -> mixed. These are provisional structural heuristics, not classical sufficient conditions. Resource is support, not a day-master root. This separates rooted opposing stems from weak/unrooted visible ones; it does not assume identical actual strength for all slots.

Reuse v1's exact nine quantitative scenarios and threshold sensitivity as a fixed comparison baseline. No new weights, no bonus from a relation, no force transfer. A complete chart produces a candidate only when structural direction agrees with the stable v1 quantitative category. If every scenario is >=85 or <=15, aligned strong/weak is respectively very-strong/very-weak. Otherwise strong/weak/mixed. Mixed is NOT a confirmed classical 中和. All other results unresolved. Partial/provisional as above. Unlike v1, relation presence and extremes do not automatically block candidates. The caveats formation-effects-unmodeled / clash-effects-unmodeled are mandatory when corresponding observations exist, regardless of category. interactionAssessment=observed-only; scope=ordinary-chart-assumption; specialPatternAssessment=not-assessed. Never market these conditional results as final strength, validated balance or yongsin.

The v2 feature explicitly reuses the fixed v1 evidence and quantitative modules, not the v1 gate; core has no feature dependency. Future shared extraction requires v1 exact regression. No consumers upgraded.

## Development comparison (not accuracy)
Using the existing 26-case development corpus, ordinary-direction references (DX01–03 and DH02) produce one aligned weak candidate (DX03) and three abstentions; v1 produced zero. DX02 changes its structural direction from strong to weak, but numeric thresholds still prevent a candidate. DX01 also remains unresolved. Both classical balance examples remain unresolved and descriptive only. The 20 extreme-chapter charts are **excluded from ordinary-policy agreement statistics**; retained for diagnostics. No special-pattern labels or thresholds fitted on them. DW05 now yields a mixed candidate despite a classical strong direction: a concrete counterexample that must be retained, not counted as success. DW09 remains strong, not necessarily very-strong. Do not claim that these results resolve classical degree or validate the model.

## Verification and next gate
Five new test bodies passed in V8 using actual source and an ESM adapter, including partition/counts, position-aware clash and formation evidence, the DX02 counterexample, extreme boundaries, partial/provisional and privacy. 26 cases evaluated in the same harness. Native npm test and independent ordinary strong/weak/neutral reference set still pending. Next: quantify ordinary-only coverage and conflict reasons on broader inputs; curate independent cases before modifying thresholds or adding interaction adjustments. No automatic 합화/충 strength changes until a separately specified and tested policy. No yongsin or production exposure yet.

## Coverage measurement (engine eaf0d17)

Same deterministic Tokyo complete-chart sample as v1: years 1990–2000, every month on days 10 and 20, six clock hours 0/4/8/12/16/20 at minute zero. Also test 264 corresponding null-hour inputs. The actual committed source was executed in V8 via the ESM adapter; all 1,848 quantitative objects were identical between policies. All partial v2 inputs had no final category.

| Result | v1 | v2 |
| --- | ---: | ---: |
| very-strong | 0 | 4 |
| strong | 7 | 36 |
| mixed | 18 | 111 |
| weak | 16 | 286 |
| very-weak | 0 | 68 |
| unresolved | 388 | 1079 |
| review-required | 1155 | 0 |
| Candidate total | 41/1584 (2.59%) | 505/1584 (31.88%) |

14 v1 mixed candidates become unresolved, so v2 is not merely a relaxed gate. Formation caveats occur on 1,510/1,584 complete charts (95.3%), clash caveats on 645/1,584 (40.7%), with overlap. Formation includes partial candidates; presence does not establish material impact. The high prevalence confirms that using every formation as an automatic stop would be inappropriate for this ordinary-chart model. It does not establish that ignoring actual formation effects is correct. No empirical or reference-case accuracy claim; no population inference.

Reproduce the sample with `node --test test/strength-ordinary-coverage.test.mjs`. The native test file freezes the measured distribution, including unresolved cases. Native Node execution remains pending. Next priority: independently labelled ordinary references, interaction relevance and sensitivity rather than loosening thresholds solely for coverage.

## Interaction follow-up

[Interaction sensitivity v1](interaction-sensitivity-v1.md) adds occurrence-aware context and independent hypothetical perturbations while preserving the ordinary v2 output exactly. Effective force calculation remains unvalidated.
