import { expect, test } from '@playwright/test'
import { resolve } from 'node:path'
import { createJsonlSurveyRepository } from '../../src/survey/survey-repository.server'

// Every write goes through the running app. Other browser workers use distinct
// names, and repository access below is read-only: one Node process owns writes.
test('organizer filters, inspects, cancels, and deletes only the intended persisted responses', async ({
  page,
}, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  const prefix = `Management ${testInfo.project.name}`
  const talk = 'Building Reliable AI Agents'
  const otherTalk = 'Multimodal Apps with Modern Models'
  for (const [suffix, rating, attended] of [
    ['Ada Low', 0, talk],
    ['Ada High', 10, talk],
    ['Ada Other', 7, otherTalk],
    ['Keep', 8, talk],
  ] as const) {
    await page.goto('/survey/new?step=1')
    await page.getByLabel('Talk attended').selectOption(attended)
    await page.getByRole('radio', { name: String(rating), exact: true }).check()
    await page
      .getByLabel('Primary reason for your rating')
      .fill(`Private feedback from ${suffix}.`)
    await page.getByRole('button', { name: 'Next', exact: true }).click()
    await page.getByLabel('Thank-you gift').selectOption('Keyboard')
    await page.getByLabel('Full name').fill(`${prefix} ${suffix}`)
    await page
      .getByLabel('Shipping address')
      .fill('123 Synthetic Lane\nExample City')
    await page.getByRole('button', { name: 'Submit survey' }).click()
    await expect(page.getByRole('status')).toContainText('Survey ID:')
  }
  await page.getByRole('link', { name: 'Manage responses' }).click()
  await page.getByLabel('Name contains').fill(prefix)
  await page.getByLabel('Name contains').press('Enter')
  const rows = page.getByRole('table').getByRole('row')
  await expect(rows).toHaveCount(5)
  await expect(rows.nth(1)).toContainText(`${prefix} Keep`)
  await expect(page.getByRole('table')).not.toContainText('Private feedback')
  await expect(page.getByRole('table')).not.toContainText('Synthetic Lane')
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  const details = page
    .getByRole('row', { name: new RegExp(`${prefix} Ada Low`) })
    .getByRole('button', { name: 'Details' })
  await details.click()
  const dialog = page.getByRole('dialog', { name: 'Response details' })
  await expect(dialog).toContainText('Private feedback from Ada Low.')
  await expect(dialog).toContainText('123 Synthetic Lane')
  await expect(dialog).toContainText('0 / 10')
  await expect(
    page.getByRole('button', { name: 'Close details' }),
  ).toBeFocused()
  expect(await dialog.evaluate((element) => element.matches(':modal'))).toBe(
    true,
  )
  await page.keyboard.press('Tab')
  await expect(page.getByLabel('Name contains')).not.toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(
    page.getByRole('button', { name: 'Close details' }),
  ).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(details).toBeFocused()
  await page
    .getByRole('checkbox', { name: `Select ${prefix} Keep`, exact: true })
    .check()
  await page.getByLabel('Name contains').fill(`${prefix} Ada`)
  await page
    .getByRole('combobox', { name: 'Talk', exact: true })
    .selectOption(talk)
  await page.getByLabel('Minimum rating').fill('0')
  await page.getByLabel('Maximum rating').fill('10')
  await page.getByLabel('Maximum rating').press('Enter')
  await expect(rows).toHaveCount(3)
  await expect(page.getByText('0 selected', { exact: true })).toBeVisible()
  expect(new URL(page.url()).searchParams.get('ratingMin')).toBe('0')
  await page.reload()
  await expect(rows).toHaveCount(3)
  await expect(page.getByLabel('Name contains')).toHaveValue(`${prefix} Ada`)
  await page.getByLabel('Minimum rating').fill('10')
  await page.getByLabel('Maximum rating').fill('0')
  await page.getByRole('button', { name: 'Apply' }).click()
  await expect(page.getByRole('alert')).toContainText(
    'Maximum rating must be at least the minimum rating',
  )
  await page.getByRole('button', { name: 'Clear', exact: true }).click()
  await expect(page).toHaveURL('/survey')
  await page.getByLabel('Name contains').fill(prefix)
  await page.getByRole('button', { name: 'Apply' }).click()
  const target = page.getByRole('row', {
    name: new RegExp(`${prefix} Ada Other`),
  })
  await target.getByRole('button', { name: 'Delete', exact: true }).click()
  await expect(page.getByRole('dialog')).toContainText(`${prefix} Ada Other`)
  await expect(
    page.getByRole('button', { name: 'Cancel', exact: true }),
  ).toBeFocused()
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(target).toBeVisible()
  await target.getByRole('button', { name: 'Delete', exact: true }).click()
  await page.getByRole('button', { name: 'Confirm deletion' }).click()
  await expect(page.getByRole('status')).toHaveText('Deleted 1 response.')
  await expect(target).not.toBeVisible()
  await page.getByLabel('Name contains').fill(`${prefix} Ada`)
  await page.getByRole('button', { name: 'Apply' }).click()
  await page
    .getByRole('checkbox', { name: 'Select all visible responses' })
    .check()
  await expect(page.getByText('2 selected', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Delete selected (2)' }).click()
  await expect(
    page.getByRole('dialog', { name: 'Delete 2 responses?' }),
  ).not.toContainText('Keep')
  // A failed network request must not clear selection or remove data.
  await page.route('**/*', async (route) => {
    if (route.request().method() === 'POST') await route.abort('failed')
    else await route.continue()
  })
  await page.getByRole('button', { name: 'Confirm deletion' }).click()
  await expect(page.getByRole('alert')).toContainText('Your selection is kept')
  await page.unrouteAll()
  await page.getByRole('button', { name: 'Confirm deletion' }).click()
  await expect(page.getByRole('status')).toHaveText('Deleted 2 responses.')
  await expect(
    page.getByRole('heading', { name: 'Manage responses' }),
  ).toBeFocused()
  await expect(
    page.getByText('No responses match these filters.'),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Clear', exact: true }).click()
  await page.getByLabel('Name contains').fill(prefix)
  await page.getByRole('button', { name: 'Apply' }).click()
  await expect(rows).toHaveCount(2)
  await expect(rows.nth(1)).toContainText(`${prefix} Keep`)
  const repository = createJsonlSurveyRepository(
    resolve('test-results/manual-surveys.jsonl'),
  )
  expect(
    (await repository.find({ name: prefix })).map((row) => row.name),
  ).toEqual([`${prefix} Keep`])
  await page.reload()
  await expect(rows).toHaveCount(2)
  expect(errors).toEqual([])
})

test('shared empty filters are omitted and malformed rating URLs remain recoverable', async ({
  page,
}) => {
  await page.goto('/survey?name=&talk=&ratingMin=&ratingMax=')
  await expect(page).toHaveURL('/survey')
  await expect(
    page.getByRole('heading', { name: 'Manage responses' }),
  ).toBeVisible()
  await expect(page.getByRole('alert')).not.toBeVisible()
  await page.goto('/survey?ratingMin=invalid')
  await expect(page.getByRole('alert')).toContainText(
    'Ratings must be whole numbers from 0 to 10',
  )
  await page.getByRole('button', { name: 'Clear', exact: true }).click()
  await expect(page).toHaveURL('/survey')
  await expect(page.getByRole('alert')).not.toBeVisible()
})
