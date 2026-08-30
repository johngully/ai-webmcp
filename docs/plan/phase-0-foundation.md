# Phase 0 — Foundation

## Outcome

A fresh checkout installs reproducibly and starts a styled, accessible TanStack Start shell for the AI Dev Days survey demo.

## Dependencies

- Runtime prerequisites in [Dependencies](./DEPENDENCIES.md).
- No earlier phase.

## Tasks

- [ ] **P0.1 — Scaffold TanStack Start in the existing repository.** Use React, TypeScript, Vite, and pnpm. Keep the generated file-based router. Completion criterion: `/` renders through TanStack Start in development and no generated sample feature remains.
- [ ] **P0.2 — Reconcile the package manifest with the dependency inventory.** Install the Phase 0 packages, remove unused scaffold add-ons, declare the supported Node and pnpm versions, and commit the lockfile. Completion criterion: every Phase 0 package in `DEPENDENCIES.md` is present for a documented reason and `pnpm install --frozen-lockfile` succeeds.
- [ ] **P0.3 — Add project scripts.** Provide `dev`, `build`, `start`, `typecheck`, `format`, `format:check`, `test`, `test:coverage`, and `test:e2e` scripts. Completion criterion: every script resolves to an installed tool and the non-browser scripts can run from the repository root.
- [ ] **P0.4 — Establish the test harness.** Configure Vitest browser and Node environments, Testing Library matchers, and behavior tests for the implemented shell. Configure the coverage gate in [Execution rules](./EXECUTION.md). Completion criterion: tests pass without watch mode and measured application coverage exceeds 85% in all four metrics.
- [ ] **P0.5 — Build the application shell.** Add the AI Dev Days name, concise explanation of manual versus WebMCP operation, and navigation to “Take survey” and “Manage responses.” Completion criterion: keyboard and pointer users can reach both destinations from `/`.
- [ ] **P0.6 — Establish the visual system.** Define plain-CSS tokens for color, spacing, typography, focus, panels, forms, tables, feedback states, and responsive widths. Completion criterion: the shell works at 375px and desktop widths, honors visible focus, and does not depend on an external CSS framework.
- [ ] **P0.7 — Establish filesystem configuration.** Define the default data path, optional `SURVEY_DATA_FILE` override, ignored runtime JSONL files, and retained `data/` directory. Completion criterion: production data cannot be accidentally committed and tests can select an isolated file.
- [ ] **P0.8 — Verify the foundation.** Run formatting, type checking, tests, and a production build. Completion criterion: every command exits successfully and the production server renders `/`.

## Phase completion evidence

Record the resolved Node, pnpm, TanStack Start, Router, React, Vite, and Nitro versions here when implementation begins:

```text
Node:
pnpm:
@tanstack/react-start:
@tanstack/react-router:
React:
Vite:
Nitro:
```
