import { readFileSync } from 'node:fs';
import { environment } from '../config/environment.mjs';
import { getProfile } from '../lib/profile-client.mjs';
import { errorTimeHandler } from '../utils/error-time-handler.mjs';

export function localSeries() {
  return JSON.parse(readFileSync(new URL('../../assets/data/series.json', import.meta.url), 'utf8'));
}

export async function checkSeriesFeed() {
  if (!environment().enabled) return { state: 'disabled' };
  const response = await getProfile('series');
  if (!Array.isArray(response.data.candles)) throw new Error('Invalid candle data');
  return { state: 'parsed-data', candles: response.data.candles.length,
    source: response.source, request: response.request };
}

export async function checkWorkbench() {
  const series = localSeries();
  if (!environment().enabled) return { symbol: series.symbol, state: 'disabled' };
  try {
    return JSON.parse(readFileSync(new URL('../../config/renderer.local.json', import.meta.url), 'utf8'));
  } catch (error) {
    return { symbol: series.symbol, renderer: await errorTimeHandler(error) };
  }
}
