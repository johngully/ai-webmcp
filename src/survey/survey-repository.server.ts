import {
  appendFile,
  mkdir,
  readFile,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { normalizeSurveyId } from './survey-id'
import { newSurveyResponseSchema, surveyResponseSchema } from './survey.schemas'
import { filterSurveys, uniqueSurveyId } from './survey-repository'
import type { RepositoryOptions, SurveyRepository } from './survey-repository'
import type { SurveyResponse } from './survey.types'

const queues = new Map<string, Promise<unknown>>()

export function createJsonlSurveyRepository(
  dataFile: string,
  options: RepositoryOptions = {},
): SurveyRepository {
  const file = resolve(dataFile)
  function enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const previous = queues.get(file) ?? Promise.resolve()
    const next = previous.catch(() => {}).then(operation)
    queues.set(file, next)
    const cleanup = () => {
      if (queues.get(file) === next) queues.delete(file)
    }
    void next.then(cleanup, cleanup)
    return next
  }

  async function read(): Promise<{
    records: SurveyResponse[]
    contents: string
  }> {
    let contents: string
    try {
      contents = await readFile(file, 'utf8')
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT')
        return { records: [], contents: '' }
      throw error
    }
    const records = contents.split('\n').flatMap((line, index) => {
      if (!line.trim()) return []
      try {
        return [surveyResponseSchema.parse(JSON.parse(line))]
      } catch (cause) {
        throw new Error(
          `Malformed survey data at line ${index + 1} in ${file}. Restore a backup or repair the indicated line before retrying.`,
          { cause },
        )
      }
    })
    return { records, contents }
  }
  return {
    async create(input) {
      const data = newSurveyResponseSchema.parse(input)
      return enqueue(async () => {
        const { records, contents } = await read()
        const response = {
          ...data,
          id: uniqueSurveyId(records, options.generateId),
          submittedAt: (options.now?.() ?? new Date()).toISOString(),
        }
        try {
          await mkdir(dirname(file), { recursive: true })
          const separator = contents && !contents.endsWith('\n') ? '\n' : ''
          await appendFile(
            file,
            `${separator}${JSON.stringify(response)}\n`,
            'utf8',
          )
        } catch (cause) {
          throw new Error(
            'Could not confirm the save. Check stored responses and repair incomplete data before retrying; check directory permissions and available disk space.',
            { cause },
          )
        }
        return response
      })
    },
    async find(filters) {
      return enqueue(async () => filterSurveys((await read()).records, filters))
    },
    async deleteMany(ids) {
      const requested = new Set(ids.map(normalizeSurveyId))
      return enqueue(async () => {
        const { records } = await read()
        const retained = records.filter((record) => !requested.has(record.id))
        const deletedCount = records.length - retained.length
        if (!deletedCount) return 0
        const temporary = `${file}.${randomUUID()}.tmp`
        try {
          await writeFile(
            temporary,
            retained.map((record) => `${JSON.stringify(record)}\n`).join(''),
            { encoding: 'utf8', flag: 'wx' },
          )
          await rename(temporary, file)
        } catch (cause) {
          throw new Error(
            'Could not delete survey responses; the original responses are unchanged. Check directory permissions and available disk space before retrying.',
            { cause },
          )
        } finally {
          await rm(temporary, { force: true })
        }
        return deletedCount
      })
    },
  }
}
