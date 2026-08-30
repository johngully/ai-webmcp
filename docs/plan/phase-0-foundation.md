# Phase 0 — Foundation

## Outcome

A fresh checkout installs reproducibly and starts a styled, accessible TanStack Start shell for the AI Dev Days survey demo.

## Dependencies

- Runtime prerequisites in [Dependencies](./DEPENDENCIES.md).
- No earlier phase.

## Tasks

- [x] **P0.1 — Scaffold TanStack Start in the existing repository.** Use React, TypeScript, Vite, and pnpm. Keep the generated file-based router. Completion criterion: `/` renders through TanStack Start in development and no generated sample feature remains.
- [x] **P0.2 — Reconcile the package manifest with the dependency inventory.** Install the Phase 0 packages, remove unused scaffold add-ons, declare the supported Node and pnpm versions, and commit the lockfile. Completion criterion: every Phase 0 package in `DEPENDENCIES.md` is present for a documented reason and `pnpm install --frozen-lockfile` succeeds.
- [x] **P0.3 — Add project scripts.** Provide `dev`, `build`, `start`, `typecheck`, `format`, `format:check`, `test`, `test:coverage`, and `test:e2e` scripts. Completion criterion: every script resolves to an installed tool and the non-browser scripts can run from the repository root.
- [x] **P0.4 — Establish the test harness.** Configure Vitest browser and Node environments, Testing Library matchers, and behavior tests for the implemented shell. Configure the coverage gate in [Execution rules](./EXECUTION.md). Completion criterion: tests pass without watch mode and measured application coverage exceeds 85% in all four metrics.
- [x] **P0.5 — Build the application shell.** Add the AI Dev Days name, concise explanation of manual versus WebMCP operation, and navigation to “Take survey” and “Manage responses.” Completion criterion: keyboard and pointer users can reach both destinations from `/`.
- [x] **P0.6 — Establish the visual system.** Define plain-CSS tokens for color, spacing, typography, focus, panels, forms, tables, feedback states, and responsive widths. Completion criterion: the shell works at 375px and desktop widths, honors visible focus, and does not depend on an external CSS framework.
- [x] **P0.7 — Establish filesystem configuration.** Define the default data path, optional `SURVEY_DATA_FILE` override, ignored runtime JSONL files, and retained `data/` directory. Completion criterion: production data cannot be accidentally committed and tests can select an isolated file.
- [x] **P0.8 — Verify the foundation.** Run formatting, type checking, tests, and a production build. Completion criterion: every command exits successfully and the production server renders `/`.

## Phase completion evidence

Record the resolved Node, pnpm, TanStack Start, Router, React, Vite, and Nitro versions here when implementation begins:

```text
Node: 22.22.0 (supported: >=22.12.0)
pnpm: 10.33.0 (packageManager pinned; supported: >=10)
@tanstack/react-start: 1.168.49
@tanstack/react-router: 1.170.32
React: 19.2.8 (react and react-dom)
Vite: 8.2.2
Nitro: 3.0.260610-beta (official CLI selection; node-server preset)
```

### Implementation and source reconciliation

