/**
 * Procedural canvas textures for the ORVESSA maison: aged plaster,
 * herringbone walnut parquet, dark lacquered wood, faded rugs and the
 * window "gobo" that throws mullion + branch shadows across the walls.
 * Everything is generated at runtime — no image downloads needed.
 */
import * as THREE from 'three'

function canvas(w, h = w) {
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  return [c, c.getContext('2d')]
}
function rng(seed = 1) {
  let s = seed
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}
function toTex(c, repeat = [1, 1], color = true) {
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(...repeat)
  t.anisotropy = 8
  if (color) t.colorSpace = THREE.SRGBColorSpace
  return t
}

/* Aged lime plaster: warm ivory/beige with soft mottling and stains */
export function plasterTexture(base = '#c9b69a', seed = 3) {
  const [c, g] = canvas(1024)
  const r = rng(seed)
  g.fillStyle = base
  g.fillRect(0, 0, 1024, 1024)
  for (let i = 0; i < 900; i++) {
    const x = r() * 1024, y = r() * 1024, rad = 20 + r() * 160
    const light = r() > 0.5
    const grd = g.createRadialGradient(x, y, 0, x, y, rad)
    grd.addColorStop(0, light ? 'rgba(255,246,230,0.022)' : 'rgba(70,52,34,0.03)')
    grd.addColorStop(1, 'rgba(0,0,0,0)')
    g.fillStyle = grd
    g.fillRect(x - rad, y - rad, rad * 2, rad * 2)
  }
  const img = g.getImageData(0, 0, 1024, 1024)
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (r() - 0.5) * 9
    img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n
  }
  g.putImageData(img, 0, 0)
  return toTex(c, [2, 2])
}

/* Herringbone walnut parquet */
export function parquetTexture(seed = 5) {
  const S = 1024
  const [c, g] = canvas(S)
  const r = rng(seed)
  g.fillStyle = '#2a1a10'
  g.fillRect(0, 0, S, S)
  const pw = 64, pl = 256 // plank width / length (px)
  const tones = ['#4a2e1b', '#563621', '#3e2616', '#5e3c24', '#47301e', '#6a452a', '#3a2314']
  g.save()
  g.translate(S / 2, S / 2)
  g.rotate(Math.PI / 4)
  for (let row = -12; row < 12; row++) {
    for (let col = -12; col < 12; col++) {
      for (const dir of [0, 1]) {
        g.save()
        const x = col * pw * 2 + row * pw
        const y = row * pw * 2 - col * pw * 0 + (dir ? pw : 0)
        g.translate(x * 0.5, y * 0.5)
        g.rotate(dir ? Math.PI / 2 : 0)
        const tone = tones[Math.floor(r() * tones.length)]
        g.fillStyle = tone
        g.fillRect(0, 0, pl * 0.5, pw * 0.5)
        // grain
        for (let k = 0; k < 9; k++) {
          g.strokeStyle = `rgba(20,10,5,${0.08 + r() * 0.12})`
          g.lineWidth = 0.6 + r()
          g.beginPath()
          const yy = r() * pw * 0.5
          g.moveTo(0, yy)
          g.bezierCurveTo(pl * 0.15, yy + (r() - 0.5) * 6, pl * 0.35, yy + (r() - 0.5) * 6, pl * 0.5, yy + (r() - 0.5) * 4)
          g.stroke()
        }
        g.strokeStyle = 'rgba(15,8,4,0.85)'
        g.lineWidth = 1.2
        g.strokeRect(0, 0, pl * 0.5, pw * 0.5)
        g.restore()
      }
    }
  }
  g.restore()
  return toTex(c, [1.6, 1.6])
}

