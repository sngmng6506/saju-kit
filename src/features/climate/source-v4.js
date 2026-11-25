import { climateSourceRowV3,CLIMATE_V3_COVERAGE } from './source-v3.js';
export const CLIMATE_V4_SOURCE='https://www.ncc.com.tw/fate/paleo/bg/bg_11.htm';
// Selective source abstractions, not exhaustive or final prescriptions.
// Empty baseline and seasonal granularity are intentionally preserved.
const rows=`갑묘|三春甲木||wood-formation;wealth-support;gui-obstructs|metal-established:경;spring-shared-review:경무;ding-visible-review:정
을축|三冬乙木||month-specific-unverified|winter-general-review:병|season
병신|三秋丙火|임|ren-excess;earth-obstruction|ren-excess:무
병유|三秋丙火|임|earth-obstruction;special-wealth-review|ren-absent:계
병술|三秋丙火|갑/임|earth-obstruction;geng-controls-jia|ren-absent:갑계
병해|三冬丙火||relative-strength;special-pattern-review|wood-excess:경;water-excess:무;fire-excess:임;ren-excess-jia-present-wu-absent:기
병자|三冬丙火|임/무|ren-excess;earth-obstruction|wu-absent:기;ren-absent:계;ren-excess:무갑
병축|三冬丙火|임|earth-excess;water-excess|earth-excess:갑;gui-excess:기
정인|三春丁火|경|wood-excess;fire-formation;transformation-exception|ren-gui-visible:기
정묘|三春丁火|경/갑|geng-yi-combination;wood-formation;water-excess|water-excess:무
정진|三春丁火|갑/경|earth-excess;water-formation|wood-formation:경
정사|三夏丁火|갑경|gui-controls-ding;fire-excess|jia-excess:경;geng-present-jia-absent-wu-visible:무;bing-excess:임
정오|三夏丁火||fire-formation;water-obstruction|fire-formation:경임;no-fire-formation-water-visible:갑경;gui-visible-review:계
정미|三夏丁火|갑/임|water-formation;geng-support|wood-formation:갑임;water-formation:갑경
정신|三秋丁火|갑병|geng-in-shen;water-excess|jia-absent:을병;ren-gui-excess:무
정유|三秋丁火|갑병경|water-excess;special-wealth-review|jia-absent:을병;ren-gui-excess:무
정술|三秋丁火|갑경|earth-excess;special-output-review|ren-gui-excess:무
정해|三冬丁火|갑/경|ji-combines-jia;bing-obscures-ding|bing-obscures-ding:계;two-ren-compete:무|season
정자|三冬丁火|갑/경|ji-combines-jia;special-pattern-review|bing-obscures-ding:계;two-ren-compete:무|season
정축|三冬丁火|갑/경|ji-combines-jia;bing-obscures-ding|bing-obscures-ding:계;two-ren-compete:무|season
무사|三夏戊土|갑/병계|fire-excess;transformation-exception|fire-excess:계
무오|三夏戊土|임/갑|fire-formation;gui-limited|supplemental-warmth:병
무미|三夏戊土|계/병갑|earth-excess;geng-controls-jia|bing-absent:계갑
무신|三秋戊土|병/계/갑|water-formation|water-formation:갑
무유|三秋戊土|병/계|wood-not-required;water-formation|water-formation-peer-review:무기
무술|三秋戊土|갑/계|wu-gui-combination;metal-present;fire-formation|metal-present:계/병;water-formation:무
경인|三春庚金|병갑/정|earth-excess;fire-excess|fire-formation-ren-rooted:임;fire-excess:무기
경묘|三春庚金|정/갑|geng-yi-combination;wood-excess;special-wealth-review|ding-absent:병;wu-earth-excess:갑
경진|三春庚金|갑/정|earth-excess;fire-formation|ding-absent:갑병;fire-formation:계
경신|三秋庚金|정/갑|water-formation;earth-formation|water-formation-ding-absent:병;earth-formation:갑/정
경유|三秋庚金|정갑병|fire-excess;water-obstruction|
경술|三秋庚金|갑/임|ji-obstructs-ren;earth-excess|water-formation:병
경해|三冬庚金|정갑병|water-formation;metal-formation|hai-zi-present:기
경자|三冬庚金|정갑/병|fire-excess;water-formation|
경축|三冬庚金|병/정/갑|earth-excess;metal-formation|
신인|三春辛金|기/임|jia-controls-earth;fire-formation;water-formation|water-formation:병;fire-formation:경임
신묘|三春辛金|임|earth-obstruction;water-excess;wood-formation|earth-obstruction:갑;ren-excess:무;wood-formation:경
신진|三春辛金|임/갑|bing-xin-combination;earth-excess;fire-excess|bing-competes:계;fire-excess:계
신사|三夏辛金|임|fire-excess;wu-obstructs-ren|fire-excess-no-water:무기;wu-visible-review:갑
신오|三夏辛金|임기|fire-formation;wu-gui-combination|ren-absent:계기;water-earth-excess:갑
신미|三夏辛金|임/경|wu-obstructs-ren;ji-jia-combination;wood-formation|wu-visible-review:갑;only-wei-ji-review:임기
신신|三秋辛金|임|earth-obstruction;gui-not-required|earth-obstruction:갑;water-excess:무
신유|三秋辛金|임|earth-obstruction;wood-excess;metal-formation|earth-obstruction:갑;metal-formation-ren-absent:정;water-excess:무
신술|三秋辛金|임/갑|earth-excess;fire-excess|ren-absent-gui-review:계
임인|三春壬水|경/병|peer-root-review;water-excess|peer-and-metal-support:무;earth-excess:갑
임묘|三春壬水|무/신/경|wood-formation;water-excess|wood-formation:경;wood-fire-excess:임계
임진|三春壬水|갑/경|earth-excess;ding-ren-combination|jia-moisture-review:계
임사|三夏壬水|임/신/경|special-wealth-review;metal-excess|metal-excess:무;gui-xin-visible-review:계신갑
임오|三夏壬水|계/경|fire-formation;water-source-review|xin-support:신계
임미|三夏壬水||textual-order-variation;earth-excess;wood-formation|opening-order-review:신계/갑;summary-order-review:신/갑/계;earth-excess:갑을
임신|三秋壬水|무/정|wu-root-position;wu-gui-combination|wu-excess:갑
임유|三秋壬水|갑/경|geng-controls-jia;earth-obstruction|ren-visible-shen-hai-present:무;jia-absent:경신
임술|三秋壬水|갑/병|earth-excess;water-excess|water-excess-bing-absent:무
계진|三春癸水||grain-rain;transformation-exception|before-grain-rain:병;after-grain-rain:병/신갑
계신|三秋癸水|정|metal-excess;fire-root-review|jia-support:갑정
계유|三秋癸水|신/병|earth-obstruction;bing-xin-combination|
계술|三秋癸水|신갑|earth-excess;peer-support|peer-support:계`.split('\n');
const stems='갑을병정무기경신임계',branches='자축인묘진사오미신유술해';
const groups=s=>s?s.split('/').map(g=>[...g]):[];
const table=new Map();
for(const line of rows){
 const [key,section,baseline,qualifiers,encoded,granularity='month']=line.split('|');
 const [stem,branch]=key;
 if(key.length!==2||!stems.includes(stem)||!branches.includes(branch)||table.has(key)||climateSourceRowV3(stem,branch))throw Error('invalid climate key '+key);
 const alternatives=encoded?encoded.split(';').map(item=>{
  const [when,value]=item.split(':');
  if(!when||!value)throw Error('invalid climate alternative '+key);
  return {when,stems:groups(value).flat(),groups:groups(value),conditionResolved:false};
 }):[];
 if(new Set(alternatives.map(a=>a.when)).size!==alternatives.length||(!baseline&&!alternatives.length))throw Error('invalid climate alternatives '+key);
 for(const g of [...groups(baseline),...alternatives.flatMap(a=>a.groups)])if(!g.length||g.some(s=>!stems.includes(s)))throw Error('invalid climate stem '+key);
 table.set(key,{sourceId:'qiongtong-ncc-electronic-20261125',url:CLIMATE_V4_SOURCE,section,dayStem:stem,monthBranch:branch,
  groups:groups(baseline),qualifiers:qualifiers.split(';'),alternatives,sourceGranularity:granularity,
  tableVersion:'qiongtong-electronic-v4',scope:'partial-seasonal-use-text-not-pure-climate',
  orderStatus:baseline?'source-baseline-context-unresolved':'conditional-order-unresolved'});
}
export const CLIMATE_V4_COVERAGE=CLIMATE_V3_COVERAGE+table.size;
export function climateSourceRowV4(stem,branch){
 const prior=climateSourceRowV3(stem,branch);
 if(prior)return prior;
 if(typeof stem!=='string'||typeof branch!=='string'||stem.length!==1||branch.length!==1)return null;
 const row=table.get(stem+branch);
 return row?JSON.parse(JSON.stringify(row)):null;
}
