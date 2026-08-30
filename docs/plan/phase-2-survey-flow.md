# Phase 2 — Manual Multi-Step Survey

## Outcome

A user or browser-operating Codex agent can complete the AI Dev Days survey across two pages, move backward without losing data, submit once, and receive a memorable survey ID.

## Dependencies

- Phases 0 and 1 complete.
- `@tanstack/react-form` installed.
- Shared schemas and `submitSurvey` operation available.
- Browser `sessionStorage` available after hydration.

## Tasks

- [ ] **P2.1 — Define the survey route contract.** Add `/survey/new` with a validated `step` search parameter accepting `1` or `2`; missing or invalid values resolve to step 1. Completion criterion: direct navigation, refresh, Next, and Back all produce canonical URLs such as `/survey/new?step=1`.
- [ ] **P2.2 — Create the draft module.** Own the complete new-response shape in one TanStack Form instance and persist unfinished values to a versioned `sessionStorage` key. Completion criterion: client navigation and refresh retain valid draft values while corrupt or obsolete saved values reset safely.
- [ ] **P2.3 — Build Step 1.** Render the five-talk dropdown, an accessible 0–10 NPS radio group with endpoint labels, and “Primary reason for your rating” textarea. Completion criterion: Next is blocked with useful field errors until every Step 1 value is valid.
- [ ] **P2.4 — Build Step 2.** Render the gift dropdown, name input, and shipping-address textarea with Back and Submit actions. Completion criterion: Back returns to the populated Step 1 and Submit reports field-level errors for invalid Step 2 values.
- [ ] **P2.5 — Submit through the shared operation.** Revalidate the complete input on the server, prevent repeat clicks while pending, and handle recoverable submission errors without clearing the draft. Completion criterion: one successful click appends exactly one JSONL record.
- [ ] **P2.6 — Show completion.** Replace the form with a success panel displaying the canonical `XXX-XXX` ID and a “Start another survey” action that clears the draft. Completion criterion: the ID returned by the operation matches the stored record and is announced to assistive technology.
- [ ] **P2.7 — Cover non-happy paths.** Provide pending, server-error, direct-Step-2, browser-storage-unavailable, and resubmission behavior. Completion criterion: no path silently loses valid entered data and no pending action can be submitted twice from the UI.
- [ ] **P2.8 — Verify the manual flow.** Add UI tests for validation and preservation plus a browser test that completes Step 1, goes forward and back, submits Step 2, and verifies the response ID. Completion criterion: tests use accessible labels and roles that a browser agent can also inspect.

## Manual flow contract

```text
/survey/new?step=1
  -> validate survey feedback
  -> /survey/new?step=2
  -> validate gift and delivery details
  -> submitSurvey(all fields)
  -> success panel with XXX-XXX
```
