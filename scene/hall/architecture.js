/**
 * Neoclassical architecture kit: plaster walls with real openings,
 * boiserie panel mouldings, dado rails, cornices, architraves,
 * an arch, lacquered doors and skylight ceilings.
 * Units are metres. Every wall is built in local space:
 * x ∈ [-w/2, w/2], y ∈ [0, h], front face at z = 0 facing +z.
 */
import * as THREE from 'three'

export function scaleUV(geo, s = 0.25) {
  const uv = geo.attributes.uv
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * s, uv.getY(i) * s)
  return geo
}

function box(w, h, d, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
  m.position.set(x, y, z)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

/** Rectangular moulding frame (raised panel outline). */
export function frame(w, h, mat, t = 0.05, d = 0.035) {
  const g = new THREE.Group()
  g.add(box(w, t, d, mat, 0, h / 2 - t / 2, d / 2))
  g.add(box(w, t, d, mat, 0, -h / 2 + t / 2, d / 2))
  g.add(box(t, h - t * 2, d, mat, -w / 2 + t / 2, 0, d / 2))
  g.add(box(t, h - t * 2, d, mat, w / 2 - t / 2, 0, d / 2))
  // inner bead
  const it = t * 0.4, iw = w - t * 2.6, ih = h - t * 2.6
  g.add(box(iw, it, d * 0.5, mat, 0, ih / 2, d * 0.25))
  g.add(box(iw, it, d * 0.5, mat, 0, -ih / 2, d * 0.25))
  g.add(box(it, ih, d * 0.5, mat, -iw / 2, 0, d * 0.25))
  g.add(box(it, ih, d * 0.5, mat, iw / 2, 0, d * 0.25))
  return g
}

/** Shape of a wall with rectangular and arched holes. */
function wallShape(w, h, openings) {
  const s = new THREE.Shape()
  s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h); s.lineTo(-w / 2, h); s.closePath()
  for (const o of openings) {
    const p = new THREE.Path()
    const x0 = o.x - o.w / 2, x1 = o.x + o.w / 2
    if (o.type === 'arch') {
      const r = o.w / 2, spring = o.h - r
      p.moveTo(x0, 0.001); p.lineTo(x1, 0.001); p.lineTo(x1, spring)
      p.absarc(o.x, spring, r, 0, Math.PI, false)
      p.lineTo(x0, 0.001)
    } else {
      p.moveTo(x0, 0.001); p.lineTo(x1, 0.001); p.lineTo(x1, o.h); p.lineTo(x0, o.h); p.lineTo(x0, 0.001)
    }
    s.holes.push(p)
  }
  return s
}

/** Segments of [a,b] not covered by openings (with margin). */
function freeSpans(a, b, openings, margin = 0.32) {
  const cuts = openings.map(o => [o.x - o.w / 2 - margin, o.x + o.w / 2 + margin]).sort((p, q) => p[0] - q[0])
  const out = []
  let cur = a
  for (const [c0, c1] of cuts) {
    if (c0 > cur) out.push([cur, Math.min(c0, b)])
    cur = Math.max(cur, c1)
  }
  if (cur < b) out.push([cur, b])
  return out.filter(([x0, x1]) => x1 - x0 > 0.25)
}

/**
 * A complete paneled wall.
 * opts: { w, h, thick, openings, mats: { plaster, trim, wood }, bay, dark }
 */
/** Soft ambient-occlusion gradient used where walls meet floor and ceiling. */
let AO_TEX = null
function aoTexture() {
  if (AO_TEX) return AO_TEX
  const c = document.createElement('canvas'); c.width = 4; c.height = 128
  const g = c.getContext('2d')
  const grd = g.createLinearGradient(0, 0, 0, 128)
  grd.addColorStop(0, 'rgba(20,12,6,1)'); grd.addColorStop(0.35, 'rgba(20,12,6,0.45)'); grd.addColorStop(1, 'rgba(20,12,6,0)')
  g.fillStyle = grd; g.fillRect(0, 0, 4, 128)
  AO_TEX = new THREE.CanvasTexture(c)
  return AO_TEX
}
function aoStrip(w, h, opacity) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: aoTexture(), transparent: true, opacity, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }))
  m.renderOrder = 2
  return m
}

