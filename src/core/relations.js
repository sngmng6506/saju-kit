import { stemIndex, branchIndex } from './elements.js';
import { SajuError } from './error.js';
const STEM_COMBINES = [["갑","기","earth"],["을","경","metal"],["병","신","water"],["정","임","wood"],["무","계","fire"]];
const SIX = [["자","축","earth"],["인","해","wood"],["묘","술","fire"],["진","유","metal"],["사","신","water"],["오","미",null]];
const CLASH = [["자","오"],["축","미"],["인","신"],["묘","유"],["진","술"],["사","해"]];
const THREE = [["신","자","진","water"],["해","묘","미","wood"],["인","오","술","fire"],["사","유","축","metal"]];
const SEASON = [["인","묘","진","wood"],["사","오","미","fire"],["신","유","술","metal"],["해","자","축","water"]];
function pairMatches(group,a,b){return a!==b&&group.slice(0,2).includes(a)&&group.slice(0,2).includes(b);}
export function stemCombination(left,right){stemIndex(left);stemIndex(right);const hit=STEM_COMBINES.find(g=>pairMatches(g,left,right));return hit?{type:'stem.combine',members:hit.slice(0,2),associatedElement:hit[2],transformationConfirmed:null}:null;}

export function branchPairRelations(left,right){branchIndex(left);branchIndex(right);const out=[];const six=SIX.find(g=>pairMatches(g,left,right));if(six)out.push({type:'branch.sixHarmony',members:six.slice(0,2),associatedElement:six[2],transformationConfirmed:null});const clash=CLASH.find(g=>pairMatches(g,left,right));if(clash)out.push({type:'branch.clash',members:clash.slice()});for(const [type,groups] of [['branch.threeHarmonyCandidate',THREE],['branch.seasonalHarmonyCandidate',SEASON]]){const hit=groups.find(g=>left!==right&&g.slice(0,3).includes(left)&&g.slice(0,3).includes(right));if(hit){const members=hit.slice(0,3);out.push({type,members,matched:members.filter(x=>x===left||x===right),missing:members.filter(x=>x!==left&&x!==right),associatedElement:hit[3],includesCardinal:left===hit[1]||right===hit[1],transformationConfirmed:null});}}return out;}

export function analyzeBranchGroups(branches){if(!Array.isArray(branches))throw new SajuError('branch','지지 배열이 필요합니다.');for(const b of branches)branchIndex(b);const found=new Set(branches),out=[];for(const [type,groups] of [['branch.threeHarmony',THREE],['branch.seasonalHarmony',SEASON]])for(const g of groups){const members=g.slice(0,3);if(members.every(b=>found.has(b)))out.push({type,members,associatedElement:g[3],transformationConfirmed:null});}return out;}
