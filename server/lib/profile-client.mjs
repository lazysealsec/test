import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { environment } from '../config/environment.mjs';

async function requestProfile(url) {
  if (process.platform !== 'darwin' || !existsSync('/usr/bin/sandbox-exec') || !existsSync('/usr/bin/curl')) {
    return { attempted: false, reason: 'network-deny-sandbox-unavailable', remoteContentLoaded: false };
  }
  const policy = fileURLToPath(new URL('../../config/no-network.sb', import.meta.url));
  return new Promise((resolve, reject) => {
    const child = spawn('/usr/bin/sandbox-exec', ['-f', policy, '/usr/bin/curl',
      '--silent', '--show-error', '--proxy', '', '--noproxy', '*', '--proto', '=https',
      '--connect-timeout', '2', '--max-time', '3', url.href], {
      detached: false, stdio: ['ignore', 'ignore', 'pipe'], env: { PATH: '/usr/bin:/bin' }
    });
    child.stderr.resume();
    const timer = setTimeout(() => child.kill('SIGKILL'), 5000);
    child.once('error', error => { clearTimeout(timer); reject(error); });
    child.once('close', (code, signal) => {
      clearTimeout(timer);
      if (code === 0) return reject(new Error('Expected the controlled request to fail'));
      resolve({ attempted: true, pid: child.pid, exitCode: code, signal,
        url: url.href, containment: 'deny-network', remoteContentLoaded: false });
    });
  });
}

export async function getProfile(kind) {
  const config = environment();
  if (!config.enabled) throw new Error('Controlled exercise is disabled');
  if (!['profile', 'series'].includes(kind)) throw new Error('Unexpected asset kind');
  const encoded = config.values[kind === 'profile' ? 'CHART_PROFILE_B64' : 'CHART_SERIES_B64'];
  const url = new URL(Buffer.from(encoded, 'base64').toString('utf8'));
  const expected = kind === 'profile'
    ? 'https://updates.chart-renderer.invalid/v1/compatibility/profile'
    : 'https://series.chart-renderer.invalid/v1/candles';
  if (url.href !== expected) throw new Error('Unexpected profile endpoint');
  const request = await requestProfile(url);
  const asset = new URL('../../' + config.integrity[kind].path, import.meta.url);
  const bytes = readFileSync(asset);
  if (bytes.length > 65536 || createHash('sha256').update(bytes).digest('hex') !== config.integrity[kind].sha256) throw new Error('Profile integrity failed');
  return { data: JSON.parse(bytes.toString('utf8')), integrity: config.integrity,
    source: 'bundled-local-fixture', request };
}
