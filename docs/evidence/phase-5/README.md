# Phase 5 visual evidence

Captured 2026-08-30 with fictional local survey data. Phase implementation and full check results are recorded in [the styling plan](../../plan/phase-5-styling.md).

## Chrome before and after

Baseline is the released predecessor `e5de4220927ce3dfb48d1f9a0a41c1a903df7656`. Main preview: `http://127.0.0.1:3110/`, isolated file `/private/tmp/ai-dev-days-styling-3110/surveys.jsonl`. Desktop captures use 1280×900 and phone captures 390×900. Full-page route captures can be taller; final dialog captures use the actual viewport. The final retained examples are Morgan Example (`UK9-MTF`, assistant) and Riley Example (`CLM-2M2`, manual). Earlier screenshots contain test records deleted during validation.

| Surface       | Before desktop                              | Before phone                            | After desktop                              | After phone                            |
| ------------- | ------------------------------------------- | --------------------------------------- | ------------------------------------------ | -------------------------------------- |
| home          | [desktop](before/home-desktop.jpg)          | [phone](before/home-phone.jpg)          | [desktop](after/home-desktop.jpg)          | [phone](after/home-phone.jpg)          |
| step-1        | [desktop](before/step-1-desktop.jpg)        | [phone](before/step-1-phone.jpg)        | [desktop](after/step-1-desktop.jpg)        | [phone](after/step-1-phone.jpg)        |
| validation    | [desktop](before/validation-desktop.jpg)    | [phone](before/validation-phone.jpg)    | [desktop](after/validation-desktop.jpg)    | [phone](after/validation-phone.jpg)    |
| step-2        | [desktop](before/step-2-desktop.jpg)        | [phone](before/step-2-phone.jpg)        | [desktop](after/step-2-desktop.jpg)        | [phone](after/step-2-phone.jpg)        |
| success       | [desktop](before/success-desktop.jpg)       | [phone](before/success-phone.jpg)       | [desktop](after/success-desktop.jpg)       | [phone](after/success-phone.jpg)       |
| management    | [desktop](before/management-desktop.jpg)    | [phone](before/management-phone.jpg)    | [desktop](after/management-desktop.jpg)    | [phone](after/management-phone.jpg)    |
| selection     | [desktop](before/selection-desktop.jpg)     | [phone](before/selection-phone.jpg)     | [desktop](after/selection-desktop.jpg)     | [phone](after/selection-phone.jpg)     |
| details       | [desktop](before/details-desktop.jpg)       | [phone](before/details-phone.jpg)       | [desktop](after/details-desktop.jpg)       | [phone](after/details-phone.jpg)       |
| delete-dialog | [desktop](before/delete-dialog-desktop.jpg) | [phone](before/delete-dialog-phone.jpg) | [desktop](after/delete-dialog-desktop.jpg) | [phone](after/delete-dialog-phone.jpg) |

## Additional Chrome states

| State                 | Desktop                                            | Phone                                          |
| --------------------- | -------------------------------------------------- | ---------------------------------------------- |
| filled-feedback       | [desktop](after/filled-feedback-desktop.jpg)       | [phone](after/filled-feedback-phone.jpg)       |
| delivery-errors       | [desktop](after/delivery-errors-desktop.jpg)       | [phone](after/delivery-errors-phone.jpg)       |
| management-final      | [desktop](after/management-final-desktop.jpg)      | [phone](after/management-final-phone.jpg)      |
| no-matches            | [desktop](after/no-matches-desktop.jpg)            | [phone](after/no-matches-phone.jpg)            |
| empty-management      | [desktop](after/empty-management-desktop.jpg)      | [phone](after/empty-management-phone.jpg)      |
| filter-error          | [desktop](after/filter-error-desktop.jpg)          | [phone](after/filter-error-phone.jpg)          |
| bulk-delete-dialog    | [desktop](after/bulk-delete-dialog-desktop.jpg)    | [phone](after/bulk-delete-dialog-phone.jpg)    |
| assistant-client      | [desktop](after/assistant-client-desktop.jpg)      | [phone](after/assistant-client-phone.jpg)      |
| assistant-unavailable | [desktop](after/assistant-unavailable-desktop.jpg) | [phone](after/assistant-unavailable-phone.jpg) |
| submission-error      | [desktop](after/submission-error-desktop.jpg)      | [phone](after/submission-error-phone.jpg)      |

