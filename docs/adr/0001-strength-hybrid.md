# ADR-0001: Hybrid day-master strength

**Status:** Accepted for experimental implementation; release to consumers pending reference-case evaluation.

## Context
A single strength sum conflates traditional observations and policy assumptions. Users selected structural reasoning plus quantitative cross-check. Existing core relations and consumer scores must remain stable.

## Decision
Add a pure, explicitly versioned opt-in feature. Reuse core tables; separate evidence, quantitative scenarios, and decision gate in three modules. Retain [the strength contract](../strength-hybrid-v1.md) as the single source for policy values. No strength-to-yongsin inference, no consumer change.

## Consequences
Traceable decisions and deterministic abstention; higher review rate and no claim of doctrinal or empirical accuracy. Expert and native regression gates remain before public use. In partial charts the extreme-score flag requires a whole scenario interval to be extreme, rather than merely intersecting an extreme band.
