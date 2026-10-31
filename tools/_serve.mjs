// Minimal static host for this market index: serves index.json and icons/*.svg on 127.0.0.1.
// The Discover tab can only fetch http(s) URLs, so run this while the local source is in use.
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { dirname, extname, join, normalize, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const port = Number(process.argv[2] ?? 8788)
const types = { '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml' }

const resolve = (pathname) => {
  const relative = normalize(decodeURIComponent(pathname)).replace(/^([/\\])+/, '')
  if (relative.split(/[/\\]/).includes('..')) return undefined
  if (!/^(index\.json|icons[/\\][\w.-]+\.svg)$/.test(relative)) return undefined
  return join(root, ...relative.split(/[/\\]/))
}

createServer(async (request, response) => {
  const { pathname } = new URL(request.url, `http://127.0.0.1:${port}`)
  const file = resolve(pathname)
  if (!file) {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
    response.end('not found\n')
    return
  }
  try {
    const info = await stat(file)
    if (!info.isFile()) throw new Error('not a file')
    const body = await readFile(file)
    response.writeHead(200, {
      'content-type': types[extname(file)] ?? 'application/octet-stream',
      'content-length': body.length,
      'cache-control': 'no-store',
    })
    response.end(request.method === 'HEAD' ? undefined : body)
    console.log(`${new Date().toISOString()} ${request.method} ${pathname} ${info.size}`)
  } catch {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
    response.end('not found\n')
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`serving ${root.replaceAll(sep, '/')}`)
  console.log(`index url: http://127.0.0.1:${port}/index.json`)
})
