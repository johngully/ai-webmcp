# Phase 2 — Manual Multi-Step Survey

## Outcome

A user or browser-operating Codex agent can complete the AI Dev Days survey across two pages, move backward without losing data, submit once, and receive a memorable survey ID.

## Dependencies

- Phases 0 and 1 complete.
- `@tanstack/react-form` installed.
- Shared schemas and `submitSurvey` operation available.
- Browser `sessionStorage` available after hydration.

## Tasks

- [x] **P2.1 — Define the survey route contract.** Add `/survey/new` with a validated `step` search parameter accepting `1` or `2`; missing or invalid values resolve to step 1. Completion criterion: direct navigation, refresh, Next, and Back all produce canonical URLs such as `/survey/new?step=1`.
- [x] **P2.2 — Create the draft module.** Own the complete new-response shape in one TanStack Form instance and persist unfinished values to a versioned `sessionStorage` key. Completion criterion: client navigation and refresh retain valid draft values while corrupt or obsolete saved values reset safely.
- [x] **P2.3 — Build Step 1.** Render the five-talk dropdown, an accessible 0–10 NPS radio group with endpoint labels, and “Primary reason for your rating” textarea. Completion criterion: Next is blocked with useful field errors until every Step 1 value is valid.
- [x] **P2.4 — Build Step 2.** Render the gift dropdown, name input, and shipping-address textarea with Back and Submit actions. Completion criterion: Back returns to the populated Step 1 and Submit reports field-level errors for invalid Step 2 values.
- [x] **P2.5 — Submit through the shared operation.** Revalidate the complete input on the server, prevent repeat clicks while pending, and handle recoverable submission errors without clearing the draft. Completion criterion: one successful click appends exactly one JSONL record.
- [x] **P2.6 — Show completion.** Replace the form with a success panel displaying the canonical `XXX-XXX` ID and a “Start another survey” action that clears the draft. Completion criterion: the ID returned by the operation matches the stored record and is announced to assistive technology.
- [x] **P2.7 — Cover non-happy paths.** Provide pending, server-error, direct-Step-2, browser-storage-unavailable, and resubmission behavior. Completion criterion: no path silently loses valid entered data and no pending action can be submitted twice from the UI.
- [x] **P2.8 — Verify the manual flow.** Add UI tests for validation and preservation plus a browser test that completes Step 1, goes forward and back, submits Step 2, and verifies the response ID. Completion criterion: tests use accessible labels and roles that a browser agent can also inspect.
- [x] **P2.9 — Use conference product language.** Replace development and comparison framing in the shared header/footer, Home, survey, management availability message, and document metadata. Verify the rendered pages with a visible-copy regression and production Chrome.

## Manual flow contract

```text
/survey/new?step=1
  -> validate survey feedback
  -> /survey/new?step=2
  -> validate gift and delivery details
  -> submitSurvey(all fields)
  -> success panel with XXX-XXX
```

## Implementation and validation evidence — 2026-08-30

Commit: the Phase 2 implementation commit reported in the task handoff (avoids a self-referencing hash here).

Worktree: `/Users/john/.codex/worktrees/d739/ai-webmcp`, branch `codex/phase-2-manual-survey`, fast-forwarded before implementation to validated predecessor `624e21c65a39f11d7b495435b4ad7b28efa16ee5`.

The form uses `@tanstack/react-form` 1.33.5 and the existing shared Zod schema. It holds all six answers in one form instance, persists a versioned draft after hydration, validates each step, and statically imports the real `submitSurvey` server function through the route. A successful response clears the draft and announces the returned ID. Pending controls and route navigation are blocked; reload/close gets the browser's native pending-navigation warning. Failed requests keep all entered answers and provide a retry message. No management or WebMCP behavior was implemented.

### Observable red → green slices

Each behavior was tested at the approved visible UI or application boundary before its implementation:

1. `pnpm exec vitest run tests/survey-flow.test.tsx`: the first test failed because **Next** was absent, then passed after Step 1 controls, field-level errors, and canonical Step 2 navigation were implemented. Rating zero is a valid choice.
2. The Back/delivery-validation test failed because **Submit survey** was absent, then passed after Step 2 and retained Back/Next values were implemented.
3. The navigation/refresh test failed because feedback returned empty after leaving and reopening the route. It passed after versioned draft persistence and hydration were added. This test also exposed the current TanStack Store subscription cleanup contract and a restored-pristine-value reset: cleanup now calls `unsubscribe()`, and restoration preserves the original defaults with `keepDefaultValues: true`. The same failing UI flow passed after those fixes.
4. Direct Step 2 tests failed with missing feedback controls for absent, corrupt, obsolete, and structurally invalid drafts. They passed after redirecting incomplete feedback to canonical Step 1 after hydration.
5. `pnpm exec vitest run tests/survey-submission.test.tsx`: the success test failed because no confirmation status appeared. It passed after real application operations were wired to submission, the displayed ID was checked against the public repository result, and Start another survey cleared the form.
6. The deferred RPC recovery test failed because **Submitting…** was absent. It passed after synchronous duplicate-submit protection, disabled pending controls, and recoverable errors were implemented. Rejected input remains editable; the retry saves one response.
7. `pnpm exec vitest run tests/shell.test.tsx -t 'attendee-facing'`: all three route cases failed on existing demo/preview/phase copy, then passed after the shared UI and metadata were rewritten as conference product language. Existing navigation and SSR tests were retained and updated to the shipped copy.
8. `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ai-webmcp-playwright pnpm test:e2e --project desktop -g 'pending submission'`: the new production regression failed because clicking Home during an in-flight submission navigated to `/`. After adding the Router navigation blocker, it passed: the URL stays on Step 2 while pending, one response is saved, and Home works again after success.

