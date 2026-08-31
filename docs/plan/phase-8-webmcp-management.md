# Phase 8 — WebMCP search and bulk deletion

Status: **IN PROGRESS — RELEASED AFTER PHASE 7 INTEGRATION**. Phase 7 implementation commit `4fa0f629c332fbd54af1d67981a18e2617e97bd2` passed independent corrected-revision automated validation; its remaining manual Chrome checks were explicitly waived under the user-directed exception in [Execution rules](./EXECUTION.md). The coordinator supplies the integrated baseline to the existing Phase 8 task before implementation. Phase 8 retains its own TDD, coverage, functional verification, and scoped-commit requirements.

## Outcome

Expose survey search and deletion through WebMCP using the same application operations as management. Keep survey submission unchanged. Every deletion accepts an array of survey IDs, including a one-element array for a single response.

## Existing behavior confirmed during planning

- `surveyFiltersSchema` and the shared `filterSurveys` function already support case-insensitive name substring matching, exact talk matching, inclusive minimum/maximum ratings, combined AND filters, and newest-first results. ID filtering is missing.
- `SurveyManagementOperations.deleteSurveys({ ids })`, the TanStack server function, and the application operation already use an array. Both repository adapters expose `deleteMany(ids)`. Single-row and selected-row UI actions already converge on `pendingDelete.map(response => response.id)` and that same bulk operation.
- Therefore no single-ID API replacement is currently needed. Preserve this contract and audit it again after the Phase 7 handoff. Do not add a parallel single-delete endpoint or loop through one delete request per ID.
- Accepted main still exposes only submission through WebMCP. Integrated Phase 7 supplies availability-aware loading, runtime unregistration, and a guarded assistant submission entry point. Phase 8 builds on the coordinator-supplied integrated baseline.

## Recommended scope and defaults

- Expose the two new management tools only while `/survey` is active and WebMCP is enabled. Submission remains available wherever it is today. Enabled management therefore discovers three tools; attendee routes discover only submission; disabled pages discover none. Route-scoped discovery reduces accidental exposure but is not authentication.
- The existing WebMCP toggle controls all three tools. Both new server entry points check server-owned availability for every invocation, including stale callers. An off/unconfirmed setting must disclose no search results and perform no assistant deletion. The ordinary management UI remains usable while WebMCP is off.
- Return search summaries containing `id`, `name`, `talk`, `rating`, and `submittedAt`. Do not include shipping addresses, free-text reasons, or gift details in tool results. Existing UI details remain unchanged. No separate details tool, pagination system, authentication, or public deployment is included.
- Permanent deletion requires confirmation of the exact IDs before the agent/client invokes the tool. The contributor client must present an explicit confirmation step, with cancellation producing no delete call. The tool description must tell other callers to obtain confirmation; annotations or an input Boolean are not proof of user consent. This is a caller interaction contract, not a new server authorization mechanism. Existing manual confirmation dialogs remain intact.
- Keep plain CSS, existing native controls/dialogs, local-only/no-auth/single-process operation, pinned packages, and JSONL storage. No new dependency or record migration is expected.

## Search tool contract

Name: `search_ai_dev_days_surveys`.

```ts
// All filters are optional and combine with AND.
type SearchInput = {
  id?: string
  name?: string
  talk?: Talk
  minRating?: number
  maxRating?: number
}

type SearchResult = {
  success: true
  count: number
  surveys: Array<{
    id: string
    name: string
    talk: Talk
    rating: number
    submittedAt: string
  }>
}
```

