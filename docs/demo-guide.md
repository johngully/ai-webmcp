# Manual and WebMCP comparison

This contributor guide reproduces the two submission paths against an isolated local production process. The styled baseline was checked in [Phase 6](plan/phase-6-final-verification.md); [Phase 7](plan/phase-7-webmcp-control.md) adds a persisted runtime switch for a genuinely disabled comparison. Use only fictional answers. Normal application pages do not contain demonstration or development framing.

## Start an isolated session

Install and build as described in the [root setup](../README.md). In terminal A, from the repository root:

```sh
pnpm build
SURVEY_SESSION_DIR=$(mktemp -d /tmp/ai-dev-days-comparison-XXXXXX)
echo "$SURVEY_SESSION_DIR"
SURVEY_DATA_FILE="$SURVEY_SESSION_DIR/surveys.jsonl" PORT=3130 pnpm start
```

Retain the printed directory to inspect or preserve the results. A new directory keeps previous sessions untouched. In terminal B, from the same checkout:

```sh
SURVEY_APP_URL=http://127.0.0.1:3130 PORT=3131 pnpm verification:client
```

The second process binds only to loopback. It serves the checked-in `tests/fixtures/webmcp-client.html` at `/__verification__/webmcp` and proxies other requests to the isolated app, so its iframe and tool execute in the same origin. It owns no response storage. The ordinary production app returns 404 for that path; no client files are copied into `public/` or `.output/`, and `pnpm start` never starts this client.

Use a clean browser tab for each path. Do not inherit an unfinished draft. If using an agent, read its browser skill and observe any action-time approval request; the scripts are not permission to bypass one. They require no extension installation or global browser setting change. Stop terminal B and terminal A with Ctrl+C when done. Keep or remove only the disposable directory you created after the processes stop.

## Shared fictional persona

| Field            | Answer                                                        |
| ---------------- | ------------------------------------------------------------- |
| Talk             | Building Reliable AI Agents                                   |
| Rating           | 9                                                             |
| Primary reason   | Practical guidance I can apply to production agent workflows. |
| Gift             | Keyboard                                                      |
| Name             | Casey Morgan                                                  |
| Shipping address | 123 Example Lane, Chicago, IL 60601                           |

JSON tool input:

```json
{
  "talk": "Building Reliable AI Agents",
  "rating": 9,
  "ratingReason": "Practical guidance I can apply to production agent workflows.",
  "swagGift": "Keyboard",
  "name": "Casey Morgan",
  "shippingAddress": "123 Example Lane, Chicago, IL 60601"
}
```

## Manual script

First open `/survey` on your isolated app origin and turn **WebMCP** off. Wait for **WebMCP disabled.** and the refresh. Open a fresh survey tab; do not merely tell an agent to ignore WebMCP. Disabled fresh documents load neither the assistant integration nor the polyfill. The contributor client now reports `[]` on discovery and disables invocation while off. Existing active tabs update through the two-second polling check plus network/render time; suspended/offline tabs recheck on resume. An unfinished draft is retained. The server also rejects stale assistant calls while leaving manual submission available.

