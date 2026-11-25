# Strength domain refactor validation

Baseline: cd65210e911f9d80a46f236871e786bdf4d70ed5. Implementation: 92ca5fb636950957eabcfb09704e9743c2ef5281.

Fifteen former implementation modules now reside under src/features/strength; original import paths remain valid. Hybrid, ordinary, structural, quantitative, multiaxis, separated decision, command sensitivity and resource/route/capacity policies remain distinct. No rule, coefficient, threshold, direction authority or consumer contract was changed.

Request evidence is lazy and local to one synchronous evaluation. The same chart object and birth basis share quantitative observations; root dynamics and support network share the neutral root graph. Each hour completion is a different chart; a neutral-season evaluation uses its own provider. No shared global cache or input-supplied observations. No broad claim about identity of returned nested references across different APIs. Common contribution-to-node mass aggregation preserves integer units and the original node IDs.

## Executed
- Complete actual before/after source diff reconstruction, unchanged core modules, adapted ESM in isolated JS: 30 old and 32 new loaded modules.
- 12 policies × 321 reference/synthetic charts (81 classical, 240 complete/partial) = 3,852 exact recursive output comparisons. 84 boundary/error comparisons, 144 neutral-season comparisons. All matched; inputs unchanged.
- One complete reference chart at multiaxis v3: quantitative calls 3→1, root dynamics 4→1, element structure 7→2, support-network construction 3→1. These are calls, not latency.
- Command sensitivity was moved mechanically, not executed in this comparison; its kernel and context inputs are preserved. Native verifier includes 24 timed/missing-birth command comparisons, and existing tests cover source and calendar scenarios.

## Gates
The user's prior 331-test native regression, architecture audit and pattern equivalence passed before the strength migration. New native tests and verifiers are pending; the current container cannot resolve github.com for a full checkout. No additional external dependency was introduced. Run npm test, npm run audit:architecture, npm run verify:pattern-refactor and npm run verify:strength-refactor. The latter compares all 12 policies and extra command cases using the actual pinned checkout. Whole-repo static scan and symbol-level dead-code review after this migration remain pending.
