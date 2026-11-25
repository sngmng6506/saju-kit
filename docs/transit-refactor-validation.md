# Transit and annual timeline refactor validation

Baseline: d8e221df2bb01ea6a40e00a698e7339e59e1346a. Implementation: 2fffe7483c5d94430229ab3c4d67af3f061a4f5f.

Seven former transit implementation modules now reside in src/features/transit. The kernel owns validation, fixed daeun policy selection, inclusive annual calendar and anchor relations; the pipeline adds conditional, source and pattern arrival projections. Existing entry points and the historical custom evaluation helper remain compatible. V4 uses the prior v3 anchor evidence and adds pattern roles without changing selection authority. The annual loop constructs each row once rather than mapping entire year arrays in successive versions. Stem-arrival record creation is shared without inferring effective supply. Core year-context and year-timeline-kernel remove identical validation and traversal implementations from legacy and movement-v6. Daeun rounding, minute precision, scoring, labels and relationship policy differences remain unchanged. Explanations and scoring remain separate.

## Executed
- Before/after source reconstructed from complete move/change diffs with fetched core and feature dependencies, adapted ESM evaluator: 100 old and 110 new loaded modules.
- Four transit policies across 12 exact birth dates, two genders, two daeun policies and four annual windows: 768 full output comparisons. 76 error and unavailable-input comparisons. All matched.
- 96 complete/unknown-hour daeun comparisons and 96 full timeline comparisons, with 7,674 annual rows and additional individual annual comparisons in total; 32 annual/timeline boundary comparisons. All matched, including recursive values, key order, null/undefined and input immutability.
- Five related native test sources inspected for direct source-read/patch references: none in inspected lines. This is a targeted check, not a whole-repository audit.

## Pending
The preceding authority run reported one obsolete climate export test failure; the test was corrected in the baseline commit, but the user's rerun was not reported before this phase. Run the complete native suite, architecture audit, authority and transit pinned-baseline verifiers. The isolated evaluator is not a full native Node execution. No timing benchmark or predictive accuracy claim.
