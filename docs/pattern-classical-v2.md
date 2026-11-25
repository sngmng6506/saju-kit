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


## Outcome research checkpoint after v10

The v3–v10 progression can now be compared on the same frozen corpus without changing any released policy. The research-only outcome projection consumes v10, requires observed anchor-bound routes and distinct slots, normalizes reverse legacy directions and matches a rescue only against the identical directed obstacle/protected occurrence pair within the same candidate. Unmatched rescue witnesses remain visible; a matched rescue never removes a threat. Named role paths and unresolved motif predicates remain separate evidence, not scores. A root/locality screen is not efficacy. No selection, 成敗救應, useful/assistant/unfavorable stem or transit authority is granted.

```sh
node scripts/audit-classical-patterns.mjs --progression
node scripts/audit-classical-patterns.mjs --outcomes
node scripts/audit-classical-patterns.mjs --outcomes --rows
node --test test/pattern-classical-v2.test.mjs
npm run test:failures
npm run audit:layout
npm run audit:architecture
npm run audit:dead-code
```

Reference inventory (executed against the actual frozen JSON): 81 total, 67 eligible, 14 excluded, 13 selected-family labels, 23 support and 2 obstruction probes. There are zero eligible formed, exact useful-stem, exact assistant-stem or unfavorable-stem labels, and zero confirmed held-out cases. All 81 cases remain in the annotation review queue. Negative labels must be distinguished from missing labels. This is an inventory, not independent adjudication. Do not add synthetic cases as historical references or backfill labels from predictions. For the next corpus, record the source edition and exact location, transcription, explicit role/formation scope, adjudicator and disagreement; freeze a separate blind split before rule tuning. Special patterns remain excluded.

Three new synthetic controls passed in isolated JavaScript using the actual research module and test assertions adapted to that environment (JSON clone for plain control data). The native full-corpus test has been authored but not executed; repository clone was blocked by DNS and a full dependency fetch exceeded connector call limits. No new outcome counts or improvement in prediction accuracy are claimed. Public API and runtime modules are unchanged. Keep the research branch separate until the final native regression and pinned equivalence gate is passed. 
