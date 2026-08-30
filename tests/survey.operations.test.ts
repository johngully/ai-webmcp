import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, test, vi } from 'vitest'
import { createJsonlSurveyRepository } from '../src/survey/survey-repository.server'
import { createSurveyOperations } from '../src/survey/survey.operations.server'
import { surveyInput } from './survey.fixture'

test('application operations submit, find, and delete through persistent storage with validated input', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'ai-survey-operations-'))
  try {
    const file = join(directory, 'surveys.jsonl')
    const operations = createSurveyOperations(createJsonlSurveyRepository(file))
    await expect(
      operations.submitSurvey({ ...surveyInput, rating: 11 }),
    ).rejects.toThrow()
    expect(await operations.findSurveys()).toEqual([])
    const { surveyId } = await operations.submitSurvey({
      ...surveyInput,
      name: ' Ada Lovelace ',
    })
    expect(surveyId).toMatch(/^[2-9A-HJ-NP-Z]{3}-[2-9A-HJ-NP-Z]{3}$/)
    const reopened = createSurveyOperations(createJsonlSurveyRepository(file))
    expect(
      await reopened.findSurveys({ name: 'ADA', minRating: 9, maxRating: 9 }),
    ).toEqual([expect.objectContaining({ ...surveyInput, id: surveyId })])
    await expect(
      reopened.findSurveys({ minRating: 10, maxRating: 2 }),
    ).rejects.toThrow()
    await expect(
      reopened.deleteSurveys({ ids: [surveyId, 'invalid'] }),
    ).rejects.toThrow()
    expect(
      await reopened.deleteSurveys({ ids: [surveyId.toLowerCase(), surveyId] }),
    ).toEqual({ deletedCount: 1 })
    expect(await operations.findSurveys()).toEqual([])
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('server operation resolution honors the configured data path and retains data between resolutions', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'ai-survey-configured-'))
  vi.stubEnv('SURVEY_DATA_FILE', join(directory, 'custom', 'responses.jsonl'))
  try {
    const { getSurveyOperations } =
      await import('../src/survey/survey.service.server')
    const first = getSurveyOperations()
    const { surveyId } = await first.submitSurvey(surveyInput)
    expect(await getSurveyOperations().findSurveys()).toEqual([
      expect.objectContaining({ id: surveyId }),
    ])
    expect(await first.deleteSurveys({ ids: [surveyId] })).toEqual({
      deletedCount: 1,
    })
  } finally {
    vi.unstubAllEnvs()
    await rm(directory, { recursive: true, force: true })
  }
})
