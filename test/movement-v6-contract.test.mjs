import test from 'node:test';
import assert from 'node:assert/strict';
import {getSaju,getDaeun,movementV6} from '../src/index.js';

test('explicit v6 API does not mutate legacy integer-day contract',()=>{
 const birth={y:1997,m:6,d:28,hh:8,mm:0}; const saju=getSaju(birth);
 const legacy=getDaeun({saju,gender:'남',birth}); const v6=movementV6.getDaeun({saju,gender:'남',birth});
 assert.equal(Number.isInteger(legacy.days),true); assert.equal('minutes' in legacy,false);
 assert.equal(v6.precision,'minute'); assert.equal(v6.days,v6.minutes/1440);
 assert.equal(movementV6.MOVEMENT_INDEX_VERSION,'movement-signal-index-v6-daeun-day-horse');
});
test('Tokyo explicit minute calculation uses same UTC+9 clock as modern Seoul',()=>{
 const birth={y:1997,m:6,d:28,hh:8,mm:0}; const calc=timezone=>{const b={...birth,timezone}; return movementV6.getDaeun({saju:getSaju(b),gender:'남',birth:b});};
 assert.deepEqual(calc('Asia/Tokyo'),calc('Asia/Seoul'));
});
test('malformed period is rejected',()=>{
 const birth={y:1997,m:6,d:28,hh:8,mm:0,period:{start:[9,0],end:[7,0]}};
 assert.throws(()=>movementV6.getDaeun({saju:getSaju(birth),gender:'남',birth}),{code:'daeun-period'});
});
