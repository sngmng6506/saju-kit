// Review targets are independent signed propositions. Contact-local
// impairment or relief does not imply net slot retention or actor access.
export const rootEvidencePredicates=Object.freeze([
 ['slot-retained',['slotId'],'The original constituent remains eligible as a root seed in the final natal context.'],
 ['root-access',['slotId','nodeId'],'If the constituent is retained, the exact actor can access it as a root seed.'],
 ['clash-impairment',['slotId','clashId'],'This exact clash impairs the original constituent; not necessarily total loss.'],
 ['formation-impairment',['slotId','formationId'],'This exact formation impairs the original constituent; not necessarily total loss.'],
 ['clash-relief',['clashId','formationId'],'This exact formation relieves the specified clash; not necessarily slot preservation.'],
 ['slot-preservation-by-relief',['slotId','clashId','formationId'],'This exact relief preserves the original constituent against this clash; not net retention across all contacts.']
].map(([predicate,fields,proposition])=>Object.freeze({predicate,fields:Object.freeze(fields),proposition,scope:'natal',authority:'review-only'})));
const pos=['year','month','day','hour'],stems='갑을병정무기경신임계',elements=['wood','fire','earth','metal','water'];
const valid=x=>typeof x==='string'&&x.trim().length>0;
export function validRootEvidenceTarget(t){
 if(!t||t.kind!=='root-condition')return false;
 const d=rootEvidencePredicates.find(d=>d.predicate===t.predicate);
 if(!d||Object.keys(t).length!==d.fields.length+2||!d.fields.every(f=>Object.hasOwn(t,f)&&valid(t[f])))return false;
 if(d.fields.includes('slotId')){
  const [layer,p,s,...rest]=t.slotId.split(':');
  if(layer!=='hidden'||!pos.includes(p)||s?.length!==1||!stems.includes(s)||rest.length)return false;
 }
 if(d.fields.includes('nodeId')){
  const [p,layer,element,...rest]=t.nodeId.split(':');
  if(!pos.includes(p)||rest.length||!(layer==='stem'&&element===undefined||layer==='branch'&&elements.includes(element)))return false;
 }
 return true;
}
