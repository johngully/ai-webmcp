// Contributor-only visual audit: loopback production bytes; all writes rejected.
// No browser settings, application source, or stored survey data are changed.
import { createServer, request } from 'node:http'

createServer((req, res) => {
  if (req.method !== 'GET') {
    // Leave enough time to inspect the real pending UI, then exercise recovery.
    setTimeout(() => {
      res.writeHead(503, { 'content-type': 'text/plain' })
      res.end('Read-only visual fixture: submission deliberately rejected')
    }, 15000)
    return
  }
  const upstream = request(
    {
      hostname: '127.0.0.1',
      port: 3114,
      path: req.url,
      method: 'GET',
      // Preserve browser request context for Start's read-only server functions.
      headers: req.headers,
    },
    (response) => {
      const parts = []
      response.on('data', (part) => parts.push(part))
      response.on('end', () => {
        let body = Buffer.concat(parts)
        const headers = { ...response.headers }
        delete headers['content-length']
        delete headers['transfer-encoding']
        headers['cache-control'] = 'no-store'
        const type = String(headers['content-type'])
        if (type.includes('text/html')) {
          body = Buffer.from(
            body
              .toString()
              .replace(
                '<head>',
                '<head><script>Object.defineProperty(window,"isSecureContext",{value:false})</script>',
              ),
          )
        }
        // Override the stylesheet itself so route head updates cannot remove it.
        if (type.includes('text/css')) {
          body = Buffer.from(
            body.toString() + '\n:root { font-size: 200% !important; }\n',
          )
        }
        res.writeHead(response.statusCode || 502, headers)
        res.end(body)
      })
    },
  )
  upstream.on('error', () => {
    res.writeHead(502)
    res.end('Local app unavailable')
  })
  upstream.end()
}).listen(3116, '127.0.0.1', () =>
  console.log('Read-only visual fixture: http://127.0.0.1:3116'),
)
