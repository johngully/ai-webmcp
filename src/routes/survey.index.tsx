import { useEffect, useRef, useState } from 'react'
import { ManagementDialog } from '../survey/management-dialog'
import type { SurveyResponse } from '../survey/survey.types'
import {
  createFileRoute,
  redirect,
  useRouter,
  useBlocker,
} from '@tanstack/react-router'
import {
  managementSearch,
  managementFilters,
} from '../survey/management-search'
import { TALKS } from '../survey/survey.constants'

export const Route = createFileRoute('/survey/')({
  validateSearch: managementSearch,
  beforeLoad: ({ search, location }) => {
    const canonical = managementSearch(search)
    if (JSON.stringify(canonical) !== JSON.stringify(location.search)) {
      throw redirect({ to: '/survey', search: canonical, replace: true })
    }
  },
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => {
    const filters = managementFilters(deps)
    return filters.success ? context.management.findSurveys(filters.data) : []
  },
  component: ManagementPage,
})

function ManagementPage() {
  const router = useRouter()
  const { management } = Route.useRouteContext()
  const [pendingDelete, setPendingDelete] = useState<SurveyResponse[] | null>(
    null,
  )
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState('')
  const [deleteError, setDeleteError] = useState('')
  useBlocker({ shouldBlockFn: () => deleting, enableBeforeUnload: deleting })
  async function confirmDeletion() {
    if (!pendingDelete || deleting) return
    setDeleting(true)
    setDeleteError('')
    try {
      const { deletedCount } = await management.deleteSurveys({
        ids: pendingDelete.map((response) => response.id),
      })
      await router.invalidate({ sync: true })
      setSelected([])
      setMessage(
        `Deleted ${deletedCount} response${deletedCount === 1 ? '' : 's'}.`,
      )
      setPendingDelete(null)
    } catch {
      setDeleteError(
        'We could not confirm the deletion. Your selection is kept. Try again.',
      )
    } finally {
      setDeleting(false)
    }
  }
  function requestDeletion(responses: SurveyResponse[]) {
    setDeleteError('')
    setMessage('')
    setPendingDelete(responses)
  }
  const [details, setDetails] = useState<SurveyResponse | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const selectAllRef = useRef<HTMLInputElement>(null)
  const responses = Route.useLoaderData()
  const visibleSelected = selected.filter((id) =>
    responses.some((response) => response.id === id),
  )
  useEffect(() => {
    setSelected((ids) =>
      ids.filter((id) => responses.some((response) => response.id === id)),
    )
  }, [responses])
  useEffect(() => {
    if (selectAllRef.current)
      selectAllRef.current.indeterminate =
        visibleSelected.length > 0 && visibleSelected.length < responses.length
  }, [visibleSelected.length, responses.length])
  const search = Route.useSearch()
  const filters = managementFilters(search)
  const navigate = Route.useNavigate()
  return (
    <section
      className="panel management-panel"
      aria-labelledby="management-heading"
    >
      <p className="eyebrow">Conference feedback</p>
      <h1 id="management-heading" tabIndex={-1}>
        Manage responses
      </h1>
      <p className="response-count">
        {responses.length} response{responses.length === 1 ? '' : 's'} shown
      </p>
      <form
        key={JSON.stringify(search)}
        onSubmit={(event) => {
          event.preventDefault()
          void navigate({
            search: managementSearch(
              Object.fromEntries(new FormData(event.currentTarget)),
            ),
          })
        }}
      >
        <div className="management-filters">
          <label>
            Name contains
            <input name="name" defaultValue={search.name} type="search" />
          </label>
          <label>
            Talk
            <select name="talk" defaultValue={search.talk ?? ''}>
              <option value="">All talks</option>
              {TALKS.map((talk) => (
                <option key={talk}>{talk}</option>
              ))}
            </select>
          </label>
          <label>
            Minimum rating
            <input
              name="ratingMin"
              type="number"
              min="0"
              max="10"
              step="1"
              defaultValue={search.ratingMin}
            />
          </label>
          <label>
            Maximum rating
            <input
              name="ratingMax"
              type="number"
              min="0"
              max="10"
              step="1"
              defaultValue={search.ratingMax}
            />
          </label>
        </div>
        <div className="form-actions">
          <button type="submit">Apply</button>
          <button type="button" onClick={() => void navigate({ search: {} })}>
            Clear
          </button>
        </div>
      </form>
      {message && (
        <p className="feedback feedback-success" role="status">
          {message}
        </p>
      )}
      <div className="selection-actions">
        <p>{visibleSelected.length} selected</p>
        <button
          className="button-danger"
          type="button"
          disabled={!visibleSelected.length}
          onClick={() =>
            requestDeletion(
              responses.filter((response) =>
                visibleSelected.includes(response.id),
              ),
            )
          }
        >
          Delete selected ({visibleSelected.length})
        </button>
      </div>
      {responses.length > 0 && (
        <label className="select-visible">
          <input
            ref={selectAllRef}
            type="checkbox"
            checked={visibleSelected.length === responses.length}
            onChange={(event) =>
              setSelected(
                event.target.checked
                  ? responses.map((response) => response.id)
                  : [],
              )
            }
          />
          Select all visible responses
        </label>
      )}
      {!filters.success ? (
        <p className="feedback feedback-error" role="alert">
          Check your filters.{' '}
          {filters.error.issues.map((issue) => issue.message).join('. ')}.
          Ratings must be whole numbers from 0 to 10.
        </p>
      ) : responses.length === 0 ? (
        <p>
          {Object.keys(search).length
            ? 'No responses match these filters.'
            : 'No responses yet.'}
        </p>
      ) : (
        <div
          className="table-scroll"
          role="region"
          aria-label="Response table"
          tabIndex={0}
        >
          <table>
            <caption>Survey responses</caption>
            <thead>
              <tr>
                {[
                  'Select',
                  'ID',
                  'Name',
                  'Talk',
                  'Rating',
                  'Gift',
                  'Submitted',
                  'Actions',
                ].map((heading) => (
                  <th key={heading} scope="col">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {responses.map((response) => (
                <tr key={response.id}>
                  <td>
                    <label className="row-select">
                      <input
                        type="checkbox"
                        aria-label={`Select ${response.name}`}
                        checked={visibleSelected.includes(response.id)}
                        onChange={(event) =>
                          setSelected(
                            event.target.checked
                              ? [...visibleSelected, response.id]
                              : visibleSelected.filter(
                                  (id) => id !== response.id,
                                ),
                          )
                        }
                      />
                    </label>
                  </td>
                  <td>{response.id}</td>
                  <td>{response.name}</td>
                  <td>{response.talk}</td>
                  <td>{response.rating}</td>
                  <td>{response.swagGift}</td>
                  <td>
                    <time dateTime={response.submittedAt}>
                      {response.submittedAt}
                    </time>
                  </td>
                  <td>
                    <button
                      className="button-secondary"
                      type="button"
                      onClick={() => setDetails(response)}
                    >
                      Details
                    </button>
                    <button
                      className="button-danger"
                      type="button"
                      onClick={() => requestDeletion([response])}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pendingDelete && (
        <ManagementDialog
          title={
            pendingDelete.length === 1
              ? 'Delete response?'
              : `Delete ${pendingDelete.length} responses?`
          }
          busy={deleting}
          onDismiss={() => setPendingDelete(null)}
        >
          <p>
            This permanently removes {pendingDelete.length} selected response
            {pendingDelete.length === 1 ? '' : 's'}.
          </p>
          <ul>
            {pendingDelete.map((response) => (
              <li key={response.id}>
                {response.id} · {response.name}
              </li>
            ))}
          </ul>
          {deleteError && (
            <p className="feedback feedback-error" role="alert">
              {deleteError}
            </p>
          )}
          <div className="form-actions">
            <button
              type="button"
              disabled={deleting}
              onClick={() => setPendingDelete(null)}
            >
              Cancel
            </button>
            <button
              className="button-danger"
              type="button"
              disabled={deleting}
              onClick={() => void confirmDeletion()}
            >
              {deleting ? 'Deleting…' : 'Confirm deletion'}
            </button>
          </div>
        </ManagementDialog>
      )}
      {details && (
        <ManagementDialog
          title="Response details"
          onDismiss={() => setDetails(null)}
        >
          <dl className="response-details">
            {[
              ['ID', details.id],
              ['Name', details.name],
              ['Talk', details.talk],
              ['Rating', `${details.rating} / 10`],
              ['Primary reason for rating', details.ratingReason],
              ['Gift', details.swagGift],
              ['Shipping address', details.shippingAddress],
              ['Submitted', details.submittedAt],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <button type="button" onClick={() => setDetails(null)}>
            Close details
          </button>
        </ManagementDialog>
      )}
    </section>
  )
}
