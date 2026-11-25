# Useful-element authority refactor validation

Baseline: f7f0c71bc1fcc3e21dceafbbeca26f9e8a3a2ea2. Implementation: 5d2c72b76c3a63838b4922a115a4b8dfcccb1881.

Nine former modules are now in src/features/useful-element. The authority pipeline owns version composition, while method comparison, anchor relations, source candidate projection and the five-method matrix retain their responsibilities. V1 uses climate v2, v2–v4 use climate v3 for anchors, v3/v4 retain separate climate v5 source candidates, and v4 retains pattern v3. The discarded climate v1 projection and repeated comparison are skipped. The request-local method provider now shares context and structure with climate, without accepting caller-supplied observations. Pattern analysis is still independently computed. Public root exports and historical helper names are unchanged.

## Executed
- Actual before/after source reconstructed from complete diffs plus fetched dependencies and loaded through an adapted ESM evaluator (81 old / 87 new modules).
- Nine policies (five useful-element and four affected climate policies), 321 reference/synthetic charts: 2,889 exact recursive output comparisons; 72 exact birth cases × nine policies: 648; 81 boundary/error comparisons. All matched including keys/order, null/undefined and input immutability. Historical entry module export name sets also match.
- On one complete reference chart, authority v4 structure calls 9→6, natal context 13→8, climate evidence 3→2 and method comparison 2→1. V3 structure 7→4, context 10→5. These are function counts, not elapsed time.
- Five related native test sources inspected for direct old source reads/patches: none found in this targeted scan.

## Pending
User confirmed the prior native test suite and climate/method equivalence scripts passed before this migration. New native suite, architecture audit, pinned-baseline authority verifier and downstream transit integration remain pending. The isolated evaluation did not execute the entire native public root or transit policies. Source data, doctrine thresholds, method precedence, selection authority and consumer contracts unchanged; this is regression equivalence, not empirical validation.
