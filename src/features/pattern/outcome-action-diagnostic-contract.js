// Shared envelope validation for the composition and its replay. Nested
// bounded analyses may be unavailable; the outer diagnostic must still
// report its chart scope and abstain from actual-effect authority.
const authorityFields=Object.freeze(['effective','effectiveSupply','rootEffectConfirmed','effectConfirmed','neutralizationConfirmed','damageConfirmed','preservationConfirmed','reliefConfirmed','restrictionConfirmed','retentionConfirmed','transformationConfirmed','noninterferenceConfirmed']);
const unresolvedFields=Object.freeze(['actualStrengthState','actualReplenishmentState','actualMagnitudeComparison','actualPreservationState','actualDepthState','actualAccessState']);
export function inspectActionDiagnostics(diagnostics,completeHour){
 const expected=completeHour?'diagnostic':'partial';
 const invalid=[];
 if(typeof completeHour!=='boolean'||!diagnostics||typeof diagnostics!=='object'||Array.isArray(diagnostics)||!Object.keys(diagnostics).length)
  return [{owner:'actionDiagnostics',status:'invalid-evidence',reason:'inventory'}];
 for(const [owner,r] of Object.entries(diagnostics)){
  if(!r||typeof r!=='object'||Array.isArray(r)){
   invalid.push({owner,status:'invalid-evidence',reason:'missing-result'});continue;
  }
  if(r.status!==expected){
   invalid.push({owner,status:r.status??'invalid-evidence',reason:r.reason??'unexpected-status'});continue;
  }
  if(r.completeHour!==completeHour){
   invalid.push({owner,status:'invalid-evidence',reason:'scope-mismatch'});continue;
  }
  if(r.selectionAuthority!==false||authorityFields.some(k=>Object.hasOwn(r,k)&&r[k]!==null)||
   unresolvedFields.some(k=>Object.hasOwn(r,k)&&r[k]!=='unresolved')||
   r.summary&&Object.hasOwn(r.summary,'actualEffectsConfirmed')&&r.summary.actualEffectsConfirmed!==0){
   invalid.push({owner,status:'invalid-evidence',reason:'authority-violation'});continue;
  }
 }
 return invalid;
}
