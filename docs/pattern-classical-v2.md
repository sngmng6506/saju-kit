# Classical reference v2: baseline audit (pattern v3)

81 unique four-pillar strings: 69 new and 12 development-known. 67 chapter-family references eligible; 14 textual variants or transformation reviews excluded from aggregate. 40 checked against chapter witnesses, 3 editorial corrections, 13 appendix-only, 11 legacy, 6 variants, 8 transformation review. Electronic witnesses, not a print-authenticated edition or independent double annotation. The classical text is the target, not historical life-outcome truth. A structurally valid four-pillar string is not proof of a real birth date. The test corpus is not imported by runtime.

## Baseline before changing any pattern rule

Actual pattern v3 dependency graph (19 modules, ESM declarations adapted, no stubs) executed on all 81 rows. The calculation and retrieval counts were independently reproduced from outputs; native Node audit CLI and full test suite not run here.

| Metric | All eligible | New reference | Development-known |
|---|---:|---:|---:|
| Eligible | 67 | 56 | 11 |
| Chapter family retrieved | 66 | 55 | 11 |
| Competing distinct families | 25 | 19 | 6 |
| Mean distinct families | 1.4179 | 1.3929 | 1.5455 |
| Source participant in assistant candidate set | 9/23 | 9/23 | n/a |
| Selected pattern | 0 | 0 | 0 |
| Assistant selected | 0 | 0 | 0 |

Candidate retrieval ≠ selection accuracy. Participant observations are broad positive role probes, not a complete set of gold assistant stems: some source actors preserve a role via a positional relation or a distinct mechanism outside the assistant-route definition. Report 9/23 as coverage of these probes, not assistant precision or recall against adjudicated assistants.

The schema additionally separates 13 narrowly annotated source-selected family references from chapter membership. No exact selected useful stem, final assistant or unfavorable stem has independent adjudication. Do not interpret the absence of selected errors as accuracy: zero coverage means selective accuracy is undefined. The audit code excludes unlabelled rows from selection denominators. Synthetic metric controls test correct/wrong/abstained and unlabelled behavior. New-reference is a development evaluation split, not a blinded held-out set.

## Main miss

zp-3746-07 (甲子 辛未 辛酉 壬辰): source treats 甲 as wealth connected to 未 wood storage and 壬 as output mediating peer/wealth. Current exact hidden projection produces resource only. Do not alter the hidden-stem table or automatically equate all same-element visible stems with exact projection. Add an explicit, separately versioned storage-element projection hypothesis and test other four storage months, nonstorage months, missing hour, competing candidates, and opposite polarity. Source: https://www.kaucim.ai/bazi/ziping-zhenquan/lun-cai ; https://donglishuzhai.net/chapter/3729.html . This is a known diagnostic miss, not a licence for case-specific hardcoding.

Role-probe gaps: resource protects officer against output, resource uses output, heavy resource uses wealth, blade controller protected by resource, peer officer uses resource, wealth/output and combination interventions. Some cases need role-specific modelling rather than broadening support indiscriminately.

## Reproduce

```sh
node scripts/audit-classical-patterns.mjs
node --test test/pattern-classical-v2.test.mjs
npm test
```

Next: independently cross-check remaining 13 appendix-only and variants; extend with more ordinary-pattern cases and negative contrasts (no fabricated historical labels). Establish actual selection and role references before granting any selection authority. Keep special patterns out.
