import { createMemoryHistory, RouterProvider } from '@tanstack/react-router'
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'
import { isolatedAvailability } from './support/availability.fixture'
import { getRouter } from '../src/router'
import { createSurveyOperations } from '../src/survey/survey.operations.server'
import { createMemorySurveyRepository } from '../src/survey/survey-repository.memory'
import type { SurveyManagementOperations } from '../src/survey/survey.types'
import { surveyInput } from './survey.fixture'

async function setup(
  path = '/survey',
  boundary?: (
    operations: SurveyManagementOperations,
  ) => SurveyManagementOperations,
) {
  const operations = createSurveyOperations(createMemorySurveyRepository())
  await operations.submitSurvey({ ...surveyInput, name: 'Ada Low', rating: 0 })
  await operations.submitSurvey({
    ...surveyInput,
    name: 'Grace Other',
    rating: 7,
  })
  await operations.submitSurvey({
    ...surveyInput,
    name: 'Ada High',
    rating: 10,
  })
  const router = getRouter({
    availability: isolatedAvailability(),
    management: boundary ? boundary(operations) : operations,
  })
  router.update({
    context: router.options.context,
    history: createMemoryHistory({ initialEntries: [path] }),
  })
  await router.load()
  render(<RouterProvider router={router} />, { container: document })
  await screen.findByRole('heading', { name: 'Manage responses' })
  return { router, operations }
}

test('organizer sees newest summaries first without private feedback or addresses', async () => {
  await setup()
  const rows = within(
    screen.getByRole('table', { name: 'Survey responses' }),
  ).getAllByRole('row')
  expect(rows).toHaveLength(4)
  expect(rows[1]).toHaveTextContent('Ada High')
  expect(rows[3]).toHaveTextContent('Ada Low')
  for (const name of [
    'Select',
    'ID',
    'Name',
    'Talk',
    'Rating',
    'Gift',
    'Submitted',
    'Actions',
  ]) {
    expect(screen.getByRole('columnheader', { name })).toBeVisible()
  }
  expect(screen.queryByText(surveyInput.ratingReason)).not.toBeInTheDocument()
  expect(
    screen.queryByText(surveyInput.shippingAddress),
  ).not.toBeInTheDocument()
})

test('organizer sees the visible response count update with filters and clearing', async () => {
  const user = userEvent.setup()
  await setup()
  expect(screen.getByText('3 responses shown')).toBeVisible()
  await user.type(screen.getByLabelText('Name contains'), 'Grace')
  await user.click(screen.getByRole('button', { name: 'Apply' }))
  expect(await screen.findByText('1 response shown')).toBeVisible()
  await user.clear(screen.getByLabelText('Name contains'))
  await user.type(screen.getByLabelText('Name contains'), 'Nobody')
  await user.click(screen.getByRole('button', { name: 'Apply' }))
  expect(await screen.findByText('0 responses shown')).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'Clear' }))
  expect(await screen.findByText('3 responses shown')).toBeVisible()
})

