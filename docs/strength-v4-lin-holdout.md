# v4 prospective Lin scan holdout

Frozen fixture commit: 73a091a22b00dd6dffc08dc47cb3a83e16cb7a8d. Frozen engine: bd82161c91f4a8337aa0e90fd3cd1f17b16fc521. [Fixture](../test/fixtures/ordinary-lin-holdout-v4-v1.json), [case-level results](strength-v4-lin-holdout-results.json). Six newly selected charts from 林庚白's 人鑑卷上, visually read from the NLC scan; four ordinary candidates and two formation/special-pattern uncertain cases. The 118 preceding ordered charts were checked for exact duplicates. This is prospective with respect to v4, but is a previously used author, not an independent-author validation or a representative sample. The frozen labels and eligibility were not changed after evaluation.

| Group | F0 v3 | F1 v3 no weak veto | F2 v4 | F3 v4 no weak veto |
|---|---|---|---|---|
| Ordinary 4: agree/disagree/abstain |1/1/2|1/1/2|1/1/2|1/1/2|
| All 6 |1/1/4|1/1/4|1/1/4|1/1/4|

L83: explicit 身旺煞淺, both resource grounds survive neutral season. L82: the author applies 主旺無危 to this chart, while v3 and v4 give weak exclusively via low-root-capacity-and-dominant-pressure. The text also invokes virtual arching for usefulness; the prospective ordinary classification is retained but its author-specific auxiliary-method caveat matters. Removing L82 as a sensitivity analysis would give 1/0/2 on the remaining three ordinary cases, not evidence of superiority. No resource weak-veto fires; its removal is not independently supported. L78 and L80 remain secondary. No new rule or default migration.

The earlier Zhang ZN01 chart is also present in Xu's 子平真詮評注 (論印綬取運, 孫布政造; https://sanqing.com.tw/en/%E5%AD%90%E5%B9%B3%E7%9C%9F%E8%A9%AE%E8%A9%95%E8%A8%BC/). Xu's passage describes a skewed chart and discusses favorable strength/resource luck; it should not be treated as an independent new chart or automatically as a contradictory natal binary label. Preserve the original fixture and audit source reuse separately.

## Next decision

Keep v4 opt-in, do not remove weak veto. Diagnose L82's weak path (root positions, season and pressure robustness, visible peer support and local resource eligibility), rather than fit an exception. Seek fresh ordinary charts from a genuinely new author with both direction labels and actual policy contrasts. All six Lin cases are now exposed. Native Node tests remain unexecuted in this run; actual complete-chart V8 evaluation executed 24 calls with an unused throwing calendar stub.

Reproduce: `node scripts/evaluate-strength-v4-lin-holdout.mjs`, `node --test test/strength-v4-lin-holdout.test.mjs`.
