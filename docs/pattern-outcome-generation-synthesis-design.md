# Generation/release shared proof graph (P1-D)

## Scope
Development-only synthesis, visible literal generation edges. No change to
V10 selection authority, actual effects or legacy consequence policies.

## Graph contract (v2)
- Extend the modeled consequence graph exactly once; preserve every original
  judgment and rule result and do not add evidence facts.
- For each literal generation edge, expose original source-basis, context,
  source-pressure and target-pressure proposition identities. These are
  aliases, not additional observations.
- Direct release and joint release reference the existing exact clause
  propositions. Verify the clause inventory, subject, source screen,
  proof witnesses and alternatives before using the projections.
- Source context and local context are separate structural hypotheses.
- Reception has an explicit, presently unmodeled capacity premise. Neither
  direct release nor joint release is a reception premise.
- Actual release, supply, reception and benefit remain unresolved.

The original source-side release policy may support a direct release
tendency when the target-pressure screen is not met. The joint release
model still requires the full generation screen. Neither model is a
claim about actual transfer or quantitative conservation.

## Compatibility
This is a new internal graph version. P1-C's projected source-basis,
context and recipient-pressure identifiers are now original argument
identifiers; consumers must follow the action's proposition-ID fields.
The output graph includes the whole upstream modeled graph (including
non-generation propositions); the actions/summary are generation-only.
No consumer should count the graph and its upstream packet independently.

## Verification
Run `node --test test/outcome-generation-synthesis.test.mjs`, then
`npm run audit:pattern-outcome-control-synthesis`,
`npm run validate:pattern-outcome-native-p1` and `npm test`.
Tests cover exact evidence identity, judgment/rule parity, full/partial
scope, positive release with unresolved reception, and forged projections.
Native integration and independent classical validation are separate gates.

## Next boundary
Cross-edge composition needs an inventory of shared physical root slots,
donor occurrences, constraints, and interposition legs; proposition identity
alone does not establish independent physical capacity. Do not introduce
a scalar budget or assume energy conservation without a reviewed model.
