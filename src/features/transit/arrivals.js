// Preserve exact stem identity, location and hidden role; no effect inference.
export function layerArrivals(l){
 return [{location:'stem',stem:l.stem.stem,element:l.stem.element},
  ...l.branch.hiddenStems.map(h=>({location:'hidden-stem',stem:h.stem,element:h.element,role:h.role}))];
}
