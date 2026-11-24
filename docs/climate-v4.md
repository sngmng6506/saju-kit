# Climate source v4 and literal predicates

Checkpoint: 5c8c475. Explicit opt-in: analyzeClimateUsefulElementV4({saju,birthBasis,birth?,policy:'climate-useful-element-v4'}). Prior policies remain fixed.

57 new cells from [NCC electronic Qiongtong Baojian](https://www.ncc.com.tw/fate/paleo/bg/bg_11.htm), accessed 2026-11-25. The prior pinned Wikisource revision could not be directly retrieved in this session; do not pretend this is the same edition. All previous 63 source rows preserved. 120/120 lookup coverage means a selective source review exists, not an independent unambiguous prescription in every month. Yi-Chou is a shared winter passage without independently verified month-specific prescription. Jia-Mao, Bing-Hai, Ding-Wu, Ren-Wei and Gui-Chen have no unconditional first group; Ren-Wei records conflicting textual order. Source groups are selective abstractions and need further editorial review; special patterns are not adjudicated.

V4 reuses the v3 review pipeline. The temporal comparator recognizes Grain Rain (index 7) for Gui-Chen; equality remains unresolved. StructuralConditions adds literal exact stem presence/absence and visibility observations only, with three-valued logic and AND for explicit compound predicates. No numerical weights or final authority. Missing hour cannot prove absence. An observed predicate never confirms a remedy.

Executed actual source v1-v4 and condition modules in isolated JS after removing ESM declarations: 120 lookups, 63 prior rows equal, 10 conditional-only cells, 125 alternatives, mutation isolation and complete/partial condition examples passed. Native full regression and calendar integration not executed (container DNS blocks GitHub clone). Added native tests:

```sh
node --test test/climate-v3-authority-transit.test.mjs test/climate-v4.test.mjs
npm test
```

Authority/transit v2 intentionally remain on v3. Next: native regression, editorial cross-check, then versioned authority/transit integration and independently annotated useful-element cases. Textual fidelity is not empirical predictive validity.
