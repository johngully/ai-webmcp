import { expect, test } from 'vitest'
import {
  newSurveyResponseSchema,
  surveyFiltersSchema,
} from '../src/survey/survey.schemas'
import { surveyInput } from './survey.fixture'

test('a complete survey trims required text and keeps the selected answers', () => {
  expect(
    newSurveyResponseSchema.parse({
      ...surveyInput,
      name: '  Ada Lovelace  ',
      ratingReason: '  Practical examples I can use at work.  ',
      shippingAddress: '  12 Example Street\nChicago, IL 60601  ',
    }),
  ).toEqual(surveyInput)
})

test('invalid survey fields report errors on their own field paths', () => {
  const result = newSurveyResponseSchema.safeParse({
    talk: 'Unknown talk',
    rating: 10.5,
    ratingReason: ' ',
    swagGift: 'Mug',
    name: ' ',
    shippingAddress: '',
  })
  expect(result.success).toBe(false)
  if (!result.success) {
    expect(result.error.issues.map((issue) => issue.path[0])).toEqual(
      expect.arrayContaining([
        'talk',
        'rating',
        'ratingReason',
        'swagGift',
        'name',
        'shippingAddress',
      ]),
    )
  }
  for (const rating of [-1, 11, '9']) {
    expect(
      newSurveyResponseSchema.safeParse({ ...surveyInput, rating }).success,
    ).toBe(false)
  }
  for (const rating of [0, 10]) {
    expect(
      newSurveyResponseSchema.parse({ ...surveyInput, rating }).rating,
    ).toBe(rating)
  }
})

test('filters accept an inclusive rating range and reject reversed ranges on maxRating', () => {
  expect(
    surveyFiltersSchema.parse({ name: '  ADA ', minRating: 0, maxRating: 10 }),
  ).toEqual({ name: 'ADA', minRating: 0, maxRating: 10 })
  expect(surveyFiltersSchema.parse(undefined)).toEqual({})
  expect(surveyFiltersSchema.safeParse({ talk: 'Unknown talk' }).success).toBe(
    false,
  )
  const result = surveyFiltersSchema.safeParse({ minRating: 9, maxRating: 3 })
  expect(result.success).toBe(false)
  if (!result.success)
    expect(result.error.issues[0].path).toEqual(['maxRating'])
})
