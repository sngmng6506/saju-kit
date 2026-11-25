import { climateSourceRowV2,CLIMATE_V2_COVERAGE } from './source-v2.js';
export const CLIMATE_V3_SOURCE='https://zh.wikisource.org/w/index.php?title=穷通宝鉴&oldid=2294674';
// Selective abstractions from explicitly named passages in the electronic
// witness; order is textual, and the conditions remain unadjudicated.
// Conditional rows have no unconditional first group.
const rows=[
 ['갑','신','三秋甲木','정/경',['gui-controls-ding','water-excess']],
 ['갑','유','三秋甲木','정/병/경',['wood-formation-reorders','gui-controls-fire']],
 ['갑','술','三秋甲木','정계',['ren-moisture-review','geng-context','earth-excess']],
 ['을','인','三春乙木','병/계',['fire-water-balance']],
 ['을','묘','三春乙木','병/계',['wood-formation-gui','water-excess']],
 ['을','진','三春乙木','계/병',['fire-water-balance']],
 ['을','사','三夏乙木','계/병/경신',['earth-controls-gui','metal-support']],
 ['을','오','三夏乙木','',['summer-solstice','metal-water-excess'],[['before-summer-solstice','계'],['after-summer-solstice','병계'],['metal-water-excess','병/계']]],
 ['을','미','三夏乙木','',['metal-water-excess','earth-controls-gui'],[['metal-water-excess','병'],['gui-moisture-review','계']]],
 ['을','신','三秋乙木','',['metal-excess','transformation-exception'],[['seasonal-general','병/계'],['geng-excess','기'],['geng-scarce','계병']]],
 ['을','유','三秋乙木','',['autumn-equinox'],[['before-autumn-equinox','계'],['after-autumn-equinox','병/계']]],
 ['을','술','三秋乙木','계/신',['ren-excess','follow-wealth-exception']],
 ['을','해','三冬乙木','병/무',['water-excess','wood-formation']],
 ['을','자','三冬乙木','병',['gui-controls-fire','water-excess','follow-wealth-exception']],
 ...['신','유','술'].map(b=>['기',b,'三秋己土','계/병/신',[...(b==='술'?['earth-excess-jia']:[]),'metal-formation','fire-water-balance'],b==='술'?[['earth-excess','갑']]:[],'season']),
 ['임','해','三冬壬水','무병/경',['wood-controls-wu','water-formation-exception']],
 ['임','자','三冬壬水','무/병',['water-formation-exception','ding-ren-combination']],
 ['임','축','三冬壬水','병/정갑',['half-month-command','ren-excess-wu','bing-xin-combination'],[['late-half','병/갑']]],
 ['계','인','三春癸水','신/병',['fire-controls-metal','geng-substitute']],
 ['계','묘','三春癸水','경/신',['wood-formation','ding-controls-metal']],
 ['계','해','三冬癸水','경신',['wood-formation','ren-excess-wu']],
 ['계','자','三冬癸水','병/신',['water-excess','fire-root-required']],
 ['계','축','三冬癸水','병',['bing-xin-combination','fire-root-required','water-excess']]
];
const groups=s=>s?s.split('/').map(g=>[...g]):[];
const keys=new Set();
for(const r of rows){
 const k=r[0]+r[1];
 if(keys.has(k)||climateSourceRowV2(r[0],r[1]))throw Error('duplicate climate cell '+k);
 if(!'갑을병정무기경신임계'.includes(r[0])||!'자축인묘진사오미신유술해'.includes(r[1]))throw Error('invalid climate key');
 for(const s of [r[3],...(r[5]??[]).map(a=>a[1])])if([...s.replaceAll('/','')].some(x=>!'갑을병정무기경신임계'.includes(x)))throw Error('invalid climate stem');
 keys.add(k);
}
export const CLIMATE_V3_COVERAGE=CLIMATE_V2_COVERAGE+rows.length;
export function climateSourceRowV3(stem,branch){
 const old=climateSourceRowV2(stem,branch);
 if(old)return old;
 const r=rows.find(x=>x[0]===stem&&x[1]===branch);
 if(!r)return null;
 return {sourceId:'qiongtong-electronic-rev2294674',url:CLIMATE_V3_SOURCE,section:r[2],dayStem:stem,monthBranch:branch,
 groups:groups(r[3]),qualifiers:[...r[4]],alternatives:(r[5]??[]).map(([when,s])=>({when,stems:groups(s).flat(),groups:groups(s),conditionResolved:false})),
 sourceGranularity:r[6]??'month',tableVersion:'qiongtong-electronic-v3',
 scope:'partial-seasonal-use-text-not-pure-climate',orderStatus:r[3]?'source-baseline-context-unresolved':'conditional-order-unresolved'};
}
