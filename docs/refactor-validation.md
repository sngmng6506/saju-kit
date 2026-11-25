# Refactor validation checkpoint

Baseline: dde2df3feb8433ebdfb924c0eefac957357a19cc. Pipeline: a6fb6a36e5771d7ceb98bb206bf55ecd8af3ab4a.

## Executed
- Old and new actual pattern implementations reconstructed from complete Git diff hunks plus 14 unchanged core modules. ESM imports/exports adapted in isolated JavaScript, not native Node module loading. 37 old and 38 new loaded modules (including all ten entry points).
- 81 classical reference charts + 240 complete/partial synthetic charts × 10 policies = 3,210 exact recursive output comparisons. Object keys and order, array order, values (including undefined), input immutability; all matched. 70 input/provisional/error boundary comparisons matched.
- For one complete reference chart at v10, instrumented analyzeElementStructure calls decreased 16→4; analyzeInteractionContext calls 8→2. Calls, not wall time; no latency claim. Core inner recomputation remains.
- All 129 source JS files scanned using the architecture script's static import convention. 399 resolved edges; zero missing, cyclic, runtime external, core→feature or internal→root edges; zero nonliteral dynamic imports found. No identical Git blobs. The 13 root-unreachable files are the deliberately preserved old pattern leaf re-exports. No dead-code deletion inferred.
- Root public facade unchanged by migration; native public-root export comparison remains pending. No changes to research labels, weights, version identifiers, consumers or calendar datasets.

## Not executed
Native `npm test`, native `npm run audit:architecture`, native `npm run verify:pattern-refactor`; local checkout blocked by GitHub DNS/network access. Node is available, but the full checkout is not. Static scan cannot prove unused functions or equivalent semantics of other domains. No independent validity claim.

Use the commands in [PLAN](../PLAN.md) before further migrations. The worktree verifier requires the baseline Git object; the full checkout and history must be available.
