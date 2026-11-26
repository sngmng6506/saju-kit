// Source-derived semantic boundaries. These are review obligations,
// not executable equivalences or actual-effect rules.
const S='https://www.donglishuzhai.net/chapter/3719.html';
const W='https://zh.wikisource.org/zh-hant/三命通會_(四庫全書本)/卷12';
const I='https://www.donglishuzhai.net/chapter/3748.html';
const K='https://donglishuzhai.net/chapter/3752.html';
const entries=[
 ['element-strength','element-context',['season-support','substantial-root','relative-dominance','day-direction'],['element-scope','root-and-supply','control-and-drain'],[S,W]],
 ['element-excess','element-context',['element-strength','root-count'],['excess-distinct-from-strength','recipient-context'],[W,I]],
 ['element-resistance','element-context',['relative-dominance','element-strength'],['target-resistance','source-context'],[W]],
 ['recipient-capacity','directed-edge',['source-root','generation-screen','source-release'],['recipient-context','adverse-excess','actual-reception'],[W,I]],
 ['leg-operation','directed-edge',['literal-relation','structural-screen','modeled-tendency'],['endpoint-capacity','actual-operation'],[W,K]],
 ['source-context','route',['literal-route','role-label'],['exact-source-condition','role-demand','scope'],[I,K]],
 ['path-operation','route',['literal-route','modeled-route'],['all-leg-operation','placement-and-context'],[K]],
 ['path-obstruction','route',['contact-presence','pressure-presence'],['exact-obstruction-or-clearance'],[K]],
 ['pair-restricts-leg','pair-edge',['combination-presence'],['exact-leg-restriction-or-clearance'],[]],
 ['root-loss-blocks-leg','root-edge',['root-exposure'],['root-loss','remaining-capacity','exact-leg-restriction'],[S]],
 ['pressure-relief-operation','pressure',['candidate-route','conditional-readiness'],['actual-relief','target-context'],[K]],
 ['external-pressure-relief','pressure',['absence-of-visible-route'],['independent-relief-evidence'],[]]
];
const registry=Object.freeze(entries.map(([kind,scope,proxies,requires,sources])=>Object.freeze({kind,scope,nonEquivalentProxies:Object.freeze(proxies),reviewObligations:Object.freeze(requires),sources:Object.freeze(sources),status:'unreviewed-bridge',authority:'review-obligation-only'})));
const byKind=new Map(registry.map(r=>[r.kind,r]));
export const semanticBridgeRegistry=()=>registry;
export function describeSemanticBridge(kind,subject){
 const r=byKind.get(kind);
 if(!r||!Array.isArray(subject)||subject.length!==(['pair-edge','root-edge'].includes(r.scope)?2:1)||subject.some(x=>typeof x!=='string'||!x.length))return null;
 return {...r,subject:[...subject],state:'unresolved',selectionAuthority:false,effective:null};
}
