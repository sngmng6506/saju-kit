import { CATEGORIES } from './hybrid-evidence.js';

// Position weights sum to 100. Hidden-stem weights sum to 100 per branch.
// Integer hundredths avoid floating point ambiguity at policy thresholds.
const POSITIONS = {
  balanced:[5,9,10,30,21,10,15],
  distributed:[7,10,12,25,20,11,15],
  'month-heavy':[4,8,9,35,22,8,14],
};
const ROLES = {
  base:{three:{principal:60,middle:30,residual:10},two:{principal:80,residual:20}},
  'principal-heavy':{three:{principal:75,middle:20,residual:5},two:{principal:90,residual:10}},
  distributed:{three:{principal:50,middle:30,residual:20},two:{principal:70,residual:30}},
};
const SLOTS = ['yearStem','yearBranch','monthStem','monthBranch','dayBranch','hourStem','hourBranch'];
const THRESHOLDS = [[35,65],[30,70],[40,60]];

function rangeCategory(min,max,weak,strong) {
  if(max<=weak*100)return 'weak';
  if(min>=strong*100)return 'strong';
  if(min>weak*100&&max<strong*100)return 'mixed';
  return null;
}
export function stableCategory(min,max) {
  const categories=THRESHOLDS.map(([weak,strong])=>rangeCategory(min,max,weak,strong));
  return categories.every(category=>category===categories[0])?categories[0]:null;
}

export function quantify(evidence) {
  const slots = new Map([
    ...evidence.stems.map(stem=>[stem.position+'Stem',stem]),
    ...evidence.branches.map(branch=>[branch.position+'Branch',branch]),
  ]);
  const scenarios=[];
  for(const [positionProfile,weights] of Object.entries(POSITIONS)){
    for(const [roleProfile,roles] of Object.entries(ROLES)){
      const mass=Object.fromEntries(CATEGORIES.map(category=>[category,0]));
      let missingWeight=0;
      for(const [i,slot] of SLOTS.entries()){
        const entry=slots.get(slot),weight=weights[i];
        if(!entry){missingWeight+=weight;continue;}
        if(!entry.hiddenStems){mass[entry.category]+=weight*100;continue;}
        const allocation=entry.hiddenStems.length===3?roles.three:roles.two;
        for(const hidden of entry.hiddenStems)mass[hidden.category]+=weight*allocation[hidden.role];
      }
      const lower=mass.peer+mass.resource,upper=lower+missingWeight*100;
      scenarios.push({positionProfile,roleProfile,knownWeight:100-missingWeight,missingWeight,
        categories:Object.fromEntries(CATEGORIES.map(category=>[category,mass[category]/100])),
        lower:lower/100,upper:upper/100,lowerUnits:lower,upperUnits:upper});
    }
  }
  const min=Math.min(...scenarios.map(s=>s.lowerUnits)),max=Math.max(...scenarios.map(s=>s.upperUnits));
  const thresholdSensitivity=THRESHOLDS.map(([weak,strong])=>({weak,strong,category:rangeCategory(min,max,weak,strong)}));
  const stable=stableCategory(min,max);
  return {baseline:scenarios[0],min:min/100,max:max/100,scenarios,thresholdSensitivity,stableCategory:stable};
}
