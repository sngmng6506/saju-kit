# Climate v3, authority v2 and transit v2

## Context
Prior checkpoint d5a45a73d5cae733fcc91eab3c57cbf146df60b8 had 38 source cells, an explicit withheld authority policy and conditional annual/decadal anchor observations. Preserve all three earlier APIs and their recorded regressions. This checkpoint does not authorize a final useful element, favorable/unfavorable element, score or event judgment.

## Source expansion
Electronic witness [窮通寶鑑, revision 2294674](https://zh.wikisource.org/w/index.php?title=穷通宝鉴&oldid=2294674). Selected explicit passages in 三秋甲木, 三春/夏/秋/冬乙木, 三秋己土, 三冬壬水, 三春/冬癸水. New source cells 25; old 38 returned unchanged by the table lookup. 63/120 covered, of which four conditional-only (Yi-Wu, Yi-Wei, Yi-Shen, Yi-You). 32 alternatives across 20 cells; no inferred missing months. The new source profiles distinguish shared seasonal passages from month-specific passages, preserve stem identity and textual order, and keep alternatives with their own conditions and groups. The source is a seasonal-use text that includes other doctrines; no claim that all groups are pure climate prescriptions. Not a print-authenticated edition. Groups are abstractions, not exact quotes. Unresolved qualifiers are not evidence that a condition is absent or satisfied.

The shared v1 climate evidence helper accepts internal lookup and coverage and an opt-in alternative projection. Existing v1/v2 public calls retain their output contracts. V3 adds exact visible/hidden observations and same-element evidence for each alternative stem. It does not treat opposite polarity as exact. An empty baseline group on a conditional-only row prevents an unconditional first group from being fabricated.

## Time predicates
Explicit before/after summer solstice (index 11) and autumn equinox (index 17) are evaluated only for relevant source alternatives. Reuse analyzeMonthCommand to verify chart/birth match and the UTC+09:00 minute-based solar month interval; use solarTermInstant for the named mid-term. A missing hour/instant or period yields unresolved. At exact table minute both predicates are null, because textual equality handling is unspecified. These are calendar observations; the source alternative conditionResolved remains false, since other qualifications may still apply. Do not automatically choose an alternative because one temporal predicate matches. No arbitrary half-month cutoff for other clauses. No new date or calendar convention.

## Composition
analyzeUsefulElementAuthorityV2({saju,birthBasis,birth?,policy:'useful-element-authority-v2'}) uses the existing fixed strength-v4 and previous balance/mediation/remedy providers with climate v3. Shared composition keeps v1 unchanged. Source alternatives appear separately as conditionalSourceAlternatives with literal evidence and calendarPredicate, never promoted to unconditional anchor hypotheses. Existing all-null selection and favorability fields and special-pattern-not-assessed scope remain.

analyzeUsefulElementTransitV2({saju,birth,birthBasis,gender,fromYear,toYear,daeunPolicy,policy:'useful-element-transit-v2'}) uses the existing transit orchestration with a fixed authority-v2 provider. Two existing explicit daeun policies (legacy-day-v1 and movement-minute-v6) remain unchanged; annual pillar is after Ipchun, decadal band is a civil-year approximation, not exact transition. Per year conditionalSourceArrivals preserves separate decadal/annual layers, visible/hidden role, exact source stem matches, and same-element other stem matches. It preserves the original birth calendar predicate, does not reevaluate the natal source condition based on a transit month, and never marks a match as an effective remedy. Existing natal/period pair and formation observations stay unchanged. No new scores.

## Actual executed checks
- Climate v1/v2/v3 graph in V8 (19 modules, unused throwing calendar stub): 120 source lookups, all 38 old source rows exactly equal, 100 historical chart-only observations; 33 covered by v2, 54 by v3, three conditional-only profiles. Seasonal cues unchanged; old source profiles match after removing newly projected alternative evidence. No mutation or useful-element confirmation. [Results](climate-v3-results.json).
- Actual full calendar and term predicate graph (12 modules, no stub): synthetic Yi-day births at ±1 minute and equality around the 2041 summer solstice and 2027 autumn equinox. Six boundary checks, three unavailable input checks, one chart mismatch check passed. [Results](climate-v3-term-results.json). These synthetic dates are algorithm tests, not personal data or historical references.
- Pure conditional arrival function extracted verbatim from committed v2 transit code, actual transit observation and stem/branch source modules (12 modules) in V8: all 20 cells with alternatives × 60 synthetic annual pillars, shifted decadal pillar; 1,200 pairs, 3,840 layer observations, 4,680 stem requirement checks. Exact occurrences 1,698, same-element other stem occurrences 1,698, no occurrence 2,056 (counts refer to occurrences or requirements respectively). All exact and opposite-polarity comparisons and immutability checks passed. [Results](climate-v3-conditional-arrivals-results.json).

Native live composed authority/transit wrappers and full regression not executed in this environment. Test file includes full wrapper contracts, v1/v2 structural parity and time replay. Prior user-reported pass only applies to earlier checkout.
```sh
node --test test/climate-v3-authority-transit.test.mjs
npm test
```

## Acceptance gates
Complete and source-check the remaining 57 cells; authenticate source variants and retain conditional exceptions, including season/month specificity. Expand independent explicit useful-element text cases, not just strength labels; freeze them before any method-selection rule. Resolve actual obstruction, excess and target desirability before granting any method authority. No final useful-element or favorable/unfavorable judgement solely because two methods agree or an arrival matches. Textual consistency is not evidence of empirical predictive validity.
