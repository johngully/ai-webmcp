import { createMemoryHistory, RouterProvider } from '@tanstack/react-router'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { getRouter } from '../src/router'

beforeEach(() => sessionStorage.clear())
afterEach(() => vi.restoreAllMocks())

async function openSurvey(path = '/survey/new') {
  const router = getRouter()
  router.update({ history: createMemoryHistory({ initialEntries: [path] }) })
  await router.load()
  render(<RouterProvider router={router} />, { container: document })
  await screen.findByRole('heading', { name: 'Take survey' })
  return router
}

test('attendee corrects required feedback before advancing to the canonical second step', async () => {
  const user = userEvent.setup()
  const router = await openSurvey('/survey/new?step=invalid')
  await waitFor(() =>
    expect(router.state.location.href).toBe('/survey/new?step=1'),
  )
  await user.click(screen.getByRole('button', { name: 'Next' }))
  expect(screen.getByLabelText('Talk attended')).toHaveAccessibleDescription(
    'Choose the talk you attended.',
  )
  expect(
    screen.getByRole('group', {
      name: 'How likely are you to recommend this talk?',
    }),
  ).toHaveAccessibleDescription('Choose a rating from 0 to 10.')
  expect(
    screen.getByLabelText('Primary reason for your rating'),
  ).toHaveAccessibleDescription('This field is required')
  await user.selectOptions(
    screen.getByLabelText('Talk attended'),
    'Building Reliable AI Agents',
  )
  await user.click(screen.getByRole('radio', { name: '0' }))
  await user.type(
    screen.getByLabelText('Primary reason for your rating'),
    'I needed more concrete examples.',
  )
  await user.click(screen.getByRole('button', { name: 'Next' }))
  expect(
    await screen.findByRole('heading', { name: 'Gift and delivery' }),
  ).toBeVisible()
  expect(router.state.location.href).toBe('/survey/new?step=2')
})

async function giveFeedback(user: ReturnType<typeof userEvent.setup>) {
  await user.selectOptions(
    screen.getByLabelText('Talk attended'),
    'Building Reliable AI Agents',
  )
  await user.click(screen.getByRole('radio', { name: '10' }))
  await user.type(
    screen.getByLabelText('Primary reason for your rating'),
    'Practical agent design.',
  )
  await user.click(screen.getByRole('button', { name: 'Next' }))
}

test('attendee keeps both steps when going Back and gets delivery field errors', async () => {
  const user = userEvent.setup()
  const router = await openSurvey()
  await giveFeedback(user)
  await user.click(screen.getByRole('button', { name: 'Submit survey' }))
  expect(screen.getByLabelText('Thank-you gift')).toHaveAccessibleDescription(
    'Choose your thank-you gift.',
  )
  expect(screen.getByLabelText('Full name')).toHaveAccessibleDescription(
    'This field is required',
  )
  expect(screen.getByLabelText('Shipping address')).toHaveAccessibleDescription(
    'This field is required',
  )
  await user.selectOptions(screen.getByLabelText('Thank-you gift'), 'Hoodie')
  await user.type(screen.getByLabelText('Full name'), 'Demo Attendee')
  await user.type(
    screen.getByLabelText('Shipping address'),
    '123 Example Street',
  )
  await user.click(screen.getByRole('button', { name: 'Back' }))
  expect(router.state.location.href).toBe('/survey/new?step=1')
  expect(screen.getByLabelText('Talk attended')).toHaveValue(
    'Building Reliable AI Agents',
  )
  expect(screen.getByRole('radio', { name: '10' })).toBeChecked()
  expect(screen.getByLabelText('Primary reason for your rating')).toHaveValue(
    'Practical agent design.',
  )
  await user.click(screen.getByRole('button', { name: 'Next' }))
  expect(await screen.findByLabelText('Full name')).toHaveValue('Demo Attendee')
  expect(screen.getByLabelText('Thank-you gift')).toHaveValue('Hoodie')
  expect(screen.getByLabelText('Shipping address')).toHaveValue(
    '123 Example Street',
  )
})

test('attendee resumes feedback and delivery after client navigation and a refresh', async () => {
  const user = userEvent.setup()
  await openSurvey()
  await giveFeedback(user)
  await user.type(screen.getByLabelText('Full name'), 'Retained Demo')
  await user.click(screen.getByRole('link', { name: 'Home' }))
  await user.click(screen.getByRole('link', { name: 'Take survey' }))
  expect(
    await screen.findByLabelText('Primary reason for your rating'),
  ).toHaveValue('Practical agent design.')
  await user.click(screen.getByRole('button', { name: 'Next' }))
  expect(await screen.findByLabelText('Full name')).toHaveValue('Retained Demo')
  cleanup()
  const router = await openSurvey('/survey/new?step=2')
  expect(await screen.findByLabelText('Full name')).toHaveValue('Retained Demo')
  expect(router.state.location.href).toBe('/survey/new?step=2')
  await user.click(screen.getByRole('button', { name: 'Back' }))
  expect(screen.getByRole('radio', { name: '10' })).toBeChecked()
})

test.each([
  null,
  '{broken',
  JSON.stringify({ version: 0, values: { name: 'Old' } }),
  JSON.stringify({ version: 1, values: { rating: 20 } }),
])(
  'direct Step 2 with unusable saved data %s safely starts with feedback',
  async (saved) => {
    if (saved) sessionStorage.setItem('ai-dev-days:survey-draft:v1', saved)
    const router = await openSurvey('/survey/new?step=2')
    expect(await screen.findByLabelText('Talk attended')).toHaveValue('')
    expect(screen.getByLabelText('Primary reason for your rating')).toHaveValue(
      '',
    )
    await waitFor(() =>
      expect(router.state.location.href).toBe('/survey/new?step=1'),
    )
  },
)

test.each(['getItem', 'setItem'] as const)(
  'attendee can finish editing with unavailable storage (%s) and sees the retention warning',
  async (method) => {
    vi.spyOn(Storage.prototype, method).mockImplementation(() => {
      throw new DOMException('Storage unavailable', 'SecurityError')
    })
    const user = userEvent.setup()
    await openSurvey()
    await giveFeedback(user)
    expect(screen.getByRole('status')).toHaveTextContent(
      'Draft storage is unavailable. Keep this page open',
    )
    await user.type(
      screen.getByLabelText('Full name'),
      'Storage Restricted Attendee',
    )
    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByLabelText('Primary reason for your rating')).toHaveValue(
      'Practical agent design.',
    )
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByLabelText('Full name')).toHaveValue(
      'Storage Restricted Attendee',
    )
  },
)
