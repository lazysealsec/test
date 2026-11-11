import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { localSeries, checkSeriesFeed, checkWorkbench } from './controllers/chart-controller.mjs';

if (process.argv.includes('--check-data')) {
  console.log(JSON.stringify(await checkSeriesFeed()));
} else if (process.argv.includes('--check')) {
  console.log(JSON.stringify(await checkWorkbench()));
} else {
  await checkWorkbench();
  const html = readFileSync(new URL('../web/index.html', import.meta.url));
  createServer((request, response) => {
    if (request.url === '/api/series') {
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(localSeries()));
    } else if (request.url === '/') {
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(html);
    } else { response.writeHead(404); response.end(); }
  }).listen(18766, '127.0.0.1', () => console.log('Chart Workbench: http://127.0.0.1:18766'));
}
