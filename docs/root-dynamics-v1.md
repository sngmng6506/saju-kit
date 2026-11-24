# Root dynamics v1 — structural observations

## Scope
An additive core API for ordinary strength research, motivated by XU08 and XU23 in the frozen [Xu reference comparison](ordinary-reference-v1.md). No changes to strength v1/v2, movement or compatibility. No special-pattern classification, yongsin, physical force, transformation or cancellation inference.

References:
- [子平真詮 論十干得時不旺失時不弱](https://donglishuzhai.net/chapter/3719.html): distinguishes deep and light roots and warns against judging strength by season alone.
- [子平真詮 論陰陽生死](https://donglishuzhai.net/chapter/3716.html): life-stage convention; use conventional ten-stem forward/reverse, earth following fire, as a separately named table. [Modern table cross-check](https://qishu.app/docs/appendix/changsheng-biao). Do not equate life stage with literal root evidence, including yin-stem stages.
- [우연화·김만태 (2022)](https://www.jdaos.org/archive/view_article_pubreader?pid=jdaos-42-0-109): positional rooting and distinction between stem-to-branch and branch-to-stem control. The paper documents differences among schools. Vertical control here is a neutral geometric observation, not a favorable/unfavorable verdict or confirmed 개두/절각.
- [徐樂吾 commentary 論偏官取運](https://luckclub.cn/bazi/002/042/): XU08 roots and earth controlling water; the printed secondary commentary differs on useful-element interpretation. The graph rules are engineering definitions, not an authenticated classical strength formula.

## API
```js
lifeStage(stem, branch)
analyzeRootDynamics({saju})
```
Validates existing Korean stem/branch and natal pillar contract; hour must be null or a valid pillar. Invalid inputs use existing SajuError codes. Life stage returns one Korean stage name (장생, 목욕, 관대, 건록, 제왕, 쇠, 병, 사, 묘, 절, 태, 양). The basis is life-stage-yang-forward-yin-reverse-earth-fire-v1. Ten starting branches in stem order: 해 오 인 유 인 유 사 자 신 묘. Phase advances with branch order for yang stems, reverses for yin stems. No automatic stage-based root or stage score.

Output version root-dynamics-v1, hiddenStemsBasis, lifeStageBasis, completeHour, dayMaster, season, roots, vertical, nodes, edges, paths, effectsConfirmed:false.

- season: season representative element (spring wood, summer fire, autumn metal, winter water), distinct from month's principal hidden-stem element. Both directional relations to day master are exposed. 진술축미 have earthTransition:true; representative season is not actual month command. commandResolved:false always.
- roots: every known visible stem against every known branch, including no-match positions. Preserve exact/same-element matches from existing convention, strongestRole (principal/middle/residual or null), stage, pillar distance (absolute column difference), samePillar, isMonth, clash exposure and other observed root positions. Alternative positions do not imply unaffected or equally strong roots. No absent-hour placeholders; absence of observed root is not proof of absence in unknown hour.
- vertical: same-pillar relation between visible stem and principal branch hidden element. control is stem-controls-branch, branch-controls-stem or null. No classification of favorable element; no penalty. Other hidden elements remain represented in the graph.
- nodes: one visible-stem node per known pillar, and one branch node per distinct hidden element at each known branch. Branch node retains all same-element matches and strongest role. Nodes represent observed occurrences, not independent physical units of power.
- edges: directed generating/controlling links between nodes in distinct physical slots (position+layer). Same branch's hidden elements cannot serve as two independent slots. Each link carries column distance and local (distance<=1). Same-pillar stem/branch edges are allowed. No direct force transfer assumed.
- paths: targets are day master and visible peer/resource stems. Protection = via controls threat, threat controls target. Mediation = threat controls target AND threat generates via AND via generates target. Three distinct slots required. local marks the two chain edges as distance<=1; for mediation the direct threat edge can be remote. Rootedness and hidden roles remain in nodes, but path presence does not require or establish sufficient power. confirmed:false. Counts of overlapping paths are not additive evidence or scores. No transitive cancellation.

This core module depends on existing element-structure, natal validation and elemental correspondences, not strength features. No existing return shape modified.

## Diagnostics
All 31 existing Xu reference charts evaluated against actual source in a V8 adapter. Directional subset: 16 strong and 11 weak textual labels. The following counts are descriptive on a previously inspected set, not a held-out experiment; no threshold fitted:
- Two or more observed day-master root positions: strong 15/16, weak 3/11.
- Principal day-master root in month or day branch: strong 8/16, weak 0/11.
- XU08 戊戌 甲子 丁未 庚戌: fire roots at year (middle), day (residual), hour (middle). The actual local path day:branch:earth -> month:branch:water -> day:stem is two control edges (protective candidate); three local protection paths and two local mediation paths to day stem. No confirmed neutralization. Winter water is separate from the fire root observations.
- XU23 己未 己巳 甲寅 丙寅: principal wood roots in day and hour, both 建禄 in the selected stage convention; year branch also contains middle wood. Preserve this rather than inferring weakness from the aggregate support mass alone.
- Counterexample XU14 (weak reference): principal roots in year and hour. XU10 (weak reference) has zero observed day-master roots but two local protection and two local mediation candidates. Presence/count of roots or paths alone is insufficient for strength classification.

## Verification
Seven new test bodies passed against source in V8 using a small ESM/assertion adapter; 120 stem-branch stage cells checked against independent sequences, stage/root separation, XU08/XU23 evidence, transition months, vertical direction, path identity and directed edge validity, unknown hour, privacy and immutability. 31-reference diagnostic run completed. Native Node suite not run. No new dependencies. Next increment should compare explicit structural decision candidates on an additional unseen reference set before changing the quantitative or final decision policy. No automatic scoring or consumer release.

## Follow-up
[Structural strength v3](strength-structural-v3.md) consumes these observations in an isolated qualitative experiment; existing classifiers and core outputs remain unchanged.
