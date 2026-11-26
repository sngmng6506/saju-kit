// Exposure screening, not a label generator or independent-gold gate.
// Year/month/day/hour order is preserved; no calendar birth verification.
const HST='갑을병정무기경신임계',CST='甲乙丙丁戊己庚辛壬癸',HBR='자축인묘진사오미신유술해',CBR='子丑寅卯辰巳午未申酉戌亥';
const chars=(x,h,c)=>h.includes(x)?h.indexOf(x):c.indexOf(x);
function pillar(value){
 if(typeof value!=='string')return null;
 const s=value.trim();if(s.length!==2)return null;
 const a=chars(s[0],HST,CST),b=chars(s[1],HBR,CBR);
 return a<0||b<0?null:{text:HST[a]+HBR[b],sexagenary:a%2===b%2};
}
export function normalizeExposurePillars(value){
 const raw=typeof value==='string'?value.replace(/[\s,，、;；|/·-]/g,'').match(/.{2}/gu):value;
 if(typeof value==='string'&&(value.replace(/[\s,，、;；|/·-]/g,'').length%2!==0))return null;
 if(!Array.isArray(raw)||![3,4].includes(raw.length))return null;
 const normalized=raw.map((p,i)=>i===3&&p===null?null:pillar(p));
 if(normalized.slice(0,3).some(x=>!x)||raw.length===4&&raw[3]!==null&&!normalized[3])return null;
 const pillars=normalized.slice(0,3).map(x=>x.text).concat(normalized[3]?.text??null);
 return {pillars,complete:pillars[3]!==null,sexagenary:normalized.filter(Boolean).every(p=>p.sexagenary)};
}
const idText=x=>typeof x==='string'&&x.trim().length>0;
const own=(x,k)=>Object.prototype.hasOwnProperty.call(x,k);
const key=x=>JSON.stringify(x);
const cmp=(a,b)=>a<b?-1:a>b?1:0;
// Literal URL overlap is only an advisory signal. Different mirrors
// and spelling variants cannot prove source/author independence.
export function normalizeExposureUrl(s){
 if(typeof s!=='string')return null;
 const m=s.trim().match(/^https?:\/\/([^/?#\s]+)([^#\s]*)?(?:#.*)?$/i);
 if(!m)return null;
 const host=m[1].toLowerCase().replace(/^www\./,'');
 return host+(m[2]??'').replace(/\/$/,'');
}
export function extractExposureRecords(packet,path){
 const entries=[],unparsed=[],urls=new Set();
 function walk(x,loc,id=null){
  if(typeof x==='string'){const u=normalizeExposureUrl(x);if(u)urls.add(u);return;}
  if(!x||typeof x!=='object')return;
  const contextId=idText(x.caseId)?x.caseId:idText(x.id)?x.id:id;
  for(const field of ['pillars','rawPillars'])if(own(x,field)){
   const n=normalizeExposurePillars(x[field]),ref={path,locator:loc+'/'+field,id:contextId,field};
   if(n)entries.push({...ref,...n});
   else unparsed.push({...ref,value:x[field]});
  }
  for(const [k,v] of Object.entries(x))walk(v,loc+'/'+k.replace(/~/g,'~0').replace(/\//g,'~1'),contextId);
 }
 walk(packet,'');
 return {path,entries,unparsed,urls:[...urls].sort(cmp)};
}
export function combineExposureRecords(records){
 const charts=new Map(),urls=new Set(),unparsed=[];
 for(const r of records){
  for(const e of r.entries){
   const k=key(e.pillars);
   if(!charts.has(k))charts.set(k,{pillars:e.pillars,complete:e.complete,sexagenary:e.sexagenary,references:[]});
   charts.get(k).references.push({path:e.path,locator:e.locator,id:e.id,field:e.field});
  }
  for(const u of r.urls)urls.add(u);
  unparsed.push(...r.unparsed);
 }
 return {charts:[...charts.values()].sort((a,b)=>cmp(key(a.pillars),key(b.pillars))),urls:[...urls].sort(cmp),unparsed};
}
// Keep every frozen exposure even if a fixture is subsequently edited,
// moved or deleted. Deduplicate only identical reference identities.
export function mergeExposureInventories(frozen,live){
 const charts=new Map(),urls=new Set(),unparsed=new Map();
 for(const inv of [frozen,live]){
  for(const c of inv.charts){
   const k=key(c.pillars);
   if(!charts.has(k))charts.set(k,{pillars:c.pillars,complete:c.complete,sexagenary:c.sexagenary,references:[]});
   const row=charts.get(k),refs=new Set(row.references.map(key));
   for(const r of c.references)if(!refs.has(key(r))){refs.add(key(r));row.references.push(r);}
  }
  for(const u of inv.urls)urls.add(u);
  for(const p of inv.unparsed)unparsed.set(key(p),p);
 }
 return {charts:[...charts.values()].sort((a,b)=>cmp(key(a.pillars),key(b.pillars))),urls:[...urls].sort(cmp),unparsed:[...unparsed.values()]};
}
export function exposureInventoryDrift(frozen,live){
 const refs=inv=>new Set(inv.charts.flatMap(c=>c.references.map(r=>key([c.pillars,r]))));
 const a=refs(frozen),b=refs(live);
 return {removedReferences:[...a].filter(k=>!b.has(k)).length,addedReferences:[...b].filter(k=>!a.has(k)).length,
  removedUrls:frozen.urls.filter(u=>!live.urls.includes(u)).length,addedUrls:live.urls.filter(u=>!frozen.urls.includes(u)).length};
}
// An exact chart or an otherwise identical three-position chart is
// quarantined. For a partial prior record, compare the three known
// positions. This is conservative screening, not identity proof.
export function screenExposureCandidate(candidate,inventory){
 const n=normalizeExposurePillars(candidate?.pillars);
 if(!n||!n.complete||!n.sexagenary||!idText(candidate?.id)||!candidate.source||
  !['work','commentator','edition','chapter','passage','url'].every(k=>idText(candidate.source[k]))||
  !normalizeExposureUrl(candidate.source.url)||Object.keys(candidate).some(k=>!['id','pillars','source'].includes(k))||
  Object.keys(candidate.source).some(k=>!['work','commentator','edition','chapter','passage','url'].includes(k)))
  return {id:candidate?.id??null,status:'invalid-candidate',matches:[],sourceOverlap:false,independentGold:false};
 const matches=[];
 for(const chart of inventory.charts){
  const differences=chart.pillars.flatMap((p,i)=>p!==null&&p!==n.pillars[i]?[i]:[]);
  const matching=chart.pillars.filter((p,i)=>p!==null&&p===n.pillars[i]).length;
  const kind=chart.complete&&differences.length===0?'exact':!chart.complete&&matching===3?'partial-overlap':
   chart.complete&&matching===3?'one-pillar-variant':null;
  if(kind)matches.push({kind,pillars:chart.pillars,differingPositions:differences,references:chart.references});
 }
 const sourceOverlap=inventory.urls.includes(normalizeExposureUrl(candidate.source.url));
 return {id:candidate.id,pillars:n.pillars,status:matches.length?'quarantined-chart-overlap':sourceOverlap?'source-review-required':'fixture-screen-passed-review-pending',
  matches,sourceOverlap,independentGold:false,requiredReview:['source-transcription-and-ordinary-scope','historical-and-inline-exposure','source-author-edition-cluster','external-reviewer-independence','freeze-before-engine-evaluation']};
}
export function screenExposurePacket(packet,inventory){
 if(!packet||packet.version!=='p1-5b-intake-v1'||!Array.isArray(packet.candidates)||!packet.candidates.length||
  Object.keys(packet).some(k=>!['version','candidates'].includes(k)))return {status:'invalid-packet',rows:[],independentGoldCases:0};
 const rows=packet.candidates.map(c=>screenExposureCandidate(c,inventory));
 const ids=new Set(),keys=new Set();
 for(const r of rows){
  if(r.status==='invalid-candidate')continue;
  const k=key(r.pillars);
  if(ids.has(r.id)||keys.has(k))return {status:'duplicate-candidate',rows,independentGoldCases:0};
  ids.add(r.id);keys.add(k);
 }
 // The prospective packet itself must not silently count near duplicates
 // as independent evidence. Keep all rows and quarantine the packet.
 const valid=rows.filter(r=>r.status!=='invalid-candidate');
 for(let i=0;i<valid.length;i++)for(let j=i+1;j<valid.length;j++)
  if(valid[i].pillars.filter((p,k)=>p===valid[j].pillars[k]).length>=3)return {status:'near-duplicate-candidates',rows,independentGoldCases:0};
 return {status:rows.some(r=>r.status==='invalid-candidate')?'invalid-packet':rows.some(r=>r.status==='quarantined-chart-overlap')?'quarantined':'review-pending',rows,independentGoldCases:0};
}
