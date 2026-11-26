import {evaluateArguments} from './outcome-argumentation.js';
import {evaluateConditionalArguments} from './outcome-conditional-arguments.js';
export const CONTEXTUAL_STRENGTH_VERSION='p3-contextual-strength-v1';
const elements=['wood','fire','earth','metal','water'];
const source='https://donglishuzhai.net/chapter/3719.html';
const commentary='https://ncc.com.tw/fate/paleo/bg/bg_032.htm';
const key=(...xs)=>JSON.stringify(xs);
const lit=(propositionId,sign='for')=>({propositionId,sign});
const ref=(owner,id,field)=>({owner,id,field});
const structural=['visible','substantial-root-basis','controller-basis','output-basis'];
const semantic=[
 {id:'deep-root-available',meaning:'Deep, usable root support; not literal root existence or principal-root status.'},
 {id:'control-exceeds-support',meaning:'Uncompensated control burden beyond available support; not a rooted controller observation.'},
 {id:'drain-exceeds-support',meaning:'Uncompensated output drain beyond replenishment; not an outgoing generation relation.'}
];
const definitions=[
 {id:'rooted-strength',target:'strong',requires:[lit('visible'),lit('substantial-root-basis'),lit('deep-root-available'),lit('control-exceeds-support','against'),lit('drain-exceeds-support','against')],source},
 {id:'control-weakness',target:'weak',requires:[lit('visible'),lit('controller-basis'),lit('control-exceeds-support')],source},
 {id:'drain-weakness',target:'weak',requires:[lit('visible'),lit('output-basis'),lit('drain-exceeds-support')],source:commentary}
];
// Source-inspired conditional model, not reviewed classical sufficiency.
// The same signed burden predicates occur in support and contrast rules.
// Season is intentionally not a necessary premise of these alternatives.
export function evaluateContextualStrength({completeHour,element,axes,evidenceRefs,includeScenarios=true,rootSlotIds=null}={}){
 const base={version:CONTEXTUAL_STRENGTH_VERSION,completeHour,element,selectionAuthority:false,effective:null,actualStrengthState:'unresolved'};
 const empty=reason=>({...base,status:'invalid-evidence',reason});
 if(typeof completeHour!=='boolean'||typeof includeScenarios!=='boolean'||!elements.includes(element)||!axes||!evidenceRefs||
  Object.keys(axes).length!==structural.length||structural.some(k=>![true,false,null].includes(axes[k])||!Array.isArray(evidenceRefs[k])||!evidenceRefs[k].length)||
  !completeHour&&structural.some(k=>axes[k]!==null))return empty('axis-contract');
 if(rootSlotIds!==null&&(!Array.isArray(rootSlotIds)||rootSlotIds.some(id=>typeof id!=='string'||!id)||new Set(rootSlotIds).size!==rootSlotIds.length||
  completeHour&&axes['substantial-root-basis']!==null&&axes['substantial-root-basis']!==(rootSlotIds.length>0)))return empty('root-slot-contract');
 const scope=completeHour?'complete':'partial';
 const propositions=[...structural.map(id=>({id,subject:element,kind:'structural-strength-context',level:'observation'})),
  ...semantic.map(({id})=>({id,subject:element,kind:'unreviewed-strength-bridge',level:'observation'})),
  ...['strong','weak'].map(id=>({id,subject:element,kind:'source-inspired-conditional-strength',level:'structural-hypothesis'}))];
 const evidence=structural.filter(id=>axes[id]!==null).map(id=>({id:key(id,axes[id]),...lit(id,axes[id]?'for':'against'),refs:evidenceRefs[id],applicability:'complete-only'}));
 const rules=definitions.flatMap(d=>['for','against'].map(sign=>({id:key(d.id,sign),policyId:CONTEXTUAL_STRENGTH_VERSION,
  conclusion:lit(sign==='for'?d.target:d.target==='strong'?'weak':'strong',sign),premises:d.requires.map(p=>({...p})),
  refs:[ref('source-inspired-strength-policy',d.id,d.source)],applicability:'complete-only'})));
 const packet={scope,propositions,evidence,rules};
 const result=evaluateArguments(packet);
 if(result.status!==(completeHour?'diagnostic':'partial'))return empty('argument-evaluation');
 const j=new Map(result.judgments.map(p=>[p.id,p]));
 const assumptions=semantic.map(s=>({...s,state:j.get(s.id).state,authority:'hypothetical-only'}));
 // Necessary structural condition only: deep usable root requires at least
 // one surviving substantial slot in this modeled direct-root scope.
 // Retention alone does not prove access, depth, or usable support.
 const slotVariables=(rootSlotIds??[]).map(id=>({id:key('slot-retained',id),value:null}));
 const constraints=rootSlotIds===null?[]:[{id:'deep-root-requires-retained-slot',formula:{op:'any',args:[
  {op:'not',arg:{op:'var',id:'deep-root-available'}},
  {op:'any',args:slotVariables.map(v=>({op:'var',id:v.id}))}
 ]},refs:[ref('contextual-strength-scenario-policy',CONTEXTUAL_STRENGTH_VERSION,'necessary-root-retention')]}];
 const scenario=includeScenarios?evaluateConditionalArguments({packet,expected:result,variables:[...semantic.map(s=>({id:s.id,value:null})),...slotVariables],
  bindings:semantic.map(s=>({propositionId:s.id,formula:{op:'var',id:s.id}})),constraints,
  targets:['strong','weak'].map(id=>({id,propositionId:id}))}):null;
 if(scenario&&!['diagnostic','partial','unavailable'].includes(scenario.status))return empty('scenario-evaluation');
 return {...base,status:result.status,reason:null,axes:{...axes},assumptions,rootSlotIds:rootSlotIds===null?null:[...rootSlotIds],
  strongState:j.get('strong').state,weakState:j.get('weak').state,
  propositions,evidence,rules,judgments:result.judgments,ruleResults:result.ruleResults,scenario,
  limitations:['conditional-alternatives-not-classical-sufficiency','observed-basis-not-effective-burden','semantic-bridges-unreviewed','not-a-replacement-for-legacy-model','no-effect-authority']};
}
