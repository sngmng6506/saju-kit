# Outcome post-V10 hardening and validation

Reviewed the V10 decision gate, integrated integrity, efficacy edge projections, storage integration, compound/assistant evidence, adjudication and audit scripts. Fixed confirmed contract defects:
- Invalid global evidence suppresses family hypothesis and candidate/source evidence projections. Invalid/missing scope no longer masquerades as absent support. Malformed derived arrays fail closed; partial chart cannot expose a usable hypothesis. Witness reference lookup indexed once.
- Position projection rejects duplicate rows, wrong candidate ID, missing projection; edge authority checked independently of witness authority.
- Adjudication hidden assistant IDs require actual hidden stem membership, not just a valid stem name. Visible ID must have exact shape. Branch aggregate labels still unsupported pending a revised gold identity contract.
- Integrated audit compares each frozen historical/control probe with V9 and fails on loss of previously matched probes. Historical misses remain descriptive.
- Existing version wrappers remain for compatibility; no automatic deletion from textual dead-code candidates. New V10 computation does not recursively execute V6–V9 public APIs. Full reachability/dead-code execution pending.

## Local validation
```sh
npm run validate:pattern-outcome
npm run benchmark:outcome -- 5
```
Runner captures stdout/stderr, exit codes, errors, elapsed time, HEAD and tracked worktree status in outcome-validation/summary.json; executes all checks even after individual failures, 10-minute per-command timeout. Benchmark reports same-process p50/p95, JSON sizes, digests, fixed sample counts and errors for V9, integrated, efficacy, V10 across 70 charts. No threshold or cross-policy performance claim; not an isolated-process comparative experiment. No release authority from a passing receipt.

Five new regression tests appended to existing suites. Isolated tests run on actual gate, integrity and adjudication functions, with real hidden-stem table; full native run and benchmark unavailable due DNS and connector limits. No native pass or dead-code clearance claimed. Independent effective-force/outcome labels and final algorithms still missing.
