import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {analyzePatternUsefulElementV3,PATTERN_V3_VERSION} from '../src/features/pattern-useful-element-v3/index.js';
import {evaluateClassicalCase,summarizeClassical} from './lib/classical-pattern-evaluation.mjs';
const data=JSON.parse(await readFile(new URL('../test/fixtures/pattern-classical-v2.json',import.meta.url),'utf8'));
const pillar=text=>({stem:text[0],branch:text[1],text});
export function auditClassicalPatterns(){
 const rows=data.cases.map(c=>{
  const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,pillar(c.pillars[i])]))};
  return evaluateClassicalCase(c,analyzePatternUsefulElementV3({saju,birthBasis:'verified-chart',policy:PATTERN_V3_VERSION}));
 });
 return {version:data.version,policy:PATTERN_V3_VERSION,summary:summarizeClassical(rows),newReference:summarizeClassical(rows.filter(r=>r.split==='new-reference')),developmentKnown:summarizeClassical(rows.filter(r=>r.split==='development-known')),rows};
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url)console.log(JSON.stringify(auditClassicalPatterns(),null,2));
