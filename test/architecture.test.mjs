import test from 'node:test';
import assert from 'node:assert/strict';
import {auditArchitecture} from '../scripts/audit-architecture.mjs';

test('runtime imports resolve and respect core and public facade boundaries',()=>{
 const r=auditArchitecture();
 assert.deepEqual(r.missing,[]);
 assert.deepEqual(r.violations,[]);
 assert.deepEqual(r.cycles,[]);
});
