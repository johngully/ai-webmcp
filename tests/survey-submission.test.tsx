import { useState } from 'react'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test } from 'vitest'
import { SurveyForm } from '../src/survey/survey-form'
import { createSurveyOperations } from '../src/survey/survey.operations.server'
import { createMemorySurveyRepository } from '../src/survey/survey-repository.memory'
import type { NewSurveyResponse } from '../src/survey/survey.types'

type Submit = (input: NewSurveyResponse) => Promise<{ surveyId: string }>
beforeEach(() => sessionStorage.clear())
function Form({ submit }: { submit: Submit }) {
  const [step, setStep] = useState<1 | 2>(1)
  return (
    <SurveyForm
      step={step}
      navigate={async (next) => setStep(next)}
      submit={submit}
    />
  )
}
async function completeForm(user: ReturnType<typeof userEvent.setup>) {
  await user.selectOptions(
    screen.getByLabelText('Talk attended'),
    'Building Reliable AI Agents',
  )
  await user.click(screen.getByRole('radio', { name: '9' }))
  await user.type(
    screen.getByLabelText('Primary reason for your rating'),
    ' Useful examples. ',
  )
  await user.click(screen.getByRole('button', { name: 'Next' }))
  await user.selectOptions(screen.getByLabelText('Thank-you gift'), 'Keyboard')
  await user.type(screen.getByLabelText('Full name'), ' Synthetic Attendee ')
  await user.type(
    screen.getByLabelText('Shipping address'),
    ' 123 Example Street ',
  )
}

test('attendee receives the saved ID and starts a fresh survey after success', async () => {
  const operations = createSurveyOperations(createMemorySurveyRepository())
  const user = userEvent.setup()
  render(<Form submit={operations.submitSurvey} />)
  await completeForm(user)
  await user.click(screen.getByRole('button', { name: 'Submit survey' }))
  const confirmation = await screen.findByRole('status')
  expect(confirmation).toHaveTextContent(/Survey ID: [A-Z0-9]{3}-[A-Z0-9]{3}/)
  const responses = await operations.findSurveys()
  expect(responses).toEqual([
    expect.objectContaining({
      name: 'Synthetic Attendee',
      rating: 9,
      ratingReason: 'Useful examples.',
      swagGift: 'Keyboard',
      shippingAddress: '123 Example Street',
    }),
  ])
  expect(confirmation).toHaveTextContent(responses[0].id)
  expect(
    screen.queryByRole('button', { name: 'Submit survey' }),
  ).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Start another survey' }))
  expect(screen.getByLabelText('Talk attended')).toHaveValue('')
  expect(screen.getByLabelText('Primary reason for your rating')).toHaveValue(
    '',
  )
  expect(screen.getByRole('radio', { name: '9' })).not.toBeChecked()
})

test('pending submission cannot be repeated and a rejected request preserves answers for retry', async () => {
  const operations = createSurveyOperations(createMemorySurveyRepository())
  let rejectRequest!: (error: Error) => void
  let firstRequest = true
  // The deferred function stands at the browser-to-server RPC boundary.
  const submit: Submit = async (input) => {
    if (firstRequest) {
      firstRequest = false
      await new Promise<void>((_, reject) => {
        rejectRequest = reject
      })
    }
    return operations.submitSurvey(input)
  }
  const user = userEvent.setup()
  render(<Form submit={submit} />)
  await completeForm(user)
  await user.click(screen.getByRole('button', { name: 'Submit survey' }))
  const pendingButton = screen.getByRole('button', { name: 'Submitting…' })
  expect(pendingButton).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled()
  expect(screen.getByLabelText('Full name')).toBeDisabled()
  await user.click(pendingButton)
  expect(await operations.findSurveys()).toEqual([])
  await act(async () =>
    rejectRequest(new Error('Temporary connection failure')),
  )
  expect(
    await screen.findByText(/could not confirm your submission/i),
  ).toHaveAttribute('role', 'alert')
  expect(screen.getByLabelText('Full name')).toHaveValue(' Synthetic Attendee ')
  expect(screen.getByLabelText('Shipping address')).toHaveValue(
    ' 123 Example Street ',
  )
  await user.click(screen.getByRole('button', { name: 'Back' }))
  expect(screen.getByLabelText('Primary reason for your rating')).toHaveValue(
    ' Useful examples. ',
  )
  await user.click(screen.getByRole('button', { name: 'Next' }))
  await user.click(screen.getByRole('button', { name: 'Submit survey' }))
  expect(await screen.findByRole('status')).toHaveTextContent('Survey ID:')
  expect(await operations.findSurveys()).toHaveLength(1)
})
