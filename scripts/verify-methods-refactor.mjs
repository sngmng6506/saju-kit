import {verifyRefactor} from './lib/refactor-equivalence.mjs';
const baseline=process.argv[2]??'668a292aa8bee64bf1a24d695378016809334b4d';
const policies=[
  [
    "analyzeBalanceUsefulElement",
    "balance-useful-element-v1"
  ],
  [
    "analyzeBalancePriority",
    "balance-priority-v1"
  ],
  [
    "analyzeBalanceRouteReview",
    "balance-route-review-v1"
  ],
  [
    "analyzeMediationUsefulElement",
    "mediation-useful-element-v1"
  ],
  [
    "analyzeRemedyEvidence",
    "remedy-evidence-v1"
  ],
  [
    "analyzeUsefulElementReview",
    "useful-element-review-v1"
  ],
  [
    "analyzeMultiaxisStrengthV4",
    "strength-multiaxis-v4"
  ]
];
console.log(JSON.stringify(await verifyRefactor({baseline,policies}),null,2));
