import type { Locator, Page } from '@playwright/test'
import { test, expect } from '../support/browser.fixture'

async function tabTo(page: Page, target: Locator) {
  // Navigate the actual tab order: never programmatically focus a target.
  for (let count = 0; count < 80; count += 1) {
    if (
      await target.evaluate((element) => element === document.activeElement)
    ) {
      await expect(target).toBeInViewport()
      return
    }
    await page.keyboard.press('Tab')
  }
  throw new Error(
    `Control is unreachable by keyboard: ${await target.ariaSnapshot()}`,
  )
}
async function activate(page: Page, target: Locator) {
  await tabTo(page, target)
  await page.keyboard.press('Enter')
}
async function type(page: Page, target: Locator, value: string) {
  await tabTo(page, target)
  await page.keyboard.insertText(value)
}
const reason = `Useful guidance. ${'PracticalAgentWorkflows'.repeat(50)}`
const address = `123 Example Lane\n${'LongBuildingName'.repeat(24)}\nChicago, IL 60601`
const longName = `Casey ${'Morgan'.repeat(24)}`

test('keyboard-only attendee and organizer can complete every action with long content at both viewport widths', async ({
  page,
}, testInfo) => {
  await page.goto('/')
  await expect(page.getByRole('banner')).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible()
  await expect(page.getByRole('main')).toBeVisible()
  await expect(page.getByRole('contentinfo')).toBeVisible()
  await activate(
    page,
    page.getByRole('link', { name: 'Take survey', exact: true }),
  )
  // Errors remain associated with their controls when submitting by keyboard.
  await activate(page, page.getByRole('button', { name: 'Next', exact: true }))
  await expect(page.getByLabel('Talk attended')).toHaveAccessibleDescription(
    'Choose the talk you attended.',
  )
  for (const name of [longName, 'Jordan Example', 'Taylor Example']) {
    await tabTo(page, page.getByLabel('Talk attended'))
    await page.keyboard.press('e')
    await page.keyboard.press('Tab')
    await expect(
      page.getByRole('group', {
        name: 'How likely are you to recommend this talk?',
      }),
    ).toBeVisible()
    await tabTo(page, page.getByRole('radio', { name: '0', exact: true }))
    await page.keyboard.press('Space')
    for (let i = 0; i < 9; i++) await page.keyboard.press('ArrowRight')
    await expect(
      page.getByRole('radio', { name: '9', exact: true }),
    ).toBeChecked()
    await type(page, page.getByLabel('Primary reason for your rating'), reason)
    await activate(
      page,
      page.getByRole('button', { name: 'Next', exact: true }),
    )
    await expect(page).toHaveURL(/step=2/)
    await tabTo(page, page.getByLabel('Thank-you gift'))
    await page.keyboard.press('k')
    await type(page, page.getByLabel('Full name'), name)
    await type(page, page.getByLabel('Shipping address'), address)
    await activate(
      page,
      page.getByRole('button', { name: 'Back', exact: true }),
    )
    await expect(page.getByLabel('Primary reason for your rating')).toHaveValue(
      reason,
    )
    await activate(
      page,
      page.getByRole('button', { name: 'Next', exact: true }),
    )
    await expect(page.getByLabel('Shipping address')).toHaveValue(address)
    await activate(page, page.getByRole('button', { name: 'Submit survey' }))
    await expect(page.getByRole('status')).toContainText('Survey ID:')
    if (name !== 'Taylor Example')
      await activate(
        page,
        page.getByRole('button', { name: 'Start another survey' }),
      )
  }
  await activate(
    page,
    page.getByRole('link', { name: 'Manage responses', exact: true }),
  )
  await expect(page.getByRole('columnheader')).toHaveText([
    'Select',
    'ID',
    'Name',
    'Talk',
    'Rating',
    'Gift',
    'Submitted',
    'Actions',
  ])
  await type(page, page.getByLabel('Name contains'), 'Casey')
  await tabTo(page, page.getByRole('combobox', { name: 'Talk', exact: true }))
  await page.keyboard.press('e')
  await type(page, page.getByLabel('Minimum rating'), '9')
  await type(page, page.getByLabel('Maximum rating'), '9')
  await activate(page, page.getByRole('button', { name: 'Apply', exact: true }))
  await expect(page.getByRole('table').getByRole('row')).toHaveCount(2)
  await tabTo(page, page.getByRole('region', { name: 'Response table' }))
  await page.keyboard.press('ArrowRight')
  const details = page.getByRole('button', { name: 'Details', exact: true })
  await activate(page, details)
  const dialog = page.getByRole('dialog', { name: 'Response details' })
  await expect(dialog).toContainText(reason)
  await expect(dialog).toContainText(address)
  await expect(dialog).toContainText(longName)
  await expect(
    page.getByRole('button', { name: 'Close details' }),
  ).toBeFocused()
  expect(
    await dialog.evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    ),
  ).toBe(true)
  await page.keyboard.press('Shift+Tab')
  await page.keyboard.press('Tab')
  await expect(
    page.getByRole('button', { name: 'Close details' }),
  ).toBeFocused()
  await testInfo.attach('long-response-details', {
    body: await dialog.screenshot(),
    contentType: 'image/png',
  })
  await page.keyboard.press('Escape')
  await expect(details).toBeFocused()
  await activate(page, details)
  await activate(page, page.getByRole('button', { name: 'Close details' }))
  await expect(details).toBeFocused()
  const singleDelete = page.getByRole('button', { name: 'Delete', exact: true })
  await activate(page, singleDelete)
  await expect(page.getByRole('dialog')).toContainText(longName)
  await expect(
    page.getByRole('button', { name: 'Cancel', exact: true }),
  ).toBeFocused()
  expect(
    await page
      .getByRole('dialog')
      .evaluate((element) => element.scrollWidth <= element.clientWidth),
  ).toBe(true)
  await page.keyboard.press('Enter')
  await expect(singleDelete).toBeFocused()
  await activate(page, singleDelete)
  await activate(page, page.getByRole('button', { name: 'Confirm deletion' }))
  await expect(page.getByRole('status')).toHaveText('Deleted 1 response.')
  await expect(
    page.getByRole('heading', { name: 'Manage responses' }),
  ).toBeFocused()
  await activate(page, page.getByRole('button', { name: 'Clear', exact: true }))
  const selectOne = page.getByRole('checkbox', {
    name: 'Select Jordan Example',
    exact: true,
  })
  await tabTo(page, selectOne)
  await page.keyboard.press('Space')
  await expect(selectOne).toBeChecked()
  await page.keyboard.press('Space')
  await tabTo(
    page,
    page.getByRole('checkbox', { name: 'Select all visible responses' }),
  )
  await page.keyboard.press('Space')
  await activate(
    page,
    page.getByRole('button', { name: 'Delete selected (2)' }),
  )
  await page.keyboard.press('Escape')
  await expect(
    page.getByRole('button', { name: 'Delete selected (2)' }),
  ).toBeFocused()
  await expect(page.getByRole('table').getByRole('row')).toHaveCount(3)
  await page.keyboard.press('Enter')
  await activate(page, page.getByRole('button', { name: 'Confirm deletion' }))
  await expect(page.getByRole('status')).toHaveText('Deleted 2 responses.')
  await expect(page.getByText('No responses yet.')).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
})
