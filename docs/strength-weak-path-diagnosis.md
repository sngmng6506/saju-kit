# Weak-path diagnosis and guard sensitivity

Source snapshot: 677b58f59a44f36535b6af88f663dcb6515bb075. No production policy change. The six Lin holdout cases are now exposed. The original fixture and label eligibility are retained.

## L82

辛酉 庚寅 庚子 丙子. The scan of 人鑑 printed p.82 (PDF index 88) was rechecked: the author explicitly applies a strong-day-master maxim to the case, but discusses concealed resource, blade/killer and virtual Chou arching as well. Treat as a historical textual disagreement, not an empirical ground truth. [Scan](https://upload.wikimedia.org/wikipedia/commons/4/41/NLC416-17jh001751-107289_%E4%BA%BA%E9%91%92.pdf).

Actual v1/v2/v3 decisions: weak/weak/weak. v4 leaves weak unchanged. Root range 10–15; year branch principal root, no clash; month/day/hour no peer root. Month/day principal burdens. Visible rooted peers in year and month. Dominant output, no eligible local resource veto. All 24 nominal scenarios favor pressure; even adding branch peer mass to support, all 24 still favor pressure (margin 0.71–19 nominal units). Neutral season remains weak.

| Case | Root range | Principal root | Standard v3 | Neutral v3 | Pressure dominates including peer root |
|---|---|---|---|---|---|
| L82 |10–15|year, no clash|weak|weak|24/24|
| H04 |5–9.75|none|weak|abstain|24/24|
| XU12 |14.5–16.75|none|weak|abstain|24/24|
| L76 |5–5|none|weak|weak|24/24|
| W05 |0–0|none|weak|weak|24/24|
| XU07 |5–5|none|abstain|abstain|48/48|
| L91 |0–0|none|weak|weak|24/24|
| ZN04 |8–8.75|none|weak|weak|24/24|

## Retrospective candidate comparison

19 charts actually re-executed (16 standard weak and 3 newly weak when existing resource veto removed); 73 remaining outcomes carried forward from recorded results because the tested guards act only on weak hypotheses. Actual source in V8, unused throwing calendar stub. 92 directional charts, 65 primary and 27 secondary. [Detailed results](strength-weak-path-results.json). Candidate guards are diagnostic only.

| Group | G0 | G1 any principal | G2 unclashed principal | G3 local rooted peer sharing intact principal | G4 neutral v3 confirmation | G5 include peer-root mass |
|---|---|---|---|---|---|---|
| Primary agree/disagree/abstain |35/1/29|35/0/30|35/0/30|35/0/30|33/1/31|35/1/29|
| Secondary |8/1/18|7/1/19|7/1/19|7/1/19|7/1/19|8/1/18|
| All |43/2/47|42/1/49|42/1/49|42/1/49|40/2/50|43/2/47|

G1–G3 have identical observed transitions: L82 weak to abstain (disagreement removed), XU19 weak to abstain (agreement lost). XU19 丁亥 癸卯 癸卯 甲寅 likewise has an intact year principal root and a month peer rooted there. Xu explicitly acknowledges rooting in Hai but cites Hai-Mao combination and strong drainage to judge weakness. [Source, 論食神取運](https://luckclub.cn/bazi/002/040/). Formation dependence makes it secondary, not irrelevant. G4 loses H04 and XU12 primary agreements and H03 secondary agreement without addressing L82. G5 changes no standard weak decisions.

The supplemental no-veto sensitivity is derived from prior no-veto outputs and observed weak-path checks, not a fresh crossed v4 experiment. G4 uses neutral v3 with the veto retained. The native replay script additionally runs full no-veto v4 and reports its outcomes separately. No native Node execution claimed here.

## Decision

Retain opt-in v4 and the existing weak veto. Do not adopt G1–G3 simply because the primary error count becomes zero on exposed data. They are indistinguishable on this sample, remove one known secondary agreement, and have no untouched boundary evidence. Do not add location-specific weights or thresholds fitted to L82. G4 and G5 are not useful for this disagreement.

Next freeze an independent-author targeted source set including explicit natal weak and strong cases with principal roots outside month/day, rooted visible peers, and varying output/control pressure. Record ordinary/formation/auxiliary-method dependence before evaluation. Include source-text consecutive cases as a separate coverage track where feasible. If the sample has no contrasting weak-path cases, retain v4; do not claim equivalence. Prioritize native Node regression of the current code before any new runtime policy.

Reproduce: `node scripts/evaluate-strength-weak-paths.mjs` and `node --test test/strength-weak-paths.test.mjs`. These are newly added and not executed in native Node here. Historical textual agreement does not establish scientific predictive validity.
