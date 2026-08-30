import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import * as filesystem from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { afterEach, expect, test, vi } from 'vitest'
import { createJsonlSurveyRepository } from '../src/survey/survey-repository.server'
import { surveyInput } from './survey.fixture'

vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof filesystem>()
  return {
    ...actual,
    rename: vi.fn(actual.rename),
    appendFile: vi.fn(actual.appendFile),
  }
})

test('an interrupted append warns against blind retries and keeps earlier records recoverable', async () => {
  const file = await temporaryFile()
  const repository = createJsonlSurveyRepository(file)
  const retained = await repository.create(surveyInput)
  vi.mocked(filesystem.appendFile).mockImplementationOnce(async () => {
    // Model a disk write interrupted partway through a record.
    const actual = await vi.importActual<typeof filesystem>('node:fs/promises')
    await actual.appendFile(file, '{"talk":')
    throw new Error('ENOSPC: no space left on device')
  })
  await expect(repository.create(surveyInput)).rejects.toThrow(
    /Could not confirm the save.*Check stored responses and repair incomplete data before retrying/,
  )
  await expect(repository.find()).rejects.toThrow(/line 2.*repair/)
  expect(await readFile(file, 'utf8')).toBe(
    `${JSON.stringify(retained)}\n{"talk":`,
  )
  await writeFile(file, `${JSON.stringify(retained)}\n`)
  expect(await createJsonlSurveyRepository(file).find()).toEqual([retained])
  expect(
    (await repository.create({ ...surveyInput, name: 'Casey Morgan' })).id,
  ).not.toBe(retained.id)
})

const directories: string[] = []
async function temporaryFile() {
  const directory = await mkdtemp(join(tmpdir(), 'ai-survey-jsonl-'))
  directories.push(directory)
  return join(directory, 'nested', 'surveys.jsonl')
}
afterEach(async () => {
  vi.restoreAllMocks()
  await Promise.all(
    directories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  )
})

test('interrupted atomic deletion preserves the original responses and can be retried after storage recovery', async () => {
  const file = await temporaryFile()
  const repository = createJsonlSurveyRepository(file)
  const removed = await repository.create(surveyInput)
  const retained = await repository.create({
    ...surveyInput,
    name: 'Casey Morgan',
  })
  // Inject an OS rename failure, not an internal repository mock.
  vi.mocked(filesystem.rename).mockRejectedValueOnce(
    new Error('EIO: interrupted rename'),
  )
  await expect(repository.deleteMany([removed.id])).rejects.toThrow(
    /original responses are unchanged.*Check directory permissions and available disk space before retrying/,
  )
  expect(await createJsonlSurveyRepository(file).find()).toEqual([
    retained,
    removed,
  ])
  expect(await filesystem.readdir(join(file, '..'))).toEqual(['surveys.jsonl'])
  expect(await repository.deleteMany([removed.id])).toBe(1)
  expect(await createJsonlSurveyRepository(file).find()).toEqual([retained])
})

test('malformed stored data blocks both mutations and tells the operator how to recover without losing retained records', async () => {
  const file = await temporaryFile()
  const repository = createJsonlSurveyRepository(file)
  const saved = await repository.create(surveyInput)
  const original = `${await readFile(file, 'utf8')}{interrupted record}\n`
  await writeFile(file, original)
  for (const mutation of [
    () => repository.create(surveyInput),
    () => repository.deleteMany([saved.id]),
  ]) {
    await expect(mutation()).rejects.toThrow(
      /line 2.*Restore a backup or repair the indicated line before retrying/,
    )
    expect(await readFile(file, 'utf8')).toBe(original)
  }
  await writeFile(file, `${JSON.stringify(saved)}\n`)
  expect(await repository.find()).toEqual([saved])
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
