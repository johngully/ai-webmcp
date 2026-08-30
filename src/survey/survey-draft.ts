import { z } from 'zod'
import { newSurveyResponseSchema } from './survey.schemas'

export const SURVEY_DRAFT_KEY = 'ai-dev-days:survey-draft:v1'
const draftSchema = newSurveyResponseSchema.extend({
  talk: newSurveyResponseSchema.shape.talk.or(z.literal('')),
  rating: newSurveyResponseSchema.shape.rating.nullable(),
  swagGift: newSurveyResponseSchema.shape.swagGift.or(z.literal('')),
  // Preserve editing whitespace; the submission schema normalizes it later.
  ratingReason: z.string(),
  name: z.string(),
  shippingAddress: z.string(),
})
const savedDraftSchema = z.object({
  version: z.literal(1),
  values: draftSchema,
})
export type SurveyDraft = z.infer<typeof draftSchema>
export const emptyDraft: SurveyDraft = {
  talk: '',
  rating: null,
  ratingReason: '',
  swagGift: '',
  name: '',
  shippingAddress: '',
}

export function readSurveyDraft(): SurveyDraft {
  const saved = window.sessionStorage.getItem(SURVEY_DRAFT_KEY)
  if (!saved) return emptyDraft
  try {
    const result = savedDraftSchema.safeParse(JSON.parse(saved))
    return result.success ? result.data.values : emptyDraft
  } catch {
    return emptyDraft
  }
}

export function saveSurveyDraft(values: SurveyDraft) {
  window.sessionStorage.setItem(
    SURVEY_DRAFT_KEY,
    JSON.stringify({ version: 1, values }),
  )
}
