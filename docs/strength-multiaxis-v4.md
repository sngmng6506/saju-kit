# Strength v4: season-robust resource confirmation

## Decision

Retain v3 and all earlier policies as historical baselines. Add opt-in `strength-multiaxis-v4` as the E4 candidate; no default migration. The v4 wrapper may abstain from a v3 strong hypothesis based solely on resource paths. It never promotes an abstention, reverses a direction, or overrides a conflict. Central-root strong, weak, and provisional/partial decisions remain unaffected. The neutral-season analysis is run only when required, and must confirm strong with at least one identical named resource ground. The second diagnostic context is propagated through quantitative, multiaxis, route-budget and capacity calls; default season factors are unchanged.

## Ablation, frozen v3 at 88a74e9fe7867f3897f0e9c29b8ed6cd333cbb9e

86 exposed directional cases (61 primary, 25 secondary), actual pinned source in isolated V8 graphs. A throwing unused calendar stub was substituted for complete charts. E0 original, E1 remove nominal resource strong ground, E2 remove bounded-route strong ground, E3 remove both, E4 preserve both but require same-ground neutral-season confirmation only for non-central-root strong.

| Group | E0 | E1 | E2 | E3 | E4 |
|---|---|---|---|---|---|
| Primary 61 (agree/disagree/abstain) |34/2/25|33/1/27|34/2/25|30/0/31|34/0/27|
| Secondary 25 |8/1/16|8/0/17|8/1/16|8/0/17|8/1/16|
| All 86 |42/3/41|41/1/44|42/3/41|38/0/48|42/1/43|
| Zhang ordinary 8 |3/2/3|3/1/4|3/2/3|2/0/6|3/0/5|

Only changes across E0–E4 (S strong, W weak, - abstain):

| ID | E0 | E1 | E2 | E3 | E4 |
|---|---|---|---|---|---|
| W01 |S|S|S|-|S|
| W02 |S|-|S|-|S|
| W20 |S|S|S|-|S|
| ZN01 |S|S|S|-|-|
| ZN02 (uncertain) |S|-|S|-|S|
| ZN05 |S|-|S|-|-|
| ZN08 |S|S|S|-|S|

E4 keeps 34 primary agreements and converts 2 disagreements to abstentions, not correct weak decisions. Coverage decreases from 36/61 to 34/61. Secondary ZN02 remains a disagreement. E3 loses four correct primary confirmations. No fresh holdout: all 86 are now exposed. Zero observed primary disagreement is not a calibrated error probability.

## Implemented source verification

At 25a6770e8523efc020fdf62ceb19037670206e9b the actual new v4 and refactored v3 were re-executed in V8 (20 fetched source modules plus throwing calendar stub). All 86 pairs match the recorded E0 and E4 outcomes; baseline decisions also match within the new v3/v4 pair. Seven charts require the neutral check; two are blocked (ZN01, ZN05). Provisional chart returned null without gate. Native Node regression and missing-hour calendar integration remain unexecuted here.

Reproduce: `node scripts/evaluate-strength-strong-paths.mjs`, `node --test test/strength-multiaxis-v4.test.mjs`, `npm test`.

Next: prospectively freeze new cross-author charts with both resource-based strong and weak labels, test v4 without tuning, then decide default migration. Continue to treat season-neutral as a sensitivity stress test, not an alternative classical doctrine. Weak-veto removal remains a separate experiment.
