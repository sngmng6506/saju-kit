# Classical strength reference evaluation — development set v1

Status: development comparison; not a holdout test or empirical validation.

## Sources and labels
- [滴天髓闡微 衰旺](https://m.gushiwen.cn/guwen/bookv_4d7a9cd02bf6.aspx), also [Wikisource](https://zh.wikisource.org/zh-hant/滴天髓闡微#十七、衰旺): all 20 consecutive charts in the section, selected by the commentator to illustrate extreme/overly strong and weak configurations. Preserve direction, degree, and ordinal independently. Engineering target is review-required, not a claim that every case is a confirmed special格. In DW18 the extreme direction/degree is inferred from the chart's commentary and the chapter context, not a literal label. DW07 is weak within the chapter's extreme set, without silently adding a degree to its commentary.
- [形象](https://zh.wikisource.org/zh-hant/滴天髓闡微#十、形象): three selected cases in the discussion of restraint/support. DX01 is an inferred strong case (strong autumn metal, weak officer); DX02 and DX03 are explicit weak cases.
- [中和](https://zh.wikisource.org/zh-hant/滴天髓闡微#十八、中和), [alternate text](https://guoxue3000.com/tw/books/378/chapters/21): both cases. One balanced, one weak despite the favorable month.
- [源流](https://zh.wikisource.org/zh-hant/滴天髓闡微#十九、源流): first case, explicitly balanced.
- [子平真詮 論十干得時不旺失時不弱](https://luckclub.cn/bazi/002/008/): theoretical contrast between seasonal advantage and structural strength; not included as fabricated four-pillar examples.

Only four-pillar sequences, source pointers, strength direction/degree, label provenance and split are stored. No biographical predictions or claims about actual lives. A published chart is treated as a textual input, not independently authenticated birth data. Modern expert annotations remain unavailable. All 26 records are development cases, not held-out examples. A balanced classical description is not equated with the product's mixed candidate; these cases are descriptive only.

## Reproduce
```sh
node scripts/evaluate-strength-reference.mjs
node scripts/evaluate-strength-reference.mjs --json
node --test test/strength-reference.test.mjs
```
Input: [fixtures](../test/fixtures/strength-ditiansui-v1.json). Exact v1 comparison: [baseline](../test/fixtures/strength-ditiansui-v1-baseline.json). The comparator converts only the published Han characters to the existing Korean pillar API; it does not calculate dates or introduce invented birth times. V1 runtime is unchanged. A subsequent policy must use an explicit version and its own baseline rather than overwrite this one.

## Baseline on engine 472667b

| Reference / outcome | Count |
| --- | ---: |
| Extreme chapter, review detected | 15 |
| Extreme chapter, no review flag but abstained | 4 |
| Extreme chapter, no review flag and candidate | 1 |
| Ordinary-direction comparison, abstained | 4 |
| Balanced descriptions, descriptive only | 2 |

Review detection 15/20; conservative non-candidate 19/20. Neither is a clinical/statistical measure or a general strength accuracy score. No ordinary-direction cases produced a candidate (0/4), so conditional agreement is undefined. No source case is an independent evaluation set for subsequent tuning.

## Diagnostic examples

| ID | Published pillars | Reference | Qualitative | Range | Gate |
| --- | --- | --- | --- | --- | --- |
| DW01 | 甲辰 丁卯 甲子 戊辰 | overstrong | Q1 strong | 58.25–72 | unresolved |
| DW09 | 戊辰 戊午 戊申 己未 | overstrong | Q1 strong | 72.8–75.5 | strong candidate |
| DX01 | 丁丑 庚戌 庚子 甲申 | inferred strong | Q1 strong | 48–55.8 | unresolved |
| DX02 | 庚申 辛巳 丙辰 乙未 | weak | Q1 strong | 34–38.85 | day stem combine review |
| DX03 | 壬子 癸丑 丙午 壬辰 | weak | Q0 unresolved | 15.5–18.3 | root/month clash review |
| DH01 | 辛巳 甲午 癸卯 癸亥 | balanced | Q5 mixed | 21.4–31.25 | root/month clash review |
| DH02 | 己酉 丙子 癸未 戊午 | weak | Q5 mixed | 35–43 | combination/clash review |
| DL01 | 辛酉 庚子 丙寅 癸巳 | balanced | Q0 unresolved | 23.5–31.4 | day stem combine review |

Interpretation:
1. DW09 exposes the limit of detecting possible exceptional structures from a support-index cutoff alone: dense rooted peer/resource structure passes the ordinary gate despite the source's overstrong description. That does not establish a confirmed following pattern.
2. DX02 exposes an independent structural issue: Q1 is satisfied by season, one principal root, and anchored resource even with five burden slots. Source emphasizes rooted wealth and harmed resource. A more permissive numeric gate would not solve that conflict.
3. DX03 shows an actual root does not imply sufficient strength against concentrated officer pressure. Root clashing is not automatic root destruction.
4. DH01/DL01 show the difference between source balance through flow/mediation and a static support index near the middle. Do not equate balance with a numeric midpoint.

## Proposed next increment (not implemented)
Do not tune 30/70 or 15/85 on this selected corpus. First isolate explanatory signals with separate versioned contracts:
- rooted opponent dominance, separated by wealth/officer/output, instead of relying on a count of burden slots;
- resource vulnerability (wealth controls resource) and support chains (officer produces resource, resource produces day master), with actual positions and root evidence; no inferred cancellation or strength transfer;
- dense peer/resource dominance and absence/weakness of opposing groups as exceptional-pattern review evidence, without automatically assigning a special格;
- review scope: distinguish potential combination/clash from unresolved material impact on strength. Preserve conservative v1 gate; compare a separate experimental policy on development plus independently curated unseen cases.

Add independent ordinary strong/weak cases from other chapters/books and separate review labels before selecting any altered decision rules. Include sources where authors disagree; preserve unresolved cases. The chapter set is deliberately extreme-heavy and must not be used as a population distribution. No yongsin, UI or consumer update.

## Verification
The comparator and actual v1 source modules were executed in a V8 environment using an import/export adapter. All 26 inputs evaluated successfully and the baseline was saved. Native Node runner/full npm regression and independent expert review remain pending. The new regression test freezes known limitations intentionally; it does not assert the classical interpretations are objectively correct.
