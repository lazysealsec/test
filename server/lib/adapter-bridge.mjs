import { mkdtempSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';

export function adapterBridge(worker, digest) {
  if (createHash('sha256').update(worker).digest('hex') !== digest) throw new Error('Worker integrity failed');
  const root = mkdtempSync('/private/tmp/chart-workbench-');
  writeFileSync(join(root, '.lab-authorized'), 'analyst-owned-fixture\n', { mode: 0o600 });
  const started = new Set();
  const allowed = new Set(['renderer', 'series', 'readiness']);
  const bridge = Object.freeze({
    spawnWorker(kind) {
      if (!allowed.has(kind) || started.has(kind)) throw new Error('Unexpected worker request');
      started.add(kind);
      return new Promise((resolve, reject) => {
        const child = spawn(process.execPath, ['--max-old-space-size=128', '--no-warnings', '-', root, kind], {
          cwd: root, detached: false, stdio: ['pipe', 'ignore', 'pipe'], env: {PATH: '/usr/bin:/bin'}
        });
        const timer = setTimeout(() => { child.kill('SIGTERM'); reject(new Error('Worker time limit exceeded')); }, 5000);
        child.stderr.resume();
        child.stdin.on('error', () => {});
        child.once('error', error => {clearTimeout(timer); reject(error);});
        child.once('close', code => {
          clearTimeout(timer);
          const marker = join(root, 'renderer-' + kind + '.json');
          if (code !== 0 || !existsSync(marker)) reject(new Error('Worker readiness failed'));
          else resolve({ kind, pid: child.pid, marker });
        });
        child.stdin.end(worker);
      });
    }
  });
  return { root, bridge };
}
