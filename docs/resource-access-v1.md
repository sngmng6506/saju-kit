# Resource access v1 (experimental)

Opt-in `analyzeResourceAccess({saju,policy:'resource-access-v1',birthBasis:'verified-chart'})`. Composes support-network v1 and frozen quantitative v3. No changes to earlier strength models. The intended distinction is resource presence versus local availability under hypothetical wealth exposure, not actual transfer of strength.

For each quantitative scenario, aggregate contributions by actual node identity (stem position, or branch position and element). Same-element hidden stems within one branch share the graph node; their assigned masses are added once. Only resource nodes with a direct local generation edge to day stem enter local resource mass. Retain anchored subset separately. For each local resource node, sum unique local wealth controllers, officer generators and controlled output nodes separately. A wealth-exposed route is one whose local wealth mass strictly exceeds its own resource mass in that scenario. Sum each exposed resource node once. Accessible = local minus exposed is an exposure-conditioned diagnostic, NOT actual residual power. Officer and output totals are contextual only, never added or subtracted. A controller can appear against multiple resources, so route-level controller totals must not be summed across routes. No capacity allocation or confirmed cancellation. No final direction, special-pattern classification or yongsin.

Output: status diagnostic/partial/provisional; analysis null for partial/provisional. Complete analysis contains resources (IDs, anchored, wealth/officer/output neighbor IDs, element), rows (profile, totalResource, local, anchoredLocal, exposed, accessible, routes), ranges in nominal quantitative-v3 points (integer units / 1e6), routeDiagnostics (resource/wealth/officer ranges and all/some/none exposure). Per-row masses are integer units. Ranges are marginal, not simultaneous extrema. The day stem is not assigned mass. All hypotheses inherit unvalidated seasonal/root/position weights. Locality is pillar-column distance <=1, not physical distance or measured influence. “Accessible” means only that the specified strict wealth-mass test did not exclude a node, not that its support succeeds.

## Verification
Four new test bodies checked in V8 source adapter (including resource-free fixture corrected to 辛酉 辛酉 乙酉 乙酉; 申 contains water and is not resource-free for wood). Actual calendar inputs 48, 2,304 scenarios. All rows partition local resource mass and retain original resource totals. 39 Wei/Ran-Yuan textual inputs, 1,152 scenarios, evaluated with unused calendar helper stubbed only for full-pillar evaluation. Native Node suite remains unrun.

| Case | Label | Local resource | Anchored local | Exposure-conditioned accessible |
|---|---|---:|---:|---:|
| R07 | strong | 17.7–33.03 | 17.7–33.03 | 0–33.03 |
| R10 | strong | 20–28.08 | 20–28.08 | 20–28.08 |
| R11 | strong | 37.4–53.94 | 32.45–48.54 | 37.4–53.94 |
| W02 | strong | 38.5–54.9 | 38.5–54.9 | 38.5–54.9 |
| W22 | weak | 19.25–22.8 | 19.25–22.8 | 0–0 |
| W23 | weak | 14–17.1 | 14–17.1 | 0–17.1 |
| W24 | weak | 11.44–19.71 | 6.4–12.42 | 0–12.42 |
| Y01 | weak | 11.55–15.12 | 0–0 | 11.55–15.12 |

Y01 illustrates why accessible mass alone cannot classify strength. R07 illustrates scenario sensitivity even for a strong textual label. R10 and R11 retain local resources with no wealth-dominant exposure; local officer generation is also observed. These are development observations, not a validated strength rule. No model tuning or consumer migration. Next compare anchored accessible resource and officer pressure jointly, without double-spending shared source mass; test against matched weak cases and new references.

## Follow-up
[Route budget v1](route-budget-v1.md) examines competing source allocations; W23 prevents adoption as a strength rule.
