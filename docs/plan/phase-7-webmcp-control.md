# Phase 7 — WebMCP availability control

Status: **READY FOR IMPLEMENTATION**. Phase 6 is validated and integrated. The user requested this additional phase and authorized starting once questions were resolved; no unresolved product decision remains.

## Outcome and decisions

Add an accessible **WebMCP** toggle to `/survey`, allowing an organizer to choose between the ordinary browser flow and assistant submission. This is a real runtime feature switch, not a visibility preference or an instruction for an agent to ignore available tools.

- The setting is app-wide and server-owned, enabled by default for existing installations. Persist it separately from survey JSONL records, isolated alongside the configured survey data file. It survives page reloads and server restarts.
- When disabled, fresh documents must not import, initialize, preload, or register the application's WebMCP integration or polyfill. Ordinary routes must still render and work. No application survey tool is discoverable or executable.
- Turning off an already-enabled app unregisters its tool and refreshes affected documents so app-installed polyfill state does not linger. Preserve unfinished survey drafts. Propagate changes to other open tabs, including the separate verification-client lane, and recheck suspended pages when resumed. Document the actual propagation behavior and bound; do not promise instantaneous delivery to suspended or disconnected browsers.
- The server must reject new WebMCP submissions while disabled, including stale clients, without disabling manual submission. Keep one shared validation/persistence operation; a guarded WebMCP entry point may delegate to it. A request already accepted before disabling may complete; never automatically retry an uncertain write.
- Enabling restores the existing single tool and six-answer contract without duplicate registrations. Prefer runtime configuration plus safe page refresh over a process restart. If a restart is unavoidable, implement and document the complete operating flow rather than displaying a switch that has not taken effect.
- Browser-native APIs belong to the browser: do not delete or overwrite native `document.modelContext`. In such a browser, disabled means no AI Dev Days WebMCP code/tool, not removal of the browser's own API. In the supported polyfill lane, a fresh disabled document should have no app-installed model context.
- Accessible enabled/disabled, saving, and failure feedback must describe actual confirmed server state. Preserve the established styling and ordinary product language. The disabled attendee experience remains a complete survey; keep technical controls on management.
- Keep the app local-only, unauthenticated, and single-process. This toggle is not authentication or a security boundary against callers of the ordinary submission endpoint. No new package is expected.

## Dependencies and test boundaries

Requires accepted Phases 1 (server operations and persistence), 2 (draft-preserving manual flow), 3 (management), 4 (WebMCP), 5 (styling), and 6 (release harness and comparison guide).

Use the already user-approved public boundaries in [Execution rules](./EXECUTION.md): management/survey interactions; WebMCP discovery, execution, and results; and existing application operations. Verify setting persistence through the management interface before/after reload and process restart. Do not introduce tests of private lifecycle state or mocks of internal modules. If a genuinely new test boundary needs agreement, ask before testing it.

Node filesystem primitives, current TanStack server functions/router, React, browser lifecycle/change notification facilities, and the existing dynamic import are sufficient. The settings file must follow the same per-test isolation as the response file, remain outside version control, and never rewrite/delete survey records. Preserve pinned packages, coverage thresholds, and the exact source-file coverage assertion.

## Tasks

- [ ] **P7.1 — Establish runtime contract and failing first behavior.** Inspect current registration, server submission, root rendering, draft persistence, and isolated test servers. Record the chosen settings path, notification/reload behavior, and first observed failing test at an approved public boundary.
- [ ] **P7.2 — Deliver the persistent management control.** Use vertical red → green slices for default-enabled state, a saved off/on choice, reload/restart persistence, accessible feedback, and a meaningful save/read failure recovery flow. Confirm failures do not report a setting as saved or silently enable an unavailable configuration.
- [ ] **P7.3 — Remove the running integration when disabled.** Gate the whole feature before importing it, unregister on transition, refresh safely, synchronize active tabs and resumed pages, and guard stale WebMCP execution on the server. Preserve native APIs, ordinary survey submission, drafts, and the existing tool contract on re-enable.
- [ ] **P7.4 — Validate meaningful regressions and isolation.** Cover enabled → disabled → enabled, fresh disabled startup, no disabled integration/polyfill network loading, no tool discovery/execution while off, stale-client rejection without a saved response, manual success while off, retained draft in another tab, process-restart persistence, and no duplicate registration after navigation/re-enable. Use the real pinned polyfill for supported-lane evidence and real isolated files/servers. Add a failing regression before fixing every discovered defect.
- [ ] **P7.5 — Operate and inspect the production app in Chrome.** Verify the toggle by keyboard and pointer, off-state manual completion, fresh and already-open page behavior, contributor-client discovery showing absence while off and the restored single tool while on, and restored one-shot submission. Inspect narrow layout and failure feedback. Use new isolated fictional data and new loopback ports; preserve all earlier previews/data and respect action-time approval gates.
- [ ] **P7.6 — Refresh operating/comparison documentation and evidence.** Explain how to run a genuinely WebMCP-disabled baseline, re-enable for comparison, persisted setting/reset location, restart requirements (or their absence), native-versus-polyfill limits, and actual cross-tab timing. Record red/green tests, Chrome URLs/actions/outcomes, screenshots, data isolation, and any remaining limitation.
- [ ] **P7.7 — Pass release checks and commit the phase.** Run formatting, types, all unit/integration tests, all-source coverage above 85% in every metric (existing 86% gate), production build and desktop/mobile browser regression suite, and the real server-function check. Verify a fresh install and source-ancestor coverage scope remain sound. Commit only Phase 7 changes after validation and return the commit hash/worktree/evidence for independent coordinator acceptance.

## Acceptance gate

Do not mark complete merely because the toggle is visible or the tool disappears from one tab. Acceptance requires supported-lane evidence of both no integration loading on disabled fresh documents and rejection of stale tool calls, while the complete manual flow remains usable. No previous completed phase is reopened or rewritten; any resulting fix belongs in this phase with its regression test.

Append the standard handoff from [Execution rules](./EXECUTION.md) when checks pass. The coordinator reviews the scoped commit and independently validates it before integration.