Storage read and write failures are additionally exercised through the browser-storage boundary; visible warnings explain that refreshing or leaving cannot retain answers when storage is unavailable. Tests use accessible labels/roles, real schemas/application operations, and memory or isolated JSONL repositories. Only the deferred browser-to-server request and browser storage are simulated at system boundaries.

### Final checks

- `pnpm format:check` — passed.
- `pnpm typecheck` — passed, including generated routes.
- `pnpm test:coverage` — **37 tests passed in 9 files**. Statements **97.14%**, branches **97.50%**, functions **94.59%**, lines **97.48%**. All four 86% thresholds remain unchanged; no coverage exclusions or shortcuts were added. The report still measures all handwritten `src/**/*.{ts,tsx}`, including routes and server-function wrappers.
- `pnpm build` — passed with Nitro's local `node-server` output. The production browser suites also rebuild the app before starting it.
- `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ai-webmcp-playwright pnpm test:e2e` — **10 passed**, desktop and 375px mobile: existing shell/keyboard/no-JavaScript navigation, survey validation, Back/refresh preservation, real production submission and stored ID, Start another survey, product copy, direct Step 2 recovery, pending-navigation regression, and no horizontal overflow in the checked flows.
- `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ai-webmcp-playwright pnpm test:server-functions` — **1 passed** after the final fix, covering real browser-to-Node submit/find/delete and invalid-input rejection.
- `git diff --check` — passed.

Production start: `PORT=3102 SURVEY_DATA_FILE=/private/tmp/ai-webmcp-phase2.slIsSs/surveys.jsonl pnpm start`. Preview remains available at `http://127.0.0.1:3102/`; existing ports 3000/3100/3101 were untouched. Data is synthetic, isolated, and outside the repository.

### Live Chrome verification

Used the Chrome plugin against the production build on `http://127.0.0.1:3102/`, following its skill and local-application guidance. Observed Home, Take survey, and Manage responses use ordinary conference wording, including the neutral management-unavailable message.

- Home → Start survey → empty Next displayed talk, rating, and reason errors.
- Selected Building Reliable AI Agents, rating 10, and a reason; Next moved to Step 2. Empty Submit displayed gift, name, and address errors.
- Entered synthetic delivery data and selected Keyboard; Back retained all feedback. Next followed by refresh retained the gift, full name, and multiline address at `/survey/new?step=2`.
- Submit displayed canonical ID **V25-Y6M** in a `role="status"` confirmation. The isolated JSONL file had exactly **one** complete record with that same ID and all six submitted fields.
- Inspected the full-page success screenshot for readable ID, layout, and controls. Start another survey returned empty fields at Step 1.
- Exercised the pending-navigation fix and network recovery through a temporary loopback proxy at `http://127.0.0.1:3103/`, forwarding to the unchanged production app on 3102. The proxy returned one synthetic 503 before forwarding any submission, then delayed the retry for 30 seconds. Chrome showed the recoverable error without losing answers. During retry, all form controls were disabled, the pending status was visible, and clicking Home kept the page at Step 2. The retry completed with ID **87H-A6Y**. The JSONL file then contained exactly **two** records total: one for each successful live flow, with no duplicate from the failed request or navigation attempt. The temporary proxy was stopped after validation.

Chrome recorded one unrelated installed password-manager extension `insertBefore` error from `chrome-extension://…/bootstrap-autofill-overlay.js`; it did not affect the flow. The deliberate proxy 503 is expected validation traffic. Automated production flows reported no application page errors. No screenshot files are required to reproduce the checks; the success screenshot was inspected in the task.

Regressions added: draft restoration across unmount/refresh (including current Store cleanup/default behavior), attendee-facing product copy across routes and metadata, and pending route navigation allowing a second form instance. All passed after their fixes.

Known limitations or blockers: **no phase blocker**. The form needs JavaScript; server-rendered navigation and a clear no-JavaScript message remain available. Drafts are per-tab session storage, with an explicit warning when unavailable. Duplicate UI actions are prevented while pending and after success; a response lost after a server commit can still be ambiguous because server-side idempotency is outside the approved operation contract. The app remains one local Node process with no authentication, and management remains unavailable until Phase 3. These operational limits are contributor documentation, not development framing in the UI.

References checked during implementation: [TanStack Form validation](https://tanstack.com/form/latest/docs/framework/react/guides/validation), [TanStack Start server functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions), and [TanStack Router navigation blocking](https://tanstack.com/router/latest/docs/framework/react/guide/navigation-blocking). Installed type/source definitions were checked for the current Store subscription and form reset APIs.
