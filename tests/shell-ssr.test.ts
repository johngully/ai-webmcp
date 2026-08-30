import { createMemoryHistory, RouterProvider } from '@tanstack/react-router'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { expect, test } from 'vitest'
import { getRouter } from '../src/router'

test('a direct page request provides an English document with survey metadata and content', async () => {
  const router = getRouter()
  router.update({ history: createMemoryHistory({ initialEntries: ['/'] }) })
  await router.load()

  const html = renderToString(createElement(RouterProvider, { router }))
  expect(html).toContain('<html lang="en">')
  expect(html).toContain('<title>AI Dev Days · Conference survey</title>')
  expect(html).toContain(
    'name="description" content="Compare manual and WebMCP conference survey flows at AI Dev Days."',
  )
  expect(html).toContain('Your experience. Two ways to share it.')
})