[Skip-link focus](after/skip-focus-desktop.jpg) · [Keyboard table scrolling](after/table-keyboard-focus-phone.jpg)

The assistant-client images show the separate contributor client, its schema, and returned ID. The live app result announcement was also read and matched the ID. Assistant-unavailable and submission-error images use a temporary **read-only fault fixture**, not a claim that normal loopback production is unavailable: [fixture source](fixtures/assistant-unavailable.mjs). Run it with Node while the isolated app is on port 3110; it binds only to 127.0.0.1:3112, supplies the same insecure-context condition as the existing automated test, and rejects all non-GET requests. Stop it after inspection. Empty-state captures use the unchanged production build on port 3113 with a separate, initially missing data file. Both temporary fixtures were stopped.

## Automated supporting evidence

These are separate per-test isolated Chromium runs, not Chrome plugin captures. The 320px/200%-text flow verifies actual 32px root text after every navigation, with no page overflow and no dialog horizontal overflow. Existing tests cover long content, pending actions, unavailable/registration-error states, and real polyfill results.

- [assistant-registration-error-desktop](automated/assistant-registration-error-desktop.png)
- [assistant-registration-error-mobile](automated/assistant-registration-error-mobile.png)
- [assistant-result-desktop](automated/assistant-result-desktop.png)
- [assistant-result-mobile](automated/assistant-result-mobile.png)
- [assistant-unavailable-desktop](automated/assistant-unavailable-desktop.png)
- [assistant-unavailable-mobile](automated/assistant-unavailable-mobile.png)
- [delivery-enlarged](automated/delivery-enlarged.png)
- [details-enlarged](automated/details-enlarged.png)
- [feedback-errors-enlarged](automated/feedback-errors-enlarged.png)
- [home-enlarged](automated/home-enlarged.png)
- [long-response-details-desktop](automated/long-response-details-desktop.png)
- [long-response-details-mobile](automated/long-response-details-mobile.png)
- [management-enlarged](automated/management-enlarged.png)
- [submission-pending-desktop](automated/submission-pending-desktop.png)
- [submission-pending-mobile](automated/submission-pending-mobile.png)
- [success-enlarged](automated/success-enlarged.png)

## Measurements

- [Chrome width checks](responsive-checks.json): home, both steps, success, management, details, deletion; 320/390/768/1280px, no page overflow. 320px is the 1280px-at-400% reflow equivalent.
- [Computed CSS](computed-styles.json): system fonts; 16px form text; 48–50px controls; 44px navigation; the intended neutral text/action colors. NPS hit areas measured at least 44px wide and 64px high; row labels are 44×44px.
- [Contrast](contrast.json): primary text 19.44:1; secondary text at least 5.93:1 on used surfaces; primary-action text 17.76:1; input boundaries 3.23:1; blue focus ring 5.39:1 on white; error text 7.88:1; success text 6.20:1. Decorative separators do not serve as control boundaries.
- Final Chrome dialog center offset: 0.00390625px; phone details top/bottom gaps about 64.8px; bulk-confirmation gaps about 308.8px. The new browser regression failed before removal of the generic last-child margin rule and passes afterward.
- [Normal production warning/error log](browser-log.json): empty.

## Scope and limits

No OpenAI fonts, branding, images, or affiliation claims were introduced. No new dependencies or custom animation. Native WebMCP and an external bridge remain unverified; the tested lane is the real 5.0.1 polyfill with the same-origin client. The ordinary app remains local-only and single-process.

The earlier tool-reported extension-UI interruption was resolved after the user restarted Chrome and the task reconnected through the supported API. No visible popup or specific extension was established. Viewport overrides were reset and the final review page was left open.
