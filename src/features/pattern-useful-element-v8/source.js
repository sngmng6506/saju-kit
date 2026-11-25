// Source-scoped structural readings of 論雜氣如何取用, not a universal
// rule that generation is good or control is bad. Each clause is auditable.
export const MIXED_SOURCE='https://www.kaucim.ai/bazi/ziping-zhenquan/lun-za-qi-ru-he-qu-yong';
const v=stem=>({kind:'visible',stem}),g=element=>({kind:'group',element}),abs=element=>({kind:'group-absent',element});
export const mixedRules=[
 {id:'jia-chen-resource-aligned',day:'갑',month:'진',clauses:[v('계'),g('water')],reading:'aligned',participants:['계'],primary:'resource',mechanism:'projection-and-group-same-resource'},
 {id:'bing-chen-officer-resource',day:'병',month:'진',clauses:[v('계'),v('을')],reading:'aligned',participants:['계','을'],mechanism:'officer-generates-resource-resource-controls-hidden-earth'},
 {id:'jia-chou-wealth-officer-projected',day:'갑',month:'축',clauses:[v('신'),v('기')],reading:'aligned',participants:['신','기'],mechanism:'wealth-generates-officer'},
 {id:'jia-chou-wealth-officer-group',day:'갑',month:'축',clauses:[g('metal'),v('기')],reading:'aligned',participants:['기'],mechanism:'wealth-generates-officer-group'},
 {id:'ren-wei-officer-hurting-group',day:'임',month:'미',clauses:[v('기'),g('wood')],reading:'opposed',participants:['기'],mechanism:'output-group-controls-officer'},
 {id:'jia-chen-wealth-resource-combine',day:'갑',month:'진',clauses:[v('무'),v('계'),{kind:'combination',stems:['무','계']}],reading:'opposed',participants:['무','계'],mechanism:'wealth-resource-combination-contact'},
 {id:'jia-chen-wealth-resource-control',day:'갑',month:'진',clauses:[v('무'),v('임')],reading:'opposed',participants:['무','임'],mechanism:'wealth-controls-resource'},
 {id:'jia-xu-officer-hurting-group',day:'갑',month:'술',clauses:[v('신'),v('정'),g('fire')],reading:'opposed',participants:['신','정'],mechanism:'hurting-officer-and-output-group'},
 {id:'jia-chen-resource-output-risk',day:'갑',month:'진',clauses:[v('임'),v('병'),abs('water')],reading:'aligned-to-opposed',participants:['임','병'],mechanism:'output-generates-hidden-earth-threatening-resource'},
 {id:'jia-chen-resource-output-protected',day:'갑',month:'진',clauses:[v('임'),v('병'),g('water')],reading:'aligned',participants:['임','병'],primary:'resource',mechanism:'resource-group-context-preserves-output'},
 {id:'jia-chen-resource-clash',day:'갑',month:'진',clauses:[v('임'),{kind:'month-clash',branch:'술'}],reading:'aligned-to-opposed',participants:['임'],mechanism:'month-clash-exposes-storage-resource'},
 {id:'gui-chen-officer-regulates-peer-group',day:'계',month:'진',clauses:[v('무'),g('water')],reading:'opposed-to-aligned',participants:['무'],mechanism:'officer-controls-peer-group'},
 {id:'bing-chen-food-regulates-killing',day:'병',month:'진',clauses:[v('무'),v('임')],reading:'opposed-to-aligned',participants:['무','임'],mechanism:'food-controls-killing'}
];
