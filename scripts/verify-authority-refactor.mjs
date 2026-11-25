import {verifyRefactor} from './lib/refactor-equivalence.mjs';
const baseline=process.argv[2]??'f7f0c71bc1fcc3e21dceafbbeca26f9e8a3a2ea2';
const policies=[
  [
    "analyzeUsefulElementReview",
    "useful-element-review-v1"
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
    "analyzeClimateUsefulElement",
    "climate-useful-element-v1"
  ],
  [
    "analyzeClimateUsefulElementV2",
    "climate-useful-element-v2"
  ],
  [
    "analyzeClimateUsefulElementV3",
    "climate-useful-element-v3"
  ],
  [
    "analyzeClimateUsefulElementV5",
    "climate-useful-element-v5"
  ]
];
const extra=({old,compare})=>{
 for(const y of [1980,2000,2026])for(let m=1;m<=12;m++)for(const d of [9,23]){
  const birth={y,m,d,hh:12,mm:0},saju=old.getSaju(birth);
  for(const [name,policy] of policies)compare(name,{saju,birth,birthBasis:'verified-chart',policy},'exact birth '+y+'-'+m+'-'+d,undefined,true);
 }
 const birth={y:1980,m:1,d:9,hh:12,mm:0},saju=old.getSaju(birth);
 for(const [name,policy] of policies)for(const supplied of [{y:2026,m:6,d:1,hh:12,mm:0},{...birth,period:1}])
  compare(name,{saju,birth:supplied,birthBasis:'verified-chart',policy},'timing boundary');
};
console.log(JSON.stringify(await verifyRefactor({baseline,policies,extra}),null,2));
