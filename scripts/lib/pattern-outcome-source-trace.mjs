import {stemInfo,elementRelation} from '../../src/core/elements.js';
import {stemCombination} from '../../src/core/relations.js';
import {getHiddenStems} from '../../src/core/hidden-stems.js';
const positions=['year','month','day','hour'];
const key=(a,b,k)=>JSON.stringify(k==='combine'?[k,...[a,b].sort()]:[k,a,b]);
const ref=(r,w)=>({ruleId:r.id,witnessId:w.id});
const matches=(e,k)=>key(e.from,e.to,e.kind)===k;
// Resolve literal endpoint against the frozen chart, not an engine label.
function actor(c,id){
 const [layer,position,s,...rest]=id.split(':'),pillar=c.pillars[positions.indexOf(position)];
 if(rest.length||!pillar||!['visible','hidden'].includes(layer))return null;
 if(layer==='visible'&&s!==undefined)return null;
 if(layer==='hidden'&&!getHiddenStems(pillar[1]).some(h=>h.stem===s))return null;
 const stem=layer==='visible'?pillar[0]:s;
 return {id,position,layer,stem,element:stemInfo(stem).element};
}
export function observeLiteralSourceRelation(c,p){
 const a=actor(c,p.from),b=actor(c,p.to);
 if(!a||!b||a.id===b.id)return {status:'endpoint-not-in-chart',from:a,to:b};
 const relation=elementRelation(a.element,b.element);
 const supported=p.kind==='combine'?a.layer==='visible'&&b.layer==='visible'&&!!stemCombination(a.stem,b.stem):
  relation.type===p.kind&&relation.direction==='left-to-right';
 return {status:supported?'literal-relation-observed':'literal-relation-mismatch',from:a,to:b,
  samePhysicalSlot:a.position===b.position&&a.layer===b.layer,effective:null};
}
// Trace coverage independently of classical-effect agreement. A graph edge
// is not a witness, and a witness is not a confirmed effect.
export function traceMechanismSource(c,p,prior,result){
 const literal=observeLiteralSourceRelation(c,p),k=key(p.from,p.to,p.kind);
 const base={literal,graph:null,candidates:[],stage:null,effectAgreement:null};
 const finish=(stage,extra={})=>({...base,...extra,stage});
 if(literal.status!=='literal-relation-observed')return finish('source-endpoint-or-relation-mismatch');
 if(!prior?.relativeForce||!result?.access||!result.efficacyReview?.mechanismReview)return finish('analysis-unavailable');
 const actors=new Set(prior.stemForce.occurrences.map(o=>o.id));
 if(!actors.has(p.from)||!actors.has(p.to))return finish('core-occurrence-mismatch');
 const graphEdges=prior.relativeForce.edges.filter(e=>matches(e,k));
 const combos=result.efficacyReview.mechanismReview.combinationContext?.pairs??[];
 const pair=combos.filter(x=>x.participants.length===2&&key(x.participants[0],x.participants[1],'combine')===k);
 const graph=p.kind==='combine'?{kind:'stem-combination-context',observed:pair.length===1,refs:pair.map(x=>x.formationId)}:
  {kind:'directed-relative-force',observed:graphEdges.length===1,refs:graphEdges.map(e=>e.id),blockers:graphEdges.flatMap(e=>e.blockers??[]),
   relative:graphEdges[0]?.relative?.relation??null};
 if((p.kind==='combine'?pair.length:graphEdges.length)>1)return finish('duplicate-core-relation',{graph});
 if(!graph.observed)return finish(literal.samePhysicalSlot&&p.kind!=='combine'?'same-slot-excluded':'core-relation-missing',{graph});
 const reviews=result.reviews??[],mechanism=result.efficacyReview.mechanismReview.candidates??[];
 const relevant=reviews.filter(q=>q.family===c.family);
 if(!relevant.length)return finish('family-candidate-missing',{graph});
 const active=relevant.filter(q=>q.status!=='out-of-scope');
 if(!active.length)return finish('family-out-of-scope',{graph});
 const rows=active.map(q=>{
  const raw=[];
  for(const r of q.rules)for(const w of r.witnesses){
   if(w.edges.some(e=>matches(e,k)))raw.push({...ref(r,w),scope:'mandatory'});
   for(const b of w.anchorBindings??[])if(b.edge&&matches(b.edge,k))raw.push({...ref(r,w),scope:'anchor-alternative',anchorId:b.anchorId,targetId:b.targetId??null});
  }
  const ms=mechanism.filter(m=>m.candidateId===q.candidateId),m=ms[0];
  const hits=(m?.edges??[]).filter(e=>matches(e,k));
  const invalid=ms.length!==1||m.status==='invalid-evidence'||m.selectionAuthority!==false||
    hits.some(e=>e.effective!==null)||Boolean(raw.length)!==Boolean(hits.length);
  return {candidateId:q.candidateId,rawWitnessRefs:raw,hypotheses:hits.map(e=>({edgeId:e.id,status:e.status})),
   stage:invalid?'projection-integrity-mismatch':!raw.length?'family-route-not-covered':'hypothesis-observed'};
 });
 return finish(rows.some(r=>r.stage==='projection-integrity-mismatch')?'projection-integrity-mismatch':
  rows.every(r=>r.stage==='family-route-not-covered')?'family-route-not-covered':
  rows.some(r=>r.stage==='family-route-not-covered')?'partial-candidate-coverage':'hypothesis-observed',{graph,candidates:rows});
}
export function summarizeSourceTrace(rows){
 const counts={},integrityFailures=[];
 for(const r of rows)for(const p of r.probes??[]){
  const stage=p.trace?.stage??'trace-missing';counts[stage]=(counts[stage]??0)+1;
  if(['trace-missing','source-endpoint-or-relation-mismatch','analysis-unavailable','core-occurrence-mismatch','duplicate-core-relation','core-relation-missing','projection-integrity-mismatch'].includes(stage))
   integrityFailures.push({caseId:r.id,probeId:p.id,stage});
 }
 return {counts,integrityFailures,effectAgreement:null};
}
