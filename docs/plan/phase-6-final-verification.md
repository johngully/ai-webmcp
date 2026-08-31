# Phase 6 — Final Verification

## Outcome

The restyled application passes final functional, visual, accessibility, persistence, and reproducibility checks. A fresh checkout can run the app and compare manual and one-tool submissions using the written instructions.

## Dependencies and preserved work

Phase 5 styling must be validated and integrated before this task resumes. The original verification task finished commit `311155f080b92daac87bda6cb3cda35cc1f1b190` as the styling revision arrived. That commit is preserved and independently checked as a **pre-styling checkpoint**, not final acceptance of the new appearance. Its tests, isolated browser fixtures, recovery regressions, contributor client, and operating documents are reusable.

See [checkpoint evidence](./phase-5-verification-demo.md), [verification matrix](../verification.md), and [comparison guide](../demo-guide.md). Historical checked tasks establish what passed before styling; the unchecked tasks below establish what remains. Use the existing renamed verification task, not a duplicate task, and fast-forward to the coordinator's exact styling handoff commit before working.

## Tasks

- [x] **P6.1 — Reconcile the handoff.** Review the styling diff, evidence, and any regressions against the checkpoint. Completion criterion: both histories are preserved, the task runs from the accepted styling commit, and the remaining checks reflect the delivered UI.
- [x] **P6.2 — Rerun the clean-install release matrix.** Perform a frozen-lockfile clean dependency installation, formatting, types, unit/integration coverage, production build/start, all browser cases, and the real server-function check. Repeat the production browser suite to verify isolation. Completion criterion: commands pass with actual versions recorded, coverage exceeds 85% in all four metrics without relaxed exclusions, and local response data is untouched.
- [x] **P6.3 — Revalidate the restyled journeys.** In Chrome, exercise manual steps/Back/draft/reload/submission, management search/talk/inclusive-rating filters, details, selection and destructive cancellation/confirmation, and one-call real-polyfill submission. Completion criterion: both submission paths create equivalent complete responses and IDs; previous regressions remain covered; actual execution lane is stated honestly.
- [x] **P6.4 — Accept visual and accessibility quality.** Review Phase 5 screenshots and operate the restyled app with keyboard, narrow viewports, enlarged text, long records, open dialogs, invalid/pending/empty/selected states, and unavailable assistant status. Completion criterion: research direction is recognizable, text/control contrast passes, required content remains reachable, and focus/announcements work.
- [x] **P6.5 — Refresh operating and comparison documents.** Update setup/troubleshooting, actual visible labels/actions, screenshot evidence, source attribution, and measured comparison steps after styling. Completion criterion: a contributor can run both documented paths without chat history, the client remains absent from the ordinary app build, and no token-savings/native-execution claim exceeds the evidence.
- [x] **P6.6 — Complete final safety and product-language audit.** Recheck persistence-recovery regressions and isolated test data, rendered routes/metadata/accessibility/tool copy, and local-only operating limits. Completion criterion: ordinary AI Dev Days product language is consistent and no styling change altered schemas, stored fields, or tool behavior.
- [x] **P6.7 — Record and commit final acceptance evidence.** Add a failing regression before any newly found defect fix, rerun affected live flows and all release checks, and commit scoped final-verification changes. Completion criterion: every task above has evidence, the worktree is clean, and the coordinator receives the commit, URLs, coverage, screenshots, and known limits for independent acceptance.

The [execution rules](./EXECUTION.md) apply unchanged. Stop only when required authority is missing; report the exact action and preserve completed checks. The coordinator deletes its temporary automation only after this phase and any later explicitly added refinement phase are validated.

## Final verification evidence — 2026-08-30

All checks below ran after fast-forwarding to the coordinator's exact accepted styling handoff, `8566f84a321d8265511f6b6957d5b695e9e62c43`. The pre-styling `311155f` and styling `72ed4ab` histories remain intact. No application source, schemas, stored fields, WebMCP behavior, dependency, or lockfile changed in Phase 6. A path-dependent coverage-scope regression was fixed by anchoring the include to the checkout's actual source directory and asserting the generated report's file scope; thresholds and exclusions were preserved. This is the phase handoff for independent coordinator acceptance, not an update to the coordinator's overall gate.

### Clean release matrix

