# Phase task coordination

Coordinator task: `01a05438-d923-7361-a5b7-23d1025b27eb` (local).

Project: `a585b92d-22be-49e0-a549-8aca7adc0fb9` (WebMCP).

Initial implementation baseline: `4dac74f472a958fbd1c531ba3756ef0f17146068`.

Temporary coordinator heartbeat: `coordinate-ai-dev-days-build`, every five minutes in the coordinating task. Delete it after Phase 5 validates.

## Task creation

All six tasks were created on 2026-08-30. `list_threads` omitted these new tasks even after creation. The mapping below was recovered from the app's task-creation logs and verified with `read_thread` and `wait_threads`; use these real IDs directly. Do not recreate the tasks or confuse an omitted listing with unfinished setup.

| Phase | App title                                 | Task ID                                | Release state                        |
| ----- | ----------------------------------------- | -------------------------------------- | ------------------------------------ |
| 0     | AI Dev Days — Phase 0: Foundation         | `01a05463-0245-77f0-9229-d45bc1a42db9` | Validated and integrated (`355720e`) |
| 1     | AI Dev Days — Phase 1: Domain and storage | `01a05463-0af0-7783-92a8-0ec217730054` | Validated and integrated (`e39cde6`) |
| 2     | AI Dev Days — Phase 2: Manual survey      | `01a05463-141f-70f3-ab93-af7f5c7f1921` | Validated and integrated (`05adb65`) |
| 3     | AI Dev Days — Phase 3: Management         | `01a05463-237c-7372-ae9a-16648b437057` | Validated and integrated (`a768b5b`) |
| 4     | AI Dev Days — Phase 4: WebMCP             | `01a05463-2ef2-7692-a9f5-1c1d91461e14` | Validated and integrated (`8cc0297`) |
| 5     | AI Dev Days — Phase 5: Verification…      | `01a05463-4065-7b91-98f3-66d1b4dd3bfc` | Released after Phase 4 validation    |

All tasks use host `local`. Worktree directory prefixes by phase: `ae76`, `92e7`, `d739`, `046d`, `46af`, `bcf3`, under `/Users/john/.codex/worktrees/<prefix>/ai-webmcp`.

## Coordinator procedure

1. Read `EXECUTION.md` and the current phase document. Use the verified task IDs above with compact `wait_threads` snapshots and cursors for status.
2. Keep at most one phase implementing. Readiness acknowledgements from queued tasks do not satisfy their phase gates.
3. When the active phase reports completion, inspect its diff, tests, coverage configuration/report, and recorded functional evidence. Reproduce relevant checks and use Chrome for live behavior as needed. Return any defect to that same task for a failing regression test and fix.
4. Integrate only validated work into the coordinating checkout without discarding unrelated edits. Fast-forward to the completed phase commit when possible. If coordinator-only documentation commits require a non-conflicting merge, preserve both histories.
5. Mark the phase complete in the plan index and release exactly the next phase with the integrated predecessor commit hash. Tell the next task to fast-forward its worktree to that commit before editing. Detached worktrees may create a `codex/` branch first.
6. After Phase 5 passes, report the finished app, actual coverage, browser validation, and any limits to the user. Stop any temporary coordinator wake-up.

## Current gate

Phases 0–4 passed independent coordinator validation and were integrated into main. Their implementation commits are recorded in the table above and each phase's acceptance evidence. Phase 5 is the sole released implementation task.

The Phase 3 coordinator reran formatting, types, 45 Vitest tests, 14 production desktop/mobile browser tests (including build/start), and the real server-function test. Coverage was 96.73% statements, 97.24% branches, 94.01% functions, and 97.22% lines with unchanged exclusions and thresholds. Live Chrome at `http://127.0.0.1:3104/` verified native detail focus/Escape/restore, two manual submissions, combined case-insensitive name/talk/inclusive 0–10 filters, hidden-selection pruning, canceled and confirmed bulk/single deletion, post-delete focus, and retained JSONL data after reload. The coordinator Chrome log was empty. All changes were confined to isolated synthetic records; no user data was touched. No blocker remains.

The Phase 4 coordinator reviewed the registration/schema/shared-operation implementation, tests, TDD evidence, and live approval boundary; then reran formatting, types, 53 Vitest tests, 20 production desktop/mobile browser tests (including build/start), and the real server-function test against `8cc0297731e106863097d57629743ef2d35076b6`. Coverage was 96.50% statements, 96.29% branches, 93.65% functions, and 97.50% lines with unchanged exclusions and thresholds. After the user approved exactly two disposable local submissions, the phase task created `H48-WJT` through the real polyfill and `4A7-VD6` through the manual form. The coordinator independently inspected management and the assistant response details, then rechecked both retained rows and assistant availability on the normal production build at `http://127.0.0.1:3105/`; its Chrome log was empty. No additional live write or deletion was performed by the coordinator. The validated lane is the real 5.0.1 polyfill with a same-origin in-page client, not native WebMCP or an external agent bridge.

Phase 5 must make both interaction scripts reproducible without chat history, identify the actual execution lane and its limits, keep any verification client out of the ordinary production app, and run the final clean-install, accessibility, responsive, persistence, regression, and product-language gates. The earlier two-record approval is fully consumed; it does not authorize unrelated live writes if another action-time approval is required. Keep all fixes regression-first within Phase 5 until its gate passes.
