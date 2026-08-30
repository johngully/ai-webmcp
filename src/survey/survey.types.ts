import type { z } from 'zod'
import type { SWAG_GIFTS, TALKS } from './survey.constants'
import type {
  newSurveyResponseSchema,
  surveyFiltersSchema,
  surveyResponseSchema,
} from './survey.schemas'

export type Talk = (typeof TALKS)[number]
export type SwagGift = (typeof SWAG_GIFTS)[number]
export type NewSurveyResponse = z.infer<typeof newSurveyResponseSchema>
export type SurveyFilters = z.infer<typeof surveyFiltersSchema>
export type SurveyResponse = z.infer<typeof surveyResponseSchema>
