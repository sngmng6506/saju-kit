import {elementContextModelContract} from '../../src/features/pattern/outcome-element-context.js';
import {evaluateScenarioSpace} from '../../src/features/pattern/outcome-scenario-space.js';
const v=id=>({op:'var',id}),not=arg=>({op:'not',arg}),all=(...args)=>({op:'all',args}),any=(...args)=>({op:'any',args});
const term=(axis,value)=>value?v(axis):not(v(axis));
const predicate=terms=>all(...terms.map(t=>term(t.axis,t.value)));
// Text-inspired abstract contrast contexts, NOT labeled charts. No
// axis combination is assumed to have a corresponding physical chart.
const contexts=[
 {id:'off-season-root-resource',formula:all(v('visible'),not(v('seasonSupports')),v('cleanPrincipalRoot'),v('independentLocalResourceBasis'),v('clearContacts'),v('monthContextClear'),v('noRootedControllerBasis')),source:'https://donglishuzhai.net/chapter/3719.html',question:'Can the model express a strong hypothesis outside the supportive season?'},
 {id:'in-season-rooted-control',formula:all(v('visible'),v('seasonSupports'),v('cleanPrincipalRoot'),v('localGroundedControlCoverage')),source:'https://donglishuzhai.net/chapter/3719.html',question:'Can the weak model express a rooted, season-supported element under control?'},
 {id:'in-season-rooted-burden',formula:all(v('visible'),v('seasonSupports'),v('cleanPrincipalRoot'),not(v('noRootedBurdenBasis'))),source:'https://changxianyi.com/guji/ziping/wz-20260914/chapter-007/',question:'Does the model distinguish a rooted burden observation from weakness?'},
 {id:'off-season-no-substantial-root',formula:all(v('visible'),not(v('seasonSupports')),not(v('substantialRoot'))),source:'https://donglishuzhai.net/chapter/3719.html',question:'Does lack of substantial root suffice for model weakness?'}
];
export function auditElementContextCoverage(){
 const {version,axes,ruleConditions,implications}=elementContextModelContract();
 const strong=any(predicate(ruleConditions.strong),predicate(ruleConditions.strongResource)),weak=predicate(ruleConditions.weak);
 const variables=axes.map(id=>({id,value:null}));
 const constraints=implications.map(([a,av,b,bv],i)=>({id:'implication:'+i,formula:any(not(term(a,av)),term(b,bv)),refs:[{owner:'element-context-model-contract',id:version,field:'implications'}]}));
 const queries=[{id:'strong',formula:strong},{id:'weak',formula:weak},...contexts.map(c=>({id:c.id,formula:c.formula}))];
 const space=evaluateScenarioSpace({scope:'complete',variables,queries,constraints});
 if(space.status!=='diagnostic'||!space.admissibleCount)return {status:'invalid-evidence',reason:space.reason,selectionAuthority:false,effective:null};
 const results=new Map(space.queries.map(q=>[q.id,q]));
 const pair=(a,b)=>space.pairs.find(p=>p.leftId===a&&p.rightId===b);
 const rows=contexts.map(c=>{
  const count=results.get(c.id).supportCount,sp=pair('strong',c.id),wp=pair('weak',c.id);
  return {id:c.id,source:c.source,question:c.question,contextCount:count,strongCount:sp.counts.both,weakCount:wp.counts.both,
   strongExcluded:count>0&&sp.counts.both===0,weakExcluded:count>0&&wp.counts.both===0,
   contextWitness:results.get(c.id).witness,strongWitness:sp.witnesses.both,weakWitness:wp.witnesses.both,
   referenceLabel:null,interpretation:'abstract-model-coverage-not-classical-label'};
 });
 return {status:'diagnostic',version,scenarioCount:space.scenarioCount,admissibleCount:space.admissibleCount,
  strongCount:results.get('strong').supportCount,weakCount:results.get('weak').supportCount,
  overlapCount:pair('strong','weak').counts.both,rows,selectionAuthority:false,effective:null,
  independentGoldCases:0,limitations:['necessary-axis-implications-not-physical-realizability','source-inspired-context-not-gold','assignment-count-not-probability','no-classical-effect-authority']};
}
