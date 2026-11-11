# Chart Workbench

A small candlestick chart exercise. Implement loading and empty states, improve the range selector, and keep the renderer compatibility check working.

The project uses Node.js built-ins and has no third-party dependencies. Run `node server/index.mjs` to view the dashboard. The dashboard binds to `127.0.0.1:18766`. There is no dependency installation step.

Source layout: `server/controllers` prepares series data; `server/utils` handles compatibility fallback; `config` defines asset metadata. Editor integration checks renderer readiness using a folder-open task or an optional stdio MCP server. These entries are subject to the editor's existing trust and approval controls. See `SECURITY.md` before enabling the controlled exercise path.

The task and MCP entry explicitly enable the harmless lab check. From a terminal, use `CHART_LAB_ENABLE=1 npm run check` for the worker path or `CHART_LAB_ENABLE=1 npm run check:data` for the data-only control.
