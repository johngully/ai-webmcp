# AI Dev Days survey demo

A local, single-process TanStack Start app comparing a two-step browser survey
with a WebMCP submission. **Phase 1 adds the shared domain, JSONL persistence,
and validated server operations.** The visible survey and management routes remain
placeholders; their UI flows and WebMCP registration arrive in later phases.

## Run locally

Requires Node **22.12+** and pnpm **10+**. This repository pins pnpm 10.33.0 and
all direct dependencies; install from the committed lockfile.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open [the development app](http://127.0.0.1:3000). The file-based routes are:

- `/` — introduction and navigation.
- `/survey/new?step=1` — clearly labeled Phase 2 survey placeholder.
- `/survey` — clearly labeled Phase 3 management placeholder.

The preview always uses step 1. Phase 2 will add step validation and navigation.
There is no authentication; keep the app local. Both server scripts bind to
`127.0.0.1`, and Nitro uses the `node-server` preset, not a cluster or edge runtime.

```sh
pnpm build
PORT=3100 pnpm start
```

This starts the production artifact at [port 3100](http://127.0.0.1:3100).
Without `PORT`, production uses port 3000. Start it from the repository root.
Sandboxed environments must allow localhost listeners and browser processes.

## Checks

```sh
pnpm format:check
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm exec playwright install chromium
pnpm test:e2e
pnpm test:server-functions
```

`pnpm format` formats the repository. Type checking and Vitest generate the
route tree first, so they also work before the initial development build.
`test:e2e` builds and starts a separate production server on port 4173 and
checks desktop and 375px navigation, focus, hydration, and HTML without JavaScript.
It does not connect to your personal Chrome profile. Live Chrome plugin checks
are additionally recorded in the phase document.

`test:server-functions` starts an isolated development server on port 4174 and
calls the real TanStack submit/find/delete functions from a browser. It checks
validation and persistence through the public operation seam, without mocking
TanStack or filesystem code. Its disposable data lives under `test-results/`.
Run the two Playwright commands sequentially because both use that output tree.

Vitest has a `ui` project using jsdom/Testing Library and a `node` project for
server-side checks. Tests exercise the real router and visible document. The
only platform stub is jsdom's missing `scrollTo`; browser tests check real scrolling
and focus. Add Node tests as `tests/**/*.test.ts` and UI tests as
`tests/**/*.test.tsx`. See [the approved seams and TDD rules](docs/plan/EXECUTION.md).

Coverage includes **all** `src/**/*.{ts,tsx}`, even unimported application files,
with **86% minimums** for statements, branches, functions, and lines. The only
source exclusions are the generated `src/routeTree.gen.ts` and declarations.
Configuration, tests, CSS, and generated output are outside that source glob.
`survey.config.ts` is server runtime configuration, not a repository adapter;
its default/override smoke checks are recorded separately. Do not put application
operations outside `src` to bypass coverage.

## Filesystem contract

`survey.config.ts` exports `surveyDataFile`: the absolute path resolved from
`SURVEY_DATA_FILE`, or `data/surveys.jsonl` by default. Relative paths use the
Node process working directory. The server service resolves this configuration;
the JSONL adapter creates the directory and file lazily on the first valid
submission. Reading a missing file returns no responses.

```sh
SURVEY_DATA_FILE=/tmp/isolated-surveys.jsonl pnpm dev
SURVEY_DATA_FILE=/tmp/isolated-surveys.jsonl PORT=3100 pnpm start
```

`.env.example` documents the setting. Supply the environment variable in the shell
as above; the production start script does not automatically load `.env` files.
All `*.jsonl` and `*.jsonl.*` files are ignored, including atomic rewrite files;
`data/.gitkeep` retains the directory. Never force-add response data.

The repository exposes `create`, `find`, and `deleteMany`, with interchangeable
memory and JSONL adapters. JSONL access is serialized per resolved path within
one Node process. Deletion rewrites a temporary sibling file and atomically
renames it. Use one owning process and one canonical path; multiple processes,
external writers, and symlink aliases are outside this local demo's contract.
Malformed records fail closed with their physical line number; they are never
silently discarded by a write. Fix or restore the data before retrying.

Client code imports `submitSurvey`, `findSurveys`, and `deleteSurveys` from
`src/survey/survey.functions.ts` and passes input as `{ data: input }`.
`findSurveys()` also accepts no filters. These functions return `{ surveyId }`,
`SurveyResponse[]`, and `{ deletedCount }`. The framework compiles them into
client RPC stubs when imported by a UI or tool consumer; server implementations
stay in `.server.ts` modules. No UI consumer is introduced before Phase 2.

## Visual foundation

`src/styles.css` owns color, spacing, typography, focus, reading widths, panels,
feedback states, native forms, and semantic table styles. There is no CSS framework,
external font, TanStack Table, or table widget. Use text alongside feedback colors;
wrap future wide tables in `.table-scroll` and give the scroll region an accessible
name and keyboard access when implementing management.

## References

- [Delivery plan](docs/plan/README.md) and [Phase 0 evidence](docs/plan/phase-0-foundation.md).
- [Phase 1 domain/storage evidence](docs/plan/phase-1-domain-storage.md).
- [TanStack server functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions), [Zod schemas](https://zod.dev/api), and [Nano ID custom alphabets](https://github.com/ai/nanoid#custom-alphabet-or-size).
- [Official TanStack CLI setup](https://tanstack.com/start/latest/docs/framework/react/getting-started).
- [Official TanStack Node/Nitro hosting](https://tanstack.com/start/latest/docs/framework/react/guide/hosting).
- [Vitest projects](https://vitest.dev/guide/projects) and [coverage](https://vitest.dev/guide/coverage.html).
