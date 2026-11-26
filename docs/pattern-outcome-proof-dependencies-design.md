# P2-C signed proof dependency analysis

## Scope
Development diagnostics only. Analyze logical prerequisite cycles in
joint, generation and control proof packets, not cycles in the physical
interaction topology. The generation graph already includes the modeled
consequence graph; do not count the latter separately.

## Contract
- Each vertex is a signed proposition, not merely a proposition ID.
- Edges point from rule conclusions to their premises. Strongly connected
  components identify potential cyclic dependencies, not rule sufficiency.
- Full topology retains every rule. Active topology excludes rules
  undercut by observed evidence or unavailable by scope.
- The existing argumentation engine determines least grounded closure.
  Missing support never constitutes opposition. Alternative rules are OR;
  premises within one rule are AND.
- The structural upper bound grants both signs to every observation,
  retains existing evidence and drops undercuts. This is deliberately
  more permissive than any admissible completion. It is not a scenario,
  not new production evidence and not a positive effect verdict.
- A component with no reachable member even in this upper bound is
  structurally seedless under the supplied rule graph. Reachability in
  the upper bound does not establish feasibility or simultaneous truth.
- Preserve original graph namespaces, replay judgments/rule results and
  maintain the no-effect/no-selection authority boundary.
- Missing hour or engine budget exhaustion does not produce a cycle
  classification.

## Validation
Run `node --test test/outcome-proof-dependencies.test.mjs test/outcome-interaction-proof-review.test.mjs`
then native integration and full regression. Unit cases cover mutual
dependency, grounded alternatives, AND gates, signed literals, self-loops,
undercuts and a deliberately non-admissible upper bound.

## Next boundary
Use common admissible scenarios to evaluate whole sets of proof targets,
not merely pairwise properties or SCC connectivity. Do not infer actual
operation, capacity allocation, or classical validity from proof topology.
