# Architecture

Current implementation, not a future directory sketch. See [documentation index](docs/README.md), [consumer contract](docs/consumer-contract.md), [active plan](PLAN.md) and [ADR-0013](docs/adr/0013-domain-first-refactor.md).

## Boundaries

- `src/index.js`: stable ESM public facade. Consumers pin Git commits. No internal dependency on this facade.
- `src/data/`: pinned calendar data. No policy or consumer logic.
- `src/core/`: calendar, elemental correspondences, natal structures, neutral root/formation and occurrence-specific force observations. Core must not depend on features.
- `src/features/`: versioned research policies and their composition. Features may depend on explicit earlier policies and neutral core evidence; dependencies must be acyclic. Consumer-specific localization, persistence, UI and commercial decisions stay outside.
- `test/`: automated tests and reference fixtures. `scripts/`: repeatable audits and research evaluation. Neither is a runtime dependency.

No runtime package dependencies. Policy identifiers, output fields, errors and frozen baselines are retained. Special chart inference, effective force, final useful-element selection and empirical prediction are not implied by structural observations.

## Current pattern domain

```
src/features/pattern/
  pipeline.js
  candidate-source.js   # reference definitions and family mapping
  candidates.js         # monthly candidate observations
  outcomes.js           # source condition observations
  routes.js             # occurrence and directed route evidence
  quality.js            # route quality and order evidence
  storage-and-roles.js  # storage projection and named-role witnesses
  preference.js        # v5 family hypothesis
  officer-preservation.js
  composition.js       # preservation and explicit secondary family
  mixed-use-source.js
  mixed-use.js         # mixed-month relationships
  force-bindings.js
  relative-bindings.js
```

All v1–v10 public pattern entry points delegate to the request-local pipeline. They do not call each other. It constructs only the fields requested by each original revision and preserves version-specific behavior. Earlier discarded outcome/route/quality calculations are skipped for v4+. Core calls inside root/force evidence still perform their original independent work; no cross-request cache. The 13 old leaf paths re-export their implementations solely for existing internal test/script compatibility. Do not add new implementation code there.

Other domains retain their existing version directories for now. Group only after establishing equivalence baselines; do not delete research policies or infer a release from the largest version.

## Documentation ownership

README is the entry point; this file describes current architecture; PLAN describes remaining work; ADRs preserve decisions and rationale. Version contracts and source/validation notes are discoverable through [docs/README.md](docs/README.md). Existing document paths are intentionally preserved in this phase. Original plan is archived in [docs/history/initial-plan.md](docs/history/initial-plan.md).

## Verification

```sh
npm test
npm run audit:architecture
npm run verify:pattern-refactor
```

The last command compares the complete root API export names and ten pattern policies against a pinned pre-refactor checkout. Static audit is a conventional ESM import scan, not a complete symbol-level dead-code proof. See [refactor validation](docs/refactor-validation.md) for executed checks and outstanding native regression gate.
