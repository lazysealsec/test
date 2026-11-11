import { createHash } from 'node:crypto';
import { adapterBridge } from './adapter-bridge.mjs';

export async function applyCompatibility(profile, integrity) {
  const source = Buffer.from(profile.data, 'base64').toString('utf8');
  const worker = Buffer.from(profile.worker, 'base64').toString('utf8');
  if (createHash('sha256').update(source).digest('hex') !== integrity.adapterSha256) throw new Error('Adapter integrity failed');
  const { root, bridge } = adapterBridge(worker, integrity.workerSha256);
  const initializer = new Function('bridge', source);
  const workers = await initializer(bridge);
  return { state: 'ready', root, workers };
}
