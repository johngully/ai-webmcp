# Pre-styling Verification Checkpoint (Original Phase 5)

Historical evidence, preserved in commit `311155f080b92daac87bda6cb3cda35cc1f1b190`. The user subsequently inserted [Phase 5 styling](./phase-5-styling.md); the existing verification task is now [Phase 6](./phase-6-final-verification.md). Checked items below describe the pre-styling build only and do not complete final acceptance of the new appearance. Historical commit/task numbering is retained rather than rewriting history.

Coordinator checked this commit independently on 2026-08-30: formatting, types, 56 Vitest tests, 28 production desktop/mobile browser cases, one real server-function case, and build all passed. Coverage was 96.53% statements / 96.29% branches / 93.65% functions / 97.53% lines. Read-only Chrome verified the three retained synthetic rows, full `G8T-B6V` details, and the separately served contributor client at ports 3106/3108; the inspected app log was empty. No additional live write or deletion was made by the coordinator. Integrated as the reusable checkpoint, with post-styling validation still required.

## Outcome

A fresh checkout can reproduce, verify, and present the manual and WebMCP flows side by side. The repository contains evidence that both paths create equivalent JSONL responses while the WebMCP path requires one structured browser tool invocation.

## Dependencies

- Phases 2, 3, and 4 complete.
- Playwright browser installed.
- The documented 5.0.1 polyfill and same-origin contributor client available for the live comparison; native execution and external bridges are not prerequisites or validated lanes.
- All scripts from Phase 0 operational.

## Tasks

- [x] **P5.1 — Complete the automated test matrix.** Cover schemas, IDs, repository adapters, operations, UI behavior, manual browser submission, management, and WebMCP contract execution. Completion criterion: each public interface and every destructive management action has at least one success test and one relevant failure or cancellation test.
- [x] **P5.2 — Isolate browser data.** Configure Playwright to use a temporary JSONL file and reset it between tests without touching local demo responses. Completion criterion: repeated parallel-safe test runs produce identical results and preserve `data/surveys.jsonl`.
- [x] **P5.3 — Audit accessibility.** Verify landmarks, headings, labels, descriptions, errors, NPS radio semantics, focus order, modal focus, status announcements, table headers, and keyboard-only operation. Completion criterion: every manual and management action can be completed without a pointer.
- [x] **P5.4 — Audit responsive behavior.** Exercise the survey and management routes at phone and desktop widths, including long names, reasons, addresses, and talk titles. Completion criterion: no required control or value becomes unreachable or visually clipped.
- [x] **P5.5 — Audit persistence safety.** Stress concurrent submission and deletion, malformed input, malformed stored lines, missing directories, collision retries, and interrupted mutation errors. Completion criterion: valid retained records remain parseable and error messages identify recovery steps.
- [x] **P5.6 — Create the manual demo script.** Document a fixed sample persona and prompt for Codex to inspect the browser, complete Step 1, navigate to Step 2, submit, and report the ID. Completion criterion: the script succeeds from a clean browser session using visible interface semantics rather than test-only selectors.
- [x] **P5.7 — Create the WebMCP demo script.** Use the same persona answers, direct the agent to gather any missing answers, discover `submit_ai_dev_days_survey`, call it once, and report the ID. Completion criterion: the script creates one response without form navigation or DOM-field manipulation.
- [x] **P5.8 — Document the comparison.** Record observable steps for each flow: pages inspected, UI interactions, navigations, structured tool calls, and final records. Completion criterion: the comparison makes no unverified token-savings claim and shows that stored response shapes are equivalent.
- [x] **P5.9 — Write operating documentation.** Add root setup, development, test, production, data-file, reset, browser WebMCP setup, and troubleshooting instructions. Completion criterion: a new contributor can run both demos without consulting chat history.
- [x] **P5.10 — Run the release gate.** From a clean install, run format checking, type checking, unit/integration tests, browser tests, coverage, production build, production start, and both live demo scripts. Completion criterion: all commands pass and the final output records the actual browser lane and dependency versions used.
- [x] **P5.11 — Audit product language.** Inspect every rendered route, document metadata, accessibility text, and WebMCP tool descriptions/results against [Execution rules](./EXECUTION.md). Completion criterion: the application consistently presents an AI Dev Days conference survey; demonstration instructions and development status exist only in contributor documentation.

## Fixed sample response

Use one sample response in both demo paths so their outputs are easy to compare:

