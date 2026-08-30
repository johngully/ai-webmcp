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
- [ ] **P5.2 — Establish the baseline and shared tokens.** Capture the current home, survey, success, management, and dialogs at desktop/phone widths. Implement the research palette and a consistent type/spacing/radius/control scale in the existing CSS. Completion criterion: all surfaces use the shared system; black/gray primary and secondary states are distinguishable; text and control contrast are measured.
- [ ] **P5.3 — Restyle the shell and welcome page.** Use a slim header with the three current destinations, a quiet active state, an editorial welcome, and a clear rounded primary action. Completion criterion: branding, skip navigation, mobile wrapping, and keyboard focus work without unnecessary menus or a full documentation sidebar.
- [ ] **P5.4 — Restyle both survey steps and success.** Use a focused form column, clear current/completed step indicator, evenly sized ordered NPS choices, consistent labels/errors, secondary Back and primary Next/Submit. Make the returned ID the success-state anchor. Completion criterion: all fields, endpoints, statuses, pending/disabled states, and draft navigation remain usable at narrow widths and enlarged text.
- [ ] **P5.5 — Restyle management and dialogs.** Use a wider working canvas, wrapping filter toolbar, understated semantic table, visible row selection and scoped bulk-action strip, and restrained white dialogs. Completion criterion: search/filter/clear, empty/error states, long text, details, single/bulk cancel/confirm, focus trapping/Escape/return focus, and keyboard table scrolling remain intact.
- [ ] **P5.6 — Integrate assistant and accessibility states.** Style availability, unavailable/error, and successful tool-result messages as quiet but readable supporting UI. Completion criterion: announcements, validation, selected states, and focus are understood without color alone; 44px hit targets remain the app goal; reduced-motion behavior is respected.
- [ ] **P5.7 — Validate visually and functionally.** Use Chrome on a production build and inspect before/after screenshots for every mapped surface and meaningful state at desktop and phone widths. Check 320px, 390px, 768px, and 1280px+ layouts, 200% text enlargement, and a reflow equivalent. Completion criterion: no clipped required content, no page-level horizontal overflow, and no lost keyboard action; a bounded accessible table scroll region is allowed. Record screenshots, measured contrast, viewport dimensions, actions, and outcomes.
- [ ] **P5.8 — Pass the regression and commit gate.** Use TDD at the approved public UI/WebMCP seams for changed behavior and failing regression tests before defect fixes. Pure visual changes use reviewed visual evidence rather than CSS-class/token assertion padding. Run format, types, all unit/integration tests, production browser tests, real server-function test, coverage, and build. Completion criterion: all meaningful flows pass, all four coverage metrics remain above 85% with unchanged scope/thresholds, and one scoped styling commit includes implementation, tests, and phase evidence.

## Design guardrails

The research token table is the starting point: `#ffffff` page, `#f9f9f9`/`#f3f3f3` supporting surfaces, `#0d0d0d` primary text, `#5d5d5d` secondary text, `#181818` primary action, and a 4px-based spacing scale. Pale decorative rules are not sufficient input boundaries; retain stronger control outlines and explicit selected/focus states. Prefer 16px form text, a roughly 42rem form measure, and a wider management measure. Adapt spacing to the small app instead of copying the reference's full information architecture.

Use isolated synthetic data for testing and preserve prior previews/data. Native browser execution is still unverified: the confirmed WebMCP lane is the real 5.0.1 polyfill and same-origin contributor client. Styling must not change that contract or its honest documentation.

## Handoff

Record the scoped commit in the task handoff, actual checks and four coverage values, production URL/data isolation, before/after visual evidence, defects and red/green regressions, font/dependency decision, and any remaining limitations. Only the coordinator may accept the phase and release Phase 6.
