// Shared node observations for path diagnostics. Anchoring is the existing
// support-network convention; intact substantial root is separate evidence.
export function observePathNode(dynamicsNode,structure){
 const n=dynamicsNode,p=structure.profiles.find(x=>x.element===n.element);
 if(!p)throw Error('unknown path element');
 const clashed=new Set(structure.clashes.flatMap(c=>c.positions));
 const visible=n.layer==='stem'?p.visible.find(v=>v.position===n.position):null;
 if(n.layer==='stem'&&!visible)throw Error('unknown path stem');
 return {id:n.id,element:n.element,layer:n.layer,position:n.position,
  anchorObserved:n.layer==='stem'?n.rooted:n.role==='principal',
  intactSubstantialRoot:n.layer==='stem'?visible.matches.some(m=>m.role!=='residual'&&!clashed.has(m.position)):
   n.role!=='residual'&&!clashed.has(n.position),
  dayReference:n.id==='day:stem'};
}
