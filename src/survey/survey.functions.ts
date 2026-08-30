import { createServerFn } from '@tanstack/react-start'
import {
  deleteSurveysSchema,
  newSurveyResponseSchema,
  surveyFiltersSchema,
} from './survey.schemas'
import { getSurveyOperations } from './survey.service.server'

export const submitSurvey = createServerFn({ method: 'POST' })
  .validator(newSurveyResponseSchema)
  .handler(({ data }) => getSurveyOperations().submitSurvey(data))

export const findSurveys = createServerFn({ method: 'GET' })
  .validator(surveyFiltersSchema)
  .handler(({ data }) => getSurveyOperations().findSurveys(data))

export const deleteSurveys = createServerFn({ method: 'POST' })
  .validator(deleteSurveysSchema)
  .handler(({ data }) => getSurveyOperations().deleteSurveys(data))
