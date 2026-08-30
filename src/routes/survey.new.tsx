import { useState } from 'react'
import { createFileRoute, useBlocker } from '@tanstack/react-router'
import { submitSurvey } from '../survey/survey.functions'
import { SurveyForm } from '../survey/survey-form'

export const Route = createFileRoute('/survey/new')({
  validateSearch: (search): { step: 1 | 2 } => ({
    step: search.step === 2 ? 2 : 1,
  }),
  component: SurveyPage,
})

function SurveyPage() {
  const [submitting, setSubmitting] = useState(false)
  useBlocker({
    shouldBlockFn: () => submitting,
    enableBeforeUnload: submitting,
  })
  const { step } = Route.useSearch()
  const navigate = Route.useNavigate()
  return (
    <SurveyForm
      onSubmittingChange={setSubmitting}
      submit={(input) => submitSurvey({ data: input })}
      step={step}
      navigate={(nextStep, replace) =>
        navigate({ search: { step: nextStep }, replace })
      }
    />
  )
}
