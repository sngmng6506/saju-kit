# P3-A native action diagnostic composition

## One composition owner
`buildActionDiagnostics(prior, formation, combinationContext, strength)`
is the single chart-level composition owner. The native efficacy review
(and thus V10) and the development replay use the same implementation.
Birth, formation, and strength provenance remain owned by their existing
upstream layers. The diagnostics object is transported into mechanismReview
without a second list of fields.

The 19 existing diagnostic fields are preserved and the five P1/P2
diagnostics (generationSynthesis, interactionDependencies,
interactionScenarios, interactionProofs, conditionalJoint) are added.
Invalid diagnostic evidence continues to fail closed in the enclosing
efficacy review. Bounded scenario unavailability remains a nested
diagnostic state, not an assertion of failure or success.

## Authority
No changes to the seven V10 decision release axes or to the actual
effect/selection authorities. The diagnostic data are not used as
effective force or as a new classical decision policy. V10 and efficacy
still share inherited evidence.

## Validation
The focused and full native validation inventories include the new
P1/P2 test files. Native audit compares the complete diagnostic transport
and independently checks scope/authority invariants. Since both paths
use the same composition owner, transport parity is **not** independent
validation of the inference algorithm.

Run on a clean checkout:
```sh
npm ci
npm run audit:layout
npm run audit:architecture
npm run validate:pattern-outcome-native-p1
npm run validate:pattern-outcome
```

The reports are bound to the checked-out revision. Full native pass,
baseline consumer behavior, performance and independent literature
validation remain separate acceptance gates; code integration alone
does not satisfy them. Do not promote the diagnostics to actual outcome
or useful-element selection on the basis of transport parity.

## P3 integration hardening — shared contract and staged literal-chart regression

The native efficacy review and development replay now share
`inspectActionDiagnostics`. Every returned diagnostic owner is checked
for the expected outer scope/status, selection abstention, and declared
actual-effect fields. A nested budget-unavailable analysis remains
a diagnostic, not a promoted conclusion. Invalid owner/status/reason
records are retained in the native efficacy review on failure. The
development report uses the actual composition inventory rather than
a second list of diagnostic owners; a modeled report projection
exception is recorded separately instead of concealing earlier failures.
This is envelope validation, not a substitute for each owner's
domain-specific evidence checks or a guarantee that the composition
cannot throw before returning its inventory.

The positive symbolic frontier delegates packet validation to the
canonical signed argument engine before enforcing its narrower positive
fragment. Invalid identities, repeated rules/premises, invalid references
and malformed propositions cannot bypass the common contract.

The existing 11 frozen literal-chart controls are now independently
importable from `scripts/lib/pattern-action-controls.mjs`. The focused
`test/outcome-action-stage-replay.test.mjs` checks the real upstream
core and root-preservation path separately from the root-to-replenishment,
burden and strength path, for both complete and partial charts. This
does not depend on a successful full V10 composition or on other
mechanism verdicts. These 44 chart-stage tests and the envelope test
are registered in the existing native validation inventory.

Verification in the restricted environment:
- At baseline c78b928, the actual core/formation/relative-force/root
  and supply source modules were executed together for 10 chart variants
  (all 10 valid); the actual core and root-preservation dependency
  subset was executed for 110 element/variant combinations (all 110
  valid). Modules were loaded at a pinned revision with explicit
  source-level import resolution in JavaScript, not native Node ESM.
- After the hardening, 10 burden/frontier tests, six strength synthesis
  tests and one envelope test passed with actual source modules in
  isolated JavaScript execution. The new native test file and changed
  source files were syntax checked with imports stripped, not a full
  Node dependency-load check.
- Full checkout still fails GitHub DNS resolution; the complete
  dependency closure also exceeds the connector call budget. The
  44 native stage tests and full V10 suite have not been executed.
  No independent classical accuracy labels or selection authority were
  changed.

Run from a clean checkout:
```sh
node --test test/outcome-action-stage-replay.test.mjs
node --test test/outcome-burden-comparison.test.mjs test/outcome-strength-synthesis.test.mjs
npm run validate:pattern-outcome-native-p1
npm run validate:pattern-outcome
```
Do not regard source-level isolated execution as native acceptance.
