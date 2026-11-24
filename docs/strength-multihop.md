# Multi-hop interaction v1 — bounded path reservation

Implemented ef7b503543c1d7e5dd1ec6509cb99b7e4a27ee56; graph adapter corrected f157db8c476ebf1357dc3df8a95f5073b008981c. Research-only diagnostic, no changes to existing strength or route-budget APIs. No new fitted coefficients.

## Contract
A generation path ends at day:stem and is resource->day, officer->resource->day, or wealth->officer->resource->day. Intermediate officer/resource nodes must be anchored; direct resource must be anchored. Source officer/wealth may be unanchored. Direct wealth/officer burdens and wealth->resource / resource->output control paths compete with generation. Distinct physical slots are required for generation paths; no cycle or repeated node. Adjacent means each edge distance <=1; one-gap permits <=2, a locality sensitivity, not a proven effective path.

Split each origin's nominal mass equally across eligible paths (deterministic integer remainder). Compute total requested demand at every non-day node, including origins, intermediates and control targets. For path p reserve floor(request[p] * min(1, capacity[n]/demand[n] over p's non-day nodes)). Exact integer arithmetic; no redistribution, deterministic order; sum of accepted reservations at any node <= nominal capacity. This is conservative proportional reservation, not max flow or measured energy transfer. A unit reserved along several nodes is one origin unit, not multiple units of generated resource.

The diversion-only margin is nominal peer+resource minus max(output, wealth minus completed wealth-origin generation reservations, officer minus completed officer-origin generation reservations). Do not add delivered units to resource. Control reservations compete for capacity but are not subtracted as actual cancellation. Nominal resource support is intentionally held fixed in this stress test; the margin is not a conserved final force ledger or an effective-strength estimate. Resource-route exposure, clashes, combination transformations and conversion efficiency remain unresolved. No directional result.

## Actual execution
100 historical directional charts, both season contexts, both locality policies. Actual source graph in V8 (15 fetched modules plus unused throwing calendar stub). 11,808 scenario rows; 131,280 path allocations; 83,616 ledger entries checked for capacity and accounting. Synthetic shared bottleneck r=40: requests 50/50/50, accepted 13/13/13, reserved 39. Reversing input path order gives identical output.

| Locality | Charts with wealth-officer-resource-day paths | Positive minimum reservation | Standard nominal pressure dominance lost after diversion |
|---|---:|---:|---:|
| Adjacent |17|17|0|
| One-gap |35|35|0|

H01 has zero complete adjacent three-edge paths; one-gap permits four, wealth-origin reservations 2.980880–4.910608 million nominal units standard, 4.145514–5.402204 neutral. Standard margin changes from -52.78..-26.73 to -49.799120..-21.819392; neutral from -26.70..-13.55 to -22.554486..-8.147796. Still uniformly pressure-dominant. No explanation of textual strong label. W09 (weak reference) loses uniform pressure under neutral diversion in both locality variants, while H01 remains pressure-dominant. Of ten earlier P1 promotions, nine remain pressure-dominant in both seasons (H01 wrong, eight matching); W09 matching promotion would be lost. Requiring multi-hop diversion pressure is not supported as a guard. ZN01/ZN05 remain important nominal-support counterexamples.

## Decision
Keep diagnostic isolated, no migration or new strong/weak authority. Do not tune locality or conversion weights to H01. The path model adds traceability and conservative accounting, not demonstrated predictive benefit. Prior seated-resource guards and pressure candidate remain research-only. Next focus on source-authenticated prospective validation; if extending interaction modeling, isolate resource exposure versus throughput competition and compare without fitting a chart-specific rule.

[Results](strength-multihop-results.json). Native replay and full integration tests added but not executed here.

`node scripts/evaluate-strength-multihop.mjs`
`node --test test/strength-multihop.test.mjs`

Historical textual agreement does not establish scientific predictive validity.
