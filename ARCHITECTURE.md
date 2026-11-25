# Architecture

The dependency-free ESM engine uses a functional core. `src/data` contains pinned calendar data; `src/core` owns calendar, elemental/hidden-stem correspondences, and structural observations. `src/features` owns opt-in, versioned policies (day compatibility, movement v6, strength hybrid v1). Consumers import the root API and pin a commit; localization, persistence and presentation stay outside the library.

Strength v1 reuses natal context and relations: evidence -> quantitative cross-check and qualitative rules -> review gate. No circular dependencies, network, new package, or consumer update. See [strength contract](docs/strength-hybrid-v1.md), [ADR-0001](docs/adr/0001-strength-hybrid.md), [consumer contract](docs/consumer-contract.md).

Core element-structure exposes neutral elemental profiles, generating/controlling paths and positional relation observations. Experimental strength-ordinary-v2 consumes these plus frozen v1 quantitative scenarios, but not its review gate. See [ADR-0002](docs/adr/0002-ordinary-strength.md) and [contract](docs/strength-ordinary-v2.md).

Core interaction-context adds occurrence-aware formation/clash context. The separate interaction-sensitivity-v1 feature uses frozen strength policies to run isolated hypothetical perturbations without changing baseline classifications. [ADR-0003](docs/adr/0003-interaction-sensitivity.md), [contract](docs/interaction-sensitivity-v1.md).

Core root-dynamics exposes versioned life stages, positional literal roots, season/principal context and occurrence-aware protective/mediating paths. It depends only on core modules; no classifier consumes it yet. [ADR-0004](docs/adr/0004-root-dynamics.md), [contract](docs/root-dynamics-v1.md).

The experimental structural strength v3 feature consumes root-dynamics and existing elemental category mapping, returns qualitative hypotheses only, and leaves earlier classifiers unchanged. [ADR-0005](docs/adr/0005-structural-strength.md), [contract](docs/strength-structural-v3.md).

The experimental quantitative v3 feature consumes element structure and the existing internal hour-pillar calculation, returns a separate root/season-aware sensitivity index, and does not integrate structural v3 into a final classifier. [ADR-0006](docs/adr/0006-quantitative-strength.md), [contract](docs/strength-quantitative-v3.md).

Multi-axis strength v1 consumes root dynamics and frozen quantitative-v3 scenario contributions; root capacity, environment and interaction evidence remain separate. [ADR-0007](docs/adr/0007-multiaxis-strength.md), [contract](docs/strength-multiaxis-v1.md).

Core support-network consumes root-dynamics and exposes category-specific directed interaction evidence, without a classifier dependency. [Contract](docs/support-network-v1.md).

Multiaxis v2 composes frozen v1 and support-network; numeric axes are unchanged, decision policy separately versioned. [ADR-0008](docs/adr/0008-pressure-sensitive-strength.md).

Resource-access v1 composes support-network and quantitative-v3; no classifier dependency or effective-force inference. [ADR-0009](docs/adr/0009-resource-access.md).

Route-budget v1 composes support-network and quantitative-v3, with source-budget conservation and no effective-force inference. [ADR-0010](docs/adr/0010-route-budget.md).

Output-capacity v1 composes route-budget and frozen quantitative evidence; incoming target caps are hypothetical and do not mutate source masses. [ADR-0011](docs/adr/0011-output-capacity.md).

Integrated multiaxis v3 composes v2 and output-capacity, matching scenario profiles without overriding baseline conflicts. [ADR-0012](docs/adr/0012-integrated-strength.md).

The opt-in pattern v7 composes v6 and a source-scoped composition review. Original-pattern preservation and explicit secondary-pattern hypotheses are separate; generic projected pairs remain neutral. No final selection authority or consumer promotion. [Contract](docs/pattern-useful-element-v7.md).
