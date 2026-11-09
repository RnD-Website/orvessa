/**
 * Renders every shot defined in studio.js into /public/images (webp + jpg fallback-free).
 * Usage: npm run render            -> all shots
 *        npm run render -- hero    -> only shots whose name contains "hero"
 */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
const { chromium } = createRequire(import.meta.url)('playwright')
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const out = path.join(root, 'public/images')
const filter = process.argv[2] || ''
const only = process.argv[3] ? new RegExp(process.argv[3]) : null
const types = { '.js': 'text/javascript', '.html': 'text/html', '.mjs': 'text/javascript' }

const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(req.url.split('?')[0]))
  if (!p.startsWith(root) || !fs.existsSync(p)) { res.writeHead(404); return res.end() }
  res.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' })
  fs.createReadStream(p).pipe(res)
}).listen(0)
const port = server.address().port

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const page = await browser.newPage()
page.on('console', m => m.type() === 'error' && console.log('[page]', m.text()))
page.on('pageerror', e => console.log('[pageerror]', e.message))
await page.goto(`http://localhost:${port}/tools/render/studio.html`)
await page.waitForFunction(() => window.READY === true, null, { timeout: 120000 })
const names = (await page.evaluate(() => window.SHOT_NAMES)).filter(n => n.includes(filter) && (!only || only.test(n)))
for (const name of names) {
  const t = Date.now()
  const data = await page.evaluate(n => window.renderShot(n), name)
  const buf = Buffer.from(data.split(',')[1], 'base64')
  const file = path.join(out, name + '.webp')
  fs.mkdirSync(path.dirname(file), { recursive: true })
  await sharp(buf).webp({ quality: 84, effort: 5 }).toFile(file)
  console.log(`✓ ${name}  ${Date.now() - t}ms`)
}
await browser.close()
server.close()
