# Native test layout

Tests are grouped by primary contract in [the explicit domain manifest](../scripts/lib/domain-manifest.mjs). Test filenames and fixtures stay at their original paths for historical research scripts and pinned consumers. Do not use a domain run as a substitute for the full regression gate.

```sh
npm run test:domain -- list
npm run test:domain -- strength
npm run test:domain -- useful-element
npm run test:failures
npm run audit:layout
```

Domains: calendar, core, movement, pattern, strength, useful-element, engineering. Domain runs use Node's native runner and the same failure/progress reporter as the complete suite. No shell command is constructed from a user-supplied string. The explicit manifest rejects missing, duplicate and unclassified test files. Add each new native test to its primary domain and update the relevant [documentation catalog](../docs/README.md) when adding a canonical document or fixture.

CLI and manifest files outside `test/` must avoid Node's default test-discovery naming patterns (such as `test-*.mjs`). The layout audit reports unexpected test-like filenames in root, src and scripts.
