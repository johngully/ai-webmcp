# Phase 3 — Survey Management

## Outcome

The unauthenticated local management page can find, inspect, select, and remove AI Dev Days responses without exposing implementation details of JSONL storage.

## Dependencies

- Phases 0 and 1 complete.
- `findSurveys` and `deleteSurveys` operations available.
- Semantic HTML table and native `<dialog>` support; TanStack Table is not used.

## Tasks

- [x] **P3.1 — Define management search parameters.** Add `/survey` parameters for `name`, `talk`, `ratingMin`, and `ratingMax`, using the shared filter schema and canonical omission of empty values. Completion criterion: filters survive refresh, can be shared as a URL, and invalid rating bounds show a useful state rather than crashing the route.
- [x] **P3.2 — Load filtered summaries.** Call `findSurveys` from the route and render newest responses first. Completion criterion: combined name, talk, and inclusive rating-range filters match repository tests.
- [x] **P3.3 — Build the filter controls.** Provide name search, talk selection, minimum and maximum rating controls, Apply, and Clear. Completion criterion: keyboard submission updates the URL and Clear returns to the unfiltered list.
- [x] **P3.4 — Build the semantic table.** Include selection, ID, name, talk, rating, gift, submitted time, and details action columns. Completion criterion: headers describe every column, narrow screens remain usable, and empty/no-results states are distinct.
- [x] **P3.5 — Build survey details.** Open a modal showing every stored field, including the full rating reason and shipping address. Completion criterion: opening moves focus into the modal, Escape closes it, closing restores focus, and only the requested response is shown.
- [x] **P3.6 — Implement selection.** Support individual checkboxes, select all currently visible rows, clear selection when selected records disappear, and show the selected count. Completion criterion: filtering cannot cause hidden records to be accidentally included by “select all visible.”
- [x] **P3.7 — Implement single deletion.** Confirm the target ID and participant name, delete through the shared operation, invalidate the route, and report the outcome. Completion criterion: cancel changes nothing and confirm removes exactly the selected response from both UI and JSONL.
- [x] **P3.8 — Implement bulk deletion.** Confirm the exact selected count, submit normalized IDs once, clear successful selections, and retain a useful error state on failure. Completion criterion: only selected IDs are removed and the UI count matches `deletedCount`.
- [x] **P3.9 — Verify management behavior.** Add UI and browser tests for combined filters, detail focus behavior, selection, select-visible, cancellation, single deletion, and bulk deletion. Completion criterion: all mutations are reflected after route invalidation without a full browser reload.

## Privacy treatment

The summary table does not show the rating reason or shipping address. Those fields appear only after the user explicitly opens the details modal. Use ordinary organizer-facing language under the product-language requirement in [Execution rules](./EXECUTION.md). Document the unauthenticated, local-only deployment limit in operating documentation.

## Implementation and validation evidence — 2026-08-30

Commit: reported by the Phase 3 task after committing this document and the scoped implementation.

Worktree: `/Users/john/.codex/worktrees/046d/ai-webmcp`, branch `codex/phase-3-management`. Fast-forwarded from the queued baseline to the exact validated predecessor `0eb344847caf8e7ac74155f1ac9ac60115f2d468` before implementation. Overall acceptance and the phase index remain owned by the coordinator.

### Delivered behavior

- `/survey` loads the shared find operation, with URL-backed name, talk, and inclusive rating filters. The URL names `ratingMin` and `ratingMax` map to the existing schema's `minRating` and `maxRating`. Apply and Enter update the URL; Clear removes filters; empty shared parameters redirect to a canonical URL. Invalid bounds and malformed ratings render a recoverable error without loading unfiltered records.
- Native semantic table, newest first, with an independently scrollable region for narrow screens. Summary content excludes rating reasons and shipping addresses. Empty storage and no matching results have distinct messages.
- Native modal details show all eight stored fields, move focus inside, support Escape, and restore focus to the opening control. If deletion removes or disables that control, focus returns to the management heading.
- Individual and select-visible selection, partial-selection state, and a visible count. Records hidden by filtering are dropped from selection. Single and bulk confirmation identify exact participants/IDs and counts. Shared deletion is followed by awaited Router invalidation; its returned `deletedCount` drives the outcome message. Pending requests cannot be repeated or dismissed, and navigation is blocked until the request settles. Failed deletion preserves selection and permits retry.
- The router's typed management-operation context supplies the production server functions and lets UI tests exercise real memory repositories/application operations at the approved seam. Only delayed/rejected RPC behavior is simulated at the network boundary. Production browser tests exercise the actual JSONL-backed server functions.
- No new dependencies, TanStack Table, visual framework, or global settings. Visible app copy remains conference/organizer language. This app still has no authentication and must remain a local, single-process Node service; the operating warning remains in the contributor README.