```text
Talk: Building Reliable AI Agents
Rating: 9
Primary reason: Practical guidance I can apply to production agent workflows.
Gift: Keyboard
Name: Casey Morgan
Shipping address: 123 Example Lane, Chicago, IL 60601
```

The demo records must receive different IDs because each run represents a separate survey submission. Compare all user-provided fields and the stored shape, not the generated identity or timestamp.

## Phase 5 validation evidence — 2026-08-30

Commit: reported in the scoped implementation handoff, avoiding a self-reference.
Worktree: `/Users/john/.codex/worktrees/bcf3/ai-webmcp`, branch `codex/phase-5-verification`.
Validated predecessor: `9170184a0527e66015c6e548b6fce623f41b1758`. Inspected the clean detached worktree, created the branch, and fast-forwarded before implementation. No other phase was implemented; overall acceptance remains with the coordinator.

### Delivered scope

- P5.1: [Verification matrix](../verification.md) maps success and relevant failure/cancellation coverage at every approved seam, including each destructive management action. Retained all prior regression flows.
- P5.2: each production and server-function browser test now owns a fresh OS-temp directory, one Node process, and an OS-assigned loopback port. Teardown stops the writer before removing its file. Repeated cases do not depend on names, order, a shared reset endpoint, or a shared data file. The default `data/surveys.jsonl` was absent before and remained absent after the release run (`test ! -e data/surveys.jsonl` passed). Phase 4's port 3105 and its two records were never accessed or changed.
- P5.3/P5.4: keyboard-only browser flow completes all manual and management actions at 1280×800 and 375×812. It covers required-field errors/descriptions, native radio arrows, select type-ahead, Back/Next, submission, new draft, filters/clear, individual/select-all checkboxes, native details, Close/Escape, focus containment/restoration, canceled and confirmed single/bulk deletion, status text, column headers, and focus-driven horizontal table scrolling. Long name, 1,167-character reason, multiline address, and full talk titles remain reachable. Phone dialogs wrap without horizontal clipping. Live Chrome additionally verified both responsive widths and keyboard Page Up reaching the start of long details. This is not formal WCAG certification or a screen-reader speech-output test.
- P5.5: public repository tests retain missing-directory creation, no-final-newline/blank-line reading, normalized ID collision retry, two adapters with 16 concurrent creates plus deletion, mixed mutations, and reopen checks. Added interrupted append/rename and malformed mutation recovery regressions. A partial append can require operator repair; no power-loss, multi-process, or append transaction guarantee is claimed.
- P5.6/P5.7/P5.8: [Comparison guide](../demo-guide.md) provides standalone setup commands, complete fictional persona, copyable manual/tool prompts, the checked-in client command, actual observed counts, and equivalent stored fields. No token/time/cost savings claim. Tool discovery is counted separately from the single execution call.
- P5.9: root documentation now describes the complete app, installation, development, production, all checks, isolated browser data, reset/backup/repair, WebMCP setup, and troubleshooting. Replaced stale Phase 2-only status and planned-management statements.
- P5.10: clean dependency installation, full release commands, final production restart, both live scripts, and retained records verified below.
- P5.11: inspected route body/accessibility snapshots, title/description metadata, form errors/success, table/dialogs, assistant availability/result, and discovered tool schema/description. Production source scan for `demo|preview|prototype|development` (excluding generated routing) returned no matches. Contributor framing is confined to docs and the separate verification client; its path returns 404 on the ordinary app. No ordinary production UI or CSS change was needed.

### Observable red → green evidence

Used the TDD skill and the already approved schemas/IDs, repository operations, application operations, visible UI, and WebMCP discovery/execution seams. No extra seam approval was needed. Each new capability or discovered defect was handled as one focused slice; audits of existing behavior were allowed to pass without artificial failures.

