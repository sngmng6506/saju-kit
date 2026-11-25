import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {analyzePatternUsefulElementV3,PATTERN_V3_VERSION} from '../src/features/pattern-useful-element-v3/index.js';
import {analyzePatternUsefulElementV4,PATTERN_V4_VERSION} from '../src/features/pattern-useful-element-v4/index.js';
import {analyzePatternUsefulElementV5,PATTERN_V5_VERSION} from '../src/features/pattern-useful-element-v5/index.js';
import {analyzePatternUsefulElementV6,PATTERN_V6_VERSION} from '../src/features/pattern-useful-element-v6/index.js';
import {evaluateClassicalCase,summarizeClassical} from './lib/classical-pattern-evaluation.mjs';
const data=JSON.parse(await readFile(new URL('../test/fixtures/pattern-classical-v2.json',import.meta.url),'utf8'));
const pillar=text=>({stem:text[0],branch:text[1],text});
export function auditClassicalPatterns(policy=PATTERN_V3_VERSION){
 const analyze=policy===PATTERN_V3_VERSION?analyzePatternUsefulElementV3:policy===PATTERN_V4_VERSION?analyzePatternUsefulElementV4:policy===PATTERN_V5_VERSION?analyzePatternUsefulElementV5:policy===PATTERN_V6_VERSION?analyzePatternUsefulElementV6:null;
 if(!analyze)throw new Error('unsupported audit policy');
 const rows=data.cases.map(c=>{
  const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,pillar(c.pillars[i])]))};
  return evaluateClassicalCase(c,analyze({saju,birthBasis:'verified-chart',policy}));
 });
 return {version:data.version,policy,summary:summarizeClassical(rows),newReference:summarizeClassical(rows.filter(r=>r.split==='new-reference')),developmentKnown:summarizeClassical(rows.filter(r=>r.split==='development-known')),rows};
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url)console.log(JSON.stringify(process.argv.includes('--preference-compare')?{baseline:auditClassicalPatterns(PATTERN_V5_VERSION),experimental:auditClassicalPatterns(PATTERN_V6_VERSION)}:process.argv.includes('--preference')?auditClassicalPatterns(PATTERN_V5_VERSION):process.argv.includes('--compare')?{baseline:auditClassicalPatterns(),experimental:auditClassicalPatterns(PATTERN_V4_VERSION)}:auditClassicalPatterns(),null,2));
