import { expect, test } from '../support/browser.fixture'

test.describe.serial('each browser case receives an empty repository', () => {
  for (const attempt of [1, 2]) {
    test(`fresh attendee run ${attempt}`, async ({ page }) => {
      await page.goto('/survey')
      await expect(
        page.getByText('No responses yet.', { exact: true }),
      ).toBeVisible()
      await page.getByRole('link', { name: 'Take survey', exact: true }).click()
      await page
        .getByLabel('Talk attended')
        .selectOption('Building Reliable AI Agents')
      await page.getByRole('radio', { name: '9', exact: true }).check()
      await page
        .getByLabel('Primary reason for your rating')
        .fill('Useful guidance.')
      await page.getByRole('button', { name: 'Next', exact: true }).click()
      await page.getByLabel('Thank-you gift').selectOption('Keyboard')
      await page.getByLabel('Full name').fill('Casey Morgan')
      await page
        .getByLabel('Shipping address')
        .fill('123 Example Lane, Chicago, IL 60601')
      await page.getByRole('button', { name: 'Submit survey' }).click()
      await expect(page.getByRole('status')).toContainText('Survey ID:')
      await page.getByRole('link', { name: 'Manage responses' }).click()
      await expect(page.getByRole('table').getByRole('row')).toHaveCount(2)
    })
  }
})
