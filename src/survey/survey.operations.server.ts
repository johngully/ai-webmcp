import {
  deleteSurveysSchema,
  newSurveyResponseSchema,
  surveyFiltersSchema,
} from './survey.schemas'
import type { SurveyRepository } from './survey-repository'

export function createSurveyOperations(repository: SurveyRepository) {
  return {
    async submitSurvey(input: unknown) {
      const response = await repository.create(
        newSurveyResponseSchema.parse(input),
      )
      return { surveyId: response.id }
    },
    async findSurveys(input?: unknown) {
      return repository.find(surveyFiltersSchema.parse(input))
    },
    async deleteSurveys(input: unknown) {
      const { ids } = deleteSurveysSchema.parse(input)
      return { deletedCount: await repository.deleteMany(ids) }
    },
  }
}
