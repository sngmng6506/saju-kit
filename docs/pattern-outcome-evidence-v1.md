# Pattern outcome evidence v1 / 成敗救應

Experimental structural review, not a confirmed 成格/破格/救應 decision. Source: [子平真詮 論用神成敗救應](https://www.tianyashuku.com/yijing/9643/814110.html), [parallel transcription](https://changxianyi.com/guji/ziping/wz-20260914/chapter-010/), [edition comparison](https://changxianyi.com/guji/ziping/nlc-yongshen-review-20261005/yongshen-chengbai-jiuying/). The existing Dongli link was unavailable during this review. Electronic witnesses vary; this is a selective abstraction, not a critical edition or an empirical claim.

## Scope and responsibilities

- Separate root opt-in API `analyzePatternOutcome({saju,birthBasis,policy:PATTERN_OUTCOME_VERSION})`, policy `pattern-outcome-evidence-v1`. Pattern v1–v10 outputs remain frozen. No authority/transit/consumer changes.
- `outcome-rules.js`: eight ordinary monthly families; explicit support/damage/rescue graph templates, with unresolved classical conditions recorded. Partial coverage only: includes common officer injury/resource rescue, wealth peer/output mediation and officer intervention, resource wealth/peer rescue, food owl/wealth rescue, killing food/resource/wealth interaction, hurting-officer wealth/killing, blade and lu/peer controller protection. No exhaustive 成中帶忌 or 因敗得成 reasoning; branch clash/meeting rescue, absence rules, exact force, relative strength, order, transformation, exceptions and special charts remain separate future work.
- `outcome-graph.js`: structural matching over V10 occurrence and directed edge identities. Exact month hidden stem or same stem visibly projected anchors ordinary candidates; only explicit monthly blade/lu/rob-wealth class uses day reference as a proxy (not a blade occurrence). Storage and formation anchors and generic peer principal are out of scope. Helpers/obstacles/controllers are restricted to non-day visible stems. Hidden threats and supports outside the anchor are not evaluated. A false observation means no witness in this scope only.
- Rescue extends a particular damage witness, preserving every bound role, requiring distinct physical slots (position + layer). Combination records a visible contact and all competing partners, never effective combination or cancellation. The original damage remains even if rescue exists. V10 edge screen and blockers are references, not sufficient efficacy.
- `outcome-review.js`: validation delegated to the existing pipeline, no global cache; provisional chart unavailable and unknown-hour lack of witnesses unresolved. Every decision/authority field stays null/false. Conditional participant list is not 相神 selection. Simultaneous supports and threats are retained.

## Validation

```sh
npm run test:domain -- pattern
npm run audit:architecture
npm run audit:layout
npm run audit:dead-code
npm run audit:pattern-outcome
npm run test:failures
```

Audit reuses the frozen 81-case chapter-family corpus without changing labels. Counts covered structural observations by expected family among eligible cases; no outcome precision/recall, because the corpus does not have independent adjudicated outcome labels. The public API adds two explicitly named exports; prior refactor verifiers retain exact baseline export checks for old names and allow only these known additive symbols when absent in the baseline. No selection promotion. Native tests passed (user-reported 2026-11-25, exact commands/counts not provided). See [source reference v1](pattern-outcome-reference-v1.md) for source-derived positive probes and separate synthetic controls; independent expert labels and full coverage remain pending.