/* Basket-weave parquet (hall), closer to the reference's foyer floor */
export function basketTexture(seed = 9) {
  const S = 1024
  const [c, g] = canvas(S)
  const r = rng(seed)
  const tones = ['#3f2717', '#4c301c', '#362113', '#5a3922', '#442a18', '#2f1c10']
  const cell = 128
  for (let cy = 0; cy < S / cell; cy++) {
    for (let cx = 0; cx < S / cell; cx++) {
      const vertical = (cx + cy) % 2 === 0
      for (let k = 0; k < 4; k++) {
        const tone = tones[Math.floor(r() * tones.length)]
        g.fillStyle = tone
        const x = cx * cell + (vertical ? k * 32 : 0)
        const y = cy * cell + (vertical ? 0 : k * 32)
        const w = vertical ? 32 : cell, h = vertical ? cell : 32
        g.fillRect(x, y, w, h)
        for (let n = 0; n < 7; n++) {
          g.strokeStyle = `rgba(18,9,4,${0.1 + r() * 0.15})`
          g.lineWidth = 0.5 + r()
          g.beginPath()
          if (vertical) { const xx = x + r() * 32; g.moveTo(xx, y); g.bezierCurveTo(xx + (r() - .5) * 5, y + 40, xx + (r() - .5) * 5, y + 90, xx, y + h) }
          else { const yy = y + r() * 32; g.moveTo(x, yy); g.bezierCurveTo(x + 40, yy + (r() - .5) * 5, x + 90, yy + (r() - .5) * 5, x + w, yy) }
          g.stroke()
        }
        g.strokeStyle = 'rgba(12,6,3,0.9)'
        g.lineWidth = 1.4
        g.strokeRect(x, y, w, h)
      }
    }
  }
  return toTex(c, [1.4, 1.4])
}

/* Dark lacquered walnut for doors & boiserie in side rooms */
export function woodTexture(seed = 13, base = '#3a2416') {
  const [c, g] = canvas(512, 1024)
  const r = rng(seed)
  g.fillStyle = base
  g.fillRect(0, 0, 512, 1024)
  for (let i = 0; i < 260; i++) {
    g.strokeStyle = `rgba(${r() > 0.5 ? '90,60,38' : '18,10,6'},${0.08 + r() * 0.18})`
    g.lineWidth = 0.6 + r() * 2
    g.beginPath()
    const x = r() * 512
    g.moveTo(x, 0)
    g.bezierCurveTo(x + (r() - .5) * 30, 300, x + (r() - .5) * 30, 700, x + (r() - .5) * 20, 1024)
    g.stroke()
  }
  return toTex(c, [1, 1])
}

/* Faded antique rug (Persian-inspired field, border and medallions) */
export function rugTexture(palette = 'red', seed = 21) {
  const W = 1024, H = 768
  const [c, g] = canvas(W, H)
  const r = rng(seed)
  const P = palette === 'red'
    ? { field: '#7b2c24', border: '#3a1c1a', band: '#b48a62', motif: '#c9b08a', accent: '#2f3848' }
    : { field: '#6c6253', border: '#2f2a24', band: '#a89676', motif: '#d2c4a6', accent: '#4a3a2c' }
  g.fillStyle = P.border; g.fillRect(0, 0, W, H)
  g.fillStyle = P.band; g.fillRect(40, 40, W - 80, H - 80)
  g.fillStyle = P.border; g.fillRect(56, 56, W - 112, H - 112)
  g.fillStyle = P.field; g.fillRect(96, 96, W - 192, H - 192)
  // border motifs
  for (let x = 70; x < W - 70; x += 28) { g.fillStyle = P.motif; g.beginPath(); g.arc(x, 76, 6, 0, 7); g.arc(x, H - 76, 6, 0, 7); g.fill() }
  for (let y = 70; y < H - 70; y += 28) { g.beginPath(); g.arc(76, y, 6, 0, 7); g.arc(W - 76, y, 6, 0, 7); g.fill() }
  // field lattice
  g.strokeStyle = P.accent; g.lineWidth = 3; g.globalAlpha = 0.55
  for (let i = -10; i < 20; i++) {
    g.beginPath(); g.moveTo(96 + i * 60, 96); g.lineTo(96 + i * 60 + 600, H - 96); g.stroke()
    g.beginPath(); g.moveTo(96 + i * 60, H - 96); g.lineTo(96 + i * 60 + 600, 96); g.stroke()
  }
  g.globalAlpha = 1
  // central medallion
  const med = (cx, cy, s) => {
    g.fillStyle = P.band; g.beginPath(); g.moveTo(cx, cy - s); g.lineTo(cx + s * 1.5, cy); g.lineTo(cx, cy + s); g.lineTo(cx - s * 1.5, cy); g.closePath(); g.fill()
    g.fillStyle = P.accent; g.beginPath(); g.moveTo(cx, cy - s * 0.7); g.lineTo(cx + s, cy); g.lineTo(cx, cy + s * 0.7); g.lineTo(cx - s, cy); g.closePath(); g.fill()
    g.fillStyle = P.motif; g.beginPath(); g.arc(cx, cy, s * 0.25, 0, 7); g.fill()
  }
  med(W / 2, H / 2, 150)
  med(220, 220, 50); med(W - 220, 220, 50); med(220, H - 220, 50); med(W - 220, H - 220, 50)
  // fine floral scatter
  for (let i = 0; i < 1400; i++) {
    const x = 100 + r() * (W - 200), y = 100 + r() * (H - 200)
    g.fillStyle = [P.motif, P.accent, P.band][Math.floor(r() * 3)]
    g.globalAlpha = 0.35 + r() * 0.3
    g.beginPath(); g.ellipse(x, y, 2 + r() * 5, 1.5 + r() * 3, r() * 3, 0, 7); g.fill()
  }
  g.globalAlpha = 1
  // soften like worn wool
  const soft = document.createElement('canvas'); soft.width = W; soft.height = H
  const sg = soft.getContext('2d'); sg.filter = 'blur(2.2px) saturate(0.7)'; sg.drawImage(c, 0, 0)
  g.drawImage(soft, 0, 0)
  // wear & fibre noise
  const img = g.getImageData(0, 0, W, H)
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (r() - 0.5) * 40
    const wear = r() < 0.04 ? 30 : 0
    img.data[i] += n + wear; img.data[i + 1] += n + wear * 0.8; img.data[i + 2] += n + wear * 0.6
  }
  g.putImageData(img, 0, 0)
  return toTex(c, [1, 1])
}