export function paneledWall({ w, h, thick = 0.35, openings = [], mats, bay = 1.45, panelTop = null }) {
  const g = new THREE.Group()
  const shape = wallShape(w, h, openings)
  const geo = new THREE.ExtrudeGeometry(shape, { depth: thick, bevelEnabled: false, curveSegments: 48 })
  geo.translate(0, 0, -thick)
  scaleUV(geo, 0.22)
  const wall = new THREE.Mesh(geo, mats.plaster)
  wall.receiveShadow = true
  wall.castShadow = true
  g.add(wall)

  const trim = mats.trim
  const dadoY = 1.0
  const top = panelTop ?? h - 1.1
  // baseboard, dado rail & cornice broken around openings
  for (const [x0, x1] of freeSpans(-w / 2, w / 2, openings, 0.16)) {
    const cw = x1 - x0, cx = (x0 + x1) / 2
    g.add(box(cw, 0.22, 0.05, trim, cx, 0.11, 0.025))
    g.add(box(cw, 0.06, 0.06, trim, cx, dadoY, 0.03))
    g.add(box(cw, 0.035, 0.08, trim, cx, dadoY + 0.05, 0.04))
  }
  // cornice (continuous)
  g.add(box(w, 0.18, 0.14, trim, 0, h - 0.09, 0.07))
  g.add(box(w, 0.08, 0.22, trim, 0, h - 0.22, 0.11))
  g.add(box(w, 0.05, 0.1, trim, 0, h - 0.32, 0.05))
  g.add(box(w, 0.04, 0.06, trim, 0, h - 0.62, 0.03))

  // contact shadows: floor/wall and ceiling/wall junctions (fake AO)
  for (const [x0, x1] of freeSpans(-w / 2, w / 2, openings, 0.05)) {
    const cw = x1 - x0, cx = (x0 + x1) / 2
    const low = aoStrip(cw, 1.1, 0.55); low.position.set(cx, 0.55, 0.1); low.rotation.z = Math.PI; g.add(low)
    const top = aoStrip(cw, 1.4, 0.45); top.position.set(cx, h - 0.7, 0.24); g.add(top)
  }
  const floorAo = aoStrip(w, 1.3, 0.5); floorAo.rotation.x = -Math.PI / 2; floorAo.position.set(0, 0.004, 0.65); g.add(floorAo)

  // panels in each free span
  for (const [x0, x1] of freeSpans(-w / 2 + 0.12, w / 2 - 0.12, openings)) {
    const span = x1 - x0
    const n = Math.max(1, Math.round(span / bay))
    const pw = span / n
    for (let i = 0; i < n; i++) {
      const cx = x0 + pw * (i + 0.5)
      const upH = top - (dadoY + 0.25)
      const up = frame(pw - 0.24, upH, trim)
      up.position.set(cx, dadoY + 0.25 + upH / 2, 0)
      g.add(up)
      const lo = frame(pw - 0.24, dadoY - 0.45, trim, 0.04, 0.03)
      lo.position.set(cx, 0.22 + (dadoY - 0.45) / 2 + 0.06, 0)
      g.add(lo)
    }
  }

  // architraves around openings
  for (const o of openings) {
    const at = 0.16, ad = 0.07
    if (o.type === 'arch') {
      const r = o.w / 2, spring = o.h - r
      g.add(box(at, spring, ad, trim, o.x - r - at / 2, spring / 2, ad / 2))
      g.add(box(at, spring, ad, trim, o.x + r + at / 2, spring / 2, ad / 2))
      const archCurve = new THREE.EllipseCurve(o.x, spring, r + at / 2, r + at / 2, 0, Math.PI)
      const pts = archCurve.getPoints(64).map(p => new THREE.Vector3(p.x, p.y, ad / 2))
      const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 96, at * 0.55, 8), trim)
      tube.scale.z = 0.7
      tube.castShadow = true
      g.add(tube)
      // keystone
      g.add(box(0.34, 0.5, 0.16, trim, o.x, o.h + 0.14, 0.08))
      // fluted pilasters flanking the arch
      for (const s of [-1, 1]) {
        const px = o.x + s * (r + 0.45)
        g.add(box(0.5, spring + 0.2, 0.12, trim, px, (spring + 0.2) / 2, 0.06))
        for (let f = -2; f <= 2; f++) g.add(box(0.03, spring - 0.3, 0.03, mats.plaster, px + f * 0.08, (spring - 0.3) / 2 + 0.25, 0.135))
        g.add(box(0.62, 0.14, 0.18, trim, px, spring + 0.27, 0.09)) // capital
        g.add(box(0.6, 0.24, 0.16, trim, px, 0.12, 0.08))           // plinth
      }
      // soffit / reveal colour
    } else {
      g.add(box(at, o.h + at, ad, trim, o.x - o.w / 2 - at / 2, (o.h + at) / 2, ad / 2))
      g.add(box(at, o.h + at, ad, trim, o.x + o.w / 2 + at / 2, (o.h + at) / 2, ad / 2))
      g.add(box(o.w + at * 2, at, ad, trim, o.x, o.h + at / 2, ad / 2))
      // overdoor: frieze panel + projecting cornice
      const fr = frame(o.w + 0.1, 0.62, trim, 0.05, 0.04)
      fr.position.set(o.x, o.h + at + 0.42, 0)
      g.add(fr)
      g.add(box(o.w + 0.7, 0.12, 0.26, trim, o.x, o.h + at + 0.82, 0.13))
      g.add(box(o.w + 0.5, 0.08, 0.18, trim, o.x, o.h + at + 0.92, 0.09))
    }
  }
  return g
}

