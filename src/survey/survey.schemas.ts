import { z } from 'zod'
import { MAX_RATING, MIN_RATING, SWAG_GIFTS, TALKS } from './survey.constants'
import { normalizeSurveyId } from './survey-id'

const requiredText = z.string().trim().min(1, 'This field is required')
const ratingSchema = z.number().int().min(MIN_RATING).max(MAX_RATING)

export const newSurveyResponseSchema = z.object({
  talk: z.enum(TALKS).describe('The AI Dev Days talk you attended'),
  rating: ratingSchema.describe(
    'Likelihood to recommend the talk, from 0 to 10',
  ),
  ratingReason: requiredText.describe('Primary reason for your rating'),
  swagGift: z.enum(SWAG_GIFTS).describe('Your preferred thank-you gift'),
  name: requiredText.describe('Your full name'),
  shippingAddress: requiredText.describe('Shipping address for your gift'),
})

export const surveyIdSchema = z
  .string()
  .trim()
  .regex(/^[A-Z0-9]{3}-?[A-Z0-9]{3}$/i, 'Enter a six-character survey ID')
  .transform(normalizeSurveyId)

export const surveyResponseSchema = newSurveyResponseSchema.extend({
  id: surveyIdSchema,
  submittedAt: z.iso.datetime(),
})

export const deleteSurveysSchema = z.object({ ids: z.array(surveyIdSchema) })

export const surveyFiltersSchema = z
  .object({
    name: z.string().trim().optional(),
    talk: z.enum(TALKS).optional(),
    minRating: ratingSchema.optional(),
    maxRating: ratingSchema.optional(),
  })
  .refine(
    ({ minRating, maxRating }) =>
      minRating === undefined ||
      maxRating === undefined ||
      minRating <= maxRating,
    {
      path: ['maxRating'],
      message: 'Maximum rating must be at least the minimum rating',
    },
  )
  .default({})
