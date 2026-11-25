import test from 'node:test';
import assert from 'node:assert/strict';
import {compareInventory,auditLayout,layoutIsClean,isTestLikeFilename} from '../scripts/lib/project-layout.mjs';

test('layout inventory distinguishes unlisted, missing and multiply owned files',()=>{
 assert.deepEqual(compareInventory(['a','b','c'],['a','a','b','d']),{unlisted:['c'],missing:['d'],duplicates:['a']});
 assert.deepEqual(compareInventory(['a','b'],['b','a']),{unlisted:[],missing:[],duplicates:[]});
});
test('all native test entries, canonical documents and frozen fixture paths are catalogued exactly once',()=>{
 for(const path of ['scripts/test-domain.mjs','scripts/lib/test-domains.mjs','scripts/example.test.mjs','src/demo-spec.js','test.js'])assert.equal(isTestLikeFilename(path),true,path);
 for(const path of ['scripts/run-domain.mjs','scripts/lib/domain-manifest.mjs','scripts/audit-layout.mjs'])assert.equal(isTestLikeFilename(path),false,path);
 const report=auditLayout();
 assert.deepEqual(report.unexpectedTestEntries,[]);
 assert.equal(layoutIsClean(report),true,JSON.stringify(report,null,2));
 assert.ok(report.counts.testFiles>0);
});
