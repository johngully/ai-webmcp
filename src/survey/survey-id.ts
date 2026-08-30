import { customAlphabet } from 'nanoid'

export const SURVEY_ID_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
const randomId = customAlphabet(SURVEY_ID_ALPHABET, 6)

export function normalizeSurveyId(value: string): string {
  const trimmed = value.trim().toUpperCase()
  if (!/^[A-Z0-9]{3}-?[A-Z0-9]{3}$/.test(trimmed)) {
    throw new Error('Survey ID must contain six alphanumeric characters')
  }
  const compact = trimmed.replace('-', '')
  return `${compact.slice(0, 3)}-${compact.slice(3)}`
}

export function generateSurveyId(random: () => string = randomId): string {
  return normalizeSurveyId(random())
}
