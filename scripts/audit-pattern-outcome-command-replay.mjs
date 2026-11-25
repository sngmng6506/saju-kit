import {readFileSync} from 'node:fs';
import {replayFrozenCommandIntervals,compareTextCommandAnnotations} from './lib/pattern-outcome-command-replay.mjs';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const intervals=read('docs/month-command-results.json'),text=read('test/fixtures/month-command-text-controls-v1.json');
const replay=replayFrozenCommandIntervals(intervals),annotations=compareTextCommandAnnotations(text),errors=[];
if(!replay.length||replay.some(r=>!r.parity))errors.push('frozen-command-interval-parity');
if(annotations.length!==2||new Set(annotations.map(r=>r.id)).size!==2)errors.push('annotation-coverage');
console.log(JSON.stringify({scope:'computational-parity-and-exposed-textual-contrast-not-accuracy',independentGold:0,
 expectedExamples:intervals.examples.length,executedExamples:replay.length,parityExamples:replay.filter(r=>r.parity).length,
 hypothesisCount:replay.reduce((n,r)=>n+r.actual.length,0),errors,replay,annotations,selectionAuthority:false},null,2));
if(errors.length)process.exitCode=1;
