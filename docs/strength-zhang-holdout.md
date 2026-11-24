# Zhang Nan targeted unseen-author evaluation

Frozen labels: e974413c2d73c8373422c9fd1517616cba3b4e7e. Frozen engine: c2367480ce05105c657e5d787ffa5f64cc66dc2f. [Fixture](../test/fixtures/ordinary-zhang-holdout-v1.json); [results](strength-zhang-holdout-results.json). Sources: 神峰通考 印綬格 and 傷官食神格, electronic reference edition, not authenticated facsimile. Source-only purposive sampling, not a random or consecutive sample; no engine results observed before fixture commit. 10 distinct new pillar sequences relative to 108 historical charts; 8 ordinary candidates and 2 uncertain. Evaluation was actual pinned source in V8, 40 calls, not native Node integration.

| Group | A | B | C | D |
|---|---|---|---|---|
| Ordinary 8, agree/disagree/abstain | 3/2/3 | 3/2/3 | 3/0/5 | 3/0/5 |
| All 10 | 3/3/4 | 3/3/4 | 4/1/5 | 4/1/5 |

A/B wrongly classify ZN01 and ZN05 as strong relative to the source's weak label; C/D abstain, not correct to weak. ZN02 is uncertain due to within-month timing and all four disagree. ZN03 is uncertain and neutral season yields agreement. No resource weak-veto fires in A; removal has no effect. Strong controls do not establish safety specifically at the veto decision boundary.

Do not modify labels or rules to fit these results. These cases are now exposed development/diagnostic cases, not future independent holdout. Earlier primary 53 and new 8 may be combined descriptively only: A 34/2/25, B 35/2/24, C 33/0/28, D 34/0/27. Coverage and conditional agreement must both be shown. The new sample demonstrates that season-sensitive false confirmations are possible, not that removing season is generally superior. Preserve A runtime pending diagnosis; B is not approved. Next: trace the integrated strong path, nominal versus conditional output/resource contributions and scenario dominance in ZN01/ZN05, then evaluate a prospectively frozen independent set. Avoid adding case-specific exceptions. Native Node regression remains open.

Historical textual agreement is not scientific predictive validity of astrology.
