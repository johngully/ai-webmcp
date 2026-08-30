import { newSurveyResponseSchema } from './survey.schemas'
import { normalizeSurveyId } from './survey-id'
import type { RepositoryOptions, SurveyRepository } from './survey-repository'
import { filterSurveys, uniqueSurveyId } from './survey-repository'
import type { SurveyResponse } from './survey.types'

export function createMemorySurveyRepository(
  options: RepositoryOptions = {},
): SurveyRepository {
  let records: SurveyResponse[] = []
  return {
    async create(input) {
      const data = newSurveyResponseSchema.parse(input)
      const response = {
        ...data,
        id: uniqueSurveyId(records, options.generateId),
        submittedAt: (options.now?.() ?? new Date()).toISOString(),
      }
      records.push(response)
      return { ...response }
    },
    async find(filters) {
      return filterSurveys(records, filters)
    },
    async deleteMany(ids) {
      const requested = new Set(ids.map(normalizeSurveyId))
      const previousCount = records.length
      records = records.filter((record) => !requested.has(record.id))
      return previousCount - records.length
    },
  }
}
