# Ordinary-chart balance useful-element candidates v1

## Scope and textual motivation

徐樂吾 子平真詮評注, 論用神 (https://dao.time.actor/ziping-zhenquan-pingzhu/juan-2) discusses扶抑 of the day master as one among distinct useful-element approaches. 滴天髓 (https://zh.wikisource.org/zh-hans/滴天髓) warns against a one-sided treatment of body/use and excess/deficiency. 滴天髓闡微, 疾病 (https://guoxue3000.com/tw/books/378/chapters/63) distinguishes draining, controlling and supporting according to conditions. These electronic witnesses justify the broad ordinary balance hypothesis, not the algorithm's empirical correctness or a unique useful element. No special pattern detection, 月令取用, climate adjustment, 通關, or final 喜忌 determination in this policy.

## API

`analyzeBalanceUsefulElement({saju,birthBasis,policy:'balance-useful-element-v1'})`.

The fixed strength-multiaxis-v4 baseline is computed internally, not supplied by caller. Provisional or missing hour: unavailable, no candidates. On complete verified charts, directional hypothesis yields one conditional branch; unresolved strength yields both strong and weak branches, without merging them. The existing strength status, grounds and conflicts are retained. Strong branch: output/drain, wealth/expend, officer/control; weak: resource/generate, peer/assist. Order is a canonical enumeration, not priority. OppositeTendency is a directional tendency only, never a final unfavorable judgment.

Five elemental observations describe literal visible non-day stems, hidden stems/root role, substantial root positions, clash exposure and month principal identity. Presence categories distinguish visible-rooted, visible-no-substantial-root, hidden-only and absent. The day stem itself is excluded as a second peer; a missing element is retained as a hypothetical supplement, not an available natal agent or recommendation. Root existence and clash exposure do not confirm actual force.

Each candidate has explicit directed review relations, e.g. wealth controls resource; officer generates resource; output controls officer; resource controls output. They are fixed five-element relationships with separate candidate/counterpart presence flags. No local path, actual mediation, cancellation, or ranking inferred. All effective fields are null. Resource and officer effects can be competing; no universal preference for a candidate without context. Final usefulElement/favorableElements/unfavorableElements are null and confirmed false, even when strength is directional. Special pattern assessment remains not-assessed. No score, new thresholds, or changes to strength policies.

## Executed checks

Actual committed evidence.js, element-structure.js and dependencies (12 source modules) executed in V8 on both hypotheses for 100 historical benchmark charts and 11 supplemental electronic controls. 111 charts, 222 conditional branches, 555 candidates and 1,665 relation records; all five day-master elements covered. Candidate presence: hidden-only 257, visible-rooted 223, visible-no-substantial-root 46, absent 29. All literal candidate partitions, direction counts, unconfirmed effects, absence of ranking and input immutability verified. Prior strength directions joined from existing reports, not recomputed in this run. [Results](balance-useful-element-results.json).

H01 (unresolved earth) retains conditional strong metal/water/wood and weak fire/earth alternatives. YS28 (known secondary disagreement) illustrates that even a directional prior can be wrong; the candidates must remain conditional and no final useful element can be issued. Candidate evidence does not validate the inherited direction.

Native integration tests added for full 111-chart live wrapper and historical v4 parity, source-evidence replay, missing hour/provisional, invalid input and caller override. Native Node is available but the container cannot resolve github.com; full checkout and native replay not executed in this turn. Run locally:
`node --test test/balance-useful-element.test.mjs`
`npm test`

## Next acceptance step

Obtain a distinct useful-element reference fixture with explicitly identified ordinary balance method, the original author's useful element(s), strength interpretation, alternative methods and uncertainty. Do not infer useful-element labels from strength labels alone. Before any priority rule, compare direct support, draining, control, availability and obstruction against frozen source evidence; use climate and mediation as separate evidence layers. Keep unresolved conflicts and special patterns out of confirmed judgments. Textual agreement is not empirical predictive validity.
