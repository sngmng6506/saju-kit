# P1-5d source claim evaluation protocol

Base bdbd8a11d30b8cb9503498f97a17c82c21031e90. No runtime rule change, no candidate engine invocation. The P1-5a native validation gate remains pending.

## Draft task census

The existing external intake and collector notes were used to propose 22 neutral review questions covering all 14 charts. This is a collector-selected task draft, not independently adjudicated labels. The 13 typed exact-visible targets comprise six directed actions, four interposition relief routes, two pair-level restrictions and one pair transformation. Nine other tasks (five branch-context, two role-context, two unspecified) retain potentially unsupported scope rather than selecting a nearby visible action. No expected yes/no label appears in the draft. Pair-level restriction is not an exact-edge inhibition claim; reviewers must mark undetermined where the passage does not support the precise target. Source-specific interpretations, ordinary scope and exact actors need human review. The draft is external to the repo: p1-5d-claim-draft.json, raw UTF-8 SHA-256 e80af008e0c45d731884ad4f5c3cf8dc16c1a29085767bd7c5271ef3ae25c280. The original intake/notes hashes remain in the P1-5c receipt.

## Blinded review workflow

Place intake, draft, review responses and any later exported native results outside the repository. Recheck live exposure and generate packet and empty review template using the same intake and draft:

```powershell
npm run audit:pattern-outcome-exposure -- --candidate ../p1-5-intake.json
node scripts/review-pattern-outcome-claims.mjs packet ../p1-5-intake.json ../p1-5d-claim-draft.json | Set-Content -Encoding utf8 ../p1-5d-review-packet.json
node scripts/review-pattern-outcome-claims.mjs template ../p1-5-intake.json ../p1-5d-claim-draft.json | Set-Content -Encoding utf8 ../p1-5d-review-template.json
```

Give both reviewers the neutral packet and template, not the collector notes. They separately record ordinary/special-or-formation-dependent/uncertain scope per chart, source locator/rationale and yes/no/undetermined/disputed per exact task. Yes/no requires an explicit textual claim or denial of that exact proposition; source silence is undetermined. Two distinct reviewer IDs, exact coverage, matching canonical packet digest and declarations of no engine/prior-label exposure are required. No majority vote; determinate agreement in ordinary scope remains pending external independence verification. Task definitions that need correction must be revised and refrozen before evaluation.

```powershell
node scripts/review-pattern-outcome-claims.mjs summarize ../p1-5-intake.json ../p1-5d-claim-draft.json ../review-a.json ../review-b.json
```

## Comparison contract

After independent review and native validation, comparison is available for external captured V10 rows, shaped as an array of {chartId,pillars,native}. The comparator itself never executes the model, and cannot authenticate the supplied results or their actual execution commit/input. Do not use external data as certified gold or run the candidates to guide rule development before freezing review labels and verifying native execution. Current V10 is abstention-only; actual effect/relief/pair restriction/transformation/retention assertions other than unresolved are rejected as invalid authority, not scored as agreement. Exact action, route and pair identities bind the actual proposition, never the structural screen, modeled direct tendency, route proof or counterfactual. An omitted target gives model-scope-gap, not a negative prediction; malformed duplicate identity and unsafe result envelope are invalid. Structural diagnostics can still be retained separately.

```powershell
node scripts/review-pattern-outcome-claims.mjs compare ../p1-5-intake.json ../p1-5d-claim-draft.json ../native-rows.json ../review-a.json ../review-b.json
```

Outputs include fixed all-task/determinate/resolved denominators, reference unresolved, scope gaps, abstention, conflict, agreement/disagreement, mapping counts and per-kind counts. Selective agreement is null when no comparable determinate model predictions exist. Report status is diagnostic-unverified-input; independentGoldCases stays zero. No authority granted. This is a comparison of traditional textual interpretations, not empirical force or predictive accuracy.

## Verification receipt

Six synthetic test bodies passed using fetched exact evaluator and exposure-normalization module bodies in a JS isolate with test/assert adapter. CLI parsed with import/URL transformation; native ESM, filesystem/digest handling and full native regression were not executed. Reconstructed the 14 literal charts and all 22 draft task identities in the isolate; all target relation/identity checks passed, with placeholder source strings for that reconstruction (not source locator verification). The actual external intake file and notes matched their previously recorded byte hashes in the container. No source labels or model results were generated; zero actual evaluated prospective charts. Native tests registered in full and focused profiles. P1-5d evaluator implementation complete; actual adjudication and comparison pending. P1-5e rule changes require the pending evidence, not fabricated reviewer agreement or lowered conditions.
