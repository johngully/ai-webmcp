import {
  deleteSurveysSchema,
  newSurveyResponseSchema,
  surveyFiltersSchema,
} from './survey.schemas'
import type { SurveyRepository } from './survey-repository'

export function createSurveyOperations(
  repository: SurveyRepository,
  availability?: { getAvailability: () => Promise<{ enabled: boolean }> },
) {
  async function submitSurvey(input: unknown) {
    const response = await repository.create(
      newSurveyResponseSchema.parse(input),
    )
    return { surveyId: response.id }
  }
  return {
    submitSurvey,
    async submitAssistantSurvey(input: unknown) {
      if (!availability || !(await availability.getAvailability()).enabled)
        return { success: false as const, error: 'disabled' as const }
      return { success: true as const, ...(await submitSurvey(input)) }
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
