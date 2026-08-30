# Phase 1 — Survey Domain and JSONL Persistence

## Outcome

All survey behavior sits behind shared, tested interfaces. A single-process JSONL adapter can safely create, find, filter, and delete AI Dev Days responses.

## Dependencies

- Phase 0 complete.
- `zod` and `nanoid` from [Dependencies](./DEPENDENCIES.md).
- Writable data path on one filesystem and one owning Node process.

## Tasks

- [x] **P1.1 — Define survey constants and types.** Add the five fixed talks, three gifts, rating range, stored response, new-response input, and filter types in client-safe modules. Completion criterion: routes, server code, and tests can import these definitions without importing Node-only code.
- [x] **P1.2 — Define shared schemas.** Validate required text after trimming, a talk and gift from the fixed lists, and an integer rating from 0 through 10. Define filter validation for name, optional talk, and optional minimum/maximum ratings. Completion criterion: invalid ranges and unknown enum values produce field-specific validation errors.
- [x] **P1.3 — Implement memorable survey IDs.** Generate six characters from an uppercase alphabet that excludes ambiguous `0/O` and `1/I`, render them as `XXX-XXX`, and normalize incoming IDs case-insensitively. Completion criterion: format, normalization, alphabet, and collision-retry behavior have deterministic tests.
- [x] **P1.4 — Define the repository seam.** Expose `create`, `find`, and `deleteMany`; implement a memory adapter for fast tests. Completion criterion: all repository behavior tests run against the memory adapter without filesystem knowledge.
- [x] **P1.5 — Implement JSONL reading and filtering.** Parse one response per non-empty line, attach line numbers to malformed-data errors, search participant names case-insensitively, filter exact talks, filter inclusive rating ranges, and return newest submissions first. Completion criterion: tests cover combined filters, empty files, blank lines, and malformed entries.
- [x] **P1.6 — Implement safe creation.** Create the parent directory lazily, serialize writes through an in-process queue, collision-check existing IDs, and append exactly one newline-terminated JSON object after successful validation. Completion criterion: concurrent creation tests yield distinct IDs and individually parseable lines.
- [x] **P1.7 — Implement safe deletion.** Normalize and deduplicate requested IDs, rewrite retained records to a temporary sibling file, rename atomically, and use the same write queue as creation. Completion criterion: single, multiple, missing, and concurrent create/delete cases preserve every non-deleted response.
- [x] **P1.8 — Implement survey operations.** Add validated server functions for submit, find, and bulk delete. Inject or resolve the repository only on the server. Completion criterion: manual UI and WebMCP callers can use the same submit function without importing filesystem code.
- [x] **P1.9 — Verify the module interfaces.** Run schema, ID, memory adapter, JSONL adapter, and server-operation tests against isolated files. Completion criterion: the public interfaces account for every success and failure mode used by later phases.

## Stored record

Every JSONL line represents this normalized shape:

```ts
type SurveyResponse = {
  id: string
  talk: Talk
  rating: number
  ratingReason: string
  swagGift: SwagGift
  name: string
  shippingAddress: string
  submittedAt: string
}
```

The display labels use “Primary reason for your rating” and “Shipping address.” Stored field names remain stable after Phase 1.

## Phase 1 validation evidence — 2026-08-30

Implemented only Phase 1 on `codex/phase-1-domain-storage`, fast-forwarded before
implementation to coordinator-approved predecessor
`63eb767dc932cf8d9b55f4446264db04198498e0`. No later UI, management, or WebMCP
implementation is included. The overall phase checklist is left to the coordinator.

### Interfaces delivered

- Client-safe constants, inferred types, survey/filter/stored-record/deletion
  schemas, field descriptions, and six-character ID generation/normalization.
  IDs are uppercase `XXX-XXX`; input also accepts compact IDs and either case.
  Random generation excludes `0`, `O`, `1`, and `I`.
- Memory and JSONL adapters implement the same `create`, `find`, and `deleteMany`
  seam. A shared contract suite runs each flow against both adapters. Time and
  random-ID factories are the only injected platform behavior.
- JSONL validates every nonblank record, reports malformed physical line numbers,
  creates parent directories lazily, and serializes operations per resolved path
  across adapter instances. Successful appends end in a newline. Deletion writes
  a temporary sibling, atomically renames it, and cleans up the temporary file.
  Reads also use the queue so they cannot observe an in-flight append.
- `createSurveyOperations(repository)` implements validated application operations.
  `survey.functions.ts` exposes real TanStack `submitSurvey`, `findSurveys`, and
  `deleteSurveys` functions. The server-only service resolves `SURVEY_DATA_FILE`;
  the JSONL and service modules are never browser imports after Start compilation.
  Callers pass `{ data: input }`; unfiltered `findSurveys()` needs no argument.

### Observed red-before-green slices

The TDD skill was read before implementation. The approved seams in `EXECUTION.md`
were retained. Each behavior below was run failing before its implementation,
then rerun successfully; additional contract checks exercise already-implemented
behavior without manufacturing failures.

