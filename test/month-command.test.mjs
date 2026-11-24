import test from 'node:test';
import assert from 'node:assert/strict';
import { getSaju, solarTermInstant, analyzeMonthCommand, MONTH_COMMAND_VERSION } from '../src/index.js';
import { monthCommandSources, resolveCommand } from '../src/core/month-command.js';
import { readFile } from 'node:fs/promises';
import { chartFromReference } from '../scripts/strength-reference.mjs';

const minute=t=>Date.UTC(t.y,t.m-1,t.d,t.hh,t.mm)/60000;
const branches='축인묘진사오미신유술해자';
test('original source notation and unresolved order remain literal',()=>{
 const [s,z]=monthCommandSources('인');
 assert.equal(s.entries[0].label,'艮土');
 assert.equal(s.entries[0].stem,null);
 assert.equal(s.entries[0].element,'earth');
 assert.equal(z.entries[0].stem,'기');
 assert.equal(monthCommandSources('신')[0].entries[0].label,'坤土');
 assert.equal(monthCommandSources('자')[1].nominalDays,26);
 assert.equal(monthCommandSources('오')[1].entries[2].stem,'을');
 for(const b of branches)assert.equal(monthCommandSources(b)[1].orderResolved,b==='인');
 assert.equal(resolveCommand(monthCommandSources('자')[1],100,43200,'literal-days').status,'source-unresolved');
});
test('all 2412 solar months preserve half-open command boundaries',()=>{
 let intervals=0,boundaries=0,normalized=0,literalTail=0,min=Infinity,max=-Infinity;
 for(let y=1900;y<=2100;y++)for(let i=0;i<24;i+=2){
  const dur=minute(solarTermInstant(i===22?y+1:y,(i+2)%24))-minute(solarTermInstant(y,i));
  intervals++;min=Math.min(min,dur);max=Math.max(max,dur);
  const [s]=monthCommandSources(branches[i/2]);
  let cumulative=0;
  for(const [j,e] of s.entries.entries()){
   const at=cumulative*1440;
   if(at<dur){
    const r=resolveCommand(s,at,dur,'literal-days');
    assert.equal(r.command.label,e.label);assert.equal(r.atBoundary,true);
    if(at>0)assert.equal(resolveCommand(s,at-1,dur,'literal-days').command.label,s.entries[j-1].label);
    boundaries++;
   }
   const n=Math.ceil(cumulative*dur/30);
   if(n<dur){
    assert.equal(resolveCommand(s,n,dur,'normalized-30').command.label,e.label);
    if(n>0)assert.equal(resolveCommand(s,n-1,dur,'normalized-30').command.label,s.entries[j-1].label);
    normalized++;
   }
   cumulative+=e.days;
  }
  if(dur>43200){assert.equal(resolveCommand(s,43200,dur,'literal-days').status,'outside-nominal-days');literalTail++;}
 }
 assert.deepEqual({intervals,boundaries,normalized,literalTail,min,max},{intervals:2412,boundaries:6432,normalized:6432,literalTail:1608,min:42417,max:45272});
});
test('explicit birth, actual calendar and source divergence',async()=>{
 const expected=JSON.parse(await readFile(new URL('../docs/month-command-results.json',import.meta.url),'utf8'));
 for(const e of expected.examples){
  const saju=getSaju(e.birth),before=JSON.stringify(saju),r=analyzeMonthCommand({saju,birth:e.birth});
  assert.equal(r.version,MONTH_COMMAND_VERSION);assert.equal(r.status,'diagnostic');
  assert.equal(r.month.branch,e.month);assert.equal(r.interval.elapsedMinutes,e.elapsed);assert.equal(r.interval.durationMinutes,e.duration);
  assert.deepEqual(r.hypotheses.map(h=>[h.sourceId,h.mode,h.status,h.command?.label??null]),e.commands);
  assert.deepEqual(r.availableCommandElements,e.elements);
  assert.equal(r.commandResolved,false);assert.equal(r.effectsConfirmed,false);assert.equal(r.direction,null);assert.equal(JSON.stringify(saju),before);
 }
});
test('exact jeol starts a new month at elapsed minute zero',()=>{
 const t=solarTermInstant(2026,2);
 for(const delta of [-1,0,1]){
  const d=new Date((minute(t)+delta)*60000);
  const birth={y:d.getUTCFullYear(),m:d.getUTCMonth()+1,d:d.getUTCDate(),hh:d.getUTCHours(),mm:d.getUTCMinutes(),timezone:'Asia/Tokyo'};
  const saju=getSaju(birth),r=analyzeMonthCommand({saju,birth});
  assert.equal(r.interval.start.branch,saju.pillars.month.branch);
  if(delta===0)assert.equal(r.interval.elapsedMinutes,0);
 }
});
test('historical chart-only records cannot infer exact command; unsupported clock and mismatches fail closed',async()=>{
 const f=JSON.parse(await readFile(new URL('../docs/strength-separated-decision-results.json',import.meta.url),'utf8'));
 assert.equal(f.rows.length,100);
 for(const c of f.rows){
  const r=analyzeMonthCommand({saju:chartFromReference(c.pillars)});
  assert.equal(r.reason,'missing-birth-instant');assert.equal(r.hypotheses.length,0);
 }
 const birth={y:2026,m:2,d:9,hh:12,mm:0},saju=getSaju(birth);
 assert.equal(analyzeMonthCommand({saju,birth:{...birth,hh:null,mm:null}}).reason,'missing-birth-time');
 assert.throws(()=>analyzeMonthCommand({saju,birth:{...birth,d:10}}),{code:'month-command-chart-mismatch'});
 const old={y:1988,m:7,d:15,hh:12,mm:0};
 assert.equal(analyzeMonthCommand({saju:getSaju(old),birth:old}).reason,'unsupported-clock-policy');
});
