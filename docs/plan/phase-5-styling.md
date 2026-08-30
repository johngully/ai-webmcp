# Phase 5 — Styling

## Outcome

AI Dev Days has a complementary look and feel to the OpenAI homepage and developer documentation: white and soft-gray surfaces, near-black typography and actions, restrained rounded controls, generous spacing, and clear working layouts. It remains an independent conference survey with unchanged manual, management, and WebMCP behavior.

## Dependencies and scope

- Phases 0–4 and the preserved pre-styling verification checkpoint `311155f080b92daac87bda6cb3cda35cc1f1b190` are integrated. Start only from the coordinator's exact release commit.
- Read [visual research](../research/openai-visual-reference.md) before selecting tokens or changing layout. It separates first-party observations from app-specific adaptations and contains the route/state map.
- Reuse plain CSS/custom properties, current React components, semantic controls/table, and native dialogs. Default to the existing system font stack: OpenAI Sans redistribution permission is unverified. No font download, UI framework, icon library, or new runtime dependency is needed.
- Preserve AI Dev Days branding and the [product-language and validation rules](./EXECUTION.md). OpenAI is a visual reference, not the app's name or claimed affiliation. No backend, schema, route, or tool contract redesign.
- Final acceptance follows in [Phase 6](./phase-6-final-verification.md); this phase still must pass its own full functional and visual gate before its implementation commit.

## Tasks

- [x] **P5.1 — Research and specify the direction.** Inspect both first-party references and document palette, typography, spacing, layout, font constraints, and route adaptations. Completion criterion: the linked research contains dated sources and concrete proposed tokens; coordinator inspected both rendered sites in Chrome.
- [x] **P5.2 — Establish the baseline and shared tokens.** Capture the current home, survey, success, management, and dialogs at desktop/phone widths. Implement the research palette and a consistent type/spacing/radius/control scale in the existing CSS. Completion criterion: all surfaces use the shared system; black/gray primary and secondary states are distinguishable; text and control contrast are measured.
- [x] **P5.3 — Restyle the shell and welcome page.** Use a slim header with the three current destinations, a quiet active state, an editorial welcome, and a clear rounded primary action. Completion criterion: branding, skip navigation, mobile wrapping, and keyboard focus work without unnecessary menus or a full documentation sidebar.
- [x] **P5.4 — Restyle both survey steps and success.** Use a focused form column, clear current/completed step indicator, evenly sized ordered NPS choices, consistent labels/errors, secondary Back and primary Next/Submit. Make the returned ID the success-state anchor. Completion criterion: all fields, endpoints, statuses, pending/disabled states, and draft navigation remain usable at narrow widths and enlarged text.
- [x] **P5.5 — Restyle management and dialogs.** Use a wider working canvas, wrapping filter toolbar, understated semantic table, visible row selection and scoped bulk-action strip, and restrained white dialogs. Completion criterion: search/filter/clear, empty/error states, long text, details, single/bulk cancel/confirm, focus trapping/Escape/return focus, and keyboard table scrolling remain intact.
- [x] **P5.6 — Integrate assistant and accessibility states.** Style availability, unavailable/error, and successful tool-result messages as quiet but readable supporting UI. Completion criterion: announcements, validation, selected states, and focus are understood without color alone; 44px hit targets remain the app goal; reduced-motion behavior is respected.
- [x] **P5.7 — Validate visually and functionally.** Use Chrome on a production build and inspect before/after screenshots for every mapped surface and meaningful state at desktop and phone widths. Check 320px, 390px, 768px, and 1280px+ layouts, 200% text enlargement, and a reflow equivalent. Completion criterion: no clipped required content, no page-level horizontal overflow, and no lost keyboard action; a bounded accessible table scroll region is allowed. Record screenshots, measured contrast, viewport dimensions, actions, and outcomes.
- [x] **P5.8 — Pass the regression and commit gate.** Use TDD at the approved public UI/WebMCP seams for changed behavior and failing regression tests before defect fixes. Pure visual changes use reviewed visual evidence rather than CSS-class/token assertion padding. Run format, types, all unit/integration tests, production browser tests, real server-function test, coverage, and build. Completion criterion: all meaningful flows pass, all four coverage metrics remain above 85% with unchanged scope/thresholds, and one scoped styling commit includes implementation, tests, and phase evidence.

