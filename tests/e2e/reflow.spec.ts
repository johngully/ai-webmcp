import { test, expect } from '../support/browser.fixture'
import { surveyInput } from '../survey.fixture'

test('attendee and organizer retain required content at 320px with enlarged text', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 900 })
  await page.goto('/')
  async function fits(surface: string) {
    // Route head updates can remove injected styles. Apply the user's text-size
    // override after each navigation so every surface is actually enlarged.
    await page.addStyleTag({ content: ':root { font-size: 200% !important; }' })
    expect(
      await page.evaluate(
        () => getComputedStyle(document.documentElement).fontSize,
      ),
    ).toBe('32px')
    await testInfo.attach(surface, {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      surface,
    ).toBe(true)
  }
  await fits('home-enlarged')
  await page.getByRole('link', { name: 'Start survey', exact: true }).click()
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  await expect(page.getByLabel('Talk attended')).toHaveAccessibleDescription(
    'Choose the talk you attended.',
  )
  await fits('feedback-errors-enlarged')
  await page.getByLabel('Talk attended').selectOption(surveyInput.talk)
  await page.getByRole('radio', { name: '9', exact: true }).check()
  await page
    .getByLabel('Primary reason for your rating')
    .fill(surveyInput.ratingReason)
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  await page.getByLabel('Thank-you gift').selectOption(surveyInput.swagGift)
  await page.getByLabel('Full name').fill(surveyInput.name)
  await page.getByLabel('Shipping address').fill(surveyInput.shippingAddress)
  await fits('delivery-enlarged')
  await page.getByRole('button', { name: 'Submit survey', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Survey ID:')
  await fits('success-enlarged')
  await page
    .getByRole('link', { name: 'Manage responses', exact: true })
    .click()
  await expect(page.getByRole('table')).toBeVisible()
  await fits('management-enlarged')
  await page.getByRole('button', { name: 'Details', exact: true }).click()
  await expect(page.getByRole('dialog')).toContainText(
    surveyInput.shippingAddress,
  )
  expect(
    await page
      .getByRole('dialog')
      .evaluate((el) => el.scrollWidth <= el.clientWidth),
  ).toBe(true)
  await fits('details-enlarged')
})
