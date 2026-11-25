import { inspect } from 'node:util';
import { resolve } from 'node:path';
const fileKey = file => file ? resolve(file) : '';

// Reporter only: Node's test runner retains control of the exit status.
export default async function* failuresReporter(source) {
  const failures = [], stderr = new Map(), diagnostics = new Map();
  let summary;
  for await (const {type, data} of source) {
    if (type === 'test:fail' && !data.todo && !data.skip) failures.push(data);
    if (type === 'test:stderr') {
      const file = fileKey(data.file);
      stderr.set(file, (stderr.get(file) ?? '') + data.message);
    }
    if (type === 'test:diagnostic' && data.nesting === 0) {
      const match = /^(tests|pass|fail|cancelled|skipped|todo) (\d+)$/.exec(data.message);
      if (match) diagnostics.set(match[1], Number(match[2]));
    }
    if (type === 'test:summary' && !data.file) summary = data;
  }
  const concrete = failures.filter(f => f.details?.error?.failureType !== 'subtestsFailed');
  const shown = concrete.length ? concrete : failures;
  for (const f of shown) {
    const error = f.details?.error;
    const location = f.file ? '\n  '+f.file+':'+(f.line ?? '?')+':'+(f.column ?? '?') : '';
    yield '\nFAIL '+f.name+location+'\n'+inspect(error?.cause instanceof Error ? error.cause : error, {depth: 6, colors: false})+'\n';
  }
  const failedFiles = new Set(shown.map(f => fileKey(f.file)));
  for (const [file, message] of stderr) {
    if (failedFiles.has(file)) yield '\n--- stderr: '+(file || 'test runner')+' ---\n'+message.trimEnd()+'\n';
  }
  const c = summary?.counts;
  const failed = c?.failed ?? diagnostics.get('fail') ?? failures.length;
  const cancelled = c?.cancelled ?? diagnostics.get('cancelled') ?? 0;
  const passed = c?.passed ?? diagnostics.get('pass');
  const total = c?.tests ?? diagnostics.get('tests');
  const status = failures.length || failed || cancelled || summary?.success === false ? 'FAIL' : 'PASS';
  yield '\n'+status+' | tests: '+(total ?? '?')+' | pass: '+(passed ?? '?')+' | fail: '+failed+' | cancelled: '+cancelled+'\n';
}
