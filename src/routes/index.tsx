import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <section aria-labelledby="welcome-heading">
      <p className="eyebrow">Conference feedback · Local demo</p>
      <h1 id="welcome-heading">AI Dev Days</h1>
      <p className="intro">Your experience. Two ways to share it.</p>
      <p>
        This demo will compare a browser agent using the two-step form with a
        WebMCP agent submitting the same answers in one structured tool call.
      </p>
      <p className="feedback feedback-info">
        Foundation preview: survey submission and WebMCP are not available yet.
      </p>
    </section>
  )
}