test('organizer opens only the requested full response and closing restores focus', async () => {
  const user = userEvent.setup()
  const { operations } = await setup()
  const response = (await operations.findSurveys({ name: 'Ada Low' }))[0]
  const trigger = within(
    screen.getByRole('row', { name: /Ada Low/ }),
  ).getByRole('button', { name: 'Details' })
  await user.click(trigger)
  const dialog = screen.getByRole('dialog', { name: 'Response details' })
  expect(dialog).toContainElement(document.activeElement as HTMLElement)
  for (const value of [
    response.id,
    response.name,
    response.talk,
    response.ratingReason,
    response.shippingAddress,
    response.swagGift,
    response.submittedAt,
  ]) {
    expect(dialog).toHaveTextContent(value.replace(/\s+/g, ' '))
  }
  expect(dialog).not.toHaveTextContent('Ada High')
  fireEvent(dialog, new Event('cancel', { bubbles: true, cancelable: true }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(trigger).toHaveFocus()
  await user.click(trigger)
  await user.click(screen.getByRole('button', { name: 'Close details' }))
  expect(trigger).toHaveFocus()
})

test('invalid rating bounds can be corrected and empty filters are omitted from the URL', async () => {
  const user = userEvent.setup()
  const { router } = await setup('/survey?name=&ratingMin=10&ratingMax=0')
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Maximum rating must be at least the minimum rating',
  )
  expect(screen.queryByRole('table')).not.toBeInTheDocument()
  await user.clear(screen.getByLabelText('Maximum rating'))
  await user.type(screen.getByLabelText('Maximum rating'), '10')
  await user.click(screen.getByRole('button', { name: 'Apply' }))
  expect(await screen.findByText('Ada High')).toBeVisible()
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(router.state.location.search).toEqual({ ratingMin: 10, ratingMax: 10 })
  await user.type(screen.getByLabelText('Name contains'), 'Nobody')
  await user.click(screen.getByRole('button', { name: 'Apply' }))
  expect(
    await screen.findByText('No responses match these filters.'),
  ).toBeVisible()
})

test('organizer applies combined inclusive filters with Enter, shares the URL, and clears them', async () => {
  const user = userEvent.setup()
  const { router } = await setup()
  await user.type(screen.getByLabelText('Name contains'), ' Ada ')
  await user.selectOptions(screen.getByLabelText('Talk'), surveyInput.talk)
  await user.type(screen.getByLabelText('Minimum rating'), '0')
  await user.type(screen.getByLabelText('Maximum rating'), '0{Enter}')
  await waitFor(() =>
    expect(screen.queryByText('Ada High')).not.toBeInTheDocument(),
  )
  expect(screen.getByText('Ada Low')).toBeVisible()
  expect(screen.queryByText('Grace Other')).not.toBeInTheDocument()
  const url = router.state.location.href
  expect(new URL(url, 'http://localhost').searchParams.get('name')).toBe('Ada')
  expect(new URL(url, 'http://localhost').searchParams.get('ratingMin')).toBe(
    '0',
  )
  cleanup()
  await setup(url)
  expect(screen.getByLabelText('Name contains')).toHaveValue('Ada')
  expect(screen.getByText('Ada Low')).toBeVisible()
  expect(screen.queryByText('Ada High')).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Clear' }))
  expect(await screen.findByText('Ada High')).toBeVisible()
  expect(screen.getByLabelText('Name contains')).toHaveValue('')
})

test('selection is limited to visible responses and disappears when filtering hides a record', async () => {
  const user = userEvent.setup()
  await setup()
  await user.click(screen.getByRole('checkbox', { name: 'Select Grace Other' }))
  expect(screen.getByText('1 selected')).toBeVisible()
  await user.type(screen.getByLabelText('Name contains'), 'Ada{Enter}')
  expect(await screen.findByText('0 selected')).toBeVisible()
  await user.click(
    screen.getByRole('checkbox', { name: 'Select all visible responses' }),
  )
  expect(screen.getByText('2 selected')).toBeVisible()
  await user.click(screen.getByRole('checkbox', { name: 'Select Ada Low' }))
  expect(
    screen.getByRole('checkbox', { name: 'Select all visible responses' }),
  ).toBePartiallyChecked()
  await user.click(
    screen.getByRole('checkbox', { name: 'Select all visible responses' }),
  )
  await user.click(
    screen.getByRole('checkbox', { name: 'Select all visible responses' }),
  )
  expect(screen.getByText('0 selected')).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'Clear' }))
  expect(
    await screen.findByRole('checkbox', { name: 'Select Grace Other' }),
  ).not.toBeChecked()
})

