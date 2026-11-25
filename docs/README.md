# Documentation index

[Current architecture](../ARCHITECTURE.md) · [Active plan](../PLAN.md) · [Consumer contract](consumer-contract.md) · [Test workflow](../test/README.md).

Canonical documents, research results and fixtures retain their existing paths. Domain catalogs link to them without duplicating specifications. A larger policy version does not imply production readiness or final selection authority.

## Domain catalogs

- [Calendar / 역법](domains/calendar.md) — Calendar conversion and solar-term reference data.
- [Core / 원국과 구조 관측](domains/core.md) — Neutral natal relationships, elemental structure, formation, roots and support observations.
- [Movement / 대운·세운·이동수](domains/movement.md) — Legacy and movement-v6 calendar and presentation contracts.
- [Pattern / 격국](domains/pattern.md) — Month-pattern, route, composition and occurrence-specific evidence.
- [Strength / 강약](domains/strength.md) — Ordinary strength hypotheses, reference corpora and research experiments.
- [Useful element / 용신·운세](domains/useful-element.md) — Balance, climate, mediation, remedy, authority and conditional transit evidence.
- [Engineering / 설계·검증](domains/engineering.md) — Consumer contract, architecture decisions, historical plans and refactor verification.

## Verification

Run `npm run audit:layout` to verify that every canonical document, frozen result, fixture and native test entry is catalogued exactly once. The complete suite remains `npm run test:failures`. See the [engineering catalog](domains/engineering.md) for pinned-baseline verification and architecture decisions.
