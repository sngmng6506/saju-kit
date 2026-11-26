import {auditElementContextCoverage} from './lib/pattern-element-context-coverage.mjs';
const result=auditElementContextCoverage();
console.log(JSON.stringify(result,null,2));
if(result.status!=='diagnostic')process.exitCode=1;
