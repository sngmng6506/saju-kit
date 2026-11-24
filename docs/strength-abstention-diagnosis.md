# Abstention diagnosis — separated decision v1

Engine d198db59c7abf47d278b9db20473c1f8d2a91c9d. Existing 100 directional references, 71 primary and 29 secondary. Actual committed separated decision and v1 source re-executed on all 50 recorded abstentions using isolated V8 bindings (20 fetched source modules plus unused throwing calendar stub). All remain unresolved. No new holdout, no runtime changes.

## Mutually exclusive diagnostic buckets

| Bucket | Primary (strong/weak reference) | Secondary (strong/weak reference) |
|---|---|---|
| Existing conflict |6 (1/5)|3 (0/3)|
| No ground, all scenarios pressure-dominant |16 (4/12)|4 (2/2)|
| No ground, low root but not all pressure-dominant |4 (1/3)|4 (3/1)|
| Other absent grounds |6 (5/1)|7 (6/1)|

Conflicts take precedence; flags are independent observations. Pressure dominance means the largest individual burden exceeds external support in each matched scenario, not a calibrated probability of weakness. No-ground primary cases all have at least one central burden; none have robust nominal support dominance. All 16 pressure-dominant primary cases fail the low-root cutoff; all have a fixed dominant category across scenarios. The latter is an observed property of this subset, not a mathematical equivalence.

## Pressure-based promotion diagnostic (not a new engine)

On the 16 primary pressure-dominant no-ground cases, assigning weak would produce:

| Filter | New agreements | New disagreements |
|---|---|---|
| All |12|4|
| Fixed dominant category |12|4|
| Concentrated burden |10|4|
| No unchallenged local resource |8|3|
| Concentrated and no unchallenged local resource |6|3|

These are retrospective subset counts, not an independently evaluated policy. W03/XU11/XU16/ZW12 are strong reference counterexamples. Pressure concentration does not resolve them. Do not loosen the low-root threshold or make pressure a standalone weak authority on this evidence.

## Conflict cases (primary)

W24 and ZW10: concentrated pressure contradicts structural strong; both references weak, but resolving conflict into weak requires independent grounds. XU07: existing resource weak veto, weak reference. ZN01 and ZN05: seasonal sensitivity blocks false strong; retain. ZW03: seasonal sensitivity blocks a matching strong; peripheral authority experiment can restore, not yet independently validated.

## Priority

1. Diagnose external-support and pressure comparisons in the 16 pressure-dominant cases; distinguish root capacity from rooted peer access, and examine four strong counterexamples alongside the weak cases. Compare how the model represents support without double-counting peer roots. No new fitted cutoff.
2. Examine six other no-ground primary cases, five strong and one weak. H05, R07, R11, XU25, ZN07 are possible strong-coverage diagnostics; H06 is the weak control. Do not equate the presence of resource with actual transfer.
3. Examine four low-root mixed cases (W08, L98, L77, L96), where low root alone cannot resolve the direction; L77 is strong in the text.
4. Retain all existing conflicts and default policies. The six conflicts include two known prevented false confirmations, so simply removing all vetoes would be unsafe.

[Case-level diagnostic flags](strength-abstention-results.json). Native replay and full regression not executed here. Historical textual agreement does not establish scientific predictive validity.

`node scripts/evaluate-strength-abstentions.mjs`
`node --test test/strength-abstentions.test.mjs`
