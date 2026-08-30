# Phase task coordination

Coordinator task: `01a05438-d923-7361-a5b7-23d1025b27eb` (local).

Project: `a585b92d-22be-49e0-a549-8aca7adc0fb9` (WebMCP).

Initial implementation baseline: `4dac74f472a958fbd1c531ba3756ef0f17146068`.

Temporary coordinator heartbeat: `coordinate-ai-dev-days-build`, every five minutes in the coordinating task. Pause it after Phase 5 validates.

## Task creation

All six task creation requests were accepted on 2026-08-30. The app created six worktrees but returned pending client IDs; resolve actual task IDs through `list_threads` before using `wait_threads`, `read_thread`, or `send_message_to_thread`. Do not pass client IDs to those tools and do not create duplicate tasks while setup is pending.

| Phase | Requested title | Pending client ID | Release state |
| --- | --- | --- | --- |
| 0 | AI Dev Days — Phase 0: Foundation | `client-new-thread:24072eea-e738-442d-8a2f-1511b120ed0d` | Released in initial prompt |
| 1 | AI Dev Days — Phase 1: Domain and storage | `client-new-thread:b5d15675-898e-49f3-9190-37f6df62968e` | Queued; read-only readiness only |
| 2 | AI Dev Days — Phase 2: Manual survey | `client-new-thread:6e64f69e-b957-4283-bd17-7014bd15e905` | Queued; read-only readiness only |
| 3 | AI Dev Days — Phase 3: Management | `client-new-thread:71dffbcf-841e-400a-bd94-3194ac0136af` | Queued; read-only readiness only |
| 4 | AI Dev Days — Phase 4: WebMCP | `client-new-thread:04bd324f-3508-49cf-970a-b87b6dd421fc` | Queued; read-only readiness only |
| 5 | AI Dev Days — Phase 5: Verification and demo | `client-new-thread:521cfc9f-dbd9-4457-850e-f1c548dfa6ad` | Queued; read-only readiness only |

Titles above are the requested titles, not a substitute for the app's returned canonical titles. Update this table with actual IDs/titles as setup completes.

## Coordinator procedure

1. Read `EXECUTION.md` and the current phase document. Resolve task IDs once, then use compact `wait_threads` snapshots and cursors for status.
2. Keep at most one phase implementing. Readiness acknowledgements from queued tasks do not satisfy their phase gates.
3. When the active phase reports completion, inspect its diff, tests, coverage configuration/report, and recorded functional evidence. Reproduce relevant checks and use Chrome for live behavior as needed. Return any defect to that same task for a failing regression test and fix.
4. Integrate only validated work into the coordinating checkout without discarding unrelated edits. Fast-forward to the completed phase commit when possible. If coordinator-only documentation commits require a non-conflicting merge, preserve both histories.
5. Mark the phase complete in the plan index and release exactly the next phase with the integrated predecessor commit hash. Tell the next task to fast-forward its worktree to that commit before editing. Detached worktrees may create a `codex/` branch first.
6. After Phase 5 passes, report the finished app, actual coverage, browser validation, and any limits to the user. Stop any temporary coordinator wake-up.

## Current gate

Waiting for pending task setup to resolve and Phase 0 to implement/validate. No application code has been validated yet. Chrome connection succeeded in the coordinator; future tasks must establish their own skill-compliant browser sessions.