Implemented on 2026-08-30 from baseline `4dac74f` using the official TanStack CLI's
minimal React template with Nitro, no Tailwind, no examples, no toolchain add-on,
and no Intent/global settings changes. Consulted the current official
[getting-started](https://tanstack.com/start/latest/docs/framework/react/getting-started),
[hosting](https://tanstack.com/start/latest/docs/framework/react/guide/hosting),
[Nitro Node](https://nitro.build/deploy/runtimes/node),
[Vitest projects](https://vitest.dev/guide/projects), and
[coverage](https://vitest.dev/guide/coverage.html) documentation.

All direct versions are pinned and the resolved graph is locked. The dependency
inventory records why router-cli, user-event, and Playwright are included now.
No Phase 1+ application packages or behavior have been added.

Final route contract: `/` is the shell, `/survey/new?step=1` is the Phase 2
placeholder, and `/survey` is the Phase 3 placeholder. Both preview pages explicitly
say their functionality is unavailable. The shell never claims a survey was saved
or WebMCP was registered. Later phases replace the previews at these same URLs.

### Observable TDD slices

Seam: the user-visible document and navigation, exercised through the real
TanStack router. This is within the approved UI seam in `EXECUTION.md`.

1. `pnpm test --reporter=verbose`: introduction test failed with expected
   `AI Dev Days`, received `Welcome to TanStack Start`. Implemented the introduction;
   **1 passed**.
2. Navigation test failed because navigation named `Main` was absent. Implemented
   the shared shell and survey preview; **2 passed**, including return Home.
3. Keyboard test failed because `Skip to content` was absent. Implemented the
   skip link and management preview; **3 passed**.
4. Node SSR test failed on missing description metadata. Added the description;
   **4 passed** across the Node and jsdom projects.
5. Coordinator identified incorrect provisional route destinations. Added exact
   public URL assertions before the correction. Tests failed with expected
   `/survey/new?step=1`, received `/survey`, and expected `/survey`, received
   `/manage`. Moved the file routes and corrected links; **4 passed**. The
   production smoke suite also asserts the resulting URLs.

### Validation handoff

```text
Commit: recorded in the task's final handoff (avoids a self-referencing hash)
Branch: codex/phase-0-foundation
Worktree: /Users/john/.codex/worktrees/ae76/ai-webmcp
Tests and results:
  CI=true pnpm install --frozen-lockfile: passed; lockfile unchanged
  pnpm format: passed
  pnpm format:check: passed
  pnpm typecheck: passed
  pnpm test: 4 passed, 2 files (3 jsdom UI flows, 1 Node SSR flow)
  pnpm test:coverage: 4 passed; all thresholds passed
  PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ai-webmcp-playwright pnpm test:e2e:
    4 passed (desktop and mobile production flows, with and without JavaScript)
Coverage (statements / branches / functions / lines): 100% / 100% / 100% / 100%
  Statements: 12/12; branches: 0/0; functions: 7/7; lines: 12/12.
  The foundation has no conditional application behavior yet; no extra tests
  were written to chase hypothetical branches or inflate the small denominator.
Production build/start:
  pnpm build: passed, standalone .output/server/index.mjs emitted
  PORT=3100 pnpm start: listening on http://127.0.0.1:3100/
  Nitro node-server; one Node process bound to loopback
Live Chrome validation:
  Development: http://127.0.0.1:3000/
  Production: http://127.0.0.1:3100/
  Final production was rebuilt and restarted before the last Chrome checks.
Regressions added:
  Navigation destinations locked to /survey/new?step=1 and /survey.
Known limitations or blockers:
  No open blockers. Survey, storage, management, and WebMCP behavior remain
  intentionally unimplemented. Only Phase 0 is complete in this phase file.
```

**Actual coverage scope:** `include: ['src/**/*.{ts,tsx}']` includes unimported
application code. Explicit exclusions are only `src/routeTree.gen.ts` (generated)
and `src/**/*.d.ts` (declarations). All handwritten routes and `src/router.tsx`
are measured. Root configuration, tests, CSS, and generated build output are
outside the include glob. `survey.config.ts` is solely runtime path configuration;
its default and overrides were smoke-tested separately, not counted as survey
repository behavior. Future application operations must stay in measured `src`.

**Filesystem validation:** a Node subprocess smoke check imported
`survey.config.ts` under three isolated environments and asserted the absolute
default `data/surveys.jsonl`, a working-directory-relative override, and
`/private/tmp/phase-0-isolated.jsonl`. All passed without writing data.
`git check-ignore data/surveys.jsonl data/surveys.jsonl.tmp fixtures/private.jsonl`
confirmed all three are ignored; `git ls-files '*.jsonl'` returned no files.

**Live Chrome observations:** at 375×812, the complete header, copy, feedback
message, and footer fit without horizontal overflow (`scrollWidth = innerWidth =
375`). Keyboard traversal reached both destinations; Enter opened their final
URLs and their correct preview headings. The skip link was visibly on-screen at
top 16px, with a solid 3px focus ring; Enter focused `main#main-content`. At
1280×800, pointer navigation reached both final URLs, Home returned to the
introduction, and refreshing management rendered the correct SSR document.
Desktop `scrollWidth = innerWidth = 1280`. Mobile and desktop screenshots were
visually inspected in the task. Fresh development and production Chrome tabs
had no warning/error console entries. Viewport overrides were reset afterward.

**Environment findings:** sandboxed production launch initially exited without
listening, and Playwright reported `Process from config.webServer exited early`.
A minimal Node listener reproduced `EPERM`, isolating sandbox networking as the
cause. Running the same production test command with localhost/process permission
passed; no dependency or application workaround was added. The test suite retains
the real production-start check. Renaming route files briefly produced HMR errors
in an old development tab; fresh-page checks confirmed they did not persist.
The router CLI emits an upstream circular-dependency warning about
`replaceRouteChunk`, but generates routes successfully. Tooling also reports a
harmless inherited `NO_COLOR`/`FORCE_COLOR` conflict in the browser test process.
Neither warning affects application execution. No user/global settings were changed.
