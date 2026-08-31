import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  lazy,
  Suspense,
  type ReactNode,
} from 'react'

export type AvailabilityOperations = {
  getAvailability: () => Promise<{ enabled: boolean }>
  setAvailability: (input: {
    enabled: boolean
  }) => Promise<{ enabled: boolean }>
}
const AvailabilityContext = createContext<{
  active: boolean
  needsRefresh: boolean
  enabled: boolean | null
  busy: boolean
  error: string
  save: () => Promise<void>
  refresh: () => Promise<void>
} | null>(null)

const Assistant = lazy(() =>
  import('../webmcp/survey-assistant').then((module) => ({
    default: module.SurveyAssistant,
  })),
)

export function AvailabilityProvider({
  operations,
  children,
}: {
  operations: AvailabilityOperations
  children: ReactNode
}) {
  const [enabled, setEnabled] = useState<boolean | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [needsRefresh, setNeedsRefresh] = useState(false)
  const activated = useRef(false)
  const writing = useRef(false)
  const uncertainWrite = useRef(false)
  const generation = useRef(0)
  const pendingRead = useRef<number | null>(null)
  const refresh = useCallback(async () => {
    if (writing.current || pendingRead.current !== null) return
    const request = ++generation.current
    pendingRead.current = request
    try {
      const setting = await operations.getAvailability()
      if (request !== generation.current) return
      setEnabled(setting.enabled)
      setError('')
      uncertainWrite.current = false
    } catch {
      if (request !== generation.current) return
      setEnabled(null)
      setError(
        'WebMCP availability could not be read. Assistant submission is unavailable. Try checking again.',
      )
    } finally {
      if (pendingRead.current === request) pendingRead.current = null
    }
  }, [operations])
  useEffect(() => {
    const check = () => {
      if (!uncertainWrite.current) void refresh()
    }
    check()
    const timer = window.setInterval(check, 2000)
    window.addEventListener('focus', check)
    window.addEventListener('pageshow', check)
    document.addEventListener('visibilitychange', check)
    return () => {
      ++generation.current
      pendingRead.current = null
      window.clearInterval(timer)
      window.removeEventListener('focus', check)
      window.removeEventListener('pageshow', check)
      document.removeEventListener('visibilitychange', check)
    }
  }, [refresh])
  useEffect(() => {
    if (enabled === true) activated.current = true
    else if (activated.current) setNeedsRefresh(true)
  }, [enabled])
  useEffect(() => {
    if (!needsRefresh || error) return
    const attempt = () => {
      // Form owners may defer refresh for an in-flight write or a draft that
      // cannot be persisted. Never remove browser-owned model context APIs.
      if (
        window.dispatchEvent(
          new Event('ai-dev-days:before-refresh', { cancelable: true }),
        )
      )
        window.location.reload()
    }
    const immediate = window.setTimeout(attempt, 0)
    const timer = window.setInterval(attempt, 2000)
    return () => {
      window.clearTimeout(immediate)
      window.clearInterval(timer)
    }
  }, [needsRefresh, error])
  async function save() {
    if (writing.current || enabled === null) return
    writing.current = true
    ++generation.current
    pendingRead.current = null
    setBusy(true)
    setError('')
    try {
      setEnabled(
        (await operations.setAvailability({ enabled: !enabled })).enabled,
      )
    } catch {
      uncertainWrite.current = true
      setEnabled(null)
      setError(
        'We could not confirm the WebMCP change. Check the setting before trying again.',
      )
    } finally {
      writing.current = false
      setBusy(false)
    }
  }
  return (
    <AvailabilityContext.Provider
      value={{
        enabled,
        busy,
        error,
        save,
        refresh,
        active: enabled === true && !needsRefresh,
        needsRefresh,
      }}
    >
      {children}
    </AvailabilityContext.Provider>
  )
}

export function AvailableAssistant() {
  const state = useContext(AvailabilityContext)!
  return (
    <>
      {state.active && (
        <Suspense fallback={null}>
          <Assistant />
        </Suspense>
      )}
      {state.needsRefresh && (
        <p role="status">
          Assistant availability changed. This page will refresh when your
          survey can be kept safely. Keep this page open until your submission
          is confirmed.
        </p>
      )}
    </>
  )
}

export function WebMCPControl() {
  const state = useContext(AvailabilityContext)!
  return (
    <section
      className="availability-control"
      aria-label="Assistant availability"
    >
      <button
        type="button"
        role="switch"
        aria-checked={state.enabled === true}
        aria-label="WebMCP"
        aria-describedby="webmcp-state"
        disabled={state.busy || state.enabled === null}
        onClick={() => void state.save()}
      >
        WebMCP{' '}
        <span aria-hidden="true">
          {state.enabled === null ? '?' : state.enabled ? 'On' : 'Off'}
        </span>
      </button>
      <p id="webmcp-state" aria-live="polite">
        {state.busy
          ? 'Saving WebMCP setting…'
          : state.enabled === null
            ? state.error
              ? 'WebMCP state unconfirmed.'
              : 'Checking WebMCP availability…'
            : state.enabled
              ? 'WebMCP enabled.'
              : 'WebMCP disabled.'}
      </p>
      <p>
        Allow assistants to submit conference feedback. The survey remains
        available to attendees.
      </p>
      {state.error && (
        <>
          <p role="alert" className="feedback feedback-error">
            {state.error}
          </p>
          <button
            type="button"
            disabled={state.busy}
            onClick={() => void state.refresh()}
          >
            Check setting
          </button>
        </>
      )}
    </section>
  )
}
