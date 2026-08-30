# Dependencies

This document is the source of truth for the packages, runtime assumptions, browser capabilities, and phase prerequisites used by the AI Dev Days survey demo.

## Runtime prerequisites

| Dependency             | Requirement                                                                   | Purpose                                                          |
| ---------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Node.js                | 22.12 or newer                                                                | TanStack Start server, filesystem persistence, and build tooling |
| pnpm                   | 10 or newer                                                                   | Package installation and lockfile                                |
| Chromium-based browser | Current stable or preview build                                               | Manual browser flow and WebMCP demonstration                     |
| WebMCP agent bridge    | Native `document.modelContext` support or a compatible extension/agent bridge | Tool discovery and invocation                                    |

The development machine currently satisfies the Node and pnpm requirements. The browser lane must be documented and smoke-tested in Phase 5 because native WebMCP remains an evolving browser capability.

## Application dependencies

| Package                  | Responsibility                                                                              | Introduced |
| ------------------------ | ------------------------------------------------------------------------------------------- | ---------- |
| `@tanstack/react-start`  | Full-stack React framework, SSR, and server functions                                       | Phase 0    |
| `@tanstack/react-router` | File routes, validated search parameters, navigation, and route invalidation                | Phase 0    |
| `@tanstack/react-form`   | Typed form state and validation for both survey steps                                       | Phase 2    |
| `react`                  | UI runtime                                                                                  | Phase 0    |
| `react-dom`              | Browser and server rendering                                                                | Phase 0    |
| `zod`                    | Shared survey, filter, server-function, and tool-input validation                           | Phase 1    |
| `nanoid`                 | Short random survey ID generation                                                           | Phase 1    |
| `@mcp-b/webmcp-polyfill` | Installs the current `document.modelContext` interface when the browser does not provide it | Phase 4    |

Use the latest mutually compatible releases selected by the TanStack scaffold, then commit `pnpm-lock.yaml`. Keep `@tanstack/react-start` and `@tanstack/react-router` on compatible releases. Dependency upgrades are deliberate changes verified by the full Phase 5 test suite.

## Development dependencies

| Package                       | Responsibility                                                                | Introduced |
| ----------------------------- | ----------------------------------------------------------------------------- | ---------- |
| `typescript`                  | Static type checking                                                          | Phase 0    |
| `vite`                        | Development and production build tool                                         | Phase 0    |
| `@vitejs/plugin-react`        | React compilation for Vite                                                    | Phase 0    |
| `nitro`                       | Local Node production server output used by TanStack Start                    | Phase 0    |
| `@types/node`                 | Node filesystem and runtime types                                             | Phase 0    |
| `@types/react`                | React types                                                                   | Phase 0    |
| `@types/react-dom`            | React DOM types                                                               | Phase 0    |
| `@tanstack/router-cli`        | Generate file-route types before tests and type checking                      | Phase 0    |
| `prettier`                    | Deterministic Markdown, TypeScript, JSON, and CSS formatting                  | Phase 0    |
| `vitest`                      | Unit and integration test runner                                              | Phase 0    |
| `@vitest/coverage-v8`         | Enforced coverage above 85% across implemented application code               | Phase 0    |
| `jsdom`                       | Browser-like environment for UI tests                                         | Phase 0    |
| `@testing-library/react`      | UI behavior tests                                                             | Phase 0    |
| `@testing-library/user-event` | Keyboard and pointer navigation tests; later form and management interactions | Phase 0    |
| `@testing-library/jest-dom`   | Accessible DOM assertions                                                     | Phase 0    |
| `@playwright/test`            | Foundation production smoke tests; later manual and WebMCP flows              | Phase 0    |
| `@mcp-b/webmcp-types`         | TypeScript declarations for the current `document.modelContext` interface     | Phase 4    |

The project intentionally does not depend on TanStack Table, TanStack Query, Tailwind CSS, a modal package, a mutex package, or a database client. Native tables, Router loaders and invalidation, plain CSS, `<dialog>`, a small in-process write queue, and Node filesystem functions are sufficient for this demo.

## Expected install groups

The TanStack CLI scaffolds framework-owned packages first. Phase 0 used the official `--blank --deployment nitro --no-toolchain --no-intent` scaffold, removed sample UI, and retained generated file routing. Nitro is a build-time dependency with standalone Node output. No Tailwind, devtools, Sentry override, or scaffold editor settings are retained. The root manifest pins every direct package; `pnpm-lock.yaml` pins the resolved graph.

Phase 0 installs only its inventory. `@testing-library/user-event` and `@playwright/test` were brought forward to validate the required keyboard navigation and supply a working production `test:e2e` script. `@tanstack/router-cli` generates route types before type checking and unit tests, including from a fresh checkout.

Install the application-specific packages only when their phase is released:

```sh
# Phase 1
pnpm add zod nanoid
# Phase 2
pnpm add @tanstack/react-form
# Phase 4
pnpm add @mcp-b/webmcp-polyfill
pnpm add -D @mcp-b/webmcp-types
```

Resolved Phase 0 framework versions and validation are recorded in [Phase 0](./phase-0-foundation.md). Keep later dependency changes deliberate and validated against current official documentation.

## Data and operating dependencies

| Dependency           | Contract                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------ |
| `data/surveys.jsonl` | One complete `SurveyResponse` JSON object per non-empty line; created lazily               |
| `SURVEY_DATA_FILE`   | Optional absolute or working-directory-relative override used by tests and local operation |
| Process model        | One Node server process owns the JSONL file                                                |
| Filesystem           | Temporary rewrite and target JSONL file remain on the same filesystem so rename is atomic  |
| Browser storage      | `sessionStorage` retains an unfinished manual survey in one browser tab                    |
| Browser origin       | WebMCP tool and TanStack server functions run on the same origin                           |

Production responses are excluded from version control. Tests use a unique temporary directory or the memory repository adapter.

## Phase prerequisites

| Phase              | Requires                     | Produces for later phases                               |
| ------------------ | ---------------------------- | ------------------------------------------------------- |
| 0 — Foundation     | Empty repository, Node, pnpm | Runnable TanStack app, scripts, test harness, layout    |
| 1 — Domain/storage | Phase 0                      | Schemas, IDs, repository adapters, server operations    |
| 2 — Manual survey  | Phase 1                      | Complete browser form and shared submit path            |
| 3 — Management     | Phase 1                      | Search, filters, details, single and bulk deletion      |
| 4 — WebMCP         | Phases 1 and 2               | One-shot WebMCP survey tool and registration status     |
| 5 — Verification   | Phases 2, 3, and 4           | End-to-end evidence, demo guide, clean production build |

## External references

- [TanStack Start getting started](https://tanstack.com/start/latest/docs/framework/react/getting-started)
- [TanStack Start routing](https://tanstack.com/start/latest/docs/framework/react/guide/routing)
- [TanStack Start server functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions)
- [TanStack Form validation](https://tanstack.com/form/latest/docs/framework/react/guides/validation)
- [WebMCP draft](https://webmachinelearning.github.io/webmcp/)
- [MCP-B WebMCP packages](https://github.com/WebMCP-org/npm-packages)

Recheck these references when implementing Phase 0 or Phase 4; both TanStack Start and WebMCP may change after this plan was written.
