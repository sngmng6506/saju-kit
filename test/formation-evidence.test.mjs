import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {analyzeFormationEvidence,FORMATION_EVIDENCE_VERSION} from '../src/index.js';
import {chartFromReference} from '../scripts/strength-reference.mjs';
import {evaluateFormationEvidence} from '../scripts/evaluate-formation-evidence.mjs';

const analyze=pillars=>analyzeFormationEvidence({saju:chartFromReference(pillars)});
test('H01 records month support and clash without declaring cancellation',()=>{
 const r=analyze(['壬申','壬子','戊午','乙卯']);
 assert.equal(r.version,FORMATION_EVIDENCE_VERSION);
 const f=r.formations.find(x=>x.id==='branch.threeHarmonyCandidate:year-month');
 assert.equal(f.classification,'cardinal-three-pair');
 assert.equal(f.flags.monthSupports,true);
 assert.equal(f.flags.seasonSupports,true);
 assert.equal(f.flags.directClash,true);
 assert.equal(f.flags.externalRootedProjection,false);
 assert.equal(f.contextScreen,'review');
 assert.equal(f.transformationConfirmed,null);
 assert.equal(r.direction,null);
});
test('XU19 screen is not transformation or strength authority',()=>{
 const r=analyze(['丁亥','癸卯','癸卯','甲寅']);
 const f=r.formations.find(x=>x.id==='branch.threeHarmonyCandidate:year-month');
 assert.equal(f.contextScreen,'all-screen-flags-met');
 assert.equal(f.target,'wood');
 assert.ok(f.visible.some(v=>v.position==='hour'&&v.outsideUnclashedRoots.includes('hour')));
 assert.ok(f.affectedRoots.some(x=>x.element==='water'&&x.position==='year'&&x.isDayRoot));
 assert.equal(f.transformationConfirmed,null);
 assert.equal(r.effectsConfirmed,false);
});
test('unknown six-harmony target remains unspecified; day stem participation is flagged',()=>{
 const r=analyze(['己酉','丙子','癸未','戊午']);
 const f=r.formations.find(x=>x.id==='branch.sixHarmony:day-hour');
 assert.equal(f.target,null);assert.equal(f.flags.targetKnown,false);
 assert.ok(f.limitations.includes('unspecified-target'));
 const g=r.formations.find(x=>x.id==='stem.combine:day-hour');
 assert.equal(g.flags.dayMasterParticipates,true);
 assert.ok(g.limitations.includes('day-master-reference-involved'));
});
test('complete group alternatives use three distinct positions, not four',()=>{
 const r=analyze(['壬子','癸丑','庚子','丁亥']);
 const full=r.formations.filter(x=>x.classification==='complete-seasonal');
 assert.equal(full.length,2);
 assert.ok(full.every(x=>x.positions.length===3&&new Set(x.positions).size===3));
 assert.ok(!r.formations.some(x=>x.type==='branch.seasonalHarmonyCandidate'));
});
test('missing-hour observations never pass the complete-chart screen',()=>{
 const saju=chartFromReference(['壬申','壬子','戊午','乙卯']);saju.pillars.hour=null;
 const r=analyzeFormationEvidence({saju});
 assert.equal(r.status,'partial');
 assert.equal(r.direction,null);
 assert.ok(r.formations.every(f=>f.contextScreen==='review'&&f.limitations.includes('missing-hour')));
});
test('100 historical chart formation evidence records replay',async()=>{
 const expected=JSON.parse(await readFile(new URL('../docs/formation-evidence-results.json',import.meta.url),'utf8'));
 const actual=await evaluateFormationEvidence();
 assert.deepEqual(actual.summary,expected.summary);
 assert.deepEqual(actual.rows,expected.rows);
});
