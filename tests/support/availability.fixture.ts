import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach } from 'vitest'
import { createAvailabilityOperations } from '../../src/availability/availability.operations.server'
const directories: string[] = []
afterEach(() => {
  for (const directory of directories.splice(0))
    rmSync(directory, { recursive: true, force: true })
})
export function isolatedAvailability() {
  const directory = mkdtempSync(join(tmpdir(), 'ai-availability-'))
  directories.push(directory)
  return createAvailabilityOperations(join(directory, 'surveys.jsonl'))
}
