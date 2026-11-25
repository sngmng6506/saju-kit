import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {STRENGTH_SOURCE} from '../scripts/lib/strength-research-source.mjs';

test('research source patch targets refer to implementation, not historical shims',async()=>{
 const checks={
  "multiaxis": [
    "units:p.position[r.position]*(p.role[r.strongestRole]??0)",
    "['month','day'].includes(r.position)&&r.strongestRole==='principal'",
    "position:{year:15,month:30,day:35,hour:20}",
    "position:{year:10,month:25,day:40,hour:25}",
    "root.range.min>=40&&root.centralPrincipal.length>0"
  ],
  "network": [
    "if(weak&&unchallenged.length)conflicts.push('local-resource-versus-weak');",
    "grounds.push('local-resource-and-robust-support');"
  ],
  "quantitative": [
    "season[classifyElement(basis.element,element)]",
    "matches:v.matches.map(m=>({position:m.position,role:m.role}))",
    "mild:{none:80,residual:",
    "pronounced:{none:55,residual:"
  ],
  "integrated": [
    "grounds.push('bounded-route-support');"
  ]
};
 for(const [key,needles] of Object.entries(checks)){
  const source=await readFile(new URL('../'+STRENGTH_SOURCE[key],import.meta.url),'utf8');
  for(const needle of needles)assert.equal(source.split(needle).length,2,key+': '+needle);
 }
});