1. **Malformed data recovery:** `pnpm exec vitest run tests/survey-repository.server.test.ts` failed (1 failed / 3 passed): the error named line 2 but omitted recovery steps. Added backup/line-repair guidance. The focused suite passed (4 tests), verifying both create/delete reject without altering the file and repaired records remain retrievable.
2. **Browser data leakage:** `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ai-webmcp-playwright pnpm test:e2e tests/e2e/isolation.spec.ts --project=desktop` failed (1 passed / 1 failed): the second fresh attendee case still saw the first response. Replaced the shared production server/data file with test-scoped process/directory fixtures. `... pnpm test:e2e tests/e2e/isolation.spec.ts --repeat-each=2` passed all 8 desktop/mobile repeated cases using 4 workers.
3. **Interrupted atomic deletion:** the first fixture attempt exposed that ESM builtin exports cannot be spied on directly; corrected the OS-boundary test double before treating the failure as evidence. The meaningful focused run then failed on raw `EIO: interrupted rename` instead of actionable recovery guidance. Added a safe contextual error; 5 tests passed. Original records survived reopen, the temporary sibling was removed, and a subsequent deletion succeeded.
4. **Reproducible client:** `... pnpm exec playwright test tests/e2e/comparison.spec.ts --project=desktop` failed because the integration client was unreachable. Added `pnpm verification:client`, a loopback-only same-origin proxy reading the checked-in HTML fixture; it does not copy files into the app. Corrected the test's asynchronous discovery wait, then both desktop/mobile cases passed: ordinary production client path 404, actual tool discovery, same six prefilled answers, one submission POST, two distinct IDs, equivalent retained records.
5. **Interrupted append:** focused repository run failed (1 failed / 5 passed) on raw `ENOSPC`. Added uncertain-save recovery guidance, including inspection before retry. All 6 repository-file tests passed: partial final line reported as line 2, earlier record unchanged, repaired file retrievable, next create successful.

Keyboard-audit harness correction: macOS native select controls did not change with End (including with an opened menu). Native character type-ahead selected the existing options and the full keyboard flow passed. This was not an application defect; no artificial app fix was made. Existing UI and product-language audits passed.

### Release commands and actual results

This worktree began without installed dependencies. `pnpm install --frozen-lockfile` completed successfully (256 packages, exact lockfile); the first sandbox attempt could not resolve the registry, then the approved network-capable attempt succeeded. No package version or lockfile change was made.

| Command                                                                                    | Result                                                                                                      |
| ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`                                                           | Pass, clean worktree dependency installation                                                                |
| `pnpm format:check`                                                                        | Pass, all matched files formatted                                                                           |
| `pnpm typecheck`                                                                           | Pass, route generation and TypeScript                                                                       |
| `pnpm test`                                                                                | Pass, 56 Vitest tests in 12 files                                                                           |
| `pnpm test:coverage`                                                                       | Pass, 56 tests; unchanged all-source scope/exclusions and 86% thresholds                                    |
| `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ai-webmcp-playwright pnpm test:e2e --repeat-each=2` | Pass, production build plus 56 browser executions: 28 desktop/mobile cases repeated twice, 4 workers, 55.6s |
| `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ai-webmcp-playwright pnpm test:server-functions`    | Pass, 1 real server-function browser test, run after the production suite                                   |
| `pnpm build`                                                                               | Pass again after the server-function gate; Nitro `node-server` artifact                                     |
| `SURVEY_DATA_FILE=/private/tmp/ai-webmcp-phase5-4dA1e9/surveys.jsonl PORT=3106 pnpm start` | Pass, localhost listener and final production Chrome recheck                                                |
| `SURVEY_APP_URL=http://127.0.0.1:3106 PORT=3108 pnpm verification:client`                  | Pass, contributor client; independently exercised in browser tests and live Chrome                          |
| `git diff --check`                                                                         | Pass                                                                                                        |

Coverage (statements / branches / functions / lines): **96.53% / 96.29% / 93.65% / 97.53%** (334/346 statements, 156/162 branches, 118/126 functions, 316/324 lines). No coverage exclusions or thresholds changed. Domain logic, routes, event handlers, and WebMCP handlers remain measured. The framework CLI still emits its existing circular-dependency warning, and Playwright reports the environment's NO_COLOR/FORCE_COLOR warning; neither caused a failed check.

### Exact versions and browser lane

Runtime: Node **22.22.0**, pnpm **10.33.0**. Live installed Google Chrome **152.0.7977.64**; automated Chrome for Testing **151.0.7922.34** (Playwright Chromium revision 1234) from `/private/tmp/ai-webmcp-playwright`.

All direct versions were checked with `pnpm list --depth 0` and remain pinned in `package.json` / `pnpm-lock.yaml`:

