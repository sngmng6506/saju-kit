# Pattern outcome evidence v3: secondary roles and support loss

Opt-in `analyzePatternOutcomeV3({saju,birthBasis,policy:PATTERN_OUTCOME_V3_VERSION})` (`pattern-outcome-evidence-v3`). V1, V2 and pattern V1–V10 output contracts remain frozen. No authority/transit/consumer migration.

## Separation of roles

A candidate's family anchor is not necessarily the actual protected target. `outcome-secondary.js` separates (1) family anchor references and their relationship to the secondary officer, (2) the injury witness, (3) the intervention extending that exact injury, and (4) unresolved efficacy. A wealth anchor generates an officer; an officer generates a resource anchor. Each binding references actual occurrence IDs and existing directed edges. If two hidden constituents share a branch and the element relation matches, the association is recorded as same-branch context, with no edge and no independent supply claim. The resource helper may be the very same occurrence as a resource anchor; this alias is explicit, not an extra actor.

The family anchor establishes relevance, not a fourth required independent actor. An injury and intervention still require distinct physical actor slots. Hidden officers are conditional targets with access evidence from V2, not freely available stems. Only visible output and resource actors are admitted here. No universal protection inference or hidden efficacy.

## Five added templates

- Wealth: secondary officer injury by visible output; visible resource restrains that same output.
- Resource: secondary officer injury by visible output; visible resource restrains that same output.
- Officer: wealth and resource are structurally related to the officer and form a visible stem combination with each other. This is a potential loss of support (財印相合), not direct officer injury. The combination, both support-related generation links, and unresolved support loss are recorded; target injury stays null.

V2 orchestration exposes a private request-local builder to V3 to avoid rerunning V10; V2 public output stays unchanged. V3 appends rules and updates diagnostic status only; no previous witnesses removed. No automatic final 成敗, 相神, 清濁 or strength judgement.

## Evaluation

Frozen source reference remains unchanged. Three added mapping probes: wealth/secondary hidden officer (壬辰 乙巳 癸巳 辛酉), resource/secondary officer (丙戌 戊戌 辛未 壬辰, editorial restoration), officer support loss (壬戌 丁未 戊申 乙卯). Sources and qualifications remain in the [reference fixture](../test/fixtures/pattern-outcome-reference-v1.json). Mapping overlay is evaluation-only, keyed by gap and family. No chart-specific runtime rule.

```sh
npm run test:domain -- pattern
npm run audit:pattern-outcome-v2
npm run audit:pattern-outcome-v3
npm run audit:architecture
npm run audit:layout
npm run audit:dead-code
npm run test:failures
```

Fixed historical denominator: 30 probes; V2 mapped 21, V3 mapped 24. Native retrieval and regression checks pending, prior V2 native results not supplied. Mapped coverage is not accuracy. Historical misses are diagnostic; prior matches regressing or synthetic control failures exit nonzero. The newly mapped probes are explicit native tests. The sample is development reference, not a blind holdout. No gold final outcome labels.

Next: conditional regulation of excess/deficiency, storage projection, positional ordering and exception context. Do not promote structural matches to outcome decisions.