To avoid replacing the build used by the earlier preview, `git archive HEAD` was extracted into a fresh source-only directory, `/private/tmp/ai-dev-days-final-checkout-JEEnyl`. It had no dependencies, build, or data. All commands below ran there. Browser commands used `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ai-webmcp-playwright` and loopback-only test processes.

| Command                                                                                          | Result                                                                           |
| ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`                                                                 | Clean install passed; 256 packages; lockfile unchanged                           |
| `pnpm format:check`                                                                              | Passed                                                                           |
| `pnpm typecheck`                                                                                 | Route generation and TypeScript passed                                           |
| `pnpm test`                                                                                      | 58 tests in 12 files passed                                                      |
| `pnpm test:coverage`                                                                             | Same 58 tests passed; unchanged all-source gate passed                           |
| `pnpm test:e2e --repeat-each=2 --reporter=list,html`                                             | Production build passed, then 60/60 cases passed with four workers; 58.4 seconds |
| `pnpm test:server-functions`                                                                     | Run after the production suite; 1/1 real server-function case passed             |
| `SURVEY_DATA_FILE=/private/tmp/ai-dev-days-final-data-aZrT6n/surveys.jsonl PORT=3114 pnpm start` | Production start and live Chrome flows passed                                    |
| `SURVEY_APP_URL=http://127.0.0.1:3114 PORT=3115 pnpm verification:client`                        | Contributor-only same-origin discovery and execution passed                      |

The repeated suite is 30 cases × 2: desktop 1280×800 and mobile 375×812, including explicit 320px/200%-text checks. Each case/retry gets a separate server, port, and file; the suite never resets shared response data. The clean snapshot's default `data/surveys.jsonl` remained absent. The HTML report is retained at `/private/tmp/ai-dev-days-final-report/index.html`; selected portable attachments are in [final evidence](../evidence/phase-6/README.md).

Coverage: **96.53% statements (334/346), 96.47% branches (164/170), 93.65% functions (118/126), 97.53% lines (316/324)**. Thresholds remain 86% each; inclusion remains all `src/**/*.{ts,tsx}`, excluding only the generated route tree and declarations.

Actual environment: Node 22.22.0, pnpm 10.33.0, macOS arm64; live Google Chrome 152.0.7977.64; automated Chrome for Testing 151.0.7922.34 (Playwright revision 1234). Installed versions remained Start 1.168.49, Router 1.170.32, Form 1.33.5, React/React DOM 19.2.8, Zod 4.5.4, Nano ID 6.0.1, WebMCP polyfill/types 5.0.1, Playwright 1.62.1, Vitest/coverage 4.1.11, Vite 8.2.2, Nitro 3.0.260610-beta, TypeScript 6.0.3, and Prettier 3.9.6. Existing route-generator circular-dependency and NO_COLOR/FORCE_COLOR warnings did not fail checks; normal live app warning/error logs were empty.

### Live Chrome results

The Chrome plugin reconnected through its supported recovery flow after the user's browser restart. All live actions used the Chrome plugin. Automated Chromium remained a separate lane. No extension installation, global browser setting change, or approval bypass was used.

