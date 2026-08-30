import { test as base, expect } from '@playwright/test'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

async function startServer(args: string[], env: NodeJS.ProcessEnv) {
  const child = spawn(process.execPath, args, {
    env: {
      ...process.env,
      ...env,
      HOST: '127.0.0.1',
      NITRO_HOST: '127.0.0.1',
      PORT: '0',
      NITRO_PORT: '0',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  const close = async () => {
    if (child.exitCode !== null || child.signalCode) return
    const exited = once(child, 'exit')
    child.kill('SIGTERM')
    await exited
  }
  let output = ''
  try {
    const url = await new Promise<string>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error(`Server did not start: ${output}`)),
        15_000,
      )
      child.once('error', reject)
      child.once('exit', () => {
        clearTimeout(timer)
        reject(new Error(`Server exited: ${output}`))
      })
      const inspect = (chunk: Buffer) => {
        output += chunk.toString()
        const match = output.match(/http:\/\/127\.0\.0\.1:\d+/)
        if (match) {
          clearTimeout(timer)
          resolve(match[0])
        }
      }
      child.stdout.on('data', inspect)
      child.stderr.on('data', inspect)
    })
    return { url, close }
  } catch (error) {
    await close()
    throw error
  }
}

export const test = base.extend<{
  app: { url: string; dataFile: string }
  verificationURL: string
}>({
  app: async ({}, use, testInfo) => {
    // Each test owns one process and one fresh OS-temp directory, including retries.
    // Teardown stops the writer before removing its data; no shared reset race.
    const directory = await mkdtemp(join(tmpdir(), 'ai-survey-browser-'))
    const dataFile = join(directory, 'surveys.jsonl')
    const args =
      testInfo.project.name === 'server-functions'
        ? [
            'node_modules/vite/bin/vite.js',
            'dev',
            '--host',
            '127.0.0.1',
            '--port',
            '0',
            '--strictPort',
          ]
        : ['.output/server/index.mjs']
    const server = await startServer(args, { SURVEY_DATA_FILE: dataFile })
    try {
      await use({ url: server.url, dataFile })
    } finally {
      await server.close()
      await rm(directory, { recursive: true, force: true })
    }
  },
  verificationURL: async ({ app }, use) => {
    const client = await startServer(['scripts/verification-client.mjs'], {
      SURVEY_APP_URL: app.url,
    })
    try {
      await use(client.url)
    } finally {
      await client.close()
    }
  },
  baseURL: async ({ app }, use) => {
    await use(app.url)
  },
})
export { expect, startServer }
