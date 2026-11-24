# Unseen Xu charts: frozen factorial comparison

Eight new charts selected from Xu Lewu's Zi Ping Zhen Quan commentary, online edition chapters 43–45 (正官取運, 論財, 財取運), source URLs and rationale in fixture. Source examined 2026-11-24; explicit natal direction rather than fortune outcome. Exact duplicates against all 96 prior charts excluded; sexagenary parity, year/month and day/hour stem rules checked. Labels frozen before executing engine at staging commit 56fd508bb6c6e3de973b37503948dc1e8ad6c0cb. Same author as existing development corpus: unseen-chart holdout, NOT independent author or expert evaluation. H02 and H08 marked formation-dependent because commentary relies on combination/transformation. H01 commentary explicitly calls the day master strong despite the apparent pressure; retain textual label rather than silently substituting model judgement. Online edition not facsimile-authenticated. Exclude generic conditional rules and ambiguous direction statements.

Frozen engine a4b1dfd7c5444347179e3195c4937e86bd23bdbd; A original, B removes resource weak veto, C neutral season, D both.

| Group | All 8 agree/disagree/abstain | Excluding formation-dependent (6) |
| --- | --- | --- |
| A |3/0/5|3/0/3|
| B |3/0/5|3/0/3|
| C |2/0/6|1/0/5|
| D |2/0/6|1/0/5|

H03/H04 weak agreement lost under neutral season; H02 weak agreement gained (formation-dependent). H07 strong agreement retained by all. H01/H05/H06/H08 unresolved by all. Weak veto removal changes no chart; this set does not independently establish its benefit. Preserve seasonal multiplier and A runtime. B remains candidate, not selected production policy. More charts from a different author, especially explicit weak direction despite anchored resource, needed. No further tuning on this set while calling it independent.

Actual source executed in four isolated V8 module graphs with exact guarded substitutions, unused calendar helper stubbed for full pillars. Native runner/test authored, not executed. Reproduce with `node scripts/evaluate-strength-holdout.mjs` or `node --test test/strength-holdout.test.mjs`.
