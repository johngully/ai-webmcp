# Phase task coordination

Coordinator task: `01a05438-d923-7361-a5b7-23d1025b27eb` (local).

Project: `a585b92d-22be-49e0-a549-8aca7adc0fb9` (WebMCP).

Initial implementation baseline: `4dac74f472a958fbd1c531ba3756ef0f17146068`.

Temporary coordinator heartbeat: `coordinate-ai-dev-days-build`, every five minutes in the coordinating task. Pause it after Phase 5 validates.

## Task creation

All six tasks were created on 2026-08-30. `list_threads` omitted these new tasks even after creation. The mapping below was recovered from the app's task-creation logs and verified with `read_thread` and `wait_threads`; use these real IDs directly. Do not recreate the tasks or confuse an omitted listing with unfinished setup.

| Phase | App title | Task ID | Release state |
| --- | --- | --- | --- |
| 0 | AI Dev Days — Phase 0: Foundation | `01a05463-0245-77f0-9229-d45bc1a42db9` | Implementing and validating |
| 1 | AI Dev Days — Phase 1: Domain and storage | `01a05463-0af0-7783-92a8-0ec217730054` | Ready; awaiting release |
| 2 | AI Dev Days — Phase 2: Manual survey | `01a05463-141f-70f3-ab93-af7f5c7f1921` | Ready; awaiting release |
| 3 | AI Dev Days — Phase 3: Management | `01a05463-237c-7372-ae9a-16648b437057` | Ready; awaiting release |
| 4 | AI Dev Days — Phase 4: WebMCP | `01a05463-2ef2-7692-a9f5-1c1d91461e14` | Ready; awaiting release |
| 5 | AI Dev Days — Phase 5: Verification… | `01a05463-4065-7b91-98f3-66d1b4dd3bfc` | Ready; awaiting release |

All tasks use host `local`. Worktree directory prefixes by phase: `ae76`, `92e7`, `d739`, `046d`, `46af`, `bcf3`, under `/Users/john/.codex/worktrees/<prefix>/ai-webmcp`.

## Coordinator procedure

1. Read `EXECUTION.md` and the current phase document. Use the verified task IDs above with compact `wait_threads` snapshots and cursors for status.
2. Keep at most one phase implementing. Readiness acknowledgements from queued tasks do not satisfy their phase gates.
3. When the active phase reports completion, inspect its diff, tests, coverage configuration/report, and recorded functional evidence. Reproduce relevant checks and use Chrome for live behavior as needed. Return any defect to that same task for a failing regression test and fix.
4. Integrate only validated work into the coordinating checkout without discarding unrelated edits. Fast-forward to the completed phase commit when possible. If coordinator-only documentation commits require a non-conflicting merge, preserve both histories.
5. Mark the phase complete in the plan index and release exactly the next phase with the integrated predecessor commit hash. Tell the next task to fast-forward its worktree to that commit before editing. Detached worktrees may create a `codex/` branch first.
6. After Phase 5 passes, report the finished app, actual coverage, browser validation, and any limits to the user. Stop any temporary coordinator wake-up.

## Current gate

Phase 0 is implementing and validating. Shell behavior tests pass. Its production browser test found that the generated server exits immediately without listening despite a successful build; the Phase 0 task is diagnosing/fixing this before acceptance. Coordinator also identified navigation drift (`/survey` and `/manage` instead of `/survey/new?step=1` and `/survey`) and requested a failing regression test, correction, and renewed functional checks. Phases 1–5 acknowledged readiness without editing files. Chrome connection succeeded in the coordinator; future tasks must establish their own skill-compliant browser sessions.
