import { useEffect, useState } from 'react'
import { submitSurvey } from '../survey/survey.functions'
import { registerSurveyTool, type SubmitSurvey } from './register-survey-tool'

const submit: SubmitSurvey = (data) => submitSurvey({ data })

export function SurveyAssistant({
  submit: submitResponse = submit,
}: {
  submit?: SubmitSurvey
}) {
  const [status, setStatus] = useState('Connecting to assistant submission…')
  const [surveyId, setSurveyId] = useState('')

  useEffect(() => {
    const registration = new AbortController()
    async function connect() {
      if (!document.modelContext) {
        const { initializeWebMCPPolyfill } =
          await import('@mcp-b/webmcp-polyfill')
        if (registration.signal.aborted) return
        initializeWebMCPPolyfill()
      }
      if (registration.signal.aborted) return
      if (!document.modelContext) {
        setStatus(
          'Assistant submission unavailable. You can still take the survey.',
        )
        return
      }
      await registerSurveyTool(document.modelContext, {
        signal: registration.signal,
        submit: submitResponse,
        onSubmitted: setSurveyId,
      })
      if (!registration.signal.aborted)
        setStatus('Assistant submission available.')
    }
    void connect().catch(() => {
      if (!registration.signal.aborted) {
        setStatus(
          'Assistant submission could not connect. You can still take the survey.',
        )
      }
    })
    return () => registration.abort()
  }, [submitResponse])

  return (
    <aside aria-label="Assistant submission">
      <p>{status}</p>
      {surveyId && (
        <p role="status" aria-label="Assistant submission result">
          Thank you for your feedback. Survey ID: <strong>{surveyId}</strong>
        </p>
      )}
    </aside>
  )
}
