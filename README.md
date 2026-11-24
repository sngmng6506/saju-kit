# saju-kit

Dependency-free ESM library for Korean Four Pillars calendar calculations and descriptive traditional signals. Product scoring, localized content, social maps and payment belong to consumers.

## Usage

```js
import { getDayPillar, getSaju, analyzeCompatibility } from 'saju-kit';
const left = getDayPillar({ y: 2000, m: 2, d: 4 });
const right = getDayPillar({ y: 2001, m: 1, d: 1 });
const result = analyzeCompatibility({ left, right, scope: 'day' });
```

- `getDayPillar`: Gregorian civil date, 1900–2100 inclusive, midnight date convention, no birth-time or solar-term dependency. It is a date-only classification, not a complete natal chart or a ruling about late Zi-hour.
- `getSaju`: existing Korean default unchanged. Explicit `timezone: 'Asia/Tokyo'` supports Gregorian dates 1970–2100 under UTC+9; earlier Japanese historical clock and Japanese lunisolar calendar are unsupported. Returned lunar conversion uses existing Korean calendar data. Unknown time on a solar-term date and 23:00 still reject for full-chart calculation. For Japanese day-only results use getDayPillar.
- `stemInfo`, `branchElement`, `elementRelation`: neutral element correspondences; direction is relative to arguments.
- `stemCombination`, `branchPairRelations`, `analyzeBranchGroups`: traditional correspondences, never confirmed transformation. Three-harmony/seasonal two-member matches are candidates only. Cardinal membership is metadata, not a verdict. 午未 associated element is left unresolved because interpretations differ.
- `analyzeCompatibility`: accepts two existing Korean-keyed pillar objects (stem, branch, text). Day scope only, neutral typed signals, no scores. Localize labels outside the engine. Full natal compatibility and transformation judgments not supported.
- `getDaeun`: pass birth.timezone consistently if using Tokyo; existing age convention remains Korean.

## Distribution

Install a fixed Git commit after reviewing source and data licensing; npm publication intentionally disabled (`private: true`). The version is an internal API baseline, not a released npm package. No runtime dependencies. `npm test` runs all regression tests without installing runtime dependencies.

Existing design and sources: [DESIGN.md](DESIGN.md), [NATAL_METHOD.md](NATAL_METHOD.md), [MOVE_RULES.md](MOVE_RULES.md). No scientific prediction claims.
