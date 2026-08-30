# Phase 1 — Survey Domain and JSONL Persistence

## Outcome

All survey behavior sits behind shared, tested interfaces. A single-process JSONL adapter can safely create, find, filter, and delete AI Dev Days responses.

## Dependencies

- Phase 0 complete.
- `zod` and `nanoid` from [Dependencies](./DEPENDENCIES.md).
- Writable data path on one filesystem and one owning Node process.

## Tasks

- [ ] **P1.1 — Define survey constants and types.** Add the five fixed talks, three gifts, rating range, stored response, new-response input, and filter types in client-safe modules. Completion criterion: routes, server code, and tests can import these definitions without importing Node-only code.
- [ ] **P1.2 — Define shared schemas.** Validate required text after trimming, a talk and gift from the fixed lists, and an integer rating from 0 through 10. Define filter validation for name, optional talk, and optional minimum/maximum ratings. Completion criterion: invalid ranges and unknown enum values produce field-specific validation errors.
- [ ] **P1.3 — Implement memorable survey IDs.** Generate six characters from an uppercase alphabet that excludes ambiguous `0/O` and `1/I`, render them as `XXX-XXX`, and normalize incoming IDs case-insensitively. Completion criterion: format, normalization, alphabet, and collision-retry behavior have deterministic tests.
- [ ] **P1.4 — Define the repository seam.** Expose `create`, `find`, and `deleteMany`; implement a memory adapter for fast tests. Completion criterion: all repository behavior tests run against the memory adapter without filesystem knowledge.
- [ ] **P1.5 — Implement JSONL reading and filtering.** Parse one response per non-empty line, attach line numbers to malformed-data errors, search participant names case-insensitively, filter exact talks, filter inclusive rating ranges, and return newest submissions first. Completion criterion: tests cover combined filters, empty files, blank lines, and malformed entries.
- [ ] **P1.6 — Implement safe creation.** Create the parent directory lazily, serialize writes through an in-process queue, collision-check existing IDs, and append exactly one newline-terminated JSON object after successful validation. Completion criterion: concurrent creation tests yield distinct IDs and individually parseable lines.
- [ ] **P1.7 — Implement safe deletion.** Normalize and deduplicate requested IDs, rewrite retained records to a temporary sibling file, rename atomically, and use the same write queue as creation. Completion criterion: single, multiple, missing, and concurrent create/delete cases preserve every non-deleted response.
- [ ] **P1.8 — Implement survey operations.** Add validated server functions for submit, find, and bulk delete. Inject or resolve the repository only on the server. Completion criterion: manual UI and WebMCP callers can use the same submit function without importing filesystem code.
- [ ] **P1.9 — Verify the module interfaces.** Run schema, ID, memory adapter, JSONL adapter, and server-operation tests against isolated files. Completion criterion: the public interfaces account for every success and failure mode used by later phases.

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
