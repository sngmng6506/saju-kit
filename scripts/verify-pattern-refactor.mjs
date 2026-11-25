import {verifyRefactor} from './lib/refactor-equivalence.mjs';
const baseline=process.argv[2]??'dde2df3feb8433ebdfb924c0eefac957357a19cc';
const policies=Array.from({length:10},(_,i)=>[i===0?'analyzePatternUsefulElement':'analyzePatternUsefulElementV'+(i+1),'pattern-useful-element-v'+(i+1)]);
console.log(JSON.stringify(await verifyRefactor({baseline,policies}),null,2));
