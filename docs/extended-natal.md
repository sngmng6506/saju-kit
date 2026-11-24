# Extended natal observations (2026-11-24)

## Scope and policy
Additive API only. Existing branchPairRelations, analyzeBranchGroups, analyzeCompatibility, legacy movement and movementV6 contracts remain unchanged. No automatic scoring or selection of a favorable element. All relationships below are traditional conventions, not empirical predictions.

- branchRelationsV2: existing v1 observations plus six breaks (子酉 丑辰 寅亥 卯午 巳申 未戌), six harms (子未 丑午 寅巳 卯辰 申亥 酉戌), Korean wonjin convention (子未 丑午 寅酉 卯申 辰亥 巳戌). Preserve overlapping signals; no cancellation or automatic adverse interpretation. Wonjin is a separate convention, not a synonym of harm or a universal rule.
- Punishment: 子卯 mutual, 辰午酉亥 repeated branch (requires two actual positions), directed edges 寅→巳→申→寅 and 丑→戌→未→丑. For two branches emit a candidate only; all three distinct branches emit a complete structural group. Do not assign disputed 恃勢/無恩 category names or assert actual punishment. Repetition in cross-chart comparison is not natal self-punishment.
- analyzeNatalRelations: all unordered pairs of actual pillar positions (6 with hour, 3 without), explicit distance and adjacency, stem combination, elemental relations, branch signals and complete groups with actual occurrences. No merging of repeated positions or assumption of 合化.
- analyzeCrossChartRelations: separate charts, 9/12/16 cross pairs, no combined chart or fabricated full group. No score. V1 day-only comparison remains the product default.
- analyzeNatalContext: month branch, seasonal grouping (寅卯辰 spring etc.), principal hidden stem, ten god, direction of principal element to day master, literal root/projection matches (exact stem vs same element). Root/projection results are evidence, not confirmed strength or operative 투간. Includes residual stems per existing hidden-stem convention. No weights, no assumption that the principal stem is the time-specific 司令, no automatic 得令 or 判格.

## References and boundaries
- [三命通會 卷二 論三刑/論六害](https://zh.wikisource.org/zh-hant/%E4%B8%89%E5%91%BD%E9%80%9A%E6%9C%83_%28%E5%9B%9B%E5%BA%AB%E5%85%A8%E6%9B%B8%E6%9C%AC%29/%E5%8D%B702): classical punishment and harm correspondences; interpretive names/claims are not adopted.
- [六破 reference table](https://www.daokeyi.com/jichu/dizhi/xingchong-hehai/), [Korean wonjin reference table](https://hyewondang.com/guide/shinsal/wonjin): modern secondary convention references, not empirical or definitive classical validation.
- [우연화·김만태, 천간과 지지의 상조와 상극에 관한 연구 (2022)](https://www.jdaos.org/archive/view_article?pid=jdaos-42-0-109): root and projection concepts, differing criteria and importance of position.
- [김만태, 사시 월령의 명리학적 수용에 관한 고찰 (2014)](https://www.kci.go.kr/kciportal/landing/article.kci?arti_id=ART001909378): month-order/month-command distinction and historical complexity.

## Remaining decisions
Strength and favorable-element methodology requires explicit review: same-stem versus same-element roots, residual/middle/principal weighting and month command, strength by season/position, exceptions such as following/transformation charts, and whether to use a qualitative classification or a versioned numerical model. Do not infer these from raw element counts. Do not silently change the existing hidden-stem table or movement-v6 weights.

## Verification
144 ordered branch comparisons, overlapping relations, candidate/group separation, positional evidence, cross-chart scope and root/projection consistency are covered by dedicated tests. Existing consumers remain pinned until independent native Node and application regression checks pass.
