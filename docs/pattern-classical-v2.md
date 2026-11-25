# Classical reference v2: baseline audit (pattern v3)

81 unique four-pillar strings: 69 new and 12 development-known. 67 chapter-family references eligible; 14 textual variants or transformation reviews excluded from aggregate. 40 checked against chapter witnesses, 3 editorial corrections, 13 appendix-only, 11 legacy, 6 variants, 8 transformation review. Electronic witnesses, not a print-authenticated edition or independent double annotation. The classical text is the target, not historical life-outcome truth. A structurally valid four-pillar string is not proof of a real birth date. The test corpus is not imported by runtime.

## Baseline before changing any pattern rule

Actual pattern v3 dependency graph (19 modules, ESM declarations adapted, no stubs) executed on all 81 rows. The calculation and retrieval counts were independently reproduced from outputs; native Node audit CLI and full test suite not run here.

| Metric | All eligible | New reference | Development-known |
|---|---:|---:|---:|
| Eligible | 67 | 56 | 11 |
| Chapter family retrieved | 66 | 55 | 11 |
| Competing distinct families | 25 | 19 | 6 |
| Mean distinct families | 1.4179 | 1.3929 | 1.5455 |
| Source participant in assistant candidate set | 9/23 | 9/23 | n/a |
| Selected pattern | 0 | 0 | 0 |
| Assistant selected | 0 | 0 | 0 |

Candidate retrieval ≠ selection accuracy. Participant observations are broad positive role probes, not a complete set of gold assistant stems: some source actors preserve a role via a positional relation or a distinct mechanism outside the assistant-route definition. Report 9/23 as coverage of these probes, not assistant precision or recall against adjudicated assistants.

The schema additionally separates 13 narrowly annotated source-selected family references from chapter membership. No exact selected useful stem, final assistant or unfavorable stem has independent adjudication. Do not interpret the absence of selected errors as accuracy: zero coverage means selective accuracy is undefined. The audit code excludes unlabelled rows from selection denominators. Synthetic metric controls test correct/wrong/abstained and unlabelled behavior. New-reference is a development evaluation split, not a blinded held-out set.

## Main miss

zp-3746-07 (甲子 辛未 辛酉 壬辰): source treats 甲 as wealth connected to 未 wood storage and 壬 as output mediating peer/wealth. Current exact hidden projection produces resource only. Do not alter the hidden-stem table or automatically equate all same-element visible stems with exact projection. Add an explicit, separately versioned storage-element projection hypothesis and test other four storage months, nonstorage months, missing hour, competing candidates, and opposite polarity. Source: https://www.kaucim.ai/bazi/ziping-zhenquan/lun-cai ; https://donglishuzhai.net/chapter/3729.html . This is a known diagnostic miss, not a licence for case-specific hardcoding.

Role-probe gaps: resource protects officer against output, resource uses output, heavy resource uses wealth, blade controller protected by resource, peer officer uses resource, wealth/output and combination interventions. Some cases need role-specific modelling rather than broadening support indiscriminately.

## Reproduce

```sh
node scripts/audit-classical-patterns.mjs
node --test test/pattern-classical-v2.test.mjs
npm test
```

Next: independently cross-check remaining 13 appendix-only and variants; extend with more ordinary-pattern cases and negative contrasts (no fabricated historical labels). Establish actual selection and role references before granting any selection authority. Keep special patterns out.


## Outcome research checkpoint after v10

The v3–v10 progression can now be compared on the same frozen corpus without changing any released policy. The research-only outcome projection consumes v10, requires observed anchor-bound routes and distinct slots, normalizes reverse legacy directions and matches a rescue only against the identical directed obstacle/protected occurrence pair within the same candidate. Unmatched rescue witnesses remain visible; a matched rescue never removes a threat. Named role paths and unresolved motif predicates remain separate evidence, not scores. A root/locality screen is not efficacy. No selection, 成敗救應, useful/assistant/unfavorable stem or transit authority is granted.

```sh
node scripts/audit-classical-patterns.mjs --progression
node scripts/audit-classical-patterns.mjs --outcomes
node scripts/audit-classical-patterns.mjs --outcomes --rows
node --test test/pattern-classical-v2.test.mjs
npm run test:failures
npm run audit:layout
npm run audit:architecture
npm run audit:dead-code
```

Reference inventory (executed against the actual frozen JSON): 81 total, 67 eligible, 14 excluded, 13 selected-family labels, 23 support and 2 obstruction probes. There are zero eligible formed, exact useful-stem, exact assistant-stem or unfavorable-stem labels, and zero confirmed held-out cases. All 81 cases remain in the annotation review queue. Negative labels must be distinguished from missing labels. This is an inventory, not independent adjudication. Do not add synthetic cases as historical references or backfill labels from predictions. For the next corpus, record the source edition and exact location, transcription, explicit role/formation scope, adjudicator and disagreement; freeze a separate blind split before rule tuning. Special patterns remain excluded.

