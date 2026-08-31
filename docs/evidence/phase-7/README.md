# Phase 7 evidence — WebMCP availability

Status: the resumed review found and fixed a slow-polling defect. Corrected-revision evidence is in [review-2026-08-31](./review-2026-08-31/README.md). The coordinator independently verified the corrected revision and recorded the user-directed one-time waiver of its remaining manual Chrome checks. Those checks are **WAIVED, not passed**; no pending browser action was authorized or attempted. The scoped phase commit is prepared for coordinator review/integration.

The sections below retain the **original pre-review run**. They do not prove the corrected revision or any later user submission. The user's report that manual submission worked is not recorded as verified live evidence because an older app tab was also open. The missing manual results remain a documented validation limitation; continuation uses the explicit waiver, not inferred live success.

## Isolated environments

- Worktree: `/Users/john/.codex/worktrees/8e6f/ai-webmcp`, branch `codex/phase-7-webmcp-control`, accepted base `cfece566384096e5438efad19cffd6fc934483bd`.
- Live build snapshot: `/tmp/ai-webmcp-p7-live-0okyo48b/.output`. Its public output was byte-identical to the original tested worktree build. It predates the slow-polling correction and is deliberately left unchanged for the coordinator.
- App: <http://127.0.0.1:3120/>; management: <http://127.0.0.1:3120/survey>; client: <http://127.0.0.1:3121/__verification__/webmcp>.
- Live response file: `/tmp/ai-webmcp-p7-live-0okyo48b/data/surveys.jsonl`. At the original capture, this task had made no live submission and observed the separate settings file (same path plus `.webmcp.json`) as `{"enabled":false}`. Later contents/state are coordinator-owned and are not inferred here. All existing records must be preserved.
- Fresh installation and source-ancestor verification: `/tmp/ai-webmcp-p7-fresh-1phe7mxq/src/checkout`, initially without dependencies/build/data. Frozen install succeeds. A mistyped malformed-settings test wait failed the first fresh run; correcting that test-only wait restores all 65 tests and the exact 24-file scope. Both fresh and worktree runs now have identical coverage totals.
- Automated browsers: Node `v22.22.0`, pnpm `10.33.0`, pinned Playwright `1.62.1`, Chromium `151.0.7922.34` in `/tmp/ai-webmcp-p7-browsers`; each test owns an ephemeral loopback port, Node process, and OS-temp fictional-data directory. The contributor fixture proxies only its own test app.
- Existing previews/data on 3105/3106/3108/3110/3111/3114/3115 were not stopped, rebuilt, or modified. Main and old worktree `.output` directories were untouched.

## Original automated release checks

Commands ran in the Phase 7 worktree unless otherwise noted. Logs are in [`logs/`](./logs/).