Open [the survey app](http://127.0.0.1:3130/) in a fresh tab. Read the introduction, activate **Start survey**, select the talk and radio **9**, enter the reason, then activate **Next**. Select **Keyboard**, enter the name/address, activate **Submit survey** once, and read the displayed ID. Do not double-submit or retry an uncertain result; check management first.

Copyable agent prompt:

> Use Chrome to inspect http://127.0.0.1:3130/ and complete one conference survey using only visible interface labels and controls. Use fictional Casey Morgan, Building Reliable AI Agents, rating 9, reason “Practical guidance I can apply to production agent workflows.”, gift Keyboard, shipping address “123 Example Lane, Chicago, IL 60601”. Start from Home, complete Step 1, proceed to Step 2, submit once, and report the survey ID. Follow your browser confirmation requirements. Do not use WebMCP, hidden page state, direct server requests, or test selectors. If the result is uncertain, stop and check responses instead of submitting again.

## WebMCP script: validated lane

Return to `/survey`, turn **WebMCP** on, and wait for **WebMCP enabled.** No server restart is needed. Allow other tabs to recheck, or open the contributor client fresh. A previously discovered tool is not proof of current availability: discover again and verify exactly one named tool before invoking. Re-enabling does not submit or retry anything.

Open [the contributor client](http://127.0.0.1:3131/__verification__/webmcp) in a fresh tab. Wait for **Assistant submission available** in the embedded app. Activate **Discover survey tools**, inspect the one tool's name, description, required fields, enums, and bounds. The JSON input is prefilled with the same persona. Once all answers are confirmed, activate **Submit through assistant** exactly once and read **Tool result** and the embedded app's status. No survey form field or survey step is used.

Copyable agent prompt:

> Use Chrome to open http://127.0.0.1:3131/__verification__/webmcp. This is the repository's contributor client for the installed WebMCP polyfill. Use fictional Casey Morgan, talk Building Reliable AI Agents, rating 9, reason “Practical guidance I can apply to production agent workflows.”, gift Keyboard, shipping address “123 Example Lane, Chicago, IL 60601”. Ask for any missing answer before submitting. Wait for assistant availability, discover submit_ai_dev_days_survey, inspect its schema, and check the six JSON answers. Invoke the discovered tool exactly once with Submit through assistant and report the returned survey ID. Do not navigate the embedded survey form, manipulate its DOM fields, call server functions directly, or retry an uncertain result. Follow your browser confirmation requirements.

This is an in-page client operated by a browser agent, **not an installed external WebMCP agent bridge**. The client reads `frame.contentDocument.modelContext`, discovers with `getTools()`, selects the named tool, and calls the actual installed API:

```js
const tools = await context.getTools()
const tool = tools.find(({ name }) => name === 'submit_ai_dev_days_survey')
const resultText = await context.executeTool(tool, JSON.stringify(answers))
const result = JSON.parse(resultText)
```

The pinned **5.0.1** polyfill takes JSON text and returns JSON text. The latest [draft](https://webmachinelearning.github.io/webmcp/) uses an object input for `executeTool`; do not blindly apply the snippet to a native context. The app preserves a native context when present, but native execution and external bridges have not been validated. The footer indicates registration availability, not end-to-end external agent compatibility. Live validation used Chrome 152 with the checked-in client; automated browser tests additionally assert real polyfill initialization. Do not install an unrelated extension or overwrite browser APIs to force compatibility.

## Persistence and reset

Both origins share the server-owned `<SURVEY_DATA_FILE>.webmcp.json` setting. It survives page reload and process restart, and is separate from response JSONL. Use the switch for normal changes. To reset only this configuration, stop your isolated server and rename its exact settings file to a backup name; an absent setting defaults to enabled. Keep the response file untouched. See [operating details](../README.md#webmcp-availability) for read/save failures, deferred refresh when drafts cannot be stored or a submission is unresolved, browser-native APIs, and the local-only/no-auth limitation.

The sample ports 3130/3131 must be unused. Pick different unused loopback ports if necessary; do not replace another session's production build or data. A separate checkout/snapshot avoids rebuilding `.output` beneath an existing preview.

## What was observed

Phase 7 historical live validation used separate ports 3120/3121 and new fictional data; those previews predate its polling correction. The corrected revision passed independent automated verification, and its remaining manual Chrome checks were explicitly waived by user-directed continuation, not passed. See its [evidence](evidence/phase-7/README.md). The earlier Phase 6 run below remains a historical checkpoint, not evidence of the new switch.

Final styled-app validation in Chrome on 2026-08-30 (America/Chicago) saved manual **48G-LRE** and tool **FN8-VRY**. The retained app is at [port 3114](http://127.0.0.1:3114/), with its [contributor client on 3115](http://127.0.0.1:3115/__verification__/webmcp). These are evidence from one run, not IDs to expect when rerunning. All six stored answers matched; both JSONL records had the same eight keys (six answers plus `id` and `submittedAt`). IDs and timestamps differed. The repeated automated comparison also asserts two distinct IDs, matching normalized answers, valid timestamps, and one POST from the tool invocation. A separate disposable long-record audit was deleted with confirmation; the comparison pair remains. The coordinator also confirmed bulk deletion of Disposable Bulk One/Two after direct user approval; an independent reload and file inspection verified that only the matching pair remains. The earlier NYS-Z9Y/G8T-B6V run is preserved in the [pre-styling checkpoint](plan/phase-5-verification-demo.md).

Counts below begin with the specified page loaded and end at success; they exclude browser setup, approval exchanges, subsequent management inspection, and internal asset/RPC traffic. They are workflow counts, not measurements of model effort or tokens.

| Observable step                    | Manual                                              | Validated in-page WebMCP client                                              |
| ---------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------- |
| App views inspected                | Home, Step 1, Step 2, success (4)                   | Embedded Home and its result (1 app page); contributor client also inspected |
| Survey answer controls changed     | 6                                                   | 0; one prefilled structured JSON payload reviewed                            |
| App buttons/links activated        | Start survey, Next, Submit survey (3)               | None                                                                         |
| Client controls activated          | None                                                | Discover survey tools, Submit through assistant (2)                          |
| Survey route transitions           | Home → Step 1 → Step 2 (2); success stays at Step 2 | 0                                                                            |
| Tool discovery requests            | 0                                                   | 1                                                                            |
| Structured survey tool invocations | 0                                                   | 1                                                                            |
| Created responses                  | 1                                                   | 1                                                                            |

The documented direct manual path uses nine semantic UI actions after loading Home (six field changes plus three activations); the repeated comparison test follows that path. The final live audit additionally exercised invalid Next, Back/Next, and a reload, so its total interaction count is higher. The contributor client used two activations after loading, with discovery separate from execution. Styling did not change these labels or steps. This does not claim that every external agent has the same interaction count, nor any token, time, or cost savings.

To compare without raw-file access, open **Manage responses**, filter **Name contains** by `Casey Morgan`, then open each ID's **Details**. Check every field and retain both records. Repeating either successful script adds another response. For a new clean comparison, start a new isolated data directory instead of deleting unrelated responses.

The **Talk**, **Minimum rating**, and **Maximum rating** filters combine with the name search after **Apply**; both rating endpoints are inclusive. Setting both ratings to `9` retains this pair. **Clear** removes filters. The displayed response count describes matching rows, while the selected count controls **Delete selected (N)**. On narrow screens, scroll the labeled response table horizontally or Tab to **Details**. **Close details** or Escape returns focus to the originating button. Single **Delete** and bulk **Delete selected (N)** open a dialog naming the affected records; **Cancel** or Escape preserves them. **Confirm deletion** permanently removes them, so use a separate disposable record for that exercise. [Final screenshots](evidence/phase-6/README.md) show the current controls and states.
