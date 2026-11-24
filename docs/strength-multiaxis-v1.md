# Multi-axis ordinary strength v1 (experimental)

## Scope and rationale
The user explicitly chose continued saju-kit development, not a service release. [Quantitative v3](strength-quantitative-v3.md) shows that a relative support share is not a reliable proxy for day-master capacity. Use separate axes with explicit units, and retain all earlier policies. Ordinary-chart assumption only; special patterns and yongsin are not assessed. These are engineering hypotheses inspired by existing [root observations](root-dynamics-v1.md), not classical formulas, independent statistical variables or empirical measurements.

## Model
Root capacity (0–100): take the strongest matching hidden-stem role per branch, irrespective of exact vs same-element match. Multiply each position weight by its role percentage; sum and divide by 100. Missing literal matches contribute zero. Two alternative profiles:
| profile | year/month/day/hour | principal/middle/residual |
| --- | --- | --- |
| month-day | 15/30/35/20 | 100/65/25 |
| day-local | 10/25/40/25 | 100/50/20 |

No extra life-stage score, clash loss or root bonus. This axis measures hypothetical root capacity independent of the surrounding mass denominator.

Environment: reuse the exact 24/48 quantitative-v3 scenario contributions without changing weights. Partition integer mass into peerRoot (peer hidden occurrences), peerStem (non-day peer visible stems), resource, output, wealth, officer. External support = peerStem + resource. No peer-root mass added again as external support. Report each burden separately; no assumption that drain, expenditure and control are equivalent. Environment units are nominal points (integer mass divided by 1,000,000), not percentages of total or comparable directly to root capacity. Attenuation and seasonal multipliers can alter total points; maxima across axes need not occur in the same scenario. Do not sum the axes. A peer branch can also anchor a visible stem, so these observations are not statistically independent. Per-scenario integer masses, profile identifiers and support/maxPressure remain available.

Interaction evidence: local protection/mediation paths to day stem with anchored threat and intermediate (rooted visible stem or principal branch node). Group alternatives by actual threat ID; do not add path counts or assume neutralization. No change to the numerical axes or directional hypothesis from these paths yet.

Directional experiment:
- Strong hypothesis if both root profiles >=40 and there is principal day-master rooting in month or day branch. This intentionally tests a root-first hypothesis; external pressure is reported but does not veto strong in this initial experiment. This is a limitation, not a classical sufficient condition.
- Weak hypothesis if both root profiles <=20, at least one of month/day principal branches is a burden, and in every environment scenario the largest individual burden category exceeds external support. Equality does not satisfy this test. The maximum is a proxy, not a combined burden.
- Otherwise unresolved. No inferred middle or extreme degrees. Rules are mutually exclusive; a central principal peer root necessarily means that both central principal branches cannot be burdens. No automatic 합화, confirmed protection, actual strength transfer or final category.

The numerical factors and decision conditions are uncalibrated. They were designed after observing previous development errors; do not call the comparison independent.

## API
```js
analyzeMultiaxisStrength({saju,policy:'strength-multiaxis-v1',birthBasis:'verified-chart'})
```
Existing pillar validation and explicit policy/birthBasis; existing strength-input, strength-policy, strength-birth-basis errors. Status hypothesis/unresolved/partial/provisional; direction strong/weak/null. Axes contain rootCapacity, externalSupport, pressure.output/wealth/officer min/max, scenarioCount. Complete detail includes root observations and both root profiles, environment scenario rows and centralBurden, grouped interactions, direction and grounds. completionCount=1. Partial: enumerate twelve fixed-day hour pillars using the existing helper, recompute all axes per completion, report range across completions, no actual hour or final direction; detail=null, completionCount=12. Does not cover unresolved year/month/day boundary. Provisional: axes/detail/direction null. Metadata declares experimental, ordinary assumption, special patterns not assessed and interaction observed only. No consumer migration.

## Development comparison
Six test bodies passed in a V8 ESM/assertion adapter, rerun after removing a logically unreachable central-burden guard. Actual calendar input sample 64 (1990–2020 every 10 years, Jan/Apr/Jul/Oct 15, null/0/12/20 JST) evaluated 11,520 environment scenarios: 16 partial, 12 strong, 3 weak, 33 unresolved. These are engineering coverage diagnostics, not population estimates. The original candidate was compared on all 57 textual charts with the unused calendar helper stubbed only for full-chart comparison; actual helper tested on calendar inputs. The removed guard cannot change a direction because central principal root implies one of the central branches is peer. Native Node suite and new independent source review pending.

| Xu directional 27 | agree | disagree | abstain |
| --- | ---: | ---: | ---: |
| structural v3 | 12 | 1 | 14 |
| quantitative v3 | 10 | 3 | 14 |
| multiaxis v1 | 17 | 0 | 10 |

Multi-axis 8/16 strong and 9/11 weak; 17/27 coverage, 17/17 conditional concordance. This is a development comparison, not general accuracy. Balanced/disputed cases and the 20 extreme-chapter examples are excluded from directional metrics. Ditiansui ordinary subset: all four abstain (0/4 coverage), so conditional concordance is undefined. The latter is an important limitation.

XU23 (己未 己巳 甲寅 丙寅) root capacity 64.75–70, central principal root at day; changes from v3 numerical weak to multi-axis strong hypothesis. XU14 (庚戌 戊子 戊子 丙辰) 35–35 with both central branches burdens, abstains rather than v3 structural false strong. XU08 (戊戌 甲子 丁未 庚戌) 25.5–31.5 and anchored local protection evidence; unresolved, not corrected. XU15 and XU16 strong references still unresolved. The model's root-first strong rule is not sufficient evidence for a production decision. Next: independently curate ordinary examples (including adverse season with deep roots and resource-led strength without principal rooting); evaluate directional/coverage by structure, and only then assess pressure-sensitive strong and support-led hypotheses. Avoid repeated tuning on Xu and treating it as held-out. Continue saju-kit development, no service release dependency.

Reproduce:
```sh
node --test test/strength-multiaxis-v1.test.mjs test/multiaxis-reference.test.mjs
node scripts/evaluate-multiaxis.mjs
```

## New-source comparison
[Wei ordinary references v1](ordinary-wei-reference-v1.md) compares the frozen policies on 26 new textual charts. Multiaxis agrees on 11/23 directional cases with one false strong, versus 13/23 and no disagreement for quantitative v3. Preserve this result; investigate differentiated pressure and resource routes before modifying the rule.
