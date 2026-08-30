# OpenAI visual reference for AI Dev Days

Research date: 2026-08-30. Scope: a complementary visual refresh of the existing conference survey, not an OpenAI-branded product or a pixel-for-pixel copy. Preserve all routes, form semantics, stored data, and WebMCP contracts.

## Sources and confidence

- [OpenAI homepage](https://openai.com/): inspected as rendered in Chrome by the coordinator at a 1512px viewport. The homepage's **Docs** link resolves to [OpenAI API documentation](https://developers.openai.com/api/docs); this resolves the user's duplicated reference URL.
- [Documentation stylesheet](https://developers.openai.com/_astro/PageLayout.llvf3Lqa.css): first-party CSS linked by that documentation page, fetched on the research date. Values below are declarations, not a claim that every component uses every token. This content-hashed URL may change; rediscover its replacement from the documentation page.
- [OpenAI design guidelines](https://openai.com/brand/): authoritative typography/identity description. Its full-guidelines link redirects to [an authenticated brand portal](https://brand.openai.com/auth/?referer=/). Public redistribution permission for OpenAI Sans was **not verified**.
- [Inter's creator](https://rsms.me/inter/) and [upstream license](https://github.com/rsms/inter/blob/master/LICENSE.txt): optional alternative font, not an OpenAI asset.

These are a dated website sample, not a published universal OpenAI design system. Browser appearance can vary with route, viewport, theme, and later releases. Proposed values below are AI Dev Days decisions unless explicitly identified as observed.

## Observed visual language

The homepage inspection found a white canvas, black text, a slim horizontal navigation, ample whitespace, a black rounded primary action and pale-gray secondary pills. The central prompt area appeared approximately 768px wide; that width is a visual estimate, not a measured design token. Editorial imagery appears farther down the page; a survey does not need to reproduce it. Coordinator Chrome measurements: body `17px` / approximately `28px`, weight `400`; “Recent news” heading `22px` / `27.72px`, weight `500`; textarea `16px` / `24px`. Computed font stack was `OpenAI Sans`, `OpenAI Sans Variable Scripts`, `sans-serif`. Body colors were `#fff` and `#000`. [Homepage source](https://openai.com/)

The documentation CSS declares OpenAI Sans with a system-sans fallback, a `0.25rem` spacing unit, and 400/500/600/700 weights. Light surfaces include `#fff`, `#f9f9f9`, and `#f3f3f3`; emphasis text is `#0d0d0d`, secondary text `#5d5d5d`, and primary solid actions `#181818`. General body text tokens are `16px/24px` and small text `14px/20px`. Docs-specific heading sizes override the general scale with 30, 26, 20, and 18px. The CSS also supports dark mode, rounded controls, outlined/soft/solid action variants, subtle borders, and a 30%-black modal backdrop. These facts inform the adaptations below; dark mode is not required for this revision. [Documentation stylesheet](https://developers.openai.com/_astro/PageLayout.llvf3Lqa.css)

Coordinator Chrome inspection of the documentation at 1512px corroborated white surfaces and a 240px sidebar. Measured body text was `16px/24px`, weight 400, tracking `-0.16px`; the page heading was `30px/42px`, weight 600, tracking `-0.6px`, color `#0d0d0d`. Supporting text measured `14px/20px`, color `#5d5d5d`. The rounded search control used `8px 16px` padding and a `9999px` radius. Visually, two horizontal header rows sit over a pale-gray introductory panel, black/gray actions and white bordered cards, with roughly 24–32px gaps. These are viewport-specific observations, not required dimensions for the survey. [Documentation page](https://developers.openai.com/api/docs)

OpenAI identifies its typeface as **OpenAI Sans**, with five core weights and corresponding italics. Access is directed through its full design guidelines. Do not infer permission to redistribute fonts from their publicly reachable CDN URLs. Keep the AI Dev Days name prominent; do not reuse OpenAI's wordmark, Blossom, imagery, or marketing copy, or imply endorsement. [Design guidelines](https://openai.com/brand/)

## Recommended adaptation

Use an editorial welcome page and a restrained, documentation-like working interface: white background, generous but purposeful spacing, near-black headings and primary actions, gray navigation/secondary surfaces, simple rules instead of nested cards, and limited semantic color. Reuse the existing plain CSS/component architecture. No styling framework or component package is needed.

Default to the existing **system font stack**: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`. This adds no asset dependency, network request, or license uncertainty. Use medium-weight headings and slightly tighter heading tracking to approach the reference's character. If consistent cross-platform metrics become important, self-host an official Inter release, retain its license/copyright notice, and record the version; do not hotlink it. Inter is distributed under SIL OFL 1.1. It is an alternative, not an exact OpenAI Sans match. [Creator and license information](https://rsms.me/inter/)

### Proposed design tokens

| Role                               | Proposed value                                                | Evidence / adaptation                                        |
| ---------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------ |
| Page / elevated surface            | `#ffffff`                                                     | Observed homepage and docs light surface                     |
| Quiet surface / hover surface      | `#f9f9f9` / `#f3f3f3`                                         | Docs neutral palette                                         |
| Text / secondary text              | `#0d0d0d` / `#5d5d5d`                                         | Docs emphasis and secondary tokens                           |
| Decorative separator               | `#ededed`                                                     | Docs gray token; not the sole boundary of an input           |
| Input / checkbox boundary          | `#8f8f8f`                                                     | Darker docs gray selected for discernible control edges      |
| Primary action / hover             | `#181818` / `#303030`, white label                            | Docs solid-action defaults                                   |
| Focus / informative link           | `#0169cc`                                                     | Docs blue token; use a 3px ring with offset, not color alone |
| Error / success text               | `#911e1b` / `#00692a`                                         | Docs semantic color tokens; accompany with explicit text     |
| Body / small text                  | `16px/24px` / `14px/20px`                                     | Docs type scale; keep form inputs at least 16px              |
| Welcome title                      | `clamp(2.25rem, 4vw, 3.5rem)`, 1.1 line-height, weight 500    | Adaptation of homepage editorial hierarchy                   |
| Working-page title / section title | `30–36px` / `20–24px`, weight 500–600                         | Adaptation of docs hierarchy                                 |
| Heading tracking                   | `-0.02em`; normal body tracking                               | Docs tight tracking token; verify chosen system font         |
| Spacing scale                      | `4, 8, 12, 16, 24, 32, 48, 64px`                              | Builds on docs 4px unit; reuse current scale                 |
| Page / form measure                | `72rem` maximum / `42rem` maximum                             | App-specific; management needs more width than a form        |
| Side gutters                       | 16px small, 24px medium, 32px wide                            | App-specific responsive adaptation                           |
| Radii                              | 8px controls, 12–16px panels/dialogs, pill CTAs               | App-specific subset of observed rounded patterns             |
| Controls / rows                    | 44px minimum control height; 48–56px table rows               | App-specific touch/readability targets                       |
| Modal treatment                    | White surface; restrained shadow; `rgb(0 0 0 / 30%)` backdrop | Backdrop from docs; elevation reserved for dialogs           |

Use CSS custom properties as the single token source. Tune final measured contrast and layout in Chrome; copying a source token does not establish accessibility.

### Apply the system to each surface

| Surface                  | Styling direction and behavior to preserve                                                                                                                                                                                                                                         |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shared shell             | Compact AI Dev Days text brand, slim horizontal navigation, quiet active indicator, white header and fine separator. Keep the skip link. Wrap navigation on small screens rather than introducing an unnecessary menu.                                                             |
| `/`                      | Clear editorial title, concise existing explanation, generous whitespace and one black rounded “Start survey” action. No oversized decorative hero, stock illustration, or OpenAI logo.                                                                                            |
| `/survey/new?step=1`     | Narrow reading/form column; compact two-step progress indicator; clear question grouping; evenly sized NPS choices. Keep the dropdown, 0–10 radio semantics, reason textarea, validation messages and Next behavior.                                                               |
| `/survey/new?step=2`     | Same column and rhythm; visible completed/current step distinction; gift, name and address remain in their current order. Back is secondary; Submit is primary. Keep all draft/Back/Next behavior.                                                                                 |
| Submission success       | Quiet confirmation with the short survey ID as the visual anchor, using tabular or monospace characters. Keep the real result announcement and existing next actions. No confetti or marketing copy.                                                                               |
| `/survey`                | Wide working canvas; title/count above a tidy wrapping filter toolbar. Flat semantic table with understated header, row rules, visible selected state and a scoped bulk-action strip. Name search, talk/rating filters, selection, empty/error/loading states remain discoverable. |
| Details / delete dialogs | White restrained overlay, clear title, label/value layout and readable address/reason wrapping. Separate destructive action styling from neutral cancellation. Preserve focus trap, Escape behavior, return focus, and confirmation scope.                                         |
| Assistant status         | Small, readable footer status aligned with the shell. Give availability/unsupported/error/success distinct explicit text; retain live result announcement. Do not make WebMCP availability compete with the primary survey action.                                                 |

Avoid a full documentation sidebar: three app destinations and two survey steps do not need the docs site's navigation density. Do not change WebMCP metadata, validation, persistence, or tool invocation behavior as part of styling.

## Accessibility and responsive acceptance

- Verify normal text at least 4.5:1, large text 3:1, and necessary component/state boundaries 3:1 against adjacent colors. Pale rules may decorate a layout but must not be the only way to identify an input or selected control. [W3C text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
- Keep 44px targets as the app's stronger usability goal, including NPS labels and checkbox hit areas. This is not the WCAG 2.2 AA minimum, which is 24px with specified exceptions. [W3C target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- Check 320px, 390px, 768px and 1280px+ layouts, 200% text enlargement, and a 400%-zoom/reflow equivalent. Keep ordinary page content free of horizontal scrolling. A wide data table may have a clearly bounded, keyboard-accessible horizontal scroll region; do not hide required columns. [W3C reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- On narrow screens, wrap the NPS scale into a clearly ordered grid without changing 0–10 order; stack filters and dialog actions where needed. Keep labels and endpoint meaning visible. Test long talk names, names, reasons and addresses.
- Retain visible keyboard focus, selected/invalid/disabled states, field labels and descriptions, native dialog behavior and live announcements. Avoid motion, or respect reduced-motion preferences. No status communicated by color alone.
- Validate every mapped surface in Chrome, including filled fields, errors, focus, selected rows, open dialogs, and unavailable assistant status—not just the empty home page. Keep all existing meaningful flow tests and coverage above 85%; add regression tests before fixing any discovered behavior problem.

## Open items for the styling phase

- Capture final before/after desktop and mobile evidence for all mapped surfaces; the research sample is not a visual acceptance test.
- Confirm the optional font choice only if the system-stack rendering is insufficient. Default is no new dependency.
- Keep any unrelated verification changes in their own phase/task. Styling acceptance includes functional regressions, but does not silently expand backend or WebMCP scope.
