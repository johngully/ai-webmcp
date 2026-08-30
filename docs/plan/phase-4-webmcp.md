# Phase 4 — WebMCP Submission

## Outcome

A WebMCP-capable agent can discover one AI Dev Days submission tool, collect all answers in one conversation, invoke the tool once, and return the same memorable survey ID as the manual path.

## Dependencies

- Phases 1 and 2 complete.
- `@mcp-b/webmcp-polyfill` and `@mcp-b/webmcp-types` installed.
- Shared new-survey schema and `submitSurvey` operation available.
- Secure same-origin browser context with native or polyfilled `document.modelContext`.

## Tasks

- [x] **P4.1 — Initialize WebMCP on the client.** Load the polyfill only in the browser; allow it to stand down when native support exists. Completion criterion: `document.modelContext` is typed and available after hydration in the supported browser.
- [x] **P4.2 — Define the tool interface.** Register `submit_ai_dev_days_survey` with a precise description and one object containing talk, rating, rating reason, gift, name, and shipping address. Completion criterion: every enum, required field, rating bound, and field description matches the shared survey definition.
- [x] **P4.3 — Register with current lifecycle semantics.** Call `document.modelContext.registerTool(tool, { signal })` in the root client lifecycle and abort the signal during cleanup. Completion criterion: exactly one tool is registered after navigation and it is not duplicated by development remounts.
- [x] **P4.4 — Execute through the shared submit path.** Validate tool input with the same Zod schema, call `submitSurvey` once, and return structured text containing success and the canonical survey ID. Completion criterion: one tool invocation creates exactly one record indistinguishable from a manual submission.
- [x] **P4.5 — Describe mutation behavior.** Mark the tool as state-changing, non-destructive, and non-idempotent using annotations supported by the current draft/types. Completion criterion: discovery metadata does not imply that submission is read-only or safely repeatable.
- [x] **P4.6 — Surface assistant availability.** Show a small assistant-submission status indicating available, unavailable, or temporarily unable to connect without blocking the manual flow. Show the returned ID in an accessible in-page notification when this page executes the tool. Completion criterion: the user can understand assistant availability and submission success using the product language in [Execution rules](./EXECUTION.md), without presenter or demonstration framing.
- [x] **P4.7 — Handle failures explicitly.** Return validation and submission failures as useful tool results while preserving server-side details from disclosure. Completion criterion: invalid input cannot create a partial record and an agent receives enough information to correct the call.
- [x] **P4.8 — Add contract tests.** Under the polyfill, discover the registered tool, inspect its schema, invoke it with all fields, and assert the response ID and stored record. Completion criterion: the test fails if the tool name, schema, registration lifecycle, return shape, or shared submission behavior drifts.

## Tool input

```ts
type SubmitAiDevDaysSurveyInput = {
  talk: Talk
  rating: number
  ratingReason: string
  swagGift: SwagGift
  name: string
  shippingAddress: string
}
```

## Tool result

```json
{
  "success": true,
  "surveyId": "K7M-4PD"
}
```

