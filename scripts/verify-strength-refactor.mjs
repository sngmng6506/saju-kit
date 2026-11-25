import {verifyRefactor} from './lib/refactor-equivalence.mjs';
const baseline=process.argv[2]??'cd65210e911f9d80a46f236871e786bdf4d70ed5';
const policies=[
 ['analyzeDayMasterStrength','strength-hybrid-v1'],
 ['analyzeOrdinaryStrength','strength-ordinary-v2'],
 ['analyzeStructuralStrength','strength-structural-v3'],
 ['analyzeQuantitativeStrength','strength-quantitative-v3'],
 ['analyzeMultiaxisStrength','strength-multiaxis-v1'],
 ['analyzeMultiaxisStrengthV2','strength-multiaxis-v2'],
 ['analyzeMultiaxisStrengthV3','strength-multiaxis-v3'],
 ['analyzeMultiaxisStrengthV4','strength-multiaxis-v4'],
 ['analyzeStrengthDecision','strength-decision-v1'],
 ['analyzeResourceAccess','resource-access-v1'],
 ['analyzeRouteBudget','route-budget-v1'],
 ['analyzeOutputCapacity','output-capacity-v1'],
];
const neutralPolicies=['strength-quantitative-v3','strength-multiaxis-v1','strength-multiaxis-v2','strength-multiaxis-v3','route-budget-v1','output-capacity-v1'];
const extra=({old,compare})=>{
 for(let m=1;m<=12;m++){
  const birth={y:2026,m,d:9,hh:12,mm:0},saju=old.getSaju(birth);
  const input={saju,birth,birthBasis:'verified-chart',policy:'strength-command-sensitivity-v1'};
  compare('analyzeMonthCommandSensitivity',input,'exact birth '+m,undefined,true);
  compare('analyzeMonthCommandSensitivity',{...input,birth:null},'missing birth '+m,undefined,true);
 }
};
console.log(JSON.stringify(await verifyRefactor({baseline,policies,neutralPolicies,extra}),null,2));
