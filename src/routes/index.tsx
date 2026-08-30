import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <section className="welcome" aria-labelledby="welcome-heading">
      <p className="eyebrow">Conference feedback</p>
      <h1 id="welcome-heading">AI Dev Days</h1>
      <p className="intro">Tell us about your talk.</p>
      <p>
        Share what worked and what could be better. Rate the talk you attended,
        tell us why, and choose a thank-you gift.
      </p>
      <Link className="button" to="/survey/new" search={{ step: 1 }}>
        Start survey
      </Link>
    </section>
  )
}