Use the current [WebMCP draft](https://webmachinelearning.github.io/webmcp/) during implementation. Avoid the deprecated `navigator.modelContext` interface in application code.

## Phase 4 validation evidence — 2026-08-30

Commit: the single scoped implementation commit is reported in the task handoff to avoid a self-referencing hash.
Worktree: `/Users/john/.codex/worktrees/46af/ai-webmcp`, branch `codex/phase-4-webmcp`.
Validated predecessor: `e409b667ed2aed00623d9363e7bf470d1fe93f9a`; branch created from the clean queued checkout and fast-forwarded before implementation.

### Current API and implementation

Consulted the official [WebMCP draft dated 26 August 2026](https://webmachinelearning.github.io/webmcp/), [polyfill documentation](https://github.com/WebMCP-org/npm-packages/tree/main/packages/webmcp-polyfill), [types documentation](https://github.com/WebMCP-org/npm-packages/tree/main/packages/webmcp-types), [Zod JSON Schema documentation](https://zod.dev/json-schema), and [TanStack Start server-function documentation](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions).

Installed exact `@mcp-b/webmcp-polyfill@5.0.1` and `@mcp-b/webmcp-types@5.0.1` after querying npm. Existing framework versions remain unchanged. Read the installed declarations and implementation in `dist/model-context.d.ts`, `dist/tool.d.ts`, and the polyfill's `dist/index.js` / `dist/schema.js`.

- The root lifecycle registers only `submit_ai_dev_days_survey`. The polyfill ESM import has no initialization side effect and is dynamically loaded in an effect only if the document lacks a context. Native contexts are retained. Insecure/unavailable contexts and registration errors leave manual controls usable.
- `registerTool(tool, { signal })` returns a promise. Cleanup aborts the registration, and aborted initialization/registration never changes the status or leaves an unhandled rejection. StrictMode/remount and route navigation are covered.
- `z.toJSONSchema(sharedSchema, { io: 'input' })` supplies the six required fields, exact talk/gift enums, 0–10 integer bounds, nonempty text constraints, and shared descriptions. The same Zod schema parses execution input; the existing `submitSurvey({ data })` server function remains the production write path.
- Success is `{ success: true, surveyId }`, serialized by the installed runtime to JSON text. Invalid answers return field-specific corrections without a write. Submission failures return no internal exception details and tell the caller to check responses before retrying, since a lost response can follow a successful write.
- Standard annotations set `readOnlyHint: false` and `untrustedContentHint: false`. Supported MCP annotation extensions also set `destructiveHint: false` and `idempotentHint: false`. The installed polyfill strips those extension hints from `getTools()`; the description explicitly states that calls add one response, never modify/delete existing responses, and repeated calls create another response.
- Compatibility difference: the newest draft's `executeTool` takes an object, while installed 5.0.1 `ChromeModelContext.executeTool(tool, inputJson)` takes JSON text. The application only registers the producer tool. Test clients use the installed JSON-text contract and feature-detect execution. No deprecated navigator interface appears in application code.

### Observable TDD slices and regression

Approved seams: public WebMCP discovery/schema/execution/results; shared application operations; visible root/manual UI. Tests use the real installed polyfill and real memory/application operations, with browser-boundary doubles only for denied/pending native registration or uncertain transport.

1. `pnpm exec vitest run tests/webmcp.test.tsx` failed because the registration module did not exist. Added schema-derived registration and shared submission. The discovery/schema/one-response/result/abort test passed.
2. Added invalid-input correction/retry. The run failed with a polyfill `UnknownError` wrapping Zod issues; added safe field results, then both tests passed.
3. Added uncertain transport after a committed response. The run failed and exposed the synthetic private error text; added the safe submission result without automatic retries. All three passed; exactly one response remained through the public application query.
4. `pnpm exec vitest run tests/webmcp-status.test.tsx` failed for the absent component. Implemented client effect and accessible in-page ID, then StrictMode/remount/cleanup passed.
5. Added root navigation availability test; it failed because the shell did not mount the component. Mounted it once in the root; assertions passed across survey and management navigation.
6. Added unavailable/native-registration-error tests; both initially failed with missing status messages/unhandled rejections. Implemented fallback status and retained the existing native context.
7. **Discovered regression:** root test cleanup exposed a pending-registration abort rejection. Before fixing it, added `unmount during pending registration contains the expected abort rejection`. Its focused run exited 1 with one unhandled `AbortError`. Added guarded rejection handling; focused and full suites then passed with no unhandled errors.

Test-harness corrections: the new production test initially looked for `Apply filters`, but the existing button is `Apply`; corrected that locator without changing the app. Nitro's static manifest does not serve HTML copied into output after build; the live test client must be copied into temporary `public/` before building. No production route was added for this harness.

### Automated commands and results

- `pnpm add --save-exact @mcp-b/webmcp-polyfill@5.0.1` and `pnpm add -D --save-exact @mcp-b/webmcp-types@5.0.1` — passed with sandbox network allowance.
- `pnpm format:check` and `pnpm typecheck` — passed. The existing route-generator circular-dependency warning remains non-failing.
- `pnpm test:coverage` — **53 tests passed in 12 files**, including all prior suites. **96.50% statements / 96.29% branches / 93.65% functions / 97.50% lines** (331/343, 156/162, 118/126, 313/321). All-source includes, exclusions, and four 86% thresholds are unchanged.
- `pnpm build` — passed, local Nitro Node production output. SSR tests and production requests do not initialize browser APIs on the server.
- `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ai-webmcp-playwright pnpm test:e2e` — **20 passed** after correcting the test locator, using production build/start on port 4173, desktop 1280×800 and mobile 375×812. Browser: Chromium **151.0.7922.34** (Playwright 1.62.1, revision 1234). New checks explicitly assert the real polyfill lane, discover exactly one tool, reject invalid data, invoke once with one POST, inspect the canonical result/in-page status and one complete JSONL response, then navigate/filter/reload. Synthetic unavailable and registration-error browser contexts both allow a full manual submission. All 14 prior production regressions passed.
- `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ai-webmcp-playwright pnpm test:server-functions` — **1 passed**, prior real server-function regression on port 4174. Browser commands ran sequentially because they share `test-results`. Browser launch/local listen required the usual sandbox allowance.
- Live production start: `PORT=3105 SURVEY_DATA_FILE=/private/tmp/ai-webmcp-phase4.6RxhL0/surveys.jsonl pnpm start` — listening at `http://127.0.0.1:3105/`. Other phase previews were untouched.

### Live Chrome evidence

Read Chrome skill, browser API, and local-development guidance before browser actions. Used installed Chrome **152.0.7977.64** via the Chrome plugin. The app runs the production bundle with isolated disposable synthetic data. No user data was read or written.

`tests/fixtures/webmcp-client.html` is a test-only same-origin in-page client: it renders the actual app in an iframe, discovers tools with the public `getTools()` API, exposes metadata visibly, and invokes through the installed execution extension via a visible button. It adds no app globals, routes, or management tool. For this live run it was temporarily copied to `public/webmcp-check.html` before `pnpm build`, then removed from source. During the live check the generated preview served it at `http://127.0.0.1:3105/webmcp-check.html`. After validation the dedicated server was restarted on the normal production build, which omits that test client; the fixture can be copied before a build to reproduce the check. Chrome actions used ordinary locators, never hidden-state evaluation or tool calls through read-only evaluation.

Verified in Chrome:

1. The app reports “Assistant submission available.” after hydration. Clicking Discover survey tools displayed one tool, all six fields and descriptions, exact enums/bounds, state-changing hint, and explicit repeat-call warning.
2. Through the visible client, submitted deliberately invalid synthetic answers (rating 11, whitespace shipping address). The result identified both corrections, said no response was saved, and the isolated data directory remained empty. Management displayed “No responses yet.”
3. Navigated the embedded app to management and rediscovered exactly one tool, preserving availability.
4. At `/survey/new?step=1`, empty Next displayed required-field guidance. Selected Multimodal Apps with Modern Models, rating 8, and synthetic feedback; Next reached gift/delivery while assistant availability remained visible. Back and reload retained those answers.
5. Chrome error/warning logs were empty for the test-client and manual tabs. Used DOM snapshots; no screenshot artifact was needed.

The initial auto-review rejection was respected. The user then explicitly approved exactly two disposable local records through the coordinating task. Resumed the retained Chrome tabs on the same production server and used visible controls for both writes:

6. Corrected the synthetic tool answers to rating 9 and `123 Synthetic Lane, Example City`. Clicked Submit through assistant once. The client returned `{"success":true,"surveyId":"H48-WJT"}`, and the actual app's accessible “Assistant submission result” displayed the same ID. The JSONL file then contained exactly one complete `Chrome Assistant Synthetic` record with Building Reliable AI Agents, Keyboard, rating 9, and the supplied reason/address.
7. Completed the retained manual form with Headphones, `Chrome Manual Synthetic`, and the same fictional address. Clicked Submit survey once. Its success status displayed **`4A7-VD6`**. The JSONL file then contained exactly the two approved records. Manual data retained Multimodal Apps with Modern Models, rating 8, and the earlier synthetic reason.
8. Navigated to management and verified both IDs/names/gifts/ratings. Opened `H48-WJT` details and checked every stored field, closed details, then reloaded; exactly both responses remained. Rediscovery still showed only the submission tool. No further survey write or deletion was performed in this live workflow.
9. The tool-client Chrome log was empty. The manual tab recorded one installed Bitwarden autofill-overlay `insertBefore` error from `chrome-extension://nngceckbapebfimnlniiiahkandclblb/...`, matching the unrelated extension behavior seen in Phase 3; no application error was recorded. No new application defect was discovered. Production automated tests reported no page errors.
10. After live validation, reran type checking and all 53 tests with coverage; results and percentages remained unchanged. Final formatting/diff checks passed; the production build and all 20 browser regressions plus the real server-function test passed again. Restarted port 3105 on that normal production build and rechecked the management page. The validation gate is complete; overall acceptance and Phase 5 release remain with the coordinator.

No Phase 4 blocker remains. The earlier optional cross-task progress message was also rejected by auto-review; it was not retried or sent through another channel. The final handoff supplies the reviewable result through this task.

Known limits: native registration is preserved and failure/abort behavior tested at the browser boundary, but **no native WebMCP execution lane is claimed**. No external agent extension was installed. Confirmed execution lane is the real 5.0.1 polyfill with an in-page client/browser integration tests. Tool submission is intentionally non-idempotent; authentication, cross-origin exposure, management tools, and deployment remain out of scope.
