// Synthetic literal-pillar controls, not calendar-verified births or
// independent classical labels. Each contrast changes one pillar.
export const controls=Object.freeze([
 {id:'release',pillars:['임자','임자','갑자','갑자'],kind:'modeled-source-release',expected:'supported'},
 {id:'injury',pillars:['임자','임자','병자','임자'],kind:'modeled-target-injury',expected:'supported'},
 {id:'release-contested-root',pillars:['임자','임자','갑오','갑자'],kind:'modeled-source-release',expected:'unresolved'},
 {id:'injury-interposition',pillars:['임자','임자','병자','무자'],kind:'modeled-target-injury',expected:'unresolved'},
 {id:'resource-backed-release',pillars:['기축','신유','계해','신유'],kind:'modeled-source-release',expected:'supported',expectedModel:'supported'},
 {id:'resource-basis-removed',pillars:['기유','신유','계해','신유'],kind:'modeled-source-release',expected:'unresolved',expectedModel:'unresolved'},
 {id:'resource-with-rooted-controller',pillars:['기축','신유','계해','병오'],kind:'modeled-source-release',expected:'unresolved',expectedModel:'unresolved'}
].map(c=>Object.freeze({...c,pillars:Object.freeze(c.pillars)})));
export const routeControls=Object.freeze([
 {id:'mediation-supported',pillars:['기축','경신','임자','기축'],route:['mediation','month:stem','year:stem','day:stem'],expectedRoute:'supported'},
 {id:'mediation-root-loss',pillars:['기축','경오','임자','기축'],route:['mediation','month:stem','year:stem','day:stem'],expectedRoute:'unresolved'},
 {id:'protection-supported',pillars:['을묘','기묘','계묘','기미'],route:['protection','year:stem','month:stem','day:stem'],expectedRoute:'supported'},
 {id:'protection-helper-pressure',pillars:['을묘','기묘','계묘','기축'],route:['protection','year:stem','month:stem','day:stem'],expectedRoute:'unresolved'}
].map(c=>Object.freeze({...c,pillars:Object.freeze(c.pillars),route:Object.freeze(c.route)})));
