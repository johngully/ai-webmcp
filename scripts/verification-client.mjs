// Contributor-only same-origin client. Never imported by the application build.
import { createServer, request } from 'node:http'
import { readFile } from 'node:fs/promises'

const target = new URL(process.env.SURVEY_APP_URL || 'http://127.0.0.1:3106')
if (
  target.protocol !== 'http:' ||
  target.hostname !== '127.0.0.1' ||
  target.username ||
  target.password ||
  target.pathname !== '/' ||
  target.search ||
  target.hash
) {
  throw new Error(
    'SURVEY_APP_URL must be a plain http://127.0.0.1:PORT origin for your isolated survey process.',
  )
}
const client = await readFile(
  new URL('../tests/fixtures/webmcp-client.html', import.meta.url),
)
const server = createServer((incoming, outgoing) => {
  if (incoming.url === '/__verification__/webmcp') {
    outgoing.writeHead(200, {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
    })
    outgoing.end(client)
    return
  }
  const upstream = request(
    {
      hostname: target.hostname,
      port: target.port,
      method: incoming.method,
      path: incoming.url,
      headers: incoming.headers,
    },
    (response) => {
      outgoing.writeHead(response.statusCode || 502, response.headers)
      response.pipe(outgoing)
    },
  )
  upstream.on('error', () => {
    outgoing.writeHead(502, { 'content-type': 'text/plain' })
    outgoing.end(
      'Survey process unavailable. Start the isolated production server and check SURVEY_APP_URL.',
    )
  })
  incoming.pipe(upstream)
})
server.listen(Number(process.env.PORT || 3108), '127.0.0.1', () => {
  const { port } = server.address()
  console.log(`WebMCP client: http://127.0.0.1:${port}/__verification__/webmcp`)
})
process.once('SIGTERM', () => server.close())
process.once('SIGINT', () => server.close())
