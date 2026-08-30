import { resolve } from 'node:path'

// Server-only runtime configuration. Relative overrides resolve from the Node
// process working directory. Only server modules may import this configuration.
export const surveyDataFile = resolve(
  process.env.SURVEY_DATA_FILE || 'data/surveys.jsonl',
)