/* Window gobo: mullion grid + bare branches, blurred like soft sunlight */
export function goboTexture(seed = 31) {
  const S = 1024
  const [c, g] = canvas(S)
  const r = rng(seed)
  g.fillStyle = '#000'; g.fillRect(0, 0, S, S)
  g.filter = 'blur(10px)'
  // sunlit window panes
  g.fillStyle = '#fff'
  const cols = 3, rows = 4, x0 = 220, y0 = 140, pw = 190, ph = 180, gap = 26
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) g.fillRect(x0 + i * (pw + gap), y0 + j * (ph + gap), pw, ph)
  // branches crossing the light
  g.filter = 'blur(5px)'
  g.strokeStyle = '#000'
  const branch = (x, y, a, len, w, depth) => {
    if (depth <= 0 || w < 0.6) return
    const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len
    g.lineWidth = w
    g.beginPath(); g.moveTo(x, y)
    g.quadraticCurveTo((x + x2) / 2 + (r() - .5) * 30, (y + y2) / 2 + (r() - .5) * 30, x2, y2); g.stroke()
    branch(x2, y2, a + (r() - 0.3) * 0.7, len * 0.72, w * 0.68, depth - 1)
    if (r() > 0.3) branch(x2, y2, a - (r() * 0.9), len * 0.66, w * 0.6, depth - 1)
  }
  branch(-40, 980, -0.75, 300, 26, 7)
  branch(1080, 900, -2.3, 260, 20, 6)
  g.filter = 'none'
  // radial falloff
  const grd = g.createRadialGradient(S / 2, S / 2, S * 0.25, S / 2, S / 2, S * 0.62)
  grd.addColorStop(0, 'rgba(0,0,0,0)'); grd.addColorStop(1, 'rgba(0,0,0,1)')
  g.fillStyle = grd; g.fillRect(0, 0, S, S)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/* Velvet (vitrine lining / chair) */
export function velvetTexture(base = '#3b2a22', seed = 41) {
  const [c, g] = canvas(256)
  const r = rng(seed)
  g.fillStyle = base; g.fillRect(0, 0, 256, 256)
  const img = g.getImageData(0, 0, 256, 256)
  for (let i = 0; i < img.data.length; i += 4) { const n = (r() - 0.5) * 18; img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n }
  g.putImageData(img, 0, 0)
  return toTex(c, [4, 4])
}