| Slice                         | Observed red                                                             | Green evidence                                                                       |
| ----------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| Normalized complete survey    | Schema module missing                                                    | Parsed result equals the normalized fixture                                          |
| Validated filters             | `surveyFiltersSchema` undefined                                          | Trimmed name, optional filters, field-specific reversed-range error                  |
| Memorable IDs                 | ID module missing                                                        | Deterministic `444-444`, alphabet and mixed-case normalization                       |
| Memory create/find            | Adapter module missing                                                   | Normalized stored response, immutable returned copies, invalid input never stored    |
| Combined filters              | All rows returned instead of the two matching rows                       | Case-insensitive name, exact talk, inclusive min/max and newest-first results        |
| Collision retry               | Duplicate `K7M-4PD` returned                                             | Deterministic retry produces three distinct IDs                                      |
| Memory deletion               | `Not implemented`                                                        | Single/bulk/missing IDs, normalization, deduplication and concurrent create/delete   |
| JSONL reader                  | Adapter module missing                                                   | Missing/empty files, blank lines, malformed JSON and invalid-record line numbers     |
| JSONL creation                | `Not implemented`                                                        | Same create/filter/collision contract passes against real files                      |
| JSONL deletion                | `Not implemented`                                                        | Same deletion contract passes against real files                                     |
| Application operations        | Operations module missing                                                | Submit → reopen → filter → validate delete → delete flow                             |
| Configured server service     | Service module missing                                                   | Isolated custom data path survives repeated service resolution                       |
| Real server-function calls    | Browser cannot import the absent public function module                  | Browser RPC submit/find/delete and validation flow passes against a real Node server |
| Timestamp-ordering regression | Both adapters returned first-created response first for equal timestamps | Both adapters return last-created response first                                     |

Additional meaningful checks preserve 16 concurrent responses across two adapters
and mixed create/delete operations, reopen the JSONL through the repository seam,
append after a final record lacking a newline, and recover after malformed data
is repaired. No tests mock repository internals or query storage as a side channel;
malformed-data tests write fixtures, then observe behavior through the repository.

### Validation gate

```text
Commit: Phase-scoped commit hash supplied in the task's final handoff.
Worktree: /Users/john/.codex/worktrees/92e7/ai-webmcp
Tests and results:
  pnpm format:check — passed
  pnpm typecheck — passed
  pnpm test:coverage — 7 files, 23 tests passed, including all 4 foundation tests
  PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ai-webmcp-playwright pnpm test:e2e
    — 4 production desktop/mobile tests passed
  PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ai-webmcp-playwright pnpm test:server-functions
    — 1 real browser-to-Node operation flow passed; rerun after regression fix
Coverage (statements / branches / functions / lines):
  93.85% / 97.14% / 93.02% / 93.51%
  Thresholds remain 86 / 86 / 86 / 86; no new source exclusions.
Production build/start:
  pnpm build — passed; Nitro node-server .output/server/index.mjs emitted
  PORT=3101 pnpm start — listening at http://127.0.0.1:3101/
  Node v22.22.0; pnpm 10.33.0; Vite 8.2.2
Live Chrome validation:
  Chrome plugin, production build, http://127.0.0.1:3101/
  Home → Take survey → Manage responses → reload → Home, all passed.
  Correct headings and final URLs; expected Phase 2 and Phase 3 placeholders.
  Console warning/error log empty. DOM snapshots inspected; no screenshots used.
Regressions added:
  Equal submittedAt timestamps previously listed earlier submissions first.
  Failing regression reproduced in both adapters, then fixed with reverse
  insertion order before the stable timestamp sort. Repository/application
  tests and the real server-function flow passed again afterward.
Known limitations or blockers:
  No blockers. One Node process and one canonical file path are required.
  Cross-process writers and symlink aliases are unsupported.
  UI and WebMCP consumers remain intentionally queued for later phases.
```

Coverage includes all implemented `src` files and unimported source. The three
thin server-function wrappers remain measured at 0% by Vitest because they execute
in the separate browser/Node integration process; they are not excluded or mocked
to inflate coverage. Their real execution is verified by `test:server-functions`.
Global coverage passes even without credit for that separate process. The only
other uncovered branch propagates non-ENOENT filesystem read errors.

The standalone production smoke exercises the existing application shell. Because
Phase 1 deliberately adds no UI consumer, unused server-function modules do not
enter that shell's production graph yet. The separate Vite integration test imports
the public module and exercises actual compiled RPC stubs, framework validation,
server-only repository resolution, and real JSONL I/O. Later UI/tool phases should
statically import these functions, and validate their production interaction flows.

### Dependencies and operating evidence

Added and pinned only `zod@4.5.4` and `nanoid@6.0.1`; framework versions are
unchanged. The implementation was checked against current official
[TanStack server-function documentation](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions),
[Zod schema documentation](https://zod.dev/api), and
[Nano ID custom-alphabet documentation](https://github.com/ai/nanoid#custom-alphabet-or-size).
Start's current `.validator(schema)` API and client-safe static function imports
were confirmed against installed source and the real browser RPC test.

Tests create unique temporary directories or use disposable `test-results/` data.
No real survey data is committed. The production preview uses port 3101 and leaves
the predecessor's ports 3000/3100 untouched. Automated production tests use 4173;
the operation test uses 4174. The two browser-test commands run sequentially
because they share the ignored `test-results/` output tree.

Local listener/browser execution required sandbox escalation, as in Phase 0.
Existing upstream router circular-dependency and inherited color-environment
warnings remain non-fatal. A Chrome metadata probe could not access `navigator`
inside the plugin's restricted read-only scope; this was a tool limitation, not
an application error. The subsequent DOM and console inspection passed. No browser,
Codex, or global settings were changed.

## Coordinator acceptance — 2026-08-30

Accepted and integrated implementation commit
`e39cde6bad995286b187ab2b856f215743fdacba`. Independently inspected source,
repository contracts, regression tests, and coverage configuration. Reran
formatting, types, all 23 tests, coverage (93.85 / 97.14 / 93.02 / 93.51%),
four production browser tests, one actual browser-to-Node operation flow, and
production build; all passed. Chrome at `http://127.0.0.1:3101/` verified Home,
survey and management navigation, expected placeholder content, and no warning
or error logs. Phase 2 is released; later phases remain queued.
