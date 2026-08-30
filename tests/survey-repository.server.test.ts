import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { afterEach, expect, test } from 'vitest'
import { createJsonlSurveyRepository } from '../src/survey/survey-repository.server'
import { surveyInput } from './survey.fixture'

const directories: string[] = []
async function temporaryFile() {
  const directory = await mkdtemp(join(tmpdir(), 'ai-survey-jsonl-'))
  directories.push(directory)
  return join(directory, 'nested', 'surveys.jsonl')
}
afterEach(async () => {
  await Promise.all(
    directories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  )
})

test('JSONL reading handles missing/empty files and blank lines and reports malformed line numbers', async () => {
  const file = await temporaryFile()
  const repository = createJsonlSurveyRepository(file)
  expect(await repository.find()).toEqual([])
  await mkdir(join(file, '..'), { recursive: true })
  await writeFile(file, '')
  expect(await repository.find()).toEqual([])
  const record = {
    ...surveyInput,
    id: 'K7M-4PD',
    submittedAt: '2026-08-30T12:00:00.000Z',
  }
  await writeFile(file, `\n${JSON.stringify(record)}\n \n`)
  expect(await repository.find()).toEqual([record])
  await writeFile(file, `\n${JSON.stringify(record)}\n{bad json}\n`)
  await expect(repository.find()).rejects.toThrow(/line 3/i)
  await writeFile(file, `\n${JSON.stringify({ ...record, rating: 11 })}\n`)
  await expect(repository.find()).rejects.toThrow(/line 2/i)
})

test('separate adapters for one file serialize mixed writes and retain every surviving response after reopen', async () => {
  const file = await temporaryFile()
  const first = createJsonlSurveyRepository(file)
  const second = createJsonlSurveyRepository(file)
  const removed = await first.create(surveyInput)
  const results = await Promise.all([
    ...Array.from({ length: 16 }, (_, index) =>
      (index % 2 ? first : second).create({
        ...surveyInput,
        name: `Participant ${index}`,
      }),
    ),
    second.deleteMany([removed.id]),
  ])
  expect(results.at(-1)).toBe(1)
  const stored = await createJsonlSurveyRepository(file).find()
  expect(stored).toHaveLength(16)
  expect(new Set(stored.map((row) => row.id)).size).toBe(16)
  expect(stored.map((row) => row.name).sort()).toEqual(
    Array.from({ length: 16 }, (_, index) => `Participant ${index}`).sort(),
  )
})

test('append accepts an existing final record without a newline and failed reads do not poison subsequent operations', async () => {
  const file = await temporaryFile()
  await mkdir(join(file, '..'), { recursive: true })
  const record = {
    ...surveyInput,
    id: 'K7M-4PD',
    submittedAt: '2026-08-30T12:00:00.000Z',
  }
  await writeFile(file, JSON.stringify(record))
  const repository = createJsonlSurveyRepository(file)
  const added = await repository.create({
    ...surveyInput,
    name: 'Grace Hopper',
  })
  expect(await createJsonlSurveyRepository(file).find()).toEqual(
    expect.arrayContaining([record, added]),
  )
  await writeFile(file, 'broken\n')
  const failures = await Promise.allSettled([
    repository.find(),
    repository.deleteMany([record.id]),
  ])
  expect(failures.map((result) => result.status)).toEqual([
    'rejected',
    'rejected',
  ])
  await writeFile(file, `${JSON.stringify(record)}\n${JSON.stringify(added)}\n`)
  expect(await repository.deleteMany([record.id])).toBe(1)
  expect(await createJsonlSurveyRepository(file).find()).toEqual([added])
})
