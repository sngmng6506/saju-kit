# Ordinary strength reference set — Xu commentary v1

## Scope and selection
Freeze a new source-based reference set against already-committed v1/v2 and interaction sensitivity v1, at engine 15f684a. No production code or weights are changed. This is new to the existing Ditiansui fixture, not a blinded or population-representative expert evaluation. The new set cannot be treated as a holdout for a later policy tuned on these results.

Source: 子平真詮評注, 徐樂吾 commentary, original-text sections of the following online transcription (inspected 2026-11-24). Do not use the site's modern translation or generated explanatory sections as labels.

| Chapter | Link | Records |
| --- | --- | ---: |
| 論財 | [35](https://luckclub.cn/bazi/002/035/) | 2 |
| 論財取運 | [36](https://luckclub.cn/bazi/002/036/) | 3 |
| 論印綬取運 | [38](https://luckclub.cn/bazi/002/038/) | 5 |
| 論食神取運 | [40](https://luckclub.cn/bazi/002/040/) | 7 |
| 論偏官取運 | [42](https://luckclub.cn/bazi/002/042/) | 6 |
| 論傷官取運 | [44](https://luckclub.cn/bazi/002/044/) | 5 |
| 論建祿月劫取運 | [48](https://luckclub.cn/bazi/002/048/) | 3 |

Selected only complete natal pillar sequences with identifiable natal-strength commentary or explicit balance/disagreement descriptions. Excluded hypothetical examples, partial charts, unclear directions and cases with explicit special-pattern interpretation. Ordinary chart scope is a working selection criterion, not proof of the absence of special patterns. No biographical, fate or fortune predictions are retained. Per-case source chapter, four pillars, label basis and concise Korean rationale are in [fixture](../test/fixtures/ordinary-xu-v1.json). For XU08, a secondary note disputes interpretation of the useful element, not explicitly the strength label; the reference is Xu's stated direction only. Two explicit strength disagreements (XU04, XU18) retain both commentary labels. Attribution of 林注 is as printed on the source page, not independently authenticated authorship. Two 中和/氣象中和 descriptions are not mapped to product mixed. Total 31, directional 27 (16 strong / 11 weak), descriptive balance 2, disputed 2. All 31 are distinct from the earlier 26-case fixture.

## Reproduce
```sh
node scripts/evaluate-ordinary-reference.mjs
node scripts/evaluate-ordinary-reference.mjs --json
node --test test/ordinary-reference.test.mjs
```

[Baseline](../test/fixtures/ordinary-xu-v1-baseline.json) includes each result and full directional matrices. Very strong/weak collapse into strong/weak for directional comparison. Mixed counts as disagreement on a strong/weak reference; null counts as abstention. Report both coverage and conditional agreement; never treat abstention as correct. These are commentary concordance metrics, not scientific or predictive accuracy.

## Measured comparison
Actual source modules executed via V8 ESM adapter; no native Node test run. All 31 evaluated, quantitative object parity checked for each case.

| Policy | Directional n | Classified | Agrees | Disagrees | Abstained |
| --- | ---: | ---: | ---: | ---: | ---: |
| v1 candidate | 27 | 4 | 1 | 3 | 23 |
| v2 candidate | 27 | 12 | 8 | 4 | 15 |
| v1 structural | 27 | 23 | 13 | 10 | 4 |
| v2 structural | 27 | 27 | 10 | 17 | 0 |

V2 candidate directional matrix:

| Reference | strong | weak | mixed | abstained |
| --- | ---: | ---: | ---: | ---: |
| strong | 1 | 2 | 2 | 11 |
| weak | 0 | 7 | 0 | 4 |

V2 candidate coverage 12/27 (44.4%), conditional agreement 8/12 (66.7%), overall reference concordance counting abstentions as not matched 8/27 (29.6%). V1 corresponding values 4/27 (14.8%), 1/4 (25%), 1/27 (3.7%). Small, source-selected dataset; not statistical population estimates. V2 qualitative direction alone matches 10/27 versus v1 13/27; do not describe v2 as an unconditional improvement. Directional agreement is markedly asymmetric (strong 1/16 vs weak 7/11 for v2 candidates). Simply removing gates or lowering thresholds cannot be justified.

## Diagnostics and next experiment
- XU08 戊戌 甲子 丁未 庚戌: Xu strong, both engines weak candidate, support range 18.9–29.5. Xu emphasizes fire roots in 戌/未 and protective role of earth against water. Existing principal-branch channel underrepresents this root/mediating structure. This is a hypothesis about model limitations, not proof of a new scoring rule.
- XU23 己未 己巳 甲寅 丙寅: Xu very strong in direction, v2 weak candidate, 20.4–28.8. Two principal wood roots coexist with a burden-dominated visible-stem channel and low fixed support mass. This shows why count and support mass are insufficient alone. Neither XU08 nor XU23 changes stable quantitative category in the existing isolated formation stresses or structural direction in clash stresses. 合沖 adjustments alone will not solve these failures.
- XU02 and XU25: source strong, v2 mixed. Do not reinterpret mixed as concordance.
- XU01/XU03/XU30: v1 structural strong but v2 structural weak; stronger coverage does not imply better qualitative reasoning.
- In the 27 directional cases, 11 have at least one hypothetical formation scenario changing stable quantitative category; zero have a clash endpoint root-access scenario changing structural direction. These are diagnostic perturbations, not confirmed effects.

Prioritize a separate testable structural model of day-master root depth and location, seasonal context versus principal hidden stem, and the distinction between rooted opposition and actual mediation/protection. Before selecting weights or rules, obtain further independent ordinary-direction references from additional authors and keep an unseen evaluation set. Reuse existing root/formation context; avoid fixed bonus/penalty or arbitrary threshold changes. Scope remains ordinary strength; no special-pattern or yongsin inference. Do not update consumers. Native npm test and independent expert review remain required.
