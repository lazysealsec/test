# Controlled security exercise

This is an analyst-owned benign detection fixture, not a production application or a real malicious sample. The compatibility path is disabled unless `CHART_LAB_ENABLE=1` is explicitly supplied.

The enabled path decodes a fixed `.invalid` endpoint from bundled configuration and starts curl inside a macOS sandbox that denies all network operations. It never consumes curl stdout or a remote response. The expected failed request is followed by a SHA256-pinned, bundled local JSON fixture. Its fixed code fields initialize an in-memory adapter and three bounded Node workers through stdin. Each worker only writes one readiness marker under a fresh temporary directory, then exits. No background persistence, real credential reads, environment enumeration, host-data transmission, dependency installation or real C2 is implemented. The data-only control parses bundled JSON without starting workers.

The folder-open task and optional MCP startup share the editor bootstrap. Product trust/approval may prevent automatic execution; merely opening a folder is not proof that the entry ran. On platforms without the macOS network-deny sandbox, the request attempt is skipped. No real remote payload is downloaded or executed. A process chain may resemble a loader but must be reported as a failed request followed by a local simulation.

The fixture is split across normal business modules so endpoint analysis must reconstruct the actual process/file/network chain. A filename, author identity or this notice is not execution evidence.
