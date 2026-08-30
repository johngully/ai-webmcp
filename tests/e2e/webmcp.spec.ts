import { expect, test } from '../support/browser.fixture'
import type { ChromeModelContext } from '@mcp-b/webmcp-types'
import { createJsonlSurveyRepository } from '../../src/survey/survey-repository.server'
import { surveyInput } from '../survey.fixture'

test('production polyfill discovers one tool, corrects invalid input, and saves one response through the server', async ({
  page,
  app,
  browser,
}, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page.getByText('Assistant submission available.')).toBeVisible()
  const discovery = await page.evaluate(async () => {
    const context = document.modelContext!
    return {
      polyfilled: Reflect.get(context, '__isWebMCPPolyfill') === true,
      tools: (await context.getTools()).map(
        ({ name, inputSchema, annotations, description }) => ({
          name,
          inputSchema,
          annotations,
          description,
        }),
      ),
    }
  })
  expect(discovery.polyfilled).toBe(true)
  expect(discovery.tools).toHaveLength(1)
  expect(discovery.tools[0]).toMatchObject({
    name: 'submit_ai_dev_days_survey',
    annotations: { readOnlyHint: false },
    inputSchema: {
      type: 'object',
      required: [
        'talk',
        'rating',
        'ratingReason',
        'swagGift',
        'name',
        'shippingAddress',
      ],
    },
  })
  await testInfo.attach('webmcp-lane', {
    body: JSON.stringify(
      {
        browser: browser.version(),
        lane: '@mcp-b/webmcp-polyfill@5.0.1',
        discovery,
      },
      null,
      2,
    ),
    contentType: 'application/json',
  })
  const name = `Assistant Attendee ${testInfo.project.name}`
  const input = { ...surveyInput, name }
  const repository = createJsonlSurveyRepository(app.dataFile)
  const invalid = await page.evaluate(async (input) => {
    const context = document.modelContext as ChromeModelContext
    const [tool] = await context.getTools()
    return JSON.parse(
      (await context.executeTool!(
        tool,
        JSON.stringify({ ...input, rating: -1 }),
      ))!,
    )
  }, input)
  expect(invalid).toMatchObject({ success: false, error: 'validation' })
  expect(await repository.find({ name })).toEqual([])
  let posts = 0
  page.on('request', (request) => {
    if (request.method() === 'POST') posts += 1
  })
  const result = await page.evaluate(async (input) => {
    const context = document.modelContext as ChromeModelContext
    const [tool] = await context.getTools()
    return JSON.parse(
      (await context.executeTool!(tool, JSON.stringify(input)))!,
    )
  }, input)
  expect(result).toEqual({
    success: true,
    surveyId: expect.stringMatching(/^[A-Z0-9]{3}-[A-Z0-9]{3}$/),
  })
  expect(posts).toBe(1)
  await expect(
    page.getByRole('status', { name: 'Assistant submission result' }),
  ).toContainText(result.surveyId)
  const rows = await repository.find({ name })
  expect(rows).toEqual([
    { ...input, id: result.surveyId, submittedAt: expect.any(String) },
  ])
  await page.getByRole('link', { name: 'Manage responses' }).click()
  await page.getByLabel('Name contains').fill(name)
  await page.getByRole('button', { name: 'Apply', exact: true }).click()
  await expect(page.getByRole('row').filter({ hasText: name })).toContainText(
    result.surveyId,
  )
  expect(
    await page.evaluate(async () =>
      (await document.modelContext!.getTools()).map((tool) => tool.name),
    ),
  ).toEqual(['submit_ai_dev_days_survey'])
  await page.reload()
  await expect(page.getByText('Assistant submission available.')).toBeVisible()
  expect(await repository.find({ name })).toHaveLength(1)
  expect(errors).toEqual([])
})

for (const state of ['unavailable', 'registration error'] as const) {
  test(`manual attendee can submit when assistant is ${state}`, async ({
    page,
    app,
  }, testInfo) => {
    await page.addInitScript((state) => {
      if (state === 'unavailable') {
        Object.defineProperty(window, 'isSecureContext', { value: false })
      } else {
        Object.defineProperty(document, 'modelContext', {
          value: {
            registerTool: async () => {
              throw new Error('synthetic registration failure')
            },
          },
        })
      }
    }, state)
    await page.goto('/survey/new?step=1')
    await expect(
      page.getByText(
        state === 'unavailable'
          ? 'Assistant submission unavailable. You can still take the survey.'
          : 'Assistant submission could not connect. You can still take the survey.',
      ),
    ).toBeVisible()
    await page.getByLabel('Talk attended').selectOption(surveyInput.talk)
    await page.getByRole('radio', { name: '9', exact: true }).check()
    await page
      .getByLabel('Primary reason for your rating')
      .fill(surveyInput.ratingReason)
    await page.getByRole('button', { name: 'Next', exact: true }).click()
    await page.getByLabel('Thank-you gift').selectOption(surveyInput.swagGift)
    const name = `Assistant ${state} ${testInfo.project.name}`
    await page.getByLabel('Full name').fill(name)
    await page.getByLabel('Shipping address').fill(surveyInput.shippingAddress)
    await page.getByRole('button', { name: 'Submit survey' }).click()
    await expect(page.getByRole('status')).toContainText(
      /Survey ID: [A-Z0-9]{3}-[A-Z0-9]{3}/,
    )
    expect(
      await createJsonlSurveyRepository(app.dataFile).find({ name }),
    ).toHaveLength(1)
  })
}
