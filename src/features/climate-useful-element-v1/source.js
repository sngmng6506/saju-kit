// Source-specific excerpts only; no inferred completion of the 120 cells.
// "groups" are source-reported ordinary review order, not final selection.
export const CLIMATE_SOURCE='https://zh.wikisource.org/zh-hant/%E7%A9%AE%E9%80%9A%E5%AF%B6%E9%91%91';
const rows=[
 ['갑','해','三冬甲木',[['경','정'],['병']],['water-excess-earth-remedy']],
 ['갑','자','三冬甲木',[['정'],['경'],['병']],['gui-controls-ding','water-excess']],
 ['갑','축','三冬甲木',[['경'],['정']],['wood-fire-chain']],
 ['신','해','三冬辛金',[['임'],['병']],['water-excess','earth-obstructs-water']],
 ['신','자','三冬辛金',[['임','병']],['gui-freezes-metal','special-water-pattern-exception']],
 ['신','축','三冬辛金',[['병'],['임'],['무','기']],['water-excess-earth-remedy']],
 ['경','사','三夏庚金',[['임','병','무']],['order-context-dependent','metal-formation-exception']],
 ['경','오','三夏庚金',[['임'],['계']],['earth-controls-water','no-water-earth-alternative','special-pattern-exception']],
 ['경','미','三夏庚金',[['정'],['갑']],['earth-formation-reverses-order','gui-controls-ding']],
 ['병','오','三夏丙火',[['임'],['경']],['earth-controls-water','ding-ren-combination','special-fire-pattern-exception']],
 ['병','미','三夏丙火',[['임'],['경']],['earth-controls-water']]
];
export function climateSourceRow(stem,branch){
 const row=rows.find(r=>r[0]===stem&&r[1]===branch);
 if(!row)return null;
 return {sourceId:'qiongtong-electronic-v1',url:CLIMATE_SOURCE,section:row[2],dayStem:stem,monthBranch:branch,
  groups:row[3].map(g=>[...g]),qualifiers:[...row[4]],scope:'partial-seasonal-use-text-not-pure-climate',orderStatus:'source-baseline-context-unresolved'};
}
export const CLIMATE_SOURCE_COVERAGE=rows.length;
