import { STEMS, BRANCHES } from './ganji.js';
import { SajuError } from './error.js';
const ELEMENTS = ["wood","fire","earth","metal","water"];
const BRANCH_ELEMENTS = ["water","earth","wood","wood","earth","fire","fire","earth","metal","metal","earth","water"];
export function stemIndex(stem){const i=STEMS.indexOf(stem);if(i<0)throw new SajuError('stem','올바른 천간이 아닙니다.');return i;}

export function branchIndex(branch){const i=BRANCHES.indexOf(branch);if(i<0)throw new SajuError('branch','올바른 지지가 아닙니다.');return i;}

export function stemInfo(stem){const i=stemIndex(stem);return {element:ELEMENTS[Math.floor(i/2)],yinYang:i%2===0?'yang':'yin'};}

export function branchElement(branch){return BRANCH_ELEMENTS[branchIndex(branch)];}

export function elementRelation(left,right){const a=ELEMENTS.indexOf(left),b=ELEMENTS.indexOf(right);if(a<0||b<0)throw new SajuError('element','올바른 오행이 아닙니다.');const d=(b-a+5)%5;return {type:['same','generate','control','control','generate'][d],direction:d===0?'none':d<=2?'left-to-right':'right-to-left'};}
