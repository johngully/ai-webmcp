import type {
  InputSchema,
  ModelContext,
  ToolAnnotations,
} from '@mcp-b/webmcp-types'
import { z } from 'zod'
import { newSurveyResponseSchema } from '../survey/survey.schemas'
import type { NewSurveyResponse } from '../survey/survey.types'

export type SubmitSurvey = (
  input: NewSurveyResponse,
) => Promise<{ surveyId: string } | { success: false; error: 'disabled' }>

// Native discovery currently preserves only the standard hints. Keep the
// mutation contract in the description as well for those clients.
const annotations: ToolAnnotations = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
  untrustedContentHint: false,
}

const inputSchema: InputSchema = z.toJSONSchema(newSurveyResponseSchema, {
  io: 'input',
})

export async function registerSurveyTool(
  context: ModelContext,
  options: {
    signal: AbortSignal
    submit: SubmitSurvey
    onSubmitted?: (surveyId: string) => void
  },
) {
  await context.registerTool(
    {
      name: 'submit_ai_dev_days_survey',
      description:
        'Submit AI Dev Days talk feedback and a thank-you gift request. Collect all six required answers from the attendee before calling. Each call creates one survey response and returns its survey ID. It does not change or delete existing responses. Repeating the call creates another response; do not retry automatically.',
      inputSchema,
      annotations,
      execute: async (input) => {
        const parsed = newSurveyResponseSchema.safeParse(input)
        if (!parsed.success) {
          return {
            success: false,
            error: 'validation',
            message:
              'Correct the listed fields and submit all six answers. No response was saved.',
            fields: parsed.error.issues.map((issue) => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          }
        }
        try {
          const result = await options.submit(parsed.data)
          if (!('surveyId' in result))
            return {
              ...result,
              message:
                'Assistant submission is disabled. No response was saved. You can still take the survey.',
            }
          options.onSubmitted?.(result.surveyId)
          return { success: true, surveyId: result.surveyId }
        } catch {
          return {
            success: false,
            error: 'submission',
            message:
              'We could not confirm your submission. Check Manage responses before you try again to avoid a duplicate response.',
          }
        }
      },
    },
    { signal: options.signal },
  )
}
