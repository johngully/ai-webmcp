# Phase 6 final evidence

Captured 2026-08-30 America/Chicago (stored response timestamps are UTC, 2026-08-31). Accepted application source: `8566f84a321d8265511f6b6957d5b695e9e62c43`. Full commands, outcomes, versions and limits: [final phase record](../../plan/phase-6-final-verification.md).

## Live Chrome

Google Chrome 152.0.7977.64 operated through the Chrome plugin. App [3114](http://127.0.0.1:3114/), contributor client [3115](http://127.0.0.1:3115/__verification__/webmcp), isolated data `/private/tmp/ai-dev-days-final-data-aZrT6n/surveys.jsonl`. Both run the fresh source snapshot `/private/tmp/ai-dev-days-final-checkout-JEEnyl`. Retained matching responses: manual **48G-LRE**, polyfill **FN8-VRY**. Disposable long record **HJ3-7FM** was confirmed deleted. The coordinator deleted the later bulk-audit records **7PX-HLJ** and **SZS-529** through Chrome after direct user approval in the parent task. This task independently reloaded management and checked the file: exactly the matching pair remains, with zero selected and no open dialog. The original action-time block was respected; this task performed no further deletion after the coordinator completed it. None of the earlier phases' records were targeted.

All names and addresses are fictional. Full-page images may be taller than the 900px viewport; dialogs are viewport captures. Temporary viewport overrides were reset after inspection.

| State                                                                    | Evidence                                                                                                                                                            |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Styled home, 1280px                                                      | [Home](chrome-home-1280.png)                                                                                                                                        |
| Required feedback, 1280px                                                | [Errors](chrome-required-errors-1280.png)                                                                                                                           |
| Manual saved ID, 1280px                                                  | [Success](chrome-manual-success-1280.png)                                                                                                                           |
| Real-polyfill schema and result, contributor client                      | [Tool result](chrome-polyfill-result-1280.png)                                                                                                                      |
| Complete details, 390px                                                  | [Details](chrome-details-390.png)                                                                                                                                   |
| Selected pair and bulk dialog, cancelled                                 | [Bulk cancellation](chrome-bulk-cancel-390.png)                                                                                                                     |
| Inclusive filters with no matching records                               | [No matches](chrome-no-matches-390.png)                                                                                                                             |
| Long answers at 320px                                                    | [Delivery](chrome-long-delivery-320.png), [scrolled details](chrome-long-details-scrolling-320.png), [details bottom and Close](chrome-long-details-bottom-320.png) |
| Final bulk dialog before coordinator deletion, default 1512×806 viewport | [Pre-deletion confirmation](chrome-bulk-confirmation.png)                                                                                                           |
| Disposable single-delete dialog at 320px                                 | [Confirmation](chrome-single-confirm-320.png)                                                                                                                       |
| Two retained responses after deletion                                    | [320px](chrome-management-retained-320.png), [1280px](chrome-management-final-1280.png)                                                                             |
| Empty file, separate port 3117, no writes                                | [No responses yet](chrome-empty-320.png)                                                                                                                            |

## Live read-only visual fixture

[Fixture source](visual-fixture.mjs) serves the same production bytes on loopback port 3116, applies 200% root text through the stylesheet, and supplies the existing insecure-context condition to show unavailable assistant status. Every non-GET is delayed 15 seconds and rejected with 503; no submission reaches the app. It preserves browser headers for real management GETs. It changes no browser settings or application source. Start with `node docs/evidence/phase-6/visual-fixture.mjs` while app 3114 is running; stop with Ctrl+C. It was stopped after the audit.

At 320px the measured root font was 32px on each inspected route, page scroll width was 320px, and the enlarged details dialog's client/scroll widths both measured 248px. The initial omitted-header fixture caused Forbidden on a management read; the corrected fixture recheck passed without changing the app's protection.

- [Home and assistant unavailable](chrome-home-unavailable-320-200.png)
- [Required errors](chrome-errors-320-200.png)
- [Pending save: disabled controls and stay-on-page status](chrome-pending-320-200.png)
- [Rejected save: answers retained, controls restored](chrome-recovery-320-200.png)
- [Management](chrome-management-320-200.png)
- [Scrollable details and reachable Close](chrome-details-320-200.png)

The final read-only reload after the coordinator's approved bulk deletion is captured in [the retained comparison pair](chrome-after-approved-bulk-deletion.png). It shows exactly two responses, zero selected, and the ordinary available-assistant status. The coordinator's action-time success announcement is reported in the phase record; this screenshot documents the independently verified persisted outcome after reload.

## Automated supporting captures

These come from the fresh repeated production suite (60/60 passed) using Chrome for Testing 151.0.7922.34, not the Chrome plugin. The complete report remains at `/private/tmp/ai-dev-days-final-report/index.html`. Each test used an isolated process/file/port.

- 320px with actual 32px root text: [success, desktop project](automated/success-enlarged-desktop.png), [success, mobile project](automated/success-enlarged-mobile.png).
- Keyboard-only unbroken long strings: [desktop details](automated/long-response-details-desktop.png), [mobile details](automated/long-response-details-mobile.png).
- Real 5.0.1 polyfill discovery evidence, including `polyfilled: true`: [desktop](automated/webmcp-lane-desktop.json), [mobile](automated/webmcp-lane-mobile.json).

## Measurements and scope

The coverage-path regression was reproduced in `/private/tmp/ai-dev-days-coverage-scope-2bmUyX/src/checkout`. The [before report](coverage-scope-before.json) includes two unexpected files, root `survey.config.ts` and `tests/survey.fixture.ts`; the new public-report assertion fails on exactly those entries. The [after report](coverage-scope-after.json), generated after anchoring the glob, contains exactly 21 application files. Only checkout prefixes were normalized in these stored reports. All real application-file metrics are unchanged; removal of the unrelated files restores 96.53/96.47/93.65/97.53%. The maintained assertion is now part of `pnpm test:coverage` and also rejects missing source files.

[Live responsive checks](chrome-responsive-checks.json) show home page widths of 320/390/768/1280 with no document overflow. Additional live form/management/dialog measurements and the repeated reflow regression are recorded in the phase document. At 320px the long normal-text dialog measured 280px client/scroll width, with 16px top and bottom gaps. The table intentionally scrolls inside its labeled region; the document itself does not scroll horizontally.

[Computed colors](chrome-computed-colors.json) match the [reference research](../../research/openai-visual-reference.md) and accepted Phase 5 design. [Recomputed contrast](contrast.json): primary 19.44:1, secondary ≥5.93:1, primary action 17.76:1, necessary input boundary 3.23:1, focus 5.39:1, error 7.88:1, success 6.20:1. Keyboard Apply focus was a 3px blue solid outline. Normal app warning/error logs were empty in the final clean tab; the rejected fixture request is expected fault evidence, not a normal-runtime error.

This is a functional/visual accessibility audit, not formal certification or measured screen-reader speech. Native WebMCP and external bridges remain unverified. No OpenAI fonts, logos, or affiliation claims are included. Local-only, unauthenticated, single-process persistence limits remain unchanged.
