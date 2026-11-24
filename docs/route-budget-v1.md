# Route budget v1 (experimental)
Opt-in `analyzeRouteBudget({saju,policy:'route-budget-v1',birthBasis:'verified-chart'})`. Composes frozen quantitative v3 and support network v1. Nominal mass per actual occurrence, aggregating same-element hidden stem contributions once. Allocate each resource, officer and wealth node's mass at most once across unique eligible local destinations. Anchored local resource nodes are eligible for direct day support and local output control. Officer and wealth can allocate to local day relations or eligible resource nodes. Nonlocal relations, non-anchored resource sources, and other categories remain outside the allocation; unused mass is not proof of zero influence. The source budget is split equally over destinations, integer remainder assigned in sorted ID order. No target capacity constraint, no iterative flow, no physical transfer, no generation multiplier. Officers allocated toward resources are not added to resource mass. Two variants: all-local output targets versus anchored output targets only; the officer/wealth destination set is identical. These are scenario assumptions, not classical rules. A resource route is conditionally retained when allocated wealth <= its own mass; report its allocated direct contribution. No actual cancellation or net pressure is inferred. Source mass shared across routes is not duplicated. Different source nodes may share roots; independence is not asserted.

Complete output contains per-scenario budgets, allocations, routes and marginal ranges for directResource, conditionalResource, officerResource, directOfficer, directWealth, outputControl (nominal points = integer units / 1e6). Partial/provisional returns null analysis. No final strength, special pattern or yongsin. Earlier policies unchanged.

## Verification
Four test bodies checked via V8 source adapter, 48 Tokyo calendar charts and 4,608 allocation scenarios; original source mass, per-source allocation, unique targets, integer remainder, resource partition, partial and provisional checked. 39 Wei/Ran-Yuan charts, 2,304 scenarios, checked with unused calendar import stubbed for complete pillars. Native Node suite not executed.

| Case | Label | Conditional direct resource | Officer to resource | Direct officer | Direct wealth |
|---|---|---:|---:|---:|---:|
| R10 | strong | 16–20.79 | 5.83–12.266667 | 4.43–9.973333 | 0 |
| R11 | strong | 14.483333–33 | 21.7–34.79 | 8–14 | 0 |
| W23 | weak | 5.666667–8.55 | 0 | 0 | 2.2–3.24 |
| W24 | weak | 0–4.14 | 0 | 0 | 8.25–10.8 |
| Y01 | weak | 0 | 0 | 63–82.6 | 0 |

Across all scenarios, conditional direct resource exceeds each direct officer and wealth allocation in 11 of the 39 charts (10 strong labels, W23 weak). This criterion ignores output drain and remote pressure; W23 has output control allocation 7–10.05 but that is not proven neutralization. Do not promote this rule to a classifier. The two allocation variants are not exhaustive or calibrated. Next compare output pressure and potential control using explicit target-side capacity and alternative priority assumptions, retain matched counterexamples. No multiaxis v3 integration or consumer migration until justified.

## Follow-up
[Output capacity v1](output-capacity-v1.md) bounds non-day incoming allocations and includes output pressure. No classifier changes.
