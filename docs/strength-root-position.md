# Root position factorial — weight versus central principal requirement

Pinned source 8c415ad9720cfe6e043ffdfb4b57a39792251a09. 100 exposed directional charts: 71 primary, 29 secondary. All four historical result files cross-checked; no new references. Actual source evaluated in four isolated V8 module graphs, 20 fetched modules and an unused throwing calendar stub, 800 top-level v3/v4 calls. No production changes.

## Frozen interventions

R0: existing position profiles (15/30/35/20 and 10/25/40/25 in year/month/day/hour order). R1: both position profiles 25/25/25/25. R2: retain weights; replace central principal requirement with any principal root. R3: both interventions. Keep role weights, thresholds (strong min >=40, weak max <=20), season, pressure criteria and weak veto unchanged. This changes root-capacity weights only, not the separate quantitative slot weight profiles.

| Group | Version | R0 | R1 | R2 | R3 |
|---|---|---|---|---|---|
| Primary 71 agree/disagree/abstain |v3|39/3/29|36/2/33|39/3/29|37/2/32|
| Primary |v4|38/1/32|35/0/36|39/1/31|37/1/33|
| Secondary 29 |v3|10/1/18|7/1/21|10/1/18|8/1/20|
| Secondary |v4|10/1/18|6/1/22|10/1/18|7/1/21|
| All 100 |v3|49/4/47|43/3/54|49/4/47|45/3/52|
| All |v4|48/2/50|41/1/58|49/2/49|44/2/54|

[Case-level results](strength-root-position-results.json). All 100 baseline pairs match prior recorded outcomes.

## Mechanism and limitations

R1 prevents L82's false weak confirmation (root range 10–15 ->25–25), but loses R04 and XU06 correct strong confirmations and XU12 correct weak confirmation in primary. It also loses four secondary agreements in v4 (XU03/XU17/XU19/ZW05). Equal weights are not supported as a general replacement.

R2 changes no v3 direction. In v4 it restores ZW03, a correct strong formerly blocked by season sensitivity: root min 55.5 and year/hour principal roots. The modified v1 adds a root-based strong ground using the legacy name central-root-capacity. The v4 gate then exempts the case. This is an interaction with the gate, not evidence that an independent new structural rule improves v3. An actual implementation must distinguish central and peripheral root evidence explicitly; do not reuse a misleading ground name.

R3 additionally recovers ZN07 (correct strong) and DX01 (secondary inferred strong), but reintroduces ZN01's incorrect strong confirmation in v4: the root minimum moves from 35.5 to 47.5 and the relaxed principal predicate lets it bypass the season gate. Thus indiscriminate broadening of the root-based exemption is unsafe. R3 is not an improvement.

## Decision

Keep v3 and opt-in v4 unchanged. No equal-position or relaxed-principal runtime migration. The next candidate should separate structural root evidence from confirmation authority, and compare peripheral-root evidence with the existing gate kept fixed, explicitly versus a gate exemption. Test whether additional root information increases correct coverage without reviving ZN01 and without losing XU12/R04/XU06. Do not introduce per-case thresholds. R2's one restored agreement is retrospective, insufficient for migration.

Native Node v22.16.0 exists in the container, but a fresh git ls-remote failed to resolve github.com. Native replay and full regression not executed. Run locally:
`node scripts/evaluate-strength-root-position.mjs`
`node --test test/strength-root-position.test.mjs`
`npm test`

Historical textual agreement does not establish empirical predictive validity.
