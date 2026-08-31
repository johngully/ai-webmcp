import { expect, test, startServer } from '../support/browser.fixture'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { surveyInput } from '../survey.fixture'

test('off propagates to drafts and the separate client; fresh disabled pages load no integration; on restores one tool', async ({
  page,
  context,
  app,
  verificationURL,
}, testInfo) => {
  await page.goto('/survey/new?step=1')
  await expect(page.getByText('Assistant submission available.')).toBeVisible()
  const enabledScripts = await page.evaluate(() =>
    performance
      .getEntriesByType('resource')
      .map((entry) => entry.name)
      .filter((name) =>
        /survey-assistant|register-survey-tool|webmcp|polyfill|\/dist-/i.test(
          name,
        ),
      ),
  )
  expect(enabledScripts.length).toBeGreaterThanOrEqual(2)
  await page.getByLabel('Talk attended').selectOption(surveyInput.talk)
  await page.getByRole('radio', { name: '9', exact: true }).check()
  await page
    .getByLabel('Primary reason for your rating')
    .fill('Fictional Phase Seven draft retained across availability changes.')
  const client = await context.newPage()
  await client.goto(`${verificationURL}/__verification__/webmcp`)
  const frame = client.frameLocator('iframe')
  await expect(frame.getByText('Assistant submission available.')).toBeVisible()
  await client.getByRole('button', { name: 'Discover survey tools' }).click()
  await expect(client.getByLabel('Discovered tools')).toContainText(
    'submit_ai_dev_days_survey',
  )
  const management = await context.newPage()
  await management.goto(`${app.url}/survey`)
  const control = management.getByRole('switch', { name: 'WebMCP' })
  await expect(control).toBeChecked()
  const started = Date.now()
  await control.focus()
  await management.keyboard.press('Space')
  await expect(control).not.toBeChecked()
  await expect
    .poll(() => page.evaluate(() => Boolean(document.modelContext)))
    .toBe(false)
  await expect
    .poll(() =>
      client.frames()[1].evaluate(() => Boolean(document.modelContext)),
    )
    .toBe(false)
  const propagationMs = Date.now() - started
  await expect(page.getByLabel('Primary reason for your rating')).toHaveValue(
    'Fictional Phase Seven draft retained across availability changes.',
  )
  await client.getByRole('button', { name: 'Discover survey tools' }).click()
  await expect(client.getByLabel('Discovered tools')).toHaveText('[]')
  await expect(
    client.getByRole('button', { name: 'Submit through assistant' }),
  ).toBeDisabled()
  const fresh = await context.newPage()
  const requests: string[] = []
  fresh.on('request', (request) => requests.push(request.url()))
  await fresh.goto(`${app.url}/survey/new?step=1`)
  await expect(fresh.getByLabel('Talk attended')).toBeVisible()
  await fresh.getByRole('link', { name: 'Manage responses' }).click()
  await expect(fresh.getByText('WebMCP disabled.')).toBeVisible()
  expect(await fresh.evaluate(() => Boolean(document.modelContext))).toBe(false)
  expect(requests.filter((url) => enabledScripts.includes(url))).toEqual([])
  expect(
    requests.filter((url) =>
      /survey-assistant|register-survey-tool|polyfill|\/dist-/i.test(url),
    ),
  ).toEqual([])
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  await page.getByLabel('Thank-you gift').selectOption(surveyInput.swagGift)
  await page.getByLabel('Full name').fill('Fictional Phase Seven Manual')
  await page
    .getByLabel('Shipping address')
    .fill('70 Imaginary Way, Example City')
  await page.getByRole('button', { name: 'Submit survey' }).click()
  await expect(page.getByRole('status')).toContainText('Survey ID:')
  await management.reload()
  await expect(control).not.toBeChecked()
  await control.click()
  await expect(frame.getByText('Assistant submission available.')).toBeVisible()
  await client.getByRole('button', { name: 'Discover survey tools' }).click()
  await expect(client.getByLabel('Discovered tools')).toContainText(
    'submit_ai_dev_days_survey',
  )
  const tools = JSON.parse(
    (await client.getByLabel('Discovered tools').textContent())!,
  )
  expect(tools).toHaveLength(1)
  await client.getByLabel('Synthetic survey answers').fill(
    JSON.stringify({
      ...surveyInput,
      name: 'Fictional Phase Seven Assistant',
    }),
  )
  await client.getByRole('button', { name: 'Submit through assistant' }).click()
  await expect(
    client.getByRole('status', { name: 'Tool result' }),
  ).toContainText('"success":true')
  await management.reload()
  await expect(management.getByText('2 responses shown')).toBeVisible()
  await testInfo.attach('availability-lifecycle', {
    body: JSON.stringify(
      { propagationMs, enabledScripts, disabledRequests: requests, tools },
      null,
      2,
    ),
    contentType: 'application/json',
  })
  await testInfo.attach('availability-on', {
    body: await management.screenshot({ fullPage: true }),
    contentType: 'image/png',
  })
})

