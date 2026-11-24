# Audited directional comparison

Engine and audit pinned to `c2367480ce05105c657e5d787ffa5f64cc66dc2f`. See [case-level results](strength-audited-results.json). 76 complete charts × four policies, 304 actual source executions. A current; B removes the resource-versus-weak veto; C neutralizes season; D both. 19 source modules fetched, plus a throwing calendar stub never invoked; local V8 module bindings, not native Node integration. Inputs checked against the pinned audit before recording.

| Group | A agree/disagree/abstain | B | C | D |
|---|---|---|---|---|
| Primary 53 | 31/0/22 | 32/0/21 | 30/0/23 | 31/0/22 |
| Secondary 23 | 8/0/15 | 10/0/13 | 9/0/14 | 11/0/12 |
| All 76 | 39/0/37 | 42/0/34 | 39/0/37 | 42/0/34 |

B improves only XU07 in primary. W10 and XU24 are secondary and should not drive ordinary policy. Season removal loses H04 and XU12 but gains R07 in primary. Holdout H04/H05/H06: A/B 1 correct, C/D 0; Lin four: all 3 correct and 1 abstain. Thus B has no observed primary unseen improvement. All zero-disagreement counts are conditional on model coverage and this historical corpus, not population accuracy.

The 53 primary cases have already been used in development or retrospective audit; no fresh independent evidence here. Keep A as runtime and B as candidate; do not change rules until new explicit natal ordinary charts with actual veto contrasts (including counterexamples) are frozen and tested. Native Node full regression remains open due to direct GitHub DNS failure. L98 timing caveat remains. No production source changes.
