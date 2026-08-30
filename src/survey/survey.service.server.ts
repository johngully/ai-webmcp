import { surveyDataFile } from '../../survey.config'
import { createSurveyOperations } from './survey.operations.server'
import { createJsonlSurveyRepository } from './survey-repository.server'

export function getSurveyOperations() {
  return createSurveyOperations(createJsonlSurveyRepository(surveyDataFile))
}
