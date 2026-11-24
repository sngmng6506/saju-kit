# Wei ordinary-strength reference comparison v1

## Source and frozen protocol
Compare the three already committed policies at 548c66520d51b4ef82d0952f44ab414628550c05. No model weights or decision rules are changed. The new [fixture](../test/fixtures/ordinary-wei-v1.json) is selected from the original-text sections of 韋千里's 千里命稿, not modern explanatory translations:
- [強弱篇](https://taoly.app/library/bazi/qian-li-ming-gao/008/) and [alternate transcription](https://8s8s.com/text/literature/78/18696.573870.html): all eight complete teaching examples, one excluded for textual discrepancy.
- [評斷篇](https://taoly.app/library/bazi/qian-li-ming-gao/021/): all five commentary charts.
- [六神篇](https://luckclub.cn/bazi/003/009/) 食神之利/弊 and 偏正印之利/弊: all full examples in the specified passages, seven food and eight resource examples; one resource example excluded because 旺 is not a branch.

Do not reconstruct faulty source pillars. W07 has incompatible transcriptions 乙巳 vs 己巳; retain both without selecting one, although only 乙巳 is consistent with 丁 day. W27 contains invalid month branch 旺. Included 26 complete four-pillar sequences: 12 strong, 11 weak, two qualified directions (W11/W21), one balance description (W13, also slightly weak in the useful-element explanation). The latter three remain descriptive, not directional metrics. W10/W12 depend explicitly on the author's formation effect interpretation; report a separate subset excluding them. These are ordinary interpretation examples, including degree labels in ordinary strength chapter, not confirmed special patterns. No personal life details stored. Teaching examples are not authenticated real births. Published commentary is a textual label, not empirical truth. All included charts are unique relative to the 57 prior records, each pillar obeys stem/branch parity and month/hour stem derivation; this does not independently establish historical birth dates.

The fixture was written to an unreferenced candidate commit 9a7a3e6 before computing outputs. This is an independent-source evaluation relative to the frozen policies, not a blinded expert study or a random population sample. After inspection it becomes development evidence for any subsequent policy designed using the results.

## Results
The actual frozen feature source modules and evaluator ran in V8 with an ESM adapter; an unused calendar import was stubbed only for full-pillar inputs. 26 charts evaluated, 23 included in directional metrics. Native Node full suite not run. No runtime code changed.

| Policy | Agree | Disagree | Abstain |
| --- | ---: | ---: | ---: |
| structural v3 | 12 | 0 | 11 |
| quantitative v3 | 13 | 0 | 10 |
| multiaxis v1 | 11 | 1 | 11 |

Multiaxis: 7/12 strong, 4/11 weak, one false strong, coverage 12/23, conditional concordance 11/12. Quantitative v3 has 13/23 coverage and 13/13 conditional concordance on this selected set. On the 20 directional teaching cases the respective agreement counts are 12/12/10 and disagreements 0/0/1; the three directional commentary cases have agreement counts 0/1/1, no disagreements. With the two explicitly formation-dependent cases excluded (21 directional), agreements 12/13/10 and disagreements 0/0/1. Do not infer population accuracy or rank methods generally from this small selected corpus. The prior Xu dataset produced 17/27 agreements for multiaxis, zero disagreements, and the Ditiansui ordinary subset had 0/4 coverage; pooling does not remove source/selection dependence.

## Failure analysis and next experiment
W24 丙申 丙申 戊戌 庚申: Wei describes a weak day master with heavy output and resource as relief. Multiaxis gives strong from central principal rooting and root capacity 51.25–52; external support 14.44–25.83 and output pressure 43.8–62.3 nominal points. All environment scenarios have max pressure > external support. This exposes that the current strong rule ignores pressure. However W04 and W19 (both strong references) also have all scenarios pressure-dominant, so blanket veto on pressure would discard correct cases. Need distinguish output/wealth/officer, location and local resource opposition rather than treating maximum burden as an automatic override.

W01/W02/W20: strong references abstained by multiaxis despite external support exceeding all individual burdens across scenarios. W03 strong reference has month principal root only and no external support in the current model. W12 strong reference relies on branch formation and cannot be treated as evidence that transformation is implemented. W13 is descriptive balance/slightly weak but multiaxis strong; preserve this conflict outside directional metrics.

Next testable increment: specify resource support routes and differentiated burden exposure before altering thresholds. Resource support must distinguish observed resource nodes, their rootedness/locality, controlling wealth, and generating officer; output can be controlled by resource as well as drain day master. Trace path and opposing nodes, do not assert actual cancellation. Then compare pressure-sensitive strong and support-led hypotheses using new source or independently reviewed examples. Do not optimize for just W24 or reclassify ambiguous labels to improve metrics. No automatic yongsin, special patterns or consumer migration. Preserve all older policies and reference snapshots.

Reproduce:
```sh
node scripts/evaluate-wei-reference.mjs
node scripts/evaluate-wei-reference.mjs --json
node --test test/wei-reference.test.mjs
```