test('management retains disabled state after process restart without rewriting responses', async ({
  page,
}) => {
  const directory = await mkdtemp(join(tmpdir(), 'ai-availability-restart-'))
  const dataFile = join(directory, 'custom-responses.jsonl')
  let server = await startServer(['.output/server/index.mjs'], {
    SURVEY_DATA_FILE: dataFile,
  })
  try {
    await page.goto(`${server.url}/`)
    await expect(
      page.getByText('Assistant submission available.'),
    ).toBeVisible()
    const saved = await page.evaluate(
      async (input) => {
        const context =
          document.modelContext as import('@mcp-b/webmcp-types').ChromeModelContext
        const [tool] = await context.getTools()
        return JSON.parse(
          (await context.executeTool!(tool, JSON.stringify(input)))!,
        )
      },
      { ...surveyInput, name: 'Fictional Restart Attendee' },
    )
    await page.getByRole('link', { name: 'Manage responses' }).click()
    await page.getByRole('switch', { name: 'WebMCP' }).click()
    await expect(page.getByText('WebMCP disabled.')).toBeVisible()
    await server.close()
    server = await startServer(['.output/server/index.mjs'], {
      SURVEY_DATA_FILE: dataFile,
    })
    await page.goto(`${server.url}/survey`)
    await expect(page.getByText('WebMCP disabled.')).toBeVisible()
    expect(await page.evaluate(() => Boolean(document.modelContext))).toBe(
      false,
    )
    await expect(page.getByText('1 response shown')).toBeVisible()
    await expect(
      page.getByRole('row').filter({ hasText: 'Fictional Restart Attendee' }),
    ).toContainText(saved.surveyId)
  } finally {
    await server.close()
    await rm(directory, { recursive: true, force: true })
  }
})

test('turning off keeps an unsaved draft when browser storage is unavailable', async ({
  page,
  context,
  app,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error('Storage blocked for this test')
    }
  })
  await page.goto('/survey/new?step=1')
  await expect(page.getByText('Assistant submission available.')).toBeVisible()
  await page
    .getByLabel('Primary reason for your rating')
    .fill('Fictional answers must not be lost.')
  await expect(page.getByText(/Draft storage is unavailable/)).toBeVisible()
  const management = await context.newPage()
  await management.goto(`${app.url}/survey`)
  await management.getByRole('switch', { name: 'WebMCP' }).click()
  await expect(management.getByText('WebMCP disabled.')).toBeVisible()
  await expect(page.getByText(/Assistant availability changed/)).toBeVisible()
  await expect(page.getByLabel('Primary reason for your rating')).toHaveValue(
    'Fictional answers must not be lost.',
  )
  await expect
    .poll(() =>
      page.evaluate(
        async () => (await document.modelContext?.getTools())?.length ?? 0,
      ),
    )
    .toBe(0)
})

test('a failed setting save remains visible until the organizer checks the confirmed state', async ({
  page,
}) => {
  await page.goto('/survey')
  await expect(page.getByText('Assistant submission available.')).toBeVisible()
  await page.route('**/*', (route) =>
    route.request().method() === 'POST' ? route.abort() : route.continue(),
  )
  await page.getByRole('switch', { name: 'WebMCP' }).click()
  await expect(page.getByRole('alert')).toContainText('could not confirm')
  await page.waitForTimeout(2500)
  await expect(page.getByRole('alert')).toContainText('could not confirm')
  await expect(page.getByRole('switch', { name: 'WebMCP' })).toBeDisabled()
  await page.unrouteAll()
  await page.getByRole('button', { name: 'Check setting' }).click()
  await expect(page.getByText('WebMCP enabled.')).toBeVisible()
  await expect(page.getByText('Assistant submission available.')).toBeVisible()
})

test('a suspended page rechecks on resume and native browser APIs remain untouched on disabled documents', async ({
  page,
  context,
  app,
}) => {
  await page.goto('/survey/new?step=1')
  await expect(page.getByText('Assistant submission available.')).toBeVisible()
  await page
    .getByLabel('Primary reason for your rating')
    .fill('Fictional suspended draft')
  const session = await context.newCDPSession(page)
  await session.send('Page.setWebLifecycleState', { state: 'frozen' })
  const management = await context.newPage()
  await management.goto(`${app.url}/survey`)
  await management.getByRole('switch', { name: 'WebMCP' }).click()
  await expect(management.getByText('WebMCP disabled.')).toBeVisible()
  await session.send('Page.setWebLifecycleState', { state: 'active' })
  await page.bringToFront()
  await expect
    .poll(() => page.evaluate(() => Boolean(document.modelContext)))
    .toBe(false)
  await expect(page.getByLabel('Primary reason for your rating')).toHaveValue(
    'Fictional suspended draft',
  )
  const native = await context.newPage()
  await native.addInitScript(() => {
    Object.defineProperty(document, 'modelContext', {
      value: { nativeSentinel: true },
      configurable: false,
      writable: false,
    })
  })
  await native.goto(`${app.url}/survey`)
  await expect(native.getByText('WebMCP disabled.')).toBeVisible()
  expect(
    await native.evaluate(() =>
      Reflect.get(document.modelContext!, 'nativeSentinel'),
    ),
  ).toBe(true)
})

