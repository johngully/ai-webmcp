// Validate the generated public report, including unimported application files.
import { readFile, readdir } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const source = join(root, 'src')

async function sourceFiles(directory) {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await sourceFiles(file)))
    else if (
      entry.isFile() &&
      /\.tsx?$/.test(entry.name) &&
      !entry.name.endsWith('.d.ts') &&
      file !== join(source, 'routeTree.gen.ts')
    ) {
      files.push(file)
    }
  }
  return files
}

const report = JSON.parse(
  await readFile(join(root, 'coverage/coverage-summary.json'), 'utf8'),
)
const expected = new Set(await sourceFiles(source))
const actual = new Set(
  Object.keys(report)
    .filter((file) => file !== 'total')
    .map((file) => resolve(root, file)),
)
const unexpected = [...actual]
  .filter((file) => !expected.has(file))
  .map((file) => relative(root, file))
  .sort()
const missing = [...expected]
  .filter((file) => !actual.has(file))
  .map((file) => relative(root, file))
  .sort()

if (unexpected.length || missing.length) {
  throw new Error(
    `Coverage scope mismatch.\nUnexpected: ${unexpected.join(', ') || 'none'}\nMissing: ${missing.join(', ') || 'none'}`,
  )
}
console.log(
  `Coverage scope verified: ${expected.size} application source files, no out-of-source entries.`,
)
