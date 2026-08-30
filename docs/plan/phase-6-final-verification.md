# Phase 6 — Final Verification

## Outcome

The restyled application passes final functional, visual, accessibility, persistence, and reproducibility checks. A fresh checkout can run the app and compare manual and one-tool submissions using the written instructions.

## Dependencies and preserved work

Phase 5 styling must be validated and integrated before this task resumes. The original verification task finished commit `311155f080b92daac87bda6cb3cda35cc1f1b190` as the styling revision arrived. That commit is preserved and independently checked as a **pre-styling checkpoint**, not final acceptance of the new appearance. Its tests, isolated browser fixtures, recovery regressions, contributor client, and operating documents are reusable.

See [checkpoint evidence](./phase-5-verification-demo.md), [verification matrix](../verification.md), and [comparison guide](../demo-guide.md). Historical checked tasks establish what passed before styling; the unchecked tasks below establish what remains. Use the existing renamed verification task, not a duplicate task, and fast-forward to the coordinator's exact styling handoff commit before working.

## Tasks

- [ ] **P6.1 — Reconcile the handoff.** Review the styling diff, evidence, and any regressions against the checkpoint. Completion criterion: both histories are preserved, the task runs from the accepted styling commit, and the remaining checks reflect the delivered UI.
- [ ] **P6.2 — Rerun the clean-install release matrix.** Perform a frozen-lockfile clean dependency installation, formatting, types, unit/integration coverage, production build/start, all browser cases, and the real server-function check. Repeat the production browser suite to verify isolation. Completion criterion: commands pass with actual versions recorded, coverage exceeds 85% in all four metrics without relaxed exclusions, and local response data is untouched.
- [ ] **P6.3 — Revalidate the restyled journeys.** In Chrome, exercise manual steps/Back/draft/reload/submission, management search/talk/inclusive-rating filters, details, selection and destructive cancellation/confirmation, and one-call real-polyfill submission. Completion criterion: both submission paths create equivalent complete responses and IDs; previous regressions remain covered; actual execution lane is stated honestly.
- [ ] **P6.4 — Accept visual and accessibility quality.** Review Phase 5 screenshots and operate the restyled app with keyboard, narrow viewports, enlarged text, long records, open dialogs, invalid/pending/empty/selected states, and unavailable assistant status. Completion criterion: research direction is recognizable, text/control contrast passes, required content remains reachable, and focus/announcements work.
- [ ] **P6.5 — Refresh operating and comparison documents.** Update setup/troubleshooting, actual visible labels/actions, screenshot evidence, source attribution, and measured comparison steps after styling. Completion criterion: a contributor can run both documented paths without chat history, the client remains absent from the ordinary app build, and no token-savings/native-execution claim exceeds the evidence.
- [ ] **P6.6 — Complete final safety and product-language audit.** Recheck persistence-recovery regressions and isolated test data, rendered routes/metadata/accessibility/tool copy, and local-only operating limits. Completion criterion: ordinary AI Dev Days product language is consistent and no styling change altered schemas, stored fields, or tool behavior.
- [ ] **P6.7 — Record and commit final acceptance evidence.** Add a failing regression before any newly found defect fix, rerun affected live flows and all release checks, and commit scoped final-verification changes. Completion criterion: every task above has evidence, the worktree is clean, and the coordinator receives the commit, URLs, coverage, screenshots, and known limits for independent acceptance.

The [execution rules](./EXECUTION.md) apply unchanged. Stop only when required authority is missing; report the exact action and preserve completed checks. The coordinator deletes its temporary automation only after this phase and any later explicitly added refinement phase are validated.
