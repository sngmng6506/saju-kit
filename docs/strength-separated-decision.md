# Separated strength decision v1

Implemented at b8af5b02f911acc465ef598fa4266e8fc961b478. Existing v1–v4 source and public behavior left unchanged. New opt-in public API: analyzeStrengthDecision({saju,birthBasis,policy:'strength-decision-v1'}).

## Responsibility boundary

observeRootCapacity records structural observations and central/peripheral candidates without issuing a decision. collectStrengthEvidence reuses the existing v3 observation providers, retains network environment and route diagnostics, and collects neutral-season evidence only for non-central strong hypotheses. resolveStrengthEvidence applies explicit confirmation permissions, preserves inherited conflicts, rejects unknown grounds and never modifies the evidence snapshot. The public wrapper always uses observe-only peripheral authority; the alternative is research-only. Legacy ground recognition is an adapter to v3, not a rewrite of the underlying quantitative models. The existing resource route model remains hypothetical.

## Experiment

100 exposed directional cases, 71 primary and 29 secondary. Actual new source in V8, 20 fetched modules plus unused throwing calendar stub. Fixed policy matches all 100 stored v4 directions; both policies evaluated using the same evidence snapshot. All 100 snapshots unchanged after resolution; invalid authority rejected, public override ignored, provisional no decision. Native replay additionally compares complete v4 decision/status/season metadata; that native replay has not been executed here.

| Group | Fixed | Peripheral independent experimental |
|---|---|---|
| Primary agree/disagree/abstain |38/1/32|39/1/31|
| Secondary |10/1/18|10/1/18|
| All |48/2/50|49/2/49|

Only three peripheral candidates satisfy the original root minimum >=40 and have no central principal: ZN08 (already strong), L80 (concentrated pressure prevents promotion), ZW03 (restored strong only with independent authority). New named ground peripheral-root-capacity does not masquerade as central-root-capacity. Fixed policy leaves season verification intact. Experimental independent authority is explicitly what allows exemption; the result is not evidence that observation alone should change direction. No change to ZN01, L82 or ZN02. No new weights or thresholds.

## Decision

Retain fixed policy in public API and v4 as the previous opt-in baseline. Independent peripheral authority is a research candidate only. Its one additional agreement is on an exposed case; no independent validation. L80 is an important safety control: when a new strong ground is granted, the resolver checks concentrated pressure even if v2 had not emitted that conflict for an originally unresolved hypothesis. The weak-veto question remains separate.

Next freeze fresh author references enriched for peripheral roots, include both weak and strong cases and record selection before evaluation. For coverage work, group unresolved cases by conflict versus absent grounds, rather than introducing additional ad hoc thresholds. Prioritize native Node regression. No claim of empirical predictive validity.

[Results](strength-separated-decision-results.json)

`node scripts/evaluate-strength-separated-decision.mjs`
`node --test test/strength-separated-decision.test.mjs`
`npm test`
