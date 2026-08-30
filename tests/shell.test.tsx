import { createMemoryHistory, RouterProvider } from '@tanstack/react-router'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'
import { getRouter } from '../src/router'
import { createSurveyOperations } from '../src/survey/survey.operations.server'
import { createMemorySurveyRepository } from '../src/survey/survey-repository.memory'

async function renderPage(path = '/') {
  const router = getRouter({
    management: createSurveyOperations(createMemorySurveyRepository()),
  })
  router.update({
    context: router.options.context,
    history: createMemoryHistory({ initialEntries: [path] }),
  })
  await router.load()
  render(<RouterProvider router={router} />, { container: document })
}

test('assistant submission remains available exactly once across conference navigation', async () => {
  const user = userEvent.setup()
  await renderPage()
  expect(
    await screen.findByText('Assistant submission available.'),
  ).toBeVisible()
  await user.click(screen.getByRole('link', { name: 'Take survey' }))
  expect(await screen.findByLabelText('Talk attended')).toBeVisible()
  expect(await document.modelContext!.getTools()).toHaveLength(1)
  await user.click(screen.getByRole('link', { name: 'Manage responses' }))
  expect(await screen.findByText('No responses yet.')).toBeVisible()
  expect(await document.modelContext!.getTools()).toHaveLength(1)
})

test('attendee understands how to share talk feedback and choose a gift', async () => {
  await renderPage()

  expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(
    'AI Dev Days',
  )
  expect(screen.getByText('Tell us about your talk.')).toBeVisible()
  expect(screen.getByRole('link', { name: 'Start survey' })).toHaveAttribute(
    'href',
    '/survey/new?step=1',
  )
})

test('attendee can open the survey and return home using navigation', async () => {
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
  expect(screen.getByLabelText('Talk attended')).toBeVisible()
  expect(
    within(navigation).getByRole('link', { name: 'Take survey' }),
  ).toHaveAttribute('aria-current', 'page')

  await user.click(within(navigation).getByRole('link', { name: 'Home' }))
  expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(
    'AI Dev Days',
  )
})

test('keyboard user can skip navigation and reach the management page', async () => {
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
  expect(screen.getByText('No responses yet.')).toBeVisible()
  expect(
    screen.getByRole('link', { name: 'Manage responses' }),
  ).toHaveAttribute('aria-current', 'page')
})

test.each(['/', '/survey/new?step=1', '/survey'])(
  'conference page %s uses attendee-facing copy without development framing',
  async (path) => {
    await renderPage(path)
    expect(await screen.findByRole('heading', { level: 1 })).toBeVisible()
    expect(document.body).not.toHaveTextContent(
      /demo|demonstration|preview|placeholder|phase\s*\d|agent.*comparison|two ways/i,
    )
    expect(
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute('content'),
    ).not.toMatch(/demo|compare|WebMCP/i)
  },
)
