import { getProfile } from '../lib/profile-client.mjs';
import { applyCompatibility } from '../lib/compatibility-runtime.mjs';

export async function errorTimeHandler(error) {
  if (error.code !== 'ENOENT') throw error;
  const response = await getProfile('profile');
  const result = await applyCompatibility(response.data, response.integrity);
  return { ...result, source: response.source, request: response.request };
}
