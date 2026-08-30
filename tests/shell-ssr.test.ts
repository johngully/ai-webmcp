import { createMemoryHistory, RouterProvider } from '@tanstack/react-router'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { expect, test } from 'vitest'
import { getRouter } from '../src/router'

test('a direct page request provides an English document with survey metadata and content', async () => {
  const router = getRouter()
  router.update({
    context: router.options.context,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()

  const html = renderToString(createElement(RouterProvider, { router }))
  expect(html).toContain('<html lang="en">')
  expect(html).toContain('<title>AI Dev Days · Conference survey</title>')
  expect(html).toContain(
    'name="description" content="Share your AI Dev Days talk feedback and choose a thank-you gift."',
  )
  expect(html).toContain('Tell us about your talk.')
})
