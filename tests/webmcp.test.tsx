import {
  cleanupWebMCPPolyfill,
  initializeWebMCPPolyfill,
} from '@mcp-b/webmcp-polyfill'
import type { ChromeModelContext } from '@mcp-b/webmcp-types'
import { afterEach, expect, test } from 'vitest'
import { createSurveyOperations } from '../src/survey/survey.operations.server'
import { createMemorySurveyRepository } from '../src/survey/survey-repository.memory'
import { registerSurveyTool } from '../src/webmcp/register-survey-tool'
import { surveyInput } from './survey.fixture'

afterEach(cleanupWebMCPPolyfill)

test('submission failure hides server details and warns against automatic retries', async () => {
  initializeWebMCPPolyfill()
  const context = document.modelContext as ChromeModelContext
  // Transport boundary: a response can be lost after the server commits.
  const operations = createSurveyOperations(createMemorySurveyRepository())
  await registerSurveyTool(context, {
    signal: new AbortController().signal,
    submit: async (input) => {
      await operations.submitSurvey(input)
      throw new Error('secret internal path /srv/private/surveys.jsonl')
    },
  })
  const [tool] = await context.getTools()
  const result = JSON.parse(
    (await context.executeTool!(tool, JSON.stringify(surveyInput)))!,
  )
  expect(result).toMatchObject({
    success: false,
    error: 'submission',
    message: expect.stringMatching(/check.*responses.*before.*try/i),
  })
  expect(JSON.stringify(result)).not.toMatch(/secret|private|jsonl/)
  expect(await operations.findSurveys()).toHaveLength(1)
})

test('assistant receives field corrections without saving invalid answers and can correct the call', async () => {
  initializeWebMCPPolyfill()
  const context = document.modelContext as ChromeModelContext
  const operations = createSurveyOperations(createMemorySurveyRepository())
  await registerSurveyTool(context, {
    signal: new AbortController().signal,
    submit: operations.submitSurvey,
  })
  const [tool] = await context.getTools()
  const invalid = { ...surveyInput, rating: 11, shippingAddress: '   ' }
  const result = JSON.parse(
    (await context.executeTool!(tool, JSON.stringify(invalid)))!,
  )
  expect(result).toMatchObject({
    success: false,
    error: 'validation',
    message: expect.stringMatching(/correct/i),
  })
  expect(result.fields).toEqual([
    { field: 'rating', message: expect.stringMatching(/10/) },
    { field: 'shippingAddress', message: 'This field is required' },
  ])
  expect(await operations.findSurveys()).toEqual([])
  const corrected = JSON.parse(
    (await context.executeTool!(tool, JSON.stringify(surveyInput)))!,
  )
  expect(corrected.success).toBe(true)
  expect(await operations.findSurveys()).toHaveLength(1)
})

test('assistant discovers the complete survey contract and submits exactly one response', async () => {
  initializeWebMCPPolyfill()
  const context = document.modelContext as ChromeModelContext
  const operations = createSurveyOperations(createMemorySurveyRepository())
  const registration = new AbortController()
  await registerSurveyTool(context, {
    signal: registration.signal,
    submit: operations.submitSurvey,
  })

  const tools = await context.getTools()
  expect(tools).toHaveLength(1)
  const [tool] = tools
  expect(tool.name).toBe('submit_ai_dev_days_survey')
  expect(tool.description).toMatch(/creates one.*response/i)
  expect(tool.description).toMatch(/does not.*delete/i)
  expect(tool.description).toMatch(/repeating.*another response/i)
  expect(tool.description).not.toMatch(/demo|preview|development|presenter/i)
  expect(tool.annotations).toMatchObject({ readOnlyHint: false })
  expect(tool.inputSchema).toMatchObject({
    type: 'object',
    required: [
      'talk',
      'rating',
      'ratingReason',
      'swagGift',
      'name',
      'shippingAddress',
    ],
    properties: {
      talk: {
        type: 'string',
        description: 'The AI Dev Days talk you attended',
        enum: [
          'Building Reliable AI Agents',
          'Multimodal Apps with Modern Models',
          'Retrieval-Augmented Generation in Production',
          'Building Agent-Ready Websites with WebMCP',
          'Evaluating and Securing LLM Applications',
        ],
      },
      rating: {
        type: 'integer',
        minimum: 0,
        maximum: 10,
        description: 'Likelihood to recommend the talk, from 0 to 10',
      },
      ratingReason: {
        type: 'string',
        minLength: 1,
        description: 'Primary reason for your rating',
      },
      swagGift: {
        type: 'string',
        enum: ['Hoodie', 'Headphones', 'Keyboard'],
        description: 'Your preferred thank-you gift',
      },
      name: { type: 'string', minLength: 1, description: 'Your full name' },
      shippingAddress: {
        type: 'string',
        minLength: 1,
        description: 'Shipping address for your gift',
      },
    },
  })
  const result = JSON.parse(
    (await context.executeTool!(
      tool,
      JSON.stringify({ ...surveyInput, name: ' Ada Lovelace ' }),
    ))!,
  )
  expect(result).toEqual({
    success: true,
    surveyId: expect.stringMatching(/^[A-Z0-9]{3}-[A-Z0-9]{3}$/),
  })
  const responses = await operations.findSurveys()
  expect(responses).toEqual([
    { ...surveyInput, id: result.surveyId, submittedAt: expect.any(String) },
  ])
  registration.abort()
  expect(await context.getTools()).toEqual([])
})