| Command                                                                                            | Result                                                                                                     |
| -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`                                                                   | Pinned dependency install; manifest and lockfile unchanged                                                 |
| `pnpm format:check`                                                                                | Pass                                                                                                       |
| `pnpm typecheck`                                                                                   | Pass                                                                                                       |
| `pnpm test`                                                                                        | 65 tests pass in 13 files                                                                                  |
| `pnpm test:coverage`                                                                               | 94.31% statements / 91.88% branches / 91.02% functions / 95.71% lines; unchanged 86% thresholds            |
| Coverage scope assertion                                                                           | Exactly 24 application files, no unexpected or missing entries; generated/declaration exclusions unchanged |
| `PLAYWRIGHT_BROWSERS_PATH=/tmp/ai-webmcp-p7-browsers pnpm test:e2e`                                | Production build plus 46 desktop/mobile cases pass                                                         |
| `PLAYWRIGHT_BROWSERS_PATH=/tmp/ai-webmcp-p7-browsers pnpm test:server-functions`                   | Both real RPC cases pass                                                                                   |
| Fresh copy: `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm test:coverage`, `pnpm build` | Pass under a `src` ancestor; same all-source coverage totals and scope                                     |
| `git diff --check`                                                                                 | Pass                                                                                                       |

The 16 new production cases cover actual off/on loading, separate-origin client updates, draft persistence, restart with a retained response, blocked storage, frozen/resumed pages, native API preservation, save error recovery, pending/uncertain writes with no retry, and replay of a stale production RPC without an extra response. Native API preservation uses an immutable synthetic API fixture; it is not a claim of native execution. The real pinned polyfill is used for discovery and execution tests.

The four repeated off-propagation observations were **2014ms, 2040ms, 1026ms, and 2032ms** from toggle initiation until both existing app and client documents were observed without a model context. This includes request/reload time and assertion sampling; it is an observation, not a delivery guarantee. `propagation.json` and `automated/availability-lifecycle-*.json` retain each run's integration/polyfill asset names and all requests from its fresh disabled document. Neither enabled-only asset was requested while off. `automated-results.json` records every repeated case. `automated/availability-on-*.png` shows the completed automated re-enable flow and its two response rows.

## Red/green regressions

The plan records the vertical slices and approved public boundaries. Retained logs show the first failed public operation/control, the disabled page wrongly mounting the integration, the still-actionable uncertain save, stale contributor discovery after iframe refresh, lost storage-blocked drafts, and erased save-error feedback. Later green/full-suite logs supersede intermediate runs. `green-draft.log` also includes an asynchronous test-result read that was too early; waiting for the actual discovered-tool text fixed that test timing issue without a product change.

## Live Chrome observations so far

Chrome plugin used with new tabs only, on the isolated production snapshot. No external/native agent bridge was installed or substituted. The contributor client disclosed the single six-answer tool while enabled, then reported `[]` and disabled invocation after off.

1. Management initially showed **WebMCP enabled.**, a checked switch, and zero responses.
2. An attendee tab selected the talk, rating 9, and typed fictional feedback; a separate contributor-origin tab discovered exactly one tool.
3. Pressing Space on the management switch saved off and refreshed it. The attendee tab refreshed with all entered values intact; its assistant footer disappeared. Contributor discovery became empty, with submission disabled.
4. Fresh management and attendee documents showed the disabled ordinary flow. Automated request evidence separately proves the absence of both the actual integration and polyfill asset requests.
5. Stopping only the Phase 7 app made management show an unconfirmed state, disabled switch, readable error, and **Check setting**. Restarting that same app retained off and recovered the UI. The response file remains untouched.
6. At a verified 320px viewport, document scroll width was exactly 320px. The switch, description, filters, and real read-failure feedback wrapped without horizontal clipping. The temporary viewport override was reset afterward.
7. The preserved manual draft is filled through Step 2 with fictional data and stopped at **Submit survey**. At the original stop, the Chrome skill required fresh action-time authority for this saved-record side effect. No final submission click, alternate-tool submission to this live data store, or claim of live manual success was made. The remaining corrected-revision manual completion/re-enable/one-shot checks were later waived by user-directed continuation; they were not performed or claimed as passed. Automated equivalents pass.

Screenshots:

- `chrome-disabled-management.png`: confirmed off at desktop width.
- `chrome-disabled-draft.png`: retained talk/rating/reason after cross-tab refresh.
- `chrome-disabled-client.png`: empty contributor discovery and disabled invoke button.
- `chrome-disabled-320.png`: confirmed off with actual viewport/scroll width 320.
- `chrome-read-failure.png`, `chrome-read-failure-320.png`: real server-unavailable feedback, desktop and narrow.
- `chrome-manual-awaiting-approval.png`: filled off-state manual form at its final action.
- `chrome-restart-state.json`: visible restored off state and measured narrow layout.

## Runtime limits

The switch takes effect without a server restart. Other documents poll every 2 seconds plus request/render/reload time and recheck focus, pageshow, and visibility. Suspended/offline/throttled clients cannot be promised a fixed delivery bound. Server-side rejection applies to new assistant calls after off is saved, including stale clients; an already-admitted write may complete. There is no automatic submission retry.

A refresh waits if browser storage cannot retain a draft, a manual write is pending/uncertain, its saved ID is displayed, or configuration state is unconfirmed. During this deferral the existing polyfill object may remain, with its application tool unregistered; a safe refresh removes it. Native browser APIs are never deleted/overwritten. The feature remains local-only, unauthenticated, and single-process; the manual endpoint is intentionally still callable. Native/external bridge execution remains unverified.
