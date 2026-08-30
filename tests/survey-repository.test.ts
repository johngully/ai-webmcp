import { mkdtemp, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { afterEach, describe, expect, test } from 'vitest'
import { createMemorySurveyRepository } from '../src/survey/survey-repository.memory'
import { createJsonlSurveyRepository } from '../src/survey/survey-repository.server'
import type { RepositoryOptions } from '../src/survey/survey-repository'
import { surveyInput } from './survey.fixture'

const directories: string[] = []
afterEach(async () => {
  await Promise.all(
    directories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  )
})

describe.each(['memory', 'JSONL'])('%s repository', (adapter) => {
  async function createRepository(options?: RepositoryOptions) {
    if (adapter === 'memory') return createMemorySurveyRepository(options)
    const directory = await mkdtemp(join(tmpdir(), 'ai-survey-contract-'))
    directories.push(directory)
    return createJsonlSurveyRepository(
      join(directory, 'nested', 'surveys.jsonl'),
      options,
    )
  }

  test('regression: responses created in the same millisecond still list newest first', async () => {
    const repository = await createRepository({
      now: () => new Date('2026-08-30T12:00:00.000Z'),
    })
    const first = await repository.create(surveyInput)
    const latest = await repository.create({
      ...surveyInput,
      name: 'Grace Hopper',
    })
    expect((await repository.find()).map((row) => row.id)).toEqual([
      latest.id,
      first.id,
    ])
  })
  test('single and bulk deletion normalize and deduplicate IDs and preserve concurrent submissions', async () => {
    const repository = await createRepository()
    expect(await repository.deleteMany(['ABC-234'])).toBe(0)
    const first = await repository.create(surveyInput)
    const second = await repository.create({
      ...surveyInput,
      name: 'Grace Hopper',
    })
    const kept = await repository.create({
      ...surveyInput,
      name: 'Alan Turing',
    })
    await expect(repository.deleteMany([first.id, 'bad'])).rejects.toThrow()
    expect(await repository.find()).toHaveLength(3)
    expect(
      await repository.deleteMany([
        first.id.toLowerCase(),
        first.id,
        'ABC-234',
      ]),
    ).toBe(1)
    const [newResponse, count] = await Promise.all([
      repository.create({ ...surveyInput, name: 'Katherine Johnson' }),
      repository.deleteMany([second.id, first.id]),
    ])
    expect(count).toBe(1)
    expect((await repository.find()).map((row) => row.id).sort()).toEqual(
      [kept.id, newResponse.id].sort(),
    )
    expect(await repository.deleteMany([kept.id, newResponse.id])).toBe(2)
    expect(await repository.deleteMany([])).toBe(0)
    expect(await repository.find()).toEqual([])
  })
  test('concurrent submissions retry colliding IDs without replacing responses', async () => {
    const ids = ['k7m4pd', 'K7M-4PD', 'ABC234', 'XYZ789']
    const repository = await createRepository({
      generateId: () => ids.shift()!,
    })
    const responses = await Promise.all([
      repository.create(surveyInput),
      repository.create({ ...surveyInput, name: 'Grace Hopper' }),
      repository.create({ ...surveyInput, name: 'Alan Turing' }),
    ])
    expect(responses.map((row) => row.id)).toEqual([
      'K7M-4PD',
      'ABC-234',
      'XYZ-789',
    ])
    expect(await repository.find()).toHaveLength(3)
  })
  test('a created response is normalized and retrievable without exposing mutable storage', async () => {
    const repository = await createRepository({
      generateId: () => 'k7m4pd',
      now: () => new Date('2026-08-30T12:00:00.000Z'),
    })
    expect(await repository.find()).toEqual([])
    const response = await repository.create({
      ...surveyInput,
      name: ' Ada Lovelace ',
    })
    expect(response).toEqual({
      ...surveyInput,
      id: 'K7M-4PD',
      submittedAt: '2026-08-30T12:00:00.000Z',
    })
    response.name = 'Changed locally'
    const [stored] = await repository.find()
    expect(stored.name).toBe('Ada Lovelace')
    stored.name = 'Changed again'
    expect((await repository.find())[0].name).toBe('Ada Lovelace')
    await expect(
      repository.create({ ...surveyInput, name: ' ' }),
    ).rejects.toThrow()
    expect(await repository.find()).toHaveLength(1)
  })

  test('name, exact talk and inclusive ratings combine while results show newest first', async () => {
    let day = 1
    const repository = await createRepository({
      now: () => new Date(`2026-08-0${day++}T12:00:00.000Z`),
    })
    const first = await repository.create({ ...surveyInput, rating: 7 })
    await repository.create({ ...surveyInput, name: 'Grace Hopper' })
    await repository.create({
      ...surveyInput,
      talk: 'Multimodal Apps with Modern Models',
    })
    const latest = await repository.create({ ...surveyInput, rating: 10 })
    await repository.create({ ...surveyInput, rating: 3 })
    expect(
      (
        await repository.find({
          name: ' ADA ',
          talk: surveyInput.talk,
          minRating: 7,
          maxRating: 10,
        })
      ).map((row) => row.id),
    ).toEqual([latest.id, first.id])
    expect(await repository.find({ maxRating: 0 })).toEqual([])
    expect(await repository.find({ minRating: 10 })).toEqual([latest])
    await expect(
      repository.find({ minRating: 9, maxRating: 2 }),
    ).rejects.toThrow()
  })
})
