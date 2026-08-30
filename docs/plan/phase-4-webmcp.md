# Phase 4 — WebMCP Submission

## Outcome

A WebMCP-capable agent can discover one AI Dev Days submission tool, collect all answers in one conversation, invoke the tool once, and return the same memorable survey ID as the manual path.

## Dependencies

- Phases 1 and 2 complete.
- `@mcp-b/webmcp-polyfill` and `@mcp-b/webmcp-types` installed.
- Shared new-survey schema and `submitSurvey` operation available.
- Secure same-origin browser context with native or polyfilled `document.modelContext`.

## Tasks

- [ ] **P4.1 — Initialize WebMCP on the client.** Load the polyfill only in the browser; allow it to stand down when native support exists. Completion criterion: `document.modelContext` is typed and available after hydration in the supported browser.
- [ ] **P4.2 — Define the tool interface.** Register `submit_ai_dev_days_survey` with a precise description and one object containing talk, rating, rating reason, gift, name, and shipping address. Completion criterion: every enum, required field, rating bound, and field description matches the shared survey definition.
- [ ] **P4.3 — Register with current lifecycle semantics.** Call `document.modelContext.registerTool(tool, { signal })` in the root client lifecycle and abort the signal during cleanup. Completion criterion: exactly one tool is registered after navigation and it is not duplicated by development remounts.
- [ ] **P4.4 — Execute through the shared submit path.** Validate tool input with the same Zod schema, call `submitSurvey` once, and return structured text containing success and the canonical survey ID. Completion criterion: one tool invocation creates exactly one record indistinguishable from a manual submission.
- [ ] **P4.5 — Describe mutation behavior.** Mark the tool as state-changing, non-destructive, and non-idempotent using annotations supported by the current draft/types. Completion criterion: discovery metadata does not imply that submission is read-only or safely repeatable.
- [ ] **P4.6 — Surface assistant availability.** Show a small assistant-submission status indicating available, unavailable, or temporarily unable to connect without blocking the manual flow. Show the returned ID in an accessible in-page notification when this page executes the tool. Completion criterion: the user can understand assistant availability and submission success using the product language in [Execution rules](./EXECUTION.md), without presenter or demonstration framing.
- [ ] **P4.7 — Handle failures explicitly.** Return validation and submission failures as useful tool results while preserving server-side details from disclosure. Completion criterion: invalid input cannot create a partial record and an agent receives enough information to correct the call.
- [ ] **P4.8 — Add contract tests.** Under the polyfill, discover the registered tool, inspect its schema, invoke it with all fields, and assert the response ID and stored record. Completion criterion: the test fails if the tool name, schema, registration lifecycle, return shape, or shared submission behavior drifts.

## Tool input

```ts
type SubmitAiDevDaysSurveyInput = {
  talk: Talk
  rating: number
  ratingReason: string
  swagGift: SwagGift
  name: string
  shippingAddress: string
}
```

## Tool result

```json
{
  "success": true,
  "surveyId": "K7M-4PD"
}
```

Use the current [WebMCP draft](https://webmachinelearning.github.io/webmcp/) during implementation. Avoid the deprecated `navigator.modelContext` interface in application code.
