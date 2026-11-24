import { climateSourceRow, CLIMATE_SOURCE_COVERAGE } from '../climate-useful-element-v1/source.js';
const URL='https://zh.wikisource.org/zh-hant/窮通寶鑑';
// Explicit source baseline or shared seasonal passage; conditional alternatives
// are recorded separately, never silently promoted to unconditional groups.
const rows=[
 ['갑','인','三春甲木',[['병','계']],['water-excess','metal-excess'],[],'month'],
 ['갑','진','三春甲木',[['경'],['임']],['metal-excess','fire-controls-metal'],[],'month'],
 ['갑','사','三夏甲木',[['계'],['정']],['metal-excess'],[{when:'metal-excess',stems:['임']},{when:'supporting-metal-review',stems:['경']}],'month'],
 ['갑','오','三夏甲木',[['계'],['정'],['경']],['wood-metal-relative-strength'],[{when:'gui-absent',stems:['정']}],'month'],
 ['갑','미','三夏甲木',[['정'],['경']],['wood-metal-relative-strength','gui-not-required'],[],'month'],
 ['무','인','三春戊土',[['병'],['갑'],['계']],['fire-excess','wood-excess'],[],'shared-months'],
 ['무','묘','三春戊土',[['병'],['갑'],['계']],['fire-excess','wood-excess'],[],'shared-months'],
 ['무','진','三春戊土',[['갑'],['병'],['계']],['fire-excess','wood-formation'],[],'month'],
 ['무','해','三冬戊土',[['갑'],['병']],['metal-controls-wood','water-controls-fire'],[],'month'],
 ['무','자','三冬戊土',[['병'],['갑']],['fire-excess','special-wealth-pattern'],[],'shared-months'],
 ['무','축','三冬戊土',[['병'],['갑']],['fire-excess','special-wealth-pattern'],[],'shared-months'],
 ['기','인','三春己土',[['병']],['ren-excess'],[{when:'ren-excess',stems:['무']},{when:'supplemental-moisture',stems:['계']}],'month'],
 ['기','묘','三春己土',[['갑'],['계']],['jia-ji-combination','metal-controls-wood'],[{when:'additional-warmth',stems:['병']}],'month'],
 ['기','진','三春己土',[['병'],['계'],['갑']],['metal-controls-wood'],[],'month'],
 ...['사','오','미'].map(b=>['기',b,'三夏己土',[['계'],['병']],['wu-gui-combination','fire-excess'],[{when:'gui-absent',stems:['임']},{when:'water-source-review',stems:['신']}],'season']),
 ...['해','자','축'].map(b=>['기',b,'三冬己土',[['병'],['갑']],['ren-excess','special-wealth-pattern'],b==='해'?[{when:'early-winter-ren-excess',stems:['무']}]:[],'season']),
 ['병','인','三春丙火',[['임'],['경']],['ren-excess','earth-controls-water'],[{when:'metal-assistance',stems:['신']}],'month'],
 ['병','묘','三春丙火',[['임']],['ding-ren-combination','ren-excess'],[{when:'ren-absent',stems:['기']}],'month'],
 ['병','진','三春丙火',[['임']],['earth-formation'],[{when:'earth-formation',stems:['갑']},{when:'jia-absent-in-earth-context',stems:['경']}],'month'],
 ['병','사','三夏丙火',[['임'],['경']],['earth-controls-water','ren-excess'],[{when:'ren-absent',stems:['계']}],'month'],
 ['계','사','三夏癸水',[['신']],['ding-controls-metal'],[{when:'xin-absent',stems:['경']}],'month'],
 ['계','오','三夏癸水',[['경','신','임']],['ding-controls-metal','peer-assistance'],[],'month'],
 ['계','미','三夏癸水',[['경','신']],['half-month-dependent','ding-controls-metal'],[{when:'early-half-weak-metal',stems:['임','계']}],'month']
];
export const CLIMATE_V2_COVERAGE=CLIMATE_SOURCE_COVERAGE+rows.length;
export function climateSourceRowV2(stem,branch){
 const legacy=climateSourceRow(stem,branch);
 if(legacy)return {...legacy,sourceGranularity:'legacy-month-profile',alternatives:[],tableVersion:'qiongtong-electronic-v2'};
 const row=rows.find(r=>r[0]===stem&&r[1]===branch);
 if(!row)return null;
 return {sourceId:'qiongtong-electronic-v2',url:URL,section:row[2],dayStem:stem,monthBranch:branch,
 groups:row[3].map(g=>[...g]),qualifiers:[...row[4]],alternatives:row[5].map(a=>({when:a.when,stems:[...a.stems],conditionResolved:false})),
 sourceGranularity:row[6],tableVersion:'qiongtong-electronic-v2',scope:'partial-seasonal-use-text-not-pure-climate',orderStatus:'source-baseline-context-unresolved'};
}
