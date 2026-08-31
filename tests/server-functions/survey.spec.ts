import { expect, test } from '../support/browser.fixture'
import { surveyInput } from '../survey.fixture'

test('browser callers submit, query, validate, and delete through real TanStack server functions', async ({
  page,
}) => {
  const pageErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  await page.goto('/')
  // Import the same public module that the later UI and WebMCP phases consume.
  // Vite compiles its client RPC stubs; handlers execute in the real Node server.
  const result = await page.evaluate(async (input) => {
    const moduleUrl = '/src/survey/survey.functions.ts'
    const api = await import(/* @vite-ignore */ moduleUrl)
    const invalid = await api
      .submitSurvey({ data: { ...input, rating: 11 } })
      .then(
        () => false,
        () => true,
      )
    const { surveyId } = await api.submitSurvey({
      data: { ...input, name: ' Ada Lovelace ' },
    })
    const rows = await api.findSurveys({
      data: { name: 'ADA', minRating: 9, maxRating: 9 },
    })
    const invalidDelete = await api
      .deleteSurveys({ data: { ids: [surveyId, 'bad'] } })
      .then(
        () => false,
        () => true,
      )
    const deletion = await api.deleteSurveys({
      data: { ids: [surveyId.toLowerCase(), surveyId] },
    })
    const remaining = await api.findSurveys()
    return { invalid, surveyId, rows, invalidDelete, deletion, remaining }
  }, surveyInput)
  expect(result.invalid).toBe(true)
  expect(result.surveyId).toMatch(/^[2-9A-HJ-NP-Z]{3}-[2-9A-HJ-NP-Z]{3}$/)
  expect(result.rows).toEqual([
    expect.objectContaining({ ...surveyInput, id: result.surveyId }),
  ])
  expect(result.invalidDelete).toBe(true)
  expect(result.deletion).toEqual({ deletedCount: 1 })
  expect(result.remaining).toEqual([])
  expect(pageErrors).toEqual([])
})

test('stale assistant RPC is refused after disabling while manual submission uses the shared operation', async ({
  page,
}) => {
  await page.goto('/survey')
  await expect(page.getByText('WebMCP enabled.')).toBeVisible()
  await page.getByRole('switch', { name: 'WebMCP' }).click()
  await expect(page.getByText('WebMCP disabled.')).toBeVisible()
  const result = await page.evaluate(
    async (input) => {
      const moduleUrl = '/src/survey/survey.functions.ts'
      const api = await import(/* @vite-ignore */ moduleUrl)
      const stale = await api.submitAssistantSurvey({ data: input })
      const afterStale = await api.findSurveys()
      const manual = await api.submitSurvey({ data: input })
      const afterManual = await api.findSurveys()
      return { stale, afterStale, manual, afterManual }
    },
    { ...surveyInput, name: 'Fictional Stale Client' },
  )
  expect(result.stale).toEqual({ success: false, error: 'disabled' })
  expect(result.afterStale).toEqual([])
  expect(result.afterManual).toEqual([
    expect.objectContaining({ id: result.manual.surveyId }),
  ])
})
