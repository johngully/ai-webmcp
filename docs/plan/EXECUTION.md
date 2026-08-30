# Execution rules

These requirements supersede earlier sequencing and testing assumptions in the phase documents.

## Sequential delivery

Each phase has a separate Codex task. Execute Phase 0, 1, 2, 3, 4, then 5. Only one phase implements at a time. Queued tasks may read their plan and report readiness, but must wait for the coordinating task to release them after validation of their predecessor.

Each task uses its own Git worktree. Before a queued task begins, fast-forward its branch to the validated predecessor commit supplied by the coordinator. Preserve unrelated changes. Commit only the completed phase's scoped changes and return the commit hash, worktree path, and validation evidence. The coordinator integrates a validated phase before releasing the next.

## Phase commits

After a phase's validation passes, put its implementation, meaningful tests, regressions, and phase evidence into its own phase-scoped commit before handing it back. Keep later phases out of that commit. The coordinator integrates that commit into main before releasing the next phase; worktrees are only an implementation detail, not parallel phase work.

Preserve completed history. The user explicitly does not require retroactive commits or history rewriting for phases already completed without a separate commit. Phase 0 already has its own implementation commit, `355720e`.

Coordinator-only status and integration commits may remain separate. Report the implementation commit for each completed phase so the user can identify the actual delivered work.

## Test-driven development

Use the TDD skill and vertical red → green slices. Write a behavior test, observe the expected failure, then implement the minimum behavior to pass. Scaffold and generated configuration may precede tests so the test runner can execute.

The user-approved plan establishes these test seams:

- Public survey schemas and ID generation/normalization.
- Repository create, find, and delete operations, including persistence across reopen.
- Application submit, find, and delete operations.
- User-visible survey and management interactions.
- WebMCP tool discovery, schema, execution, and result.

Test meaningful successful flows, validation/recovery, and data integrity. Prefer real modules and isolated temporary files. Avoid testing private implementation details or inflating coverage with trivial assertions. A newly discovered defect gets a failing regression test before its fix, followed by the passing test and a recheck of the affected live flow.

## Coverage gate

Configure coverage in Phase 0. Enforce at least 86% for statements, branches, functions, and lines across implemented application code, which keeps coverage strictly above the requested 85%. Include untested application files. Exclude generated route trees, declarations, tests, build output, and configuration only with explicit rationale. Keep domain logic, event handlers, routes, and WebMCP handlers measured. Do not aim for 100% or chase every hypothetical edge case.

## Phase validation gate

Before marking a phase complete:

1. Run format checking, type checking, applicable automated tests, coverage, and production build. Record actual commands, results, and percentages.
2. Exercise functionality, not just compilation. For UI phases, use the Chrome plugin to operate the running app, inspect visible state, and verify the phase's meaningful flows. For domain/storage phases, exercise real persistence and server operations in integration tests plus an application smoke check.
3. Rerun existing regression flows. Preserve previously passing features and coverage.
4. Record defects and regression evidence in the phase document. Record the Chrome URL/build, actions, observed outcomes, and any screenshots used. Automated browser tests complement live Chrome validation.
5. Update task checkboxes only when their completion criteria pass. Leave blocked work unchecked with an explanation. The coordinator releases the next phase only after reviewing this evidence.

If Chrome is unavailable, follow the Chrome skill's recovery instructions and report the missing setup. Do not claim live validation or silently substitute another browser. A blocker in the required validation gate holds the next phase.

## Phase handoff template

Append this to the completed phase document:

```text
Commit:
Worktree:
Tests and results:
Coverage (statements / branches / functions / lines):
Production build/start:
Live Chrome validation:
Regressions added:
Known limitations or blockers:
```

The commit field may identify the submitted commit in the task's final response to avoid a self-referencing commit hash inside its own contents.
