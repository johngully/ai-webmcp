import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'

const settingSchema = z.object({ enabled: z.boolean() })
const writes = new Map<string, Promise<unknown>>()

export function createAvailabilityOperations(dataFile: string) {
  const file = `${resolve(dataFile)}.webmcp.json`
  return {
    async getAvailability() {
      await writes.get(file)
      try {
        return settingSchema.parse(JSON.parse(await readFile(file, 'utf8')))
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT')
          return { enabled: true }
        throw new Error('WebMCP availability could not be read.')
      }
    },
    async setAvailability(input: { enabled: boolean }) {
      const setting = settingSchema.parse(input)
      const pending = (writes.get(file) ?? Promise.resolve())
        .catch(() => {})
        .then(async () => {
          const temporary = `${file}.${randomUUID()}.tmp`
          try {
            await mkdir(dirname(file), { recursive: true })
            await writeFile(temporary, JSON.stringify(setting) + '\n', {
              flag: 'wx',
              mode: 0o600,
            })
            await rename(temporary, file)
            return setting
          } finally {
            await rm(temporary, { force: true })
          }
        })
      writes.set(file, pending)
      try {
        return await pending
      } finally {
        if (writes.get(file) === pending) writes.delete(file)
      }
    },
  }
}
