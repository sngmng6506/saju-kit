# Cross-project engine boundary (2026-11-24)

Status: initial shared API implemented; Node regression execution pending in a checkout with network access.

- saju-kit owns Gregorian/lunisolar calendar data, pillar calculation and neutral relations. Applications depend on a pinned Git SHA and the root ESM exports, not internal files.
- saju-friends owns Japanese UI, character labels, score weights, ranking, graph layout, X, persistence and payment. It must not recreate the calendar or relation tables. Use Korean pillar keys as stable legacy identifiers and localize at the UI boundary.
- rent-or-buy-kr's existing v6 movement policy is now an explicitly versioned `movementV6` namespace. Existing root integer-day and v1 movement functions are retained; new consumers explicitly opt in. See [movement contract](movement-v6.md).
- Day-only API uses a civil date at midnight without implying a full chart. Full chart calculation retains the existing explicit uncertainty rules and accepts Tokyo for Gregorian 1970–2100 only; Korean default remains unchanged. Japanese lunar conversion and earlier time-zone policies are out of scope.
- Three-harmony and seasonal groups: pair candidates are not completed groups. Cardinal inclusion is a neutral flag. A complete group means all three distinct members are present, not that transformation is confirmed. No automatic luck score or claim of actual relationship quality.
- Current scope is two day pillars. Full-chart compatibility, punishment, harm, break and school-specific transformations require a separate reviewed method and fixtures.
- Distribution is Git-only initially, versioned root API, no npm publication until source/data license review. Do not silently update consumers to main.

## Verification gate

Run `npm test` on the pinned checkout, including existing calendar, natal, year-signals and movement regressions plus the new all-pairs compatibility suite. The pure pair algorithm was separately checked over 3,600 ordered pairs in a JavaScript runtime; this does not replace the full Node suite or calendar fixtures. Check installation in saju-friends and a production Next build before deployment.
