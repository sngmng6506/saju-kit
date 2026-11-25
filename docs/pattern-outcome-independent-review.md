# Independent source review protocol v1

This is an offline review workflow, not an automated label generator. It uses the existing frozen 10 effect probes, 6 prospective chart candidates, and 4 priority source charts (20 tasks; tasks are not necessarily distinct charts). All were previously collected by the project. No independent holdout is claimed. No new historical interpretation is asserted here.

Generate packet and empty response template:
```powershell
node scripts/review-pattern-outcome.mjs packet | Set-Content -Encoding utf8 review-packet.json
node scripts/review-pattern-outcome.mjs template | Set-Content -Encoding utf8 review-template.json
```
UTF-8 review input files with or without BOM are accepted. Each reviewer receives the packet and a separate template, not the engine outputs, expected labels or prior reviews. Record edition, chapter/passage locator, rationale and label. Disputed source statements are not binary gold. Do not infer unsupported facts. Effect refers to source-supported action/removal, not a physically verified force. Selection records the source's objective, not a universal favorable-element set. Chart review labels cover family/formation/breakage/rescue/purity/clarity; assistant-specific review remains the existing adjudication workflow.

Reviewers return complete response files. The CLI checks packet SHA-256, exact task coverage, unique reviewer ID, declared independence, evidence locator/rationale, and permitted labels. Reports field-level unanimous agreement, disagreement and unresolved agreement separately. Prior exposure is declared, not verified; no majority vote or automatic gold promotion. Independent reviewer identity and exposure require external verification. No runtime decision authorization derives from the output.
```powershell
node scripts/review-pattern-outcome.mjs summarize reviewer-a.json reviewer-b.json
```
New tests use synthetic reviews only. No real reviewers have been recruited or verified. Native audit and regression results are still pending.
