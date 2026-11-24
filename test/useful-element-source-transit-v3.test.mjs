import test from 'node:test';
import assert from 'node:assert/strict';
import {getSaju,analyzeUsefulElementAuthorityV2,analyzeUsefulElementAuthorityV3,USEFUL_ELEMENT_AUTHORITY_V3_VERSION,
 analyzeUsefulElementTransitV2,analyzeUsefulElementTransitV3,USEFUL_ELEMENT_TRANSIT_V3_VERSION} from '../src/index.js';
import {projectSourceCandidates} from '../src/features/useful-element-authority-v3/candidates.js';
import {observeSourceArrivals} from '../src/features/useful-element-transit-v3/source-arrivals.js';
import {observeTransitEvidence} from '../src/features/useful-element-transit-v1/evidence.js';
import {analyzeElementStructure,stemInfo} from '../src/index.js';
import {observeRequirementContext} from '../src/features/climate-useful-element-v5/requirements.js';
const stems='갑을병정무기경신임계',branches='자축인묘진사오미신유술해';
const p=i=>({stem:stems[i%10],branch:branches[i%12],text:stems[i%10]+branches[i%12]});
const pillar=text=>({stem:text[0],branch:text[1],text});
const saju={pillars:{year:pillar('무진'),month:pillar('경신'),day:pillar('임술'),hour:pillar('정미')}};
test('expanded source candidates do not become legacy authority anchors',()=>{
 const i={saju,birthBasis:'verified-chart'};
 const a=analyzeUsefulElementAuthorityV2({...i,policy:'useful-element-authority-v2'});
 const b=analyzeUsefulElementAuthorityV3({...i,policy:USEFUL_ELEMENT_AUTHORITY_V3_VERSION});
 const {sourceReview,anchorBasis,version,...rest}=b;
 assert.deepEqual(rest,(({version,...r})=>r)(a));
 assert.equal(anchorBasis,'useful-element-authority-v2');
 assert.equal(sourceReview.climate.version,'climate-useful-element-v5');
 assert.ok(sourceReview.candidates.length>0);
 assert.ok(sourceReview.candidates.every(c=>!c.selectionAuthority&&!c.conditionResolved&&!c.confirmed));
 assert.equal(b.usefulElement,null);
 assert.equal(analyzeUsefulElementAuthorityV3({...i,birthBasis:'provisional-chart',policy:USEFUL_ELEMENT_AUTHORITY_V3_VERSION}).sourceReview.candidates.length,0);
});
test('source arrivals preserve exact stems, root contacts and combination contacts',()=>{
 const structure=analyzeElementStructure({saju});
 const climate={evidence:{sourceProfile:{sourceId:'synthetic',section:'control',groups:[[{stem:'무'}],[{stem:'정'}]],alternatives:[{when:'jia-obstructs',stems:['갑','경'],groups:[['갑'],['경']]}]}},
 temporal:{conditions:[]},structuralConditions:[{when:'jia-obstructs',matched:null}],requirementContext:{requirements:[...stems].map(s=>observeRequirementContext(s,structure))}};
 const sourceReview={climate,candidates:projectSourceCandidates(climate)};
 let checks=0,roots=0,combinations=0;
 for(let i=0;i<60;i++)for(const hasDaeun of [false,true]){
  const t=observeTransitEvidence({saju,daeun:hasDaeun?p((i+13)%60):null,seun:p(i)}),before=JSON.stringify([sourceReview,t]);
  for(const row of observeSourceArrivals(sourceReview,t))for(const l of row.layers)for(const q of l.requirements){
   const n=climate.requirementContext.requirements.find(x=>x.stem===q.stem),orig=t.layers.find(x=>x.id===l.id),arr=[orig.stem,...orig.branch.hiddenStems];
   assert.equal(q.exact.length,arr.filter(x=>x.stem===q.stem).length);
   assert.equal(q.sameElementOtherStem.length,arr.filter(x=>x.stem!==q.stem&&x.element===stemInfo(q.stem).element).length);
   assert.ok(q.rootContacts.every(x=>n.roots.some(r=>r.position===x.position&&r.stem===x.stem)&&t.pairs.some(p=>p.left===l.id&&p.right===x.position&&p.branchSignals.length>0)));
   assert.ok(q.visibleCombinationContacts.every(x=>n.exactVisible.includes(x.position)&&t.pairs.some(p=>p.left===l.id&&p.right===x.position&&p.stemCombination)));
   assert.equal(q.effectiveSupply,null);assert.equal(row.confirmed,false);
   roots+=q.rootContacts.length;combinations+=q.visibleCombinationContacts.length;checks++;
  }
  assert.equal(JSON.stringify([sourceReview,t]),before);
 }
 assert.equal(checks,720);assert.equal(roots,1230);assert.equal(combinations,54);
});
test('v3 preserves v2 calendar and hypotheses while projecting source arrivals separately',()=>{
 const birth={y:2000,m:6,d:15,hh:12,mm:0};
 const i={saju:getSaju(birth),birth,birthBasis:'verified-chart',gender:'여',fromYear:2000,toYear:2012,daeunPolicy:'legacy-day-v1'};
 const a=analyzeUsefulElementTransitV2({...i,policy:'useful-element-transit-v2'});
 const b=analyzeUsefulElementTransitV3({...i,policy:USEFUL_ELEMENT_TRANSIT_V3_VERSION});
 assert.deepEqual(b.daeun,a.daeun);
 for(const [j,y] of b.years.entries()){
  const {sourceReviewArrivals,...rest}=y;
  assert.deepEqual(rest,a.years[j]);
  assert.equal(sourceReviewArrivals.length,b.authority.sourceReview.candidates.length);
  assert.ok(sourceReviewArrivals.every(x=>!x.confirmed&&!x.conditionResolved));
 }
 assert.equal(b.score,null);assert.equal(b.usefulElement,null);
});
