import { test, expect } from '../support/browser.fixture'
import { createJsonlSurveyRepository } from '../../src/survey/survey-repository.server'

const persona = {
  talk: 'Building Reliable AI Agents',
  rating: 9,
  ratingReason: 'Practical guidance I can apply to production agent workflows.',
  swagGift: 'Keyboard',
  name: 'Casey Morgan',
  shippingAddress: '123 Example Lane, Chicago, IL 60601',
}

test('documented client submits the same answers as the manual path with one invocation and stays out of production', async ({
  page,
  app,
  verificationURL,
}) => {
  await page.goto('/survey/new?step=1')
  await page.getByLabel('Talk attended').selectOption(persona.talk)
  await page.getByRole('radio', { name: '9', exact: true }).check()
  await page
    .getByLabel('Primary reason for your rating')
    .fill(persona.ratingReason)
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  await page.getByLabel('Thank-you gift').selectOption(persona.swagGift)
  await page.getByLabel('Full name').fill(persona.name)
  await page.getByLabel('Shipping address').fill(persona.shippingAddress)
  await page.getByRole('button', { name: 'Submit survey' }).click()
  await expect(page.getByRole('status')).toContainText('Survey ID:')
  const ordinary = await page.request.get(`${app.url}/__verification__/webmcp`)
  expect(ordinary.status()).toBe(404)
  await page.goto(`${verificationURL}/__verification__/webmcp`)
  await expect(
    page.getByRole('heading', { name: 'WebMCP integration client' }),
  ).toBeVisible()
  await expect(
    page.frameLocator('iframe').getByText('Assistant submission available.'),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Discover survey tools' }).click()
  await expect(page.getByLabel('Discovered tools')).toContainText(
    'submit_ai_dev_days_survey',
  )
  const discovery = JSON.parse(
    await page.getByLabel('Discovered tools').innerText(),
  )
  expect(discovery.map((tool: { name: string }) => tool.name)).toEqual([
    'submit_ai_dev_days_survey',
  ])
  expect(JSON.stringify(discovery)).not.toMatch(
    /demo|preview|prototype|development/i,
  )
  expect(
    JSON.parse(await page.getByLabel('Synthetic survey answers').inputValue()),
  ).toEqual(persona)
  let posts = 0
  page.on('request', (request) => {
    if (request.method() === 'POST') posts += 1
  })
  await page.getByRole('button', { name: 'Submit through assistant' }).click()
  await expect(page.getByRole('status', { name: 'Tool result' })).toContainText(
    '"success":true',
  )
  expect(posts).toBe(1)
  const rows = await createJsonlSurveyRepository(app.dataFile).find()
  expect(rows).toHaveLength(2)
  expect(new Set(rows.map((row) => row.id)).size).toBe(2)
  for (const { id, submittedAt, ...answers } of rows) {
    expect(id).toMatch(/^[A-Z0-9]{3}-[A-Z0-9]{3}$/)
    expect(Number.isNaN(Date.parse(submittedAt))).toBe(false)
    expect(answers).toEqual(persona)
  }
})
