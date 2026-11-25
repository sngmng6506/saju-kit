# Climate domain refactor validation

Baseline: 6cb229d69b5fe574a84112ced94fc01bec0d5d7d. Implementation: a4a3bb00a33550998be0a076c87a4c058e9e4984.

The thirteen former climate implementation files are grouped in src/features/climate. Original paths re-export their existing bindings; the public root export file is unchanged. Source tables v1–v4, term predicates, structural conditions, requirement contexts and textual motifs are distinct responsibilities. The shared kernel builds natal context and element structure once for each diagnostic review. V1/v2 retain their original evidence projection without temporal fields. V3/v4 retain temporal and structural conditions, and v5 extends the same structural observation rather than recomputing it. No source entry, qualifier, weighting, authority or calendar behavior changed.

## Executed comparison

- Actual complete diff reconstruction and core/calendar modules, adapted ESM in isolated JS: 28 old and 30 new loaded modules.
- 81 reference charts plus 240 synthetic complete/partial charts × five policies: 1,605 exact recursive output comparisons.
- 72 exact birth inputs across 1980, 2000 and 2026 × five policies: 360 comparisons; five temporal observations resolved to observed status across these calls.
- 35 boundary/error comparisons; 480 source lookup comparisons (120 stem/month cells × four source policies). All matched, including null/undefined and object key order; inputs unchanged.
- One complete reference chart at v5: element structure calls 2→1, natal context calls 3→2. Call counts only; latency not measured.
- Reviewed eleven related native test files and two balance research scripts for direct reads/patches of the old climate source paths. Found normal imports, not direct source reads/patches, in those files. The earlier strength source-patch registry remains unchanged.

## Gate

The user reported all 336 tests passing before this migration. New full native suite, architecture audit and pinned equivalence command remain pending. The isolated comparison did not execute the entire public-root import graph, integrated authority/transit tests, or every research script. The native verifier reproduces the five-policy reference/synthetic and exact-birth comparisons. Existing tests cover source-table contracts and integrated behavior. No final selection or empirical validity claim.