Three new synthetic controls passed in isolated JavaScript using the actual research module and test assertions adapted to that environment (JSON clone for plain control data). The native full-corpus test has been authored but not executed; repository clone was blocked by DNS and a full dependency fetch exceeded connector call limits. No new outcome counts or improvement in prediction accuracy are claimed. Public API and runtime modules are unchanged. Keep the research branch separate until the final native regression and pinned equivalence gate is passed. 


## Separate Xu Lek-wu commentary cohort (commentary-v1)

34 additional four-pillar references transcribed from the electronic edition of 徐樂吾's commentary: https://ncc.com.tw/fate/paleo/bg/bg_033.htm (chapters 九, 十一, 十二, 十五, 十六, 二十). The source locator, raw Chinese pillars, author layer and narrow paraphrase are recorded per case. This is a single electronic witness and single annotation pass. No independent edition agreement, birth-date confirmation, or empirical validation is claimed. The original 81-row Shen corpus is unchanged. The combined 115 pillar strings are unique, but alternative charts of one subject and source comparisons are related and must stay grouped when eventually splitting a corpus.

The executed inventory validates 34/34 rows for unique pillar strings, valid sexagenary parity, year/month stem and day/hour stem consistency, exact transcription mapping, visible annotated stems and provenance. This does not validate an actual historical birth date. Source-family labels (16) are not necessarily final selected-family labels. Explicit outcome expressions: formed 3, broken 1, rescued 4, formed-with-damage 5; 21 unlabelled. Explicit assistant stem 1, commentary-useful visible stems 5, rescue participant probes 6, obstruction probes 7. Xu's use of 用神 may differ from Shen's monthly anchor; do not compare it directly to patternUsefulGod or pool these metrics across source layers. Empty arrays mean unannotated, not proven absent. The fixture is entirely development commentary, not a blind holdout.

```sh
node scripts/audit-classical-patterns.mjs --commentary
node --test test/pattern-classical-v2.test.mjs
npm run audit:layout
```

The commentary audit reports candidate inclusion separately from strict matched-threat rescue probes, unmatched paths, and damage-actor probes. A role witness alone cannot satisfy a matched rescue probe. No outcome or assistant accuracy is reported until a real prediction contract exists. Cases without a family label are searched across candidates for the broad structural probes; this is not a family-specific adjudication. Source variants and related cases remain identified, not independent observations. All 34 are development cases. No new runtime policy or final authority is granted. Native v10 execution and full regression remain pending: git ls-remote in the execution environment failed DNS even though Node 22.16.0 is available. The next step is a second-witness transcription review, a separate adjudication pass and independent split before calibrating any final decision rules.


## Efficacy review v1 (research-only, after pattern v10)