## Design guardrails

The research token table is the starting point: `#ffffff` page, `#f9f9f9`/`#f3f3f3` supporting surfaces, `#0d0d0d` primary text, `#5d5d5d` secondary text, `#181818` primary action, and a 4px-based spacing scale. Pale decorative rules are not sufficient input boundaries; retain stronger control outlines and explicit selected/focus states. Prefer 16px form text, a roughly 42rem form measure, and a wider management measure. Adapt spacing to the small app instead of copying the reference's full information architecture.

Use isolated synthetic data for testing and preserve prior previews/data. Native browser execution is still unverified: the confirmed WebMCP lane is the real 5.0.1 polyfill and same-origin contributor client. Styling must not change that contract or its honest documentation.

## Handoff

Record the scoped commit in the task handoff, actual checks and four coverage values, production URL/data isolation, before/after visual evidence, defects and red/green regressions, font/dependency decision, and any remaining limitations. Only the coordinator may accept the phase and release Phase 6.

## Validation and handoff — 2026-08-30

**Ready for coordinator acceptance.** Started from exact released predecessor `e5de4220927ce3dfb48d1f9a0a41c1a903df7656`; implementation branch `codex/phase-5-styling`, worktree `/Users/john/.codex/worktrees/1048/ai-webmcp`. The scoped commit hash is returned in the task handoff. Phase 6 remains queued until the coordinator accepts and integrates this phase.

### Implementation and regression evidence

The existing system font stack and plain CSS now provide a white/gray/near-black palette, medium-weight headings, an editorial welcome, a 42rem survey column, a 72rem management canvas, a wrapping filter toolbar, and consistent actions, controls, focus, row selection, dialogs, IDs, and assistant text. No font assets, dependencies, package versions, backend operations, or WebMCP contracts changed. There is no custom animation; the stylesheet introduces no motion requiring a reduced-motion override.

Public UI red → green slices:

- **Survey progress:** the test first failed because the accessible `Survey progress` list did not exist. The ordered indicator then passed through current/completed states and Back/Next.
- **Visible response count:** the test first failed on missing `3 responses shown`. The count beneath the title then passed through one result, zero results, and Clear.
- **Step 2 navigation regression:** screenshot inspection showed the Take survey link lost its current-page marker on `step=2`. The new assertion failed with missing `aria-current="page"`. Ignoring the step search parameter for active matching passed; live Chrome verified `aria-current="page"` on Step 2.
- **Dialog placement regression:** final visual inspection exposed a generic last-child margin rule pushing native dialogs to the viewport bottom. The new public browser geometry assertion failed with a 16px center offset. Removing the unnecessary rule passed both desktop/phone regression runs. Live Chrome then measured a 0.00390625px offset, with about 64.8px top/bottom space around the phone details dialog and 308.8px around the bulk confirmation. Final dialog captures were refreshed.

`reflow.spec.ts` adds a user-facing flow at 320px with 200% root text through validation, both steps, success, management, and details. It reapplies the text override after route changes and verifies that it actually reached 32px. The test passed without a behavior fix. Visual review tightened small-screen gutters/button padding to avoid awkward word splitting. Existing browser tests now attach pending and assistant screenshots; no CSS-class/token assertion padding was added.

### Automated gate

All commands below passed after the last implementation change:

| Check                                                                                                                                                                                     | Result                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `pnpm format:check`                                                                                                                                                                       | Pass                                                               |
| `pnpm typecheck`                                                                                                                                                                          | Pass                                                               |
| `pnpm test:coverage`                                                                                                                                                                      | 58 tests, 12 files passed                                          |
| `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ai-webmcp-playwright PLAYWRIGHT_HTML_REPORT=/private/tmp/ai-dev-days-styling-report PLAYWRIGHT_HTML_OPEN=never pnpm test:e2e --reporter=list,html` | Production build and 30 desktop/phone cases passed                 |
| `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ai-webmcp-playwright pnpm test:server-functions`                                                                                                   | 1 real server-function case passed; run after the production suite |
| `git diff --check`                                                                                                                                                                        | Pass                                                               |

