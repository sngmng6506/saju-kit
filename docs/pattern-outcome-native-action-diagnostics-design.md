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
