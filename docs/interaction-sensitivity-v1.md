# Interaction context and sensitivity v1 (experimental)

## Scope and references
The user selected ordinary chart strength only. This increment distinguishes observed relations from hypothetical effects; it does not infer special patterns, actual 合化, 解沖, root destruction, effective force transfer, auspiciousness or favorable elements. Existing strength-v1/v2, movement and compatibility results remain unchanged.

- [子平真詮 論刑沖會合解法](https://www.donglishuzhai.net/chapter/3720.html): a formation can mitigate a clash, fail to mitigate it, or create a different conflict. Do not assume automatic cancellation. Historical use of 三會/三合 terminology differs; use the engine's already versioned group definitions.
- [滴天髓闡微 地支](https://guoxue3000.com/tw/books/378/chapters/11): the effect of a clash depends on relative strength, not a fixed loss on both endpoints.
- [이재승 (2021), 명리학에서 합충(合沖)에 의한 지지(地支)의 합력(合力) 차 연구](https://kci.go.kr/kciportal/landing/article.kci?arti_id=ART002788509): the public abstract discusses adjacency and cardinal-month position in group strength. These are contextual observations, not sufficient conditions for transformation. We do not reproduce its complete decision model.

These sources motivate evidence fields. The stress scenarios below are engineering diagnostics, not formulas established by those works.

## Neutral core API
`analyzeInteractionContext({saju})`: validated year/month/day and hour or null, same errors as natal core. Returns completeHour, dayMaster, formations, clashes, disruptions and effectsConfirmed:false.

- Each formation has deterministic ID, actual stem/branch layer and positions, member set, associated element (nullable), complete flag, span and contiguity, month inclusion. Three-harmony cardinal occurrence and cardinalIsMonth are explicitly distinguished from mere month participation. Month relation is based on the principal hidden stem, not the time-specific month command. Target evidence retains visible positions, rooted visible positions, hidden root roles and principal positions outside the participating slots.
- Complete three-branch groups use one actual occurrence per distinct member. Duplicate branches produce alternative selections, each with its own positions and adjacency. Own pair candidates are omitted from this diagnostic view if the corresponding complete group exists; the raw natal/element APIs are unchanged.
- Overlaps compare actual shared slots in the same layer. Same-target means possible corroboration or alternative selection, not additive effects; different-target indicates competing correspondences, not an automatically chosen winner. Disruptions list shared branch positions with clashes, punishment candidates/mutual/self punishment, break and harm. No cancellation or precedence implied.
- Clash endpoints contain each root element and role, alternative root positions elsewhere, soleSubstantialRoot (principal/middle convention consistent with rooted visible stems), and affected visible stems. An alternate root in another clashing slot remains recorded: no joint root destruction is assumed. Month inclusion and overlapping formations remain explicit.

## Separate sensitivity API
```js
analyzeInteractionSensitivity({
  saju, policy:'interaction-sensitivity-v1', birthBasis:'verified-chart'
})
```
Requires explicit policy and birth basis. Invalid input/policy uses existing strength error codes. Provisional returns null context and baseline; partial retains ranges, no final category. All results carry assessment:hypothetical-only, specialPatternAssessment:not-assessed.

1. Baseline is unchanged ordinary v2 (structural direction, quantitative stable category, range and category).
2. Formation diagnostic: for one relation at a time, hypothetically reallocate all participating weighted slots to the associated element, retaining every other slot and the nine existing position/role profiles. Branch reallocation changes only categories in the copied quantitative evidence, not actual hidden-stem identities, roots, month command or natal chart. Report range, min/max paired scenario deltas, stable category and whether it changes. No assertion that full reallocation is physically possible or that it bounds all real effects. It is an intentionally strong perturbation; it does not recompute structural classification. Unknown target, a stem combination involving the day master, and incomplete groups without three-harmony cardinal evidence are not modeled. Competing relations are still tested individually; their deltas are never added.
3. Clash diagnostic: for each clash, one endpoint at a time, hypothetically make that position's hidden root access unavailable. A visible stem loses rooted status only if every principal/middle root is in that endpoint. Principal branch counts and the entire quantitative baseline remain unchanged; recalculate v2 structural direction and conditional decision. Includes the day stem in unavailable evidence but v2 never counts it as a supporting visible stem. This is an isolated root-access stress test, not deletion of a branch or a claim that a clash reduces force. The opposite endpoint and other relations are not simultaneously disabled.

No composite scenario, weights, score penalties, probabilities or causal inference. Consumers must not use a scenario's conditional decision as the actual chart's strength. A zero delta is a property of this specific perturbation, not proof of no actual effect.

## Validation
Seven new test bodies executed against actual source modules in V8 via an ESM adapter: duplicate occurrence alternatives, cardinal vs noncardinal candidates, layer-specific overlaps, retained alternate roots, sole-root exposure, excluded scenarios, partial/provisional and baseline/input immutability. Native Node test suite and independent expert evaluation remain pending. These APIs are diagnostics only, not a public service release gate pass.

Next increment: measure material sensitivity on an ordinary reference corpus and distinguish cases requiring interaction-aware classification. A later scoring policy needs an independently justified mechanism, explicit version and separate test set. No fixed 합/충 bonus or penalty.

## Development-corpus measurement (2026-11-24)

Actual committed source at 4dad5f2 was executed in V8 through an ESM adapter using the frozen Ditiansui reference corpus. The six non-extreme cases (four direction references and two descriptive balance cases) are separate from the 20 extreme-chapter cases. All are development inputs, not independently labelled ordinary cases.

| Diagnostic | Non-extreme six | All 26 (diagnostic only) |
| --- | ---: | ---: |
| Formation observations | 19 | 77 |
| Simulated | 8 | 40 |
| Not modeled | 11 | 37 |
| Quantitative stable category changed | 5 | 14 |
| Charts with at least one formation category change | 4 | 9 |
| Clash endpoint scenarios | 6 | 12 |
| Structural direction changed | 2 | 3 |
| Conditional candidate category changed by clash stress | 0 | 0 |

DX02 (庚申 辛巳 丙辰 乙未): baseline support range 34–38.85; full-slot reallocation for the year-month 巳申 relation to its associated water element gives 12.6–22.5 (stable weak). This agrees in direction with the textual reference under that hypothesis only. No actual transformation or changed chart category is inferred.

DX01: year-day six-harmony reallocation gives 70–78.2 versus baseline 48–55.8, while a different day-hour partial three-harmony reallocation gives 37.5–44.6. This illustrates why concurrent relations must not be added or selected by desired outcome.

The results show material sensitivity to hypothetical perturbation, not evidence that the assumed effects occur. Freeze the measurement using `node --test test/interaction-reference.test.mjs`. Native test execution remains pending; no change to production consumers.
