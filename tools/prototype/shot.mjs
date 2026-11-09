import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'
import { createRequire } from 'node:module'
const { chromium } = createRequire(import.meta.url)('playwright')
const root = path.resolve('../..')
const types = { '.js': 'text/javascript', '.html': 'text/html', '.woff2': 'font/woff2' }
const server = http.createServer((q, r) => { const p = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); return r.end() } r.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(r) }).listen(0)
const port = server.address().port
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const views = (process.argv[2] || 'hall').split(',')
const vp = process.argv[3] === 'm' ? { width: 390, height: 844 } : process.env.CLEAN ? { width: 2000, height: 1125 } : { width: 1600, height: 900 }
for (const v of views) {
  const p = await b.newPage({ viewport: vp })
  p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => m.type() === 'error' && console.log('CON', m.text()))
  const [vv, ff] = v.split(':'); await p.goto(`http://localhost:${port}/tools/prototype/index.html?v=${vv}${ff ? '&f=' + ff : ''}${process.env.CLEAN ? '&clean=1' : ''}${process.env.P ? '&p=' + process.env.P : ''}`, { waitUntil: 'domcontentloaded', timeout: 180000 })
  await p.waitForFunction(() => window.READY, null, { timeout: 180000 })
  await p.waitForTimeout(500)
  await p.screenshot({ path: `/tmp/claude-0/proto-${v.replace(':','-')}${process.env.P||''}${process.argv[3]||''}.png` })
  console.log('shot', v)
}
await b.close(); server.close()
