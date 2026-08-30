import { resolve } from 'node:path'

// Server-only runtime configuration. Relative overrides resolve from the Node
// process working directory. Phase 1 will consume this in the JSONL adapter.
export const surveyDataFile = resolve(
  process.env.SURVEY_DATA_FILE || 'data/surveys.jsonl',
)