for (const outcome of ['confirmed', 'uncertain'] as const) {
  test(`availability refresh preserves a ${outcome} in-flight manual submission without retry`, async ({
    page,
    context,
    app,
  }) => {
    await page.goto('/survey/new?step=1')
    await page.getByLabel('Talk attended').selectOption(surveyInput.talk)
    await page.getByRole('radio', { name: '9', exact: true }).check()
    await page
      .getByLabel('Primary reason for your rating')
      .fill(surveyInput.ratingReason)
    await page.getByRole('button', { name: 'Next', exact: true }).click()
    await page.getByLabel('Thank-you gift').selectOption(surveyInput.swagGift)
    await page.getByLabel('Full name').fill(`Fictional Pending ${outcome}`)
    await page
      .getByLabel('Shipping address')
      .fill('70 Imaginary Way, Example City')
    let release!: () => void
    const waiting = new Promise<void>((resolve) => {
      release = resolve
    })
    let posts = 0
    await page.route('**/*', async (route) => {
      if (route.request().method() !== 'POST') return route.continue()
      posts++
      await waiting
      return outcome === 'confirmed' ? route.continue() : route.abort()
    })
    await page.getByRole('button', { name: 'Submit survey' }).click()
    await expect(
      page.getByRole('button', { name: 'Submitting…' }),
    ).toBeDisabled()
    const management = await context.newPage()
    await management.goto(`${app.url}/survey`)
    await management.getByRole('switch', { name: 'WebMCP' }).click()
    await expect(page.getByText(/Assistant availability changed/)).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Submitting…' }),
    ).toBeDisabled()
    release()
    const result =
      outcome === 'confirmed'
        ? page.getByText('Your survey has been saved.')
        : page.getByText(/We could not confirm your submission/)
    await expect(result).toBeVisible()
    await page.waitForTimeout(2300)
    await expect(result).toBeVisible()
    expect(posts).toBe(1)
    await management.reload()
    await expect(
      management.getByText(
        outcome === 'confirmed' ? '1 response shown' : '0 responses shown',
      ),
    ).toBeVisible()
  })
}

test('a stale production assistant request is rejected after off without saving another response', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.getByText('Assistant submission available.')).toBeVisible()
  const sent = page.waitForRequest((request) => request.method() === 'POST')
  await page.evaluate(
    async (input) => {
      const context =
        document.modelContext as import('@mcp-b/webmcp-types').ChromeModelContext
      const [tool] = await context.getTools()
      await context.executeTool!(tool, JSON.stringify(input))
    },
    { ...surveyInput, name: 'Fictional Stale Production Call' },
  )
  const stale = await sent
  await page.getByRole('link', { name: 'Manage responses' }).click()
  await expect(page.getByText('1 response shown')).toBeVisible()
  await page.getByRole('switch', { name: 'WebMCP' }).click()
  await expect(page.getByText('WebMCP disabled.')).toBeVisible()
  const response = await page.request.post(stale.url(), {
    headers: stale.headers(),
    data: stale.postData()!,
  })
  expect(await response.text()).toContain('disabled')
  await page.reload()
  await expect(page.getByText('1 response shown')).toBeVisible()
})

test('slow server replies still confirm a fresh disabled management page', async ({
  page,
  context,
  app,
}) => {
  await page.goto('/survey')
  await page.getByRole('switch', { name: 'WebMCP' }).click()
  await expect(page.getByText('WebMCP disabled.')).toBeVisible()
  const slowPage = await context.newPage()
  await slowPage.route('**/_serverFn/**', async (route) => {
    const response = await route.fetch()
    // Model a responsive but slow transport, longer than the polling interval.
    await new Promise((resolve) => setTimeout(resolve, 2500))
    await route.fulfill({ response })
  })
  await slowPage.goto(`${app.url}/survey`)
  await expect(slowPage.getByText('WebMCP disabled.')).toBeVisible({
    timeout: 7000,
  })
  await expect(slowPage.getByRole('switch', { name: 'WebMCP' })).toBeEnabled()
  expect(await slowPage.evaluate(() => Boolean(document.modelContext))).toBe(
    false,
  )
})