- **Manual:** Home → Start survey; empty Next exposed all required errors; six fictional Casey Morgan answers; Back retained talk/rating/reason; Next and reload retained gift/name/address; one submit saved **48G-LRE**. Visiting Take survey afterward showed an empty draft. Current-step and Complete text remained correct.
- **Tool:** The contributor client discovered exactly `submit_ai_dev_days_survey`, with all six required fields, talk/gift enums and integer 0–10 bounds. One activation of Submit through assistant saved **FN8-VRY**, with matching client and app announcements, without navigating or filling the embedded form. This used the actual pinned polyfill, not a native/external bridge. Repeated automated cases additionally proved one tool POST and 404 for the client path on ordinary production.
- **Equivalence:** Both retained JSONL records have the same six answers and eight stored keys, with different valid IDs/timestamps. Inspection confirmed the matching pair remained intact. The coordinator subsequently deleted only the approved bulk-audit records **7PX-HLJ** and **SZS-529**. This task independently reloaded management and inspected the JSONL: exactly **48G-LRE/FN8-VRY** remain, with all six answers still identical.
- **Management:** Combined Casey Morgan/talk/minimum 9/maximum 9 returned both records. Bounds 10–10 and another talk returned no matches; Clear restored both. Filtering hidden rows cleared selection. Details exposed every field. Bulk selection opened a dialog naming the exact pair; Escape cancelled it. A separate long synthetic record, **HJ3-7FM**, was created, inspected, single-delete cancelled, then explicitly confirmed deleted. The success status said Deleted 1 response and focus returned to Manage responses. The comparison pair was retained. A final bulk-confirmation audit created **7PX-HLJ** (Disposable Bulk One) and **SZS-529** (Disposable Bulk Two). The dialog named only those two records. After the initial action-time approval block, the coordinator completed the deletion through Chrome in the parent task where the user directly approved it. The coordinator observed Deleted 2 responses, two remaining rows, zero selected, the closed dialog, disabled Delete selected (0), and focus on Manage responses. This task then independently reloaded and captured the retained pair without performing any further deletion.
- **Keyboard and visual:** Tab/Enter applied filters with a visible 3px blue ring; native radio ArrowRight changed 0 to 1; details Escape restored the originating button; Cancel restored Delete. Native modal Tab can visit browser chrome (document focus becomes body), but no background page control became active. Long content scrolled vertically inside the 320px dialog without horizontal overflow; Close details remained reachable. Bulk cancellation and full keyboard single/bulk confirmation also passed in the repeated automated suite.
- **Reflow and feedback:** Live home widths 320/390/768/1280 equaled page scroll width. Form, long detail, selected/dialog and empty/no-match states were operated at narrow widths. A read-only fixture supplied 32px root text and unavailable-assistant status at 320px, delayed a rejected save for 15 seconds, and retained answers after recovery. During pending, all form controls and Back were disabled and Home navigation stayed on the form. Enlarged management and details had no horizontal page/dialog overflow. Enlarged success was independently captured by the repeated automated suite.

The visual direction matches the [researched reference](../research/openai-visual-reference.md): neutral surfaces, restrained typography, generous space, and clear pill actions. Earlier Phase 5 home/detail screenshots were visually compared with the final captures. System fonts and independent AI Dev Days identity remain. Recomputed contrast from live CSS: primary 19.44:1, secondary ≥5.93:1, primary action 17.76:1, control boundary 3.23:1, focus 5.39:1, error 7.88:1, success 6.20:1. See [measurements and screenshots](../evidence/phase-6/README.md).

### Audit, documentation, and limits

Approval resolution: this task stopped when auto-review rejected the initial confirmation and the subsequently relayed approval. The coordinator then completed only the exact approved deletion in the parent task that held direct user approval, using the Chrome plugin rather than forwarding another authorization retry. Coordinator-reported results were Deleted 2 responses, a closed dialog, two remaining rows, zero selected, and restored heading focus. This task independently reloaded the ordinary port-3114 management page, captured the final pair, and asserted the exact remaining IDs and matching stored answers. No further deletion was attempted here. The resumed check `pnpm exec playwright test tests/e2e/management.spec.ts tests/e2e/accessibility.spec.ts --reporter=list` passed all six isolated desktop/mobile cases; formatting, whitespace, and exact retained-record assertions also passed. P6.3/P6.7 are now complete for the scoped handoff.

No application defect was found, so no production behavior fix was necessary. The coordinator did identify the coverage-scope configuration defect documented below; it received a failing public-report regression before its narrow fix. Existing storage interruption/rename/malformed-line recovery tests, pending navigation, uncertain WebMCP transport, product-language, draft, selection, dialog-centering, and keyboard regressions all passed. The new contributor-only visual fixture initially omitted request headers and caused a management read to be rejected; preserving the original browser headers restored that read. It still rejects every non-GET request and never writes responses. This fixture setup correction does not alter application access controls.

README, the comparison guide, and verification matrix now describe current step/count labels, exact observed IDs, screenshots, local safety limits, and the distinction between the direct comparison script and extra live audit interactions. Rendered routes, metadata, accessibility and tool metadata/results retain ordinary AI Dev Days wording; the source audit found no demo/preview/prototype/development/OpenAI framing in `src`. The client stays outside the app build. No tokens, cost savings, native execution, or external bridge compatibility are claimed.

