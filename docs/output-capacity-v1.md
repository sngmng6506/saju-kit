# Output capacity v1 (experimental)

API: `analyzeOutputCapacity({saju,policy:'output-capacity-v1',birthBasis:'verified-chart'})`. Composes frozen route-budget v1, quantitative v3 and support network. All earlier APIs remain unchanged.

## Model
For each paired quantitative and route-budget scenario, map nominal contribution units to actual occurrence nodes. For each non-day destination, cap the sum of incoming requested allocations at its own nominal mass. When requests exceed the cap, distribute accepted integer units proportionally using exact BigInt products and largest remainders, with source-ID tie breaking. Accepted plus rejected equals requested for each edge. No redistribution of rejected units. Source allocations remain bounded by the earlier source budget. Opposite effects on a resource share this hypothetical conservative cap; no physical interpretation is asserted. Day stem is a reference, has no nominal mass, and incoming direct relations are not target-capped. No actual day capacity inferred.

Output burden includes all output occurrence masses, even remote ones. Local subtotal records the day relation locality. Accepted resource-output allocation is a hypothetical control amount; residualHypothesis = nominal output minus accepted control. No confirmed suppression or real residual force. Resource conditional direct uses requested wealth versus own nominal mass, not accepted wealth, to avoid cap erasing overload evidence. Accepted officer generation is not added to resource mass. No iterative transfer, target redistribution, or final direction.

Complete result exposes rows with allocations (units, accepted, rejected), targetCaps, outputs, resources and marginal nominal-point ranges (integer units / 1e6). Two existing route variants (all-local and anchored targets) per quantitative scenario. Partial/provisional: null analysis. This model inherits unvalidated weights and equal allocation hypotheses. The residual calculation is an explicitly hypothetical sensitivity scenario, not a classical formula or measured power. It does not implement special patterns, yongsin or a final strength decision.

## Verification
Four test bodies checked in a V8 source adapter, 48 Tokyo calendar inputs (4,608 scenarios), 96 textual charts (5,424 scenarios). Actual calendar used in calendar checks; unused calendar helper stubbed in complete textual chart comparison. Integer cap, edge partition, nonnegative residual, remote output, zero output, deterministic and partial/provisional checked. Native Node suite remains unrun.

| Case | Reference | Nominal output | Accepted control | Residual hypothesis | Conditional resource |
| --- | --- | ---: | ---: | ---: | ---: |
| W23 | weak | 61.8–81.2 | 7–10.05 | 52.425–73.6 | 5.666667–8.55 |
| W24 | weak | 43.8–62.3 | 4.266666–9.315 | 34.485–58.033334 | 0–4.14 |
| R10 | strong | 24–42 | 4–7.29 | 16.71–37.8 | 16–20.79 |
| R11 | strong | 8.8–11.61 | 6–11.61 | 0–4.86 | 14.483333–33 |
| W02 | strong | 7.52–10.44 | 5.6–10.44 | 0–2.7 | 19.25–36.18 |

Exploratory criterion: conditional direct resource exceeds each of direct officer, direct wealth and residual output in every scenario. Among 96 charts, 14 meet it: nine strong directional references, one disputed and four extreme-chapter review-required references. None of the weak directional references meet it. W23 is excluded, but so is R10, a strong reference. This is not a classifier, not independent evaluation; all labels were previously inspected. The result must not be reported as validated accuracy. Direct officer/wealth omit remote and indirect effects; the criterion is asymmetric and not a complete strength model.

Next: compare a joint decision hypothesis with root capacity, external peer support, and category-specific pressure, retaining R10 as a counterexample and extreme/disputed records outside ordinary metrics. Assess alternative route priorities and sensitivity before final multiaxis v3. No consumer migration.
