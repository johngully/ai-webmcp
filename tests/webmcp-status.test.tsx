import { cleanupWebMCPPolyfill } from '@mcp-b/webmcp-polyfill'
import type { ChromeModelContext } from '@mcp-b/webmcp-types'
import { act, render, screen } from '@testing-library/react'
import { StrictMode } from 'react'
import { afterEach, expect, test, vi } from 'vitest'
import { createSurveyOperations } from '../src/survey/survey.operations.server'
import { createMemorySurveyRepository } from '../src/survey/survey-repository.memory'
import { SurveyAssistant } from '../src/webmcp/survey-assistant'
import { surveyInput } from './survey.fixture'

afterEach(cleanupWebMCPPolyfill)
afterEach(() => vi.unstubAllGlobals())

test('unmount during pending registration contains the expected abort rejection', async () => {
  let started!: () => void
  const registering = new Promise<void>((resolve) => {
    started = resolve
  })
  const native = Object.assign(new EventTarget(), {
    registerTool: (_tool: unknown, { signal }: { signal: AbortSignal }) =>
      new Promise<void>((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(signal.reason), {
          once: true,
        })
        started()
      }),
  })
  Object.defineProperty(document, 'modelContext', {
    configurable: true,
    value: native,
  })
  try {
    const view = render(<SurveyAssistant />)
    await act(async () => {
      await registering
    })
    view.unmount()
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })
    expect(
      screen.queryByLabelText('Assistant submission'),
    ).not.toBeInTheDocument()
  } finally {
    Reflect.deleteProperty(document, 'modelContext')
  }
})

test('unavailable assistant leaves the manual survey accessible', async () => {
  vi.stubGlobal('isSecureContext', false)
  render(<SurveyAssistant />)
  expect(
    await screen.findByText(
      'Assistant submission unavailable. You can still take the survey.',
    ),
  ).toBeVisible()
  expect(document.modelContext).toBeUndefined()
})

test('native registration failure is contained and does not replace the browser context', async () => {
  const native = Object.assign(new EventTarget(), {
    registerTool: async () => {
      throw new Error('private browser failure')
    },
  })
  Object.defineProperty(document, 'modelContext', {
    configurable: true,
    value: native,
  })
  try {
    render(<SurveyAssistant />)
    expect(
      await screen.findByText(
        'Assistant submission could not connect. You can still take the survey.',
      ),
    ).toBeVisible()
    expect(document.modelContext).toBe(native)
    expect(document.body).not.toHaveTextContent('private browser failure')
  } finally {
    Reflect.deleteProperty(document, 'modelContext')
  }
})

test('assistant becomes available after hydration, announces its saved ID, and cleans up on remount', async () => {
  const operations = createSurveyOperations(createMemorySurveyRepository())
  const first = render(
    <StrictMode>
      <SurveyAssistant submit={operations.submitSurvey} />
    </StrictMode>,
  )
  expect(
    await screen.findByText('Assistant submission available.'),
  ).toBeVisible()
  const context = document.modelContext as ChromeModelContext
  const [tool] = await context.getTools()
  expect(await context.getTools()).toHaveLength(1)
  await act(async () => {
    await context.executeTool!(tool, JSON.stringify(surveyInput))
  })
  const [response] = await operations.findSurveys()
  expect(
    screen.getByRole('status', { name: 'Assistant submission result' }),
  ).toHaveTextContent(`Survey ID: ${response.id}`)
  first.unmount()
  expect(await context.getTools()).toEqual([])
  render(
    <StrictMode>
      <SurveyAssistant submit={operations.submitSurvey} />
    </StrictMode>,
  )
  expect(
    await screen.findByText('Assistant submission available.'),
  ).toBeVisible()
  expect(await context.getTools()).toHaveLength(1)
})
