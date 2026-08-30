import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/survey/')({
  component: ManagementPreview,
})

function ManagementPreview() {
  return (
    <section className="panel" aria-labelledby="management-heading">
      <p className="eyebrow">Foundation preview</p>
      <h1 id="management-heading">Manage responses</h1>
      <p>Phase 3 placeholder: response management is not available yet.</p>
      <p>
        This local demo will not require authentication. Do not expose it
        publicly.
      </p>
    </section>
  )
}
