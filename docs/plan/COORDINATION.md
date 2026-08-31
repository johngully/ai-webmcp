# Phase task coordination

Coordinator task: `01a05438-d923-7361-a5b7-23d1025b27eb` (local).

Project: `a585b92d-22be-49e0-a549-8aca7adc0fb9` (WebMCP).

Initial implementation baseline: `4dac74f472a958fbd1c531ba3756ef0f17146068`.

Temporary coordinator heartbeat: `coordinate-ai-dev-days-build`, every five minutes in the coordinating task. Delete it only after Phase 6 and any subsequently added refinement phase validate.

## Task creation

The original six tasks were created on 2026-08-30. The user then inserted styling as Phase 5; its new task was created and the original verification task renamed to Phase 6. `list_threads` can omit these tasks even after creation. The mappings were recovered from exact task-creation log entries and verified with `read_thread`/`wait_threads`; use these real IDs directly. Do not recreate tasks or confuse an omitted listing with unfinished setup.

| Phase | App title                                 | Task ID                                | Release state                                    |
| ----- | ----------------------------------------- | -------------------------------------- | ------------------------------------------------ |
| 0     | AI Dev Days — Phase 0: Foundation         | `01a05463-0245-77f0-9229-d45bc1a42db9` | Validated and integrated (`355720e`)             |
| 1     | AI Dev Days — Phase 1: Domain and storage | `01a05463-0af0-7783-92a8-0ec217730054` | Validated and integrated (`e39cde6`)             |
| 2     | AI Dev Days — Phase 2: Manual survey      | `01a05463-141f-70f3-ab93-af7f5c7f1921` | Validated and integrated (`05adb65`)             |
| 3     | AI Dev Days — Phase 3: Management         | `01a05463-237c-7372-ae9a-16648b437057` | Validated and integrated (`a768b5b`)             |
| 4     | AI Dev Days — Phase 4: WebMCP             | `01a05463-2ef2-7692-a9f5-1c1d91461e14` | Validated and integrated (`8cc0297`)             |
| 5     | AI Dev Days — Phase 5: Styling            | `01a054eb-aa27-7020-8358-bb5b8d88ee31` | Validated and integrated (`72ed4ab`)             |
| 6     | AI Dev Days — Phase 6: Final verification | `01a05463-4065-7b91-98f3-66d1b4dd3bfc` | Blocked on explicit two-record deletion approval |

All tasks use host `local`. Worktree directory prefixes by phase 0–6: `ae76`, `92e7`, `d739`, `046d`, `46af`, `1048`, `bcf3`, under `/Users/john/.codex/worktrees/<prefix>/ai-webmcp`. The styling creation initially returned client ID `client-new-thread:ea59f88b-0ff6-43da-916b-eefa53a18469`; its verified real task ID is recorded above.

## Coordinator procedure

1. Read `EXECUTION.md` and the current phase document. Use the verified task IDs above with compact `wait_threads` snapshots and cursors for status.
2. Keep at most one phase implementing. Readiness acknowledgements from queued tasks do not satisfy their phase gates.
3. When the active phase reports completion, inspect its diff, tests, coverage configuration/report, and recorded functional evidence. Reproduce relevant checks and use Chrome for live behavior as needed. Return any defect to that same task for a failing regression test and fix.
4. Integrate only validated work into the coordinating checkout without discarding unrelated edits. Fast-forward to the completed phase commit when possible. If coordinator-only documentation commits require a non-conflicting merge, preserve both histories.
5. Mark the phase complete in the plan index and release exactly the next phase with the integrated predecessor commit hash. Tell the next task to fast-forward its worktree to that commit before editing. Detached worktrees may create a `codex/` branch first.
6. After Phase 6 and any added refinement phase pass, report the finished app, actual coverage, browser validation, and any limits to the user. Delete the temporary coordinator wake-up.

## Current gate

Phases 0–5 passed independent coordinator validation and were integrated into main. The original verification task completed commit `311155f080b92daac87bda6cb3cda35cc1f1b190` just as the styling request arrived. That work is independently checked and integrated as a pre-styling checkpoint, with history intact. Styling commit `72ed4ab08c5a82611b7e58770a675e6f4d0f9558` is now accepted. Phase 6 Final verification is the sole released task; its existing task and worktree are reused and must fast-forward to the exact coordinator handoff commit before working.

