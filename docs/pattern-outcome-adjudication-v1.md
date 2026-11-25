# Outcome adjudication and pre-decision gate

Frozen against e9067f6841c226c6f5413b1002e27de15fa2751e. No V10 authority or runtime rule changes.

## Three separate evaluation populations

1. Existing 22 historical charts / 30 positive structural role probes and 3 synthetic charts / 6 controls remain unchanged. They are development references, not effective outcome labels.
2. 59 previously exposed classical corpus rows not duplicated by ID or exact pillars in the outcome development reference. Includes 45 eligible and 14 excluded rows. All annotations pending. Their original source-family and motif metadata is contextual only; no final labels inferred from it. Not an independent holdout.
3. Seven partial source clauses from [論相神緊要](https://donglishuzhai.net/chapter/3728.html), cross-read via [parallel 1](https://www.chenshupaipan.com/books/5/3884.html) and [parallel 2](https://www.kaucim.ai/bazi/ziping-zhenquan/lun-xiang-shen-jin-yao). Explicit stem/branch assistant roles and injury only. No invented full pillars, no final chart outcome, no claim of independent textual editions. Two branch-assembly cases and missing combination routes document scope gaps.

## Annotation procedure

Recruit two independent reviewers. Supply source locator and text, chart with transcription status, and label schema without engine output or prior labels. Record formation, breakage, rescue separately as yes/no/undetermined; assistant as exact occurrence IDs or undetermined (empty list means explicitly no assistant), purity and clarity independently. Provide source locator and justification for each review, preserve variant and school differences. No consensus by majority count or inferred from praise of a life. Disagreement remains unresolved. Exact agreement is only provisional until external independence is verified. Current schema does not accept branch aggregate assistant gold: extend the identity contract before labeling them. No runtime authority from data file.

For prospective holdout, collect full charts outside both previous corpora, freeze IDs/pillars/source labels before evaluating, screen duplicates and variants, separate source-author/edition clusters, include explicit negative and ambiguous cases. Keep holdout sealed from rule development; require external verification of reviewer independence. Report label coverage, agreement and disagreement per axis, fixed-denominator retrieval, abstention and selective accuracy separately. No statistical threshold selected without actual sample composition.

## Run

```sh
npm run test:domain -- pattern
npm run audit:pattern-outcome-v9
npm run audit:pattern-outcome-adjudication
npm run audit:architecture
npm run audit:layout
npm run audit:dead-code
npm run test:failures
```

The new audit catches individual V9 runtime exceptions, preserves denominators and reports raw errors and authority leakage; historical misses diagnostic, synthetic controls and integration integrity gate fail closed. Dataset hashes included. Passing this audit is not permission to make final decisions. No native results supplied after V1; the current container cannot resolve github.com and connector dependency-graph loading exceeded the call budget. Native execution remains required. V10 blocked on independent gold/effective-force evidence and actual regression results.
