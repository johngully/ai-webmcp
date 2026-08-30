# Phase 5 — Integrated Verification and Demo Readiness

## Outcome

A fresh checkout can reproduce, verify, and present the manual and WebMCP flows side by side. The repository contains evidence that both paths create equivalent JSONL responses while the WebMCP path requires one structured browser tool invocation.

## Dependencies

- Phases 2, 3, and 4 complete.
- Playwright browser installed.
- A documented WebMCP-capable browser or agent bridge available for the live demonstration.
- All scripts from Phase 0 operational.

## Tasks

- [ ] **P5.1 — Complete the automated test matrix.** Cover schemas, IDs, repository adapters, operations, UI behavior, manual browser submission, management, and WebMCP contract execution. Completion criterion: each public interface and every destructive management action has at least one success test and one relevant failure or cancellation test.
- [ ] **P5.2 — Isolate browser data.** Configure Playwright to use a temporary JSONL file and reset it between tests without touching local demo responses. Completion criterion: repeated parallel-safe test runs produce identical results and preserve `data/surveys.jsonl`.
- [ ] **P5.3 — Audit accessibility.** Verify landmarks, headings, labels, descriptions, errors, NPS radio semantics, focus order, modal focus, status announcements, table headers, and keyboard-only operation. Completion criterion: every manual and management action can be completed without a pointer.
- [ ] **P5.4 — Audit responsive behavior.** Exercise the survey and management routes at phone and desktop widths, including long names, reasons, addresses, and talk titles. Completion criterion: no required control or value becomes unreachable or visually clipped.
- [ ] **P5.5 — Audit persistence safety.** Stress concurrent submission and deletion, malformed input, malformed stored lines, missing directories, collision retries, and interrupted mutation errors. Completion criterion: valid retained records remain parseable and error messages identify recovery steps.
- [ ] **P5.6 — Create the manual demo script.** Document a fixed sample persona and prompt for Codex to inspect the browser, complete Step 1, navigate to Step 2, submit, and report the ID. Completion criterion: the script succeeds from a clean browser session using visible interface semantics rather than test-only selectors.
- [ ] **P5.7 — Create the WebMCP demo script.** Use the same persona answers, direct the agent to gather any missing answers, discover `submit_ai_dev_days_survey`, call it once, and report the ID. Completion criterion: the script creates one response without form navigation or DOM-field manipulation.
- [ ] **P5.8 — Document the comparison.** Record observable steps for each flow: pages inspected, UI interactions, navigations, structured tool calls, and final records. Completion criterion: the comparison makes no unverified token-savings claim and shows that stored response shapes are equivalent.
- [ ] **P5.9 — Write operating documentation.** Add root setup, development, test, production, data-file, reset, browser WebMCP setup, and troubleshooting instructions. Completion criterion: a new contributor can run both demos without consulting chat history.
- [ ] **P5.10 — Run the release gate.** From a clean install, run format checking, type checking, unit/integration tests, browser tests, coverage, production build, production start, and both live demo scripts. Completion criterion: all commands pass and the final output records the actual browser lane and dependency versions used.
- [ ] **P5.11 — Audit product language.** Inspect every rendered route, document metadata, accessibility text, and WebMCP tool descriptions/results against [Execution rules](./EXECUTION.md). Completion criterion: the application consistently presents an AI Dev Days conference survey; demonstration instructions and development status exist only in contributor documentation.

## Fixed sample response

Use one sample response in both demo paths so their outputs are easy to compare:

```text
Talk: Building Reliable AI Agents
Rating: 9
Primary reason: Practical guidance I can apply to production agent workflows.
Gift: Keyboard
Name: Casey Morgan
Shipping address: 123 Demo Lane, Chicago, IL 60601
```

The demo records must receive different IDs because each run represents a separate survey submission. Compare all user-provided fields and the stored shape, not the generated identity or timestamp.
