# saju-kit active plan

The [initial plan](docs/history/initial-plan.md) is retained for history, not the current contract. See [architecture](ARCHITECTURE.md), [ADR-0013](docs/adr/0013-domain-first-refactor.md), [consumer contract](docs/consumer-contract.md).

## Refactoring checkpoint (current)

- Done: inventory and source static dependency audit; docs navigation and explicit current architecture.
- Done: migrate pattern leaf implementations into one domain; maintain old import paths.
- Done: replace v1–v10 nested entry-point calls with a request-local pipeline; verify actual old/new output and error equivalence in isolated JavaScript.
- Passed (user-confirmed before strength migration): 331 native tests, architecture audit and pattern equivalence.
- Done: consolidate 15 strength and related capacity modules; reuse request-local observations; 12-policy isolated equivalence passed.
- Passed (user-confirmed before climate migration): all tests after repairing research-source references and adding progress reporting.
- Done: consolidate 13 climate implementation modules and shared review kernel; five-policy isolated equivalence passed.
- Done: consolidate balance, mediation and remedy implementations and share method observations; seven-policy isolated equivalence passed.
- Passed (user-confirmed before authority migration): native regression and climate/methods pinned-baseline verification.
- Done: consolidate nine useful-element review/authority modules, skip discarded climate projection and share method context; nine-policy isolated equivalence passed.
- Done: group seven transit modules; compose annual arrival projections in a single traversal and share legacy/v6 annual context and timeline helpers. Isolated equivalence passed.
- Done: shared core observation scope and internal projections; 31-entry isolated equivalence passed.
- Pending: native regression (including corrected climate export test), architecture audit, authority, transit and core pinned-baseline verification; repeat earlier verifiers at final gate.
- Done: all 194 runtime files inventoried; dependency graph clean, 32 unreachable files all compatibility shims. Conservative declaration scan and manual review removed two unused local bindings/imports; research exports retained. Scope-aware exhaustive dead-code proof is not claimed.
- Pending: documentation and test reference audit before physical migration.
- Pending: decide whether to move historical research/results files after all referencing scripts/docs are audited. Do not create duplicate authoritative specs.

## Next after the regression gate

1. Audit documentation, test fixtures and script path consumers before relocation. Preserve historical paths or migrate all known consumers explicitly; no automatic deletion.
2. Measure runtime and result size before performance optimization.
3. Resume pattern 成敗救應 research on the consolidated pattern domain. Separate structural evidence, unresolved effects and authority; preserve special-pattern exclusion and consumer pins.
4. Independently validate selection/efficacy hypotheses before promoting a policy or connecting new decisions to transit. No automatic final useful/favorable/unfavorable selection.

## Commands

```sh
npm run test:failures
npm run audit:architecture
npm run audit:dead-code
npm run verify:pattern-refactor
npm run verify:strength-refactor
npm run verify:climate-refactor
npm run verify:methods-refactor
npm run verify:authority-refactor
npm run verify:transit-refactor
npm run verify:core-refactor
```

Use `npm run test:failures` for routine local regression: file-completion progress (approximately every 10%), failures, relevant stderr and the aggregate summary are printed. `npm test` remains available for full output.
