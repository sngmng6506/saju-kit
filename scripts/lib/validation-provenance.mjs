import {resolve} from 'node:path';
// A failed git command is not a clean worktree. Exempt only the exact
// report files written by this invocation, not an entire directory.
export function inspectValidationState(root,reportPaths,run){
 const errors=[];
 function read(args){
  const r=run(args);
  if(!r||r.status!==0||r.error||r.signal||typeof r.stdout!=='string'){
   errors.push({command:args,exitCode:r?.status??null,signal:r?.signal??null,error:r?.error?.message??r?.stderr?.trim()??'git command failed'});
   return null;
  }
  return r.stdout;
 }
 const rawHead=read(['rev-parse','--verify','HEAD']);
 const head=rawHead?.trim()??null;
 if(head!==null&&!/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(head))errors.push({command:['rev-parse','--verify','HEAD'],error:'invalid commit identity'});
 const dirty=read(['status','--porcelain=v1','--untracked-files=no'])?.trimEnd()??null;
 const raw=read(['ls-files','--others','--exclude-standard','-z']);
 const allowed=new Set(reportPaths.map(p=>resolve(p)));
 const untracked=raw===null?null:raw.split('\0').filter(Boolean).filter(p=>!allowed.has(resolve(root,p))).sort();
 return {head,dirty,untracked,errors,clean:errors.length===0&&head!==null&&dirty===''&&untracked?.length===0};
}
export function validationPassed(before,after,receipts){
 return before.clean===true&&after.clean===true&&before.head===after.head&&Array.isArray(receipts)&&receipts.length>0&&receipts.every(r=>r.passed===true);
}