- ID is an exact match after the existing trimming, case normalization, and optional-hyphen normalization: `abc234`, `abc-234`, and `ABC-234` select the same ID. A malformed supplied ID is a validation error, not an ignored filter or broad search.
- Name retains trimmed, case-insensitive substring behavior. Talk accepts one of the five existing canonical titles. Ratings are integers from 0 through 10, inclusive; either bound may be omitted, and a reversed range is invalid. Rating zero must not be treated as absent.
- `{}` lists all response summaries in the existing newest-first order. No match is a successful empty result with `count: 0`; do not silently truncate results.
- Extend the shared search schema/helper and both repository adapters' public behavior. Do not implement a second filtering engine inside the tool. Adding a new visible ID filter to the management form is outside this request; existing UI filters must retain their behavior.
- Project summaries before returning from the new guarded server entry point. Use a client-safe summary type/schema rather than weakening the stored response schema.
- Mark the tool read-only and its returned attendee-supplied text as untrusted data. Keep clear descriptions even where the pinned polyfill omits annotation hints. Derive input JSON Schema from the shared input schema and test against the installed package.
- Invalid input returns a structured validation result with field errors. Disabled/unconfirmed availability and storage failures return distinct safe errors, not a misleading empty search. Do not expose filesystem paths or raw exceptions to callers.

Example input: `{ "name": "casey", "talk": "Building Reliable AI Agents", "minRating": 8, "maxRating": 10 }`.

## Delete tool contract

Name: `delete_ai_dev_days_surveys`.

```ts
type DeleteInput = { ids: string[] }
type DeleteResult = { success: true; deletedCount: number }
```

- One item and many items use the same array-only operation and one repository `deleteMany` call. No deletion by search filter, name, wildcard, or implicit current selection.
- Reuse `deleteSurveysSchema` and existing normalization. Validate the whole array before any mutation. Duplicate/case-varied IDs count once, unknown valid IDs are ignored, and an empty array is a safe zero-deletion result. Preserve atomic JSONL rewrite behavior and the original file on failure.
- Delegate to the existing bulk application operation through a WebMCP availability guard. Return the actual deletion count, not the requested array length. Do not infer per-ID outcomes from a separate, racy pre-read.
- Mark the tool destructive and non-read-only; conservatively retain a no-automatic-retry contract. Its description must say deletion is permanent and requires confirmation of the exact requested IDs. Do not automatically retry an uncertain mutation; re-search/inspect before deciding the next action.
- Use structured validation, unavailable, and deletion-failure results. A reported success must follow completion of the shared operation. After success, invalidate the current management results, prune removed selections, and preserve normal focus/status feedback without creating a second delete request.

Example inputs: `{ "ids": ["ABC-234"] }` and `{ "ids": ["ABC-234", "DEF-567"] }`.

## Dependencies and implementation order

1. Accept and integrate Phase 7, including its exact settings path, disabled-runtime guarantees, browser evidence, and phase commit.
2. Add exact-ID filtering to the shared schema/helper and public repository/application search behavior.
3. Add summary projection and guarded WebMCP search/deletion adapters over existing operations.
4. Register management tools on the management route under the shared availability lifecycle. Abort/unregister on route exit, off, and unmount; clean up partial registration failures and prevent duplicates on re-entry. Preserve native browser APIs and the disabled no-import/no-preload guarantee.
5. Extend the existing contributor client to select the management page, rediscover available tools, enter search/ID-array inputs, display results, and explicitly confirm deletion. Preserve submission comparison and keep the fixture outside the ordinary application build.
6. Validate, document, and commit the phase independently before coordinator integration.

Dependencies are the existing React/TanStack routing and server-function stack, Zod input/result schemas, repository filters and atomic bulk deletion, Phase 7 availability operations, pinned WebMCP polyfill/types, native confirmation UI, and current Vitest/Playwright/Chrome harnesses. No package installation or upgrade is planned.

## Tasks and completion criteria

