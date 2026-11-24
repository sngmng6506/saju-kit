# Architecture

The dependency-free ESM engine uses a functional core. `src/data` contains pinned calendar data; `src/core` owns calendar, elemental/hidden-stem correspondences, and structural observations. `src/features` owns opt-in, versioned policies (day compatibility, movement v6, strength hybrid v1). Consumers import the root API and pin a commit; localization, persistence and presentation stay outside the library.

Strength v1 reuses natal context and relations: evidence -> quantitative cross-check and qualitative rules -> review gate. No circular dependencies, network, new package, or consumer update. See [strength contract](docs/strength-hybrid-v1.md), [ADR-0001](docs/adr/0001-strength-hybrid.md), [consumer contract](docs/consumer-contract.md).
