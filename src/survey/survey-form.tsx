import { useEffect, useRef, useState } from 'react'
import {
  emptyDraft,
  readSurveyDraft,
  saveSurveyDraft,
  type SurveyDraft,
} from './survey-draft'
import { useForm } from '@tanstack/react-form'
import { newSurveyResponseSchema } from './survey.schemas'
import { SWAG_GIFTS, TALKS } from './survey.constants'
import type { NewSurveyResponse } from './survey.types'

const feedbackSchema = newSurveyResponseSchema.pick({
  talk: true,
  rating: true,
  ratingReason: true,
})

export function SurveyForm({
  step,
  navigate,
  submit,
  onSubmittingChange,
}: {
  step: 1 | 2
  navigate: (step: 1 | 2, replace?: boolean) => Promise<void>
  submit: (input: NewSurveyResponse) => Promise<{ surveyId: string }>
  onSubmittingChange?: (pending: boolean) => void
}) {
  const submitting = useRef(false)
  const [pending, setPending] = useState(false)
  const [submissionError, setSubmissionError] = useState(false)
  const [surveyId, setSurveyId] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [storageUnavailable, setStorageUnavailable] = useState(false)
  const form = useForm({
    defaultValues: emptyDraft,
    validators: {
      onSubmit: ({ value }) => {
        const result = (
          step === 1 ? feedbackSchema : newSurveyResponseSchema
        ).safeParse(value)
        if (result.success) return undefined
        const fields: Partial<Record<keyof SurveyDraft, string>> = {}
        for (const issue of result.error.issues) {
          const name = issue.path[0] as keyof SurveyDraft
          fields[name] =
            name === 'talk'
              ? 'Choose the talk you attended.'
              : name === 'rating'
                ? 'Choose a rating from 0 to 10.'
                : name === 'swagGift'
                  ? 'Choose your thank-you gift.'
                  : issue.message
        }
        return { fields }
      },
    },
    onSubmit: async ({ value }) => {
      if (step === 1) {
        await navigate(2)
        return
      }
      onSubmittingChange?.(true)
      setSubmissionError(false)
      try {
        const result = await submit(newSurveyResponseSchema.parse(value))
        setSurveyId(result.surveyId)
        form.reset(emptyDraft)
      } catch {
        setSubmissionError(true)
      } finally {
        onSubmittingChange?.(false)
      }
    },
  })

  useEffect(() => {
    try {
      form.reset(readSurveyDraft(), { keepDefaultValues: true })
    } catch {
      setStorageUnavailable(true)
    }
    setReady(true)
    let previous = form.state.values
    const subscription = form.store.subscribe(() => {
      const values = form.state.values
      if (values === previous) return
      previous = values
      try {
        saveSurveyDraft(values)
      } catch {
        setStorageUnavailable(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  useEffect(() => {
    if (
      ready &&
      !surveyId &&
      step === 2 &&
      !feedbackSchema.safeParse(form.state.values).success
    ) {
      void navigate(1, true)
    }
  }, [ready, step, form, navigate, surveyId])

  if (surveyId)
    return (
      <section
        className="panel survey-panel success-panel"
        aria-labelledby="success-heading"
      >
        <div role="status" className="feedback feedback-success">
          <h1 id="success-heading">Thank you!</h1>
          <p>Your survey has been saved.</p>
          <p>
            Survey ID: <strong className="survey-id">{surveyId}</strong>
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSurveyId(null)
            void navigate(1, true)
          }}
        >
          Start another survey
        </button>
      </section>
    )

  return (
    <section className="panel survey-panel" aria-labelledby="survey-heading">
      <p className="eyebrow">Step {step} of 2 · AI Dev Days</p>
      <h1 id="survey-heading">Take survey</h1>
      <p>All fields are required.</p>
      <ol className="survey-progress" aria-label="Survey progress">
        <li aria-current={step === 1 ? 'step' : undefined}>
          1 · Talk feedback{step === 2 && ' · Complete'}
        </li>
        <li aria-current={step === 2 ? 'step' : undefined}>
          2 · Gift and delivery
        </li>
      </ol>
      {storageUnavailable && (
        <p role="status" className="feedback feedback-info">
          Draft storage is unavailable. Keep this page open until you submit;
          refreshing or leaving may lose your answers.
        </p>
      )}
      {!ready && <p role="status">Loading your draft…</p>}
      <noscript>
        Enable JavaScript to complete the survey. Navigation remains available.
      </noscript>
      {ready && (
        <form
          noValidate
          aria-busy={pending}
          onSubmit={(event) => {
            event.preventDefault()
            if (submitting.current) return
            submitting.current = true
            setPending(true)
            void form.handleSubmit().finally(() => {
              submitting.current = false
              setPending(false)
            })
          }}
        >
          {pending && step === 2 && (
            <p role="status">
              Submitting your survey. Please stay on this page until you receive
              your ID.
            </p>
          )}
          {submissionError && (
            <p role="alert" className="feedback feedback-error">
              We could not confirm your submission. Your answers are still here.
              Please try again when connected; if you already received an ID,
              avoid submitting again.
            </p>
          )}
          <fieldset className="survey-controls" disabled={pending}>
            {step === 1 ? (
              <>
                <h2>Talk feedback</h2>
                <form.Field name="talk">
                  {(field) => (
                    <div className="survey-field">
                      <label htmlFor={field.name}>Talk attended</label>
                      <select
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(
                            event.target.value as SurveyDraft['talk'],
                          )
                        }
                        aria-invalid={field.state.meta.errors.length > 0}
                        aria-describedby="talk-error"
                        required
                      >
                        <option value="">Choose a talk</option>
                        {TALKS.map((talk) => (
                          <option key={talk}>{talk}</option>
                        ))}
                      </select>
                      <p id="talk-error" className="field-error" role="alert">
                        {field.state.meta.errors.join(' ')}
                      </p>
                    </div>
                  )}
                </form.Field>
                <form.Field name="rating">
                  {(field) => (
                    <fieldset
                      aria-describedby="rating-error"
                      aria-invalid={field.state.meta.errors.length > 0}
                    >
                      <legend>
                        How likely are you to recommend this talk?
                      </legend>
                      <div className="rating-options">
                        {Array.from({ length: 11 }, (_, rating) => (
                          <label key={rating}>
                            <input
                              type="radio"
                              name={field.name}
                              value={rating}
                              checked={field.state.value === rating}
                              onChange={() => field.handleChange(rating)}
                              required
                            />
                            {rating}
                          </label>
                        ))}
                      </div>
                      <div className="rating-endpoints">
                        <span>0 — Not at all likely</span>
                        <span>10 — Extremely likely</span>
                      </div>
                      <p id="rating-error" className="field-error" role="alert">
                        {field.state.meta.errors.join(' ')}
                      </p>
                    </fieldset>
                  )}
                </form.Field>
                <form.Field name="ratingReason">
                  {(field) => (
                    <div className="survey-field">
                      <label htmlFor={field.name}>
                        Primary reason for your rating
                      </label>
                      <textarea
                        id={field.name}
                        name={field.name}
                        rows={4}
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        aria-invalid={field.state.meta.errors.length > 0}
                        aria-describedby="ratingReason-error"
                        required
                      />
                      <p
                        id="ratingReason-error"
                        className="field-error"
                        role="alert"
                      >
                        {field.state.meta.errors.join(' ')}
                      </p>
                    </div>
                  )}
                </form.Field>
                <button type="submit">Next</button>
              </>
            ) : (
              <>
                <h2>Gift and delivery</h2>
                <form.Field name="swagGift">
                  {(field) => (
                    <div className="survey-field">
                      <label htmlFor={field.name}>Thank-you gift</label>
                      <select
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(
                            event.target.value as SurveyDraft['swagGift'],
                          )
                        }
                        aria-invalid={field.state.meta.errors.length > 0}
                        aria-describedby="swagGift-error"
                        required
                      >
                        <option value="">Choose a gift</option>
                        {SWAG_GIFTS.map((gift) => (
                          <option key={gift}>{gift}</option>
                        ))}
                      </select>
                      <p
                        id="swagGift-error"
                        className="field-error"
                        role="alert"
                      >
                        {field.state.meta.errors.join(' ')}
                      </p>
                    </div>
                  )}
                </form.Field>
                <form.Field name="name">
                  {(field) => (
                    <div className="survey-field">
                      <label htmlFor={field.name}>Full name</label>
                      <input
                        id={field.name}
                        name={field.name}
                        autoComplete="name"
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        aria-invalid={field.state.meta.errors.length > 0}
                        aria-describedby="name-error"
                        required
                      />
                      <p id="name-error" className="field-error" role="alert">
                        {field.state.meta.errors.join(' ')}
                      </p>
                    </div>
                  )}
                </form.Field>
                <form.Field name="shippingAddress">
                  {(field) => (
                    <div className="survey-field">
                      <label htmlFor={field.name}>Shipping address</label>
                      <textarea
                        id={field.name}
                        name={field.name}
                        rows={4}
                        autoComplete="shipping street-address"
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        aria-invalid={field.state.meta.errors.length > 0}
                        aria-describedby="shippingAddress-error"
                        required
                      />
                      <p
                        id="shippingAddress-error"
                        className="field-error"
                        role="alert"
                      >
                        {field.state.meta.errors.join(' ')}
                      </p>
                    </div>
                  )}
                </form.Field>
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => {
                      void navigate(1)
                    }}
                  >
                    Back
                  </button>
                  <button type="submit">
                    {pending ? 'Submitting…' : 'Submit survey'}
                  </button>
                </div>
              </>
            )}
          </fieldset>
        </form>
      )}
    </section>
  )
}
