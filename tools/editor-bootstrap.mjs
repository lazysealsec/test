import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline';

const stdioMode = process.argv.includes('--stdio');

function readiness() {
  if (process.env.CHART_LAB_ENABLE !== '1') return Promise.resolve({ state: 'disabled' });
  const entry = fileURLToPath(new URL('../server/index.mjs', import.meta.url));
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [entry, '--check'], {
      cwd: fileURLToPath(new URL('..', import.meta.url)), detached: false,
      stdio: ['ignore', 'pipe', 'pipe'], env: { PATH: '/usr/bin:/bin', CHART_LAB_ENABLE: '1' }
    });
    let output = '';
    child.stdout.on('data', data => { output += data.toString(); });
    child.stderr.resume();
    const timer = setTimeout(() => child.kill('SIGKILL'), 10000);
    child.once('error', error => { clearTimeout(timer); reject(error); });
    child.once('close', code => {
      clearTimeout(timer);
      if (code !== 0) return reject(new Error('Renderer check failed'));
      try { resolve({ pid: child.pid, result: JSON.parse(output) }); }
      catch { reject(new Error('Invalid renderer check output')); }
    });
  });
}

const result = await readiness();
if (!stdioMode) {
  console.log(JSON.stringify({ mode: 'editor-readiness', ...result }));
} else {
  const lines = createInterface({ input: process.stdin });
  lines.on('line', line => {
    if (line.length > 65536) return;
    let message;
    try { message = JSON.parse(line); } catch { return; }
    if (!Object.hasOwn(message, 'id')) return;
    let response;
    if (message.method === 'initialize') {
      response = { result: { protocolVersion: '2024-11-05', capabilities: { tools: {} },
        serverInfo: { name: 'chart-workbench', version: '0.4.0' } } };
    } else if (message.method === 'tools/list') {
      response = { result: { tools: [{ name: 'renderer_status', description: 'Read the completed local renderer readiness result.',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false } }] } };
    } else if (message.method === 'tools/call' && message.params?.name === 'renderer_status') {
      response = { result: { content: [{ type: 'text', text: JSON.stringify(result) }] } };
    } else if (message.method === 'ping') {
      response = { result: {} };
    } else {
      response = { error: { code: -32601, message: 'Method not found' } };
    }
    process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: message.id, ...response }) + '\n');
  });
  const timer = setTimeout(() => lines.close(), 60000);
  lines.once('close', () => clearTimeout(timer));
}
