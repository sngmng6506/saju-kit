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

All v1–v10 public pattern entry points delegate to the request-local pipeline. They do not call each other. It constructs only the fields requested by each original revision and preserves version-specific behavior. Earlier discarded outcome/route/quality calculations are skipped for v4+. Root/force evidence reuses the same request-local validated core observations; no cross-request cache. The 13 old leaf paths re-export their implementations solely for existing internal test/script compatibility. Do not add new implementation code there.

The additive [outcome evidence review](docs/pattern-outcome-evidence-v1.md) consumes V10 evidence through separate rule, graph and review modules. It does not change V1–V10 outputs or claim efficacy; rescue extends rather than erases a damage witness. [Outcome V2](docs/pattern-outcome-evidence-v2.md) adds separate hidden-access and complete-group relation projections and source-scoped rule extensions; V1 is frozen. [Outcome V3](docs/pattern-outcome-evidence-v3.md) separates family anchor bindings, secondary target injury and support loss; it shares the private V2 request builder and never promotes effects. [Outcome V4](docs/pattern-outcome-evidence-v4.md) separates conditional regulation from damage/rescue and consumes an unchanged strength-decision hypothesis via an explicit projection; no effect or strength authority is transferred.

## Current strength domain

`src/features/strength/` contains hybrid evidence/quantitative, ordinary, structural, quantitative, multiaxis, network/integrated decisions, season robustness, separated decision, command sensitivity, resource access, route budget and output capacity. Historical paths retain explicit re-exports (or unchanged export-star shims). The internal request-evidence provider reuses quantitative observations, root dynamics and support-network projections for the same request. Standard/neutral season modes and distinct hour completions remain separate. Shared scenario-mass owns contribution aggregation. See [strength refactor validation](docs/strength-refactor-validation.md).

## Current climate domain

`src/features/climate/` groups the versioned source tables, evidence projection, temporal predicates, structural predicates, requirement contexts and textual motifs. A shared kernel serves the five climate policy entry points; legacy v1/v2 omit the newer projections, and v5 reuses the existing natal structure for requirements and motifs. Historical paths remain compatible. See [climate refactor validation](docs/climate-refactor-validation.md).

## Current balance, mediation and remedy domains

The `balance/`, `mediation/` and `remedy/` directories own their respective doctrine evidence and review policies. The private `src/features/method-evidence.js` composes request-local structure and strength observations for the balance priority/route and parallel useful-element review. Standard/neutral scenarios remain distinct; no cross-method authority is inferred. See [method refactor validation](docs/methods-refactor-validation.md).

## Current useful-element authority domain

`src/features/useful-element/` owns parallel review, anchor relations, temporal alternatives, expanded source candidates and five-method comparison. Its authority pipeline composes fixed policy versions without discarded baseline projections. The shared method provider supplies request-local natal context and structure to climate; the v2 anchor namespace, v3 source namespace and v4 pattern evidence remain separate. Historical entry points are compatible. See [authority refactor validation](docs/authority-refactor-validation.md).

## Current transit and annual movement domains

`src/features/transit/` owns fixed-policy transit orchestration, annual evidence, exact arrivals, source and pattern projections. The legacy and movement-v6 annual APIs use shared core year-context and year-timeline-kernel helpers for identical validation and traversal while retaining their separate signal, explanation and display policies. Daeun calendar policy implementations and consumer contracts remain unchanged. See [transit refactor validation](docs/transit-refactor-validation.md).

## Shared core observation scope

`createElementObservation` validates the chart once and lazily constructs natal context, natal relations and elemental structure. Internal interaction/root projections consume those observations, and formation, stem-force and pattern analyses reuse them. Method review also shares the structural root graph between its two season modes; quantitative policies retain independent caches. Public analyzers still validate their own inputs and no global state is introduced. See [core refactor validation](docs/core-refactor-validation.md).

Other domains retain their existing version directories for now. Group only after establishing equivalence baselines; do not delete research policies or infer a release from the largest version.

## Documentation ownership

README is the entry point; this file describes current architecture; PLAN describes remaining work; ADRs preserve decisions and rationale. Version contracts and source/validation notes are discoverable through [docs/README.md](docs/README.md). Historical document/result and test/fixture paths are preserved. Domain catalogs in `docs/domains/` index canonical documents and fixtures without duplication; `scripts/lib/domain-manifest.mjs` assigns each native test entry to one primary domain. See [test workflow](test/README.md) and [layout validation](docs/layout-validation.md). Original plan is archived in [docs/history/initial-plan.md](docs/history/initial-plan.md).

## Verification

```sh
npm test
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
```

The pattern verifier compares the complete root API export names and ten pattern policies against a pinned pre-refactor checkout. Static audit is a conventional ESM import scan, not a complete symbol-level dead-code proof. See [refactor validation](docs/refactor-validation.md) for historical checks and [closure record](docs/refactor-closure.md) for the user-reported passing internal gate, performance baseline and pending external consumer acceptance.

For concise native regression output, use `npm run test:failures` (custom Node reporter; no change to test selection or exit code). Full output remains available via `npm test`.

The concise reporter displays file-completion progress rather than guessing the number of dynamically registered tests. If file lifecycle events are unavailable, it reports completed test events instead. Research ablation scripts use `scripts/lib/strength-research-source.mjs` to target implementation files, not public re-export shims.

The [dead-code inventory](docs/dead-code-inventory.md) distinguishes pure compatibility re-exports, research-only exports and local declaration candidates. `npm run audit:dead-code` is a conservative textual report, not a scope-aware call graph or automatic removal tool.

Outcome V5 adds [storage projection and peer officer clearing](docs/pattern-outcome-evidence-v5.md) via a request-local V4 builder; no synthetic hidden stems or selective cancellation authority.

Outcome V6 adds [position and winter exception evidence](docs/pattern-outcome-evidence-v6.md). Climate remains a separate diagnostic policy; spatial order does not confirm effects.
