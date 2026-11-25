# Documentation and test organization

Baseline: 596f75c1226d3b700ab8139b90cadcffd8c9a850.

## Decision

Keep historical documentation, result JSON, test and fixture file paths stable. Introduce domain catalogs and an explicit native test entry manifest rather than moving source files in bulk before the native regression gate. This follows the repository's compatibility rule, and avoids multiple copies of authoritative documents.

Direct source inspection established concrete path consumers: scripts/lib/refactor-equivalence.mjs reads the baseline worktree's test/fixtures/pattern-classical-v2.json; scripts/strength-factorial.mjs reads test/fixtures; scripts/audit-strength-research.mjs reads both fixtures and docs result JSON; scripts/evaluate-strength-peer-root-access.mjs reads docs JSON; test/lin-reference.test.mjs and test/climate-v3-authority-transit.test.mjs read relative fixture/result paths. README links to existing flat contracts. This is a targeted check, not an exhaustive link audit of historical documents or external repositories.

## Inventory

- calendar: 1 native test files, 0 canonical documents/results, 2 fixtures.
- core: 8 native test files, 7 canonical documents/results, 1 fixtures.
- movement: 8 native test files, 1 canonical documents/results, 0 fixtures.
- pattern: 11 native test files, 12 canonical documents/results, 2 fixtures.
- strength: 45 native test files, 60 canonical documents/results, 16 fixtures.
- useful-element: 14 native test files, 22 canonical documents/results, 2 fixtures.
- engineering: 4 native test files, 24 canonical documents/results, 0 fixtures.

91 native test entry files (including one new file), 126 canonical documents/results (including this note), 23 unchanged fixture JSON files; seven domain catalogs. No runtime, research fixture, historical result or existing test file changed. No physical migration of historical files was performed.

The layout audit checks exact coverage of the test manifest and all canonical document/fixture links in the domain catalogs; broken links in the root catalog and domain catalogs; and catalog page coverage. It does not validate all links in existing historical documents. The test runner retains exit status and failure/progress reporting; full native regression remains required.

## Pending

The prior authority correction, transit, core and dead-code native reruns have not been reported. Run the complete suite, architecture/dead-code/layout audits and all pinned equivalence verifiers before marking refactoring complete. Physical migration is deferred unless a concrete need justifies a separate path-consumer migration.

## Native discovery follow-up

The user reported 351 passes and one failure (352 tests counted) while both layout and dead-code audits passed. The default Node runner also discovered the CLI `scripts/test-domain.mjs` and its manifest `scripts/lib/test-domains.mjs`; the CLI had no argument and exited 2. Both files are renamed to non-test-like names, without changing public npm commands. A minimal native Node 22.16.0 reproduction confirmed that both old filenames are discovered and neither renamed file is discovered. The layout audit now checks test-like filenames in root, src and scripts, with regression assertions. The expected full suite is 350 tests. The user subsequently reported the complete internal gate passed; exact native count not supplied. See [closure record](refactor-closure.md).