### Observable red → green slices

Each slice ran `pnpm exec vitest run tests/survey-management.test.tsx` before and after implementation, retaining earlier behavior tests.

| Slice                  | Observed failure before implementation                          | Passing outcome                                                                                             |
| ---------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Summary loading        | No accessible “Survey responses” table                          | Real operation results rendered newest first without private summary fields                                 |
| Combined filters       | No “Name contains” control; then numeric URL values were quoted | Enter submits name/talk/inclusive rating-zero filters; fresh route load and Clear work                      |
| Invalid filters        | No filter alert                                                 | Invalid bounds can be corrected; no-results state is distinct                                               |
| Details                | No Details action                                               | All stored fields, modal focus, cancellation and close restoration                                          |
| Selection              | No participant selection checkbox                               | Individual, select-visible, partial selection, and hidden-record pruning                                    |
| Single deletion        | No Delete action                                                | Exact target confirmation, Cancel preserves all responses, successful invalidation removes one              |
| Bulk deletion/recovery | No “Delete selected (2)” action                                 | Exact subset/count, cancellation, deferred request protection, failed request retry, retained-record safety |

Regressions found and fixed:

1. **Detail focus restoration during implementation.** The details behavior test observed focus returning to the heading instead of its opener because React `autoFocus` ran before the modal effect captured the opener. Removed premature autofocus and let native `showModal()` focus the first control. The original failing test passed; production browser and live Chrome both verified Escape and opener restoration.
2. **Focus after bulk deletion.** Added a failing visible-focus assertion after bulk success: focus landed on the body because the opener was still connected but disabled. The dialog now falls back to the heading for removed or disabled openers. Unit, desktop/mobile browser, and live Chrome checks passed.
3. **Empty shared filter URLs.** Added a failing route/UI regression for `/survey?name=&talk=&ratingMin=&ratingMax=`. The URL remained unchanged and the empty talk produced a schema error because Router retained raw omitted keys. `beforeLoad` now compares a freshly normalized search object before redirecting. The test passed; added production desktop/mobile coverage and rechecked the exact URL in Chrome after rebuilding/restarting. Both now resolve to `/survey` without an alert.

Test-harness corrections (not product defects): jsdom needs minimal native dialog method shims; real browser tests verify native modality and focus. Chromium permits Tab to reach browser chrome, so the browser expectation checks native `:modal`, protects background controls, and verifies Shift+Tab/Escape. The nested Talk label's exact text includes option text in Playwright; its accessible combobox role/name is the reliable locator. A blocked Router navigation promise does not settle immediately, so the pending-deletion UI test uses the visible Home link to observe blocked navigation. No application workaround was added for these test assumptions.

### Final commands and results

