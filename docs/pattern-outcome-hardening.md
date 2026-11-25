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

## Follow-up: exact rescue and projection coverage

The topology guard now requires preservation of the complete original anchor binding multiset (order-independent exact identity, basis, slot-independence and directed relation) and a distinct helper from mandatory threat roles. A helper may still be an anchor alternative. Integrated integrity rejects bindings outside the candidate anchor, duplicates, edge/anchor mismatch and non-null binding authority. V10 independently checks the efficacy projection covers each original rule/witness exactly once, with matching kind and null effect; global coverage mismatch suppresses decision projections. Three regression tests added. All relevant isolated test bodies passed; native regression and benchmark still unavailable (GitHub DNS failure, no workflow runs, connector dependency closure exceeded call budget). No new rules or authority.

## Development-corpus residual gap: Zhou killing

User-reported native suite after fixture repair: all 464 passed. Uploaded integrated audit (pre-fix): 28/30 historical positive probes, all six synthetic controls, no errors/invalid/regressions. Both misses are one chart: 戊戌 甲子 丁未 庚戌 (zhou-killing), not two independent failures. Uploaded V10: 70/70 charts, 875/875 decisions abstained, 0 independent gold, no authority leak. Dead-code report: 228 runtime files, 556 edges, no dependency errors/cycles/unreachable non-shims; 32 unreachable compatibility shims and two research/test exports; retain for compatibility/research.

Source: 論偏官, https://www.kaucim.ai/bazi/ziping-zhenquan/lun-pian-guan and https://changxianyi.com/guji/ziping/nlc-continuation-text-review-20261005/pianguan/. The source explicitly describes 戊 restrained by 甲 and 庚 relieving the obstruction while nourishing insufficient killing. For 丁, 戊 is 傷官, not 食神. Correct the shared obstruction rule selector from 食神 alone to 食傷, preserving exact three-participant directed edges and existing rule/role IDs. The legacy food role name is retained for compatibility and means output in this specific rule; actual ten-god identity unchanged. Rescue inherits this exact threat; the wealth-generates-killing adverse witness remains separate. Do not broaden ordinary killing-food support, food regulation or relative-force food triads. All efficacy remains null. This is an intentional additive structural bugfix across V1–V10, not bit-for-bit historical output preservation.

Two new native tests exercise both output polarities, absence of wealth, non-output negative and competing wealth generation. Isolated execution of the actual rule/graph with core ten-god and element relations passed; native integration and all reference audits need rerun. Expected 30/30 development probes, not measured and not independent accuracy. No frozen fixture label changed. Benchmark report was not supplied, so no performance conclusion.

2026-11-25: validate complete anchor-target edge endpoints and explicit basis semantics; target-is-anchor is identity-only rather than a missing causal edge. Reject inconsistent repeated mechanism edge evidence. See synthesis P1 exact-occurrence hardening. Native regression pending.
