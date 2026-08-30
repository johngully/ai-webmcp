# Phase 3 — Survey Management

## Outcome

The unauthenticated local management page can find, inspect, select, and remove AI Dev Days responses without exposing implementation details of JSONL storage.

## Dependencies

- Phases 0 and 1 complete.
- `findSurveys` and `deleteSurveys` operations available.
- Semantic HTML table and native `<dialog>` support; TanStack Table is not used.

## Tasks

- [ ] **P3.1 — Define management search parameters.** Add `/survey` parameters for `name`, `talk`, `ratingMin`, and `ratingMax`, using the shared filter schema and canonical omission of empty values. Completion criterion: filters survive refresh, can be shared as a URL, and invalid rating bounds show a useful state rather than crashing the route.
- [ ] **P3.2 — Load filtered summaries.** Call `findSurveys` from the route and render newest responses first. Completion criterion: combined name, talk, and inclusive rating-range filters match repository tests.
- [ ] **P3.3 — Build the filter controls.** Provide name search, talk selection, minimum and maximum rating controls, Apply, and Clear. Completion criterion: keyboard submission updates the URL and Clear returns to the unfiltered list.
- [ ] **P3.4 — Build the semantic table.** Include selection, ID, name, talk, rating, gift, submitted time, and details action columns. Completion criterion: headers describe every column, narrow screens remain usable, and empty/no-results states are distinct.
- [ ] **P3.5 — Build survey details.** Open a modal showing every stored field, including the full rating reason and shipping address. Completion criterion: opening moves focus into the modal, Escape closes it, closing restores focus, and only the requested response is shown.
- [ ] **P3.6 — Implement selection.** Support individual checkboxes, select all currently visible rows, clear selection when selected records disappear, and show the selected count. Completion criterion: filtering cannot cause hidden records to be accidentally included by “select all visible.”
- [ ] **P3.7 — Implement single deletion.** Confirm the target ID and participant name, delete through the shared operation, invalidate the route, and report the outcome. Completion criterion: cancel changes nothing and confirm removes exactly the selected response from both UI and JSONL.
- [ ] **P3.8 — Implement bulk deletion.** Confirm the exact selected count, submit normalized IDs once, clear successful selections, and retain a useful error state on failure. Completion criterion: only selected IDs are removed and the UI count matches `deletedCount`.
- [ ] **P3.9 — Verify management behavior.** Add UI and browser tests for combined filters, detail focus behavior, selection, select-visible, cancellation, single deletion, and bulk deletion. Completion criterion: all mutations are reflected after route invalidation without a full browser reload.

## Privacy treatment

The summary table does not show the rating reason or shipping address. Those fields appear only after the user explicitly opens the details modal. Use ordinary organizer-facing language under the product-language requirement in [Execution rules](./EXECUTION.md). Document the unauthenticated, local-only deployment limit in operating documentation.