- [x] **P8.0 — Document the requested extension and audited baseline.** Record tool contracts, existing array-only deletion, recommended defaults, dependencies, approved test boundaries, and sequencing. This is planning completion only, not implementation acceptance.
- [ ] **P8.1 — Accept the Phase 7 handoff.** Confirm its validated commit is integrated, fast-forward this phase's worktree to the coordinator-supplied baseline, and inspect any changes since planning. No implementation before release.
- [ ] **P8.2 — Add shared exact-ID search with TDD.** Observe a failing public schema/repository/operation behavior test, implement the smallest change, and verify combined filters, case/hyphen normalization, rating boundaries, no-match behavior, and unchanged sorting with both real repository adapters.
- [ ] **P8.3 — Deliver guarded WebMCP search with TDD.** Discover the shared schema, execute single/combined/empty searches, verify exact summary shape/count and omitted private detail fields, and exercise validation/storage/disabled errors through the public tool/application boundaries. Failed or disabled searches must not disclose records.
- [ ] **P8.4 — Deliver array-only WebMCP deletion with TDD.** Confirm the full existing UI → operation → repository chain stays bulk-only. Verify one/many IDs, normalization/deduplication, missing/empty IDs, all-or-nothing malformed input rejection, correct counts, confirmation cancellation, storage-failure preservation, and no automatic retry. Successful deletion is observable by subsequent public search and survives repository reopen.
- [ ] **P8.5 — Integrate lifecycle and management feedback.** Verify route entry/exit, repeated navigation, partial-registration recovery, and enabled → disabled → enabled for all tools. Stale search/delete calls after off must be rejected by the server; off must leave manual submission/search/deletion usable and preserve Phase 7 draft/refresh safeguards. Tool deletion refreshes the visible management list and selection correctly.
- [ ] **P8.6 — Extend and operate the contributor client.** Retain the old submission flow, add clearly labeled management discovery/search/delete controls with exact-ID confirmation, and verify reset/rediscovery when the iframe route or availability changes. Distinguish not-yet-discovered from no tools available; cover cancellation and make the next action clear.
- [ ] **P8.7 — Verify real production behavior in Chrome.** Use new isolated fictional data, an untouched new build/snapshot, and unused loopback ports. Search by ID/name/talk/rating and combinations, compare to management, cancel deletion, then confirm only exact approved disposable IDs for single- and multi-ID calls. Verify retained records, result counts, persistence after reload, disabled discovery/stale-call rejection, restored tools, keyboard/focus, and narrow layout. Respect fresh action-time approval gates; never consume earlier approvals again.
- [ ] **P8.8 — Update documentation and pass the release gate.** Add manual-versus-tool management scripts, current labels/results, array examples, safety/availability limits, actual supported browser lane, red/green regression evidence, and screenshots. Run formatting, types, unit/integration coverage, production build, desktop/mobile browser suite, and real server-function checks. Maintain all-source coverage strictly above 85% in every metric with existing 86% gates and source-scope assertion unchanged. Add a failing regression before fixing every discovered defect.
- [ ] **P8.9 — Commit and hand off for independent acceptance.** Commit only validated Phase 8 implementation/tests/docs/evidence, report its commit/worktree/results/coverage/URLs/limits, and leave overall acceptance/integration to the coordinator. Do not rewrite completed phases or mark pending Phase 7 work complete.

## Test boundaries and acceptance

Use the already user-approved public schema/ID, repository find/delete, application find/delete, visible management, and WebMCP discovery/execution/result boundaries from [Execution rules](./EXECUTION.md). Apply the TDD skill in vertical red → green slices. Prefer real modules and isolated temporary storage; do not test private registration bookkeeping or mock internal collaborators. Ask before introducing a genuinely different test boundary.

Acceptance requires three tools on enabled management, one on enabled attendee pages, none while disabled, correct combined search, one array-only delete path, exact-target confirmation/cancellation, no data disclosure or mutation through disabled stale tools, preserved manual flows, and independently verified phase evidence. Local unauthenticated operation and the supported pinned-polyfill lane remain explicit limitations; native/external bridge execution must not be claimed without separate evidence.

Append the standard [phase handoff](./EXECUTION.md#phase-handoff-template) after validation. No application code or survey data was changed during this planning turn.