test('single deletion identifies the participant, cancellation preserves data, and confirmation refreshes the list', async () => {
  const user = userEvent.setup()
  const { operations } = await setup()
  const response = (await operations.findSurveys({ name: 'Ada Low' }))[0]
  const remove = () =>
    within(screen.getByRole('row', { name: /Ada Low/ })).getByRole('button', {
      name: 'Delete',
    })
  await user.click(remove())
  expect(
    screen.getByRole('dialog', { name: 'Delete response?' }),
  ).toHaveTextContent(`${response.id} · Ada Low`)
  await user.click(screen.getByRole('button', { name: 'Cancel' }))
  expect(await operations.findSurveys()).toHaveLength(3)
  expect(remove()).toHaveFocus()
  await user.click(remove())
  await user.click(screen.getByRole('button', { name: 'Confirm deletion' }))
  expect(await screen.findByRole('status')).toHaveTextContent(
    'Deleted 1 response.',
  )
  expect(screen.queryByText('Ada Low')).not.toBeInTheDocument()
  expect(
    (await operations.findSurveys()).map((response) => response.name),
  ).toEqual(['Ada High', 'Grace Other'])
  expect(
    screen.getByRole('heading', { name: 'Manage responses' }),
  ).toHaveFocus()
})

test('bulk deletion keeps selections through a request failure and deletes only confirmed visible records on retry', async () => {
  let rejectRequest!: (reason: Error) => void
  let first = true
  const user = userEvent.setup()
  const { operations, router } = await setup('/survey', (operations) => ({
    ...operations,
    async deleteSurveys(input) {
      if (first) {
        first = false
        await new Promise<void>((_, reject) => {
          rejectRequest = reject
        })
      }
      return operations.deleteSurveys(input)
    },
  }))
  await user.click(screen.getByRole('checkbox', { name: 'Select Grace Other' }))
  await user.type(screen.getByLabelText('Name contains'), 'Ada{Enter}')
  await user.click(
    screen.getByRole('checkbox', { name: 'Select all visible responses' }),
  )
  await user.click(screen.getByRole('button', { name: 'Delete selected (2)' }))
  expect(
    screen.getByRole('dialog', { name: 'Delete 2 responses?' }),
  ).not.toHaveTextContent('Grace Other')
  await user.click(screen.getByRole('button', { name: 'Cancel' }))
  expect(await operations.findSurveys()).toHaveLength(3)
  await user.click(screen.getByRole('button', { name: 'Delete selected (2)' }))
  await user.click(screen.getByRole('button', { name: 'Confirm deletion' }))
  expect(screen.getByRole('button', { name: 'Deleting…' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
  fireEvent(
    screen.getByRole('dialog'),
    new Event('cancel', { bubbles: true, cancelable: true }),
  )
  expect(screen.getByRole('dialog')).toBeVisible()
  await user.click(screen.getByRole('link', { name: 'Home' }))
  expect(router.state.location.pathname).toBe('/survey')
  await act(async () => rejectRequest(new Error('Connection failed')))
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Your selection is kept. Try again.',
  )
  expect(screen.getByText('2 selected')).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'Confirm deletion' }))
  expect(await screen.findByRole('status')).toHaveTextContent(
    'Deleted 2 responses.',
  )
  expect(
    screen.getByRole('heading', { name: 'Manage responses' }),
  ).toHaveFocus()
  expect(screen.getByText('0 selected')).toBeVisible()
  expect(
    screen.getByRole('button', { name: 'Delete selected (0)' }),
  ).toBeDisabled()
  expect((await operations.findSurveys()).map((row) => row.name)).toEqual([
    'Grace Other',
  ])
  await user.click(screen.getByRole('button', { name: 'Clear' }))
  expect(await screen.findByText('Grace Other')).toBeVisible()
})

test('a shared URL containing empty filter parameters becomes the canonical unfiltered URL', async () => {
  const { router } = await setup('/survey?name=&talk=&ratingMin=&ratingMax=')
  await waitFor(() => expect(router.state.location.href).toBe('/survey'))
  expect(screen.getByText('Ada High')).toBeVisible()
})
