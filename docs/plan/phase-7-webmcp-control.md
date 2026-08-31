# Phase 7 — WebMCP availability control

Status: **ACCEPTED AND INTEGRATED — remaining corrected-revision manual Chrome checks WAIVED, not passed**. Scoped implementation commit: `4fa0f629c332fbd54af1d67981a18e2617e97bd2`. The coordinator independently verified the corrected revision and preserved the explicit user-directed manual-check exception. Phase 8 may proceed from the integrated baseline.

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

- [x] **P7.1 — Establish runtime contract and failing first behavior.** Inspect current registration, server submission, root rendering, draft persistence, and isolated test servers. Record the chosen settings path, notification/reload behavior, and first observed failing test at an approved public boundary.
- [x] **P7.2 — Deliver the persistent management control.** Use vertical red → green slices for default-enabled state, a saved off/on choice, reload/restart persistence, accessible feedback, and a meaningful save/read failure recovery flow. Confirm failures do not report a setting as saved or silently enable an unavailable configuration.
- [x] **P7.3 — Remove the running integration when disabled.** Gate the whole feature before importing it, unregister on transition, refresh safely, synchronize active tabs and resumed pages, and guard stale WebMCP execution on the server. Preserve native APIs, ordinary survey submission, drafts, and the existing tool contract on re-enable.
- [x] **P7.4 — Validate meaningful regressions and isolation.** Cover enabled → disabled → enabled, fresh disabled startup, no disabled integration/polyfill network loading, no tool discovery/execution while off, stale-client rejection without a saved response, manual success while off, retained draft in another tab, process-restart persistence, and no duplicate registration after navigation/re-enable. Use the real pinned polyfill for supported-lane evidence and real isolated files/servers. Add a failing regression before fixing every discovered defect.
- [x] **P7.5 — Operate and inspect the production app in Chrome — remaining checks WAIVED, not passed.** Verify the toggle by keyboard and pointer, off-state manual completion, fresh and already-open page behavior, contributor-client discovery showing absence while off and the restored single tool while on, and restored one-shot submission. Inspect narrow layout and failure feedback. Use new isolated fictional data and new loopback ports; preserve all earlier previews/data and respect action-time approval gates. **Disposition (2026-08-31):** the user requested continuation and the coordinator recorded a one-time waiver of the remaining corrected-revision manual Chrome checks. Off-state manual completion and the corrected re-enable/one-shot live flow were not independently completed; no live IDs or passing result are claimed. Earlier observed screenshots remain historical evidence. The waiver authorizes no browser launch, submission, deletion, or other pending UI action.
- [x] **P7.6 — Refresh operating/comparison documentation and evidence.** Explain how to run a genuinely WebMCP-disabled baseline, re-enable for comparison, persisted setting/reset location, restart requirements (or their absence), native-versus-polyfill limits, and actual cross-tab timing. Record red/green tests, Chrome URLs/actions/outcomes, screenshots, data isolation, and any remaining limitation.
- [x] **P7.7 — Pass release checks and commit the phase.** Run formatting, types, all unit/integration tests, all-source coverage above 85% in every metric (existing 86% gate), production build and desktop/mobile browser regression suite, and the real server-function check. Verify a fresh install and source-ancestor coverage scope remain sound. Commit only Phase 7 changes after validation and return the commit hash/worktree/evidence for independent coordinator acceptance. **Disposition (2026-08-31):** corrected-revision release checks and final formatting/hash consistency checks pass; the remaining manual Chrome gate is explicitly waived under P7.5. The scoped implementation commit is identified in the final task handoff, with coordinator integration separate.

## Acceptance gate

Do not mark complete merely because the toggle is visible or the tool disappears from one tab. Acceptance requires supported-lane evidence of both no integration loading on disabled fresh documents and rejection of stale tool calls, while the complete manual flow remains usable. No previous completed phase is reopened or rewritten; any resulting fix belongs in this phase with its regression test.

Append the standard handoff from [Execution rules](./EXECUTION.md) when checks pass. The coordinator reviews the scoped commit and independently validates it before integration.

## Implementation contract and red/green record

