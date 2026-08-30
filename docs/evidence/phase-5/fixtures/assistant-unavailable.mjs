// Temporary visual fault fixture: production bytes, loopback only, writes blocked.
import { createServer, request } from 'node:http'
createServer((req, res) => {
  if (req.method !== 'GET') {
    res.writeHead(405)
    res.end('Read-only visual fixture')
    return
  }
  const upstream = request(
    { hostname: '127.0.0.1', port: 3110, path: req.url, method: 'GET' },
    (response) => {
      const parts = []
      response.on('data', (part) => parts.push(part))
      response.on('end', () => {
        let body = Buffer.concat(parts)
        const headers = { ...response.headers }
        delete headers['content-length']
        delete headers['transfer-encoding']
        headers['cache-control'] = 'no-store'
        if (String(headers['content-type']).includes('text/html'))
          body = Buffer.from(
            body
              .toString()
              .replace(
                '<head>',
                '<head><script>Object.defineProperty(window,"isSecureContext",{value:false})</script>',
              ),
          )
        res.writeHead(response.statusCode || 502, headers)
        res.end(body)
      })
    },
  )
  upstream.on('error', () => {
    res.writeHead(502)
    res.end('Preview unavailable')
  })
  upstream.end()
}).listen(3112, '127.0.0.1', () =>
  console.log(
    'Read-only unavailable-assistant visual fixture: http://127.0.0.1:3112',
  ),
)
