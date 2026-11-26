import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalizeExposurePillars,extractExposureRecords,combineExposureRecords,mergeExposureInventories,exposureInventoryDrift,screenExposureCandidate,screenExposurePacket} from '../scripts/lib/pattern-outcome-exposure.mjs';
const candidate=(id,pillars,url='https://new.example/chapter')=>({id,pillars,source:{work:'fixture-work',commentator:'fixture-commentator',edition:'fixture-edition',chapter:'fixture-chapter',passage:'fixture-passage',url}});
const inventory=combineExposureRecords([extractExposureRecords({cases:[
 {id:'full',pillars:['갑자','병인','무진','경신'],source:'https://www.example.com/chapter/'},
 {id:'partial',pillars:['을축','정묘','기사',null]},
 {id:'raw',pillars:['병인','무진','경오','임신'],source:{rawPillars:'丙寅 戊辰 庚午 壬戌'}},
 {id:'bad',pillars:['정묘','기사','신미','계유'],source:{rawPillars:'invalid'}}
]},'fixture.json')]);
test('exposure normalizes Chinese, Korean and partial literals without claiming birth verification',()=>{
 assert.deepEqual(normalizeExposurePillars('甲子 丙寅 戊辰 庚申'),normalizeExposurePillars(['갑자','병인','무진','경신']));
 assert.equal(normalizeExposurePillars(['갑자','병인','무진']).complete,false);
 assert.equal(normalizeExposurePillars(['갑축','병인','무진','경신']).sexagenary,false);
 assert.equal(normalizeExposurePillars('甲子丙寅戊辰庚'),null);
 assert.equal(inventory.unparsed.length,1);
});
test('exact, raw alternative, one-pillar and partial overlaps are quarantined',()=>{
 for(const [pillars,kind] of [
  [['甲子','丙寅','戊辰','庚申'],'exact'],
  [['갑자','병인','무진','임신'],'one-pillar-variant'],
  [['을축','정묘','기사','신미'],'partial-overlap'],
  [['병인','무진','경오','임술'],'exact']]){
  const r=screenExposureCandidate(candidate('new-id',pillars),inventory);
  assert.equal(r.status,'quarantined-chart-overlap');
  assert.ok(r.matches.some(m=>m.kind===kind));
  assert.equal(r.independentGold,false);
 }
});
test('source mirror overlap is advisory, while no match never certifies independence',()=>{
 const ps=['임자','갑인','병오','무술'];
 const a=screenExposureCandidate(candidate('new',ps,'http://example.com/chapter#section'),inventory);
 assert.equal(a.status,'source-review-required');assert.equal(a.independentGold,false);
 const b=screenExposureCandidate(candidate('new',ps),inventory);
 assert.equal(b.status,'fixture-screen-passed-review-pending');assert.equal(b.independentGold,false);
 assert.equal(screenExposureCandidate({...candidate('new',ps),label:'supported'},inventory).status,'invalid-candidate');
 assert.equal(screenExposureCandidate(candidate('new',['임자','갑인','병오']),inventory).status,'invalid-candidate');
});
test('snapshot exposures survive removal and additions without duplicate references',()=>{
 const live=combineExposureRecords([extractExposureRecords({cases:[{id:'new',pillars:['임자','갑인','병오','무술']}]},'new.json')]);
 const merged=mergeExposureInventories(inventory,live),drift=exposureInventoryDrift(inventory,live);
 assert.equal(merged.charts.length,inventory.charts.length+1);
 assert.ok(drift.removedReferences>0);assert.equal(drift.addedReferences,1);
 assert.equal(screenExposureCandidate(candidate('old',['갑자','병인','무진','경신']),merged).status,'quarantined-chart-overlap');
 assert.deepEqual(mergeExposureInventories(inventory,inventory),inventory);
});
test('intake packet rejects exact duplicates, close variants and nonblind labels',()=>{
 const c=candidate('a',['임자','갑인','병오','무술']),run=candidates=>screenExposurePacket({version:'p1-5b-intake-v1',candidates},inventory);
 assert.equal(run([c]).status,'review-pending');
 assert.equal(run([c,{...c,id:'b'}]).status,'duplicate-candidate');
 assert.equal(run([c,candidate('b',['임자','갑인','병오','경술'])]).status,'near-duplicate-candidates');
 assert.equal(run([{...c,expected:'supported'}]).status,'invalid-packet');
});
test('frozen real exposure packet retains all 16 development charts and cross-domain overlap',()=>{
 const f=JSON.parse(readFileSync(new URL('../docs/pattern-outcome-exposure-snapshot-v1.json',import.meta.url),'utf8'));
 const dev=f.charts.filter(c=>c.references.some(r=>/pattern-(outcome-role-policy-source|modeled-consequence-source-contrast)-v1\.json$/.test(r.path)));
 assert.equal(dev.length,16);
 assert.equal(f.developmentOverlap.alsoInOtherInputs,13);
 for(const [i,c] of dev.entries())assert.equal(screenExposureCandidate(candidate('probe-'+i,c.pillars),f).status,'quarantined-chart-overlap');
 assert.equal(f.independentGoldCases,0);
});