Normal production is still local-only, unauthenticated, one process per JSONL file. No multi-process or power-loss durability guarantee was added. An uncertain successful save can duplicate if retried; inspect management first. Accessibility evidence covers semantics, keyboard, contrast, long content, reflow and text resizing, not screen-reader speech or formal WCAG certification.

Earlier preview ports and data (including 3105, 3106/3108, 3110/3111) were not targeted or reset. Temporary read-only port 3116 and empty-state port 3117 were stopped; the latter created no data file. Chrome's viewport override was reset. Final app/client 3114/3115 and exactly two fictional responses remain for coordinator review: the matching manual/tool pair **48G-LRE/FN8-VRY**.

### Coverage scope regression — red then green

The coordinator's independent checkout has a `/src/` ancestor. Its unchanged relative coverage glob counted root `survey.config.ts` and `tests/survey.fixture.ts`, inflating totals to 96.56/96.51/93.65/97.55%. This was a reporting-scope defect, not a difference in application coverage.

1. Added `scripts/check-coverage-scope.mjs` to compare the generated public JSON summary with every actual application `.ts`/`.tsx` file, honoring only the existing generated-route/declaration exceptions. Connected it to `pnpm test:coverage` before modifying the include.
2. Extracted the accepted source into `/private/tmp/ai-dev-days-coverage-scope-2bmUyX/src/checkout`, copied the new assertion/command, and ran `pnpm install --frozen-lockfile && pnpm test:coverage` with the original relative glob. All 58 tests passed, but the command failed as expected: `Coverage scope mismatch. Unexpected: survey.config.ts, tests/survey.fixture.ts. Missing: none`.
3. Replaced the include with `fileURLToPath(new URL('./src/**/*.{ts,tsx}', import.meta.url))`. No thresholds or exclusions changed. Repeated actual coverage passed, asserting exactly 21 application source files and restoring **96.53/96.47/93.65/97.53%**. The ordinary worktree also passed types and coverage with the same 21-file scope.
4. Retained [before](../evidence/phase-6/coverage-scope-before.json) and [after](../evidence/phase-6/coverage-scope-after.json) public reports with checkout prefixes normalized. All real source-file counts match between them. The maintained assertion also rejects missing application files, so the fix cannot silently omit unimported source.

The fresh `src`-ancestor checkout is the final verification-config check environment. After the fix, `pnpm test:e2e --repeat-each=2 --reporter=list` rebuilt production and passed all 60 cases in 58.5 seconds. The subsequent `pnpm test:server-functions` passed 1/1 in 2.3 seconds. The ordinary worktree passed final formatting, types, and all 58 tests with coverage plus the 21-file scope assertion. This environment is separate from the untouched live app snapshot on 3114/3115. No response data was copied or reset.

### Handoff

Commit: supplied in the task's final response (the scoped Phase 6 commit).

Worktree: `/Users/john/.codex/worktrees/bcf3/ai-webmcp`.

Tests and results: clean frozen install; formatting/types; 58 unit/integration; 60 repeated production browser; one real server-function; production build/start; live Chrome journeys and visual audit passed. Final live bulk confirmation was completed by the coordinator after direct user approval, with independent read-only verification here. Automated bulk confirmation also passed.

Coverage (statements / branches / functions / lines): **96.53 / 96.47 / 93.65 / 97.53%**.

Production build/start: accepted source snapshot at `/private/tmp/ai-dev-days-final-checkout-JEEnyl`, app [3114](http://127.0.0.1:3114/), client [3115](http://127.0.0.1:3115/__verification__/webmcp), retained file `/private/tmp/ai-dev-days-final-data-aZrT6n/surveys.jsonl`.

Live Chrome validation: manual **48G-LRE**, polyfill **FN8-VRY**, disposable **HJ3-7FM** deleted; **7PX-HLJ/SZS-529** deleted by the coordinator following direct user approval; [screenshots](../evidence/phase-6/README.md).

Regressions added: maintained public coverage-report scope assertion, red before the anchored-glob fix and green afterward; all existing regressions passed, no application changes needed.

Known limitations or blockers: no remaining blocker. Operating and accessibility limits above remain. Native WebMCP and external bridges are unverified. Coordinator acceptance and automation cleanup remain coordinator-owned.
