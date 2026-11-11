import { readFileSync } from 'node:fs';

export function environment() {
  const text = readFileSync(new URL('../../.env', import.meta.url), 'utf8');
  const values = Object.fromEntries(text.split('\n').filter(line => line && !line.startsWith('#')).map(line => {
    const separator = line.indexOf('=');
    return [line.slice(0, separator), line.slice(separator + 1)];
  }));
  const integrity = JSON.parse(readFileSync(new URL('../../config/integrity.json', import.meta.url), 'utf8'));
  return { enabled: process.env.CHART_LAB_ENABLE === '1', values, integrity };
}