/** Lacquered double door leaf (closed), set into a wall opening. */
export function doorLeaves(w, h, mats) {
  const g = new THREE.Group()
  for (const s of [-1, 1]) {
    const leaf = new THREE.Group()
    leaf.add(box(w / 2 - 0.01, h, 0.06, mats.wood, 0, h / 2, 0))
    const p1 = frame(w / 2 - 0.22, h * 0.52, mats.woodTrim, 0.045, 0.03); p1.position.set(0, h * 0.66, 0.03); leaf.add(p1)
    const p2 = frame(w / 2 - 0.22, h * 0.3, mats.woodTrim, 0.045, 0.03); p2.position.set(0, h * 0.2, 0.03); leaf.add(p2)
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 12), mats.brass)
    knob.position.set(-s * (w / 4 - 0.08), h * 0.47, 0.06)
    leaf.add(knob)
    leaf.position.x = s * w / 4
    g.add(leaf)
  }
  return g
}

/** Ceiling with central skylight (glowing panes behind a mullion grid). */
export function skylightCeiling(w, d, mats, { lw = w * 0.55, ld = d * 0.45, cols = 4, rows = 3 } = {}) {
  const g = new THREE.Group()
  const s = new THREE.Shape()
  s.moveTo(-w / 2, -d / 2); s.lineTo(w / 2, -d / 2); s.lineTo(w / 2, d / 2); s.lineTo(-w / 2, d / 2); s.closePath()
  const hole = new THREE.Path()
  hole.moveTo(-lw / 2, -ld / 2); hole.lineTo(lw / 2, -ld / 2); hole.lineTo(lw / 2, ld / 2); hole.lineTo(-lw / 2, ld / 2); hole.closePath()
  s.holes.push(hole)
  const geo = new THREE.ShapeGeometry(s)
  scaleUV(geo, 0.22)
  const ceil = new THREE.Mesh(geo, mats.plaster)
  ceil.rotation.x = Math.PI / 2
  g.add(ceil)
  // recess walls
  const depth = 0.7
  g.add(box(lw, depth, 0.05, mats.trim, 0, depth / 2, -ld / 2))
  g.add(box(lw, depth, 0.05, mats.trim, 0, depth / 2, ld / 2))
  g.add(box(0.05, depth, ld, mats.trim, -lw / 2, depth / 2, 0))
  g.add(box(0.05, depth, ld, mats.trim, lw / 2, depth / 2, 0))
  // glowing sky
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(lw, ld), mats.sky)
  sky.rotation.x = Math.PI / 2
  sky.position.y = depth
  g.add(sky)
  // mullions
  for (let i = 1; i < cols; i++) g.add(box(0.07, 0.1, ld, mats.mullion, -lw / 2 + (lw / cols) * i, depth - 0.06, 0))
  for (let j = 1; j < rows; j++) g.add(box(lw, 0.1, 0.07, mats.mullion, 0, depth - 0.06, -ld / 2 + (ld / rows) * j))
  // ceiling frame moulding
  g.add(box(lw + 0.3, 0.06, 0.15, mats.trim, 0, -0.03, -ld / 2 - 0.08))
  g.add(box(lw + 0.3, 0.06, 0.15, mats.trim, 0, -0.03, ld / 2 + 0.08))
  g.add(box(0.15, 0.06, ld, mats.trim, -lw / 2 - 0.08, -0.03, 0))
  g.add(box(0.15, 0.06, ld, mats.trim, lw / 2 + 0.08, -0.03, 0))
  g.traverse(o => { if (o.isMesh) { o.castShadow = false } })
  return g
}

/** Floor slab. */
export function floor(w, d, mat) {
  const geo = new THREE.PlaneGeometry(w, d)
  scaleUV(geo, 1)
  const uv = geo.attributes.uv
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w * 0.075, uv.getY(i) * d * 0.075)
  const m = new THREE.Mesh(geo, mat)
  m.rotation.x = -Math.PI / 2
  m.receiveShadow = true
  return m
}

/**
 * A rectangular room: back wall, two side walls and a front wall with an
 * entrance. Room origin is at the centre of the entrance on the floor;
 * the room extends towards -z.
 */
export function room({ w, d, h, mats, entrance = { type: 'rect', w: 1.9, h: 3.6 }, floorMat, sideOpenings = {}, sky = true, offsetX = 0 }) {
  const g = new THREE.Group()
  const back = paneledWall({ w, h, mats, openings: sideOpenings.back || [] })
  back.position.set(offsetX, 0, -d)
  g.add(back)
  const left = paneledWall({ w: d, h, mats, openings: sideOpenings.left || [] })
  left.rotation.y = Math.PI / 2
  left.position.set(offsetX - w / 2, 0, -d / 2)
  g.add(left)
  const right = paneledWall({ w: d, h, mats, openings: sideOpenings.right || [] })
  right.rotation.y = -Math.PI / 2
  right.position.set(offsetX + w / 2, 0, -d / 2)
  g.add(right)
  // front wall is rotated 180°, so its local x is mirrored
  const front = paneledWall({ w, h, mats, openings: [{ x: offsetX, ...entrance }] })
  front.rotation.y = Math.PI
  front.position.set(offsetX, 0, -0.72)
  g.add(front)
  const f = floor(w, d, floorMat)
  f.position.set(offsetX, 0, -d / 2)
  g.add(f)
  if (sky) {
    const c = skylightCeiling(w, d, mats)
    c.position.set(offsetX, h, -d / 2)
    g.add(c)
  }
  return g
}
