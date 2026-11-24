# Zhang holdout: decision-path diagnosis

Pinned source: c2367480ce05105c657e5d787ffa5f64cc66dc2f. The already exposed Zhang cases are now diagnostic, not fresh holdout. No production source changes.

Executed actual v1, v2, v3 and output-capacity modules in isolated V8 graphs for eight complete charts, with the original season factors and the guarded neutral-season substitution. Calendar stub throws if reached; it was not invoked. Ranges below use nominal units divided by 1e6 and rounded to two decimal places. They are not probabilities or calibrated physical quantities.

## Trace

| Case | Root range | Central principal root | v1/v2/v3 | Nominal support wins | Bounded support wins | Neutral v1/v2/v3 |
|---|---|---|---|---|---|---|
| ZN01 | 35.5–44.25 | no | abstain/strong/strong |24/24|48/48|abstain/abstain/abstain|
| ZN05 | 37.5–47.25 | no | abstain/strong/strong |24/24|32/48|abstain/abstain/abstain|
| ZN02 (uncertain) | 17.5–29.25 | no | abstain/strong/strong |24/24|21/48|abstain/strong/strong|
| ZN08 (strong control) | 55–57.75 | no | abstain/strong/strong |24/24|48/48|abstain/strong/strong|
| ZN09 (strong control) | 40–50 | month | strong/strong/strong |13/48|4/96|strong/strong/strong|
| XU07 (weak veto case) | 5–5 | no | weak/abstain/abstain |0/48|0/96|weak/abstain/abstain|
| H04 (weak control) | 5–9.75 | no | weak/weak/weak |0/24|0/48|abstain/abstain/abstain|
| R07 (strong, season-sensitive) | 37.5–39.5 | no | abstain/abstain/abstain |13/48|13/96|abstain/strong/strong|

| Case | Season | Nominal resource | Nominal output | Nominal support minus largest burden | Conditional resource | Output control | Residual output | Bounded support minus largest burden |
|---|---|---|---|---|---|---|---|---|
| ZN01 | original |36.60–57.54|20.70–31.96|5.84–36.84|10.20–25.83|9.90–29.02|0–14.40|2.20–15.03|
| ZN01 | neutral |30.50–41.10|34.50–39.95|-7.95–6.60|8.50–18.45|16.33–27.55|8.05–21.53|-7.95–3.10|
| ZN05 | original |43.80–64.40|20.10–33.40|12.40–43.82|7.60–12.83|14.87–21.08|2.77–16.36|-8.60–10.07|
| ZN05 | neutral |36.50–46.00|33.50–41.75|-2.95–11.70|6.33–9.17|12.67–18.33|15.97–27.45|-20.45–-6.80|

Both cases have zero visible peer mass; nominal support equals nominal resource. All comparisons are matched within a scenario, not cross-products of independent extrema.

## Mechanism

1. v1 cannot give a central-root strong ground to either chart because neither has a principal month/day peer root. Weak requires root max <=20 plus a central burden and robust nominal pressure. Neither satisfies that root limit.
2. v2 independently adds local-resource-and-robust-support if an unchallenged anchored local resource exists, root min >0 and nominal support exceeds each burden in every scenario. Original season multipliers boost spring wood or summer fire (resource here) and suppress the output element. ZN01 and ZN05 pass 24/24.
3. v3 starts with all v2 grounds and can add bounded-route-support; it does not withdraw nominal support grounds when the route model fails. ZN05 has bounded support in only 32/48 scenarios yet remains strong solely via v2. ZN01 passes both grounds (48/48 bounded wins). Thus removing only the nominal ground would not resolve ZN01. Neutral season yields 8/24 and 16/24 nominal wins, respectively, and 10/48 and 0/48 bounded wins; both lose strong grounds.
4. The equal-split route model is hypothetical. Its cap prevents arithmetic over-allocation but does not establish actual resource-to-output control. ZN01 passing it is not proof of actual strength. The comparison uses the largest individual burden, not their sum. This is an intentional but unvalidated modeling choice; changing it needs independent evaluation.

## Scope and controls

ZN08 is an agreeing resource-based strong case with robust nominal and bounded dominance under both season settings. ZN09 is an agreeing central-root strong case even though bounded dominance fails; a global bounded-support requirement would threaten an independent decision path. H04 loses a correct weak direction when season is removed. R07 gains nominal strong under neutral season but fails robust bounded support (80/96). Therefore neither a universal season removal nor a global mandatory bounded-support gate is justified.

ZN02 is uncertain due to within-month timing; keep separate. Its nominal route remains strong even under neutral season, so a single season explanation cannot cover all disagreements. XU07 is a separate weak-veto question, not the mechanism of these false confirmations.

## Next experiment (not executed here)

Run a frozen factorial extension on all existing ordinary charts: nominal resource strong ground enabled/disabled crossed with bounded-route strong ground enabled/disabled, holding season fixed, plus a matched-season sensitivity diagnostic. Distinguish central-root, nominal-resource, and bounded-route evidence; compare false confirmations, correct confirmations lost, and abstentions per source. No case-specific thresholds. Do not call improvement on exposed cases independent. In particular preserve baseline weak veto for this experiment, so its effect is not confounded. Only then select a candidate for a new untouched source sample. Native Node regression still required.
