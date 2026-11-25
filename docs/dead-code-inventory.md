# Dead-code and dependency inventory

Baseline: 8e909285bc54eb4d3a43c15c88579db909b33f14.

## Executed source inventory

All 194 tracked runtime JavaScript files were collected at the pinned baseline: 91 cached source files were reused only when their Git tree blob IDs matched; 103 were fetched at that revision. Static import/re-export and literal dynamic-import scan: 462 distinct per-file edges; no unresolved paths, core→feature imports, internal→public-facade imports, runtime external imports, cycles, nonliteral dynamic imports or identical source bodies. 66 pure re-export shims, including all 32 files not reachable from src/index.js. No unreachable non-shim file in this scan. Compatibility paths are retained.

A conservative ASCII identifier occurrence scan of declarations (including indented simple declarations) and named imports found two local candidates: the unused private relation helper and unused stemInfo import in src/core/stem-force.js. Both were manually reviewed and removed. Neither participates in a public output. No other candidate was established by this scan; this is not proof that all remaining code is live.

Two declarations with only one runtime textual occurrence are intentional research exports:
- analyzeMultihopInteraction: scripts/evaluate-strength-multihop.mjs and test/strength-multihop.test.mjs import and call it.
- evaluateBalanceRoutes: scripts/evaluate-balance-route-review.mjs imports and calls it.

Both were inspected directly and retained. No public API, source table, compatibility module or research policy removed. Nested declaration, alias, property access, comment and dynamic behavior limit textual analysis; no whole-repository call graph or external consumer scan was performed.

## Repeatable audit

npm run audit:dead-code reports dependency findings, compatibility shims, local candidates and export candidates with textual references in local scripts/tests/docs. It does not delete code or fail for a candidate. Architecture violations remain a failing exit status. Treat textual references as leads, not proof of execution.

## Pending

Native full regression and all pinned equivalence verifiers remain pending after the most recent user-confirmed test run. The preceding authority correction, transit and core native reruns have not been reported. Document/test physical migration requires its own reference audit and must preserve fixture paths, script commands and history.