- `pnpm install --frozen-lockfile` — passed, existing lockfile unchanged. Dependency installation required the normal sandbox network allowance.
- `git diff --check` — passed.
- `pnpm format:check` — passed.
- `pnpm typecheck` — passed, including generated route types.
- `pnpm test:coverage` — **45 tests passed across 10 files**, including all existing domain/storage/manual-flow regressions and 8 management UI tests.
- Coverage (statements / branches / functions / lines): **96.73% / 97.24% / 94.01% / 97.22%**. Counts: 296/306 statements, 141/145 branches, 110/117 functions, 280/288 lines. All-source coverage configuration and 86% thresholds are unchanged; no new exclusions.
- `pnpm build` — passed with Nitro `node-server` output. The final production browser run also rebuilt the final source successfully.
- `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ai-webmcp-playwright pnpm test:e2e` — **14 passed**, desktop 1280×800 and mobile 375×812, against production build/start on port 4173. Covers all previous manual-flow checks, management interactions/mutations, failure/retry, persistence, native focus, no page overflow, empty URL canonicalization, and malformed-rating recovery.
- `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ai-webmcp-playwright pnpm test:server-functions` — **1 passed** against the existing real server-function test on port 4174, after the final production suite. Browser suites ran sequentially so their `test-results` cleanup could not race.
- Production start: `PORT=3104 SURVEY_DATA_FILE=/private/tmp/ai-webmcp-phase3-chrome-0un139bj/surveys.jsonl pnpm start` — listening at `http://127.0.0.1:3104/`. Restarted after the final URL fix. Existing previews on other ports were not modified.

### Live Chrome evidence

Used the Chrome plugin with installed Google Chrome **152.0.7977.64** at `http://127.0.0.1:3104/survey`. Read the Chrome skill, browser API documentation, and local-web-development guidance before operating the browser. This was a real production build, not the jsdom harness.

1. Loaded four synthetic seed records, created before starting this server. Selected `Chrome Keep`, then applied `Chrome Ada` + Building Reliable AI Agents + 0–10 with Enter. Only `ABC-234` (rating 0) and `DEF-567` (rating 10) remained; selected count reset to zero. The URL included the four filters and refresh retained controls/results.
2. Opened `ABC-234` details. All stored fields appeared, including full private feedback/address. The modal matched `:modal` and focused Close details. Escape removed it and restored focus to Details. Checked individual/select-visible behavior and count changes.
3. Canceled the two-response bulk confirmation; both records remained. Reopened and confirmed: “Deleted 2 responses.” appeared without reload, focus returned to the heading, and Clear showed the two untouched responses.
4. Opened `KLM-345` / `Chrome Single` confirmation, canceled and verified the row remained, then confirmed it. “Deleted 1 response.” appeared and refresh showed only `GHJ-892` / `Chrome Keep`.
5. Applied invalid rating bounds 10–0, read the useful alert, and recovered with Clear.
6. Ran the manual survey regression: empty required-field errors, rating **0**, Back retained feedback, reload retained gift/name/address, and submission produced **`2EX-2TW`**. Start another survey reset to the blank first step. The management list showed that new response above the retained record.
7. Read the isolated JSONL after writes had settled: exactly `GHJ-892` and `2EX-2TW` remained, and the latter contained the submitted rating-zero feedback, gift, name, and address. No user data file was read or modified. Automated browser setup also performs all writes through its own running app, with per-project synthetic names; its repository reads are read-only.
8. After the final rebuild/restart, explicitly reloaded Chrome. Direct navigation to the empty-filter URL resolved to `/survey` with both retained records and no alert. `?ratingMin=invalid` showed the rating guidance and Clear recovered.

Screenshots: inspected the full-page filtered/selected management screenshot in the task; saved final management evidence at `/private/tmp/ai-webmcp-phase3-management.png` (temporary local artifact).

Chrome's only recorded error was from the installed Bitwarden autofill overlay (`chrome-extension://nngceckbapebfimnlniiiahkandclblb/...`), not application code. Two browser-plugin text-entry/read interruptions were recovered by inspecting fresh visible state; entered data and the fresh-survey reset were intact. The automated production tests reported no application page errors. Benign pre-existing route-generator circular-dependency and Playwright color-environment warnings remain.

### Framework references and limitations

Consulted current official [TanStack Router search-parameter documentation](https://tanstack.com/router/latest/docs/framework/react/guide/search-params), [data mutation/invalidation documentation](https://tanstack.com/router/latest/docs/framework/react/guide/data-mutations), and [MDN native dialog documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog). Kept the validated predecessor's installed compatible versions rather than assuming old plan version numbers.

Known limitations or blockers: **no Phase 3 blocker**. Authentication, remote/multi-process deployment, pagination, and WebMCP management operations remain outside scope. Native dialog layout/focus behavior is verified in Chromium; native browser chrome remains reachable by keyboard. The Phase 3 task does not start or release Phase 4.