Text basis: [論用神格局高低](https://www.kaucim.ai/bazi/ziping-zhenquan/lun-yong-shen-ge-ju-gao-di), [論生剋先後分吉凶](https://www.kaucim.ai/bazi/ziping-zhenquan/lun-sheng-ke-xian-hou-fen-ji-xiong), [論用神成敗救應](https://www.kaucim.ai/bazi/ziping-zhenquan/lun-yong-shen-cheng-bai-jiu-ying). The first two electronic chapters were inspected. The text distinguishes appropriateness, available force, relative balance and position; it does not specify a numeric threshold. The screen below is an engineering hypothesis about evidence sufficiency, not a complete classical efficacy rule or empirical claim.

The research module consumes the existing v10 occurrence graph, route bindings and candidate outcome review. No duplicate natal/force calculation, no fixture-dependent inference, no change to public runtime/API or consumer policies. Reverse-oriented legacy links are normalized; explicit edge identity, direction, type and screen must match the upstream graph. Missing or non-comparable access and combinations are unresolved, while clash exposure, rooted local pressure, distance or insufficient root evidence trigger review. For control, target evidence dominance and mixed relative evidence also require review; that dominance rule is not applied to generation. Unknown evidence does not erase known concerns. No weighted sum, numerical force or claim that dominance of evidence equals dominance of force.

States: necessary-screen-met, review-required, unresolved. Passing a screen means only the listed engineering checks passed, never that an action is effective. A multi-edge role witness retains every unresolved source condition. A matched rescue screens the original damage and helper edge separately, but source-order/interference and net rescue effect remain unresolved even when both edge screens pass; the threat is never removed. Food/killing/day triads bind only to the candidate's actual killing anchor and retain day-capacity and balance conditions. There is no positive or negative final efficacy prediction. Counts are candidate-route/witness occurrences, not independent charts; the same physical edge may occur in multiple candidate routes.

```sh
node scripts/audit-classical-patterns.mjs --efficacy
node scripts/audit-classical-patterns.mjs --efficacy --rows
node --test test/pattern-classical-v2.test.mjs
npm run test:failures
```

The audit keeps the eligible Shen 67 and Xu commentary 34 separate (14 Shen review-only cases excluded). It reports state counts and matched rescue screens, not final outcome accuracy. Three new synthetic test groups passed using the actual module and adapted assertions in an isolated JavaScript environment, including inconsistent edge direction/screen, relative control and generation contrasts, hidden access, partial/unavailable input, noncancellation, unresolved source conditions and triad anchor isolation. Native Node 22.16.0 is installed, but git ls-remote failed to resolve github.com; native corpus and full regression remain unexecuted. Do not merge before the pinned native regression gate. Future calibration requires independently adjudicated action efficacy and negative controls; neither a source outcome label nor an unlabelled case can serve as a negative edge label.


## Outcome decision v1 (research-only)

Text cross-check: [論用神成敗救應, Shen electronic text](https://www.tianyashuku.com/yijing/9643/814110.html), [parallel reading](https://changxianyi.com/guji/ziping/wz-20260914/chapter-010/), [論用神因成得敗因敗得成](https://www.donglishuzhai.net/chapter/3726.html). The search-visible passages distinguish formation, damage, formation with damage, and rescue; full fetches of the first and third links failed (403/502). No independent full-edition collation is claimed. The existing eight-family motif source table remains unchanged, and is explicitly nonexhaustive.

The decision module is a pure three-valued algebra (true/false/null), plus a projection over existing v10, outcome and efficacy research evidence. It evaluates conjunctions, alternatives and negation without conflating unknown with false. A refuted motif is excluded only as that particular alternative. A satisfied literal motif is not confirmed effectiveness. An open inventory of alternatives may not be closed merely because all known alternatives are false. Damage and rescue are evaluated per directed threat occurrence; a rescued threat cannot cancel another independent threat. Conditional hypotheses: cleanFormation, formationWithDamage, damageWithoutSupport, formationAfterRescue. These are conditional compositions of supplied premises, not confirmed whole-pattern judgements, and damageWithoutSupport is not automatically 破格. The pure algebra supports explicit exhaustive hypothetical inventories for testing; the actual projection never marks the inventory exhaustive, never injects source labels and never promotes necessary screens to true effects. Therefore current corpus final decision coverage is expected to be zero, not measured accuracy. No runtime policy or public API change.

The new audit separates Shen (67 eligible; 14 excluded) and Xu (34). It reports literal motif matches, refutations, unresolved motifs, abstentions and a contextual condition backlog ranked by distinct charts then occurrence count; refuted motifs are excluded from that backlog. The backlog measures implementation coverage, not source importance or empirical accuracy.

```sh
node scripts/audit-classical-patterns.mjs --decisions
node scripts/audit-classical-patterns.mjs --decisions --rows
node --test test/pattern-classical-v2.test.mjs
npm run test:failures
npm run audit:layout
npm run audit:architecture
npm run audit:dead-code
```

Executed four new synthetic test groups in an isolated JavaScript environment with actual research module source and adapted assertions: three-valued truth tables and De Morgan checks, open-world coverage, independent rescue obligations, motif predicate consistency, backlog exclusion, missing-hour and unavailable handling. Exhaustive enumeration of 972 two-threat combinations produced zero conflicting hypotheses and zero final-authority grants. This proves only the tested algebraic contracts, not correctness of classical astrology. Native Node 22.16.0 is available but git ls-remote again failed DNS resolution; native corpus and full regression have not run. The branch must remain separate until native regression and pinned equivalence checks pass. Next: use measured backlog to implement individually sourced contextual predicates with explicit negative contrasts, add independently adjudicated force/efficacy labels and freeze an independent corpus before tuning. Do not activate final selection or transit authority.


## Contextual condition review v1

The pattern decision research consumes the existing opt-in strength-decision-v1 output for the same chart, not a new strength classifier. Relevant source/engineering contracts: [separated strength decision](strength-separated-decision.md), [integrated strength v3](strength-multiaxis-v3.md), [resource access](resource-access-v1.md), [output capacity](output-capacity-v1.md), and the classical discussions already cited above. No new textual collation is claimed for this integration.

A complete, conflict-free ordinary-chart strong/weak hypothesis with explicit grounds is required for a conditional day-strong proxy. Weak may also refute the conjunction day-and-resource-strong under that proxy; strong alone cannot establish the conjunction. Partial, unavailable, wrong policy/scope and conflicting or unresolved directions abstain. The proxy is kept in a parallel conditionalPredicate field; the original motif truth, doctrinalValue, effective effect and final authority remain unchanged. Special-chart exclusion is an assumption, not proof of ordinary classification.

The matched scenarios compare support with each burden, conditional resource with nominal wealth and hypothetical residual output, and visible peer with nominal wealth. Comparisons use integer mass within the same scenario row, report all-left/all-right/equal or sensitivity, and never compare independently selected marginal extrema. These are inherited hypothetical units, not effective force. Do not infer excessive/deficient resource, sufficient day capacity or peer victory from these comparisons. Candidate-local edge evidence binds to the upstream anchor occurrences, excludes the day reference from peer pressure, preserves relative evidence and blockers, includes actual food-killing-day triads and flags combination/order review. No duplication of the strength calculation or fixture-dependent inference. Current upstream anchor identity is retained, including its known scope limitations.

```sh
node scripts/audit-classical-patterns.mjs --context
node scripts/audit-classical-patterns.mjs --context --rows
node --test test/pattern-classical-v2.test.mjs
npm run test:failures
```

The audit keeps Shen 67 and Xu 34 separate (14 excluded Shen rows). It reports conditional proxy coverage, ordinary-strength direction distribution, and conditional motif changes without claiming doctrine or final outcome accuracy. Two new synthetic test groups passed in isolated JavaScript with actual context and logical algebra sources and adapted assertions; matched scenario sensitivity, conflict/missing hour abstention, candidate/peer isolation, input immutability, positive and negative proxy values and authority boundaries were exercised. Native corpus and complete regression remain pending: Node 22.16.0 is installed, but git ls-remote failed to resolve github.com. No actual corpus coverage numbers were measured. Next run native corpus and use the condition backlog to scope the first genuinely adjudicated context/efficacy predicates; avoid new weights or definitive force thresholds without independent reference evidence.


## Stem interference review v1

Source comparison: [論十干合而不合](https://www.donglishuzhai.net/chapter/3718.html), [parallel electronic text](https://www.tianyashuku.com/yijing/9643/814106.html), [Xu commentary](https://www.ncc.com.tw/fate/paleo/bg/bg_032.htm), [論相神緊要](https://donglishuzhai.net/chapter/3728.html), [論生剋先後分吉凶](https://donglishuzhai.net/chapter/3733.html). Search-visible passages distinguish remote pairing, intervening stems, competing combinations, day-self combination and preservation of an unaffected actor. They also give cases in which separation changes the interpretation of competing pairs. No full-edition collation or universal rule that adjacency makes a combination effective is claimed.

The research module reuses the actual v10 contact identifiers and directed force graph, rather than reimplementing the five stem combinations. It separates adjacent competitors from remote alternatives, reports intervening controlling actors and two-edge generation chains, and preserves day participation as distinct from non-day pairs. A partial chart cannot establish exclusivity. Neither a contact nor an adjacent uncontested pair implies effective binding, removal or transformation. All contacts and threats remain visible.

Five source-inspired preservation witness definitions cover combining hurting output to preserve officer, killing to preserve officer or wealth, resource to preserve the food controller of killing, and one officer while retaining another. The protected anchor is occurrence-specific; a hidden target requires an actual directed relation where applicable, and access remains unresolved. The food-controller case must link to the candidate's killing anchor. Officer-killing coexistence is not represented as an elemental control edge; wealth-generated killing retains the reverse threat orientation. These witnesses supplement the earlier exact directed-threat rescue matcher without changing or silently broadening it. Wealth-resource separation has explicit anchor-related versus officer chart-context scope. Five existing motif conditions receive related structural evidence only, including alternate mechanisms where applicable; no condition is resolved from a contact alone.

```sh
node scripts/audit-classical-patterns.mjs --interference
node scripts/audit-classical-patterns.mjs --interference --rows
node --test test/pattern-classical-v2.test.mjs
npm run test:failures
```

Separate Shen 67 and Xu 34 development cohorts, with 14 Shen exclusions. Pair counts are chart-level contacts; preservation and separation counts are candidate-specific witnesses and can repeat across candidates. Four synthetic test groups passed in isolated JavaScript against the actual new module with adapted assertions: adjacent/remote competition, day participation, partial charts, protected hidden anchor, reverse generation direction, positional mediation, input immutability, and explicit motif evidence mapping. Node 22.16.0 is installed, but git ls-remote failed DNS resolution for github.com in the execution environment. Native corpus execution and full regression remain unexecuted. No runtime or public API changes, no confirmed efficacy, no final outcome authority. Next measure native diagnostics, review contradictory candidate anchor bindings, and adjudicate wealth-resource and owl-food interactions with source-specific positive and negative references before proposing effectiveness rules.


## Role contrast research v1

Source basis: [論印綬](https://www.kaucim.ai/bazi/ziping-zhenquan/lun-yin-shou), [論用神成敗救應](https://www.kaucim.ai/bazi/ziping-zhenquan/lun-yong-shen-cheng-bai-jiu-ying), [論偏官](https://www.kaucim.ai/bazi/ziping-zhenquan/lun-pian-guan), [alternate 偏官 edition](https://donglishuzhai.net/chapter/3752.html). Search-visible passages support context-dependent wealth control of resource, owl/food abandonment or protection, and regulating excessive food versus disabling the killing controller. The Dongli full-page requests returned HTTP 502; no complete edition collation or validation of actual efficacy is claimed.

Ten explicitly source-inspired role hypotheses reuse the core directed occurrence graph and existing efficacy screen. Distinct physical slots are required within a witness. Contrast links share actual roles/occurrences: same wealth/resource/day; same owl/food for protection or food abandonment (the owl is also the transmission resource); same killing/day for competing food control and resource transmission; same food/killing/resource for obstruction, regulation and protection. Resource light/excess, effective control, residual food capacity, abandonment permission and choice of transmission remain unresolved. A conflict-free ordinary weak hypothesis may conditionally exclude a day-strong route, without establishing its opposite. Wealth feeding the same killing is retained as an additional directed edge even if wealth controls the resource. Contacts and competing paths never cancel one another. Scope inherits the upstream legacy candidate anchors; this is not final month-anchor adjudication. No final favorable/unfavorable or pattern selection.

Executed isolated V8 runs of 19 actual repository modules (core graph, base candidate generator, decision algebra, efficacy review and new role module) with both textual cohorts. Adapter uses existing legacy anchor mapping (all non-day occurrences of a candidate stem) and stem-contact IDs; excludes storage projection, full v10 orchestration, and strength proxy. These are structural diagnostics, not the native CLI results:

| Cohort | charts | base candidates | role witnesses | exact-role contrast links | all screens met | errors |
|---|---:|---:|---:|---:|---:|---:|
| Shen eligible | 67 | 136 | 682 | 454 | 0 | 0 |
| Xu | 34 | 72 | 603 | 479 | 0 | 0 |

Xu: 26/603 witnesses entirely visible, 577 include hidden-access blocker; nonadjacency 469, target substantial root not established 472, local rooted source control 419, unresolved relative control evidence 528. Counts overlap and count candidate/witness occurrences, not independent charts. This is a diagnosis of the stringent inherited screen and broad occurrence enumeration, not a failure rate of classical doctrine. It motivates explicit hidden-stem accessibility and route-specific sufficient-condition controls rather than loosening all gates or adding weights. Summary now reports visible-only witnesses and blockers by both unique input charts and witness counts. Three synthetic test groups passed against actual final research modules with adapted assertions.

```sh
node scripts/audit-classical-patterns.mjs --role-contrasts
node scripts/audit-classical-patterns.mjs --role-contrasts --rows
node --test test/pattern-classical-v2.test.mjs
npm run test:failures
npm run audit:architecture
npm run audit:layout
npm run audit:dead-code
```

Native full checkout remains blocked by GitHub DNS failure (Node 22.16.0 available). Native test suite, v10+strength integrated CLI and policy equivalence remain unexecuted. No public runtime changes. Before merging or adding a definitive selection model, run the native suite and inspect structural blocker distribution, compare independently adjudicated positive/negative role witnesses and resolve the candidate-anchor/access distinction.


## Actor access and month-anchor ablation v1

Engineering revision of the existing candidate/occurrence contracts, not a new doctrinal rule. Source context is the existing [month-command evidence](../src/core/month-command.js), [candidate source](../src/features/pattern/candidate-source.js), [stem force](../src/core/stem-force.js) and [root dynamics](../src/core/root-dynamics.js). No new classical source collation. A textual four-pillar record does not determine the elapsed time since the solar term; therefore the principal hidden stem is not assumed to be the actual commander (司令).

The access review separates (1) literal month source, (2) exact projected visible actor, (3) same-element root/context, (4) independent hidden action (unresolved). Hidden exact projection excludes the day-reference stem; its exact day match is stored separately. Same-element opposite polarity is not exact projection. Visible root observations retain the actual hidden occurrence and clash exposure. Unknown hour prevents an absence claim. Stem-to-stem, same-pillar stem/branch, cross-pillar stem/branch and branch-to-branch edges are classified separately; these are physical-layer contexts, not effect decisions. Exact visible counterpart IDs are alternatives, not rewritten edges or verified transfers.

Month principal retains its actual month hidden source and matching non-day visible actors; projected month candidates retain the exact month source plus the declared visible positions. Storage hypotheses retain declared projected actors and monthly same-element context, not an invented exact stem. Formation and peer-class candidates retain contextual evidence only; neither is assigned a new active anchor. The scoped anchor set is a subset of the legacy set. Other same-stem hidden occurrences remain in the graph, not direct month anchors. The original public outputs and all original candidate inventories are unchanged. The parallel scoped projection exposes only candidate IDs/family/anchors for role-contrast ablation and must not be used as a complete outcome object. No new weights or force thresholds.

Executed 18 actual repository modules (core graph, candidate generator, storage projection and access review) in isolated JavaScript from d8b392d. Adapter reproduced the legacy same-stem anchor mapping and derived hidden clash flags from the actual structure. All 101 eligible textual charts completed; this is not a complete v10 native evaluation. Later 8a3328d narrows the ablation projection and distinguishes missing-hour projection from absence; complete-chart access counts unchanged by those changes.

| Cohort | charts | candidates | legacy candidate-anchor links | scoped links | excluded links | errors |
|---|---:|---:|---:|---:|---:|---:|
| Shen | 67 | 141 | 327 | 204 | 123 | 0 |
| Xu | 34 | 74 | 178 | 120 | 58 | 0 |
| Total | 101 | 215 | 505 | 324 | 181 | 0 |

These are candidate-occurrence links, not independent actors or proven erroneous historical labels. Formation-only context can also account for removed links. Access classification found 300 exact-projected and 775 unprojected hidden occurrences across the two cohorts, and 494 visible-visible, 858 vertical, 2599 cross-pillar mixed-layer and 3453 branch-branch potential edges. All remain structurally observed, with no confirmed hidden action. Four synthetic test groups passed on the final module; an initial distance binding defect (position object instead of position string) was detected and fixed before the corpus run. Full V10+role contrast comparison attempts exceeded the connector call limit; no scoped role-witness count or accuracy is claimed.

```sh
node scripts/audit-classical-patterns.mjs --access
node scripts/audit-classical-patterns.mjs --access --rows
node --test test/pattern-classical-v2.test.mjs
npm run test:failures
npm run audit:architecture
npm run audit:layout
npm run audit:dead-code
```

The native CLI compares legacy and scoped role-contrast witnesses on identical full v10 graphs, without the strength proxy to isolate anchor scope. Native regression still pending. Next: actually run this comparison, then evaluate layer-specific mechanisms and independently adjudicated positive/negative references. Do not simply remove the inherited hidden-access blocker or treat exact projection as effective hidden action. No main merge or final decision authority.


## Layer-specific mechanisms and coherent projection v1

Research-only engineering refinement; uses the existing hidden-stem convention, actual interaction context, access review and efficacy screen. No new classical source collation or effective-force thresholds. The literal presence of a principal constituent is not a claim that it commands the month. Six mechanism classes: direct visible relation; vertical principal relation; vertical nonprincipal constituent relation; branch-principal relation; branch-constituent relation; cross-pillar mixed relation. Principal/middle/residual labels are preserved separately at both endpoints. For a vertical relation the principal stem/branch relation is a literal structural observation, not an independent hidden actor with a separate external root requirement. Nonprincipal constituent participation is explicitly unresolved. For branch-to-branch relations distinguish a mere elemental relation from a shared actual branch formation/disruption context (including incomplete formation candidates); the latter does not prove the elemental action. Contact with only one endpoint is kept separate from a shared two-position context. For cross-layer transfer, look for exact visible counterparts and actual directed edges; the hidden edge itself remains unresolved. Preserve all legacy reasons for auditing. For visible-visible relations, the new screen must be equivalent to the existing screen. Branch formations, disruptions, clash exposures, competing local pressure and distance are evidence, never cancellation or automatic transformation.

The coherent projection review enumerates one assignment of visible occurrences to all roles in a hidden-participant witness. Require distinct visible actors, exact projection alternatives, actual directed edges of the same kinds, and a visible actor from the scoped candidate for its anchor role. Do not combine independently projected edges if they require inconsistent assignments or collapse multiple roles. No visible actor is created and no hidden occurrence is replaced in the original graph. Retain the additional wealth-generates-killing edge if it appears in the projected assignment. Passing all primary edge screens is not a complete path efficacy decision. Deduplicate alternative assignments by chart/candidate/pattern/role mapping while separately reporting original witness references.

Execution on 17 actual source modules (core, access, efficacy, layer modules; adapted ESM loader and stem-force occurrence/clash adapter, no candidate or role pipeline) at c44e16b, 101 textual charts, zero errors:

| Layer | Shen 67 | Xu 34 | Total | With separate visible alternative (total) |
|---|---:|---:|---:|---:|
| visible-visible | 330 | 164 | 494 | n/a |
| same-pillar mixed | 584 | 274 | 858 | 188 |
| cross-pillar mixed | 1758 | 841 | 2599 | 584 |
| branch-branch | 2364 | 1089 | 3453 | 194 |
| Total | 5036 | 2368 | 7404 | 966 |

Vertical principal 322 and nonprincipal 536; branch principal-principal 483 and at least one nonprincipal 2970. Shared branch context 1988 of 3453, elemental relation only 1465. All 494 visible screens exactly matched the old screen (22 necessary-screen-met, 472 review-required); all 6910 hidden-participant edges remain unresolved as effects. Visible alternatives are separate edge evidence, not extra effective actions.

Additional executed integration on 19 actual modules: Xu principal-only adapter for resource/food/killing families (17 of 34 charts; no alternate projection/storage candidates, no full v10 or strength proxy). Of 250 scoped hidden role witnesses, 40 had coherent visible alternatives, 210 had none observed; 42 alternative references deduplicate to 11 chart/candidate/pattern/role assignments. Zero all-primary-screen passes, zero errors. This demonstrates why edge-level projection availability must not be mistaken for complete route availability. Two synthetic test groups passed on actual final module sources with adapted assertions, including branch context, distinct actor assignments, anchor restriction, invalid edge binding and deduplication. Native tests include an additional complete cohort invariant.

```sh
node scripts/audit-classical-patterns.mjs --layers
node scripts/audit-classical-patterns.mjs --layers --rows
node --test test/pattern-classical-v2.test.mjs
npm run test:failures
npm run audit:architecture
npm run audit:layout
npm run audit:dead-code
```

Native checkout was reattempted: Node v22.16.0 available, git ls-remote failed DNS resolution for github.com. Full native v10 audit, role projections across every candidate, and full regression remain unexecuted. No main merge, runtime/public API change or final efficacy authority. Next prioritize a source-adjudicated set of positive and negative vertical/branch/visible route cases with exact participant annotations; examine the 22 passing visible screens and the 11 deduplicated principal-only alternatives to identify false positives/negatives of the necessary screens. Avoid adding more unvalidated diagnostic models or treating fewer blockers as better classical accuracy.


## Source action reference v1

Frozen overlay [pattern-action-reference-v1.json](../test/fixtures/pattern-action-reference-v1.json) binds 12 source interpretations to 11 existing charts without changing any existing chart eligibility. Sources checked in this pass: Dongli [論印](https://www.donglishuzhai.net/chapter/3748.html), [論食神](https://www.donglishuzhai.net/chapter/3750.html), [論偏官](https://donglishuzhai.net/chapter/3752.html), [論生尅先後](https://donglishuzhai.net/chapter/3733.html), the [alternate 偏官 transcription](https://changxianyi.com/guji/ziping/nlc-continuation-text-review-20261005/pianguan/), [Xu commentary](https://ncc.com.tw/fate/paleo/bg/bg_033.htm), [alternate Xu transcription](https://dao.time.actor/ziping-zhenquan-pingzhu/juan-3) and [Xu order commentary](https://sanqing.com.tw/en/%E5%AD%90%E5%B9%B3%E7%9C%9F%E8%AE%AE%E8%A9%95%E6%B3%A8/). Electronic witnesses may share textual ancestry. These are one-pass annotations, not independently adjudicated or empirical truth; no held-out cases are claimed.

Occurrence bindings are annotator mappings from source-described roles (not claims that the text names each exact occurrence). An existential target set preserves source ambiguity when stems repeat. Each probe requires an actual directed relation and, when annotated, actual pair contact. Source labels distinguish supported action, limited action and explicitly blocked action. Limited is not equivalent to zero effect. Route interpretation is distinct from an isolated edge effect. A pre-rescue explanation is not a label for the complete natal configuration. The previously excluded Tuotuo example remains excluded although two electronic texts display 甲辰. Three partial textual contrast templates are not completed into invented charts. The Zhou example uses 戊 for 丁 day: the exact ten-god is 傷官 rather than 食神, although the author uses food/output terminology broadly. This calls for source-scoped output roles, not global conversion of all 傷官 into 食神.

Executed with 18 actual source modules in isolated V8 (core, access, layer, efficacy and reference review) at 9409e32; the adapter uses actual stem-force occurrences, derives hidden clash flags from the core structure, and uses actual interaction formation IDs for pairs. No v10 candidate pipeline or strength inference used. All 12 references bound to their graph (including excluded and phase-only examples); 0 errors. The directly comparable source references are only eight, with the following observed result:

| Author | Supported | Limited | Blocked | Screen passing | Screen withheld |
|---|---:|---:|---:|---:|---:|
| Shen | 3 | 0 | 0 | 0 | 3 |
| Xu | 2 | 3 | 0 | 0 | 5 |

Of the other four references, two are route interpretations, one is a pre-rescue explanation and one is an excluded source variant. All are evaluated for structural binding only outside the comparable denominator. The current necessary screen withholds all supported and all limited examples, hence does not distinguish them on this development overlay. This is not a measured false-negative rate or empirical accuracy: the screen does not predict efficacy, and there are no comparable blocked references. No new native runtime policy is proposed. In particular, nonadjacency appears in at least one alternative of each of the five supported comparable examples, but the Wang example also has an adjacent alternative. Later 5ef14bb adds shared blocker counts (intersection per failed existential probe) to avoid misreading union counts as unavoidable. The initial actual run predates that summary-only addition; its comparison counts are unchanged. The five supported examples also expose root, contact, local control and relative-evidence concerns. Do not relax all concerns together; next test explicitly source-scoped mechanisms with stronger positive and negative adjudication.

Two synthetic test groups and the source inventory/invalid provenance controls passed using the final actual reference module in isolated JS. Native audit added, with corpus identity and scope assertions; native checkout remains blocked (Node 22.16.0, git ls-remote could not resolve github.com). No runtime/API changes or main merge.

```sh
node scripts/audit-classical-patterns.mjs --action-references
node scripts/audit-classical-patterns.mjs --action-references --rows
node --test test/pattern-classical-v2.test.mjs
npm run audit:layout
npm run test:failures
```


## Action requirement policy v2 (research only)

Separate three evidence responsibilities: structural requirements (complete chart and actual directed relation; effect-specific conditions remain unknown), supporting observations (substantial roots of each participant, locality, relative force evidence), and interference (exact same-pair stem combination, other stem contacts, exposed roots, local control pressure, intervening control or two-step generation). A supporting observation that is false is not a negative effect label. An interference observation is not cancellation. Missing hour remains partial. Mixed/hidden participation remains a distinct unresolved effect requirement. This policy does not change the v10 graph, legacy screen, candidate decisions, or public API.

Purposes are derived from the actual ten gods and edge direction before any reference label is read. Wealth control of resource creates competing damage and regulation hypotheses, with different unresolved context conditions. Strict food control of killing and hurting control of killing are separate hypotheses. Resource control of hurting is distinct from resource control of food. Killing generates resource requires transmission, support and competing pressure review, not merely a favorable edge. Broad output controller scope is a separate candidate-scoped structural probe (exact scoped target, 식신 vs 상관 retained), not a replacement for strict food routes. No broad output label is used to assert a final pattern.

Important source ambiguity: [Dongli 論印](https://www.donglishuzhai.net/chapter/3748.html) prints 不要根深 and records the 中州 edition's 祗要根深; [Xu parallel text](https://dao.time.actor/ziping-zhenquan-pingzhu/juan-4) prints 只要根深 and adds the Wang chart's combination and favorable luck conditions. This is a material disagreement about root requirements. Retain both explicit variants; do not resolve one by choosing the version that fits a development case. [論偏官](https://www.mastervt.com/books/zipingzhenquanpingzhu/juan-1/chapter-041) discusses context-sensitive regulation and food/killing relations. No independent philological adjudication or learned threshold is claimed.

Executed 19 actual source modules in isolated JavaScript at 1bc307a (core graph and access/layer/efficacy/reference/requirement reviews; raw pillar transcription conversion, actual stem-force occurrence and clash adapter, no complete v10 candidate pipeline). All 12 references executed, 0 errors. Of eight directly comparable source interpretations:

| Source state | Exact-pair combination review | Hidden source review | Hidden target review | Visible conditional review |
|---|---:|---:|---:|---:|
| supported (5) | 1 | 0 | 1 | 3 |
| limited (3) | 2 | 1 | 0 | 0 |

These counts are reference-level presence of a review type (multiple types can coexist in other samples), not efficacy predictions. Wang's supported reference also has exact pair combinations, so contact alone cannot discriminate success and limitation. The Zhou scoped month-principal adapter observes one strict-food edge and four broad-output edges; the year 戊 to monthly 癸 relation is retained as 傷官, not relabelled 食神. Later 35c1d3d adds explicit source variants and resource-hurting context; final two synthetic test groups pass including both variants. The earlier partial execution predates this metadata/purpose addition; review-type totals are unchanged by construction, not independently re-executed on the final commit.

```sh
node scripts/audit-classical-patterns.mjs --action-requirements
node scripts/audit-classical-patterns.mjs --action-requirements --rows
node --test test/pattern-classical-v2.test.mjs
npm run test:failures
```

No native full-suite execution in this pass. Prior checkout DNS restriction remains unresolved; isolated module execution is not a substitute for native regression. All effects remain null, no confirmed success/failure classification or holdout accuracy. Next prioritize annotation refinement and independent negative references, then mechanism-specific sufficient condition tests. Stop adding parallel research layers until the native integration and review denominator are verified. No main merge.
