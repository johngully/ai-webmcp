import type {
  NewSurveyResponse,
  SurveyFilters,
  SurveyResponse,
} from './survey.types'
import { surveyFiltersSchema } from './survey.schemas'
import { generateSurveyId, normalizeSurveyId } from './survey-id'

export interface SurveyRepository {
  create(input: NewSurveyResponse): Promise<SurveyResponse>
  find(filters?: SurveyFilters): Promise<SurveyResponse[]>
  deleteMany(ids: string[]): Promise<number>
}

export interface RepositoryOptions {
  generateId?: () => string
  now?: () => Date
}

export function uniqueSurveyId(
  records: SurveyResponse[],
  generateId = generateSurveyId,
): string {
  let id: string
  do {
    id = normalizeSurveyId(generateId())
  } while (records.some((record) => record.id === id))
  return id
}

export function filterSurveys(
  records: SurveyResponse[],
  input?: SurveyFilters,
): SurveyResponse[] {
  const filters = surveyFiltersSchema.parse(input)
  return (
    records
      .filter(
        (record) =>
          (!filters.name ||
            record.name.toLowerCase().includes(filters.name.toLowerCase())) &&
          (!filters.talk || record.talk === filters.talk) &&
          (filters.minRating === undefined ||
            record.rating >= filters.minRating) &&
          (filters.maxRating === undefined ||
            record.rating <= filters.maxRating),
      )
      // Stable sort preserves reverse insertion order when timestamps tie.
      .reverse()
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
      .map((record) => ({ ...record }))
  )
}
