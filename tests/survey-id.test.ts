import { expect, test } from 'vitest'
import { customRandom } from 'nanoid'
import {
  generateSurveyId,
  normalizeSurveyId,
  SURVEY_ID_ALPHABET,
} from '../src/survey/survey-id'

test('survey IDs use six unambiguous characters and normalize either input case', () => {
  const sequence = customRandom(SURVEY_ID_ALPHABET, 6, (size) =>
    new Uint8Array(size).fill(2),
  )
  expect(generateSurveyId(sequence)).toBe('444-444')
  expect(generateSurveyId()).toMatch(/^[2-9A-HJ-NP-Z]{3}-[2-9A-HJ-NP-Z]{3}$/)
  expect(SURVEY_ID_ALPHABET).not.toMatch(/[01IO]/)
  expect(normalizeSurveyId(' k7m-4pd ')).toBe('K7M-4PD')
  expect(normalizeSurveyId('k7m4pd')).toBe('K7M-4PD')
  expect(() => normalizeSurveyId('not-an-id')).toThrow('six')
})
