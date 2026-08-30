import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/survey/')({
  component: ManagementPage,
})

function ManagementPage() {
  return (
    <section className="panel" aria-labelledby="management-heading">
      <p className="eyebrow">Conference feedback</p>
      <h1 id="management-heading">Manage responses</h1>
      <p>Response management is currently unavailable.</p>
    </section>
  )
}
