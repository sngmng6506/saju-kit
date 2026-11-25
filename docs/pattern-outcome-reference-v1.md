# Pattern outcome source reference v1

Single-annotator source-based development reference, fixed before running the new audit. This is independent of engine *outputs*, not an independent expert panel or blind holdout. The 81-case existing corpus remains unchanged. Historical source descriptions are paraphrased, not copied; electronic witnesses are not necessarily textually independent. No final 成格/破格/救應 or life-outcome label is asserted.

## Dataset

- 22 historical charts drawn from all eight ordinary families; 30 role-specific positive source probes.
- 16 probes have a V1 rule mapping; 14 have no mapping. Mapped does not imply reachable (storage scope and hidden access can prevent retrieval).
- 3 separate synthetic charts, 6 probes for positive, absent, unresolved and wrong-role behavior. They are not historical or final outcome evidence.
- Each row pins its classical corpus ID, four pillars, family, source URLs, paraphrase and review status. Each probe states semantic category, exact role occurrence IDs where available, expected observation and optional rule mapping/gap. Rule mapping is evaluation metadata, not the source label itself. Editorial/variant-sensitive examples are marked; no silent source correction.

## Metrics

The evaluator checks exact role identity, not just rule names, and reports matched, mismatch, unresolved, unavailable and unmapped separately. Positive recall is restricted to mapped positive probes, with unavailable/unresolved counted as non-hits. Mapping coverage is separately reported to prevent excluding difficult clauses from a headline score. Resolved agreement is not outcome accuracy. The historical sample is largely positive, so historical specificity/precision cannot be estimated; synthetic controls are not combined with historical metrics. No rule changes are made to improve this baseline.

## Reproduce

```sh
npm run audit:pattern-outcome-reference
npm run test:domain -- pattern
npm run audit:layout
npm run test:failures
```

Historical misses are diagnostic and do not fail the audit; synthetic controls fail closed. The full result has row-level role references for manual review. Native execution pending; user reported the preceding outcome v1 tests passed, without raw logs.

## Next priorities

1. Hidden and branch-assembly obstacle/controller scope, including source-specific branch access rather than treating every hidden stem as equally effective.
2. Secondary-role protection and support loss (e.g. protecting officer inside resource/wealth), with distinct protected role and family anchor.
3. Conditional support versus damage (wealth regulating excess resource, food moderating excessive blade controller); preserve context rather than cancel structural harm.
4. Winter metal-water exception, location/order, and multi-step changes. Add independently adjudicated negative/ambiguous historical labels before promoting any final outcome policy.

See the per-case source URLs in [the fixture](../test/fixtures/pattern-outcome-reference-v1.json). Main doctrine: [論用神成敗救應](https://www.kaucim.ai/bazi/ziping-zhenquan/lun-yong-shen-cheng-bai-jiu-ying).
