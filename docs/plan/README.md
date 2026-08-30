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
- [ ] [Phase 5 — Styling](./phase-5-styling.md) **IN PROGRESS**
- [ ] [Phase 6 — Final verification](./phase-6-final-verification.md)

The original verification work is preserved in commit `311155f` and its [pre-styling checkpoint evidence](./phase-5-verification-demo.md). On 2026-08-30 the user inserted styling as Phase 5; final verification moved to Phase 6 and must run against the restyled application.

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
```

The diagram describes technical dependencies only. Execution is strictly sequential: Phase 0 → 1 → 2 → 3 → 4 → 5 → 6. A later phase remains queued until the preceding phase passes the validation gate in [Execution rules](./EXECUTION.md).

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
- WebMCP exposes survey submission only. Management operations remain human-interface actions.
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
