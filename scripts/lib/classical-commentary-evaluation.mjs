// Xu commentary is a distinct doctrine/source cohort. Do not pool with Shen.
const unique=xs=>[...new Set(xs)].sort();
const rate=(a,b)=>b===0?null:a/b;
const positions=['year','month','day','hour'];
const outcomes=new Set(['formed','broken','rescued','formed-with-damage']);
export function inspectCommentaryCorpus(data,original){
 const errors=[],seen=new Set(original.cases.map(c=>c.pillars.join(''))),ids=new Set();
 const S='갑을병정무기경신임계',B='자축인묘진사오미신유술해',CS='甲乙丙丁戊己庚辛壬癸',CB='子丑寅卯辰巳午未申酉戌亥';
 for(const c of data.cases){
  const fail=reason=>errors.push({id:c.id,reason});
  if(ids.has(c.id))fail('duplicate-id');ids.add(c.id);
  if(!Array.isArray(c.pillars)||c.pillars.length!==4||c.pillars.some(p=>typeof p!=='string'||p.length!==2)){fail('pillar-shape');continue;}
  const key=c.pillars.join('');
  if(seen.has(key))fail('duplicate-chart');seen.add(key);
  const ix=c.pillars.map(p=>[S.indexOf(p[0]),B.indexOf(p[1])]);
  if(ix.some(([s,b])=>s<0||b<0||s%2!==b%2)){fail('invalid-sexagenary-pillar');continue;}
  if((ix[0][0]%5*2+2+(ix[1][1]+10)%12)%10!==ix[1][0])fail('year-month-incoherence');
  if((ix[2][0]%5*2+ix[3][1])%10!==ix[3][0])fail('day-hour-incoherence');
  if(ix.map(([s,b])=>CS[s]+CB[b]).join('')!==c.source.rawPillars)fail('transcription-mismatch');
  if(c.source.author!=='徐樂吾'||c.source.layer!=='commentary'||!c.source.url||!c.source.chapter||!c.source.locator)fail('source-provenance');
  if(c.split!=='development-commentary'||c.annotation.independentlyAdjudicated!==false)fail('unverified-split');
  if(c.annotation.outcome!==null&&!outcomes.has(c.annotation.outcome))fail('invalid-outcome-label');
  for(const field of ['selectedUsefulStems','selectedAssistantStems','rescueStems','obstructionStems']){
   const xs=c.annotation[field];if(!Array.isArray(xs)||xs.some(x=>typeof x!=='string'||x.length!==1||!S.includes(x))||new Set(xs).size!==xs.length){fail('invalid-'+field);continue;}
   // This cohort's annotated stems are explicit visible participants only.
   // Hidden-stem use is deliberately recorded in the source note, not here.
   if(xs.some(x=>!c.pillars.some(p=>p[0]===x)))fail('nonvisible-'+field);
  }
 }
 return {total:data.cases.length,combinedUnique:seen.size,errors};
}
export function evaluateCommentaryCase(c,result,review){
 const a=c.annotation,cs=review.candidates.filter(x=>a.family===null||x.family===a.family);
 const occurrences=new Map((result.routeReview?.occurrences??[]).map(o=>[o.id,o]));
 const stems=ids=>unique(ids.map(id=>occurrences.get(id)).filter(o=>o?.layer==='visible').map(o=>o.stem));
 const matchedRescueStems=stems(cs.flatMap(x=>x.threats.flatMap(t=>t.possibleRescues.map(w=>w.helper))));
 const unmatchedRescueStems=stems(cs.flatMap(x=>x.unmatchedRescues.map(w=>w.helper)));
 const roleParticipantStems=stems(cs.flatMap(x=>x.paths.flatMap(p=>p.helperIds)));
 const damageStems=stems(cs.flatMap(x=>x.threats.map(t=>t.from)));
 const families=unique((result.selection?.candidates??[]).map(x=>x.family).filter(Boolean));
 const probes=(xs,observed)=>xs.map(stem=>({stem,observed:observed.includes(stem)}));
 return {id:c.id,relatedGroup:c.relatedGroup,sourceFamily:a.family,sourceOutcome:a.outcome,
  candidateFamilies:families,familyRetrieved:a.family===null?null:families.includes(a.family),
  preferenceFamily:result.preference?.hypothesis?.family??null,
  explicitAssistantLabels:[...a.selectedAssistantStems],commentaryUsefulStemLabels:[...a.selectedUsefulStems],
  rescueProbes:probes(a.rescueStems,matchedRescueStems),obstructionProbes:probes(a.obstructionStems,damageStems),
  matchedRescueStems,unmatchedRescueStems,roleParticipantStems,damageStems,
  outcomePrediction:null,assistantPrediction:null,selectionAuthority:false};
}
export function summarizeCommentary(rows){
 const labelled=rows.filter(r=>r.sourceFamily!==null),probe=(field)=>{
  const xs=rows.flatMap(r=>r[field]),hits=xs.filter(x=>x.observed).length;
  return {total:xs.length,hits,recall:rate(hits,xs.length)};
 };
 return {total:rows.length,relatedGroups:unique(rows.map(r=>r.relatedGroup).filter(Boolean)),
  sourceFamilyLabels:labelled.length,candidateFamilyHits:labelled.filter(r=>r.familyRetrieved).length,
  candidateFamilyRecall:rate(labelled.filter(r=>r.familyRetrieved).length,labelled.length),
  sourceOutcomeCounts:Object.fromEntries([...outcomes].map(o=>[o,rows.filter(r=>r.sourceOutcome===o).length])),
  explicitAssistantLabels:rows.reduce((n,r)=>n+r.explicitAssistantLabels.length,0),
  commentaryUsefulStemLabels:rows.reduce((n,r)=>n+r.commentaryUsefulStemLabels.length,0),
  matchedRescueProbe:probe('rescueProbes'),damageActorProbe:probe('obstructionProbes'),
  finalOutcomeAccuracy:null,finalAssistantAccuracy:null,heldOutConfirmed:0};
}
export function runCommentaryReview(data,original,analyze,review){
 const inventory=inspectCommentaryCorpus(data,original);
 if(inventory.errors.length)throw Error(JSON.stringify(inventory.errors));
 const rows=data.cases.map(c=>{
  const saju={pillars:Object.fromEntries(positions.map((p,i)=>[p,{stem:c.pillars[i][0],branch:c.pillars[i][1],text:c.pillars[i]}]))};
  const result=analyze(saju);
  return evaluateCommentaryCase(c,result,review(result));
 });
 return {version:data.version,inventory,summary:summarizeCommentary(rows),rows};
}
