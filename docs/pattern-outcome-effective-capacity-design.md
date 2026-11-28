# Effective capacity policy — design checkpoint (not an implementation or release)

Baseline: d6843061494179ec7d5fe56b60da5d89e83d7a93. Scope: ordinary natal patterns, initially resource and killing families. No special-pattern, transformation, transit, or final useful-element authority. Traditional interpretive consistency is the target, not empirical predictive validity.

## A. Integration status and corrections

Native checkout retried; GitHub DNS still fails. No current CI run receipt was returned by the repository Actions query. Prior core replay is 26 chart variants / 10 literal probes, not V10 end-to-end. Correct the recorded changed comparison count from 42 to 48 (48/78). Reject empty/duplicate/foreign commander hypothesis coverage before accepting direction agreement; require exact variant IDs and denominators. Reject malformed reviewer IDs without throwing. No changes to final decision gate. Native whole-suite validation still a prerequisite.

## B. Source conditions, separate text from engineering interpretation

Electronic original and Xu commentary reopened 2026-11-25; Donglishuzhai direct pages returned 502, accessible Luckclub editions were read instead. Not a scan authentication. The following table is a limited source extraction, not new gold or a universal doctrine.

| ID | Source / locator | Text-derived condition | Counter-condition or limitation | Proposed computational obligation |
| --- | --- | --- | --- | --- |
| S01 | [論十干得時不旺失時不弱](https://luckclub.cn/bazi/002/008/), text spring/autumn examples and Xu's 旺衰強弱 distinction | Seasonal position and actual support are distinct; rooted out-of-season stems may be strong; in-season stems may be weakened by control/drain. | A favorable season alone is insufficient. | Separate season, literal roots, actual supply and pressure; do not count season as proof of strength. |
| S02 | same, root grades passage and Xu commentary | Root quality matters more than stem count; residual/storage roots differ from stronger roots. | Yin life-stage root treatment is disputed by Xu; no numerical conversion from analogies. | Preserve literal stem, root type and source-specific grade; no universal life-stage-to-weight map. |
| R01 | [論印綬](https://luckclub.cn/bazi/002/037/), Li Zhuangyuan and contrasting weak-day case | Strong day with abundant resource permits output drain. | Weak day and shallow resource with much output do not imply same benefit. | Require day burden and resource adequacy premises separately from output ability. |
| R02 | same, Wang Shilang and Zhexi commentary | Deep resource and strong day may permit wealth moderation. | Light resource, heavy wealth and weak day: resource injury, with peer rescue considered. | Same wealth/resource endpoints, opposing objective hypotheses; do not decide from control edge alone. |
| R03 | same, Mao/Ma passage | Killing supplies resource when the day/resource combination has a shortfall. | Both day and resource heavy changes the objective; Xu interprets Mao differently from a simple ordinary balancing rule. | Retain scope dispute; hidden resource must not be promoted to visible force. |
| K01 | [論偏官](https://luckclub.cn/bazi/002/041/), food control and weak-day passages | Food control of killing depends on the controller and day capacity; mediation by resource may be favored with heavy killing and weak day. | Xu distinguishes yin/yang; not a universal weak-day prohibition. | Assess exact controller/target and day drain/pressure separately; scope the polarity clause to Xu. |
| K02 | same, Tuo Chancellor | Resource can restrain excessive output rather than harm a necessary controller. | If killing strong and output weak, resource can obstruct control. | Assess both demand and control efficacy; dominance is not excess. |
| K03 | same, He Canzheng and Zhou Chancellor | Placement and mediation matter; wealth may remove an obstruction while simultaneously supplying deficient killing. | Wealth can also injure needed resource or reinforce dangerous killing; commentary differs on the interpretation of other charts. | Preserve both directed effects and independent conditions; never net them by sign addition. |

The existing strength source reviews cover 53 primary and 23 secondary directional labels, not per-occurrence role capacity. Existing ten effect probes, six role contrast probes and six unlabeled prospective charts remain exposed or unlabeled; do not convert these into independent labels. No new evidence-based numerical thresholds.

## C. Proposed ownership and contract

Do not add another parallel diagnostic engine. Reuse `outcome-role-capacity`, `outcome-root-context`, `outcome-command-context`, `outcome-role-flow`, `outcome-mechanism` and `outcome-joint`. Strength-decision owns day-direction hypothesis. Root/command modules own structural evidence. A future versioned policy consumes their immutable projections; pattern-specific rules consume policy output, never recalculate roots or override day strength. The existing decision gate alone owns release authority; an externally reviewed policy and clean exact-HEAD native receipt are necessary but not sufficient for authority. A public policy change needs new version and migration tests.

Proposed internal queries (not new public endpoints):

- `assessOccurrenceCapacity(occurrenceId, evidence)`: retain seasonal, rooted, available supply, unresolved supply, pressure/drain/contact separately; state = supported / opposed / conflicting / unresolved for an explicitly named premise, not a free-floating absolute strength.
- `assessDirectedCapacity(from,to,kind,evidence)`: compare exact endpoints, baseline and contextual comparisons and source/command coverage; report hypothesis and blockers; preserve distinct source/target roles. Same physical slot excluded; hidden and group access cannot borrow visible strength.
- `assessRoleDemand(candidateId,ruleId,witnessId,objective,evidence)`: source-clause-specific needs, e.g. required resource preservation or moderation of excessive output; no sum of same ten-god occurrences and no over/under label merely from relative dominance.
- `assessRouteCapacity(routeRef,anchorOptionId,scenario,evidence)`: AND of necessary conditions; alternative routes evaluated separately; no existential alternative evidence reused in a selected scenario. Shared root and relation identity retained, with exact interference and bound threat. Unresolved supply is not zero; opposed evidence is not confirmed ineffective.

Every row carries policy version, exact identity, clause IDs, premise states with provenance, conflicts, missing evidence, scope and `effectiveForce:null`, `effectConfirmed:null`, `selectionAuthority:false` until validated. An observed structural edge is not a sufficient condition. No feedback from demand to natal force, no iterative self-confirmation, no count of true axes as magnitude, no additive scoring. Unknown hour or source disagreement never silently upgraded. Preserve supported and opposed reasons even if overall state unresolved. Comparison coverage checks must be exact; candidate-local contexts cannot be joined by element alone. Physical root identity stays shared, not a supply budget.

## D/E acceptance criteria (next implementation)

1. Native full regression on clean pinned HEAD, fix real failures without changing frozen expected data to fit results.
2. Implement one small vertical slice R02 and K02 through existing role-priority and mechanism policy, not all families at once. Freeze the source clause and implementation assumptions first. Keep current public V10 output and release gate unchanged.
3. Test counterexamples: strong day without abundant resource, weak day with independently protected resource, season-supported rootless actor, out-of-season rooted actor, same physical slot, missing hour, missing source variant, duplicated support, competing combination and simultaneous wealth supply/control. Opposing source readings remain separate.
4. Report exact premise and route coverage, agreements/disagreements/abstentions by explicit source versus proxy and family; no pooled accuracy over unlabelled cases. Use independent review tasks with exact role/objective labels in a new packet version, not existing predicted labels; no claim of independent validation until genuine reviewers and source verification are available. Exposed development examples (Wang, Zhexi, Tuo, Zhou) are not held-out data.
5. Only after these conditions, design P2 outcome resolution with a versioned decision policy. This checkpoint does not implement effective force or grant authority.

## D initial vertical slice

Implemented in the existing role-priority module, integrated at the candidate mechanism composition boundary under rolePriority.objectiveReview (version role-objective-policy-v1). Source rechecked: 論印綬 R02 (Wang and light-resource contrast) and 論偏官 K02 (Tuo and strong-killing/light-food contrast). Both alternative objectives receive named conditional premises and explicit unresolved requirements. R02 uses exact wealth/resource/day, corresponding regulation and bound rescue references; weak-day, wealth-relative profile, control and resource-to-day supply are a conservative injury hypothesis, not a source-equivalent proof of light resource. Strong day plus rooted resource is insufficient for excess; preservation remains unresolved. K02 only applies to literal 食神, not the broader 傷官 damage template; food/killing comparison is a proxy and day burden remains unresolved. Relative evidence may support chart-conditional review if commander is not assessed and no other cautions occur; known disagreement or missing coverage cannot be bypassed. Root observation is not weakness proof, and hidden access is not granted. Exact registry/route coverage, role and physical slot identity fail closed. Existing mechanism hypotheses and release authority unchanged; no force weights, effective verdict or final objective chosen. Seven isolated synthetic tests executed. Existing role-flow audit records objective hypothesis counts and validates abstention; native source replay remains pending due DNS. Neither exposed fixtures nor tests are independent gold.

## D-2 K01 food control versus resource mediation

Rechecked [論偏官](https://luckclub.cn/bazi/002/041/) original and Xu commentary, including the strong-food/healthy-day clause, polarity distinction, He Canzheng placement example, weak-day/heavy-killing alternative and Tuo/Zhou countercontexts. [論偏官取運](https://luckclub.cn/bazi/002/042/) reinforces the day capacity condition; transit prescriptions are not imported into natal policy. Food strategy uses exact existing killing-food witness and mechanism route, with day drain and killing pressure separately recorded. Weak yang opposes the Xu day fitness premise; weak yin stays unresolved rather than universally opposed. The original healthy-day and Xu polarity readings remain visible. A resource mediation path is assessed independently even without food support, by the same existing createEffectContext and evaluateMechanismEdge functions on exact raw core edges. It is not added to the support registry. Distinguish general mediation capacity from the weak-day motive. Visible wealth/resource control and wealth/killing generation remain distinct; absence of observed visible contact is not confirmed preservation. Compare only same killing/day and distinct physical slots; shared killing pressure and resource-to-food control are not netted. Output under rolePriority.killingStrategies. No preferred strategy or final efficacy, no changes to frozen labels, release gate, force weights or search. Seven synthetic tests and audit counters. Full native validation and actual source replay pending.

## D-2 correction and D-3 K03 wealth objectives

Reopened [論偏官](https://luckclub.cn/bazi/002/041/) original and Xu commentary. Zhou (戊戌 甲子 丁未 庚戌) describes simultaneous removal of the output obstruction and nourishment of insufficient killing; the actual visible output is 傷官 and the monthly killing is hidden. He (丙寅 戊戌 壬戌 辛丑) illustrates mediation and positional separation of wealth/resource. Liu's strong-day/light-killing contrast motivates an alternative supply objective, not a final inference or a new combination rule. The text's assertions are traditional interpretive claims, not empirical gold.

D-2 `killing-strategy-policy-v2` binds actor identity to the original occurrence inventory, rejects duplicate visible physical slots and validates literal food edge IDs. Transfer capacity is separate from actual preservation: `transferConditionalStatus` combines the two generation premises, while resource preservation is always unresolved; the visible-control observation is scoped and partial-safe. Interference now distinguishes structural contact from its capacity hypothesis and suppresses joint claims for missing hour. An opposed contact is not confirmed harmless.

D-3 `killing-wealth-policy-v1` is composed under `rolePriority.killingWealth`. It consumes existing registered wealth-generation damage witnesses, the exact preexisting compound rescue/supply motif (including bound threat and exact four path identities), and D-2 mediation contacts. No second witness search or force engine. Conditional objectives distinguish output restoration, needed killing supply, dangerous killing reinforcement, needed resource injury, and mediation supply. Day direction and contextual relative profile are only premise evidence; actual role demand, output restoration, killing deficiency, protection, and effect remain null. Placement records distance but does not grant protection. Hidden killing remains a structural participant, not a proven effective recipient. The Liu combination detail and all transit prescriptions are outside this slice. No numerical weights, net arithmetic, frozen label changes or new selection authority.

Verification: 13 K01/K03 and 7 R02/K02 synthetic tests passed in isolated JavaScript evaluation of the actual checked-in policy, stem helpers and compound motif, with import stripping and a small assertion adapter; not a native Node test receipt. Two native V10 source-chart probes (Zhou and He) added to the existing role-flow test; role-flow audit records K03 counts and both exact source-chart probes separately from the six-case contrast denominator. Native checkout still blocked by GitHub DNS in execution environment. Full npm test, role-flow audit and V10 audit must run on exact HEAD before E/P2. No independent gold or efficacy accuracy established.

## D-4 R01 resource-supported day drain and R03 killing supply

Rechecked [論印綬](https://luckclub.cn/bazi/002/037/) original and Xu commentary. R01 distinguishes strong day with abundant resource and usable output from weak day with shallow resource and heavy output. The Li example has a textual 戊/己 discrepancy; the actual natal stem is retained, not silently corrected to match commentary. R03 distinguishes strong day/light resource, weak day/heavy resource (Mao, exceptional scope in Xu), and both-heavy conditions. Ma illustrates killing supplying resource despite rooted day and output drain. Ordinary officer can have an independent role and is not evaluated by the killing-shortage clause. Neither special-pattern applicability nor officer purity is granted.

`resource-strategy-policy-v1` under `rolePriority.resourceStrategies` consumes exact registered output-regulation witnesses and evaluates each anchor binding independently. It uses existing root review and mechanism evaluation on literal raw edges; no new support witnesses. Rooted supply is not role abundance. Output access and resource-to-output obstruction are independent; absence or opposition of an observed control relation is not confirmed preservation. R03 records supply, delivery, day pressure and visible wealth contacts without netting, with distinct ordinary and source-scope-review objectives. Existing R02 remains the wealth moderation/injury policy. Unknown hour suppresses directional evidence. No changes to numerical weights, frozen labels, strength, formation or final selection authority.

Verification: 8 added R01/R03 synthetic tests plus 20 prior policy tests passed in isolated execution of actual source functions with import stripping and assertion adapter (28/28; not native Node). Native Li and Ma V10 regression tests and source-coverage audit added; no independent gold or source efficacy agreement established. GitHub DNS failure reproduced with git ls-remote, so the full native suite and audits still require local execution. Next D-5 should consolidate common premise, actor, edge and route identity contracts; no new parallel force model.

## D-5 shared role contract and declared interaction projection

`outcome-role-contract.js` owns the shared premise constructors/composition, day-direction projection, route and edge keys, unique actor/witness/registry coverage, physical slot distinction, and raw versus registered edge readers. D1/D3 registry-only policy consumers retain the narrower input contract; D2/D4 verify original actors and raw edge identities. Source-specific interpretation remains in `outcome-role-priority.js`. Existing policy result shape and version retained; 51 calls across the prior 28 policy tests produced equal canonicalized result objects before/after refactoring. This is fixture parity, not exhaustive public API equivalence. Malformed duplicate/foreign identity evidence may now be rejected earlier.

`outcome-role-interactions.js` adds `rolePriority.interactions` (role-interaction-contract-v1). It projects only declared candidate-local relationships: competing D1 interpretations on one witness, D2 paired food/mediation contact and shared killing pressure, D3 bound rescue/supply as a simultaneous context, D4 alternative anchor bindings for one output witness. Shared literal uncontested root IDs retain all scoped uses; no independent supply, conflict, selected anchor, or net effect is inferred. Shared root observation is not allocation of a resource budget. Alternative allocations are not simultaneous; competing interpretations are not necessarily logically exclusive. Existing JointOutcome owns general allocation search and its constraints; no parallel search is introduced. No new classical claims, force weights, labels, or decision authority.

Verification: prior 28 policy tests and 8 new contract/interaction tests passed in isolated JavaScript execution (36/36); import stripping and assertion adapter, not native Node. New test file registered in pattern domain; native Zhou V10 interaction regression and role-flow audit counters added. Native git ls-remote reproduced DNS failure. Full native suite, exact-HEAD audit, and independent reviewer evidence remain required for E/P2. Future extensions of interaction projection must declare explicit relationship types rather than arbitrarily cross-join every policy objective.

## E-1 source-policy replay packet and literal preflight

Re-read the electronic original and Xu commentary in [論印綬](https://luckclub.cn/bazi/002/037/) and [論偏官](https://luckclub.cn/bazi/002/041/) on 2026-11-25. The new `pattern-outcome-role-policy-source-v1.json` is a separate exposed development packet, not an alteration of the frozen source/contrast datasets. It has 12 distinct source charts (seven previously used in role-policy development plus five additional source/scope probes), 13 objective/route probes, 27 full-chart endpoint references, and two input variants per chart (24 total). The additional cases are Mao Zhuangyuan, Zhang Canzheng, the pure yin food-control example, Chang Guogong, and Cheng Qian. Original/Xu/Lin disagreements are explicit scope strata rather than consensus labels. No claimed empirical accuracy or independent gold.

The evaluator projects only exact candidate-family and participant matches and objective identity, retains every matched candidate status, separates literal chart endpoints from interpreted ones, reports missing candidate family or missing route/objective as gaps, and separates full vs missing-hour input. An observed objective with unresolved conditions is not a source agreement. The audit reports direction separately from policy coverage, including disputed-scope strata, sets of candidate states, premise observations and decision blockers. Missing-hour variants must not promote directional day premises. Duplicate charts/probes/variants and leaked authority fail closed. Source gaps are reported rather than silently dropped or converted into negative verdicts. No assertions on actual efficacy.

Actual verification: the literal preflight ran the existing core natal, element, ganji and hidden-stem functions from the pinned repository, using isolated JavaScript execution with import stripping. 24/24 variants passed natal validation and exact selected role checks; 27 full-chart endpoint references were observed and seven hour endpoint references were correctly omitted in partial variants. Seven evaluator/preflight tests passed (including the 24-variant test). This is not a native Node test receipt and not a V10 end-to-end replay. The preflight confirms Tuo's monthly principal is 食神, while his chapter's source family is killing; the possible storage/projection scope gap needs full-engine verification. Chang's monthly principal is 食神 and his cross-family example is explicitly unprobed by the current killing-family policy. Zhou's visible 戊 is 傷官. These are core literal facts, not final classical verdicts.

Run `npm run audit:pattern-outcome-role-policy-source` for full E-1 evidence, and existing role-flow/V10 audits plus npm test. Direct git checkout still fails DNS; archive retrieval unavailable and the dependency-loading attempt exceeded connector tool call limits. No full-engine replay counts or effect agreement were produced. E-1 remains open until native replay and discrepancy triage are complete; E-2 independent reviewer work and P2 authority remain gated. No production policy changes in this slice.

## E-1A discrepancy reproduction and E-1B evidence triage

User-reported local E-1 replay (packet role-policy-source-replay-v1, commit not independently attested): 24/24 literal and V10 variants executed; errors empty; all 13 specified full-chart probes observed; ten unresolved, two conflicting, one opposed; six probes retained with omitted hour, seven route/objective gaps. Eight source direction labels: three aligned, four unresolved, one opposed (Mao, disputed special scope). Chang has no route probe in this packet; 13/13 does not establish general cross-family coverage. This is structural coverage, not effectiveness or independent accuracy. Full native suite/release receipt not supplied.

Reproduced the following three directed edges with actual natal/stem-force/relative-force/formation/root-context/efficacy/mechanism functions from the previous HEAD in isolated JavaScript. No exact birth instant was available; no month commander was selected.

| Source probe | Legacy result | Original and contextual evidence |
| --- | --- | --- |
| Tuo, visible month 甲 → visible hour 戊 | conflicting | Original mixed: seasonal support on source, principal support on target. Target's four substantial 戊 roots are all clash-exposed; source has residual 乙 only. Contextual sensitivity unresolved; both nonseason/root and locality need review. |
| Zhou, visible month 甲 → visible year 戊 | conflicting | Original and root-sensitive mixed. Season-only favors source; nonseason favors target (exact and own-pillar substantial roots). Not a resolved force ordering. |
| Zhou, visible hour 庚 → visible month 甲 | opposed | Target profile dominates even after root sensitivity. Source has only same-element residual 辛, no substantial root; indirect supply is observed but not certified, source pressure and nonadjacency unresolved. The possible classical rescue is not disproved by this profile comparison. |

The audit previously stripped all underlying premise evidence. The new audit-only `pattern-outcome-role-policy-triage.mjs` retains original premise state and evidence, exact directed participants, oriented original/root-sensitive/nonseason/season-only comparison axes, root slots and local supply, mechanism conditions, command availability and non-exclusive diagnostic reason codes. It does not alter production policy, conditions, original fixture, label denominators, selection authority or effect. The summary reports repeated premise reason observations separately from probe status sets, and distinguishes explicit hour endpoint removal from indirect dependency review. No causal loss or actual demand is certified. The two distinct mixed-profile causes must not be converted to arbitrary weights or corrected by changing source labels. The next E-1B step is to distinguish supported generation pathways with indirect supply from direct-root screening requirements, while retaining hidden access, contextual pressure and preservation as unresolved where appropriate. Any policy revision must be independently tested, not tuned solely to these exposed cases.

Verification: 9 evaluator/literal/triage tests and 3 actual core source-edge tests passed in isolated JavaScript (12/12 on the existing source test file). The three edge tests load the actual core and mechanism modules. Not native Node ESM or full V10 replay; direct checkout restriction remains. Run the updated audit to obtain `triage` and verify baseline coverage/status parity. E-1A root-cause reproduction complete for these three edges; E-1B audit decomposition implemented, efficacy policy redesign and native validation remain open.

## E-1B-2: grounded local supply and structural generation review

User-reported native E-1A/B replay at the previous main revision: 12/12 tests passed, audit errors empty. All seven lost probe endpoints explicitly reference visible hour; no indirect-only gap was observed in that packet. This is an endpoint classification, not a causal intervention on the full chart. The repeated premise reasons include 33 role-demand/context gaps, 33 command-not-assessed, 18 generation comparison context gaps, 17 pressure gaps, 17 contested-root contexts, seven source direct-root gaps, five indirect-supply observations, and six target receptive-root gaps. Do not sum reasons as independent observations.

New `outcome-grounded-supply.js` is a chart-level research evidence projection, consumed once by the efficacy composer. It reuses original stem-force graph relations and root-context local supply evidence, checks exact physical root IDs and their projected state, preserves direct roots, seasonal evidence, supply paths and pressure separately. A local branch donor uses only its own nonresidual constituents, not other branches' roots. Visible donors require their original uncontested root evidence. One-hop supply cannot recursively bootstrap itself or confer an independent root quantity. A target's direct-root absence does not block a structural generation screen if the source basis and contextual screens are met. Hidden recipients remain review-only, partial charts cannot pass screens, and both donor and recipient pressure remain explicit without cancellation. Existing relative comparisons and legacy mechanism status, objective status and decision authority are not replaced. The new field is `efficacyReview.mechanismReview.groundedSupply`; no final force, throughput, preservation, control or role-demand claim is added.

Actual isolated replay of the final core projection on the unchanged 12-chart source packet (24 complete/partial variants): all 24 valid. Complete-chart observations: 34 rooted local paths to visible recipients, three pass the local path screen, five visible recipients lack an established direct root but have at least one observed path, zero existing literal generation actions pass the stricter generation context screen. These are counts of paths/occurrences, not effective supplies. Zhou's hour 庚 receives two observed local earth paths: day branch 未中 己 and hour branch 戌中 戊. Both have donor and recipient pressure review; no screened path, no reversal of the legacy opposed control profile. Tuo's contested 戊 roots are not promoted. The artificial independent-pillar case 乙卯/乙卯/丁卯/乙卯 passes the direct-root-source generation screen despite recipient 丁 lacking substantial roots; this is a constructed structural control, not a verified historical birth. Seven new non-V10 tests passed in isolated execution of actual core and audit functions. Native V10 integration test is added but not executed here. The source audit now reports `groundedSupplyCoverage`, per-variant counts and exact source-edge evidence in triage. Native full suite and updated end-to-end audit remain required. No source labels changed, no independent gold added.

## E-1B-3: rooted protection and mediation path review

The additive `outcome-interposition-review.js` consumes the existing `stemForce.protectionAndMediation` candidates and the validated root-context / grounded-supply projections. It does not regenerate elemental relations or reinterpret candidate paths. Every edge is checked against the exact graph-node identity, element direction, physical position/layer, distance/locality, literal substantial-root positions, contacts and null effect contract. Shared hidden constituents are grouped by physical graph node; duplicate paths are deduplicated and their source occurrence IDs retained.

Scope follows the core root-dynamics contract: targets are only the day master and visible peer/resource stems. Hidden/branch targets and visible targets outside that scope are explicitly counted as excluded, not silently treated as failed paths. For protection, both control edges form the local chain. For mediation, the two generation edges form the chain; the direct threat-to-target control edge may be nonlocal, as documented by root-dynamics v1. The direct edge's distance is still preserved. All three participants must occupy distinct physical slots.

Each candidate retains helper, threat and target root access separately; visible stems use their root-context positions, while a branch helper uses only its own local nonresidual constituents. Hidden participants remain review-only. Contacts and all incoming control pressures are preserved. A helper under a rooted or unresolved controller cannot pass the structural screen. Additional pressure on the threat and target is exposed separately. Target direct rooting is not a prerequisite for observing a structural path. No path cancels the original control edge, no pressure is subtracted, and no effect, neutralization, strength or role-selection verdict is produced. The public research field is `efficacyReview.mechanismReview.interpositionReview`, with `selectionAuthority:false`, `effectConfirmed:null` and `neutralizationConfirmed:null`.

Actual isolated execution of the current core and new reviewer (source modules loaded in a dependency-stripped JS adapter, not native Node ESM): XU08 戊戌 甲子 丁未 庚戌 produced 19 in-scope candidates (14 protection, five mediation) and 115 excluded target paths (85 hidden/branch targets, 30 non-supportive visible targets). The documented protection candidate `day:branch:earth -> month:branch:water -> day:stem` was reproduced with two local control edges. Its helper has a rooted local controller from `month:stem`, so the path is blocked by helper-pressure review; its helper and threat are hidden branch constituents, so hidden access also remains unresolved. This is not evidence that the protection succeeds.

For the separate constructed chart 庚申 壬子 甲寅 丙午, 21 in-scope candidates (11 protection, ten mediation) and 101 excluded targets (71 hidden/branch, 30 non-supportive visible) were observed. The mediation chain `year:stem -> month:stem -> day:stem` has two local generation edges and a nonlocal direct threat-control edge (distance 2). The reviewer correctly preserves the local chain without misclassifying the remote direct edge as a nonlocal generation chain. However, the helper and threat root projections are contested and helper-control context is unresolved, so the candidate does not pass the structural screen. On the XU08 missing-hour variant, eight in-scope candidates remained partial and none passed. Six isolated contract checks passed for target scope, path identities, local mediation-chain semantics, target-root independence, partial-hour abstention and fail-closed tampering. The native test file adds eight tests including V10 composition and audit checks, but native Node execution and full suite remain unverified.

The path counts are candidate graph observations, not independent units of power; shared nodes and overlapping paths are not additive. E-1B-3 does not revise the original efficacy or decision policy. Next, native verification and a review of additional controller context are required before E-1B can close.

### E-1B-3 replay correction and complete source-packet coverage

The first 24-variant run exposed four fail-closed cases (Li resource-output, Mao killing-resource, Cheng killing) because the interposition validator conflated two different root observations. Core `unexposedSubstantialRootPositions` excludes clash-exposed roots only; root-context access can additionally be `formation-contested`. Treating every non-grounded root as clash-exposed incorrectly rejected valid graph evidence.

Corrected the contract to compare:
- all substantial positions against the union of grounded and contested literal root IDs;
- clash-only-unexposed positions against root-context slots whose state is not `clash-exposed`, including `formation-contested`;
- grounded versus contested access as a separate root-context dimension.

After correction, the unchanged 12-chart source packet replayed in the isolated actual-core adapter with **24/24 valid outputs**: 12 full diagnostic and 12 partial. Full-chart output contained 319 in-scope paths (151 protection, 168 mediation) and 1,234 explicitly excluded target paths. Partial output contained 106 in-scope paths (47 protection, 59 mediation) and 371 excluded target paths. Zero paths passed the strict structural screen in either variant set. These counts describe overlapping graph candidates, not independent effects or strength. The four previously invalid cases now produce diagnostic/partial outputs as expected. Eight isolated contract checks and one formation-contested-root regression replay also passed, including the exact XU08 protection path, remote direct edge on a local mediation chain, target-root independence, partial-hour abstention, target-scope enforcement and tamper rejection.

This is still an isolated source-module execution, not native Node ESM, not the complete V10 source audit and not the full native suite. The new nine-test native file and the integrated audit must be run locally before closing E-1B-3. The earlier two-chart candidate counts remain unchanged.

### E-1B-3 follow-up: controller-bound pressure coverage and audit correction

At start of this slice, main was already at 8bd7b93, with the interposition reviewer implemented. Do not duplicate the evaluator. Add a compact `pressureContexts` projection for every visible occurrence. Each original incoming control edge retains its controller identity, distance, locality, root state, exact candidate IDs, evaluated IDs and screened IDs. Out-of-scope visible targets retain candidate IDs but no evaluated paths. All pressure and neutralization confirmations remain null. The projection does not change candidate counts, scope or structural screen, and never transfers a rescue candidate from one controller to another. Source audit triage links the exact directed control to its target/controller context and reports pressure counts separately.

The prior audit incorrectly rejected a nonlocal generation chain whenever direct control was also nonlocal. These are independent facts. Validate chain locality using the two generation edges and direct-control locality using the third edge, and verify the corresponding blocker. In actual-core isolated replay, the old audit produced false positives in 15 of the 24 variants; after correction all 24 passed the interposition audit and exact incoming-control inventory comparison. Full charts: 48 visible occurrences, 73 in-scope controller/target relations, 52 outside-scope relations; all have at least one structural candidate; zero controllers with a screened path. Partial charts: 36 visible occurrences, 38 in-scope and 24 outside-scope relations, zero screened. Counts are overlapping graph relations, not distinct controllers or effective actions. Zhou's visible hour wealth has four original controller nodes and 17 candidate references, all outside the day/peer/resource screen; this is a scope limitation, not evidence that relief fails. No authority or legacy outcome policy changes.

Four native regression tests added to the existing interposition file (13 total), including exact path ownership, scope, cross-controller misuse/missing contexts, and simultaneous nonlocal direct control and chain. In isolated actual-core execution, all 24 audits and inventory checks passed, cross-controller tampering and context deletion were rejected, and a tampered locality flag was rejected. Native test suite and full V10 source audit still need execution. Next: establish whether an independent, role-neutral structural interposition screen should cover non-supportive visible targets, rather than treating their candidate counts as efficacy. Keep existing scope/version explicit until independently tested.

## E-1B-4: role-neutral visible-target interposition review

Base 426d991. The existing interposition observer already verifies physical graph identity, literal root provenance and pressure edges independently of ten-god; its final target filter was the remaining role-dependent restriction. Evaluate each visible-target candidate once with the existing structural classifier. Expose `interpositionReview.roleNeutral` (version role-neutral-interposition-v1, targetScope all-visible-stems). Preserve the original v1 paths, pressure contexts, summary and scope as a projection of the same results. No second evaluator or different thresholds. Both views keep hidden/branch targets excluded and hidden helper/threat access unresolved. A structural screen is not actual preservation, protection or mediation; `roleDemandConfirmed`, `neutralizationConfirmed` and effect fields remain null. The upper role-policy layer, not this graph observer, owns whether preservation is desirable. No legacy mechanism or decision status changes are intended.

The source audit applies the same invariant checks to both scopes, requires exact controller binding, same candidate IDs and identical legacy-path contents, rejects added paths on legacy in-scope targets and requires the added count to match the old non-supportive visible exclusion count. Audit triage now exposes the neutral controller context for each exact directed premise. No source fixture changed.

Actual-core isolated replay of the 12-chart packet, full and missing-hour variants: 24/24 audits and original incoming-control inventory checks passed. Full legacy: 319 paths (151 protection, 168 mediation), 73 evaluated controller/target relations. Full neutral: 548 paths (263 protection, 285 mediation), 125 controller/target relations, zero outside-scope visible targets; 229 additional paths, 52 additional controller/target relations. 1,005 hidden/branch-target candidates remain excluded. Partial neutral: 175 paths (85 protection, 90 mediation), 62 controller/target relations; 302 hidden/branch-target candidates excluded. Full and partial neutral have zero structural screens met. Full neutral overlapping blockers: 520 hidden participants, 440 helper-pressure review, 383 nonlocal chains. Counts are not force quantities and cannot be summed as independent causes. Zhou hour wealth: all four controller nodes and 17 path candidates now receive structural review; zero screens met; necessity and actual efficacy remain unknown.

Three native regressions appended (16 tests total in interposition file), for all-visible/legacy parity, Zhou wealth coverage, and tamper rejection. Isolated actual-core replay confirmed 24/24 audit and inventory coverage; tampered role demand, detached legacy-path evidence and forged neutral scope rejected. Native Node and full V10 audit are not executed here. The role-neutral result is additive research evidence, not a replacement policy. Next investigate the zero-screen bottleneck with explicit positive/negative controls, distinguish hidden participant access, pressure and actual preservation, and design role demand independently; do not weaken screening to fit exposed charts. E-1C remains open; independent gold and P2 authorization remain gated.

## E-1C-1: source-bound role demand and preservation obligations

At the start of this slice, main was already at ce853a4 with E-1B-4 implemented. Reuse the role-neutral interposition view rather than duplicating it. Introduce candidate-scoped `rolePriority.demandReview` (role-demand-review-v1). D1-D4 remain the sole owners of their declared premises, source objectives and route identities. The new projection records each existing objective independently, including the food and mediation strategy contexts, exact wealth compound motifs and resource anchor alternatives. It binds explicitly mapped premise IDs and declared unresolved-requirement labels to a literal occurrence and demand axis (necessity, excess, deficiency, preservation, supply, burden, etc.). Unbound roles and unmapped declared requirements remain visible. No role-total comparison, weights or inferred substitution of another occurrence. The mapping is a research taxonomy of already implemented requirements, not additional historical source validation. Purity and relative balance still require higher-level contextual review.

For each referenced actor, project the existing direct-root state, grounded/screened supply path IDs, incident literal action evidence and exact controller-specific role-neutral interposition references. Hidden occurrences have no visible-target preservation authority. The evidence is context, not proof of demand, adequate force, preservation or neutrality. Keep original conditional status unchanged; no objective selected. The demand, excess, deficiency, preservation and effect values remain null. No change to the original family selection policy or rule generator.

The source audit now includes roleDemandRows and roleDemandCoverage and checks objective counts against the source policies, unique identities, exact actor binding, explicit unbound and hidden statuses and non-authority invariants. Six isolated contract tests using constructed policy inputs and actual new production/audit functions passed, including wrong role, foreign witness, missing objective, unbound role, partial and authority leakage. A native V10 integration regression is registered but not executed here. The 24-variant native replay and whole test suite are still required; no native counts or efficacy accuracy are claimed. Next: review native requirement coverage and derive separately source-grounded demand conditions with independent positive/negative controls, not arbitrary thresholds. E-1C remains open.

## E-1C-2: resource supply context and source-conditional demand review

Base 1d7b780. Rechecked the received text of *Zi Ping Zhen Quan*, 印綬 chapter, at the Chinese Diancang edition (https://www.diancangwang.cn/xuanxuewushu/03cf53eede8a/6e77288ed5b4.html), with the parallel electronic text at https://luckclub.cn/bazi/002/037/ and https://yiology.net/books/%E5%91%BD/%E5%85%AB%E5%AD%97%E5%91%BD%E7%90%86/%E5%AD%90%E5%B9%B3%E7%9C%9F%E8%AF%A0/36. The chapter distinguishes resource/wealth regulation, output drain, killing supply when body and resource are imbalanced, and the independent proper-officer context; strong day and strong resource do not universally imply excess. Weak-day/light-resource/strong-wealth is a contextual injury interpretation, not a universal deficiency rule. Heavy resource with weak day is retained as a disputed ordinary-scope context; heavy resource with strong day and killing is not promoted to a favorable rule. The eight scenarios here are a review of the existing D1/D4 objectives, not eight newly certified classical rules.

`outcome-resource-demand.js` computes the chart-wide `resourceSupplyContext` once, reusing the physical occurrence inventory, existing literal actions, grounded supply and role-neutral pressure context. The day profile records its own roots, peers, incoming resource supply, outgoing output drain and officer pressure. Resource delivery, incoming officer supply, wealth pressure and output control are exact directed relations. Alternatives refer to the same day recipient and record common literal supply-root IDs; even distinct IDs are not proof of independent force. Hidden access remains unresolved, no graph relation is treated as effective delivery, and no weights or quantitative force estimates are introduced.

The candidate-scoped `rolePriority.resourceDemandConditions` projects eight existing resource-family objective IDs with exact actor/collection binding, original conditional status, day premise, required directed edges, alternative IDs and still-unproved conditions. Strong/weak only changes the day premise. A supported day premise plus a literal path is a source context observation, not satisfaction of excess/deficiency/necessity. Proper-officer independence is a separate axis. Role demand and preservation remain null. The new layer does not select a pattern or useful element, replace the legacy mechanism status or infer favorable outcomes.

Isolated actual-core chart projection replay before final added path-reference guard: 24/24 diagnostic/partial variants; 43 resource occurrences in 12 complete charts, 13 visible; 43 literal resource-to-day edges; 134 ordered alternative relations, 116 sharing observed root IDs (overlapping relations, not independent supply quantities). Day direction was supplied as a controlled strong hypothesis in this isolated replay, not calculated from V10. Seven isolated contract/audit tests on constructed policy contexts passed after the guard: day premise contrast, shared roots, exact delivery, partial hour, actor/authority tamper, proper-officer/disputed contexts and audit coverage/tamper. The native integration test (eighth test) and complete 24-variant V10 audit are not yet executed. Source audit now includes resourceDemandCoverage and resourceDemandRows. No independent validation or efficacy accuracy is claimed. Next: native regression, inspect unresolved predicates and separately ground resource sufficiency thresholds or leave them unproved; output and officer burden contexts remain subsequent work.


### E-1C-2 follow-up: resource delivery and shared-evidence provenance

A parallel E-1C-2 implementation reached main at f2a382e before another work branch was published. Retain the existing public `resourceSupplyContext` / `resourceDemandConditions` contract, rather than merge duplicate evaluators. Add a distinct delivery observation per resource and candidate objective: partial, hidden-access review, literal edge not observed, literal delivery context review, or structural delivery screen met. None of these states confirms actual delivery, resource necessity, surplus or deficiency. Validate each referenced grounded path's donor/recipient identity and retain its donor node identity, observed roots and contested contextual root IDs. Alternative relations now separately expose shared observed roots, shared contextual roots and shared donor nodes. An alternative with distinct observed roots but common contested roots must not be labeled as distinct-root context; even distinct evidence cannot establish independence. Audit the complete set of ordered alternatives, shared root/donor provenance, delivery observation and candidate delivery parity. Three regression tests added (11 in the native resource file).

Isolated verification on the final implementation: 10/10 non-V10 tests passed, including the existing seven and three added tests. Actual core modules (natal, stem-force, relative force, formation, root, grounded supply and interposition), with a literal identity projection of capacity and a controlled day-direction input, produced 24/24 valid resource contexts on the 12 source charts with and without hour. Full-chart results: 43 resource occurrences, 13 visible, 134 directed alternatives, 116 pairs sharing observed roots, 128 pairs sharing contextual roots, zero pairs sharing observed donor nodes in this sample, zero strict structural delivery screens met. Thus 12 additional directed pairs share contextual rather than observed-root evidence; these are overlapping pairs, not independent cases. Shared donor behavior is additionally covered by a constructed contract test. Synthetic 乙卯/乙卯/丁卯/乙卯 has two screened visible resource deliveries, without any promotion of surplus or demand. Full native V10 integration and full suite remain required; the 24-context replay is not the end-to-end source audit. No new source labels, force weights, or decision authority.


## E-1C-3: output supply context and source-conditioned demand

Base 60d5eda. Rechecked the received 印綬 passage (https://www.diancangwang.cn/xuanxuewushu/03cf53eede8a/6e77288ed5b4.html), 偏官 original and Xu commentary (https://yiology.net/books/%E5%91%BD/%E5%85%AB%E5%AD%97%E5%91%BD%E7%90%86/%E5%AD%90%E5%B9%B3%E7%9C%9F%E8%AF%A0/39 and https://www.mastervt.com/books/zipingzhenquanpingzhu/juan-1/chapter-041), and contextual contrast in 偏官取運 (https://www.diancangwang.cn/xuanxuewushu/32b4b16870fe/62257d21bdc0.html). The latter concerns transit interpretation and is not converted into a new natal rule. The original and commentary distinguish necessary food control, excessive food drain, resource moderation of excess, and wealth that simultaneously removes resource and supplies killing. The inventory distinguishes food and hurting officer literally; K01/K02 retain the existing literal food-only scope, whereas R01 and the already bound K03 dual-role contexts may include hurting officer. No new classical authority or independent gold is claimed.

New chart-level `outputSupplyContext` reuses existing role capacity, grounded supply and role-neutral interposition. For each exact output occurrence it records day drain, control of proper officer versus killing, wealth generation, incoming resource pressure, root and protection evidence. The separate `wealthFeeds` records exact output->wealth->officer chains, the direct output->same officer control, and hidden participation without summing or canceling competing paths. The chart also retains exact day resource delivery, day officer pressure, wealth->resource control and wealth->officer supply. K03 wealth supply is not inferred from an unrelated output-to-wealth chain.

Candidate-level `rolePriority.outputDemandConditions` projects seven preexisting R01/K01/K02/K03 objective/collection combinations and their unproved requirements. R01 and K03's shortage context retain the existing day hypothesis; K01 imports the already evaluated source-specific polarity premise rather than replacing it with a generic weak-day opposition. K02 and K03 restoration do not acquire an invented day prerequisite. Exact roles and relevant directed edges must remain bound; hidden participants are identified independently. Actual necessity, excess, deficiency, preservation and net effect stay null. The projection does not generate new food-family or hurting-officer-family objectives; extending those families requires independent source policies. No existing outcome status or selection authority is replaced.

Validation: seven isolated contract/audit tests passed against actual new functions and constructed inputs. Actual core-module chart replay (natal, stem force, relative force, formation, root, grounded supply, interposition; literal capacity identity projection and controlled day-direction input) produced 24/24 valid output contexts on the 12 source charts with and without hour. In 12 complete charts: 34 output occurrences (24 food, 10 hurting officer; 6 visible, 28 hidden); 34 literal drain edges, zero structural drain screens met; 55 control edges to killing and 22 to proper officer; 125 literal wealth-feed chains, all containing hidden participants. These counts overlap and are not effective actions or independent supply. Nine native tests are registered, including the full V10 integration and actual-core 24-variant audit replay; neither native test nor end-to-end V10 audit has been run in this environment. Audit emits outputDemandCoverage/outputDemandRows and checks inventory, edge/chain coverage, source bindings and abstention. Next: native validation and officer/killing demand; retain the structural screening bottleneck as an open issue.


## E-1C-4: officer supply context and source-conditioned demand

Base eaf47c9. Reuse the established K01/K02/K03 and R03/R03-context policies and their previously documented 偏官 and 印綬 source references. This increment is a structural projection of existing objectives, not a new textual or independent empirical validation. In particular, the general resource-mediation context does not require a weak day; the weak-day motive remains a separate source premise. Proper-officer independent demand is not the killing-shortage rule. The coexistence of proper officer and killing does not establish mixture or impurity, and hidden participants require separate access review.

New chart-level `officerSupplyContext` inventories exact proper-officer and killing occurrences with direct pressure on the same day master, incoming food/hurting-officer control, incoming wealth supply, outgoing resource supply, and existing grounded and protection references. A literal mediation path binds the exact officer, resource, day, and all three edges; any wealth contacts are bound to those same participants. Direct pressure is retained even when mediation exists, and no net pressure relief is confirmed. Literal and visible officer/killing coexistence are separate observations; mixture and purity remain null.

Candidate-level `rolePriority.officerDemandConditions` projects 16 existing collection/objective combinations (12 killing-family, four resource-family) and preserves their original conditional statuses. Each context records exact participant roles, hidden access, required and missing edges, related mediation paths, day premise and unproved conditions. K01 reuses the existing food-policy polarity premise; the weak-day mediation motive is retained without turning it into a universal prerequisite. K03 deficiency and burden reviews may share the same literal wealth feed without selecting either conclusion. R03 heavy-resource disputed scope remains distinct from surplus and proper-officer independence. Actual necessity, excess, deficiency, preservation, and effect stay null. No proper-officer-family, food-family, or hurting-officer-family objective generation is added by this increment.

Validation: 9/9 isolated contract and audit tests passed, including a constructed coverage test for all 16 scenario combinations. Actual natal, stem-force, relative-force, formation, root, grounded-supply and interposition functions, using a literal capacity identity projection and controlled day-direction input, produced 24/24 valid officer contexts on the 12 source charts with and without hour. Full-chart totals: 36 officer occurrences (10 proper, 26 killing; six visible, 30 hidden); 36 literal day-pressure edges, 77 output-control edges, 65 wealth-supply edges, 110 literal resource-mediation paths (103 with hidden participants, seven all visible), seven charts with literal coexistence and zero with both types visible. No mediation pressure relief confirmed. The counts overlap and do not represent independent effective actions. Eleven native tests are registered, including the full V10 integration and actual-core packet audit; the two native tests and full source replay have not been executed here. The source audit emits officerDemandCoverage/officerDemandRows and checks exact inventory, mediation, coexistence, source bindings and abstention. Next: E-1C-5 cross-role dependency, with shared evidence and competing role obligations linked without duplicating ownership or promoting unresolved force into decision authority.


## E-1C-5: cross-role dependency and integration guard

Base 2923f0c already contained E-1C-4, so the existing officer evaluator was retained. The efficacy composer called output and officer observation/assessment functions without importing them. Restored the four imports and added a source import/call regression alongside the native source replay. This is a real runtime integration defect, not a classical rule correction.

New candidate-scoped `rolePriority.dependencyReview` is an index of existing resource, output and officer demand projections. It preserves every source objective (including objectives with no specialized projection), its original conditional status and exact actor bindings. Each projected edge must agree with the upstream grounded-supply edge, including its identity, direction, kind, source basis, generation screen and control comparison, and the exact source/target role of the field. A valid edge between the wrong roles cannot substitute. Shared actions distinguish repeat appearances of one objective across projections from appearances across multiple objectives. Root and grounded donor observations retain their exact actor, objective, path and contested/uncontested provenance; shared physical IDs across distinct actors are recorded once as an index, not independent supply quantities or allocated capacities. The D5 interaction layer still owns explicitly declared competing or simultaneous interpretations; joint outcome owns allocation. No inferred incompatibility, summed force, pressure cancellation, demand, selection or net effect is introduced.

The source audit emits roleDependencyCoverage/roleDependencyRows and deterministically reconstructs the dependency index from the same upstream evidence to detect detached or altered outputs; this is not an independent efficacy oracle. Seven new isolated tests passed (including static composer import guard); nine existing officer and seven existing output contract/audit tests passed. One constructed integration check executed all three actual demand projection functions and the new dependency observer: two objectives, three shared actions, all diagnostic. The fixture is not historical evidence. Native V10 and full regression/source replay were not run here: direct GitHub checkout from the execution container failed DNS, so the actual modules were exercised via isolated JS with injected imports. Eight native dependency tests registered, including a 24-variant V10 integration test. No new independent gold or final authority. Next gate: run the native tests and full role-policy audit before E-1E; inspect the structural screen bottleneck and cross-family scope rather than extending an unverified decision policy.


## E-1 integration gate: structural-screen bottleneck accounting

Base 8bcf0a8. The composer retains the repaired output/officer imports. Native checkout again failed DNS and recursive connector retrieval exceeded its tool-call limit; the full V10 and native suite remain unexecuted here. Do not infer a native pass from an isolated core replay.

Added audit-only `scripts/lib/pattern-outcome-screen-bottlenecks.mjs` and wired `screenBottleneckCoverage` / `screenBottleneckRows` into the role-policy source replay. The auditor reconstructs each generation and role-neutral interposition screen from its existing evidence, reports all/visible/hidden denominators and blocker combinations, and associates each visible generation pressure reference with its exact controller-specific candidate and screened interposition paths. Legacy and new source-pressure, contact and missing-hour aliases are grouped without erasing the original reason strings. Sole-group counts are descriptive only: categories may be causally dependent, and no hypothetical waiver establishes efficacy. No production screen, role demand, witness, or decision authority changed.

Isolated execution using actual core natal, force, root, grounded-supply and interposition modules: 24/24 source variants valid and six corresponding regression checks passed. Twelve complete charts contain 462 literal generation relations (34 both participants visible) and 548 role-neutral interposition candidates (28 all participants visible). None of the 34 or 28 visible cases pass the corresponding screen. Visible generation group counts: source pressure 19, target pressure 23, nonlocality 15, contested roots 13, contact 11, source basis 9. Six rows have a single category (target pressure 4, contact 1, locality 1); the other 28 have multiple categories. Visible interposition group counts: locality 22, helper pressure 21, threat root 18, helper root 14, contact 12; no row has only one category. Across the 34 generation relations there are 54 blocking controller references (repeated references allowed), all with existing protection/mediation candidates and none with a screened path. This is not 54 independent controllers. The synthetic independent-pillar case 乙卯/乙卯/丁卯/乙卯 again has two positive visible generation screens and one locality-only blocked relation. Tampered generation status, detached controller and omitted interposition blocker were rejected. Six native regression tests registered; their equivalent assertions were exercised through isolated actual core modules, not native Node ESM.

Next: native V10 integration gate, then investigate pressure with exact path evidence and independently justify contact/root/locality semantics. Do not remove a blocker simply to raise coverage. Hidden-access evaluation alone cannot explain all abstentions: even all-visible candidates are blocked. Independent gold and calibrated effect conditions remain absent.


## P0-1: pressure contrast and non-self-seeding dependency topology

Base 2eb7fc0. Add chart-level `pressureDependencyReview` after grounded supply and role-neutral interposition, without changing their contracts or screen decisions. A pressure is an exact directed graph-node pair. A visible controller/visible target pair additionally retains its oriented original, root-sensitive, nonseason and season-only profile comparisons. A stable evidence direction requires the original, sensitive and nonseason directions to agree on dominance and the season-only result not to oppose that direction. This is a Boolean evidence contrast, not force magnitude or effective suppression. Hidden graph nodes cannot inherit an occurrence-level comparison. Every controller is retained, including nonlocal, no-root and hidden-target observations.

For every existing interposition path, preserve nonpressure blockers and bind all active incoming helper pressures as AND prerequisites; alternative paths for the same pressure are OR alternatives. The least closure starts only with existing pressure-free structural paths (rank zero), then admits a conditional path at a later rank only if every prerequisite has a lower-rank witness. Unseeded cycles are reported only in the graph of otherwise structurally eligible paths; paths with additional blockers cannot seed it. Neither ranks nor absence of cycles prove relief. Hidden targets have no evaluated interposition routes and cannot seed closure. No dependency is removed merely because the controlled target's evidence dominates. The generation review links exact local controller IDs at each visible endpoint, and merges a legacy source-pressure alias only when all of its controller IDs are covered. Nonpressure blockers and source-basis requirements remain in force. This projection records pressure-only versus other-prerequisite contexts; it does not promote the original screen, remove pressure, or change role/decision authority.

Actual isolated core replay: 24/24 valid contexts and 24/24 new audit rows passed, using the 12 existing source charts with and without hour; the audit replay injected the exact previously fetched edgeKey helper to stay within connector limits. Of 26 complete-chart visible controller/target relations, two have stable controller evidence dominance, three stable target evidence dominance, 21 nonstable/unresolved. Of 34 visible generation relations, four have pressure-only unresolved prerequisites and 30 have other unresolved prerequisites (possibly also pressure). Across 548 existing visible-target interposition paths, none lacks nonpressure blockers; consequently zero seed/conditional paths and zero cycles in the otherwise eligible graph. This is not absence of cycles in the full elemental graph. Constructed graph tests verified unseeded mutual/self cycles do not bootstrap, a seed can support later ranked AND/OR chains, incomplete AND and invalid IDs fail, and the synthetic 乙卯/乙卯/丁卯/乙卯 chart retains two pressure-free generation screens. Altered screen, foreign controller, omitted local pressure, and fabricated audit rank were rejected. Seven native regression tests registered (including V10 integration); the six non-V10 test scenarios were exercised in isolated core execution, not native Node ESM. Full V10 source replay and native suite remain unexecuted here. Audit fields: pressureDependencyRows/pressureDependencyCoverage. No classical rule or calibrated strength threshold added.

Next: independently assess the nonpressure prerequisites (especially contact, locality and contested roots) before considering any actual screen change. Pressure-only cases can be individually studied with exact controller contrasts and independent textual controls; do not treat a graph closure as proof of neutralization. P0 efficacy remains open.


## P0-2: exact locality and intervening-stem context

Base 360c556. The existing witness-level positionContext remains unchanged; new chart-level `localityContext` inventories every visible literal generation/control relation exactly once. It reuses groundedSupply, role-neutral interposition and pressureDependencyReview rather than recreating force or protection. For each ordered endpoint pair, preserve span, direction, legacy blockers, exact intervening visible stems in source-to-target physical order, direct root context, the eight directional literal relations between intervenor and endpoints, same-element peer observations and exact controller references. An intervening stem may simultaneously supply, control or receive output; the presence of an intervenor does not establish obstruction or noninterference. No temporal execution, peer substitution, hidden-stem access or distance multiplier is inferred. Protection/mediation candidates must match the existing helper/threat/target IDs; the ordered literal generation chains through one or two intervenors retain their individual edge screens and locality. A direct control relation and a generation chain remain distinct; no substitution or neutralization is certified. No new classical premise, effect threshold or screen promotion.

Actual isolated core replay: 24/24 valid locality contexts and 24/24 independent positional audit rows. In twelve complete charts, 60 directed visible relations (34 generation, 26 control), 30 adjacent and 30 nonadjacent (15 generation, 15 control; span two: 20, span three: 10). Forty intervenor references, including six protection and seven mediation candidate references. Seven ordered generation chains, five with every leg adjacent. The seven mediation candidates and seven generation chains describe the same literal two-leg motifs in this packet, not fourteen independent routes. The exact original screens remain unchanged. Six non-V10 regression scenarios were exercised with actual core functions in an isolated JS loader, including reverse direction, two intervenors, peer non-substitution, deleted action, detached protection and forged output. The audit independently reconstructs the position, roles, path identity and chain coverage using the literal capacity identity fields; in isolated replay these fields were projected directly from stem-force, with previously fetched edgeKey and SajuError helpers injected to respect connector call limits. Seven native regression tests registered including V10 integration. Native Node ESM/full source replay and full suite remain unexecuted here. Audit emits localityCoverage/localityRows. Next P0-3: distinguish contact observation from actual combination-related restriction and preserve alternative noncontact evidence; source and independent control validation required before changing any effectiveness screen.


## P0-3: stem combination contact and original-action evidence

Base 6a8fa26. Rechecked the received 论十干合而不合 text and Xu commentary at https://yiology.net/books/%E5%91%BD/%E5%85%AB%E5%AD%97%E5%91%BD%E7%90%86/%E5%AD%90%E5%B9%B3%E7%9C%9F%E8%AF%A0/7 and the collated original at https://changxianyi.com/guji/ziping/nlc-peihe-review-20261005/rigan-he-er-buhe/. The original distinguishes intervening obstruction, remote contact, one combined/one retained, day-master self-combination, and competing partners. Xu gives opposite remote-contact readings (丁卯/丙午/丙子/壬辰 versus 乙酉/甲申/丁巳/庚戌), and distinguishes transformation and ordinary self-combination. The collated edition notes textual variants; no numerical attenuation, automatic restriction, or universally sufficient transformation condition follows from these readings.

New chart-level `combinationResidualContext` validates every literal stem pair against the existing formation and combination context, preserves exact intervenors, competing pair IDs, self/external scope and the existing contact/transformation hypotheses. It projects exact original hidden root slots (including contested roots), one-hop grounded incoming paths and all original literal generation/control actions involving a paired visible stem. Pair participation does not erase a stem, grant unpaired access, transform an element or prove that any original action remains effective. Same-ten-god alternatives retain their distinct pair contacts and hidden-access uncertainty; a second stem which also has a remote combination is not labeled free or automatically retained. Branch formations remain in root/branch contexts. Existing candidate combination-role policy owns directed removal intent; this context is not an allocation or removal policy. Original screens and decision authority remain unchanged.

Actual isolated core replay of the existing twelve charts, full and missing-hour: 24/24 valid contexts and 24/24 audit rows. Complete charts: five pair candidates (one local, three intervening-control, one remote; one self-combination), nine distinct paired visible occurrences, seven with original uncontested substantial-root observations, one with grounded incoming supply observation but no uncontested substantial root, one without established original basis. Ninety-eight affected literal actions, 20 visible-to-visible and 78 involving hidden endpoints; counts are not independent effective actions. Six additional source contrast charts from the received chapter (including Xu examples) passed structural audit: 丁卯/丙午/丙子/壬辰, 乙酉/甲申/丁巳/庚戌, 辛酉/丙申/庚子/丙戌, 戊戌/甲子/己巳/戊辰, 庚午/乙酉/甲子/乙亥, 丙戌/壬辰/丁未/壬寅. These are regression controls, not independent gold or successful reproduction of source effect judgments. In particular the second remote example remains intervening-control review despite Xu's combination interpretation; the second same-role participant in the leave-one case still has another literal contact. Both are explicit unresolved contrasts, not silently accepted results.

Six non-V10 regression scenarios exercised in isolated JS with actual core modules, with identity-only capacity projection and previously fetched edgeKey/SajuError helpers to respect connector limits. Missing pair, altered competition, omitted action and fabricated retention rejected. Seven native tests registered (one V10 integration); native Node ESM, full source audit and full suite remain unexecuted here. Audit exposes combinationResidualCoverage/combinationResidualRows. Next P0-4: exact clash-exposed root slots, surviving unexposed roots, relief alternatives and independent root evidence; do not assume clash removes a root or harmony restores it.


## P0-4: clash-exposed root slots and residual evidence

Base 670983f. Reuse the existing root-context clash relief scope (literal six harmony or complete three harmony sharing exactly one clash endpoint); no new classical premise or effect rule is asserted. New chart-level `clashResidualContext` binds every clash to exact physical branch positions and affected hidden-stem slots. It checks candidate coverage, shared versus opposite endpoint, other incident clashes and competing formations. Each exposed slot retains residual/substantial role, exact incident clashes, competing-target formations, and relief alternatives for each clash. A relief option on the root's own side may simultaneously introduce a different target element; an option on the opposite side does not prove restoration. A single formation cited for multiple clashes is not multiple independent remedies. Candidate coverage is not joint allocation, and no slot is rewritten or restored.

For visible occurrences with exposed roots, distinguish substantial exposure from residual-only exposure, preserve exact uncontested roots elsewhere (including exact-stem versus same-element distinction), other contested roots and grounded one-hop incoming supply with physical donor/root IDs. The same exposed slot referenced by several visible stems is a shared observation, not independent capacity. Every affected visible generation/control edge retains its original screen/blockers and exact exposed substantial/residual IDs. No removal of a legacy clash blocker, actual damage estimate, preservation confirmation, relief or selection authority. P0-5 hidden-stem access and subsequent integrated conditional efficacy remain separate responsibilities.

Actual isolated core replay: 24/24 existing source variants and 4/4 constructed controls passed the new audit. Twelve complete source charts: 11 clashes, 40 exposed physical slots (15 principal, 10 middle, 15 residual); 17 affected visible occurrences (7 substantial-exposed with uncontested substantial roots, 2 substantial-exposed with observed indirect supply and no uncontested substantial root, 5 substantial-exposed without uncontested root or observed grounded supply, 3 residual-only). Twenty-two affected visible directed actions, all with some substantial exposure at one or both endpoints; five shared exposed root references across distinct visible actors. No relief candidates in this packet under the existing scope. Constructed controls (not historical gold): 甲寅/庚申/丙午/乙卯 (outside root); 甲寅/庚申/丙子/戊辰 (complete three harmony relief candidate and competing root element); 甲寅/庚申/己巳/乙卯 (six harmony); 甲寅/庚申/丙寅/己巳 (one six harmony cited for two clashes, no joint relief confirmed). Missing relief, omitted incident clash, wrong shared position, missing action and forged relief were rejected.

Seven native tests registered including V10 integration. Equivalent six non-V10 regression scenarios were exercised against actual core functions and actual audit in isolated JS; the loader injected the previously inspected edgeKey/SajuError helpers, literal capacity identity fields and the actual extracted branch-pressure function to fit connector limits. Full native Node ESM/V10 source audit and full suite not executed here. Audit exposes clashResidualCoverage/clashResidualRows. Next P0-5: separate local hidden constituent, exact-stem visible projection, same-element context and actual access; do not count hidden roots as independent actors or promote hidden delivery from projection alone.


## P0-5: hidden-stem access and physical-node provenance

Base 21e563a. Add chart-level `hiddenAccessContext` after branch access, root context and grounded supply. Existing branch access owns literal hidden stems and formation-group hypotheses; the new context does not recreate group nodes or assert transformation. For each exact hidden slot, distinguish principal/middle/residual, clash and competing formation state, exact non-day visible projection with the original slot reference, same-element other stem, and day-reference match. External substantial root IDs remain contextual and never become the branch node's own grounded root IDs. For each branch-element node preserve its exact local constituents, grounded/contested/residual root slots and projection IDs. Hidden-related literal actions are indexed once per directed physical graph-node pair and kind, retaining all original action IDs, exact local incoming supply paths and their upstream/readiness states. Visible alternatives require exact non-day stem projection and an existing directed visible action; an alternative is not proof of transport, substitution, equal capacity or additional independent supply. Same-branch elemental relationships are recorded separately as non-actions; no graph edge is created within one physical branch. No original screen, role authority, or access/effect confirmation changed.

Actual isolated core replay: 24/24 source variants and 24/24 audit rows passed. Twelve full charts contain 132 hidden slots (48 principal, 36 middle, 48 residual), 118 branch-element nodes; 38 slots have exact non-day visible projection, 14 match day stem, 12 match only the day stem without a non-day projection. Access context: 37 substantial local, 22 residual local, 19 exact projection, 54 disrupted (these categories are exclusive reporting labels, not effect judgments). There are 859 hidden-related literal action IDs grouped into 725 directed physical graph relations; 122 relations have multiple literal references, 136 have at least one alternative visible literal action. There are 106 within-branch elemental relations explicitly excluded from the graph. Local generation path references: 103 observed, 69 unresolved, 50 not observed; none are certified effective by this review. Constructed control 甲寅/庚申/丙午/乙卯 confirms same-element external root is not local branch supply, and day match is not external projection. Zhou source chart exercises multi-reference graph grouping and visible alternatives. Forged projection, borrowed external root, omitted literal edge, detached alternative and fake within-branch action are rejected. Seven native tests registered including V10 integration. Equivalent six non-V10 scenarios executed in isolated JS with actual core functions, including the actual extracted branch-access function (unused candidate-source import excluded), literal capacity identity projection and previously inspected edgeKey/SajuError helpers to fit connector limits. Native Node ESM/full V10 source audit and full suite remain unexecuted here. Audit fields: hiddenAccessCoverage/hiddenAccessRows. P0 observation layers now implemented; P1 must integrate these evidence contracts into a bounded conditional efficacy policy, without converting diagnostic coverage into validated force. Before promotion, run native V10 regression and identify independently labeled controls for necessary/sufficient conditions, including opposing and partial-hour cases. No new classical proposition was introduced.


## P1-1: signed argument contract and structural bridge

Base 4cca6d0. Introduce `outcome-argumentation.js` as an internal bounded, monotone signed-proof evaluator. Each proposition has exact subject identity and one of observation / structural-hypothesis / effect-hypothesis levels. Explicit positive and negative evidence have separate references and scope; rules specify signed AND premises and a signed conclusion (separate rules are alternative derivations). The result is the pair of proof-existence bits: neither = unresolved, positive only = supported, negative only = opposed, both = conflicting. Absence of proof is not a negative proof; contradictory propositions do not entail arbitrary other propositions. There is no automatic priority, vote or weight. The least closure uses rank zero facts and synchronous rule rounds; only first-rank witnesses form the acyclic proof DAG. Later applicable rules remain visible but cannot seed a cyclic proof. Complete-only evidence/rules are unavailable in partial charts. Malformed identifiers, unbound premises, duplicate IDs and empty-premise rules are rejected; explicit input limits fail with unavailable rather than truncating. Evidence references in the generic evaluator are syntactic; domain adapters must bind them to real upstream records. V1 forbids direct evidence for effect-hypothesis and any rule concluding or consuming effect-hypothesis. It cannot confirm actual force or select a role.

`outcome-argument-review.js` is the first chart adapter, composed after locality and pressure review. It binds every existing visible literal action exactly once and excludes hidden and group effects (hidden literal count reported, group effects out of scope). A generation structural proposition is derived from the existing source-basis, context-blocker, source-pressure and target-pressure screen observations. Explicit failure of one condition opposes only the screen-pass proposition. A control structural proposition concerns stable source-profile evidence dominance, with support/opposition only for stable controller/target dominance; mixed or nonstable comparison does not imply either. Contrast and original screen parity are checked. Every action has a separate actual-action-effective proposition with neither proof. Existing mechanism status, role policy and decision contract remain unchanged. No new classical premise or sufficiency condition has been asserted. This is a bridge to future P1-2 rules, not a four-valued reinterpretation of the old mechanism aggregation.

Audit fields: argumentRows / argumentCoverage. Audit replays the exact adapter from published upstream identity projections and checks unresolved effect state; this is deterministic provenance replay, not an independent force oracle. Five generic regression tests executed against fetched production evaluator (all pass). Actual core replay of the twelve source charts full and missing hour (24/24 audit rows), using actual stem/relative force, formation, root and grounded-supply modules, and literal identity-only locality/pressure projections from the core results to fit connector limits. Full charts: 60 visible directed actions (34 generation, 26 control), 859 hidden literal actions excluded; structural propositions 2 supported, 37 opposed, 21 unresolved, zero conflicting; all 60 actual-effect propositions unresolved. Partial charts have all structural propositions unresolved. Synthetic positive-generation chart retains two positive structural screens, but no effect proof. Forged stable dominance and changed proof state rejected. Audit generation counter corrected and checked with a separate constructed counter control. Nine native tests registered (including full P0 path and V10 integration); the full native Node ESM suite and full V10 replay remain unexecuted because container checkout DNS is unavailable. Do not confuse these isolated results with a full native pass.

P1-2: define named source-scoped generation/control effect hypotheses with explicit necessary conditions, independently justified sufficient/contrary conditions and source contrast controls before authorizing any effect-rule registry. Distinguish rebuttal of an effect from undercutting a rule's applicability; a failed structural screen alone cannot oppose actual action. Preserve context, partial scope and no selection authority. Do not add further observation modules solely to increase coverage.


## P1-2: source-scoped generation/control conditionals and applicability

Base 04746a0. Consulted the received Sanming Tonghui (三命通会), vol. 1, 五行 discussion attributed to 徐大升, https://www.shidianguji.com/book/SK1610/chapter/1mecpy8lhe70z (also the received 元理赋 passage in the Siku vol. 12 at https://zh.wikisource.org/zh-hans/三命通会_(四库全书本)/卷12). These are traditional interpretive statements, not independent empirical evidence. Register 25 immutable source clauses: five directed generation pairs in each of source excess, recipient excess and strong-source release; five directed control pairs in each of resistant target and weak target. Preserve the element-specific wording (堅/重/多/炎 and related terms are not a common scalar). The declared predicate is an antecedent of the textual conditional, not a proven universal necessary or sufficient condition for actual efficacy. The consequent distinguishes recipient-adverse context, source depletion, source moderation, controller-adverse context and recipient injury. Reverse injury does not logically exclude all control; generation-related adverse conditions do not imply absence of generation. No effect rule is authorized.

`outcome-source-effect-policy.js` evaluates explicit premise scenarios through the P1-1 signed proof engine. Positive relation AND positive element predicate supports applicability under those assumptions; explicit negative premise opposes applicability; inconsistent assumptions preserve conflict. Missing premise evidence does not yield opposition. The consequent is labeled follows-under-explicit-assumptions only when applicability is supported, never an actual-action-effective proof. Partial scope cannot authorize complete-only assumptions. Production `sourceEffectReview` binds exact visible literal actions, the typed structural proposition and its separate effect proposition. Existing structural opposition is an undercut of the structural argument only, not an effect rebuttal. Day strength direction is carried only as a directional hypothesis context when the predicate actor is the day master and the predicate is strong/weak; it is never substituted for the element-level predicate. All element predicates stay unresolved until a justified resolver exists. There is no calibration of excess, resistance or absolute weakness from relative Boolean axis dominance. Original mechanism and role decisions unchanged.

Audit fields: sourceEffectRows / sourceEffectCoverage. Six non-native tests executed against fetched production evaluator/policy/audit and element relation modules: registry direction and immutability, 25 x 6 assumption scenarios, day-direction non-substitution, partial scope, forged effect proof, and tampered clause coverage. All six passed. Isolated actual core replay with the same twelve source charts (full and missing-hour; 24/24 audit rows): full charts 60 visible actions, 154 applicable-pair clause candidates, 154 unresolved applicability evaluations, 37 structural undercuts; missing-hour charts 29 visible actions, 72 candidates, 72 unresolved and zero structural undercuts. The replay used actual stem/relative force, formation, root and grounded-supply modules, pressure/locality identity projections as in P1-1, and unresolved strength because the native regulation-strength path was not executed. These counts are coverage, not validation of the source conclusions. One native V10 source-packet regression registered in addition to the six unit tests. Full native Node ESM/V10 and full suite still require execution; no native pass claimed. Next P1-3: integrate specific evidence for undercut/defeat (protection, mediation, combination, clash, access); build source-scoped premise resolution with independent positive/negative controls before any permission to conclude actual effect. Do not mistake the source registry or assumption tests for confirmed efficacy.


## P1-3a: observation-scoped rule undercuts (bounded first stratum)

Base 516a0d5. The P1-2 source clause registry and its explicit-assumption tests already exist. Do not duplicate them or alter their applicability semantics. Extend the generic signed proof engine with optional `undercutWhen`: a list of distinct signed observation literals, any one of which, if explicitly evidenced in the current scope, excludes that rule before fixed-point closure. Record the literal and its direct evidence witnesses in the rule result. No negative conclusion is emitted by exclusion. Any independent alternative proof, or explicit opposing proof, is evaluated normally. Conflict on the attack observation retains both signs; a supported attack sign blocks only the rule that explicitly declares it. The absence of attack evidence is not a proof of clearance: rules requiring clearance must declare that signed observation as a premise. Complete-only facts and rules cannot acquire authority in partial scope.

Only observation-level literals may be declared as undercuts. Since no rule can conclude an observation, the gate stratum is independent of the structural closure. This avoids recursive defeat, self-defeating rules and order-dependent withdrawal; each evaluation recomputes from the current facts, rather than mutating previously inferred proofs. For fixed observations the remaining closure is still monotone; across changes to attack observations it is not. Gated rule results expose `undercuts`; ungated results retain their existing shape. Effect hypotheses are still forbidden as rule conclusions and direct evidence. No existing production rule is gated in this step: assigning protection, mediation, combination, clash or access observations as defeaters requires a separate source-scoped policy with explicit applicability and contrast controls, rather than an assumption that an observed contact establishes a defeat.

Verification: the five existing generic test bodies plus five new undercut tests passed when executing the fetched production engine in an isolated JavaScript harness with equality/deep-equality assertions. Native Node ESM integration and complete repository tests have not been run. Next P1-3b: bind specific candidate paths and exact physical participants to named rule applicability propositions; separate observed contacts from justified undercuts, and retain the original actual-effect abstention until source-scoped sufficiency/contrary conditions are independently justified.


## P1-3b: source-scoped protection and mediation

Base 2b36132. Reuse the role-neutral interposition inventory, the pressure dependency closure and the existing argument judgments. `outcome-interposition-policy.js` binds each all-visible physical route to its exact directed legs, pressure identity and original control effect proposition. Hidden-participant routes remain explicitly counted but unassessed. A route with structural dependency rank zero or higher is not thereby an operating route. No additional graph traversal, strength score, role selection or edge removal is introduced.

Source scope: received 滴天髓 通關 (https://zh.wikisource.org/zh-hans/滴天髓/20) and 子平真詮 論用神成敗救應 (https://changxianyi.com/guji/ziping/wz-20260914/chapter-010/; compare https://www.ppfanwen.cn/gudianbook/yijingshuji/zipingzhenquanpingzhu/574535.html). The former distinguishes mediation by a generating intermediary from actual obstruction; the latter describes role-specific rescue contexts, including officer threatened by hurting-officer with resource intervention, and food threatened by indirect resource with wealth protection. Do not generalize these rescue examples to every two-control chain. The two role matches are only candidate source bindings; pattern applicability is a separate unresolved premise. These are traditional textual hypotheses, not empirically established effects.

The explicit scenario evaluator requires route, source context, operation and explicit opposition to obstruction. Positive obstruction undercuts the application rule without producing a negative effect proof; contradictory obstruction evidence cannot authorize clearance. Explicit opposition to route, context or operation opposes applicability only. This is a conservative software authorization contract, not a claim that the classical text proves universal necessity/sufficiency. Production does not substitute a structural screen or dependency rank for actual operation, or an empty blocker list for clearance. The resulting source conditional remains unresolved, and no actual undercut of a control-effect rule is authorized. The original control and generation judgments and selection remain unchanged. `interpositionPolicyReview` is additive to the mechanism review and invalid bindings fail closed.

Verification: three new isolated test bodies executed against the fetched production evaluator, element relation and policy module (all pass), covering all three policies, missing/contradictory premises, explicit obstruction, source role mismatch, partial scope and altered bindings. A native 24-variant core/V10 parity test is registered in the existing argumentation test file. Attempted isolated replay of the complete core dependency graph exceeded the connector call limit; native Node ESM and full regression are not verified. Next: native validation, then P1-3c source-scoped combination restrictions; do not authorize actual effects from these results.


## P1-3c: stem combination, restriction, transformation and residual role

Base e39e752. Consulted the received 子平真詮 論十干合而不合 (https://www.tianyashuku.com/yijing/9643/814106.html, compare https://www.donglishuzhai.net/chapter/3718.html) and 徐樂吾 commentary (https://www.ncc.com.tw/fate/paleo/bg/bg_032.htm). Distinguish literal pair, actual contact, external role restriction, transformation and retention of a specific original role. The self-combination exception concerns external removal, not universal preservation. The text's remote and intervening cases and separated competition counterexample 庚午乙酉甲子乙亥 do not justify an automatic distance cutoff or winner allocation. The commentary's 丁卯丙午丙子壬辰 and 乙酉甲申丁巳庚戌 contrast remote contact with different contextual readings. True/false transformation is discussed in the commentary; do not conflate ordinary natal pair review with exceptional transformation patterns. These are source-scoped traditional interpretations, not empirical causal evidence.

`outcome-combination-policy.js` consumes the residual context's exact pair/participant/action inventory, rather than recalculating roots or combinations. Bind the affected endpoints to the original effect propositions; count hidden-endpoint actions separately. Each pair carries source-case diagnostics and exact participant original-root/incoming/alternative refs. Three independent assumption-only policies (external-role-restriction, transformation, residual-role-retention) require positive pair, contextual and operational premises and explicit clearance. For external restriction only, a supported self-combination observation excludes the rule and explicitly opposes its applicability. It does not oppose transformation or actual action. Obstruction undercuts a conditional without negating the effect. A failed transformation scenario does not establish retention. Remote contacts, competitors, intervening controls and target-supply contexts remain review evidence, not effective obstruction, allocation or transformation. No real action is removed, no stem or element rewritten, and no actual-effect rule authorized. Branch combinations remain in the existing formation/access context, outside this step's stem-pair scope.

Verification: three new isolated test bodies against the fetched production policy and argument evaluator pass, including scope, independent conditionals, partial scope and tampered identities. Registered native 24-variant V10 parity and three classical contrast cases in the existing argumentation test file, but native integration and full regression are unexecuted (container GitHub DNS fails). Next P1-3d: clash-scoped root exposure versus actual damage/relief and preservation, maintaining separate effect authority.


## P1-3d: directed branch clash, relief and physical root exposure

Base 9a7276f. Source review: 滴天髓輯要 地支論 (https://www.shidianguji.com/book/7654517725435265075/chapter/1m5zgml2zaqkp), 滴天髓闡微 地支 (https://zh.wikisource.org/wiki/滴天髓闡微), and 子平真詮 論刑沖會合解法 (https://changxianyi.com/guji/ziping/wz-20260914/chapter-008/; compare https://shixingji.club/library/zipingzhenquan). The traditional contrast between strong and weak sides of a clash concerns branch context; it is not a calibrated strength measure or a rule that erases every hidden constituent. The commentary contrasts 午 supported by fire/wood with 午 under water/metal support. The 子午 clash with 丑 joining 子, followed by 巳酉 joining 丑, is an explicit contrast against unconditional relief by formation presence. These sources are traditional interpretations, not empirical evidence.

`outcome-clash-policy.js` consumes the existing clash residual owner. For each physical clash, register two directional contexts, each with separate weak-side damage and strong-side preservation conditionals. For each exact clash/formation pair, evaluate the relief conditional independently. Each source conditional needs explicit contact, context, operation and clearance; obstruction undercuts applicability without creating negative effect evidence. These are conservative authorization conditions, not universal necessary or sufficient laws from the sources. No direction is derived from day strength or Boolean profile dominance. No branch conditional is promoted to slot-level damage or restoration. A root-side relief candidate and an opposite-side candidate retain distinct identities; relief does not restore roots, and restoration does not establish effective supply. Preserve shared physical slots, residual versus substantial roots, outside uncontested roots and incoming supply as separate references, not additive capacity. Validate all visible actors' exposed roots against literal slot identity; bind only affected visible actions to original effect judgments. No actual effect undercuts, edge removal, or new force decisions. `clashPolicyReview` is additive to the mechanism review.

Verification: three isolated test bodies passed against the fetched production argument engine and clash policy, covering all three source conditionals, partial scope, both directions, exact relief side, omission of slot/occurrence/action rows and fabricated effects. A native 24-variant V10 parity test is registered in the existing argumentation test file. Current container DNS lookup for github.com returns no address; native repository-wide regression was not executed. Next P1-3e: jointly bind competing/shared constraints without treating candidate counts as confirmed effects; then prioritize justified premise resolvers and positive/negative contrast controls over additional diagnostic-only adapters.


## P1-3e: joint conditional dependency closure

Base 59dd161. Introduce `outcome-joint-constraints.js` as a composition layer over the existing argument, source-effect, interposition, combination, clash and grounded-supply reviews. Join on exact directed action, physical root, pair, path and relief IDs. Retain shared root uses (including direct/indirect and source/target roles), competing stem pairs and overlapping/competing relief alternatives as context, not proof of exclusive allocation or independent capacity. The action rows link source clause IDs and affected combination/exposure/interposition records. No force budget or vote counting.

The joint scenario uses the existing signed argument engine. Each candidate has alternative conjunctive rules, with independently observed (here explicitly assumed) undercuts and optional explicit rebuttals. A supported path requires source context, actual-operation assumptions, explicit clearance, readiness of each required intervention leg, and readiness of every pressure dependency. The original target control action is NOT a required effective intervention leg. For a leg affected by combination or exposed roots, require explicit clearance of the corresponding exact-leg restriction predicates; observed contact/exposure alone is not a restriction. These conditions are conservative scenario authorization choices, not universal classical necessity/sufficiency. Shared leg IDs reuse the same candidate, so a restriction can block every dependent path while leaving independent alternatives intact. A pressure candidate requires an alternative path plus a separate explicit relief-operation assumption. Out-of-scope pressure has an independent unknown relief assumption, never implicit clearance. Source-unmatched paths remain unassessed. Cycles with no independent proof remain unresolved; a blocked rule does not negate a conclusion. Missing assumptions do not create opposition. Scenario judgments are conditional readiness only, not causal effects. Production assumptions are all unresolved and no actual force is promoted. Pair competition and competing relief references are preserved but no allocation/priority law is authorized.

Verification: three new isolated test bodies executed against the fetched production argument engine and joint module with assertions; all passed. Covers seeded/unseeded cycles, independent alternatives, explicit opposition, conflicting restrictions, exact leg identity, shared root identity, missing pressure relief, scope and source-unmatched routes. Registered native 24-variant V10 replay in the existing argumentation test file. Container GitHub DNS lookup did not resolve; native regression is unexecuted. P1-4 must now prioritize source-scoped predicate resolvers, independently specified positive and negative controls, and authorized effect rules rather than adding more observation-only wrappers. Keep unsupported hypotheses unresolved and distinguish traditional internal consistency from empirical validation.


## P1-4a: day-strength directional resolver and signed balance judgments

Base dd4ae94. First resolve a predicate that already has an explicit upstream owner, rather than invent thresholds for 木多, 金堅 or other element-wide predicates. The existing strength-decision-v1 result is only a day-master directional hypothesis. Accept it within complete scope when its status is hypothesis, confirmed remains false, direction and recognized authority grounds agree, and conflicts are empty. Unrecognized/duplicate grounds and contradictory strong/weak grounds are not accepted. Do not substitute this result for any element-wide excess, resistance, weakness or strength predicate in the P1-2 source registry.

Classical basis: 徐樂吾 子平真詮評註 扶抑 (https://libokang.com/zh-hant/classics/bazi/%E5%AD%90%E5%B9%B3%E7%9C%9F%E8%A9%AE%E8%A9%95%E8%A8%BB/), compare 子平真詮 論用神 (https://www.donglishuzhai.net/chapter/3721.html) and 論用神成敗救應 (https://www.donglishuzhai.net/chapter/3722.html). These distinguish support of a weak day and release/restraint of a strong day in specific ordinary contexts, while the pattern and climate frameworks impose separate conditions. The new scope is an ordinary-balance directional objective, not a final useful-element preference or an empirical causal result. The existing balance feature owns element-level candidate hypotheses; this new review binds exact visible day-involving action identities to signed argument proofs and the original effect propositions. Incoming generation fits a weak-day objective; outgoing generation and incoming control fit a strong-day objective. Explicit opposite direction opposes fit only, not efficacy. Outgoing control, peer support, hidden actions, special patterns and climate priority remain outside this review. A direction-aligned action with an independently supported existing structural screen may yield a supported structural candidate. Failed/conflicting/unknown screens do not establish negative efficacy. This first production resolver yields positive and negative directional judgments, but does not authorize the actual-action-effective proposition. No change to legacy mechanism or decision authority.

Verification: three isolated test bodies executed against the fetched production argumentation, elements and direction modules, all passed, including strong/weak contrast, unrecognized/conflicting authority, exact edge identity, failed/conflicting structural screens and missing-hour scope. The native 24-variant replay is registered but not executed: git ls-remote failed because github.com did not resolve in the container. Synthetic controls are not independent source-labelled charts. P1-4 remains open: next validate source-specific effect predicates against independent positive and negative cases, then authorize narrow traditional modeled-effect rules only where evidence and declared conclusion match. Do not expand generic actual force authority from directional fit.


## P1-4b: experimental element-context predicate resolver

Base 7540156. Separate seasonal 旺衰 context from supported strength hypotheses: 子平真詮 論十干得時不旺失時不弱 (https://www.donglishuzhai.net/chapter/3719.html), comparison https://changxianyi.com/guji/ziping/wz-20260914/chapter-007/ and 滴天髓闡微 (https://zh.wikisource.org/zh-hant/滴天髓闡微). The traditional texts emphasize root quality, seasonal support and additional supporting or draining circumstances, rather than season alone; the commentary distinction between seasonal prosperity and strength must not be attributed to the original text without edition checks. These are traditional interpretive sources, not empirical validation.

`outcome-element-context.js` reuses the physical hidden-slot inventory, visible occurrences, seasonal relationships, grounded donor nodes and source-effect registry. Verify donor root coverage, exact visible directed action coverage, and consistency of seasonal origins. Repeated references to the same physical root do not increase the number of roots. Seasonal relationship and month principal relationship are distinct observations; neither is actual month command. For every element, derive signed evidence for ten explicit axes. The narrow experimental strong-context model requires visibility, both seasonal and month-principal support, an uncontested principal root, no observed contact or contested substantial root in that element, a clear month-branch context, and no observed grounded/contested burden basis (controller or outgoing generation/control counterpart). The weak-context model requires visibility, explicit lack of both seasonal and principal support, literal absence of substantial roots, no observed grounded/contested generator basis, clear contact/month contexts, and local visible grounded-controller coverage of every visible occurrence. These conjunctions are chosen conservative model conditions, not source-proven universal necessary/sufficient conditions; absence of a rooted basis does not establish absence of actual action. Failure of either model does not support the other. A positively established opposite model supplies opposition only to the modeled hypothesis. Missing hour suppresses both directions.

Only positive modeled strong/weak hypotheses may be passed as explicit assumptions to the matching P1-2 source conditional in the new review; the actual classical predicate and actual effect remain unresolved, with no substitution in the existing source-effect policy. Excess, deficiency, resistance, special patterns and hidden-only strength require separate criteria and controls. This is a first bounded element-level resolver, not an accepted calibrated strength classifier. Prior direction, selection authority and actual-effect judgments are unchanged.

Verification: 28/28 isolated test bodies passed using fetched production modules (argumentation, P1-2 registry, interposition, combination, clash, joint constraints, day direction and element context, plus actual element relation code) and an in-memory JS assertion harness. This includes three new tests with synthetic positive/negative controls, prerequisite deletion, jointly omitted root/action rows, forged predicate and partial scope. Eleven test bodies requiring native chart/core/fixture integration were not executed. The native 24-variant test is registered. A fresh container git ls-remote attempt failed DNS resolution of github.com; no claim of native suite or independent classical outcome validation. P1-4b remains partial until native replay and independent source-labelled contrast cases establish coverage and error behavior. Next prioritize independent positive/negative controls and a narrow modeled consequence/effect authorization with explicit distinction between injury, release, effective action and benefit; do not merely add more adapters or promote arbitrary strong/weak thresholds.


## P1-4c: narrow modeled consequences and source contrasts

Base fc9d7ea. Rechecked 三命通會 卷十二 元理賦 (https://www.shidianguji.com/book/SK1610/chapter/1kf5v8oqbug4m; https://zh.wikisource.org/zh-hant/三命通會_(四庫全書本)/卷12). The strong-source release and weak-target injury families describe different consequences. Neither is equivalent to favorable target supply, net control, final useful-element selection, or a verified causal effect. The excess and resistance families still lack reviewed predicate resolvers.

`outcome-modeled-consequences.js` joins the existing action, pressure, joint constraints and element context reviews on exact directed action and original effect proposition identities. Replay the original argument closure and the fixed experimental element-context model; namespace and import their original propositions, facts and rules into one proof graph rather than assert a derived strength label as an independent observation. Only the two registered families (ten element-pair clauses) can conclude a separate modeled-source-release or modeled-target-injury proposition. Require positive model strength/weakness and the original structural screen, adjacent visible action, a directly grounded source, no observed combination/clash references or other structural blockers, a clear observed source-pressure screen, and nonconflicting premises. Generation additionally needs the target-pressure screen; control excludes a pressure with any observed interposition candidate, including hidden candidates. These are conservative experimental screen conditions, not proof of real clearance or general classical necessities. No failed premise creates negative effect evidence; no scope, source or model label promotes the original actual-action-effective proposition. The existing generic argument engine remains unchanged. All modeled outcomes are structural hypotheses with a specific consequence kind and proof, not confirmed effective force.

Four pre-registered classical interpretation contrasts are stored in `test/fixtures/pattern-modeled-consequence-source-contrast-v1.json`: strong wood using fire, extremely weak fire under water control (滴天髓闡微 衰旺), officer injury with rescue (上下貴乎情協), and earth unable to restrain water (合局). These are new contrast probes, not independent adjudicated exact-edge ground truth; extreme-strength/special-pattern and rescue contexts must not be generalized. Audit with `npm run audit:pattern-outcome-modeled-consequences`: report the precise modeled state, prerequisites and author interpretation; abstention is neither a negative prediction nor a source agreement, and positive support contradicting the explicit negative probe fails the audit. No model fitting or accuracy claim from this packet.

Verification: 31/31 isolated test bodies passed using fetched production modules in the in-memory JavaScript harness, including three new tests with positive release/injury fixtures, counterconditions, proof tampering and partial scope. Twelve native chart/fixture tests were not executed; the 24-variant native replay is registered, and the new four-case audit is unexecuted. Container git ls-remote failed because github.com did not resolve, and the attempt to load the full core dependency graph in Code Mode exceeded the connector call limit. No claim of native Node or historical-chart validation. Next gate: execute native replay and audit, inspect coverage and failures before P1-4d. Do not promote modeled consequences to the original effective-action or selection contracts without further reviewed authority.


## P1-4c validation gate: actual production core coverage

Base 3f7e450. Recovered 33 exact production dependency modules through the repository connector (unreferenced temporary Git blobs, no source bundles committed to main). Evaluated their JS module bodies with the production core/review sequence, without stubbing the calculation functions. The first 36 variants were valid; the final reproducible coverage audit (34 modules including the test helper, fixture and URL adapters only) ran 40 variants: 16 historical interpretation probes and four synthetic literal-pillar controls, each complete/partial. No invalid contracts, partial promotion, or actual-effect promotion; eight control variants matched expected behavior. Native Node ESM, public V10 wrapper, calendar validity of synthetic controls, and historical predictive accuracy are not verified.

The complete historical packet has 82 eligible modeled consequence clauses: 47 release, 35 injury; zero supported. The element model was unsupported in 82/82, existing structural screen in 80/82, other context blockers in 69/82, combination/clash references in 47/82, source pressure in 44/82, adjacency in 40/82, direct grounded source in 39/82; interposition candidate absence in 35/35 controls, target pressure in 33/47 generations. These are overlapping counts, not a sum of causes. No single failed premise accounts for any historical abstention. Positive synthetic release and injury were observed with the actual core; changing one pillar introduced contested roots or an interposition candidate and withdrew the result. In the latter case both model and structural screen remain supported; the only remaining gate is candidate absence. This verifies reachability and conservative withdrawal, not that any observed candidate actually neutralizes control.

Added `npm run audit:pattern-outcome-modeled-coverage` and optional `-- --require-coverage` (nonzero exit on zero coverage), with regression controls and baseline report `docs/pattern-modeled-consequence-coverage-v1.json`. Readiness is `blocked-zero-coverage`, not failure of the runtime or evidence of historically negative effects. No production predicate thresholds or judgment authority changed. Before P1-4d/e, review the element-model sufficiency conditions against separately labelled ordinary cases, distinguish structural feasibility of interposition from mere candidate presence, and separate evidence of rooted burden from actual burden. Do not remove guards simply to obtain nonzero coverage. Coverage alone never establishes correctness.


## P1-4d-a: direct injury tendency versus residual injury

Base 2ad3deb. Refine the existing modeled-consequence owner rather than add a parallel inference engine. Version p1-4d-modeled-consequence-v2 splits the control consequence into an explicitly modeled direct injury tendency (same original strength, structural and contextual premises except the interposition-candidate gate), and the existing modeled-target-injury conclusion (now requires direct tendency plus no observed interposition candidate). This latter conclusion is a restricted residual model hypothesis, not a proven real net injury. A present candidate is not evidence of relief or opposition to the direct tendency. Its unresolved operation still prevents residual support. Generation/release rules and original actual-effect authority are unchanged.

Bind candidate IDs to both raw target topology and pressure path inventory, validate exact participant relationships and dependencies, and recompute least structural dependency closure before consuming ranks. Report each candidate as screen-reachable, screen-blocked, dependency-unresolved or partial, with actual relief unresolved in every case. Screen-blocked is not a proof of impossibility of relief. Coordinated path omission and manufactured ranks cannot authorize absence-based residual inference. The source and coverage audits expose direct and residual states separately. Production models continue to use conservative conditions; no new thresholds or classical predicates introduced.

Executed 40 core replay variants (34 fetched modules including audit helper), before/after equality of every legacy clause state and blocker list, zero contract errors. All 184 candidate occurrences associated with the 35 control clauses of the 16 complete historical charts were screen-blocked; all 82 historical modeled outcomes remain unresolved, including the direct tendency. In synthetic injury-interposition control, direct injury is supported, residual unresolved, and the sole protection candidate has nonlocal-chain and helper-root-not-observed blockers. This establishes the semantic separation, not efficacy of the candidate or a corrected historical interpretation. 33/33 selected test bodies (31 isolated plus two coverage tests) passed in the JS harness. Native V10/Node and 12 native test bodies are not executed. See docs/pattern-modeled-direct-residual-replay-v1.json. P1-4d remains incomplete: the strength model and structural screen still dominate abstentions; future work should establish independent ordinary-chart contrasts and source-specific alternative support routes, then resolve actual constraints only under justified modeled authority. Do not reinterpret screen failure as a negative effect to raise coverage.


## P1-4d-b: resource-backed alternative element strength argument

Base 18b37cc. Source rationale: 子平真詮 論十干得時不旺失時不弱 (https://www.donglishuzhai.net/chapter/3719.html), commentary (https://changxianyi.com/guji/ziping/wz-20260914/chapter-007/). Seasonal status, substantial roots and support must be considered together; the presence of wealth/output or control relationships does not alone establish weak capacity. The following is an explicitly experimental, narrow sufficient condition, not a classical universal necessity/sufficiency or verified force inference.

Version p1-4d-element-context-model-v2 preserves both original strong/weak routes, adding strong-resource-model and its modeled weak contrast. Require visible element, both seasonal and principal support, clean month principal root, clear element/month contacts, an independent local resource witness and no rooted incoming-controller basis. The resource must have a clean physical root outside month, near its donor and visible recipient. Keep witness IDs and do not count repeated references to a slot as independent capacity. Rooted outgoing generation/control counterparts can coexist with this argument; rooted or context-review incoming control still prevents the new route. No actual resource operation, actual clearance, excess, deficiency, resistance or net effective action is established. Unknown premises never imply the opposite hypothesis. The old routes and authority remain; the original proof graph is replayed by modeled consequence review.

Executed 46 complete/partial variants via 34 fetched production core/helper modules; zero contract errors. All 40 existing final clause and direct/residual injury states unchanged. New synthetic metal resource-backed release (己丑 辛酉 癸亥 辛酉) supported by strong-resource-model; replace 己丑 with 己酉 and the only missing final premise is element-model, so release abstains. Introducing rooted controller (丙午 hour) also abstains. These literal-pillar controls are not birth-calendar verified. 34/34 selected test bodies passed, with 12 native chart/V10 test bodies not executed. In the historical packet, model support rises 0/82 to 2/82 (both outgoing wood-fire relations from the same previously registered extreme-strength chart 甲辰 丁卯 甲子 戊辰; not two independently validated charts). The commentator's reading includes exceptional strength/formation (https://www.shicihui.com/zh-tw/book/ditiansuichanwei/16287), so this is only contextual agreement, not validated ordinary strength or useful-element selection. Both relations still lack structural support and target-pressure clearance; all 82 historical final outcomes remain unresolved. Readiness remains blocked-zero-coverage. See docs/pattern-element-alternatives-replay-v1.json. Next focus: separate direct generation/release tendency from target reception/pressure and examine structural evidence support without using candidate presence as actual defeat; do not broaden effective-action authority or tune to the historical probe.


## P1-4d-c: direct release tendency versus joint generation screen

Base 11cfe9a. Version p1-4d-modeled-consequence-v3 decomposes the existing generation structural screen into its original source-basis, contextual-blocker and source-pressure observations, retaining the target-pressure observation separately. Validate all four exact proposition identities, signed states against the supply record, the fixed original policy's one conjunctive support rule and four independent opposition rules, and the original full-screen judgment. Reject missing or mismatched subproofs instead of bypassing opposition. A new direct-release-tendency structural hypothesis uses the existing strong model proof, source-side screen and other unchanged direct-action conditions; it does not require target-pressure clearance. The old release hypothesis still requires the direct tendency, original full screen and target-pressure clearance. The split is an explicit model distinction, not a source-validated universal claim that a pressured recipient necessarily permits actual discharge. Target-pressure opposition is not opposition to reception capacity. Actual reception, actual effect and selection authority remain unresolved/absent.

Executed 46 complete/partial core replays using 34 fetched core/helper modules; no errors and exact parity of legacy clause states, blockers and direct/residual injury states. Two direct release tendencies in the same previously registered extreme-strength chart (甲辰 丁卯 甲子 戊辰) are now supported: year/day Wood to month Fire. The original source-side proofs pass, target pressure fails, joint release remains unresolved. No independent historical validation is claimed. Final legacy coverage remains 0/82; direct release tendency coverage is 2/47 generation clauses. 35/35 selected test bodies passed, including source versus target pressure contrast, mismatched proof rejection and partial scope; 12 native tests and the public V10 wrapper remain unexecuted. Report: docs/pattern-source-release-replay-v1.json. Next examine source-specific reception and protection/mediation operation prerequisites using existing owners and independent contrasts. Do not infer actual relief, actual reception or effect from structural availability alone.


## P1-4d-d: independent protection and mediation channel proofs

Base 9761fb9. Version p1-4d-modeled-consequence-v4 extends the same proof graph, not a parallel decision engine. Exact visible candidate paths must agree with raw pressure topology and joint-path/leg/dependency inventories. Each leg must have observed direct rooted source, adjacent visible endpoints, no observed combination/clash reference or context blocker, and a clear source pressure screen; conflicting structural subproofs do not support a route. Protection uses the original stable control-profile proof of helper controlling threat. Mediation requires the original full generation screen for threat-to-helper and the original source-side screen for helper-to-target (target pressure is the issue under review, not already resolved). The route additionally requires independent rank zero, no other route blockers and no outstanding pressure dependency. Rank above zero is not treated as established relief. The result is a modeled counterpressure/mediation channel, not actual operation, source-conditional applicability, net pressure relief, or target reception. The original pressure action is not a prerequisite leg or defeated by the channel. Hidden candidate routes are not promoted; named pattern context and joint resource allocation remain unresolved.

Executed 54 complete/partial core replays using fetched production modules plus audit helper. All 46 previous action rows match exactly before/after; no errors. Four additional synthetic controls: 己丑 庚申 壬子 己丑 supports the year-earth -> month-metal -> day-water channel; change month to 庚午 and support withdraws. 乙卯 己卯 癸卯 己未 supports year-wood counterpressure on month-earth; change hour to 己丑 and a helper-pressure dependency prevents the independent route gate despite established leg premises. All four partial variants abstain. The existing resource-backed release control also supports a mediation channel. These are literal-pillar synthetic contrasts, not birth-calendar-verified or historically labelled results. Among 16 complete historical charts, 40 all-visible candidate routes (14 protection, 26 mediation) remain unresolved, as do all actual relief/reception judgments. Legacy final outcome coverage remains 0/82; the two previous direct release tendencies remain supported. 36/36 selected test bodies passed; native Node ESM and public V10/12 native tests not executed. See docs/pattern-interposition-operation-replay-v1.json. Next: model specific combination/clash restrictions and root preservation with positive/negative evidence rather than treating every contact as proven restriction; keep true operational relief and source-context authority separate until independent contrast evidence is available.


## P1-4d-e: contact constraint sensitivity and exact counterfactual root/role screening

Base 3223c3e. New contactConstraintSensitivity review composes the existing physical root, grounded supply, combination/clash policy and joint constraint owners. It does not change these owners or the modeled consequence/route rules. Bind literal visible stem combinations, pair source scope, physical hidden slots, direct-root projections and exact affected-action identities. The day-master self-combination exception only opposes the specific external-removal source conditional; it cannot establish original-role retention or absence of a pair restriction. For clash-relief alternatives, retain exact side, participation and target-element difference; distinguish isolated contact from competing/remaining clashes and formations. Neither is actual relief/restoration.

Root availability is evaluated in a signed counterfactual graph. Each substantial physical slot is a separate explicit availability premise. One nonconflicting surviving slot supports the hypothetical direct-root basis; explicit unavailability of every substantial slot (or a complete empty literal inventory) opposes it. Unknown or conflicting slots cannot prove loss of the whole basis. Production varies only the named counterfactual: all clash-exposed substantial slots unavailable, uncontested observed slots available, other contested slots unknown. Residual slots cannot witness substantial roots. An exact-edge conjunctive hypothetical screen combines source direct-root basis with explicit opposition to every relevant pair restriction. Positive nonconflicting pair restriction or absence of remaining direct-root basis opposes this screen, not actual operation. In production all pair restriction assumptions remain unresolved; even self-combination scope exclusion is not clearance. No scenario result changes actual capacity, root loss, preservation, restriction, transformation, restoration, relief, effect or selection authority. Partial scope abstains.

Executed 54 complete/partial core variants via fetched production modules and audit helper. All 54 prior action rows and interposition routes exactly preserved; zero audit errors. In the 16 complete historical charts, 17 visible occurrences have substantial clash-exposed roots: hypothetical remaining basis supported 7, opposed 7, unresolved 3 (occurrences may share physical slots; not independent validation units). For 47 contact-affected action rows, the hypothetical source-root/pair-clearance screen supports 11, opposes 16 and abstains 20. These are not counts of actual viable/blocked actions; opposition includes literal lack of substantial source roots. Six stem-pair occurrences include two self-combination exceptions. The historical packet has no clash-relief alternatives; synthetic mediation-root-loss control includes competing relief alternatives, all actual restoration unresolved. Final modeled outcome coverage remains 0/82 and direct release support 2/47. Selected tests 39/39 passed, including explicit hypothetical loss, conflict, pair clearance, source scope and core contrasts. Native Node ESM/V10 and 12 native test bodies remain unexecuted; native parity assertion registered. See docs/pattern-contact-constraint-replay-v1.json.

Next: P1-4e should consolidate proposition types into an action-level interpretation with strict non-promotion, explicit unknowns and traceable alternatives; do not replace original judgments with counterfactual screen results. Full native integration validation and independent source-labelled ordinary-chart coverage remain prerequisites to stronger authority.


## P1-4e: exact action synthesis without cross-scope promotion

Base 3fe2691. Add actionSynthesis (p1-4e-action-synthesis-v1) as a read-only composition of the existing argument, source clause, element model, ordinary day-balance direction, joint constraint, modeled consequence and contact sensitivity owners. Bind exact visible directed action inventory, original effect/structural propositions, source clause/predicate actor identities, route/leg/dependency identities and contact-affected edge inventory. Replay original, modeled and day-direction proof graphs and each relevant counterfactual action graph; require original judgments to match the embedded modeled graph. Reject altered judgment summaries and incomplete projection coverage. This validates proof closure and binding of already validated owner outputs, not authenticity of arbitrary jointly fabricated upstream policies or source evidence.

Each action exposes: original structural and actual-effect proof references; each classical condition's actual versus experimental applicability; strength-model proof; direct consequence and joint/residual screen separately; ordinary directional objective where applicable; exact contact references and distinctly scoped hypothetical screen; visible route proofs and unassessed candidate IDs; rule alternatives with signed missing premises and undercuts. Descriptions retain owner and proposition identities and first-rank witnesses, with no cross-proposition voting or force scores. The disposition is only the strongest established modeled consequence tier (partial, no-consequence-support, direct-tendency-supported, joint-screen-supported); supported route kinds and direction fit remain orthogonal. No route can establish relief, no hypothetical clearance can establish observed clearance, and no objective fit can establish benefit or select a useful element. Actual effects/reception/benefit stay unresolved. The production V10 efficacy review includes the new adapter in its invalid-evidence gate, and a native replay parity assertion is registered.

Executed 54 complete/partial core replays using fetched production module bodies and audit helper. Exact parity of previous action rows, interposition routes and contact sensitivity objects; zero audit errors. All 82 eligible complete historical visible actions have synthesis rows; two direct release tendencies from one previously exposed chart remain supported, no joint/residual consequence support or modeled route support. Native ordinary day-strength projection is not run in this harness (null supplied), so direction fit is withheld rather than treated as a failed objective. Separate explicit strong/weak assumed-direction contrasts show fit changes while direct tendency and actual benefit/effect remain independent. 42/42 selected test bodies passed; 12 native chart/V10 tests remain unexecuted. See docs/pattern-action-synthesis-replay-v1.json. Coverage readiness remains blocked-zero-coverage; synthesis is not increased predictive authority or independent accuracy validation. Next gate P1-5: native ESM/V10 replay including production strength projection; then independent, source-labelled ordinary chart contrasts and explicit assessment of missing predicates/route prerequisites. Do not introduce new effect authority to compensate for zero coverage.


## P1-5a: native validation entry point and outstanding execution gate

Base c270098. No production policy or judgment changes. Add `npm run audit:pattern-outcome-native-p1`: exercise the public V10 facade over the existing 16 development and 11 synthetic literal charts, each complete and missing hour (54 variants). Independently call the production strength policy for complete scope, project its exact result, and compare it with V10's regulationStrength. Re-run the core chain with this calculated projection (not a fixture strength direction), compare eight mechanism owner outputs by deep strict equality, verify direction scope, existing consequence/route controls and authority abstention. This tests integration and projection parity, not empirical accuracy or independent gold. A null/unresolved computed direction is valid and must not be replaced by a guessed label.

The provenance-aware full validator now includes the modeled consequence, modeled coverage and native P1 audits. Its new focused profile `npm run validate:pattern-outcome-native-p1 -- ../saju-kit-p1-validation` executes five native test files and four audits, retains exact stdout/stderr and exit status for each job, checks clean tracked/untracked state and unchanged HEAD before/after, and emits summary.json. The full validation command remains available. The focused profile is not a substitute for the full repository regression.

Current environment: Node v22.16.0 available; git ls-remote failed (could not resolve github.com), public codeload archive was not retrievable. The repository is accessible via connector, but not mounted as a native ESM checkout. The two new/changed script bodies were copied byte-for-byte and verified against Git blob SHAs (native audit 475dba5f0d40374391d27720836f2525c6d44f06, validator 79beae7e581c9681e0cbdab7eb0e0417bb08537e); both passed node --check. The existing provenance unit test and module were also copied with exact SHA parity; native Node test 3/3 passed. Neither the new native V10 audit nor the full/focused validator was executed against the actual checkout. The previous 12 unexecuted native integration tests remain uncertified; no new coverage or accuracy claim. P1-5a status is **execution pending**, not passed. Run the focused profile from a clean local checkout and inspect summary.json and failing job logs before proceeding to independent P1-5b adjudication; do not authorize selection/effect based on a script being added.


## P1-5b: frozen cross-domain exposure inventory and prospective intake

Base 3cdd5f4. Native P1-5a execution remains pending; this data-separation task does not require evaluating any new chart. Freeze `docs/pattern-outcome-exposure-snapshot-v1.json` against the pinned base tree: all 34 JSON fixture files (including files without chart literals) and the 11 explicit replay controls in the existing helper. Record Git blob identities, JSON pointer locations, case identifiers, normalized year/month/day/hour pillars, raw transcription alternatives and source URL observations. Across 35 input files: 603 parsed references, 229 unique normalized chart identities (228 complete, one partial), 75 normalized URL strings. Five unparsed raw references (two references to the same malformed transcription 甲申壬申乙己戊寅 and three null values) are retained for review, not silently corrected; the corresponding normalized records are inventoried. All 16 P1 historical development charts are already exposed; 13 appear in other inventoried inputs. None is independent validation gold, including the earlier "prospective" or "holdout" fixtures of other policies.

`npm run audit:pattern-outcome-exposure` reads the frozen inventory and scans live JSON fixtures plus controls. It merges their identities without discarding frozen exposures if a fixture is removed or edited. Drift counts and the inventory digest are reported. The snapshot is not proof of complete repository history or complete text/inline-test coverage. No source text was newly adjudicated. The 229 count is literal chart identity count, not authenticated births, people, independent cases or source-author clusters.

External unlabelled intake: `npm run audit:pattern-outcome-exposure -- --candidate ../p1-5-intake.json`. Schema: {"version":"p1-5b-intake-v1","candidates":[{"id":"unique-id","pillars":["甲子","丙寅","戊辰","庚申"],"source":{"work":"...","commentator":"...","edition":"...","chapter":"...","passage":"...","url":"https://..."}}]}. The illustrative chart is not a proposed independent case. Candidate file must resolve outside the repository. Normalize Hangul/Hanzi, require four sexagenary-valid pairs (not full calendar verification), quarantine exact four-pillar matches, one-position variants, and exact overlap with three known positions of prior partial charts. Reject duplicate/near-duplicate candidate packets and model/expected label fields. Matching normalized source URL requires additional source review; different URLs cannot prove source independence. Even a clean screen is review-pending, never gold. Human checks of author/edition/passage clusters, prior history and inline exposures, scope, transcription, external reviewer independence, and pre-evaluation freeze remain mandatory. Keep adjudicated labels separate from development; do not evaluate screened candidates yet.

Executed six selected test bodies using the fetched exact pure exposure module and frozen JSON in a JavaScript isolate (fixture-read adapter, not native Node); all passed. Recombined the actual extracted records from the pinned Git blobs and obtained exact chart/URL/unparsed parity and zero drift. All 16 development charts are quarantined by intake. CLI parsed in isolate but native filesystem, realpath, digest and npm validation profile not executed. Registered the test and audit in both native validation profiles. No new holdout candidates or independent labels collected; independent gold remains zero. Next P1-5c: collect ordinary-chart candidates from source passages outside the known exposure set and register a blinded adjudication queue before any model evaluation. Do not bypass the pending native V10 gate.


## P1-5e preparation: development-only proof obligation diagnosis

Base 5fce8c2. Native P1-5a and independent P1-5d adjudication remain pending. No prospective candidate was evaluated and no runtime rule or decision authority changed. External intake, notes and task draft files retain their recorded SHA-256 byte hashes. GitHub DNS is still unavailable in the native container; Node v22.16.0 exists.

Add `npm run audit:pattern-outcome-proof-obligations` (no external arguments) over the two fixed previously exposed development packets. Replay the original argument graph and compare judgments/rule results; traverse each requested signed literal through missing premises of its producer rules. Preserve OR alternatives and AND premise groups, exact undercut and scope reasons, contrary observations, unestablished observations, unsupported hypotheses, absent effect authority, and cycles. Iterative traversal avoids call-stack recursion. Reachable terminal unions and frequency counts are descriptive, not minimal/sufficient repairs, causal attribution, or proposed changes to the premise truth values. A conflicting proposition can have its requested sign established; this is not unqualified agreement. Element-axis diagnostics retain exact namespaced proposition identities.

Executed 16 complete development charts, 286 signed target inspections (47 direct release, 35 direct injury, 47 joint release, 35 residual injury, 14 counterpressure routes, 26 mediation routes, 82 actual actions). Two direct release signs established; all other targets unestablished. No cycle targets in this census. The direct release frontier contains contrary observations in 45/47, including noRootedBurdenBasis in 45 (reachable via original strong alternative, not a universal necessary condition), cleanMonthPrincipalRoot 36, noRootedControllerBasis 34, context-blockers-empty 41. For direct injury, noRootedGeneratorBasis 28, substantialRoot opposition requested but contrary observed 27, localGroundedControlCoverage 24; stable-control-profile-contrast unestablished in 30 and contrary observed in 3. Every residual injury target has observed interposition candidates (35/35); every visible route has contrary independent-route-screen (40/40). Actual-action targets 82/82 end at effect-authority-absent, not a missing observation that can be tuned away. Counts overlap and are not independent validation samples.

Priority: (1) native public V10 regression, (2) validate comparative control evidence and document where profile incomparability differs from insufficient control, (3) inspect specificity and applicability of strength alternatives and context gates using development-source contrasts, (4) evaluate route dependency and residual-effect conditions only with distinct source-backed operational hypotheses, (5) independent source adjudication before model rule or authority changes. Do not lower thresholds or convert topology/structural proof into effective action just to improve coverage. Three synthetic test bodies passed with exact fetched module bodies and a JS test adapter. Development core audit executed in a JS isolate with fixture adapters, not native ESM/public V10. Registered in full/focused native validation profiles; neither native profile executed. Report: docs/pattern-outcome-proof-obligations-replay-v1.json. P1-5e rule changes remain pending, not validated.


## P1-5e preparation: relative-force comparison sensitivity

Base 44f3602. Preserve the existing Boolean profile partial order and stable-control contrast authority. Add compareForceCompletionEnvelope in the core relative-force owner: for each exact axis, enumerate the possible equal/left-only/right-only contributions of true/false/null values; accumulate a four-state bitmask set without enumerating the Cartesian product of all axes. This is an independent Boolean completion overapproximation, not a physically consistent scenario set (root, season and supply axes may be dependent). An invariant relation means every abstract completion has that same profile relation, not an effective-force claim. Partial-hour scope does not expose a completion relation because new observations can enter. Reject invalid axis inventories and values.

PressureDependencyReview now binds the original, root-sensitive, nonseason and season-only comparison views to the oriented exact profiles and replays signed axis inventories. The additional comparisonDiagnostics records possible/invariant relations, known opposing axes, identical profiles, completion-sensitive direction and cross-view instability, and unmet controller-dominance conditions. Hidden comparisons remain unavailable. No new premise derives stable dominance, actual control, injury, relief or selection; existing control contrast and argument outcomes remain unchanged.

Development-only audit: npm run audit:pattern-outcome-relative-force-sensitivity. 16 complete and 16 partial variants from fixed exposed packets, 35 complete visible control edges and 20 partial edges. Original stable contrast counts: 2 controller-dominant, 3 target-dominant, 30 unstable. Of the 30 unstable, 15 have known opposing axes (12 already classified mixed and 3 previously unresolved but invariant mixed under all abstract completions); 14 have completion-sensitive direction; 1 has cross-view stability condition unmet. These are diagnostic profile classes, not evidence for ineffective control. The 17 unresolved root-sensitive comparisons consist of those 3 invariant mixed and 14 completion-sensitive cases. Do not infer a real outcome from possible/invariant profile orders or count evidence axes as votes.

Nine selected pressure test bodies passed, including exhaustive comparison against explicit Boolean completions for all 729 pairs of three-axis ternary profiles. One native V10 pressure test not run. Existing 54 complete/partial core replay return objects match before/after exactly (excluding the newly exposed pressure diagnostics, which the core replay helper does not return). New audit executed 32 variants, zero errors, JS isolate with fetched module bodies and fixture/test adapters; native Node ESM and public V10 not executed. No prospective 14-chart candidate evaluation, no new independent labels or force authority. Report: docs/pattern-outcome-relative-force-sensitivity-replay-v1.json. Next: investigate distinct source-backed contextual comparison principles for genuinely mixed axes, rather than resolving them by weighted sums; separately examine physical-slot dependencies of uncertain supply axes. Native integration and independent adjudication remain required before policy changes.


## P1-5e preparation: relative-force contextual principles (B)

Base 4d31cf8. Source rationale: 子平真詮 論十干得時不旺失時不弱 (https://changxianyi.com/guji/ziping/wz-20260914/chapter-007/) and 滴天髓闡微 衰旺 (https://zh.wikisource.org/zh-hant/滴天髓闡微#十七、衰旺), electronic transcriptions consulted. Both discuss contextual strength and limitations of seasonal judgment; neither establishes a universal binary root-over-season force ordering. The new policy is an explicitly modeled counterbasis for a seasonal-only ordering, not a classical sufficient condition for comparative strength.

Add outcome-contextual-force.js, composed into pressure comparisonDiagnostics only after original, root-sensitive, nonseason and seasonal axes pass exact orientation/parity checks. Keep root, seasonal and supply comparison views separate. For each side, require definite season-view disadvantage, an observed substantial root, and a definite advantage on one named root axis (four alternative conjunctions) to support root-counterbasis-to-season-order. The separate resource alternative requires the same disadvantage and substantial root plus an observed and relatively advantaged local rooted generation axis. Neither alternative equates a rooted peer with independent resource, assigns a force magnitude, or treats unknown as absence. The two counterbases support only season-only-order-incomplete; there is no rule for actual superiority or effect. Counterbasis non-support is not evidence that seasonal precedence is valid. The proof graph is scoped by the exact directed pressure ID and side; partial-hour scope abstains. Physical-slot dependencies and actual supply are not proved by these axes.

Reused npm run audit:pattern-outcome-relative-force-sensitivity with contextual coverage. Development-only census: 16 charts, 32 complete/partial variants, 35 complete visible control relations, 20 partial. Twelve complete relations support a seasonal-order challenge via root counterbasis; two also support resource counterbasis. All twelve belong to the 15 previously known-opposing-axes relations. No new stable dominance: original 2 controller-dominant, 3 target-dominant, 30 unstable preserved. Twelve selected pressure test bodies passed, including 3 new contextual tests and existing exhaustive 729 three-axis profile pairs. The prior 54 core replay return objects match exactly (new pressure diagnostics not returned by that helper). Native V10 pressure test skipped; native ESM/public V10 and independent review remain pending. JS isolate audit executed with fetched module bodies and fixture/test adapters; summary saved to docs/pattern-outcome-contextual-force-replay-v1.json; the per-edge report can be regenerated using the audit command. No prospective charts used; no actual control or selection authority. Next C: build physically shared slot/dependent supply scenario constraints before treating abstract completion possibilities as feasible; preserve current classifications as an overapproximation.


## P1-5e preparation: relative-force shared physical basis (C)

Base f14276d. Replace independent completion only for the *additional diagnostic envelope*, never the established force order or action judgment. New outcome-shared-force-basis.js builds one chart-wide physical-slot basis inventory from stem-force and root-context owners. Substantial uncontested slots are fixed observed basis; each clash-exposed or formation-contested substantial slot has one hypothetical eligibility variable, referenced by all matching exact/element/own-pillar/month-root axes and all donor formulas using it. Residual roots cannot seed the model. For visible donors, use their matching substantial slot inventory; for hidden donors, only their own node constituents. Node contact access is a separate shared, unresolved Boolean gate, not actual resolution of a combination. Each axis is an OR of AND terms. A donor's access gate alone cannot create a rooted supply observation. Replay original root inventories, observed/unresolved local donor identities and tri-valued sensitivity axes, rejecting binding mismatches. Missing-hour scope has no completion inference. No physical allocation, independent capacity, effective preservation, supply, or control asserted.

Compose the basis once in PressureDependencyReview; each directed visible pressure receives its own comparisonDiagnostics.sharedBasis. Fixed facts simplify formulas; the remaining distinct variables are enumerated exactly within the declared abstraction with a 16-variable budget. If the budget is exceeded return unavailable, never a guessed/truncated result. Distinguish the number of primitive assignments from distinct completed axis-profile pairs; witness assignments establish possibility only inside this abstraction. The resulting relations must be a subset of the independent Boolean envelope. Contact gates and contested slots remain independently hypothetical except for explicitly shared references; this is not an exhaustive physically compatible model of branch formations or transformations.

Audit: npm run audit:pattern-outcome-relative-force-sensitivity. 16 exposed charts, 32 complete/partial variants, 35 complete and 20 partial visible control relations. All 35 complete comparisons evaluated; 13 with shared unknown variables and 13 with narrower distinct profile-pair sets. Sum of independent per-edge profile-pair counts 2088, sum of distinct shared-basis pairs 220 (not a joint chart scenario count). Primitive assignments enumerated 768, max 256 per comparison, no budget exceedance. Possible relation sets narrowed in 0/35; newly invariant directions 0. This is removal of impossible intermediate combinations under shared assumptions, not increased stable dominance or prediction coverage. Original 2 controller-dominant, 3 target-dominant, 30 unstable unchanged. Synthetic tests establish direction narrowing when the same slot controls opposing profiles, and supply cannot become eligible from a contact gate without a donor basis. All 16 selected pressure test bodies passed in JS isolate with fetched production modules and test/fixture adapters, including 4 new shared-basis tests. Previous 54 core replay return objects matched before/after shared-basis integration; additional profile counts are diagnostic-only and not consumed by those outputs. Native V10 test skipped and native full regression pending. Report docs/pattern-outcome-shared-force-replay-v1.json. No prospective 14-chart evaluation, no independent gold, no rule authority promotion. Next D: compose contextual counterbasis, constrained completion witnesses, stable profile comparison and exact action context into a signed diagnostic argument without inferring actual control from any structural hypothesis. Independent source adjudication and native integration remain prerequisites to any actual-effect rule.


## P1-5e preparation: signed control synthesis (D)

Base 7f2f4b3. New outcome-control-synthesis.js composes the existing argument and modeled consequence proofs, pressure comparison diagnostics, and action synthesis into a separate control-only diagnostic graph. It checks complete visible-action coverage, exact directed pressure/actor identity, original judgment parity, shared-slot basis replay, contextual/abstract comparison replay, and exact direct/residual injury and visible interposition route proof references. The contextual and shared-basis evidence remains model-scoped. Contact counterfactuals are retained as references to the already validated action-synthesis owner, not premises of the new conjunction; no joint repair or simultaneous route operation is inferred. As with other compositions, this is an in-process upstream evidence contract, not cryptographic authenticity against coordinated fabricated upstream evidence.

For each exact control edge, separate the reported property of controller-profile dominance being possible in some shared-basis assignment from invariance across all enumerated assignments. Explicit opposition to those properties is not opposition to actual control. Positive direct-injury-with-invariant-profile-order requires stable controller profile screen, invariant shared-basis order, and the existing direct injury model screen. Residual-injury-with-invariant-profile-order additionally requires the existing residual screen. Opposing observation signs undercut these conjunctions, including conflicts; no rule derives actual effect or the negation of actual effect. Side-specific seasonal challenges, visible route model proofs, unassessed route candidates and the contact-loss counterfactual are separate evidence, not summed scores or assumed clearance. Missing-hour and budget exhaustion never supply positive completion premises. Reuse the original actual-effect proposition identity; no duplicate effect authority.

Integrated controlSynthesis in V10 mechanismReview and its validity gate, and included it in the native parity audit. New development-only command: npm run audit:pattern-outcome-control-synthesis. Both native validation profiles include it. The proof-obligation analyzer is reused for the new conjunctions.

Executed all 54 core variants (16 exposed historical charts plus 11 synthetic controls, complete and partial), zero invalid, exact before/after parity for prior core helper outputs excluding the new field. 46 selected argumentation test bodies passed, including four new control-synthesis tests; 12 tests requiring skipped paths not executed. JS isolate with fetched production module bodies and fixture/test adapters, not native ESM/public V10. Historical control census: 35 edges, possible controller profile order 10, invariant 2, direct and residual joint context supported 0. Direct conjunction undercut 33, remaining two have unestablished direct injury model screen; these are model obligations, not 33 actual ineffective controls. Synthetic census: 24 edges, possible 14, invariant 12, direct context supported 3, residual context supported 2. Injury control supports direct/residual twice; injury with interposition supports one direct and no residual. No actual control confirmed, no prospective candidate evaluation, no independent gold. Report docs/pattern-outcome-control-synthesis-replay-v1.json. Full report reproducible with the audit command. P1-5a native validation and independent adjudication remain prerequisites for any source-backed actual-effect rule; the A-D diagnostic track is implemented, not calibrated or validated for real efficacy.

## P3-B1 — Semantic bridge review obligations (2026-11-26)

Electronic texts rechecked: [子平真詮 論十干得時不旺失時不弱](https://www.donglishuzhai.net/chapter/3719.html), [三命通會 卷十二 元理賦](https://zh.wikisource.org/zh-hant/三命通會_(四庫全書本)/卷12), [子平真詮 論印](https://www.donglishuzhai.net/chapter/3748.html), [論偏官](https://donglishuzhai.net/chapter/3752.html). These are textual sources, not independent empirical validation, authenticated scans, or a second reviewer.

The source passages distinguish seasonal position from strength; generation from beneficial reception; strength from excess; and food control/resource mediation from a universal choice of route. The engineering review obligations below are interpretations of those distinctions, not verbatim necessary/sufficient classical predicates.

- `outcome-semantic-bridges.js` contains 12 typed obligations. Each identifies target scope, non-equivalent proxy observations, review questions and relevant source references. Empty sources explicitly record missing textual support, rather than borrow authority from a different predicate.
- Element strength (strong/weak direction remains on the source clause), excess and resistance use element-context subjects. The existing source clause remains unresolved.
- Recipient capacity uses a directed-edge subject, not source release or the generation screen.
- Joint route assumptions use exact path/leg/pressure subjects, including exact pair-edge and root-edge references for restriction questions. Existence of a reference is not evidence of actual restriction or clearance.
- All bridge states are unresolved; none adds a rule, modifies evidence, equates a primitive with an actual operation, or grants selection authority. The conditional Boolean evaluator still evaluates explicit hypothetical assumptions only.

This is a semantic inventory and binding layer, not a validated mapping from chart observations to actual operation. Source coverage is not equivalent to independent review. The next gate is a blinded, passage-specific review of a narrow proposed inference rule, including counterexamples, before adding any executable bridge. Native integration remains unverified: checkout DNS failed and connector dependency replay exceeded its call limit. No frozen reference labels were changed.

## P3-B2 — Element model coverage and source-inspired counterexamples

Rechecked the electronic text [子平真詮 六、論十干得時不旺失時不弱](https://donglishuzhai.net/chapter/3719.html) and the [commentary edition](https://changxianyi.com/guji/ziping/wz-20260914/chapter-007/). The text permits off-season rooted strength and in-season weakness in a sufficiently adverse context. It does not equate our binary root, donor, controller, or burden observations with these conclusions.

The existing model's three sufficient-condition sets and ten observation implications are now owned by elementContextModelContract, consumed by both the argument builder and the coverage audit. Explicitly contradictory axis values are invalid; unknown values are not filled by implication. The prior stricter input requirements for clean principal roots and local grounded control coverage remain. No changes to the original six inference rules, their IDs, authority, or policy version; the accepted input contract is narrowed for logically impossible assignments.

Exact binary coverage (not actual charts or a probability):
- 8,192 total assignments, 1,008 satisfy the stated axis implications.
- 7 strict strong-support assignments, 1 strict weak-support assignment, no overlap.
- Off-season rooted resource context: 6 admitted, zero strong and weak support.
- In-season rooted control context: 36 admitted, zero strong and weak support.
- In-season rooted burden context: 108 admitted, one strong and zero weak support.
- Off-season without substantial root: 96 admitted, zero strong and one weak support.

These are abstract model-coverage counts, not an independently labeled corpus, and not a guarantee that every admitted assignment corresponds to a realizable chart. No new sufficient conditions or numeric thresholds are inferred from the counts. The first two cases are explicit structural expressivity gaps, not labeled false negatives. Existing development labels are untouched.

Run `npm run audit:pattern-element-context-coverage` and
`node --test test/outcome-element-context-coverage.test.mjs`.
The four new tests compare the exact scenario counts with direct argument engine execution for all 8,192 assignments, replay witnesses, reject contradictory observations, and verify unresolved scope across elements. Four existing element-model fixture tests also passed in isolated JS execution. Native chart-level and V10 regression remain pending. Next: separate actual control/drain and depth/availability of roots from their proxies, collect passage-specific independently reviewed conditions before introducing a versioned new sufficient-condition rule.

## P3-B3a — Season-independent conditional strength alternatives

Sources: [子平真詮 論十干得時不旺失時不弱](https://donglishuzhai.net/chapter/3719.html) and [徐樂吾 評註](https://ncc.com.tw/fate/paleo/bg/bg_032.htm). The former describes deep-root strength outside the season and excessive control despite the season; the commentary additionally discusses excessive drain. These are contextual source readings, not validated general sufficiency rules.

The existing v2 element model and downstream consequence consumers are unchanged. Each element profile now has a separate `contextualStrength` v1 packet. Its four structural observations are exact visible occurrence coverage, substantial root basis, rooted controller basis, and rooted outgoing generation basis. The last two identify grounded or context-review nodes; they do not establish actual burden. The three unresolved semantic predicates are deep usable root support, uncompensated control beyond support, and uncompensated drain beyond replenishment.

The source-inspired alternative for conditional strength requires visible scope, a substantial root basis, deep usable root support, and explicit negative signs of both excessive-burden predicates. Conditional weakness has separate controller and output alternatives, each requiring its structural basis and corresponding excessive-burden predicate. No season-support premise, count, numerical threshold, automatic burden clearance, or inference from a missing root to weakness is used. The two directional conclusions have paired contrast rules only within this conditional model. Unknown semantic inputs are never promoted to original evidence. A separate optional exact Boolean completion review reports four-state counts and witnesses, not probabilities or physically admissible scenarios. All three predicates remain unresolved in native evidence; their independent hypothetical assignments are not a reviewed physical feasibility model.

The three semantic predicates still require operational definitions and independent source-based counterexamples. In particular, a burden exceeding support is a comparative semantic condition, not yet a computable independent measure of strength. No circular use of an existing strong/weak verdict as evidence for that condition is allowed. This version therefore improves representability and diagnostic proof obligations, not actual strength prediction. It is deliberately isolated from `modeledConsequenceReview`, pattern selection and useful-element authority. All actual strength fields remain unresolved.

Verification: `node --test test/outcome-contextual-strength.test.mjs test/pattern-outcome-argumentation.test.mjs`. Six new isolated tests and four existing element-model fixture tests (with projection assertions) executed against actual JavaScript modules. Native whole-repository regression remains pending. Next: implement provenance-bound operational root-preservation and replenishment evidence, and independently review each comparison premise; only then evaluate new rule authority.

## P3-B3b — Physical root preservation and conditional strength binding

Root preservation is projected from the existing physical hidden-stem ledger
and its exact incident clash/relief references, not a separate root calculator.
Each physical substantial slot has a single Boolean retention hypothesis,
reused across every same-element actor reference. The grade, pillar position,
distance, exact-stem/same-element relation and contact metadata are preserved
as separate attributes, not converted to weights. Residual roots are retained
in the inventory but excluded from this substantial-root scenario. This
inherits the existing substantial-root scope and is not a universal
classical claim that residual roots cannot contribute.

All substantial slot retention variables are unknown, including clean slots.
A clash or candidate relief is not damage or restoration. The retained-basis
queries (any substantial, none, principal, middle, month, exact-stem and
same-element actor references) use a common assignment. An empty literal
inventory is distinguished from hypothetical loss of observed roots.
Assignments are abstract counterfactuals, not physically validated
completions; same-branch contact correlation and actor-specific usable access
remain unmodeled. Shared slot use is not independent capacity.

The existing contextual strength evaluator accepts the exact substantial
slot ID inventory in the element review and adds one necessary-condition
constraint: deep usable direct-root support implies that at least one of
these slots is retained. The converse is not asserted. The independent
deep-root semantic predicate remains unknown, as do access and depth;
the scenario constraint adds no evidence to the baseline argument graph.
Both analyses use identical slot variable IDs within each element's domain,
but report separate denominators because the strength scenario also varies
semantic burden predicates. No chart-wide joint feasibility is claimed.

Tests: four new root-preservation tests, six existing contextual-strength
tests and four existing element-model fixture tests passed using isolated
actual JavaScript modules. Two substantial slots produce four retention
assignments, three with any surviving root. With three strength semantic
variables the combined domain has 32 assignments, 28 after excluding
deep-root support with no retained slot, and three strictly strong-support
assignments in the all-structural-bases fixture. These are counts, not
probabilities. Native full-chart and V10 regression remain unverified.

Next: construct provenance-bound replenishment alternatives from direct
roots and resource/peer supply witnesses, reuse retention identities, and
model access requirements without making a circular strength assumption.

## P3-B3c — Root-seeded replenishment network

One shared network is compiled from the existing grounded supply ledger.
The native adapter replays that ledger and binds exact physical donor
nodes, their substantial slot IDs, existing local generation paths, and
local same-element peer contacts. Visible stems can receive and relay
hypothetical supply; hidden branch constituents can seed their own
physical roots but cannot receive or relay from an incoming edge in this
version. Remote contacts are not included. The new relay candidates may
include one-hop observations that were not screened: they are explicitly
hypothetical operations, not promotions of the one-hop observation model.

For each root slot, the retention variable ID is identical to the
root-preservation variable. Each donor-slot access and each directed
operation has a separate unresolved Boolean hypothesis. The rule
root-retention AND donor-access establishes a modeled seed; an existing
seeded basis AND directed operation propagates a modeled basis. The
existing signed argumentation engine computes the least grounded closure.
Neither an independent capacity nor a physical flow rate is asserted.
All original observations and actual effect states are unchanged.

An independent structural explanation enumerates simple directed
seed-to-target paths and their exact required assumptions. Under the
monotone positive rules of this network, a target is supported under a
Boolean assignment iff at least one such path has all required assumptions
true. Cyclic walks can be shortened, and an unseeded cycle supplies no
proof. Multiple paths referencing one root remain distinct alternatives,
not multiple physical resources. Exact path enumeration is bounded to
24,000 search states and 4,096 alternatives across targets; budget failure
returns no truncated frontier. Exact common Boolean completion analysis
has the existing separate scenario work and variable budgets; its
unavailability does not invalidate an independently complete path list.
All-on structural reachability is not a reviewed feasible physical outcome.

The native and development composition both expose
`replenishmentReview`. It is not consumed as effective replenishment
or a strong/weak verdict. The domain has not yet been unified with the
contextual-strength burden scenarios, and the root-access and operation
predicates require independent operational/semantic validation. A finite
quantity, allocation and combined control/drain comparison are not
implemented. These are the next gate, not inferred from the number of
paths or retained roots.

Run `node --test test/outcome-replenishment-network.test.mjs test/outcome-replenishment-review.test.mjs`
and `npm run validate:pattern-outcome-native-p1`. Seven network tests
and two adapter fixture tests executed in isolated JavaScript using actual
modules, including all 128 assignments of the shared-root cyclic fixture.
Native full-chart replay cases were added and registered but have not yet
been executed. No independent classical gold cases or actual-effect
authority are introduced.

## P3-B3d — Shared support and burden proof comparison

The burden review extends the exact replenishment proof packet without
changing its existing judgments or rules. The native adapter binds all
local directed generation/control relations incident on visible stems
against the original occurrence inventory. A generation operation that
already occurs in the replenishment network uses that identical
observation variable. A control operation is also one physical action,
shared between its incoming-control and outgoing-control views. Outgoing
generation to hidden recipients is a burden candidate only, not a new
replenishment relay. Accidental operation ID aliases are rejected.

The modeled action requires a root-seeded source basis and an explicit
hypothetical operation. Each visible node has separate disjunctive
incoming-control, outgoing-generation, and outgoing-control burden
bases. They describe the presence of rooted action candidates under
assumptions, not actual injury, drain, expenditure, net force, or
excessive burden. In particular, an outgoing burden implies a source
basis by definition; this is not evidence of strong or weak force.

For the restricted positive Horn fragment (no recorded facts, negative
premises, undercuts, or non-complete rules), the new symbolic frontier
solver computes inclusion-minimal true-observation sets by monotone
closure with absorption. For two frontiers A and B, A implies B iff
every term of A contains some term of B. Empty antecedents are reported
separately rather than as comparative dominance. Counterexamples provide
the true observation IDs; all other observation variables are false.
Both/neither and the one-sided witnesses are model assignments, not
physically validated conditions. This avoids enumerating all Boolean
assignments but remains exponential in the worst case. Work is bounded
to 300,000 charged operations and 8,192 stored terms; no incomplete
frontier is reported. The general signed evaluator remains the owner
of the proof packet; the symbolic solver is limited to this fragment.

Native composition exposes burdenReview; no existing strength or
selection policy consumes it. Nine generic tests and three adapter
fixture tests (including two prior replenishment tests) executed against
actual JavaScript modules in isolation. The generic tests compare all
64 assignments of the fixture to the original proof engine and replay
all four comparison witness types. Native chart replay cases are
registered but not executed. The next boundary is to establish a
reviewed semantic comparison of actual replenishment, control, and
drain without interpreting logical implication as magnitude or
inventing independent quantitative capacity. No actual-strength
predicate is resolved here.

## P3-B3e — Shared conditional strength synthesis (actor projection)

The existing contextual-strength policy owns the three source-inspired
alternatives; the new synthesis consumes copies of those definitions.
It extends the exact burden proof packet, preserves all original
judgments and rule results, and projects the policy onto each visible
actor. Element-wide legacy and contextual-strength results are unchanged.
An actor's direct-root basis uses exactly the same root retention/access
premises as its replenishment seed; indirect supply is not direct root.
Incoming-control and outgoing-generation burden propositions come from
the shared rooted action packet, not the broad element-level axes.
Outgoing-control expenditure remains a diagnostic, not a new weakness
rule. This is a narrower actor-local experimental scope, not equivalent
to the older element-wide model.

For each actor, a true deep-root, excessive-control or excessive-drain
guard requires its corresponding modeled direct-root or rooted action
basis. These are necessary conditions within the modeled scope, not
sufficient tests of the semantic predicates. False guards are explicit
hypothetical assignments, not clearance inferred from missing evidence.
All actual semantic predicates remain unresolved in baseline evidence.
The three policy alternatives retain their paired signed contrasts.
No strength feedback is used to establish a root, supply or burden.

The symbolic guarded frontier algorithm applies only to terminal signed
rules, each having one positive Horn basis proposition and a conjunction
of explicit Boolean guard literals. After fixing the guard assignment,
true-guard requirements and requested support/opposition are positive
DNFs. For each four-valued state it searches products of minimal terms,
rejecting unions satisfying an excluded monotone DNF. A witness exists
iff such a union exists, since adding true variables cannot make an
excluded positive DNF false. No scenario counts or probabilities are
reported. Witnesses list true observation IDs; all others are false.
Every returned witness is replayed using the actual combined argument
engine. Individual actor states are exact within this bounded fragment;
they are not a chart-wide joint outcome or physical feasibility model.
Guard and work limits return no truncated state inventory; the positive
frontier has its own existing resource limits.

The native and development compositions expose strengthSynthesis.
It does not drive pattern, outcome or useful-element selection.
Six isolated tests passed against the actual JavaScript implementation,
including comparison against all 512 assignments of the three-actor
fixture's six base and three local guard variables. Native replay tests
are registered but not executed. A new checkout attempt failed DNS
resolution of github.com. Full native regression is still required.
The next gate is native verification and independent review of the
semantic predicates: deep usable support and excessive control/drain
remain uncomputed. Do not add a decision-authority bridge until that
gate is satisfied.

## P3-B5 — Retrospective reference coverage

The six strength reference fixture inventories are now shared between the
historical audited evaluator and the new coverage runner. The latter
requires exact normalized pillar/label/fixture identity and full coverage
of all 76 directional audit records; duplicate normalized charts, missing
records and stale labels are rejected. The primary cohort requires
explicit natal direction, ordinary scope and a checked source record.
There are 53 primary records (26 strong, 27 weak; 49 electronic-text,
4 scan-reviewed) and 23 secondary records. These are historical records,
not newly checked sources or independent gold.

The separate 81-case classical pattern fixture has 67 chapter-family-only
and 14 review-only cases, 13 source-selected-family annotations, zero
formation labels and zero assistant labels. It shares 34 exact chart
records with the strength audit cohort. A chapter-family label cannot
be converted into a formation, rescue, assistant or strength verdict.

At revision 287d32c the actual core source dependency subset (18 modules,
source-level import resolution, not native Node ESM) was run for all 76
audited charts without errors. Of the primary records, 16 of 26 strong
references lack season support and 5 of 27 weak references have season
support. All 26 strong references have at least one substantial literal
root; all 27 weak references have a local literal control or outgoing
generation relation. These are retrospective structural observations,
not evidence of effective roots or actual burden, nor universal necessary
conditions. No model parameters, historical labels or runtime decision
authority were changed.

The new runner separately reads the exact day-actor synthesis state
possibilities from the production root/supply/replenishment/burden/
strength chain. Strict supported is distinguished from conflicting,
unavailable and execution-invalid; matching possibility is not accuracy.
The basis-only mode reports all synthesis possibilities unevaluated.
The 53 primary synthesis possibilities remain unexecuted in this
environment. No empirical or independent accuracy claim is made.
Seven reference-contract tests passed against actual fixture data and
source modules in isolated JavaScript. The native runner and full
regression remain pending.

Run:
```sh
node --test test/outcome-strength-reference-coverage.test.mjs
npm run audit:pattern-strength-reference-coverage -- --basis-only
npm run audit:pattern-strength-reference-coverage
```
The first two are registered in focused/full validation; the more
expensive complete synthesis coverage audit is a separate command.
Next, examine expressivity gaps and both-direction possibilities without
choosing guard values to fit historical labels. Seek separately reviewed
passages for the exact semantic guard, not just a directional conclusion.

## P3-B6 — Full retrospective conditional expressivity and missing premises

At the baseline bb3ab7a and updated reporting revision 8d6970c, all
76 audited literal charts ran through the real core, root, supply,
replenishment, burden and strength synthesis modules in isolated
JavaScript. The updated run resolved 33 modules, checked the stage
envelopes and reported zero invalid or unavailable cases. Source
dependencies were loaded from the baseline and unchanged later
modules; a temporary unreferenced Git blob carried the pinned source
bundle across connector call limits, without adding a file to main.
This is source-level execution, not native Node ESM or a full V10 run.

| Cohort | Both directions | Strong only | Weak only | Neither | Reference direction expressible |
| --- | ---: | ---: | ---: | ---: | ---: |
| Primary (53) | 40 | 1 | 11 | 1 | 51 |
| All (76) | 59 | 1 | 15 | 1 | 73 |

Both directions means strict support of each in possibly different
admissible hypothetical assignments; it is not simultaneous conflict.
One-direction possibility is not an invariant actual verdict.

The coverage reader now partitions all evaluated rows by direction,
retains observed bases when a later stage fails, and traces the exact
burden group/action/frontier identities. Literal demand/exposure is
reported independently of modeled root-seeded operation. A missing
positive frontier is not actual nonoperation. Unavailable evaluation
is distinct from an empty frontier. No weakness inference is added.

Primary gaps:
- XU14 (庚戌 戊子 戊子 丙辰): two direct root seeds; rooted supply
  possible; one literal local incoming control with no rooted basis,
  zero local drain, three outgoing control candidates with rooted basis.
  Strong-only possibility. The textual commentary in
  https://luckclub.cn/bazi/002/036/ (chart and Xu annotation at current
  lines 67–71) describes prosperous month wealth and light Wu earth;
  it does not establish an exact excessive outgoing-control operation.
- XU26 (丁酉 己酉 戊子 壬子): no direct root seed or modeled rooted
  supply, one outgoing generation and three outgoing control candidates,
  none with a rooted action basis. Neither direction expressible.
  https://luckclub.cn/bazi/002/044/ (chart and Xu annotation at current
  lines 55–59) describes abundant wealth and weak body, and favorable
  resource support. It does not provide a quantitative drain rule.
- W12 is a secondary, formation-dependent reference, not an ordinary
  strength counterexample: no direct root, indirect support possible.
  Keep this distinct from the two primary gaps.

The electronic passages for XU14/XU26 were rechecked, not independently
adjudicated. Their wealth context suggests a missing wealth-demand
predicate, distinct from actual rooted expenditure. Do not relax the
root requirement for established operation merely to fit these labels;
do not infer weakness from lack of supply alone. A future experimental
policy must distinguish literal demand, recipient/source support,
effective depletion and aggregate capacity, and obtain separate
source-based counterexamples. The historical labels and current runtime
strength/pattern/selection policies remain unchanged.

Nine source coverage contract tests passed in isolated JS. Native
full-repository and V10 validation still require a clean checkout:
`node --test test/outcome-strength-reference-coverage.test.mjs` and
`npm run audit:pattern-strength-reference-coverage`.

## P3-B7a/b — Literal burden demand versus rooted operation

The default rooted-operation synthesis (v1) is unchanged. The opt-in
`policy: 'literal-demand'` synthesis (v2) distinguishes literal action
exposure from rooted hypothetical operation. The action inventory is
bound to the existing operation-rule identity, endpoints, premises and
per-actor group membership. Every literal action receives one fixed
positive observation; the three exposure groups derive their own
structural propositions. Existing replenishment and rooted-operation
judgments and rule results are preserved. No literal fact asserts
operation, drain magnitude, injury or effective expenditure.

The experimental v2 maps the control and drain excess guards to literal
exposure rather than rooted-operation bases, and adds a separate wealth
demand guard for outgoing control. The root-strength alternative also
requires the explicit negative wealth-demand guard. Missing root support
alone never implies weakness. All four guards remain unresolved in the
baseline. Excess guards require their corresponding exposure, but
exposure does not establish excess. Negative hypothetical guards are
not clearance evidence inferred from silence. These rules improve
representability only: the excess predicates are not independently
computable, and the wealth guard's sufficient-condition interpretation
is a research hypothesis rather than a validated classical rule.

Source scope: 子平真詮 論財 (https://www.donglishuzhai.net/chapter/3746.html),
論財取運 (https://www.donglishuzhai.net/chapter/3747.html), and the
commentary (https://ncc.com.tw/fate/paleo/bg/bg_034.htm) distinguish
wealth context and the body's ability to bear wealth. They do not
establish a general numerical expenditure rule or validate the new
guard. The v2 mapping is not used to select strength, pattern,
assistant, or useful element.

The generic positive frontier now permits fixed positive observation
facts, representing each with an empty assumption term. Canonical
packet validation still applies; negative facts and non-observation
facts are excluded. Witness replay retains these facts and varies only
unfixed observations. Partial scope still publishes no conditional
state inventory. This is a general extension of the monotone fragment,
not a special case for a particular chart.

Paired source-level run at da3caa38 (33 actual modules, pinned core
sources unchanged from bb3ab7a, both policies, all 76 audited charts):

| Cohort | Policy | Both | Strong only | Weak only | Neither | Reference direction expressible |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Primary (53) | v1 | 40 | 1 | 11 | 1 | 51 |
| Primary (53) | v2 | 41 | 0 | 12 | 0 | 53 |
| All (76) | v1 | 59 | 1 | 15 | 1 | 73 |
| All (76) | v2 | 60 | 0 | 16 | 0 | 75 |

No invalid or unavailable cases in either policy. XU14 moves from
strong-only to both; XU26 moves from neither to weak-only. The
secondary W12 direct-root gap remains. All other possibilities remain
unchanged. The 53/53 primary expressivity is not accuracy or prospective
validation, since the same retrospective cohort motivated the change.
The both-direction count increases, so the new policy does not solve
discrimination. No historical reference label was edited.

Six new tests (five demand-policy tests and one fixed-fact test) and
16 existing isolated tests passed, 22 total. They include exhaustive
local witness replay, absence-of-support non-inference, partial scope,
and forged inventory rejection. The full native Node/V10 regression
remains unexecuted. The CLI now provides paired comparison while
preserving baseline failures and reporting alternate failures separately:
`npm run audit:pattern-strength-reference-coverage -- --compare-demand`.
Next: investigate independent support sufficiency, particularly
indirect supply, then define and independently validate directional
guard predicates. Do not promote this exploratory policy simply because
it covers the development corpus.

## P3-B7c — Recipient-excluded indirect support

The opt-in `indirect-support` v3 policy extends v2 without changing the
runtime default or prior policy semantics. The independent-supply
projection reuses the canonical replenishment rules and exact slot
retention, actor access and directed operation variables. For each
recipient, it excludes that recipient's own root seeds and all outgoing
links from the recipient. A proof must therefore originate elsewhere
and cannot recycle the recipient's own support through a peer loop.
Shared physical root IDs are retained and annotated; source independence
is not independence of physical capacity or proof of available quantity.
The projection validates the canonical argument packet and rejects
unregistered supply rules or mismatched seed inventories.

The additional strong alternative requires the origin-excluded incoming
basis, an explicit indirect-support-sufficient guard and explicit
negative excessive-control, drain and wealth-demand guards. None of
these semantic guards is inferred from structural reachability.
The commentary on 得時不旺失時不弱
(https://changxianyi.com/guji/ziping/wz-20260914/chapter-007/)
describes rooted resource/peer support as a reason that an out-of-season
stem need not be weak. It does not prove that any rooted incoming path
is sufficient for strength, nor that not weak is equivalent to strong.
The new alternative is a research hypothesis, not a classical label
promotion or independently validated sufficient condition.

At revision 5dac69d, the source-level dependency runner executed all
76 charts with three policies (34 actual modules; 228 policy runs;
zero invalid or unavailable results):

| Cohort | Policy | Both | Strong only | Weak only | Neither | Reference direction expressible |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Primary (53) | v1 | 40 | 1 | 11 | 1 | 51 |
| Primary (53) | v2 | 41 | 0 | 12 | 0 | 53 |
| Primary (53) | v3 | 49 | 0 | 4 | 0 | 53 |
| All (76) | v1 | 59 | 1 | 15 | 1 | 73 |
| All (76) | v2 | 60 | 0 | 16 | 0 | 75 |
| All (76) | v3 | 72 | 0 | 4 | 0 | 76 |

Compared with v2, v3 adds strong possibility in 12 charts: eight primary
weak references, three secondary weak references, and the secondary
formation-dependent W12 strong reference. W12 is not an ordinary-strength
validation case. This is a clear loss of directional specificity, not an
improvement of accuracy. Do not promote v3. The next gate is independently
reviewed signed evidence for sufficiency and excess guards, including
negative contrasts, without using the reference verdict as guard evidence.
The three-policy audit is available via
`npm run audit:pattern-strength-reference-coverage -- --compare-supply`.
The existing comparison mode remains compatible; each alternate's
failure and change inventory is separate.

After strengthening the projection contract, six new tests and 22
existing isolated tests passed at 2f6e81e, including all 512 assignments
of a cyclic three-actor shared-root fixture against independent graph
reachability. The 228 cohort executions preceded the final contract
hardening; full native Node/V10 regression and independent source
adjudication remain unexecuted. No actual strength judgment or
selection authority was changed.

## P3-B7d-1 — Signed semantic guard review and sensitivity

The shared guard registry defines five exact natal visible-actor
predicates: deep usable direct root, excessive incoming control,
excessive outgoing generation drain, excessive wealth demand, and
sufficient indirect support. A structural proxy or final strength
verdict is not equivalent to any predicate. The existing claim-packet
and review protocol now accepts a strength-guard target with exact
actor and predicate. Determinate yes/no answers require a declared
explicit-condition basis, a source excerpt, locator and rationale.
Verdict-only, proxy, scope mismatch, silence and ambiguous evidence
cannot receive a determinate label. This validates declared evidence
types, not the factual truth or independence of reviewers' reading.
A dishonest or mistaken declaration cannot be detected by schema alone.

The retrospective queue contains 53 charts and 265 day-actor tasks
without copying the old direction labels or evidence excerpts. It is
derived from an already exposed development corpus, not a prospective
independent test. The original six fixture inventories are verified
before building the queue. The external-intake mode is available for
new source cases. The existing SHA-256 packet binding, distinct
reviewer declarations, ordinary natal scope and exact coverage
requirements are retained. Disagreement, silence, special or uncertain
scope and missing reviews supply no guard restriction. No independent
reviewers or completed source labels were fabricated.

The guarded frontier can fix an explicit subset of Boolean guards.
A research-only scenarioRestrictions argument carries agreed yes/no
as hypothetical restrictions, not facts. All original proof packets,
baseline judgments and rule results must be byte-equivalent in the
baseline and restricted replay. The restricted possibilities must be
a subset when both analyses finish. No feasible assignment is reported
as incompatible-constraints, never a weak or strong conclusion.
Every witness is replayed by the canonical argument evaluator and
checked against the restrictions. Actual strength remains unresolved.
The shared literal-chart replay accepts normalized pillars only, not
source directions or reviewed guard values; the audit and review CLI
reuse it. Existing v1 default and selection authority are unchanged.

At revision 7473c96, 38 actual source modules were connected in isolated
JavaScript. 53 baseline charts and 530 single-guard signed restrictions
(ten per chart) were evaluated. No execution-invalid or budget-unavailable
results; 39 restrictions were structurally incompatible with the modeled
necessary conditions. Baseline v3 has 49 both-direction cases. Counts of
those 49 narrowed to exactly one possible direction by a single sign:

| Guard | Explicit false | Explicit true | Incompatible true (all 53) |
| --- | ---: | ---: | ---: |
| deep-root-available | 0 | 0 | 12 |
| control-exceeds-support | 1 | 42 | 8 |
| drain-exceeds-support | 2 | 43 | 6 |
| wealth-demand-exceeds-support | 0 | 41 | 9 |
| indirect-support-sufficient | 8 | 0 | 4 |

These are conditional sensitivity counts, not source annotations,
accuracy, causal importance or proof of a classical rule. A positive
excess guard directly satisfies a weak terminal rule and blocks the
strong alternatives by construction; its high sensitivity is partly
tautological. The review priority is to establish the independently
justified meaning of the predicate, including counterexamples, rather
than set it to match the final direction. One-sign analysis does not
establish joint chart-wide feasibility.

Desk recheck of the XU14 and XU26 passages:
https://luckclub.cn/bazi/002/036/ and https://luckclub.cn/bazi/002/044/
describe prosperous/abundant wealth and light/weak body with resource
support, but do not separately establish the exact quantitative or
comparative wealth-excess guard. Treat this as a limitation of source
mapping, not a reviewed yes/no label. The discussion of root and peer
support at https://www.donglishuzhai.net/chapter/3719.html and
https://luckclub.cn/bazi/002/008/ also does not equate a literal rooted
path with adequate indirect support. These electronic passages were
consulted by the same developer/assistant who saw the historical
labels; they are not independent review batches.

Seven new and 34 existing isolated tests passed (41 total) at
beacca2c, including the actual retrospective queue, signed agreement,
replay invariance, incompatible assumptions and label-free sensitivity.
Native Node/V10 regression is still pending. Source-level execution
used a temporary unreferenced Git blob for the pinned core dependency
bundle; no generated source bundle was added to main.

Usage (external review JSON files must be outside the checkout):
```sh
npm run review:pattern-strength-guards -- packet retrospective
npm run review:pattern-strength-guards -- template retrospective
npm run review:pattern-strength-guards -- sensitivity retrospective
npm run review:pattern-strength-guards -- summarize retrospective ../review-A.json ../review-B.json
npm run review:pattern-strength-guards -- replay retrospective ../review-A.json ../review-B.json
```
Use separately completed review templates and keep prior labels and
model outputs out of reviewer material. The next gate is real source
condition adjudication and prospective contrasts, not a new alternative
that expands expressivity. Even determinate agreement is pending
external verification, and it cannot promote a runtime decision.

## P3-B7d-2 — Source burden contexts and exact action coverage

The electronic passages in Zi Ping Zhen Quan and its commentary
(https://ncc.com.tw/fate/paleo/bg/bg_033.htm,
https://dao.time.actor/ziping-zhenquan-pingzhu/juan-3,
https://www.donglishuzhai.net/chapter/3748.html,
https://ncc.com.tw/fate/paleo/bg/bg_034.htm) were desk-reviewed.
Five structural source contexts are mapped to reusable role templates:
control-resource mediation, output-resource restraint, wealth-resource
interference, peer protection of resource, and output-wealth chain.
They preserve the source's unresolved comparative and pattern-specific
premises. A prior strong/weak premise cannot independently establish
the strength guard. Resource damage or rescue is not equivalent to net
wealth burden. Output-to-wealth may be favorable in its source context.
No reviewed guard polarity or sufficient strength rule is created.

The research audit checks the actual local, visible-incident action
inventory against element and position relations and replays the
canonical burden proof. Each matched distinct-role binding references
the existing action propositions and operation variables; a conjunction
is evaluated using the positive proof frontier. Its witness is replayed
by the canonical argument engine. Literal exposure remains visible when
the rooted conjunction is not supported. A missing match is not a
refutation, and an unavailable frontier is not an empty one. These
templates intentionally use the local graph, not complete classical
formation, hidden-to-hidden interactions, or effective action semantics.
Partial scope produces no context judgments. No runtime authority or
existing strength policy changes.

Source-level run at 6b786ce (39 modules, pinned unchanged upstream
sources) covered 53 primary charts, with no invalid or unavailable
results:

| Context | Literal charts | Joint rooted charts | Literal bindings | Joint rooted bindings |
| --- | ---: | ---: | ---: | ---: |
| Control-resource mediation | 22 | 17 | 34 | 22 |
| Output-resource restraint | 20 | 19 | 32 | 31 |
| Wealth-resource interference | 19 | 15 | 31 | 23 |
| Peer protects resource | 10 | 7 | 17 | 11 |
| Output-wealth chain | 26 | 23 | 43 | 34 |

47 charts have at least one local literal context, 42 at least one
joint rooted context; 157 literal bindings and 121 rooted bindings.
Counts overlap across templates. XU14 has one literal mediation
binding without rooted basis, two wealth-resource and one peer
protection rooted bindings; the latter can coexist as rooted candidates
but do not establish resource damage or rescue. XU26 has no match in
the current local visible-incident scope. This demonstrates a scope
gap, not absence of classical burden. The templates are development
projections, not claims of exhaustive or uniquely correct translation.

Four isolated tests passed at 2c36c62 after final scope/action-contract
hardening. The cohort run preceded that hardening. Native Node/V10
regression and independent source adjudication remain pending.
Run `node --test test/outcome-strength-source-conditions.test.mjs` and
`npm run audit:pattern-strength-source-conditions`.
The next gate is the relation between independently established
support loss, relief, and effective residual burden; a local pattern
or an all-on rooted witness alone cannot supply that relation.

## P3-B7d-3 — Exact pressure and local full-relief alternatives

The research-only residual-pressure compiler extends the canonical
positive burden proof packet, preserving its original judgments and
rule results. A pressure requires its exact root-seeded basis and an
explicit pressure-effective hypothesis. A full-relief route requires
that pressure, the exact route action bases and an explicit hypothesis
of complete relief of that particular pressure. Alternatives are
disjunctive. A local uncovered witness is a Boolean completion with
pressure supported and no modeled full-relief route supported. It is
not evidence that relief actually fails, that external relief is
absent, or that a partially relieved pressure remains excessive.
Each inactive, uncovered and fully-relieved witness is replayed in
the original signed proof evaluator. No magnitude or global capacity
is computed; alternative routes cannot cancel another pressure, and
multiple partial relief routes are not added as quantities.

The source adapter covers local incoming control, outgoing generation,
outgoing wealth-demand relations and wealth-resource interference with
an exact protected resource-to-day supply edge. The first two use
mediation/restraint templates. Peer protection only attaches to the
same wealth-to-resource action and the same protected supply edge.
It does not relieve the direct wealth-demand relation. The rooted
pressure screen is narrower than the literal exposure policy in v2/v3;
a missing rooted basis never refutes literal exposure or proves no
actual burden. Resource interference needs a potential supply basis,
not an already proven effective supply. The existing source template
scope and unresolved premises are unchanged.

At e50ef78 the source-level replay connected 40 modules and executed
all 53 primary charts without invalid or unavailable results:

| Pressure type | Candidates | With local relief candidates | Rooted pressure possible | Local full relief possible |
| --- | ---: | ---: | ---: | ---: |
| Incoming control | 90 | 29 | 73 | 20 |
| Outgoing generation | 106 | 30 | 97 | 29 |
| Wealth demand | 92 | 0 | 85 | 0 |
| Resource interference | 31 | 13 | 23 | 8 |
| Total | 319 | 72 | 278 | 57 |

31 charts have at least one local full-relief possibility. All 278
possible pressure hypotheses also have a local uncovered witness,
because effective relief is a separate unreviewed guard. This is
a property of the current conditional model, not an empirical finding
of residual burden. XU14 has two distinct resource-interference
candidates, only one with a local peer protection route; neither
this route nor its hypothesized success establishes total wealth
relief. XU26 has four literal pressure candidates but none with
rooted pressure possibility. Its actual burden remains unresolved.

Five isolated tests passed at e50ef78, including exhaustive replay
of 128 assignments in the two-pressure/two-route synthetic fixture.
Native Node ESM/full V10 and independent source review are pending.
The new tests are registered in the validation manifest.
Run `node --test test/outcome-residual-pressure.test.mjs` and
`npm run audit:pattern-residual-pressure`. No production selection
or strength rules changed. Next investigate joint constraints across
pressures and remaining supply routes, explicit partial relief and
nonlocal/hidden scope before comparing actual residual burden.

## P3-B7d-4 — Joint residual constraints and shared proof dependencies

The generic positive-constraint solver accepts a canonical positive
proof packet and queries containing required/excluded structural
propositions and explicit Boolean observation restrictions. Fixed
positive facts are preserved. It searches unions of minimal proof
terms; a forbidden true term can never become false by extending a
union. Any satisfying assignment contains a term for each required
proposition, so a union of such terms plus fixed true variables is
a sufficient witness. Every feasible witness is replayed against the
canonical signed evaluator. Contradictory requirements yield no
witness; unavailable is distinct from infeasible. Limits are 256
queries and 300,000 charged search steps, in addition to the existing
frontier limits. No truncated result is accepted. This solver is
restricted to the validated monotone positive fragment, not an
arbitrary signed-rule or physical feasibility solver.

The research audit preserves the residual compiler and groups exact
pressures by whole local inventory, kind, and shared protected supply
edge. It tests joint activity, uncovered pressure and local full
relief; exact protected-supply groups also test different pressure
outcomes simultaneously. Empty viable/relievable subsets do not
produce vacuous claims. Shared root retention, actor access and
operation variables are indexed from the minimal proof terms. A
variable in every term is necessary within the model; a variable
occurring only in some terms can be removed while retaining another
proof. Where both losses and survivors occur, one explicit false
restriction and a joint constraint witness reproduce the entire
partition. Shared proof variables are not independent resource
units, and no exclusivity or capacity constraint is invented.

Final computational revision f79e5a2: 42 actual modules connected
using isolated source-level JavaScript, with unchanged pinned upstream
dependencies. All 53 primary charts were evaluated, 319 pressure rows,
215 groups, 1,045 joint queries (815 feasible, 230 infeasible),
zero invalid/unavailable charts. There are 656 chart-variable shared
dependency records; 179 are necessary for at least one participating
outcome, 44 are necessary across at least two distinct pressure IDs,
and 159 mixed loss/survival partitions have joint removal witnesses.
Seven exact protected supply groups occur in seven charts. The
initial group-only run showed 52/52 charts with viable pressures can
activate all viable pressures together and leave them uncovered;
only 3/52 can hypothesize full relief for all viable pressures.
These coexistence results are largely consequences of monotonic
positive premises and independent unreviewed effectiveness guards,
not evidence of actual simultaneous action or finite resource
allocation. The 230 infeasible queries likewise express model
constraints, not verified classical impossibility.

XU14 has two distinct interference pressures on the same supply edge:
one may be hypothesized fully relieved while the other remains
uncovered in the same assignment. XU26 retains four literal
candidates with no rooted pressure proof; no actual burden is
refuted. No existing strength policy, historical label, or selection
authority changed. Four new and five prior isolated tests passed at
f79e5a2, including 81 queries compared with all eight assignments
of a three-variable fixture, explicit removal replay, fixed facts,
and partial/rootless cases. Full native Node ESM and V10 regression
remain unexecuted. Run:
`node --test test/outcome-joint-residual-pressure.test.mjs test/outcome-residual-pressure.test.mjs`
and `npm run audit:pattern-joint-residual-pressure`.
Next prioritize exact route-specific support preservation/partial
relief semantics and scope limitations; do not read joint logical
possibility as capacity, magnitude, or a validated strength verdict.

## P3-B7d-5 — Exact supply preservation under explicit route interruption

The generic research query replays a canonical replenishment packet
with a specified set of links removed. It validates the exact original
network prefix and rejects alternate rules deriving its basis. Only
derived propositions are cloned: retention, access, and operation
observations are identical in both networks. The original network
and the cut projection are evaluated in the same assignment. Original
judgments and rule results are preserved. The shared positive
constraint solver distinguishes survival, loss, incoming alternatives,
direct-root-only survival, and recipient-excluded incoming origin.
It checks that removal cannot create a new basis, and that independent
incoming origin cannot exist without an incoming basis. All feasible
witnesses are replayed. The existing independent supply compiler
prevents counting the recipient's own root recycled through a loop
as an independent source; common physical roots still do not imply
independent capacity.

The domain adapter uses the exact generation link already shared by
the protected resource-to-day action in the burden packet. Each
scenario requires selected interference pressures and excludes their
local full-relief propositions. Complete interruption of the selected
links is an additional explicit counterfactual assumption, NOT a
consequence of uncovered pressure. Other links are not assumed
actually safe. Scenarios cover individual pressures, all pressures
on one shared protected link, and all exposed links when multiple
links exist. This is not exhaustive subset enumeration; no amount
of partial mitigation, actual supply loss, or actual strength is
computed. Direct roots and indirect alternatives may coexist.
A rootless or incompatible condition must not be counted as loss.
Partial scope abstains; scenario/solver limits return unavailable.

At e736eef (42 actual modules in isolated source-level JavaScript;
unchanged pinned upstream sources, updated replay adapter), all 53
primary charts executed without invalid or unavailable results.
19 charts had exposed resource-supply links (24 link records,
31 interference pressure records). 42 cut scenarios and 378 joint
queries were evaluated. 30 scenarios admit the selected uncovered
pressure condition; all 30 permit loss of the modeled supply basis,
26 also permit surviving basis and a recipient-excluded incoming
origin, and 21 permit direct-root-only survival. These possibilities
can occur in different assignments. Four feasible scenarios permit
loss but no surviving basis within the modeled cut. 13 charts have
at least one independent-origin survival scenario. The remaining
12 scenarios have incompatible pressure conditions, not verified
absence of actual harm. XU14 has three conditional cuts of one
protected link, all admitting both survival and loss; XU26 has no
mapped interference link and remains out of scope. None of these
results determines actual replenishment quantity or partial relief.

Six new and nine existing isolated tests passed, including exhaustive
graph closure for the 128 assignments of the cyclic three-node
fixture, rejection of changed link identity, complete and partial
scope, and recipient-root recycling. Full native Node ESM/V10
regression and independent classical validation remain pending.
No production strength or selection policy changed.
Run:
`node --test test/outcome-supply-preservation.test.mjs`
and `npm run audit:pattern-supply-preservation`.
Next investigate nonlocal and hidden interaction coverage without
automatically treating all literal contacts as effective, and obtain
independent signed evidence about actual route preservation and loss.

## P3-B7d-6a — Literal interaction scope and baseline-seeded extension

The research-only interaction scope audit binds the existing stem-force
occurrence inventory to the canonical replenishment graph nodes. It
independently enumerates directed generation/control relations between
distinct physical slots and verifies every incoming/outgoing constituent
view. Relations are partitioned by distance (at most one pillar or
nonlocal) and whether at least one participant is visible. Different
hidden elements in the same physical branch are recorded as co-resident,
not separate cross-slot actions. Co-residence does not refute any actual
within-branch interaction. This is an inventory of generation/control,
not an exhaustive classical interaction model or a new peer-relay model.

The complete local-visible action set and local generation/peer relay
inventory must match exactly. The local burden proof is recompiled and
compared in full; even a recompiled but widened relay graph is rejected.
Extra actions get distinct operation variables and structural hypotheses
using the existing local source replenishment basis. They cannot derive
local supply or seed new relay paths. For each extra action the minimum
local source term plus its operation observation is a possible witness;
the original local action identity and witnesses are retained. A joint
positive completion is replayed against the extended canonical argument
packet, and must realize precisely the possible rows. This is
baseline-seeded expressivity, not effective operation, capacity or a
proof that all actions physically coexist. The absent source basis
does not refute an actual action. Partial scope retains observed
relations but publishes no possibility claims.

Final computational revision 4006abb: 32 actual modules connected in
isolated JavaScript, using pinned unchanged upstream sources and the
updated literal-chart replay adapter. Six isolated tests passed, and
all 76 historical charts executed after the local relay hardening.
No invalid or unavailable cases.

| Scope | Primary literal | Primary baseline-seeded possible | All literal | All baseline-seeded possible |
| --- | ---: | ---: | ---: | ---: |
| Local visible-incident | 1093 | 946 | 1589 | 1386 |
| Local hidden-hidden | 670 | 501 | 980 | 723 |
| Nonlocal visible-incident | 747 | 645 | 1086 | 940 |
| Nonlocal hidden-hidden | 724 | 547 | 1046 | 789 |
| Total | 3234 | 2639 | 4701 | 3838 |

Primary: 53 charts, 419 co-resident pairs, 376 local and 150 nonlocal
day-stem incident actions. All: 76 charts, 615 co-resident pairs,
544 local and 214 nonlocal day-stem incident actions. Every chart
has at least one nonlocal day-stem incident relation. These are
deduplicated chart-edge records, not independent empirical cases.
XU14 has three nonlocal day-stem relations with local-source basis
possibilities. XU26 has two nonlocal day-stem relations, neither with
such a basis; other hidden/nonlocal relations can be seeded. This does
not resolve the actual supply or weakness gap, nor imply that all
hidden relations should become relays.

The audit verifies the existing six source fixture inventories in
the native CLI, reports primary and all cohorts separately and
fails on incomplete execution. No default/runtime strength rule,
classical label or selection authority was changed. Native Node ESM,
the CLI and full V10 regression remain unexecuted in this environment.
Run:
`node --test test/outcome-interaction-scope.test.mjs`
and `npm run audit:pattern-interaction-scope`.

Next: compare explicit nonlocal and hidden access/relay hypotheses
against the frozen local baseline, using the same action/slot
identities. Do not introduce effective hidden-to-hidden supply or
within-branch allocation merely because a literal relation exists.

## P3-B7d-6b — Gated extended supply and access-family ablation

Research-only projection of the validated literal interaction inventory.
The local burden proof and its observations remain unchanged. Extra
generation relays reuse the exact action operation identity; extra peer
relays get a distinct directed operation identity. Nonlocal relays
require a per-relation nonlocal access hypothesis; receiving into a
hidden constituent requires a shared recipient access hypothesis.
A nonlocal hidden-reception relay requires both. These are unreviewed
necessary gates of this experimental projection, not classical rules
or sufficient real-world evidence. Hidden reception plus a subsequent
operation is allowed to relay; independent physical throughput and
separate provenance-specific transit restrictions are not modeled.
No new root seeds, within-branch relays or capacity units are added.
The peer inventory is cross-checked against every constituent view.

The extended proof derives separate reachability propositions using
the original root-retention, actor-root access and local operation
variables. For the day actor it also projects a recipient-excluded
network without the recipient's own seeds or outgoing relays.
A bounded simple-path search gives exact possibility and
extension-only witnesses in this restricted positive graph model.
The latter is exact because each directed link has a distinct
operation variable and each actor-root seed a distinct access
variable; gates cannot alias either. With only one simple seeded
path's observations true, a path using an added link cannot be
bypassed in the local graph. Cycles without a seed do not produce
supply. The canonical signed evaluator checks witnesses and all-on
reachability, including four access-family ablations in the same
packet. A disabled family explicitly falsifies its access gates.
Budget exhaustion abstains. No effective supply or strength follows.

Final computational revision 58de80d (33 modules connected in isolated
source-level JavaScript using pinned unchanged upstream dependencies):
all 76 charts, including 53 primary, completed. There are 943 local
links and 3873 additional candidates (2075 nonlocal, 3294 hidden
recipients, overlapping). For primary charts: 657 local, 2678 added
(1438 nonlocal, 2262 hidden recipients). Targets comprise four visible
actors and one additional recipient-excluded day query per chart,
not independent cases.

| Access policy | All 380 reachable | Primary 265 reachable | All extension-only witness |
| --- | ---: | ---: | ---: |
| Local only | 366 | 251 | 0 |
| Nonlocal only (visible recipients) | 370 | 255 | 334 |
| Hidden local only | 369 | 254 | 340 |
| Both | 374 | 259 | 372 |

Eight query rows gain reachability (six distinct chart/actor pairs in
three charts): four under nonlocal-only, three under hidden-local-only,
one requiring both. R04 gains the hour actor; W18 gains year (both),
day and hour (hidden-local), and day recipient-excluded; XU27 gains
hour and day plus day recipient-excluded (nonlocal). This is not eight
independent charts. An extension-only witness can occur even where
baseline reachability is already possible under a different assignment.
XU26 still has no day supply basis even with both access families.
This structural result is not a refutation of actual supply or a
validation of actual weakness.

Five new and six prior isolated tests passed; exhaustive comparison
on the 8-observation fixture covered all 256 assignments for each
of six target/scope queries. Native Node ESM/CLI and full V10
regression remain pending. The default production policy and reference
labels are unchanged. Run:
`node --test test/outcome-extended-supply.test.mjs test/outcome-interaction-scope.test.mjs`
and `npm run audit:pattern-extended-supply`.
Next compare semantic evidence for access restrictions and investigate
the root/availability assumptions behind remaining gaps before
using extended supply in actual strength adjudication.

## P3-B7d-7a — Root seed eligibility and contextual access sensitivity

The source discussion in Zi Ping Zhen Quan, chapter on seasonal
strength (https://donglishuzhai.net/chapter/3719.html), distinguishes
heavier roots from lighter tomb/residual roots and rejects the blanket
need to clash open a tomb root. Xu's commentary
(https://www.ncc.com.tw/fate/paleo/bg/bg_032.htm) further discusses
root context and distinctions in life stage. Neither establishes
that the application's principal/middle/residual constituent roles
are equivalent to classical root depth, that every residual
constituent is accessible, or that a root survives every clash.
The experimental extension treats a literal residual constituent as
an optional seed, not an actual usable root or a strong verdict.

The native research adapter replays the original root context and
validates the local interaction/network proof. A visible actor can
reference only its literal same-element constituents; a hidden
donor can reference only its own constituents. Each physical slot
has one retention identity; each actor-slot pair has its own access
identity. The baseline substantial seed inventory must match exactly.
The expanded network is projected into separate derived propositions
with shared observations and unchanged local generation/peer links.
All existing baseline proof judgments and rule results are preserved.
Role, actor-relative life stage, position, distance, exact/same-element
match, clash and formation identifiers remain separate observations.

Ten research policies explicitly disable access to excluded seeds:
substantial baseline, all constituents, residual only, principal only,
middle only, uncontested only, month only, nonmonth only, exact or own
constituent only, and near only (distance at most one). Except for the
substantial baseline, these filters are applied to the full literal
inventory, including residuals where the filter permits them. These
are access sensitivity experiments, not actual evidence of loss or
retention; disabling access is not physical erasure of a slot.
Month position is not resolved monthly command. All-on reachability
is checked by independent graph closure and canonical signed proof
replay. Each residual-only alternative uses one explicit residual
seed and a simple path with other seed-access variables false; its
witness is replayed in both projections and must reach only the
expanded one. Rootless cycles do not create support.

At ca4a74d (33 source modules connected in isolated JavaScript;
unchanged pinned dependencies and updated replay adapter), all 76
historical charts, including 53 primary, executed without invalid
or unavailable results. Four focused isolated tests passed.

| Policy | All 304 reachable | All direct | Primary 212 reachable | Primary direct |
| --- | ---: | ---: | ---: | ---: |
| Substantial baseline | 294 | 249 | 202 | 175 |
| All constituents | 298 | 274 | 206 | 193 |
| Residual only | 245 | 165 | 173 | 117 |
| Principal only | 258 | 176 | 181 | 133 |
| Middle only | 230 | 153 | 157 | 102 |
| Uncontested only | 253 | 206 | 175 | 145 |
| Month only | 196 | 129 | 130 | 88 |
| Nonmonth only | 291 | 260 | 202 | 182 |
| Exact or own constituent only | 296 | 222 | 205 | 156 |
| Near only | 294 | 244 | 204 | 172 |

829 physical slot records, 1489 actor-slot seed candidates including
528 residual candidates; primary 577, 1047, 374 respectively. These
are chart-specific inventory records, not independent resources or
empirical samples. 245 targets have an expanded-only residual seed
witness under some assignment, and four previously unreachable
targets gain reachability: W18 day/hour, XU21 day, XU27 hour. The
uncontested filter differs from the all-constituent policy by 45
reachable targets; this does not imply actual root loss from
contacts. XU14 day is reachable with substantial roots and with
residual seeds, but not under the uncontested-only or month-only
restriction. XU26 day remains unreachable under every local seed
policy. The nonlocal/hidden relay extension is not combined with the
residual seed extension in this experiment.

Run:
`node --test test/outcome-root-seed-sensitivity.test.mjs`
and `npm run audit:pattern-root-seed-sensitivity`.
Native ESM/CLI and full V10 regression remain unexecuted. No production
selection rule, historical reference label or actual root/strength
judgment changed. The source interpretation is a desk review, not
independent empirical validation. Next prioritize independent signed
slot-retention and actor-access evidence, distinguishing clash,
competing formation, and exact relief, before using these hypotheses
as actual strength premises. Compare combined seed/relay policies only
as a controlled experiment rather than enlarging the default model.

## P3-B7d-7b — Exact signed root evidence and supply replay

Source review: Di Tian Sui, Earthly Branches
(https://www.shidianguji.com/book/7654517725435265075/chapter/1m5zgml2zaqkp)
describes directional clash outcomes in terms of relative strength.
Zi Ping Zhen Quan, clash and harmony resolution
(https://www.mastervt.com/books/zipingzhenquanpingzhu/juan-1/chapter-009)
also describes cases where resolving one contact produces another.
Neither establishes automatic erasure of every constituent or
restoration of every root from a candidate harmony. Retention is a
net root-seed eligibility proposition, not physical disappearance.

The existing blinded source review protocol now accepts six exact
root-condition predicates: net slot retention, actor/slot access
conditional on retention, slot-specific clash impairment,
slot-specific formation impairment, exact clash/formation relief,
and preservation of the exact original slot by that relief.
The canonical chart adapter regenerates all tasks from validated
root/formation and seed inventories, never from supplied strength
labels, predictions or fabricated contacts. The generic target
schema alone validates shape, not chart membership. The root CLI
reconstructs the canonical packet from the selected intake and
binds reviews with a SHA-256 digest. Two distinct declared reviewers
must agree in ordinary natal scope and cite explicit condition
evidence for a determinate sign. Silence, a final verdict, structural
proxy and wrong scope remain undetermined. Schema validation is
not independent authentication of a source or reviewer.

Only agreed net retention and conditional access claims constrain
root seed observation assignments. Local impairment, relief and
preservation-by-relief are recorded separately; none is automatically
a net restriction. Other concurrent contacts, the extent of damage,
and the distinction between relief and retention remain unresolved.
No new temporal restoration rule is inferred. The same physical
slot retention variable applies to every actor using that slot.
Actor access variables are distinct and access is conditional, so
positive access alone is not proof of retention.

The canonical local replenishment networks with substantial seeds
and with all literal seeds are replayed separately, with their
original rules unchanged. The exact minimum and maximum Boolean
completions of the remaining observations give necessary and possible
reachability in a positive monotone graph. Independent graph closure
checks every computed endpoint. Reviewed signs are hypothetical
restrictions, never promoted to production evidence. The restricted
possible states cannot expand, and necessary states cannot shrink.
No quantitative support, actual strength or new transformed roots
are computed. Formation-dependent or uncertain review scope does not
authorize the ordinary replay. Unreviewed operation variables remain
unknown even when retention/access have determinate agreement.

Desk source contrasts, not completed review batches:
- XU10 (https://luckclub.cn/bazi/002/042/, lines 82–86):
  Bing in the year may root in the clashed month Wu branch according
  to Xu's commentary. In the application's hidden-stem convention
  this is the residual Bing constituent. Candidate target
  root-access(year:stem, hidden:month:병), not a determinate signed
  label or proof of all Wu constituents' net preservation. This is
  a direct counterexample to treating every clash as unconditional
  loss of usable root or residual roles as unconditionally excluded.
- W19 (https://luckclub.cn/bazi/003/009/, lines 348–350):
  the text emphasizes Jia's two Yin lu roots despite autumn.
  Candidate access targets day:stem to hidden:year:갑 and
  hidden:day:갑. It does not separately determine all other actor
  accesses or root retention under arbitrary contacts.
- XU23 (https://luckclub.cn/bazi/002/040/, lines 123–126):
  Jia seated on Yin and another Yin in the hour are cited in the
  natal assessment; useful contrast for the exact day and hour
  principal-root access tasks. Do not use the final strength verdict
  itself as a source label.
- XU14 (https://luckclub.cn/bazi/002/036/, lines 67–71) and XU26
  (https://luckclub.cn/bazi/002/044/, lines 55–59) discuss resource
  support and wealth/body context, not exact retained hidden slots.
  The XU26 resource support passage remains an important gap for
  any model requiring rooted supply. Do not force a root claim to
  reproduce the final verdict. None of these desk readings qualifies
  as a blinded independent review.

At 4265d39, 37 actual modules were connected in isolated JavaScript
with pinned unchanged upstream dependencies and the current review
contract. The 53 primary charts generated 1887 unique source tasks:
577 net slot retention, 1047 actor-slot access, 119 clash impairment,
97 formation impairment, seven clash relief, 40 slot preservation
by relief. The entire 76-chart inventory was also replayed with
empty restrictions; all matched the unrestricted before/after states
in both policies. At 8ba47b3, six new, four existing seed-sensitivity
and six existing generic claim-review tests passed (16 total),
including exhaustive 128 assignments of the seven-observation
synthetic graph and both signs of five root restrictions, shared
physical retention, actor-specific access, contact-only non-inference,
chart selection identity, and invalid proxy review rejection.
The final role-identity check was tested after the cohort run.

Use chart-scoped review batches to avoid requiring all 1887 responses
at once. Selectors are exact composite IDs or unambiguous short IDs;
ambiguous/missing/duplicate selectors fail, and source order is
preserved. The same selection must be used for packet, template and
replay. Review files must remain outside the checkout:
```sh
npm run review:pattern-root-evidence -- inventory retrospective
npm run review:pattern-root-evidence -- packet retrospective --chart XU10
npm run review:pattern-root-evidence -- template retrospective --chart XU10
npm run review:pattern-root-evidence -- replay retrospective ../root-A.json ../root-B.json --chart XU10
```
External intake remains supported. The retrospective queue is exposed
development material, not independent gold. Actual completed blinded
reviews: zero. Native Node ESM/CLI and full V10 regression are still
pending. No existing production selection policy or reference label
changed. Before extending the strength model again, collect actual
source condition annotations and explicitly validate slot-level
claims. The binary rooted reachability model cannot establish
quantitative sufficiency or classical predictive validity.
