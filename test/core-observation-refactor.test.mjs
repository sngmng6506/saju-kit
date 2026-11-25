import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../src/index.js';
import {createElementObservation} from '../src/core/element-structure.js';
import {observeInteractionContext} from '../src/core/interaction-context.js';
import {observeRootDynamics} from '../src/core/root-dynamics.js';
import {observeStemForce} from '../src/core/stem-force.js';
import {createMethodEvidence} from '../src/features/method-evidence.js';

function freeze(value){
 if(value&&typeof value==='object'&&!Object.isFrozen(value)){
  Object.freeze(value);
  for(const child of Object.values(value))freeze(child);
 }
 return value;
}

test('request-local natal projections equal independent public analyses for full and partial charts',()=>{
 const full=api.getSaju({y:2000,m:2,d:9,hh:12,mm:0});
 for(const saju of [full,{pillars:{...full.pillars,hour:null}}]){
  freeze(saju);
  const o=createElementObservation(saju),other=createElementObservation(saju);
  const context=o.context(),relations=o.relations(),structure=o.structure();
  assert.equal(context,o.context());assert.equal(relations,o.relations());assert.equal(structure,o.structure());
  assert.notEqual(context,other.context());assert.notEqual(structure,other.structure());
  assert.deepEqual(context,api.analyzeNatalContext({saju}));
  assert.deepEqual(relations,api.analyzeNatalRelations({saju}));
  assert.deepEqual(structure,api.analyzeElementStructure({saju}));
  const interaction=observeInteractionContext(o.pillars,structure,relations);
  const roots=observeRootDynamics(o.pillars,structure);
  assert.deepEqual(interaction,api.analyzeInteractionContext({saju}));
  assert.deepEqual(roots,api.analyzeRootDynamics({saju}));
  assert.deepEqual(observeStemForce(o.pillars,roots,interaction),api.analyzeStemForceEvidence({saju}));
 }
});

test('shared method observation keeps season policies independent and excludes internal helpers from public facade',()=>{
 const saju=freeze(api.getSaju({y:2000,m:2,d:9,hh:12,mm:0})),p=createMethodEvidence(),other=createMethodEvidence();
 assert.equal(p.context(saju),p.context(saju));
 assert.equal(p.structure(saju),p.structure(saju));
 assert.equal(p.standard.dynamics(saju),p.neutral.dynamics(saju));
 assert.notEqual(p.standard.dynamics(saju),other.standard.dynamics(saju));
 assert.deepEqual(p.standard.dynamics(saju),api.analyzeRootDynamics({saju}));
 assert.notEqual(p.standard.quantitative(saju,'verified-chart'),p.neutral.quantitative(saju,'verified-chart'));
 for(const name of ['createElementObservation','observeNatalContext','observeNatalRelations','observeInteractionContext','observeRootDynamics','observeStemForce'])
  assert.equal(Object.hasOwn(api,name),false,name);
});
