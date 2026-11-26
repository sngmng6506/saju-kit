# P2-E conditional signed argumentation

## Scope
Development-only conditional evaluation of the existing joint route
scenario (leg readiness, path readiness and pressure relief readiness).
This is not an actual-effect model. The P2-B/D force-basis scenario
and this joint-assumption scenario remain distinct semantic domains:
there is not yet a reviewed binding from root eligibility or profile
dominance to path-operation, relief, restriction or recipient capacity.

## Shared domain
The original Boolean scenario evaluator and the conditional evaluator
use the same prepareScenarioDomain implementation for validation,
bounded exact enumeration, explicit constraints and witness assignments.
Formula data cannot provide executable code. The visitor is internal
application code. The original pair/set APIs remain compatible.

## Conditional proof contract
- Replay the original signed packet before evaluating any scenario.
- Bind an unrecorded observation to an explicit Boolean formula;
  multiple observations can refer to the same variable. True adds a
  hypothetical positive sign; false adds a hypothetical negative sign.
- Never replace recorded evidence, assume an effect or inject a fact
  into a derived structural hypothesis. Unbound observations remain
  unknown. The baseline packet is unchanged.
- In each admissible assignment, run the existing argumentation engine
  with only those extra hypothetical facts. Independent seeds,
  conjunctive rules, alternative rules and observation undercuts retain
  their exact semantics; unseeded cycles do not self-justify.
- Count all four proof states and retain one witness per state.
  Invariant means the same state in every admitted assignment.
- Exact set frontiers use strictly supported targets, not conflicting
  targets. The existing set algorithm is reused.
- No admissible completion, partial scope or budget exhaustion yields
  no positive conditional verdict. Limits include 16 referenced unknowns,
  64 bindings, and a bounded repeated-proof work estimate. Set frontiers
  retain their independent query/output budgets.
- The joint projection binds only its explicitly registered unresolved
  assumptions; these are hypothetical predicates, not physical facts.
  All original actual-effect judgments remain unresolved.

## Verification
`node --test test/outcome-scenario-space.test.mjs test/outcome-scenario-sets.test.mjs test/outcome-conditional-arguments.test.mjs test/outcome-conditional-joint-review.test.mjs`

Then run native V10 integration and the full regression suite. Generic
tests cover shared formula aliases, all four states, cycles, undercuts,
authority violations, empty domains and scope/work limits. The joint
fixture tests use the real joint compiler and argumentation engine.

## Next gate
Complete native integration before promoting any diagnostic to V10.
Review semantic bridges and literature independently. Do not equate
root eligibility with relief, path operation or generation reception,
or infer physical exclusions from scenario counts.
