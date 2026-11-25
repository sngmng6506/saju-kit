import {verifyRefactor} from './lib/refactor-equivalence.mjs';
const baseline=process.argv[2]??'5c242f77be61a35804599f16bbab547d26378be2';
const policies=[
  [
    "analyzePatternUsefulElement",
    "pattern-useful-element-v1"
  ],
  [
    "analyzePatternUsefulElementV2",
    "pattern-useful-element-v2"
  ],
  [
    "analyzePatternUsefulElementV3",
    "pattern-useful-element-v3"
  ],
  [
    "analyzePatternUsefulElementV4",
    "pattern-useful-element-v4"
  ],
  [
    "analyzePatternUsefulElementV5",
    "pattern-useful-element-v5"
  ],
  [
    "analyzePatternUsefulElementV6",
    "pattern-useful-element-v6"
  ],
  [
    "analyzePatternUsefulElementV7",
    "pattern-useful-element-v7"
  ],
  [
    "analyzePatternUsefulElementV8",
    "pattern-useful-element-v8"
  ],
  [
    "analyzePatternUsefulElementV9",
    "pattern-useful-element-v9"
  ],
  [
    "analyzePatternUsefulElementV10",
    "pattern-useful-element-v10"
  ],
  [
    "analyzeUsefulElementAuthority",
    "useful-element-authority-v1"
  ],
  [
    "analyzeUsefulElementAuthorityV2",
    "useful-element-authority-v2"
  ],
  [
    "analyzeUsefulElementAuthorityV3",
    "useful-element-authority-v3"
  ],
  [
    "analyzeUsefulElementAuthorityV4",
    "useful-element-authority-v4"
  ],
  [
    "analyzeUsefulElementReview",
    "useful-element-review-v1"
  ],
  [
    "analyzeMultiaxisStrengthV4",
    "strength-multiaxis-v4"
  ],
  [
    "analyzeMultiaxisStrengthV3",
    "strength-multiaxis-v3"
  ],
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
    "analyzeClimateUsefulElementV5",
    "climate-useful-element-v5"
  ]
];
const core=[
  "analyzeNatalContext",
  "analyzeNatalRelations",
  "analyzeElementStructure",
  "analyzeInteractionContext",
  "analyzeRootDynamics",
  "analyzeFormationEvidence",
  "analyzeStemForceEvidence",
  "analyzeSupportNetwork"
];
const extra=({cases,compare})=>{
 for(const name of core){
  for(const c of cases)compare(name,{saju:c.saju},c.id,undefined,true);
  const saju=cases[0].saju;
  for(const input of [undefined,null,{}, {saju:null},{saju:{pillars:{...saju.pillars,hour:undefined}}},{saju:{pillars:{...saju.pillars,day:{stem:'갑',branch:'축',text:'갑축'}}}}])
   compare(name,input,'core boundary');
 }
};
console.log(JSON.stringify(await verifyRefactor({baseline,policies,extra}),null,2));
