import {auditLayout,layoutIsClean} from './lib/project-layout.mjs';
const result=auditLayout();
console.log(JSON.stringify(result,null,2));
if(!layoutIsClean(result))process.exitCode=1;
