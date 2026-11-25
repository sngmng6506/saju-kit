# Cross-project engine boundary (2026-11-24)

Status: initial shared API implemented; Node regression execution pending in a checkout with network access.

- saju-kit owns Gregorian/lunisolar calendar data, pillar calculation and neutral relations. Applications depend on a pinned Git SHA and the root ESM exports, not internal files.
- saju-friends owns Japanese UI, character labels, score weights, ranking, graph layout, X, persistence and payment. It must not recreate the calendar or relation tables. Use Korean pillar keys as stable legacy identifiers and localize at the UI boundary.
- rent-or-buy-kr's existing v6 movement policy is now an explicitly versioned `movementV6` namespace. Existing root integer-day and v1 movement functions are retained; new consumers explicitly opt in. See [movement contract](movement-v6.md).
- Day-only API uses a civil date at midnight without implying a full chart. Full chart calculation retains the existing explicit uncertainty rules and accepts Tokyo for Gregorian 1970–2100 only; Korean default remains unchanged. Japanese lunar conversion and earlier time-zone policies are out of scope.
- Three-harmony and seasonal groups: pair candidates are not completed groups. Cardinal inclusion is a neutral flag. A complete group means all three distinct members are present, not that transformation is confirmed. No automatic luck score or claim of actual relationship quality.
- Existing day compatibility remains v1. Additive extended branch, natal, cross-chart and root/projection evidence APIs are specified in [extended natal contract](extended-natal.md). No automatic scoring, transformation or strength ruling.
- Distribution is Git-only initially, versioned root API, no npm publication until source/data license review. Do not silently update consumers to main.

## Verification gate

Run `npm test` on the pinned checkout, including existing calendar, natal, year-signals and movement regressions plus the new all-pairs compatibility suite. The pure pair algorithm was separately checked over 3,600 ordered pairs in a JavaScript runtime; this does not replace the full Node suite or calendar fixtures. Check installation in saju-friends and a production Next build before deployment.

- Proposed strength analysis is a separate opt-in policy: [strength-hybrid-v1](strength-hybrid-v1.md). Experimental opt-in API implemented; do not consume until the release gate is satisfied. It must not alter existing scores or select yongsin automatically.

- The separate experimental [ordinary strength v2 contract](strength-ordinary-v2.md) is conditional on ordinary-chart interpretation. No special-pattern inference or consumer migration; v1 remains frozen.

- [Interaction context and sensitivity](interaction-sensitivity-v1.md) are separate observational/diagnostic APIs. Scenario results must not replace actual ordinary-strength category.

- [Root dynamics v1](root-dynamics-v1.md) provides neutral positional and life-stage observations and possible protection/mediation paths. No effective strength or successful mediation is inferred.

- [Structural strength v3](strength-structural-v3.md) is an opt-in experimental qualitative hypothesis only; no final category or consumer migration.

- [Quantitative strength v3](strength-quantitative-v3.md) is a separate experimental sensitivity index, not a final classification. No consumer migration.

- [Multi-axis strength v1](strength-multiaxis-v1.md) exposes experimental hypotheses and separate axes, not a final category. No consumer migration.

- [Support network v1](support-network-v1.md): observation only; no effective strength or cancellation.

- [Multiaxis v2](strength-multiaxis-v2.md) is experimental; inherited detail is v1 baseline, decision is v2. No consumer migration.

- [Resource access v1](resource-access-v1.md) returns exposure-conditioned diagnostics only, not actual support or strength.

- [Route budget v1](route-budget-v1.md) is a hypothetical diagnostic, not a classifier.

- [Output capacity v1](output-capacity-v1.md) provides hypothetical accepted control and residual output, not final strength.

- [Multiaxis v3](strength-multiaxis-v3.md) is experimental and does not replace earlier policies.

- [Pattern v7](pattern-useful-element-v7.md) is an explicit experimental composition policy. A preference or secondary family is not a final pattern, useful god, or favorable element; no automatic consumer migration.

- [Pattern v8](pattern-useful-element-v8.md) is experimental mixed-month evidence. Concurrent use does not imply confirmed multiple useful gods, secondary patterns or favorable elements. Existing consumer policy remains pinned.

- [Stem force evidence / pattern v9](pattern-useful-element-v9.md) exposes per-occurrence structural evidence, not numeric strength or effective force. Prior preference and consumer policies remain unchanged.

- [Pattern v10](pattern-useful-element-v10.md) is opt-in relative evidence; evidence dominance is not force dominance, and passing the screen is not an effective action or final selection. No consumer migration.

- [Pattern outcome evidence v1](pattern-outcome-evidence-v1.md) is an explicit experimental structural subclause review; no final 성패, 相神 or consumer migration.

- [Pattern outcome evidence v2](pattern-outcome-evidence-v2.md) adds opt-in hidden and group observations; no final outcome, transformation or consumer migration.

- [Pattern outcome evidence v3](pattern-outcome-evidence-v3.md) adds secondary-role evidence and potential support loss; no final decision or pin update.
