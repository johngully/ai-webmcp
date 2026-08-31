import { cleanupWebMCPPolyfill } from '@mcp-b/webmcp-polyfill'
import { afterEach } from 'vitest'
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createMemoryHistory, RouterProvider } from '@tanstack/react-router'
import {
  act,
  cleanup,
  render,
  screen,
  waitFor,
  fireEvent,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import {
  AvailabilityProvider,
  WebMCPControl,
} from '../src/availability/availability'
import { getRouter } from '../src/router'
import { createSurveyOperations } from '../src/survey/survey.operations.server'
import { createMemorySurveyRepository } from '../src/survey/survey-repository.memory'
import { createAvailabilityOperations } from '../src/availability/availability.operations.server'

afterEach(cleanupWebMCPPolyfill)
const management = createSurveyOperations(createMemorySurveyRepository())
async function show(
  availability: ReturnType<typeof createAvailabilityOperations>,
) {
  const router = getRouter({ management, availability })
  router.update({
    context: router.options.context,
    history: createMemoryHistory({ initialEntries: ['/survey'] }),
  })
  await router.load()
  render(<RouterProvider router={router} />, { container: document })
}

test('organizer can turn default-enabled WebMCP off and retain the choice after reopening management', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'ai-availability-ui-'))
  const file = join(directory, 'surveys.jsonl')
  try {
    await show(createAvailabilityOperations(file))
    await screen.findByText('WebMCP enabled.')
    const control = await screen.findByRole('switch', { name: 'WebMCP' })
    expect(control).toBeChecked()
    await userEvent.click(control)
    expect(await screen.findByText('WebMCP disabled.')).toBeVisible()
    expect(control).not.toBeChecked()
    cleanup()
    await show(createAvailabilityOperations(file))
    await screen.findByText('WebMCP disabled.')
    expect(
      await screen.findByRole('switch', { name: 'WebMCP' }),
    ).not.toBeChecked()
  } finally {
    cleanup()
    await rm(directory, { recursive: true, force: true })
  }
})

test('uncertain saving reports no success, prevents another change, and recovers by checking server state', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'ai-availability-failure-'))
  const operations = createAvailabilityOperations(
    join(directory, 'surveys.jsonl'),
  )
  let rejectWrite!: (error: Error) => void
  try {
    await show({
      ...operations,
      setAvailability: () =>
        new Promise((_, reject) => {
          rejectWrite = reject
        }),
    })
    await screen.findByText('WebMCP enabled.')
    const control = await screen.findByRole('switch', { name: 'WebMCP' })
    await userEvent.click(control)
    expect(control).toBeDisabled()
    expect(screen.getByText('Saving WebMCP setting…')).toBeVisible()
    rejectWrite(new Error('Connection lost'))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'could not confirm',
    )
    expect(control).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'Check setting' }))
    expect(await screen.findByText('WebMCP enabled.')).toBeVisible()
    expect(control).toBeEnabled()
  } finally {
    cleanup()
    await rm(directory, { recursive: true, force: true })
  }
})

test('a disabled document has no assistant integration and enabling restores just one tool', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'ai-availability-lifecycle-'))
  const operations = createAvailabilityOperations(
    join(directory, 'surveys.jsonl'),
  )
  try {
    await operations.setAvailability({ enabled: false })
    await show(operations)
    await screen.findByText('WebMCP disabled.')
    expect(
      screen.queryByLabelText('Assistant submission'),
    ).not.toBeInTheDocument()
    expect(document.modelContext).toBeUndefined()
    await userEvent.click(screen.getByRole('switch', { name: 'WebMCP' }))
    expect(
      await screen.findByText('Assistant submission available.'),
    ).toBeVisible()
    const context = document.modelContext!
    expect(await context.getTools()).toHaveLength(1)
    await act(async () => {
      await operations.setAvailability({ enabled: false })
      fireEvent.focus(window)
    })
    await screen.findByText('WebMCP disabled.')
    await waitFor(async () => expect(await context.getTools()).toEqual([]))
  } finally {
    cleanup()
    await rm(directory, { recursive: true, force: true })
  }
})

test('unreadable settings fail closed and checking after repair restores the saved off state', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'ai-availability-read-'))
  const file = join(directory, 'surveys.jsonl')
  try {
    await writeFile(`${file}.webmcp.json`, 'invalid settings')
    await show(createAvailabilityOperations(file))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'could not be read',
    )
    expect(screen.getByRole('switch', { name: 'WebMCP' })).toBeDisabled()
    expect(
      screen.queryByLabelText('Assistant submission'),
    ).not.toBeInTheDocument()
    await writeFile(`${file}.webmcp.json`, '{"enabled":false}')
    await userEvent.click(screen.getByRole('button', { name: 'Check setting' }))
    expect(await screen.findByText('WebMCP disabled.')).toBeVisible()
    expect(screen.getByRole('switch', { name: 'WebMCP' })).toBeEnabled()
  } finally {
    cleanup()
    await rm(directory, { recursive: true, force: true })
  }
})

test('filesystem failure cannot report a saved setting or alter the responses', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'ai-availability-write-'))
  const file = join(directory, 'surveys.jsonl')
  const operations = createAvailabilityOperations(file)
  try {
    await show(operations)
    await screen.findByText('WebMCP enabled.')
    await mkdir(`${file}.webmcp.json`)
    await userEvent.click(screen.getByRole('switch', { name: 'WebMCP' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'could not confirm',
    )
    await rm(`${file}.webmcp.json`, { recursive: true })
    await userEvent.click(screen.getByRole('button', { name: 'Check setting' }))
    await screen.findByText('WebMCP enabled.')
    await userEvent.click(screen.getByRole('switch', { name: 'WebMCP' }))
    expect(await screen.findByText('WebMCP disabled.')).toBeVisible()
  } finally {
    cleanup()
    await rm(directory, { recursive: true, force: true })
  }
})

test('a slow availability response still confirms management state instead of being displaced by polling', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'ai-availability-slow-'))
  const operations = createAvailabilityOperations(
    join(directory, 'surveys.jsonl'),
  )
  await operations.setAvailability({ enabled: false })
  const serverReply = await operations.getAvailability()
  vi.useFakeTimers()
  try {
    // Delay the real server reply at the browser transport boundary beyond one
    // polling interval. Repeated checks must not discard every usable reply.
    render(
      <AvailabilityProvider
        operations={{
          ...operations,
          getAvailability: () =>
            new Promise((resolve) =>
              setTimeout(() => resolve(serverReply), 2500),
            ),
        }}
      >
        <WebMCPControl />
      </AvailabilityProvider>,
    )
    await act(async () => {
      await vi.advanceTimersByTimeAsync(6000)
    })
    expect(screen.getByText('WebMCP disabled.')).toBeVisible()
    expect(screen.getByRole('switch', { name: 'WebMCP' })).toBeEnabled()
  } finally {
    cleanup()
    vi.useRealTimers()
    await rm(directory, { recursive: true, force: true })
  }
})
