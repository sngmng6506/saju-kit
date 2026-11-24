# Useful element authority/transit v3: isolated source observations

Public opt-ins: analyzeUsefulElementAuthorityV3 and analyzeUsefulElementTransitV3. Inputs as v2, with respective explicit policies useful-element-authority-v3 and useful-element-transit-v3. The v2 authority and its review.methods (including climate v3) are kept verbatim as the anchor basis. V3 adds a separate sourceReview containing climate v5 and source candidates. Do not treat the 57 new cells as validated anchor hypotheses. Baseline group and conditional alternative IDs are unique within each sourceReview; preserve exact stem identity, original order and condition evidence. SourceReview candidates are not confirmed, nor do they receive authority.

Transit v3 reuses v1 orchestration and v2 conditional arrivals. It adds per-year sourceReviewArrivals keyed by candidate ID. For each stem and layer, observe exact and same-element arrivals, natal root branch signals and actual combinations with exact non-day natal visible stems. Root contacts are structural exposure only. Do not equate them with root loss, supply or transformation. Natal source predicates are not evaluated using transit dates. No scores, final useful/favorable/unfavorable elements or event predictions. Existing annual and decadal calendar conventions unchanged.

Isolated execution: actual transit observation graph, source candidate projection and arrival modules, and the unchanged v2 pure arrival function (unused wrapper excluded) in JavaScript; 60 annual pillars with and without a decadal layer, 720 requirement checks, 1230 root contacts, 54 combination contacts; exactness, contact linkage, abstention and immutability passed. Native wrappers and full regression not executed; tests added. Fixture chart is a synthetic pillar combination, not a historical case.

```sh
node --test test/climate-v5.test.mjs test/useful-element-source-transit-v3.test.mjs
npm test
```
