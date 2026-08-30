import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/survey/new')({
  // This preview only exposes the initial step. Phase 2 owns form navigation.
  validateSearch: () => ({ step: 1 }),
  component: SurveyPreview,
})

function SurveyPreview() {
  return (
    <section className="panel" aria-labelledby="survey-heading">
      <p className="eyebrow">Foundation preview</p>
      <h1 id="survey-heading">Take survey</h1>
      <p>Phase 2 placeholder: the two-step survey is not available yet.</p>
      <p>No answers are collected or saved in this preview.</p>
    </section>
  )
}
