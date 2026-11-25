# Pattern v5: month-family preference (experimental)

Opt-in analyzePatternUsefulElementV5 with policy pattern-useful-element-v5. All v4 outputs retained except version. Adds preference only, never fills selectedPattern, patternUsefulGod, assistantGod, usefulElement or authority flags. No score, no fixture import, no route-count ranking.

Text basis: 論用神 (month priority), 論用神變化 (alternate projection), 論雜氣如何取用 (projection and formation), 論建祿月劫 (classification distinct from useful god). Electronic witnesses and engineering abstraction, not a complete classical precedence rule. Explicit generalization: a single projected family is preferred over an unprojected principal; mixed storage month without projection abstains; peer/blade class may propose the classification only if conflicting projections are absent. Full month-involving formation with incompatible or unresolved family blocks the preference, rather than granting transformation authority. Missing hour and provisional chart always abstain. Multiple stems of one family may yield family hypothesis, not exact ten god or selected useful stem. Clash, purity and effective-force review are not equivalent to family identity; no 成敗 decision inferred.

The CLI preserves prior --compare and adds --preference. Preference metrics only use the 13 source-selected-family reference labels, not chapter membership. Final selection metrics stay separate. No independent held-out corpus yet. No integrated authority/transit policy change.

```sh
node scripts/audit-classical-patterns.mjs --preference
node --test test/pattern-v5.test.mjs
npm test
```

## Executed baseline

The actual candidate/interaction/structure and preference graph (16 modules, ESM adapted; not full public wrapper) was executed for 81 source references and 240 complete/partial synthetic charts. 67/67 eligible chapter families retrieved; 49/67 eligible charts proposed a family. Among 13 selection references: 9 proposals, 8 matches, 1 mismatch, 4 abstentions (coverage 9/13, selective accuracy 8/9). All 120 partial charts abstained. The mismatch was li-officer, for which monthly officer is preserved in the source by combining killing. No final selectedPattern was emitted. This is development evidence, not independent validation. Full native tests remain pending.