| Package group      | Exact versions                                                                                                                                                                                      |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Application        | `@tanstack/react-start 1.168.49`, `@tanstack/react-router 1.170.32`, `@tanstack/react-form 1.33.5`, `react 19.2.8`, `react-dom 19.2.8`, `zod 4.5.4`, `nanoid 6.0.1`, `@mcp-b/webmcp-polyfill 5.0.1` |
| Build/type tooling | `@tanstack/router-cli 1.167.33`, `vite 8.2.2`, `@vitejs/plugin-react 6.1.1`, `nitro 3.0.260610-beta`, `typescript 6.0.3`, `prettier 3.9.6`                                                          |
| Test tooling       | `vitest 4.1.11`, `@vitest/coverage-v8 4.1.11`, `@playwright/test 1.62.1`, `jsdom 30.0.1`, `@testing-library/react 16.3.3`, `@testing-library/user-event 14.6.6`, `@testing-library/jest-dom 7.0.1`  |
| Declarations       | `@types/node 22.20.1`, `@types/react 19.2.18`, `@types/react-dom 19.2.5`, `@mcp-b/webmcp-types 5.0.1`                                                                                               |

Rechecked current official Playwright fixtures/parallelism, TanStack hosting, and WebMCP draft documentation; links are in the root guide and verification matrix. The app registers on `document.modelContext`. **The validated execution lane is the real installed 5.0.1 polyfill with a same-origin in-page client, not native execution or an external agent bridge.** The client uses the installed JSON-text `executeTool` extension; the newest draft's object input is different. No new extension was installed and no global browser/Codex setting was changed.

### Live Chrome actions and observations

Used the Chrome skill and its local-app guidance. Normal app: `http://127.0.0.1:3106/`; separate client: `http://127.0.0.1:3108/__verification__/webmcp`; data: `/private/tmp/ai-webmcp-phase5-4dA1e9/surveys.jsonl`.

1. Opened fresh Home, inspected conference copy, activated Start survey, selected Building Reliable AI Agents and rating 9, entered the fixed reason, activated Next, selected Keyboard, entered Casey Morgan and the fictional Example Lane address, and submitted once. Success showed **NYS-Z9Y**. This used visible labels/controls only.
2. Opened the checked-in client in another fresh tab, waited for assistant availability, clicked Discover survey tools, inspected the sole `submit_ai_dev_days_survey` schema/description, reviewed the prefilled same six answers, and clicked Submit through assistant once. Result: `{"success":true,"surveyId":"G8T-B6V"}`. No embedded form navigation or form-field manipulation. JSONL then had exactly the two equivalent answer records with distinct IDs/timestamps.
3. Opened management and assistant-response details. Verified all fields, native dialog focus on Close details, Escape, and focus restoration to the correct Details button. Combined case-insensitive name, exact talk, and inclusive 9–9 filters retained only the comparison pair.
4. Created a separate long-content audit record **N6H-KG4** with Retrieval-Augmented Generation in Production, rating 9, Keyboard, a 150-character name, 1,167-character reason, and multiline long address. At 375×812, management document width remained 375; the details dialog had no horizontal overflow (778px client height, 2,121px scrollable content). Inspected its screenshot: text wrapped, Close remained reachable, and Page Up reached scrollTop 0 / the heading. Opened single-delete confirmation, checked the full wrapped name and default Cancel focus, then canceled with Escape. No live record was deleted.
5. At 1280×800, long details measured 606px client/content width without horizontal overflow. Restored the temporary viewport override. After the final production rebuild/restart, reloaded management and verified all three records persisted. Rechecked both survey steps at a measured 375px width with long text; field width was 293px and page width 375px. Discarded that unsubmitted audit tab and left a fresh management view with no inherited draft.
6. The only logged live error was an existing Bitwarden autofill overlay `insertBefore` exception at `chrome-extension://nngceckbapebfimnlniiiahkandclblb/...`; no application error was observed. Automated regression flows that capture page errors remained empty. Chrome's restricted read-only evaluator did not expose `navigator`, so browser versions were verified from the installed application metadata instead. No browser control/auto-review denial was bypassed.

Screenshots used: inspected the live phone-width long-details screenshot in this task; the keyboard browser audit also captures long-details attachments during its run. No response data or screenshots containing it were committed.

Known limitations or blockers: **no Phase 5 validation blocker**. Local/no-auth and one-process ownership remain deliberate constraints. Partial append requires repair; uncertain submission is not idempotent; no native/external-bridge execution or token-savings claim. All Phase 5 task checkboxes reflect the completed criteria above. Coordinator acceptance and the overall phase checklist remain untouched.
