// Selective abstractions of 子平真詮, not sufficient conditions of 成格.
export const PATTERN_SOURCES=Object.freeze({
 selection:'https://donglishuzhai.net/chapter/3721.html',
 change:'https://www.donglishuzhai.net/chapter/3723.html',
 outcome:'https://www.donglishuzhai.net/chapter/3722.html',
 blade:'https://donglishuzhai.net/chapter/3756.html',
 peer:'https://www.donglishuzhai.net/chapter/3758.html'
});
export const LU=Object.freeze({갑:'인',을:'묘',병:'사',정:'오',무:'사',기:'오',경:'신',신:'유',임:'해',계:'자'});
export const BLADE=Object.freeze({갑:'묘',병:'오',무:'오',경:'유',임:'자'});
export function patternFamily(tenGod){
 if(['정재','편재'].includes(tenGod))return 'wealth';
 if(['정인','편인'].includes(tenGod))return 'resource';
 return ({정관:'officer',편관:'killing',식신:'food',상관:'hurting-officer',비견:'peer',겁재:'peer'})[tenGod];
}
// Each row is a textual review motif; not a decision rule. Positive motifs
// and conflicts can coexist. Clauses marked contextual never resolve in v1.
const P=(...gods)=>({kind:'present',gods}),V=(...gods)=>({kind:'visible',gods}),A=(...gods)=>({kind:'absent',gods}),C=name=>({kind:'contextual',name}),M=()=>({kind:'month-disruption-absent'});
const W=['정재','편재'],I=['정인','편인'],O=['정관','편관'],E=['식신','상관'],B=['비견','겁재'];
const rules={
 officer:[
  ['support','officer-wealth',[P(...W),M(),C('wealth-generates-officer-effect')]],
  ['support','officer-resource',[P(...I),M(),C('resource-protects-officer-effect')]],
  ['damage','officer-hurting',[P('상관'),C('hurting-controls-officer-effect')]],
  ['damage','officer-punishment-clash',[C('officer-relevant-disruption')]],
  ['rescue','resource-protects-officer',[P('상관'),V(...I),C('resource-controls-hurting-effect')]],
  ['rescue','combine-killing-to-clear',[P('편관'),C('killing-combined-without-loss-of-officer')]]],
 wealth:[
  ['support','wealth-generates-officer',[P('정관'),C('officer-effective')]],
  ['support','food-generates-wealth',[P('식신'),P(...B),C('day-strong')]],
  ['support','wealth-resource-placement',[V(...I),C('wealth-resource-noninterference')]],
  ['damage','weak-wealth-heavy-peer',[P(...B),C('wealth-light-peer-heavy')]],
  ['damage','wealth-killing',[V('편관'),C('wealth-supports-killing-effect')]],
  ['rescue','food-mediates-peer-wealth',[P('겁재'),V(...E),C('peer-output-wealth-path')]],
  ['rescue','officer-controls-peer',[P('겁재'),P('정관'),C('officer-controls-peer-effect')]]],
 resource:[
  ['support','light-resource-killing',[P('편관'),C('resource-light')]],
  ['support','officer-resource',[P('정관'),C('officer-generates-resource-effect')]],
  ['support','resource-output',[P(...E),C('day-and-resource-strong')]],
  ['support','heavy-resource-wealth',[V(...W),C('resource-heavy-wealth-light-root')]],
  ['damage','wealth-damages-resource',[P(...W),C('resource-light')]],
  ['damage','heavy-resource-killing',[V('편관'),C('day-and-resource-strong')]],
  ['rescue','peer-protects-resource',[P(...W),P('겁재'),C('peer-controls-wealth-effect')]],
  ['rescue','combine-wealth',[P(...W),C('wealth-combined-resource-preserved')]]],
 food:[
  ['support','food-generates-wealth',[P(...W),C('food-wealth-effect')]],
  ['support','food-to-killing-resource',[P('편관'),A(...W),V(...I),C('abandon-food-use-killing')]],
  ['damage','owl-seizes-food',[P('편인'),C('owl-controls-food-effect')]],
  ['damage','food-wealth-killing',[P(...W),V('편관'),C('wealth-supports-killing-effect')]],
  ['rescue','wealth-protects-food',[P('편인'),P(...W),C('wealth-controls-owl-effect')]]],
 killing:[
  ['support','food-controls-killing',[P('식신'),C('day-strong'),C('food-controls-killing-effect')]],
  ['damage','wealth-supports-uncontrolled-killing',[P(...W),C('killing-uncontrolled')]],
  ['damage','resource-protects-killing',[P('식신'),P(...I),C('resource-blocks-food-effect')]],
  ['rescue','wealth-removes-resource',[P('식신'),P(...I),P(...W),C('wealth-controls-resource-preserves-food')]]],
 'hurting-officer':[
  ['support','hurting-generates-wealth',[P(...W),C('hurting-wealth-effect')]],
  ['support','hurting-with-resource',[P(...I),C('hurting-strong-resource-rooted')]],
  ['support','hurting-killing-no-wealth',[P('편관'),A(...W),C('hurting-controls-killing-effect')]],
  ['damage','hurting-meets-officer',[P('정관'),C('non-metal-water-exception'),C('hurting-controls-officer-effect')]],
  ['damage','hurting-wealth-killing',[P(...W),P('편관'),C('wealth-supports-killing-effect')]],
  ['rescue','combine-killing',[P(...W),V('편관'),C('killing-combined-without-loss')]]],
 blade:[
  ['support','blade-officer-killing',[V(...O),V(...W,...I),A('상관'),C('officer-killing-controls-blade-effect')]],
  ['damage','blade-no-officer-killing',[A(...O)]],
  ['rescue','resource-protects-blade-controller',[P(...O),P(...E),P(...I),C('heavy-resource-protects-controller')]]],
 peer:[
  ['support','peer-officer-wealth-resource',[V('정관'),P(...W,...I),C('officer-controls-peer-effect')]],
  ['support','peer-wealth-output',[V(...W),P(...E),C('peer-output-wealth-path')]],
  ['support','peer-killing-controlled',[V('편관'),C('killing-controlled')]],
  ['damage','peer-no-wealth-officer',[A(...W,'정관'),V('편관'),V(...I),C('killing-resource-configuration')]],
  ['rescue','peer-officer-hurting-combined',[P('정관'),P('상관'),C('hurting-combined-officer-preserved')]],
  ['rescue','peer-wealth-killing-combined',[P(...W),P('편관'),C('killing-combined-wealth-preserved')]]]
};
export function patternMotifs(family){
 if(!Object.hasOwn(rules,family))return [];
 return rules[family].map(([kind,id,clauses])=>({kind,id,clauses:clauses.map(c=>({...c,...(c.gods?{gods:[...c.gods]}:{})})),source:PATTERN_SOURCES.outcome}));
}