Phase 6 started from `8566f84a321d8265511f6b6957d5b695e9e62c43` and completed unaffected checks, including the clean install, 58 unit/integration tests, 60 repeated production browser cases, one server-function case, and extensive live Chrome evidence. On 2026-08-30 local time, auto-review denied the final live bulk confirmation because exact action-time deletion approval was missing. The task stopped without retry or an alternate deletion path. Only disposable fictional responses `7PX-HLJ` (Disposable Bulk One) and `SZS-529` (Disposable Bulk Two) are intended targets in `/private/tmp/ai-dev-days-final-data-aZrT6n/surveys.jsonl`, served by the isolated app on port 3114. Matching manual/tool responses `48G-LRE` and `FN8-VRY` must remain. The coordinator requested this exact approval from the user. Do not retry or resume destructive validation until it arrives; unchanged waiting state does not warrant repeated notifications. The Phase 6 worktree holds uncommitted evidence/docs with P6.3/P6.7 open. Final commit, independent acceptance, integration, and automation cleanup remain pending. This coordinator-only blocker update need not be merged into the dirty phase worktree; preserve both histories at integration if necessary.

The Phase 3 coordinator reran formatting, types, 45 Vitest tests, 14 production desktop/mobile browser tests (including build/start), and the real server-function test. Coverage was 96.73% statements, 97.24% branches, 94.01% functions, and 97.22% lines with unchanged exclusions and thresholds. Live Chrome at `http://127.0.0.1:3104/` verified native detail focus/Escape/restore, two manual submissions, combined case-insensitive name/talk/inclusive 0–10 filters, hidden-selection pruning, canceled and confirmed bulk/single deletion, post-delete focus, and retained JSONL data after reload. The coordinator Chrome log was empty. All changes were confined to isolated synthetic records; no user data was touched. No blocker remains.

The Phase 4 coordinator reviewed the registration/schema/shared-operation implementation, tests, TDD evidence, and live approval boundary; then reran formatting, types, 53 Vitest tests, 20 production desktop/mobile browser tests (including build/start), and the real server-function test against `8cc0297731e106863097d57629743ef2d35076b6`. Coverage was 96.50% statements, 96.29% branches, 93.65% functions, and 97.50% lines with unchanged exclusions and thresholds. After the user approved exactly two disposable local submissions, the phase task created `H48-WJT` through the real polyfill and `4A7-VD6` through the manual form. The coordinator independently inspected management and the assistant response details, then rechecked both retained rows and assistant availability on the normal production build at `http://127.0.0.1:3105/`; its Chrome log was empty. No additional live write or deletion was performed by the coordinator. The validated lane is the real 5.0.1 polyfill with a same-origin in-page client, not native WebMCP or an external agent bridge.

The coordinator checked the preserved verification checkpoint with formatting, types, 56 Vitest tests, 28 production desktop/mobile browser cases, one real server-function case, and build; all passed. Coverage was 96.53% statements / 96.29% branches / 93.65% functions / 97.53% lines. Chrome read-only inspection checked the three retained synthetic rows, full assistant-response details, and the documented separate client on ports 3106/3108, with an empty inspected app log. The checkpoint includes repository-recovery regressions, per-test isolated servers/data, keyboard/long-content audits, and reproducible comparison/operating docs. It does not establish acceptance of the pending restyle.

The Phase 5 coordinator reviewed the complete source/test diff, public-interface TDD and regression evidence, before/after desktop and phone captures, enlarged-text evidence, and measured contrast. The independent rerun passed formatting, types, 58 Vitest tests, 30 production browser cases, one real server-function case, and build. Coverage was 96.53% statements / 96.47% branches / 93.65% functions / 97.53% lines, with unchanged inclusion/exclusions and 86% thresholds. Live Chrome at `http://127.0.0.1:3110/` independently verified required errors, rating 10, the WebMCP talk option, Back-preserved draft, Step 2 active navigation and progress, case-insensitive name/talk/inclusive 9–9 filters, count changes, full assistant response details, centered dialog/focus return, and two-row bulk cancellation. Both retained synthetic records (`UK9-MTF`, `CLM-2M2`) remained; no coordinator response was saved or deleted. The worktree was clean after checks, and main fast-forwarded to the scoped commit.

Phase 5 implements [the styling plan](./phase-5-styling.md) and [visual research](../research/openai-visual-reference.md): complementary OpenAI homepage/docs appearance, independent AI Dev Days identity, system-font default, all routes/states, before/after Chrome evidence, and full functional regressions. Phase 6 follows [its plan](./phase-6-final-verification.md), reruns the final release gate against the styled application, and refreshes documentation. Preserve prior previews and data, including styling ports 3110/3111 and pre-styling ports 3105/3106/3108. Use a fresh isolated temporary data file and distinct ports for final acceptance. The earlier two-record action-time approval is consumed; respect any new approval boundary and keep fixes regression-first in the active phase.
