// Classical reference comparison. No fitting, no empirical prediction claim.
import { analyzeDayMasterStrength } from '../src/features/strength-hybrid-v1/index.js';
const HANJA='甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥';
const HANGUL='갑을병정무기경신임계자축인묘진사오미신유술해';
const POSITIONS=['year','month','day','hour'];

export function chartFromReference(pillars){
  if(!Array.isArray(pillars)||pillars.length!==4)throw new Error('four reference pillars required');
  return {pillars:Object.fromEntries(pillars.map((text,i)=>{
    if(typeof text!=='string'||text.length!==2||HANJA.indexOf(text[0])<0||HANJA.indexOf(text[0])>=10||HANJA.indexOf(text[1])<10)throw new Error('invalid reference pillar');
    const stem=HANGUL[HANJA.indexOf(text[0])],branch=HANGUL[HANJA.indexOf(text[1])];
    return [POSITIONS[i],{stem,branch,text:stem+branch}];
  }))};
}
export function evaluateReferences(fixture){
  const seen=new Set();
  const rows=fixture.cases.map(entry=>{
    if(seen.has(entry.id))throw new Error('duplicate case: '+entry.id);
    seen.add(entry.id);
    const r=analyzeDayMasterStrength({saju:chartFromReference(entry.pillars),policy:'strength-hybrid-v1',birthBasis:'verified-chart'});
    const q=r.quantitative,e=r.evidence;
    // Balanced commentary is not identical to mixed tendency; do not score it as agreement.
    const outcome=entry.reference==='review-required'
      ?(r.status==='review-required'?'review-detected':r.category?'review-missed-candidate':'review-missed-abstained')
      :entry.reference==='balanced'?'descriptive-only'
      :r.category===null?'abstained':r.category===entry.reference?'agrees':'disagrees';
    return {id:entry.id,reference:entry.reference,direction:entry.direction,labelBasis:entry.labelBasis,split:entry.split,
      status:r.status,category:r.category,qualitative:e.qualitativeRule.category,rule:e.qualitativeRule.id,
      baseline:q.baseline.lower,min:q.min,max:q.max,stable:q.stableCategory,flags:r.reviewFlags,outcome,
      counters:e.counters};
  });
  const counts={};for(const row of rows)counts[row.outcome]=(counts[row.outcome]||0)+1;
  return {policy:'strength-hybrid-v1',total:rows.length,counts,rows};
}