Coverage: **96.53% statements / 96.47% branches / 93.65% functions / 97.53% lines**. All-source inclusion, exclusions, and 86% thresholds are unchanged. Production is the normal Nitro build, with final stylesheet `styles-mDIeLGA1.css`. The report under `/private/tmp/ai-dev-days-styling-report` is supporting local evidence, not a shipped app asset.

### Live Chrome gate

[Evidence index](../evidence/phase-5/README.md) contains before/after desktop (1280×900) and phone (390×900) captures, computed colors/type/control sizes, contrast calculations, width measurements, and separate automated 200% text/long-content/pending/assistant screenshots. Chrome checked home, both steps, success, management, details, and deletion at 320/390/768/1280px without page-level horizontal overflow. The 320px viewport supplies the 1280px-at-400% reflow equivalent; 200% text was additionally exercised by automated Chromium. The response table is intentionally bounded and horizontally scrollable; a keyboard ArrowRight changed its scroll offset. NPS labels measured at least 44px wide and 64px high. Navigation measured 44px high; form text 16px; input/select height 48–50px. The skip link appeared with a 3px blue ring and moved focus to main.

Chrome exercised required errors on both steps, ratings 0 and 10, a 707-character unbroken-heavy reason, long name/address, Back/Next, refresh retention, success, combined case-insensitive name/talk/inclusive rating filters, invalid filters, Clear, no-match and empty states, hidden-selection pruning, row/select-all selection, details, single/bulk cancel and confirmation, Escape, focus return, and post-delete heading focus. Native dialogs kept underlying page controls out of the tab sequence; Chrome may cycle through its own toolbar. The final normal app warning/error log is empty.

Live data history on the isolated styling instance:

- Baseline manual `UGS-UJP` (Casey Example) was retained through restyling.
- Styled long-content manual `BGZ-S8B` was saved, inspected, and deleted through single confirmation.
- The real same-origin 5.0.1 polyfill saved `9HW-AP7`; the app announced the same ID. Bulk confirmation deleted exactly it and `UGS-UJP`, after a successful cancel/Escape check.
- Final review records remain: `UK9-MTF` (Morgan Example, assistant, rating 9) and `CLM-2M2` (Riley Example, manual, rating 0). Final dialog captures use these records and cancel without deleting them.

The normal app remains at `http://127.0.0.1:3110/`, with the sole data owner using `/private/tmp/ai-dev-days-styling-3110/surveys.jsonl`. The existing contributor client runs at `http://127.0.0.1:3111/__verification__/webmcp` with `SURVEY_APP_URL=http://127.0.0.1:3110`; it is outside the application build. Ports/data 3105, 3106, and 3108 were untouched. Temporary additional fixtures were stopped: port 3112 used production bytes plus the same insecure-context fault as the existing test, blocked every non-GET request, and captured unavailable/manual-navigation/rejected-save recovery states; port 3113 used a separate empty temporary data path for empty-state screenshots without deleting review data. The read-only fault fixture source is included with the evidence.

### Limits and resolved tooling interruption

The confirmed WebMCP lane remains the real 5.0.1 polyfill with a same-origin contributor client. Native execution and an external bridge remain unverified. The app is still local-only, unauthenticated, and single-process; these existing limits did not change.

Earlier, the Chrome tool reported an extension-UI blocker twice. The user reported no visible popup and restarted Chrome. The old connection became unavailable; supported reselection connected to the restarted Chrome instance. The stored-response check found only the baseline record, avoiding duplicate retry. All remaining live checks then completed. No specific extension or visible popup was established, no settings/extensions were disabled, and no alternate browser was used to bypass the guard. Occasional short selector/CDP deadlines were resolved by fresh DOM inspection before continuing. Browser viewport overrides were reset. No outstanding blocker remains.
