# Formation evidence v1

Implemented 71c848768289346e59b2c5319ffdc6c4a38e3637. Reuses interaction-context-v1, including complete-group occurrence alternatives and removal of redundant same-group pair observations. No strength engine changes, transformation rules, or new numerical weights.

## Contract

Public API analyzeFormationEvidence({saju}) returns observed candidate classifications, month-principal and broad-season relations separately, target-element visible stems and their literal root positions, independent rooted projection (non-day visible stem outside participating stem slots, substantial unclashed root outside participating branch slots), affected branch roots and participating stem root access, same-target and competing/unspecified-target overlaps, direct branch clash overlap and other disruptions. Same-target overlaps are retained, not declared independent or resolved; competing partners in stem combinations remain observations. The month commander is unresolved. Exact stem matches are not required for elemental root support. No claim of actual generation, binding, destruction or transformation.

The strict context screen is a diagnostic conjunction, not a classical law. Requires complete chart, known target, structurally complete relation or cardinal three-harmony pair, contiguous positions, both month-principal and broad-season same/generating relation toward target, independent rooted projection, no direct clash overlap, no different/unspecified-target overlap and no day-master stem participation. Here complete means the required members of the detected relation are present, including a two-member stem or six-harmony relation; it does not mean transformed. Cardinal seasonal pairs remain separately labeled but do not meet the completeness screen. Other disruptions and same-target overlaps are reported without implying cancellation. Incomplete birth time can return observations, never pass the screen. No direction or transformation authority in any result.

## Observed execution

Actual committed module graph (12 source modules) executed for 100 historical complete charts and a missing-hour control in isolated V8. All inputs unchanged, unique formation IDs, no confirmed effect or strength direction. No fresh textual labels or empirical validation.

96 charts with formations, 292 occurrence-level records. Counts: 55 stem pairs, 48 six-harmony, 4 complete three-harmony, 5 complete seasonal (including alternative selection for repeated branches in W10), 56 cardinal three pairs, 32 noncardinal three pairs, 56 cardinal seasonal pairs, 36 other seasonal pairs. 3 six-harmony records have unspecified target. 63 overlap a clash; 139 have different/unspecified-target overlaps; 77 have independent rooted projection. Month and broad-season support flags differ in 31 records. These are overlapping structural counts, not independent transformations.

Only one record meets all screening flags: XU19's adjacent year-month Hai-Mao wood candidate. H01's adjacent Shen-Zi water candidate has both month/season support but lacks independent rooted projection and overlaps a clash. None of the nine complete group occurrence records pass every flag. This illustrates that the conjunction is restrictive; it does not demonstrate that any actual formation succeeded or failed. Removing just the independent projection condition would raise the screen count to eight; removing only the incomplete-formation condition raises it to eleven (retrospective sensitivity, no policy change). No threshold or screening condition tuned to observed labels. XU19 remains a historical weak reference and H01 a historical strong reference; no fresh source authentication here.

## Next

Separate month-command evidence from broad-season/month-principal support. Do not use screen as a gate for strength confirmation or automatically reallocate element mass. Prioritize genuinely untouched text with explicit formation interpretations, including cases with combinations not transforming, competing targets, and ordinary natal direction distinguished from special patterns. Native replay and full integration tests added but not executed here.

[Results](formation-evidence-results.json)
`node scripts/evaluate-formation-evidence.mjs`
`node --test test/formation-evidence.test.mjs`

Historical textual consistency is not scientific predictive validity.