- Checkout started at accepted baseline `cfece566384096e5438efad19cffd6fc934483bd`; branch `codex/phase-7-webmcp-control`. No existing history, dependency pins, or coverage configuration changed.
- Settings path: `<resolved SURVEY_DATA_FILE>.webmcp.json`, enabled only by an absent file or valid `enabled: true` value. Atomic sibling rename with per-path in-process write ordering. Malformed/read failures remain unconfirmed and prevent integration loading. JSONL is never configuration storage.
- Root checks the server after hydration before React lazy-imports the assistant. Other tabs and the proxied client origin poll every 2 seconds and recheck focus/pageshow/visibility. The server guards assistant entry independently of browser registration. Off unregisters with the existing AbortSignal and requests safe document refresh; no native API deletion/overwrite. Ordinary submission still shares the application submit operation.
- Refresh is deferred for an unpersistable draft, pending/uncertain manual write, displayed manual confirmation, or unconfirmed configuration. Drafts/results stay visible; no automatic write retry. After resolving the survey, navigation/start-another permits refresh. Deferred documents may retain the now-toolless polyfill until safe refresh. Suspended/disconnected browsers have no fixed delivery bound; responsive active pages normally require one poll interval plus request/render time.
- First red: the management control test could not resolve the new public availability operation; the first green retained off through management reopen. Save-failure red then showed the switch incorrectly remained actionable after an uncertain write; green requires **Check setting** before another change.
- Guard red: the application had no guarded assistant operation. Green rejects disabled input without a response while manual succeeds; on delegates through the same validation/persistence operation.
- Import-gate red: a disabled management page still contained **Assistant submission available.** Green omits the integration and unregisters on off.
- Production regression red: contributor discovery on a refreshed disabled iframe threw and retained stale metadata. Green reports `[]`, disables invocation, and resets discovery on iframe load.
- Production regression red: off refreshed away a draft when session storage was blocked. Green unregisters and defers refresh while retaining the text. Pending/uncertain writes and displayed IDs also stay visible.
- Production regression red: a failed save triggered refresh and erased its error. Green leaves the error visible through subsequent poll intervals until an explicit check confirms state.
- Resumed review on 2026-08-31 reproduced polling starvation: repeated 2.5-second replies were all invalidated by the 2-second polling interval. A failing management UI test preceded the fix. Availability reads now coalesce while one is pending, and save/unmount invalidation still rejects obsolete replies. The regression passes, and a production test now exercises the same slow transport in both viewport projects. The shared 3120/3121 preview was not changed.
- One expanded test initially read asynchronous contributor discovery before it completed; the assertion now waits for the visible discovered-tool result before parsing it. No product change was needed for this test timing issue.

## Corrected revision and independent verification

The 2026-08-31 slow-polling correction now passes **66 unit/integration tests**, **48 production desktop/mobile cases**, **96 repeated cases** from an immutable snapshot, and **2 real RPC cases**. Formatting/types/build/frozen-install checks pass. Coverage is **94.59 / 92.01 / 91.02 / 95.75%** across exactly **24 application files**, with unchanged thresholds/exclusions and the same results under a `src` ancestor. [Current evidence, red/green logs, hashes, and the honestly recorded interrupted repeat](../evidence/phase-7/review-2026-08-31/README.md) identify this revision separately from the original run.

