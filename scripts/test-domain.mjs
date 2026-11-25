import {spawnSync} from 'node:child_process';
import {TEST_DOMAINS} from './lib/test-domains.mjs';
import {root,auditTestLayout} from './lib/project-layout.mjs';

const args=process.argv.slice(2);
const layout=auditTestLayout();
if(Object.values(layout).some(rows=>rows.length)){
 console.error('Test domain inventory is out of date:',JSON.stringify(layout,null,2));
 process.exitCode=1;
}else if(args.length===1&&args[0]==='list'){
 for(const [domain,files] of Object.entries(TEST_DOMAINS))console.log(domain+' | '+files.length+' test files');
}else if(args.length!==1||!Object.hasOwn(TEST_DOMAINS,args[0])){
 console.error('Usage: npm run test:domain -- <'+Object.keys(TEST_DOMAINS).join('|')+'|list>');
 process.exitCode=2;
}else{
 const domain=args[0],files=TEST_DOMAINS[domain];
 console.log('DOMAIN | '+domain+' | '+files.length+' test files');
 const child=spawnSync(process.execPath,['--test','--test-reporter=./scripts/lib/failures-reporter.mjs',...files],{cwd:root,stdio:'inherit',shell:false});
 if(child.error)console.error(child.error.message);
 process.exitCode=child.status??1;
}
