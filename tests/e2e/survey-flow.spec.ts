import { expect, test } from '../support/browser.fixture'
import { createJsonlSurveyRepository } from '../../src/survey/survey-repository.server'

test('production attendee validates, goes Back, refreshes, submits once, and starts again', async ({
  page,
  app,
}, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/survey/new?step=invalid')
  await expect(page).toHaveURL('/survey/new?step=1')
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  await expect(page.getByLabel('Talk attended')).toHaveAccessibleDescription(
    'Choose the talk you attended.',
  )
  await page
    .getByLabel('Talk attended')
    .selectOption('Building Agent-Ready Websites with WebMCP')
  await page.getByRole('radio', { name: '9', exact: true }).check()
  await page
    .getByLabel('Primary reason for your rating')
    .fill('Clear examples of accessible tools.')
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  await expect(page).toHaveURL('/survey/new?step=2')
  await page.getByRole('button', { name: 'Submit survey' }).click()
  await expect(page.getByLabel('Full name')).toHaveAccessibleDescription(
    'This field is required',
  )
  await page.getByLabel('Thank-you gift').selectOption('Headphones')
  const name = `Production Attendee ${testInfo.project.name}`
  await page.getByLabel('Full name').fill(name)
  await page
    .getByLabel('Shipping address')
    .fill('123 Example Street\nExample City, IL 60601')
  await page.getByRole('button', { name: 'Back', exact: true }).click()
  await expect(page).toHaveURL('/survey/new?step=1')
  await expect(
    page.getByRole('radio', { name: '9', exact: true }),
  ).toBeChecked()
  await expect(page.getByLabel('Primary reason for your rating')).toHaveValue(
    'Clear examples of accessible tools.',
  )
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  await page.reload()
  await expect(page).toHaveURL('/survey/new?step=2')
  await expect(page.getByLabel('Full name')).toHaveValue(name)
  await expect(page.getByLabel('Thank-you gift')).toHaveValue('Headphones')
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await page.getByRole('button', { name: 'Submit survey' }).click()
  await expect(page.getByRole('status')).toContainText(
    /Survey ID: [A-Z0-9]{3}-[A-Z0-9]{3}/,
  )
  // Observe the saved response through the public repository boundary.
  const repository = createJsonlSurveyRepository(app.dataFile)
  const rows = await repository.find({ name })
  expect(rows).toHaveLength(1)
  expect(rows[0]).toMatchObject({
    name,
    talk: 'Building Agent-Ready Websites with WebMCP',
    rating: 9,
    swagGift: 'Headphones',
  })
  await expect(page.getByRole('status')).toContainText(rows[0].id)
  await page.getByRole('button', { name: 'Start another survey' }).click()
  await expect(page).toHaveURL('/survey/new?step=1')
  await page.reload()
  await expect(page.getByLabel('Talk attended')).toHaveValue('')
  await expect(page.getByLabel('Primary reason for your rating')).toHaveValue(
    '',
  )
  expect(await repository.find({ name })).toHaveLength(1)
  expect(errors).toEqual([])
})

test('production routes present conference copy and direct Step 2 recovers safely', async ({
  page,
}) => {
  for (const path of ['/', '/survey', '/survey/new?step=2']) {
    await page.goto(path)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.locator('body')).not.toContainText(
      /demo|demonstration|preview|prototype|development|placeholder|phase\s*\d|two ways/i,
    )
    expect(await page.locator('body').ariaSnapshot()).not.toMatch(
      /demo|preview|prototype|development/i,
    )
    await expect(page).toHaveTitle('AI Dev Days · Conference survey')
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      'Share your AI Dev Days talk feedback and choose a thank-you gift.',
    )
  }
  await expect(page).toHaveURL('/survey/new?step=1')
  await expect(page.getByLabel('Talk attended')).toHaveValue('')
})

test('pending submission stays on the form when navigation is attempted', async ({
  page,
  app,
}, testInfo) => {
  let release!: () => void
  const pending = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route('**/*', async (route) => {
    if (route.request().method() === 'POST') await pending
    await route.continue()
  })
  await page.goto('/survey/new?step=1')
  await page
    .getByLabel('Talk attended')
    .selectOption('Building Reliable AI Agents')
  await page.getByRole('radio', { name: '8', exact: true }).check()
  await page
    .getByLabel('Primary reason for your rating')
    .fill('Useful techniques.')
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  await page.getByLabel('Thank-you gift').selectOption('Hoodie')
  const name = `Pending Attendee ${testInfo.project.name}`
  await page.getByLabel('Full name').fill(name)
  await page.getByLabel('Shipping address').fill('456 Example Avenue')
  try {
    await page.getByRole('button', { name: 'Submit survey' }).click()
    await expect(
      page.getByRole('button', { name: 'Submitting…' }),
    ).toBeDisabled()
    await testInfo.attach('submission-pending', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    })
    await page.getByRole('link', { name: 'Home', exact: true }).click()
    await expect(page).toHaveURL('/survey/new?step=2', { timeout: 1000 })
    await expect(
      page.getByRole('button', { name: 'Submitting…' }),
    ).toBeVisible()
  } finally {
    release()
  }
  await expect(page.getByRole('status')).toContainText('Survey ID:')
  const repository = createJsonlSurveyRepository(app.dataFile)
  expect(await repository.find({ name })).toHaveLength(1)
  await page.getByRole('link', { name: 'Home', exact: true }).click()
  await expect(page).toHaveURL('/')
})
