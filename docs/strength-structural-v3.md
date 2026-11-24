# Structural strength v3 — experimental qualitative hypotheses

## Scope
Ordinary-chart assumption only. This is a separate qualitative experiment, not a replacement for ordinary v2 or a final hybrid classification. It consumes root-dynamics v1 and the existing five-category correspondence. No special-pattern detection, actual transformation, strength transfer, numerical scoring, balance classification or useful-element inference. No consumer upgrade.

The rule directions are motivated by the root and seasonal distinctions in [root dynamics](root-dynamics-v1.md) and known errors in [ordinary reference v1](ordinary-reference-v1.md). The specific conditions below are engineering hypotheses, not a classical formula or expert-validated thresholds.

## Rules and evidence
Substantial roots are principal/middle hidden-stem matches, counted once per observed branch. Nearby is month/day/hour; central is month/day. Stages and exact/same-element matches remain evidence, not extra roots. Seasonal support and month-principal support use the existing peer/resource categories. Both supportive -> supportive; both adverse -> adverse; disagreement -> mixed. This is not resolved month command.

Anchored visible stem: existing principal/middle root match. Anchored branch node: principal hidden element. Independent local support: nearby anchored peer/resource visible stems excluding the day stem, or nearby principal resource branches. Peer branch roots are already recorded in the root channel. Resource support does not imply day-master rooting.

Burden is retained separately for output, wealth and officer. A category is provisionally concentrated if it has >=2 rooted visible stems and >=1 principal branch, or >=1 rooted visible stem and >=2 principal branches. No sums across unlike categories or extra scores for overlapping roots. These counts are descriptive proxies, not independent force measurements.

Strong grounds:
- distributed-substantial-roots: >=2 substantial roots, at least one nearby.
- season-root-support: nearby substantial root, supportive season, independent local support.
- central-principal-root-support: central principal root and independent local support.

Weak grounds:
- shallow-or-absent-roots-adverse-season: no substantial root, adverse season, at least one nearby anchored burden.
- remote-root-concentrated-burden: no nearby substantial root, <=1 substantial root, adverse season and concentrated burden.

Conflicts:
- root-support-versus-concentrated-burden: any strong ground plus concentrated burden.
- weak-root-versus-local-support: any weak ground plus independent local support.
- weak-root-versus-protection-or-mediation: any weak ground, at least one literal day root, and a local protective/mediating path targeting the day stem whose threat and intermediate are anchored. This raises uncertainty, not strength or confirmed neutralization. Repeated paths are not additive; unique intermediate slots are reported.

Emit a direction only when exactly one side has grounds and no conflict. Otherwise unresolved. No hypothesis is forced when neither side has sufficient grounds. The old v1/v2 quantitative policy is deliberately not used as a final gate because its suitability for the new qualitative model is still open.

## API
```js
analyzeStructuralStrength({saju,policy:'strength-structural-v3',birthBasis:'verified-chart'})
```
The same validated pillar and chart-basis contract as ordinary v2. Invalid input raises existing SajuError codes. Status: hypothesis/unresolved for complete charts, partial for missing hour, provisional for explicitly provisional chart. Top-level direction strong/weak/null; partial always null even if observed-only hypothesis.direction exists, provisional has no hypothesis. hypothesis records strongGrounds, weakGrounds, conflicts, and evidence including root positions/roles/stages/clash exposure, seasonal and principal support, independent support nodes, burden categories, anchored paths and intermediate slots. No final category, probability or score. Caveats always record unmodeled effective interactions and pending quantitative cross-check for non-provisional inputs. Verified-chart means resolved pillars, not identity verification.

## Development comparison
Both existing textual corpora were reused after inspecting them; these are development diagnostics, NOT held-out or independent accuracy measurements. The 20 extreme-chapter references remain excluded from ordinary directional metrics, as do balanced/disputed references. All 57 full textual inputs evaluated. In Xu's 27 directional cases:

| Structural policy | Agrees | Disagrees (including v1/v2 mixed) | Abstained | Classified |
| --- | ---: | ---: | ---: | ---: |
| v1 | 13 | 10 | 4 | 23 |
| v2 | 10 | 17 | 0 | 27 |
| v3 | 12 | 1 | 14 | 13 |

V3: 12/13 conditional concordance (92.3%); 13/27 coverage (48.1%); 12/27 overall concordance (44.4%). V1: 13/23 conditional (56.5%) and 13/27 overall (48.1%). V2: 10/27 (37.0%) conditional and overall. V3 is more conservative, not an unconditional improvement over v1. Strong textual references: 9 strong, 0 weak, 7 abstain. Weak textual references: 1 strong, 3 weak, 7 abstain. XU08 and XU23 retain strong grounds but concentrated burden conflicts and abstain; they are NOT corrected to strong. XU14 is a new false strong hypothesis on a weak reference, demonstrating that distributed roots alone can be insufficient. DX01 agrees; DX02/DX03/DH02 abstain (1/4 coverage, 1/1 conditional concordance) in the Ditiansui ordinary directional subset.

The two old corpora are unsuitable as unseen evaluation for a later policy based on these observations. Freeze results including XU14. Obtain an additional source/independent reviewer set before selecting new rules or weights. Investigate XU14, conflicting cases and weak coverage, including distinction between exposed/remote roots and rooted opposing channels. No change solely to increase coverage. No final v3 classifier, yongsin or public deployment.

## Verification
Six newly authored test bodies passed in a V8 source adapter, including conflict preservation, clear hypotheses, seasonal disagreement, partial/provisional, input and privacy. The 57 textual inputs were also executed against actual upstream modules and new source. Native Node full regression remains unrun. The new snapshot test preserves exact outcomes for reproduction.
```sh
node --test test/strength-structural-v3.test.mjs test/structural-v3-reference.test.mjs
```
