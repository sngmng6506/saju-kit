# Quantitative strength v3 — seasonal and root-aware index

## Scope
Experimental quantitative hypothesis, not a replacement for v1/v2, final strength, probability, effective force or favorable-element determination. Ordinary-chart assumption only; special-pattern interpretation remains out of scope. Retain structural v3 as a separate experiment. The index is a modeled share of support relative to all contributions, not the actual power of the day master.

References: [root dynamics](root-dynamics-v1.md) and [structural v3](strength-structural-v3.md) motivate position and rooting; [traditional 旺相休囚 ordering](https://www.shidianguji.com/zh/mid-page/7459881163236327461), [seasonal table and transition-month distinction](https://sajurok.com/column/wolryeong-meaning-saju-guide) motivate relative seasonal ordering. Exact weights, attenuation coefficients, profiles and thresholds below are **engineering hypotheses**. No classical or empirical calibration is claimed. The numerical hypotheses were not optimized to match the known fixtures.

## Model
Each of seven physical slots is allocated once. Day stem is the reference, never its own support contribution. For each stem or hidden-stem occurrence:

  mass = position weight × hidden share × root factor × seasonal factor.

All factors are integral percentages; the common scale cancels in the ratio. Aggregate mass by existing peer/resource/output/wealth/officer categories. Support index = 100 × (peer + resource) / total mass. This is a normalized share, not a conserved physical quantity; attenuation/season factors can change total mass across scenarios. The five displayed percentages may sum to 99.99 or 100.01 due to rounding, while integer masses partition the total exactly.

Position profiles (year stem/branch, month stem/branch, day branch, hour stem/branch):
| Profile | weights |
| --- | --- |
| balanced | 10, 10, 15, 20, 20, 10, 15 |
| day-local | 5, 8, 15, 20, 27, 10, 15 |
| month-heavy | 5, 9, 10, 30, 21, 10, 15 |

All sum to 100. Within each branch, allocate hidden shares by existing roles: balanced principal/middle/residual 60/30/10 (two stems 80/20); distributed 50/30/20 (two stems 70/30). Visible stems use share 100. No extra branch-element mass. Identical-element hidden stems may contribute their allocated shares but are not extra slots.

Visible non-day stems only: root factor is the maximum of the unrooted floor and all matching root role factors minus distance cost × absolute pillar-column distance. Same-element/exact matches follow the existing hidden-stem convention. Mild: floor 80, residual 85, middle 95, principal 100, distance cost 3. Pronounced: 55, 65, 85, 100, cost 5. Branch contributions have root factor 100. Multiple roots cannot accumulate bonuses; one branch may still anchor several visible stems, so these weighted contributions are not independent evidence. No separate root/12-stage bonus. The day master's branch roots are represented through branch allocation and position, not an additional day-stem multiplier.

Season factors relative to representative season element:
| 旺相休囚死 | 旺 | 相 | 休 | 囚 | 死 |
| --- | ---: | ---: | ---: | ---: | ---: |
| mild | 120 | 110 | 100 | 90 | 80 |
| pronounced | 140 | 120 | 100 | 80 | 60 |

The common elemental relation maps peer/output/resource/officer/wealth respectively, relative to the **season reference**, not the day stem. For transition months whose representative season differs from month principal, both season and principal reference bases are evaluated, without deciding actual month command. These are alternative hypotheses, not all possible classical interpretations. No actual transformation, protection, mediation, clash or temperature adjustment.

Cross three position, two role, two root, two seasonal profiles: 24 scenarios, or 48 with two season bases. Baseline is balanced position/role, mild root/season, representative season. Compare exact integer ratios (BigInt cross products) before rounding displayed range. The direction is stable only when every scenario agrees under all weak/strong threshold pairs 40/60, 35/65, 45/55; equivalently all <=35 or all >=65. Neither direction is returned when these conditions fail. These thresholds are hypothetical, and differ from v1's 30/70 robust boundaries; the comparison cannot isolate the effect of the formula from the changed thresholds.

## API
```js
analyzeQuantitativeStrength({saju,policy:'strength-quantitative-v3',birthBasis:'verified-chart'})
```
Same pillar and explicit basis contract as structural v3. Errors: strength-input, strength-policy, strength-birth-basis and existing pillar validation codes. Status hypothesis/unresolved/partial/provisional; direction strong/weak/null. Complete charts return quantitative baseline, scenarios (including exact integer mass/contributions), min/max, thresholdSensitivity, stableDirection, scenarioCount, completionCount and rangeBasis. No final category or calibrated confidence.

Missing hour: evaluate the 12 fixed-day hour pillars using the existing calendar helper at hours 0,2,...22; recalculate **all** stem root factors and all scenario masses for every completion. Range covers these fixed-year/month/day possibilities, not uncertain day/month boundary or historical time correction. Partial returns min/max, threshold sensitivity over all completions, scenarioCount 288 or 576, completionCount 12, baseline null, empty scenarios, stableDirection and top-level direction null. No invented birth hour; no scenario is selected as actual. Provisional returns null quantitative and direction. The helper's internal named export is additive and its calendar logic is unchanged; it is not added to the root API.

## Development measurements
Actual candidate source was executed via a V8 ESM/assertion adapter. Seven new test bodies passed, and 176 Tokyo calendar inputs (1970–2020 every five years, Jan/Apr/Jul/Oct 15th, null/0/8/16 hour) evaluated, including 44 partial, 31,680 scenarios total. Complete: 1 strong, 23 weak, 108 unresolved. All partial directions null. This is a deterministic engineering sample, not population or accuracy validation. The 57 previous textual charts were evaluated using the actual feature sources; an unused calendar import was stubbed for the full-pillar comparison only. The actual helper and calendar data were tested separately on the calendar inputs. No native Node full regression due to checkout network restriction.

Compare the frozen prior numerical direction (v1 stable strong/weak only, mixed treated as abstention), v3 structural direction, new numerical direction, and hypothetical intersection. Exclude 20 extreme-chapter cases, balanced and disputed cases from directional metrics. Previously inspected labels are **development**, not independent validation.

| Xu 27 directional references | agrees | disagrees | abstained |
| --- | ---: | ---: | ---: |
| Prior numerical | 9 | 2 | 16 |
| Structural v3 | 12 | 1 | 14 |
| Quantitative v3 | 10 | 3 | 14 |
| V3 intersection (diagnostic only) | 4 | 0 | 23 |

New numerical concordance conditional on classified cases 10/13 (76.9%), vs old 9/11 (81.8%). New coverage 13/27 (48.1%), vs old 11/27 (40.7%). Strong references: 1 strong, 3 weak, 12 abstain. Weak references: 9 weak, 2 abstain. Intersection concordance 4/4 with only 4/27 coverage (14.8%); do not adopt as a final rule. Ditiansui ordinary subset: old numerical 1/4, new numerical 1/4, structural 1/4, intersection 0/4 agrees; other cases abstain.

Examples:
- XU14 (weak): old 30.4–43.75, new 21.05–35.72; closer to weak, but still no stable numerical direction. Structural v3 false strong remains unchanged; intersection abstains.
- XU08 (strong): old 18.9–29.5, new 22.91–34.61; still wrong weak.
- XU23 (strong): old 20.4–28.8, new 17.44–25.81; worsens the underestimation of rooted wood.
- XU16 (strong): old 24–34.5 (abstention), new 19.45–34.22 (wrong weak).
- XU01 (strong): old 58–66, new 64.7–76.66; still abstains under conservative boundaries.

These results do not justify replacing the old model or adding a final mixed policy. A support fraction alone may be the wrong proxy for day-master capacity: rootedness, environmental opposition and protective/mediating relationships have distinct effects. Next research should compare separate root-capacity/opposing-pressure channels using independently curated cases, rather than merely increase weights or weaken the gate. Keep service release independent of unvalidated advanced strength functionality. No automatic yongsin or production consumer migration.

Reproduce:
```sh
node --test test/strength-quantitative-v3.test.mjs test/quantitative-v3-reference.test.mjs
node scripts/evaluate-quantitative-v3.mjs
```

## Follow-up
[Multi-axis strength v1](strength-multiaxis-v1.md) separates root capacity, external support and pressure while preserving this model. Continue library development independently of service release.
