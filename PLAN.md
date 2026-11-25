# saju-kit active plan

The [initial plan](docs/history/initial-plan.md) is retained for history, not the current contract. See [architecture](ARCHITECTURE.md), [ADR-0013](docs/adr/0013-domain-first-refactor.md), [consumer contract](docs/consumer-contract.md).

## Refactoring checkpoint (current)

- Done: inventory and source static dependency audit; docs navigation and explicit current architecture.
- Done: migrate pattern leaf implementations into one domain; maintain old import paths.
- Done: replace v1–v10 nested entry-point calls with a request-local pipeline; verify actual old/new output and error equivalence in isolated JavaScript.
- Passed (user-confirmed before strength migration): 331 native tests, architecture audit and pattern equivalence.
- Done: consolidate 15 strength and related capacity modules; reuse request-local observations; 12-policy isolated equivalence passed.
- Pending: new native regression, architecture audit, pattern and strength pinned-baseline verifiers.
- Pending: inspect remaining domains and document link consumers before additional physical migration. Symbol-level dead code and duplicate semantic logic require separate review; no automatic removal.
- Pending: decide whether to move historical research/results files after all referencing scripts/docs are audited. Do not create duplicate authoritative specs.

## Next after the regression gate

1. Review climate and useful-element/transit dependency boundaries; use small equivalent migrations only when justified.
2. Measure runtime and result size before performance optimization.
3. Resume pattern 成敗救應 research on the consolidated pattern domain. Separate structural evidence, unresolved effects and authority; preserve special-pattern exclusion and consumer pins.
4. Independently validate selection/efficacy hypotheses before promoting a policy or connecting new decisions to transit. No automatic final useful/favorable/unfavorable selection.

## Commands

```sh
npm test
npm run audit:architecture
npm run verify:pattern-refactor
npm run verify:strength-refactor
```
