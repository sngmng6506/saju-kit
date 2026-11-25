# saju-kit active plan

The [initial plan](docs/history/initial-plan.md) is retained for history, not the current contract. See [architecture](ARCHITECTURE.md), [ADR-0013](docs/adr/0013-domain-first-refactor.md), [consumer contract](docs/consumer-contract.md).

## Refactoring checkpoint (internal gate closed)

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
- Done: all 194 runtime files inventoried; dependency graph clean, 32 unreachable files all compatibility shims. Conservative declaration scan and manual review removed two unused local bindings/imports; research exports retained. Scope-aware exhaustive dead-code proof is not claimed.
- Done: logical domain organization of canonical docs/results, native test entries and frozen fixtures; targeted path-consumer inspection supports retaining historical paths. Physical relocation deferred, not required for navigation or scoped execution.
- Passed (user-reported): layout and dead-code audits; native suite 351/352 due to unintended CLI test discovery. Renamed CLI and manifest, with a discovery naming guard.
- Passed (user-reported 2026-11-25): all 11 native regression/audit/equivalence commands at intended checkpoint f18323b. Exact local HEAD and raw counts not supplied. Internal refactor closed; see [closure record](docs/refactor-closure.md).

## Next after the regression gate

1. Capture benchmark results and validate both pinned consumers in isolated worktrees; external acceptance remains pending. No automatic consumer migration.
2. Use measured runtime and result size before performance optimization.
3. Implemented initial [pattern 成敗救應 structural review](docs/pattern-outcome-evidence-v1.md); native tests passed (user-reported). Added [source reference v1](docs/pattern-outcome-reference-v1.md) and role-level evaluator; native reference audit pending. Added [outcome V2](docs/pattern-outcome-evidence-v2.md) hidden/group access and five rule extensions; native comparison pending. Added [outcome V3](docs/pattern-outcome-evidence-v3.md) secondary officer protection and support loss; native comparison pending. Added [outcome V4](docs/pattern-outcome-evidence-v4.md) conditional regulation and independent day-strength context; native comparison pending. Added [outcome V5](docs/pattern-outcome-evidence-v5.md) storage projection and peer officer clearing; native comparison pending. Added [outcome V6](docs/pattern-outcome-evidence-v6.md) position and winter exception context; native comparison pending. Added [outcome V7](docs/pattern-outcome-evidence-v7.md) compound topology, exact residual threat coverage and six source conjunctions; native comparison pending. Added [outcome V8](docs/pattern-outcome-evidence-v8.md) observed-route assistant dependency and pair masking; native comparison pending. Added [outcome V9](docs/pattern-outcome-evidence-v9.md) separate purity source clauses and candidate clarity; native comparison pending. Added [pre-decision adjudication protocol](docs/pattern-outcome-adjudication-v1.md), partial source clauses and previously exposed annotation queue. Next: independent prospective full-chart gold, native integration gate and effective-force validation before decision authority.
4. Independently validate selection/efficacy hypotheses before promoting a policy or connecting new decisions to transit. No automatic final useful/favorable/unfavorable selection.

## Commands

```sh
npm run test:failures
npm run audit:architecture
npm run audit:dead-code
npm run audit:layout
npm run verify:pattern-refactor
npm run verify:strength-refactor
npm run verify:climate-refactor
npm run verify:methods-refactor
npm run verify:authority-refactor
npm run verify:transit-refactor
npm run verify:core-refactor
npm run benchmark:refactor
npm run verify:consumers -- friends ../saju-friends
npm run verify:consumers -- rent ../rent-or-buy-kr
```

Use `npm run test:failures` for routine local regression: file-completion progress (approximately every 10%), failures, relevant stderr and the aggregate summary are printed. `npm test` remains available for full output.

- Pre-V10: [assistant route extension](docs/pattern-outcome-assistant-extension-v1.md) adds missing combination rescue, group support and branch-slot dependency evidence; native validation pending. No decision authority.

- Pre-V10: [integrated outcome evidence](docs/pattern-outcome-integrated-v1.md) completes omitted storage stages and derives all projections from one final witness set. Native gate and independent labels remain pending.

- Pre-V10: [efficacy evidence screens](docs/pattern-outcome-efficacy-v1.md) link existing force, contact and route evidence; no effect authority. Native integration and independent validation pending.

- [Outcome decision V10](docs/pattern-outcome-decision-v10.md) implements per-axis abstention and release-owned closed authority; actual decision algorithms and independent validation remain pending.

- [Post-V10 hardening](docs/pattern-outcome-hardening.md): corrected global decision and identity validation, stronger regression gate, one-command native audit and benchmark. Await actual receipts before new decision rules.

- [P1 role evidence and prospective queue](docs/pattern-outcome-p1.md): generalized purity pair clauses, route injury contacts, six new source candidates. Native validation and independent review pending.
