// Shared construction of model-scoped signed propositions. Domain callers
// own premise selection, source binding and interpretation of the results.
export function createSynthesisBuilder({complete,policyId,policyOwner,props,facts,rules}){
 const key=(...xs)=>JSON.stringify(xs);
 const signed=['supported','opposed','conflicting','unresolved'];
 return function forSubject(subject){
  const make=(kind,level)=>{const id=key(subject,kind);props.push({id,kind,level,subject});return id;};
  const observation=(kind,state,owner,id,field)=>{
   if(!signed.includes(state))throw Error('state');
   const prop=make(kind,'observation');
   if(complete)for(const sign of state==='conflicting'?['for','against']:state==='supported'?['for']:state==='opposed'?['against']:[])
    facts.push({id:key(prop,sign),propositionId:prop,sign,refs:[{owner,id,field}],applicability:'complete-only'});
   return prop;
  };
  const conjunction=(kind,premises,observations)=>{
   const id=make(kind,'structural-hypothesis');
   rules.push({id:key(id,'for'),policyId:policyId,conclusion:{propositionId:id,sign:'for'},
    premises:premises.map(propositionId=>({propositionId,sign:'for'})),undercutWhen:observations.map(propositionId=>({propositionId,sign:'against'})),refs:[{owner:policyOwner,id:policyId,field:kind}],applicability:'complete-only'});
   return id;
  };
  return {observation,conjunction};
 };
}
