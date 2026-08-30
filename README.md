# AI Dev Days conference survey

A local TanStack Start application for talk feedback and thank-you gifts. Attendees can complete a two-step form or submit the same six answers through WebMCP. Organizers can filter responses, inspect details, and confirm single or bulk deletion. Both submission paths use the same validation, server operation, ID generation, and JSONL repository.

## Setup and development

Requires Node **22.12+** and pnpm **10+**. The lockfile pins compatible dependencies; pnpm **10.33.0** is specified in `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open [the local app](http://127.0.0.1:3000). Routes:

- `/` — conference introduction and navigation.
- `/survey/new?step=1` — talk, integer rating 0–10, and reason; Step 2 collects gift, name, and shipping address.
- `/survey` — response table, name/talk/inclusive rating filters, details, and deletion.

All six fields are required. Back/Next and refresh preserve an unfinished draft within the same tab. A successful submission shows an uppercase `XXX-XXX` ID and clears the draft. Assistant availability appears in the footer; an unavailable assistant does not disable the form. JavaScript is required for submission and management actions.

**Local only:** no authentication or authorization is implemented. Do not expose these ports to a network, deploy publicly, or use real attendee data for a demonstration. Use one Node process per JSONL file; do not run development and production against the same file. This is a single-process filesystem application, not a cluster or edge deployment.

## Production

From the repository root:

```sh
pnpm build
PORT=3100 pnpm start
```

Open [the production app](http://127.0.0.1:3100). `start` binds to `127.0.0.1` and runs `.output/server/index.mjs` with Nitro's `node-server` preset. Default port: 3000. Rebuild and restart after changes. Supply environment variables explicitly; production does not automatically read `.env`.

For both reproducible comparison scripts, use the [manual and WebMCP guide](docs/demo-guide.md). It includes the fictional persona, exact commands, agent prompts, observed interaction counts, and the separate contributor-only client. **Validated WebMCP execution is the installed 5.0.1 polyfill with a same-origin in-page client. Native execution and an external agent bridge are not validated.** No extra extension or browser flag is needed for that lane.

## Verification

```sh
pnpm format:check
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm exec playwright install chromium
pnpm test:e2e
pnpm test:server-functions
```

Run the two browser commands sequentially: the second uses a development build and both write test reports. `test:e2e` first builds production, then runs desktop (1280×800) and phone (375×812) cases, with up to four concurrent workers. Every browser test, including retries and server-function tests, gets its own Node process, OS-assigned loopback port, and new OS-temp JSONL directory. Teardown stops the process before removing its data. No browser test resets or writes `data/surveys.jsonl`. Test data does not depend on execution order or unique attendee names. To check isolation again:

```sh
pnpm test:e2e --repeat-each=2
```

If browser binaries are in a shared location, set `PLAYWRIGHT_BROWSERS_PATH` for both installation and execution. The validation machine used `/private/tmp/ai-webmcp-playwright`. The automated browser has no personal Chrome profile; prior live Chrome checks are recorded in the [pre-styling checkpoint](docs/plan/phase-5-verification-demo.md). [Phase 5 styling](docs/plan/phase-5-styling.md) and [Phase 6 final verification](docs/plan/phase-6-final-verification.md) track the visual revision and its acceptance.

Vitest covers public schemas/IDs, both repositories, operations, rendered routes, form interactions, management, and WebMCP discovery/execution. The [verification matrix](docs/verification.md) maps success and recovery/cancellation cases to files. Coverage measures **all** `src/**/*.{ts,tsx}`, including unimported application files, with **86% minimums** for statements, branches, functions, and lines. Only generated `src/routeTree.gen.ts` and declarations are excluded. Tests, configuration, CSS, and generated output are outside that source glob; contributor scripts do not contain application operations. Do not move application code to bypass coverage.

`pnpm format` formats the repository. Route generation runs before type checking and Vitest, so those checks work before the first build. A production build regenerates additional Start route declarations; generated-file changes after alternating these commands are expected.

## Data, backup, and reset

`SURVEY_DATA_FILE` accepts an absolute path or a path relative to the server's working directory. Default: `data/surveys.jsonl`. Directories and the file are created lazily on the first valid submission; a missing file reads as an empty list.

```sh
SURVEY_DATA_FILE=/tmp/isolated-surveys.jsonl pnpm dev
SURVEY_DATA_FILE=/tmp/isolated-surveys.jsonl PORT=3100 pnpm start
```

Each nonempty line contains six normalized answers, `id`, and ISO `submittedAt`. All `.jsonl` files and rewrite siblings are Git-ignored. Never force-add response data. Repository `create`, `find`, and `deleteMany` serialize access per resolved path inside one process. Deletion writes a temporary sibling and atomically renames it. Multiple processes, external writers, symlink aliases, and power-loss durability are outside the contract.

Before backup or reset, stop the owning process. Copy the **exact configured file** to a safe backup location. To start fresh without discarding anything, point the server at a new empty directory/file; alternatively rename the stopped server's file and retain it as a backup. Do not use a broad wildcard deletion. Deleting through management is permanent and requires confirmation; the app has no undo.

Malformed lines fail closed and identify a physical line number. Stop the server, preserve the original, then restore a known-good backup or repair only the indicated line before restarting. An interrupted append may leave a partial final line; earlier complete records remain recoverable. Failed atomic deletion preserves the original file. Check directory permissions and free disk space. Do not edit the JSONL while its server is running.

A lost network response can follow a successful save. Neither submission path has an idempotency key. **Check management before retrying an uncertain submission** or it may create a second response.

## Troubleshooting

| Symptom                                                     | Action                                                                                                                                                                                                      |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Port already in use                                         | Stop your own previous process or select another `PORT`; never terminate an unrelated process. The browser fixtures use ephemeral ports.                                                                    |
| Server silently exits or browser cannot launch in a sandbox | Allow the required localhost listener/browser execution through the environment's approval flow. Do not disable security controls.                                                                          |
| Assistant unavailable                                       | Use HTTP loopback or a secure same-origin context, wait for hydration, and check the footer. The manual form remains usable.                                                                                |
| Native context exists but client cannot execute             | Do not overwrite native APIs. Use a browser profile without native WebMCP for the pinned-polyfill comparison, or separately validate a compatible native client. No native result is implied by the footer. |
| Contributor client returns 502                              | Start the isolated production app and verify `SURVEY_APP_URL`. Use the proxy's client URL, not a file URL; discovery requires same origin.                                                                  |
| Tool input rejected                                         | Use the discovered enums and supply all six answers. Correct validation errors before one submission; do not guess missing personal information.                                                            |
| Save/delete/load fails                                      | Check the server terminal for the underlying storage error. Keep answers/selection, inspect records after ambiguous outcomes, and follow the backup/repair procedure.                                       |
| Draft cannot be saved                                       | Keep the tab open until submission; refresh or navigation can lose answers when session storage is blocked.                                                                                                 |
| Chrome plugin cannot connect                                | Follow the installed Chrome skill's recovery instructions. Do not substitute another browser or install extensions without authority.                                                                       |

## Architecture and references

Plain semantic HTML, native controls, a native `<dialog>`, and `src/styles.css` provide the UI. There is no TanStack Table, CSS framework, database service, or management WebMCP tool. Server functions expose `submitSurvey({ data })`, `findSurveys({ data })`, and `deleteSurveys({ data: { ids } })`; UI and tools import the same public module. Server-only modules own persistence.

- [Verification matrix](docs/verification.md), [comparison scripts](docs/demo-guide.md), and [delivery plan](docs/plan/README.md).
- [TanStack Start hosting](https://tanstack.com/start/latest/docs/framework/react/guide/hosting) and [server functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions).
- [Playwright fixtures](https://playwright.dev/docs/test-fixtures) and [parallelism](https://playwright.dev/docs/test-parallel).
- [WebMCP draft](https://webmachinelearning.github.io/webmcp/) and [polyfill source/docs](https://github.com/WebMCP-org/npm-packages/tree/main/packages/webmcp-polyfill).
