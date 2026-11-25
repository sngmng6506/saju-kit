import test from 'node:test';
import assert from 'node:assert/strict';
import {compareInventory,auditLayout,layoutIsClean} from '../scripts/lib/project-layout.mjs';

test('layout inventory distinguishes unlisted, missing and multiply owned files',()=>{
 assert.deepEqual(compareInventory(['a','b','c'],['a','a','b','d']),{unlisted:['c'],missing:['d'],duplicates:['a']});
 assert.deepEqual(compareInventory(['a','b'],['b','a']),{unlisted:[],missing:[],duplicates:[]});
});
test('all native test entries, canonical documents and frozen fixture paths are catalogued exactly once',()=>{
 const report=auditLayout();
 assert.equal(layoutIsClean(report),true,JSON.stringify(report,null,2));
 assert.ok(report.counts.testFiles>0);
});
