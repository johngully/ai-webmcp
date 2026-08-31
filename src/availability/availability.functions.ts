import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { surveyDataFile } from '../../survey.config'
import { createAvailabilityOperations } from './availability.operations.server'

export const getAvailability = createServerFn({ method: 'GET' }).handler(() =>
  createAvailabilityOperations(surveyDataFile).getAvailability(),
)
export const setAvailability = createServerFn({ method: 'POST' })
  .validator(z.object({ enabled: z.boolean() }))
  .handler(({ data }) =>
    createAvailabilityOperations(surveyDataFile).setAvailability(data),
  )
