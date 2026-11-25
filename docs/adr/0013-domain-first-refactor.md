# ADR-0013: domain-first organization and frozen policy compatibility

Status: domain-first migration implemented; internal native gate passed (user-reported 2026-11-25, intended checkpoint f18323b); external consumer acceptance and measured performance baseline pending. See [closure record](../refactor-closure.md).

## Context
At dde2df3feb8433ebdfb924c0eefac957357a19cc, 390 tracked files, 45 feature directories, 103 test/fixture files. Pattern v10 invokes v9 through v1; v1/v2/v3/v4/v6/v7/v8 each request the same element structure and interaction context. V4 also replaces route/outcome/quality results produced earlier. PLAN.md still contains a historic API and directory sketch, not a reliable current contract.

## Decision
Keep every public export, policy ID, error and output unchanged. Group implementation by domain and responsibility rather than create another version directory for each addition. Existing version directories may retain thin compatibility re-exports. New shared pattern orchestration uses one request-local context; no global cache, new dependency, authority promotion or consumer migration. Keep stage logic and policy version distinct. No broad deduplication across intentionally different research policies without equivalence evidence.

Record current structure in ARCHITECTURE.md and use docs/README.md as navigation for contracts, source research and validation. Preserve old files and links during the first phase; classify documents before moving them. Do not remove unreachable files merely because static root reachability cannot see scripts/tests or dynamic usage.

## Verification
Run npm test, npm run audit:architecture, npm run verify:pattern-refactor. The last compares all ten policies against the pinned pre-refactor commit using a detached temporary worktree (81 reference + 240 synthetic complete/partial charts, boundary errors, public export names and input immutability). This is implementation equivalence, not validity of astrology. If the baseline itself fails, fix in a separate reviewed change before claiming equivalence.

## Consequences
Smaller responsibility units and fewer repeated calculations; legacy shims temporarily increase file count. Native verification must pass before further migrations or new interpretation work. Future domain migration is incremental, with separate commits and no external consumer changes.

See [executed validation](../refactor-validation.md). Historical decision retained; subsequent domain migrations and internal gate are recorded in the closure record.
