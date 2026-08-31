# AI Dev Days Survey Demo — Delivery Plan

This plan builds a local, single-process TanStack Start application that demonstrates two ways to complete the same AI Dev Days conference survey:

1. A browser agent inspects and operates a two-step human interface.
2. A WebMCP-capable agent gathers the same answers conversationally and invokes one structured tool.

Both paths use the same validation, submission, ID generation, and JSONL persistence modules. This keeps the comparison focused on interaction efficiency rather than separate implementations.

## Status tracking

The phase checklist below is the source of truth for phase completion. Each phase file is the source of truth for its task status.

- `[ ]` — not started
- `[ ] ... **IN PROGRESS**` — active work
- `[ ] ... **BLOCKED: reason**` — cannot proceed
- `[x]` — complete and its completion criterion has been verified

Check a phase here only after every task in its phase file is checked.

## Phases

- [x] [Phase 0 — Foundation](./phase-0-foundation.md)
- [x] [Phase 1 — Survey domain and JSONL persistence](./phase-1-domain-storage.md)
- [x] [Phase 2 — Manual multi-step survey](./phase-2-survey-flow.md)
- [x] [Phase 3 — Survey management](./phase-3-management.md)
- [x] [Phase 4 — WebMCP submission](./phase-4-webmcp.md)
- [x] [Phase 5 — Styling](./phase-5-styling.md)
- [x] [Phase 6 — Final verification](./phase-6-final-verification.md)
- [x] [Phase 7 — WebMCP availability control](./phase-7-webmcp-control.md) — **ACCEPTED: corrected automated checks passed; remaining manual Chrome checks WAIVED**
- [ ] [Phase 8 — WebMCP search and bulk deletion](./phase-8-webmcp-management.md) — **IN PROGRESS: released after Phase 7 integration**

The original verification work is preserved in commit `311155f` and its [pre-styling checkpoint evidence](./phase-5-verification-demo.md). On 2026-08-30 the user inserted styling as Phase 5; final verification moved to Phase 6 and must run against the restyled application.

Phases 0–6 are independently validated and integrated. Phase 6 is commit `910298314f4160421e8e0d6affa11e0784db62b5`; its final record includes the approved bulk-deletion check and coverage-scope regression. The user subsequently added Phase 7 for an actual app-wide WebMCP availability toggle. See the [comparison guide](../demo-guide.md) for the currently delivered manual-only and WebMCP test instructions and the [final evidence](../evidence/phase-6/README.md) for accepted screenshots and operating limits. Phase 7 documents the persisted disabled-runtime flow and passing automated checks; its remaining corrected-revision manual Chrome checks are explicitly waived by user-directed continuation, not claimed as passed.

See [Dependencies](./DEPENDENCIES.md) for the package inventory, runtime prerequisites, data dependencies, and phase graph.

## Phase graph

```text
Phase 0: Foundation
          |
          v
Phase 1: Domain and storage
       /          \
      v            v
Phase 2: Manual   Phase 3: Management
      |
      v
Phase 4: WebMCP
       \          /
        v        v
Phase 5: Styling
          |
          v
Phase 6: Final verification
          |
          v
Phase 7: WebMCP availability control
          |
          v
Phase 8: WebMCP search and bulk deletion
```

The diagram describes technical dependencies only. Execution is strictly sequential: Phase 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8. A later phase remains queued until the preceding phase passes the validation gate in [Execution rules](./EXECUTION.md).

## Fixed product decisions

- Conference name: **AI Dev Days**.
- Talk choices:
  - Building Reliable AI Agents
  - Multimodal Apps with Modern Models
  - Retrieval-Augmented Generation in Production
  - Building Agent-Ready Websites with WebMCP
  - Evaluating and Securing LLM Applications
- NPS rating is an integer from 0 through 10.
- Gift choices are Hoodie, Headphones, and Keyboard.
- Every survey field is required.
- Survey IDs contain six case-insensitive alphanumeric characters displayed as `XXX-XXX`, for example `K7M-4PD`.
- The application stores IDs in canonical uppercase and accepts either case when reading an ID.
- The management page has no authentication because this is a local demonstration.
- TanStack Table is omitted. A semantic HTML table plus ordinary React state covers the required filtering, selection, modal, and deletion behavior.
- The accepted WebMCP baseline exposes survey submission only. Phase 8 extends it with search and array-only deletion on management; this user-requested extension supersedes the earlier submission-only scope after its validation gate passes.
- Phase 7 adds a persistent, app-wide WebMCP toggle on management, defaulting to enabled. Disabled documents must not load the integration; manual submission remains available. This is runtime availability control, not authentication.
- The application uses plain CSS and native platform controls; it does not require a visual framework.
- Styling follows the researched OpenAI homepage/developer-docs visual language while retaining AI Dev Days identity. Use a system-font fallback unless an alternative font's redistribution license is verified; see [visual research](../research/openai-visual-reference.md).

## Target module seams

### Survey definition

One client-safe module owns field names, talk and gift constants, Zod schemas, normalized types, and WebMCP-compatible descriptions. UI routes, server functions, persistence, and tests import this module rather than redefining survey data.

### Survey repository

```ts
interface SurveyRepository {
  create(input: NewSurveyResponse): Promise<SurveyResponse>
  find(filters?: SurveyFilters): Promise<SurveyResponse[]>
  deleteMany(ids: string[]): Promise<number>
}
```

The production adapter stores JSONL. A memory adapter gives tests a fast second implementation at the same seam. Repository callers do not know about file reads, locking, temporary files, or collision checks.

### Survey operations

Server functions expose three application operations:

- `submitSurvey(input) -> { surveyId }`
- `findSurveys(filters) -> SurveyResponse[]`
- `deleteSurveys({ ids }) -> { deletedCount }`

The manual UI and WebMCP tool both call `submitSurvey`; they do not duplicate validation or persistence behavior.

## Intended repository shape

```text
data/
docs/
  plan/
src/
  routes/
  survey/
    survey.constants.ts
    survey.schemas.ts
    survey.types.ts
    survey-id.ts
    survey-repository.ts
    survey-repository.memory.ts
    survey-repository.server.ts
    survey.functions.ts
  webmcp/
    register-survey-tool.ts
    webmcp.client.ts
tests/
```

File names may change to match the generated TanStack Start conventions. The ownership and interfaces above should remain intact.

## Definition of done

The plan is complete when a fresh checkout can install dependencies, run all checks, submit surveys through both interaction paths, manage the JSONL-backed responses, and follow the documented side-by-side demonstration without undocumented setup.
