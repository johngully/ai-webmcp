# AI Dev Days survey demo

A local, single-process TanStack Start app comparing a two-step browser survey
with a WebMCP submission. **Phase 0 is the foundation preview.** Submission,
response management, JSONL persistence, and WebMCP are not implemented yet.

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
```

`pnpm format` formats the repository. Type checking and Vitest generate the
route tree first, so they also work before the initial development build.
`test:e2e` builds and starts a separate production server on port 4173 and
checks desktop and 375px navigation, focus, hydration, and HTML without JavaScript.
It does not connect to your personal Chrome profile. Live Chrome plugin checks
are additionally recorded in the phase document.

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
Node process working directory. Phase 1 will import this server-only configuration
in the repository adapter; Phase 0 never creates or writes a survey file.

```sh
SURVEY_DATA_FILE=/tmp/isolated-surveys.jsonl pnpm dev
SURVEY_DATA_FILE=/tmp/isolated-surveys.jsonl PORT=3100 pnpm start
```

`.env.example` documents the setting. Supply the environment variable in the shell
as above; the production start script does not automatically load `.env` files.
All `*.jsonl` and `*.jsonl.*` files are ignored, including atomic rewrite files;
`data/.gitkeep` retains the directory. Never force-add response data.

## Visual foundation

`src/styles.css` owns color, spacing, typography, focus, reading widths, panels,
feedback states, native forms, and semantic table styles. There is no CSS framework,
external font, TanStack Table, or table widget. Use text alongside feedback colors;
wrap future wide tables in `.table-scroll` and give the scroll region an accessible
name and keyboard access when implementing management.

## References

- [Delivery plan](docs/plan/README.md) and [Phase 0 evidence](docs/plan/phase-0-foundation.md).
- [Official TanStack CLI setup](https://tanstack.com/start/latest/docs/framework/react/getting-started).
- [Official TanStack Node/Nitro hosting](https://tanstack.com/start/latest/docs/framework/react/guide/hosting).
- [Vitest projects](https://vitest.dev/guide/projects) and [coverage](https://vitest.dev/guide/coverage.html).
