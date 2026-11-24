# Strength research integration checkpoint

Baseline inspected: 5510db8eb01cb5bb22533e38fc15450b6176d950. This checkpoint audits records and interfaces, not classical predictive accuracy. No additional fitted coefficients and no production decision changes.

## Responsibilities

| Layer | Existing module | Decision authority |
|---|---|---|
| Birth/clock/solar terms | calendar | Chart only |
| Literal root and seasonal context | natal-context, element-structure, root-dynamics | Observations |
| Nominal quantitative profile grid | strength-quantitative-v3 | Experimental quantitative hypothesis |
| Resource and route bounds | support-network, resource-access, route-budget, output-capacity | Hypothetical allocation |
| Multi-hop reservation | multihop-interaction-v1 | None |
| Formation evidence | formation-evidence | None |
| Month command | month-command | Conditional source hypotheses only |
| Command sensitivity | strength-command-sensitivity-v1 | None at the top level |
| Existing directional baseline | strength-multiaxis-v4, strength-decision-v1 | Experimental ordinary-chart hypothesis |

Do not combine these outputs into an arbitrary total score. A matching historical label is not empirical prediction. A complete chart does not resolve special patterns or transformation. A source-reported command is not a recovered birth instant. Keep hypotheses with different assumptions separate.

## Executed record audit

The actual committed pure audit function in a8898c0dcc71bc1e50d5567348c30991b77cf089 was executed in V8 against all 11 fixture files and eight report files. 135 distinct four-pillar records and IDs, 100 historical directional cases, 50 fixed abstentions. 750 report rows (seven full cohorts and one abstention subset). The original reference identities, labels and groups agree; root R0/R2 agree with the separated fixed/experimental records, clash C0 agrees with the fixed baseline; all report IDs agree with their cohort; all peer buckets agree with the abstention record; 10 pressure candidates agree between peer, resource-route, and multihop records. 42 direction-metric groups recomputed plus abstention bucket summaries. Zero audit issues. Five intentional corruptions (missing row, duplicate row, changed label, changed aggregate, changed candidate) all rejected. This is a record consistency check, not independent rerunning of the algorithms or authentication of historical labels. The audit does not pretend to cover all old or supplemental reports.

## Replay gates

1. Run `node scripts/audit-strength-research.mjs` and require exit 0.
2. Run `node --test test/strength-research-audit.test.mjs`.
3. Run `npm test` in a real checkout. Do not merge a policy change until native full regression passes. Replay failures must be diagnosed against pinned source and raw cases, not resolved by silently replacing stored results.
4. For any new authority, freeze the policy and genuinely independent text cases, including counterexamples; report agreement, disagreement and abstention separately. Include formation scope and source uncertainty. A source-specific observation is not authority.

Node v22.16.0 is available in the current analysis container, but git ls-remote failed to resolve github.com. Connector source/data retrieval works; native checkout and whole-suite execution were not completed. Existing script imports and export paths were inspected (including chartFromReference, which is present); inspection does not establish test execution. V8 data-audit execution is distinct from native ESM/Node test execution.

## Next
Native full regression and source-authenticated prospective examples precede further model expansion. Prior pressure and formation variants remain research-only; no new default.
