# Movement v6 — upstream extraction

Source: rent-or-buy-kr commit 9625c3d7ba8a244f2d20d0c4dcdd73bfb243a049, site/saju/lib/core and movement-overview.js. This release extracts the deployed movement policy into saju-kit without redefining it as a traditional or empirically validated prediction. Legacy root getDaeun/getYearSignals/getYearTimeline/summarizeMovementSignals are unchanged in behavior; opt in via `import { getSaju, movementV6 } from 'saju-kit'`.

- Core owns the calendar, common relation tables, polarity, decade band construction and validated birth chart. Movement v6 derives group names and jisal from the same three-branch sets and uses the core branch relation, seun and yeokma.
- v6 owns minute-based daeun, temporal formation and the existing versioned scoring/presentation/relative highlight policy. The old Korean result contract is retained for compatibility. Future policy changes need a new named version and regression comparison. No automatic replacement of friend compatibility weights.
- Korean default and Tokyo 1970+ Gregorian minute calculation supported. Unknown/period birth time returns a range; consumer time-entry policy and provisional solar-term-day fallback remain product-owned. The provisional clock is not an independently verified birth time.
- rent-or-buy-kr owns evidence UI, time input labels and graph interaction. saju-friends owns Japanese localization and its separate friend-day score. No claim of actual relocation.

## Test/consumer gate
Ported independent v6 movement, combinations and overview tests from the source; product-specific evidence tests stay in rent-or-buy-kr. Run npm test in this repo, then compare a pinned consumer's full movement regression suite before release. Static browser vendor copies must be generated from a fixed SHA; never edit them by hand. Calendar data remains the same as the source (identical Git blobs). Whole Node suite execution pending in a network-capable checkout.