Corrected source snapshot: `/tmp/ai-webmcp-p7-corrected-7hw_9pcy/src/checkout`. All 60 recorded source/test/script/package hashes match the worktree. The shared 3120/3121 pre-correction snapshot and all its records remain untouched during this review. No Phase 8 changes are included. The coordinator independently rechecked all 60 hashes and passed frozen install, formatting/types, 66 tests, exact 24-file coverage scope, build, 48 production cases, and 2 real RPC cases in `/private/tmp/ai-dev-days-phase7-fixed-accept-0DzgSJ`. Hashes matched again after its final build. A copied evidence JSON required whitespace-only normalization in that disposable snapshot; the final worktree was already formatted. The remaining manual gate is **WAIVED**, not passed, under the user-directed exception in [Execution rules](./EXECUTION.md#phase-7-acceptance-exception--2026-08-31).

## Original release evidence and pending handoff (historical)

These totals describe the pre-review build. See [corrected-revision evidence](../evidence/phase-7/review-2026-08-31/README.md) for the slow-polling fix and refreshed checks. Neither the previous checks nor unverified user reports prove the unperformed corrected-revision manual Chrome checks. The historical hold below is superseded only by the explicit user-directed waiver, not by a new browser result.

- `pnpm format:check`, `pnpm typecheck`, `pnpm test`: pass; **65 tests in 13 files**.
- `pnpm test:coverage`: **94.31 / 91.88 / 91.02 / 95.71%** statements/branches/functions/lines. Existing 86% thresholds, include/exclude rules, and exact source-file assertion unchanged; **24 application files** accounted for.
- `PLAYWRIGHT_BROWSERS_PATH=/tmp/ai-webmcp-p7-browsers pnpm test:e2e`: production build and **46 desktop/mobile cases pass**. A second run using `pnpm exec playwright test --reporter=list,json --repeat-each=2` (same browser cache; JSON output `/tmp/p7-e2e-report.json`) passes **92 cases**, no failures/skips/flakiness.
- `PLAYWRIGHT_BROWSERS_PATH=/tmp/ai-webmcp-p7-browsers pnpm test:server-functions`: **2 real RPC cases pass**.
- Fresh source-only copy `/tmp/ai-webmcp-p7-fresh-1phe7mxq/src/checkout`: frozen install, types, coverage, exact 24-file source-ancestor assertion, and production build pass with identical coverage. An incorrect test-only wait introduced during readiness cleanup failed the first fresh run; it was corrected and both fresh/worktree suites rerun successfully.
- `pnpm build`, `git diff --check`: pass. Pinned dependencies and lockfile unchanged. Node 22.22.0, pnpm 10.33.0, Playwright 1.62.1 / test Chromium 151.0.7922.34.
- [Evidence and exact logs](../evidence/phase-7/README.md) distinguish automated results from live Chrome. Repeated measured off propagation: **1026–2040ms** until both the app tab and separate client iframe were observed without a model context, including polling, requests, reload, and assertion sampling.
- Live Chrome on isolated app **3120** / contributor client **3121** verified default state, keyboard off, refreshed draft retention, absent assistant UI, client discovery `[]`, disabled invoke, restart-retained off, actual read failure/recovery, and 320px no-overflow/error layout. Public build output exactly matches the tested worktree build. Previous preview ports/data remain untouched.

```text
Commit: NOT CREATED — required live gate remains incomplete; no merge or coordinator acceptance claimed.
Worktree: /Users/john/.codex/worktrees/8e6f/ai-webmcp (codex/phase-7-webmcp-control)
Tests and results: formatting/types, 65 unit/integration tests, 46 production cases plus 92 repeated cases, 2 real RPC cases; all pass.
Coverage (statements / branches / functions / lines): 94.31 / 91.88 / 91.02 / 95.71%; exact 24-file scope also passes under a src ancestor.
Production build/start: own snapshot /tmp/ai-webmcp-p7-live-0okyo48b/.output; app http://127.0.0.1:3120; client http://127.0.0.1:3121/__verification__/webmcp.
Live Chrome validation: off/discovery/draft/restart/failure/responsive checks pass; final manual Submit survey is prepared and awaiting action-time confirmation. On/one-shot live completion remains after that action.
Regressions added: whole-integration gate; stale server calls/results; stale client discovery; unpersistable drafts; pending/uncertain manual writes; error feedback erased by refresh; lifecycle, restart, resumed/native API and network-loading invariants.
Known limitations or blockers: Chrome skill requires fresh approval for the live saved-record side effect; earlier approvals are consumed. No alternate browser/tool bypass. Native/external bridge execution unverified. Poll delivery can be delayed in suspended/offline/throttled pages; safe refresh may defer while preserving drafts/results.
```

## Final disposition and handoff

On 2026-08-31 the user asked, “I don't see anything to approve. Can we just move on?” The coordinator recorded this as a **one-time waiver of the remaining Phase 7 manual Chrome acceptance checks**, not authorization for any pending browser action. No browser launch/retry, submission, deletion, toggle, preview replacement, or other UI action was performed to finalize this phase. No existing records were altered. The older manual-success report remains unverified for the target origin and is not treated as proof. No Phase 8 implementation or main-branch planning changes are included.

```text
Commit: phase-scoped implementation commit reported in the final task handoff; no merge into main by this task.
Worktree: /Users/john/.codex/worktrees/8e6f/ai-webmcp (codex/phase-7-webmcp-control)
Tests and results: formatting/types, 66 unit/integration tests, 48 production desktop/mobile cases, 96 immutable repeated cases, 2 real server-function cases; all pass. Coordinator independently passed 66/48/2 plus frozen install, final build, and all 60 source/test/script/package hashes.
Coverage (statements / branches / functions / lines): 94.59 / 92.01 / 91.02 / 95.75%; exact 24-file scope, including a src-ancestor checkout; 86% gates/exclusions unchanged.
Production build/start: corrected build passes in /tmp/ai-webmcp-p7-corrected-7hw_9pcy/src/checkout and coordinator snapshot /private/tmp/ai-dev-days-phase7-fixed-accept-0DzgSJ. Original live snapshot on 3120/3121 remains unchanged and predates the polling correction.
Live Chrome validation: earlier observed off/discovery/draft/restart/failure/responsive evidence retained. Remaining corrected-revision manual Chrome acceptance checks WAIVED by user-directed continuation; not passed, no new live IDs claimed.
Regressions added: persistent toggle/error recovery, whole-integration gate, stale server calls/results, client lifecycle, draft/pending/uncertain-write preservation, restart/resume/native API/network-loading invariants, and slow-polling starvation.
Known limitations: remaining manual Chrome checks unperformed under the narrow waiver; native/external bridge execution unverified; suspended/offline/throttled clients may delay propagation and draft/result preservation may defer refresh. Local-only, unauthenticated, single-process scope remains unchanged.
```
