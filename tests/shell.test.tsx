import { createMemoryHistory, RouterProvider } from '@tanstack/react-router'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'
import { getRouter } from '../src/router'

async function renderPage(path = '/') {
  const router = getRouter()
  router.update({ history: createMemoryHistory({ initialEntries: [path] }) })
  await router.load()
  render(<RouterProvider router={router} />, { container: document })
}

test('attendee understands the two ways to complete the AI Dev Days survey', async () => {
  await renderPage()

  expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(
    'AI Dev Days',
  )
  expect(screen.getByText(/two-step form/i)).toBeVisible()
  expect(screen.getByText(/WebMCP.*one structured tool call/i)).toBeVisible()
})

test('attendee can open the survey preview and return home using navigation', async () => {
  const user = userEvent.setup()
  await renderPage()

  const navigation = screen.getByRole('navigation', { name: 'Main' })
  expect(
    within(navigation).getByRole('link', { name: 'Take survey' }),
  ).toHaveAttribute('href', '/survey/new?step=1')
  await user.click(
    within(navigation).getByRole('link', { name: 'Take survey' }),
  )

  expect(
    await screen.findByRole('heading', { name: 'Take survey' }),
  ).toBeVisible()
  expect(screen.getByText(/Phase 2 placeholder/)).toBeVisible()
  expect(
    within(navigation).getByRole('link', { name: 'Take survey' }),
  ).toHaveAttribute('aria-current', 'page')

  await user.click(within(navigation).getByRole('link', { name: 'Home' }))
  expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(
    'AI Dev Days',
  )
})

test('keyboard user can skip navigation and reach the management preview', async () => {
  const user = userEvent.setup()
  await renderPage()

  await user.tab()
  expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveFocus()
  expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute(
    'href',
    '#main-content',
  )
  expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content')
  await user.tab()
  expect(screen.getByRole('link', { name: 'Home' })).toHaveFocus()
  await user.tab()
  expect(screen.getByRole('link', { name: 'Take survey' })).toHaveFocus()
  await user.tab()
  expect(screen.getByRole('link', { name: 'Manage responses' })).toHaveFocus()
  expect(
    screen.getByRole('link', { name: 'Manage responses' }),
  ).toHaveAttribute('href', '/survey')
  await user.keyboard('{Enter}')

  expect(
    await screen.findByRole('heading', { name: 'Manage responses' }),
  ).toBeVisible()
  expect(screen.getByText(/Phase 3 placeholder/)).toBeVisible()
  expect(
    screen.getByRole('link', { name: 'Manage responses' }),
  ).toHaveAttribute('aria-current', 'page')
})
