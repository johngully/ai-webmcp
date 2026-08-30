import { expect, test } from '../support/browser.fixture'

test('production shell supports pointer and keyboard navigation without overflow', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page).toHaveTitle('AI Dev Days · Conference survey')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'AI Dev Days',
  )
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)

  await page.keyboard.press('Tab')
  const skipLink = page.getByRole('link', { name: 'Skip to content' })
  await expect(skipLink).toBeFocused()
  await expect(skipLink).toBeInViewport()
  await expect(skipLink).toHaveCSS('outline-style', 'solid')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('main')).toBeFocused()

  await page.getByRole('link', { name: 'Take survey', exact: true }).click()
  await expect(page).toHaveURL('/survey/new?step=1')
  await expect(page.getByLabel('Talk attended')).toBeVisible()
  await page.getByRole('link', { name: 'Home', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'AI Dev Days',
  )
  await page.keyboard.press('Tab')
  await expect(
    page.getByRole('link', { name: 'Take survey', exact: true }),
  ).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { name: 'Take survey' })).toBeVisible()
  await page.keyboard.press('Tab')
  await expect(
    page.getByRole('link', { name: 'Manage responses', exact: true }),
  ).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByLabel('Name contains')).toBeVisible()
  await expect(page).toHaveURL('/survey')
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'Manage responses' }),
  ).toBeVisible()
  expect(errors).toEqual([])
})

test('a direct production request renders usable navigation without JavaScript', async ({
  browser,
  app,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto(`${app.url}/survey/new?step=1`)
  await expect(page.getByRole('heading', { name: 'Take survey' })).toBeVisible()
  await page
    .getByRole('link', { name: 'Manage responses', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Manage responses' }),
  ).toBeVisible()
  await context.close()
})
