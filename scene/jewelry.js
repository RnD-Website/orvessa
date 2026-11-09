/**
 * ORVESSA jewelry library — procedural pieces shared by the live site
 * (WebGL hall) and the offline studio renderer (tools/render).
 */
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

let renderer = null
let SPARKLE = null
export function initJewelry(r) {
  renderer = r
  SPARKLE = buildSparkleEnv()
  return { studioEnv: buildEnv(1), sparkleEnv: SPARKLE }
}

/* ---------- Environment: studio light-formers on black ---------- */
function buildEnv(warm = 1, bg = 0x0b0907) {
  const env = new THREE.Scene()
  env.background = new THREE.Color(0x000000)
  const box = new THREE.BoxGeometry(1, 1, 1)
  const add = (color, intensity, pos, scale, rot = [0, 0, 0]) => {
    const m = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity) }))
    m.position.set(...pos)
    m.scale.set(...scale)
    m.rotation.set(...rot)
    env.add(m)
  }
  env.background = new THREE.Color(bg)
  add(0xffffff, 2.6, [0, 10, 0], [16, 0.1, 8])            // overhead softbox
  add(0xfff3e2, 3.4, [-10, 2, 1], [0.1, 9, 6])            // big left softbox
  add(0xffe6c0, 3.0 * warm, [10, 1, -1], [0.1, 9, 3])     // right strip, warm
  add(0xffffff, 1.4, [0, 0, 10], [12, 5, 0.1])            // front card
  add(0xfff0da, 2.2, [0, 3, -10], [10, 3, 0.1])           // back rim card
  add(0xffc98a, 1.8 * warm, [0, -9, 0], [14, 0.1, 10])    // warm floor bounce
  add(0x000000, 1, [0, -2, 9.8], [3, 9, 0.12])            // black flag (contrast line)
  add(0x000000, 1, [-9.8, 2, -3], [0.12, 9, 1.4])         // black flag left
  add(0xffffff, 10.0, [4, 6, 5], [0.7, 0.7, 0.7])         // specular point
  add(0xffffff, 10.0, [-5, 4, 6], [0.5, 0.5, 0.5])        // specular point 2
  const pm = new THREE.PMREMGenerator(renderer)
  return pm.fromScene(env, 0.02).texture
}

/* Diamonds get a dedicated 'sparkle' environment: a mid-grey dome scattered
   with many small hard lights so every facet flashes like a real brilliant. */
function buildSparkleEnv() {
  const env = new THREE.Scene()
  env.background = new THREE.Color(0x232326)
  const box = new THREE.BoxGeometry(1, 1, 1)
  let seed = 11
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  for (let i = 0; i < 170; i++) {
    const th = rnd() * Math.PI * 2, ph = Math.acos(2 * rnd() - 1)
    const r = 10
    const m = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: new THREE.Color(rnd() > 0.85 ? 0xffe2b0 : 0xffffff).multiplyScalar(4 + rnd() * 8) }))
    m.position.set(r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th))
    const s = 0.7 + rnd() * 2.0
    m.scale.set(s * (0.5 + rnd()), s * (0.5 + rnd()), s)
    m.lookAt(0, 0, 0)
    env.add(m)
  }
  for (let i = 0; i < 18; i++) {
    const m = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: 0x000000 }))
    const th = rnd() * Math.PI * 2, ph = Math.acos(2 * rnd() - 1)
    m.position.set(9.5 * Math.sin(ph) * Math.cos(th), 9.5 * Math.cos(ph), 9.5 * Math.sin(ph) * Math.sin(th))
    m.scale.set(2 + rnd() * 3, 2 + rnd() * 3, 0.1); m.lookAt(0, 0, 0)
    env.add(m)
  }
  const pm = new THREE.PMREMGenerator(renderer)
  return pm.fromScene(env, 0).texture
}

/* ---------- Materials ---------- */
const MAT = {
  yellow: () => new THREE.MeshPhysicalMaterial({ color: new THREE.Color(1.0, 0.72, 0.36), metalness: 1, roughness: 0.1, envMapIntensity: 1.45, clearcoat: 0.3, clearcoatRoughness: 0.05 }),
  rose: () => new THREE.MeshPhysicalMaterial({ color: new THREE.Color(1.0, 0.66, 0.52), metalness: 1, roughness: 0.15, envMapIntensity: 1.3 }),
  white: () => new THREE.MeshPhysicalMaterial({ color: new THREE.Color(0.93, 0.92, 0.9), metalness: 1, roughness: 0.12, envMapIntensity: 1.3 }),
  brushed: () => new THREE.MeshPhysicalMaterial({ color: new THREE.Color(1.0, 0.74, 0.40), metalness: 1, roughness: 0.34, envMapIntensity: 1.2 }),
  diamond: () => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0.98, 0.99, 1.0), metalness: 1, roughness: 0, envMap: SPARKLE, envMapIntensity: 1.6, flatShading: true,
    iridescence: 0.85, iridescenceIOR: 2.1, iridescenceThicknessRange: [250, 1200]
  }),
  satin: (c = 0x1a1612) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.42, metalness: 0, sheen: 1, sheenRoughness: 0.35, sheenColor: new THREE.Color(0x8a7356), envMapIntensity: 0.6 }),
  stone: () => new THREE.MeshPhysicalMaterial({ color: 0x141312, roughness: 0.55, metalness: 0, envMapIntensity: 0.5, clearcoat: 0.4, clearcoatRoughness: 0.3 })
}

/* ---------- Geometry builders ---------- */
function brilliant(r = 1, seg = 16) {
  const pts = [
    new THREE.Vector2(0.0001, 0.36 * r),
    new THREE.Vector2(0.55 * r, 0.36 * r),   // table edge
    new THREE.Vector2(0.74 * r, 0.27 * r),   // star facet
    new THREE.Vector2(0.9 * r, 0.13 * r),    // kite facet
    new THREE.Vector2(1.0 * r, 0.025 * r),   // girdle top
    new THREE.Vector2(1.0 * r, -0.025 * r),  // girdle bottom
    new THREE.Vector2(0.7 * r, -0.3 * r),    // lower girdle facet
    new THREE.Vector2(0.32 * r, -0.62 * r),  // pavilion main
    new THREE.Vector2(0.0001, -0.86 * r)     // culet
  ]
  const g = new THREE.LatheGeometry(pts, seg * 2)
  // twist alternate rings so facets interleave like a real brilliant
  const p = g.attributes.position
  const rings = pts.length
  for (let i = 0; i < p.count; i++) {
    const ring = i % rings, col = Math.floor(i / rings)
    if (ring === 2 || ring === 6) {
      const x = p.getX(i), z = p.getZ(i)
      const a = Math.atan2(z, x) + (col % 2 ? 1 : -1) * Math.PI / (seg * 4)
      const rr = Math.hypot(x, z) * (col % 2 ? 1.03 : 0.97)
      p.setXYZ(i, Math.cos(a) * rr, p.getY(i), Math.sin(a) * rr)
    }
  }
  return g.toNonIndexed()
}
function pear(r = 1) {
  const g = brilliant(r, 24)
  const p = g.attributes.position
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), z = p.getZ(i)
    if (z > 0) {
      const k = z / r
      z = z * 1.75
      x = x * (1 - 0.82 * Math.pow(k, 1.6))
    }
    p.setXYZ(i, x, p.getY(i), z)
  }
  g.computeVertexNormals()
  return g
}
function prongHead(stoneR, mat, prongs = 4) {
  const grp = new THREE.Group()
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(stoneR * 0.7, stoneR * 0.35, stoneR * 0.6, 32, 1, true), mat)
  cup.position.y = -stoneR * 0.55
  grp.add(cup)
  for (let i = 0; i < prongs; i++) {
    const a = (i / prongs) * Math.PI * 2 + Math.PI / prongs
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.cos(a) * stoneR * 0.35, -stoneR * 0.85, Math.sin(a) * stoneR * 0.35),
      new THREE.Vector3(Math.cos(a) * stoneR * 1.0, 0, Math.sin(a) * stoneR * 1.0),
      new THREE.Vector3(Math.cos(a) * stoneR * 0.86, stoneR * 0.38, Math.sin(a) * stoneR * 0.86)
    ])
    grp.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 24, stoneR * 0.075, 10), mat))
    const tip = new THREE.Mesh(new THREE.SphereGeometry(stoneR * 0.095, 16, 12), mat)
    tip.position.copy(curve.getPoint(1))
    grp.add(tip)
  }
  return grp
}
function band(R = 1, tube = 0.085, mat, width = 1.25) {
  const g = new THREE.TorusGeometry(R, tube, 48, 220)
  g.scale(1, 1, width)
  return new THREE.Mesh(g, mat)
}
function chainCurve(points, closed = false) {
  return new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)), closed, 'centripetal')
}
function cableChain(curve, linkLen, thick, mat) {
  const len = curve.getLength()
  const n = Math.floor(len / (linkLen * 0.74))
  const geo = new THREE.TorusGeometry(linkLen * 0.5, thick, 10, 28)
  geo.scale(1, 0.62, 1)
  const mesh = new THREE.InstancedMesh(geo, mat, n)
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), q2 = new THREE.Quaternion()
  const X = new THREE.Vector3(1, 0, 0)
  for (let i = 0; i < n; i++) {
    const t = i / n
    const p = curve.getPointAt(t)
    const tan = curve.getTangentAt(t).normalize()
    q.setFromUnitVectors(X, tan)
    q2.setFromAxisAngle(tan, (i % 2) * Math.PI / 2 + 0.25)
    q.premultiply(q2)
    m.compose(p, q, new THREE.Vector3(1, 1, 1))
    mesh.setMatrixAt(i, m)
  }
  mesh.castShadow = true
  return mesh
}
function ropeChain(curve, radius, strandR, mat, twist = 9) {
  const segs = 900
  const frames = curve.computeFrenetFrames(segs, false)
  const grp = new THREE.Group()
  const len = curve.getLength()
  for (let k = 0; k < 3; k++) {
    const pts = []
    for (let i = 0; i <= segs; i++) {
      const t = i / segs
      const p = curve.getPointAt(t)
      const th = t * len * twist + (k * Math.PI * 2) / 3
      const off = frames.normals[i].clone().multiplyScalar(Math.cos(th) * radius)
        .add(frames.binormals[i].clone().multiplyScalar(Math.sin(th) * radius))
      pts.push(p.add(off))
    }
    const c = new THREE.CatmullRomCurve3(pts)
    const m = new THREE.Mesh(new THREE.TubeGeometry(c, segs * 2, strandR, 10), mat)
    m.castShadow = true
    grp.add(m)
  }
  return grp
}
function twistBand(R, a, tube, mat) {
  const grp = new THREE.Group()
  for (const s of [1, -1]) {
    const pts = []
    for (let i = 0; i <= 400; i++) {
      const t = (i / 400) * Math.PI * 2
      const rr = R + 0.05 * Math.cos(t * 3 + (s > 0 ? 0 : Math.PI))
      pts.push(new THREE.Vector3(rr * Math.cos(t), rr * Math.sin(t), s * a * Math.sin(t * 3)))
    }
    grp.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 600, tube, 20, true), mat))
  }
  return grp
}
function dropGeo(h = 1, r = 0.45) {
  const pts = []
  for (let i = 0; i <= 64; i++) {
    const t = i / 64
    const y = -t * h
    const x = r * Math.sin(Math.PI * Math.pow(t, 0.72)) * (0.35 + 0.65 * t)
    pts.push(new THREE.Vector2(Math.max(x, 0.0001), y))
  }
  const g = new THREE.LatheGeometry(pts, 96)
  // sculpt: gentle organic ripple
  const p = g.attributes.position
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i)
    const a = Math.atan2(z, x)
    const k = 1 + 0.06 * Math.sin(a * 3 + y * 5)
    p.setXYZ(i, x * k, y, z * k * 0.82)
  }
  g.computeVertexNormals()
  return g
}
function pave(R, count, stoneR, mat, metal, arcFrom = 0, arcTo = Math.PI, zTilt = 0) {
  const grp = new THREE.Group()
  const gem = brilliant(stoneR, 12)
  for (let i = 0; i < count; i++) {
    const a = arcFrom + (i + 0.5) / count * (arcTo - arcFrom)
    const s = new THREE.Mesh(gem, mat)
    s.position.set(Math.cos(a) * R, Math.sin(a) * R, zTilt); s.scale.y = 0.8
    s.rotation.z = a - Math.PI / 2
    grp.add(s)
    const bead = new THREE.Mesh(new THREE.SphereGeometry(stoneR * 0.18, 8, 6), metal)
    bead.position.set(Math.cos(a + 0.5 / count * (arcTo - arcFrom)) * (R + stoneR * 0.2), Math.sin(a + 0.5 / count * (arcTo - arcFrom)) * (R + stoneR * 0.2), zTilt + stoneR * 0.55)
    grp.add(bead)
  }
  return grp
}
function bokeh(n = 140, spread = 8, depth = [-8, 2], color = 0xffd7a0, size = 0.08) {
  const c = document.createElement('canvas'); c.width = c.height = 64
  const g = c.getContext('2d')
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(0.35, 'rgba(255,255,255,0.35)'); grd.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grd; g.fillRect(0, 0, 64, 64)
  const tex = new THREE.CanvasTexture(c)
  const pos = new Float32Array(n * 3)
  let seed = 7
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  for (let i = 0; i < n; i++) {
    pos[i * 3] = (rnd() - 0.5) * spread * 1.6
    pos[i * 3 + 1] = (rnd() - 0.5) * spread * 2
    pos[i * 3 + 2] = depth[0] + rnd() * (depth[1] - depth[0])
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  return new THREE.Points(geo, new THREE.PointsMaterial({ map: tex, color, size, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }))
}
function drape(w = 16, h = 12, color) {
  const g = new THREE.PlaneGeometry(w, h, 260, 200)
  const p = g.attributes.position
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i)
    const z = 0.32 * Math.sin(x * 0.9 + y * 0.35) + 0.18 * Math.sin(x * 2.1 - y * 0.8) + 0.08 * Math.sin(x * 4.3 + y * 1.7) + 0.45 * Math.exp(-((x + 2) ** 2) / 6) * Math.sin(y * 0.6)
    p.setZ(i, z)
  }
  g.computeVertexNormals()
  const m = new THREE.Mesh(g, MAT.satin(color))
  m.receiveShadow = true
  return m
}

/* ---------- Pieces ---------- */
const PIECES = {
  solitaire(metal = 'yellow') {
    const g = new THREE.Group(), mt = MAT[metal](), dm = MAT.diamond()
    const b = band(1, 0.075, mt, 1.15); g.add(b)
    const head = prongHead(0.36, mt, 6); head.position.y = 1.32; g.add(head)
    const d = new THREE.Mesh(brilliant(0.36, 16), dm); d.position.y = 1.32; g.add(d)
    g.add(pave(1.07, 9, 0.055, dm, mt, Math.PI * 0.12, Math.PI * 0.4, 0))
    g.add(pave(1.07, 9, 0.055, dm, mt, Math.PI * 0.6, Math.PI * 0.88, 0))
    return g
  },
  etoile(metal = 'yellow') {
    const g = new THREE.Group(), mt = MAT[metal](), dm = MAT.diamond()
    g.add(twistBand(1, 0.11, 0.07, mt))
    const head = prongHead(0.26, mt, 4); head.position.y = 1.2; g.add(head)
    const d = new THREE.Mesh(brilliant(0.26), dm); d.position.y = 1.2; g.add(d)
    for (const s of [-1, 1]) {
      const h2 = prongHead(0.15, mt, 4); h2.position.set(s * 0.36, 1.08, 0); h2.rotation.z = -s * 0.32; g.add(h2)
      const d2 = new THREE.Mesh(brilliant(0.15), dm); d2.position.copy(h2.position); d2.rotation.z = h2.rotation.z; g.add(d2)
    }
    return g
  },
  paveBand(metal = 'yellow') {
    const g = new THREE.Group(), mt = MAT[metal](), dm = MAT.diamond()
    g.add(band(1, 0.1, mt, 0.9))
    g.add(pave(1.1, 40, 0.07, dm, mt, 0, Math.PI * 2, 0))
    return g
  },
  sculptRing(metal = 'yellow') {
    const g = new THREE.Group(), mt = MAT[metal]()
    const k = new THREE.TorusKnotGeometry(0.95, 0.12, 400, 32, 1, 2)
    g.add(new THREE.Mesh(k, mt))
    return g
  },
  pendant(metal = 'yellow') {
    const g = new THREE.Group(), mt = MAT[metal](), dm = MAT.diamond()
    const curve = chainCurve([[-3.4, 4.6, -0.4], [-2.2, 1.6, 0.2], [-1, -0.2, 0.4], [0, -0.75, 0.45], [1, -0.2, 0.4], [2.2, 1.6, 0.2], [3.4, 4.6, -0.4]])
    g.add(cableChain(curve, 0.11, 0.014, mt))
    const p = new THREE.Group()
    const stone = new THREE.Mesh(pear(0.42), dm); stone.rotation.x = Math.PI / 2; stone.rotation.z = Math.PI
    p.add(stone)
    // bezel following pear outline
    const outline = []
    for (let i = 0; i <= 120; i++) {
      const a = (i / 120) * Math.PI * 2
      let x = Math.cos(a) * 0.43, z = Math.sin(a) * 0.43
      if (z > 0) { const k = z / 0.43; z *= 1.75; x *= 1 - 0.82 * Math.pow(k, 1.6) }
      outline.push(new THREE.Vector3(x, -z, 0))
    }
    p.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(outline, true), 200, 0.03, 10, true), mt))
    const bail = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.022, 12, 40), mt); bail.position.y = 0.52; bail.rotation.y = Math.PI / 2
    p.add(bail)
    p.position.set(0, -1.45, 0.5)
    g.add(p)
    return g
  },
  rope(metal = 'yellow') {
    const g = new THREE.Group(), mt = MAT[metal](), dm = MAT.diamond()
    const curve = chainCurve([[-3.6, 4.4, -0.5], [-2.6, 1.2, 0.1], [-1.2, -0.7, 0.4], [0, -1.1, 0.5], [1.2, -0.7, 0.4], [2.6, 1.2, 0.1], [3.6, 4.4, -0.5]])
    g.add(ropeChain(curve, 0.055, 0.045, mt, 7))
    const clasp = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.22, 0.2, 4, 0.08), mt)
    clasp.position.set(0, -1.12, 0.52); g.add(clasp)
    for (let i = -1; i <= 1; i++) {
      const d = new THREE.Mesh(brilliant(0.055, 12), dm); d.rotation.x = Math.PI / 2; d.position.set(i * 0.14, -1.12, 0.63); g.add(d)
    }
    return g
  },
  layered(metal = 'yellow') {
    const g = new THREE.Group(), mt = MAT[metal]()
    g.add(cableChain(chainCurve([[-3.2, 4.6, -0.4], [-1.6, 0.8, 0.2], [0, -0.3, 0.4], [1.6, 0.8, 0.2], [3.2, 4.6, -0.4]]), 0.12, 0.016, mt))
    g.add(ropeChain(chainCurve([[-3.4, 4.6, -0.4], [-2, 0.2, 0.2], [0, -1.2, 0.5], [2, 0.2, 0.2], [3.4, 4.6, -0.4]]), 0.04, 0.034, mt, 8))
    g.add(cableChain(chainCurve([[-3.6, 4.6, -0.4], [-2.2, -0.6, 0.2], [0, -2.2, 0.5], [2.2, -0.6, 0.2], [3.6, 4.6, -0.4]]), 0.2, 0.03, mt))
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 64), mt); disc.rotation.x = Math.PI / 2; disc.position.set(0, -2.55, 0.5); g.add(disc)
    return g
  },
  drops(metal = 'yellow') {
    const g = new THREE.Group(), mt = MAT[metal](), dm = MAT.diamond()
    for (const s of [-1, 1]) {
      const e = new THREE.Group()
      const d = new THREE.Mesh(dropGeo(1.6, 0.55), mt); d.position.y = -0.25; e.add(d)
      const head = prongHead(0.14, mt, 4); head.rotation.x = Math.PI / 2; e.add(head)
      const st = new THREE.Mesh(brilliant(0.14), dm); st.rotation.x = Math.PI / 2; e.add(st)
      e.position.set(s * 0.85, 0.7, 0); e.rotation.y = s * 0.5; e.rotation.z = s * 0.06
      g.add(e)
    }
    return g
  },
  hoops(metal = 'yellow') {
    const g = new THREE.Group(), mt = MAT[metal]()
    for (const s of [-1, 1]) {
      const geo = new THREE.TorusGeometry(0.9, 0.11, 48, 200, Math.PI * 1.88)
      geo.scale(1, 1, 1.5)
      const h = new THREE.Mesh(geo, mt)
      h.rotation.z = Math.PI / 2 + 0.03 * s
      h.rotation.y = s * 0.7
      h.position.x = s * 1.05
      g.add(h)
    }
    return g
  },
  studs(metal = 'white') {
    const g = new THREE.Group(), mt = MAT[metal](), dm = MAT.diamond()
    for (const s of [-1, 1]) {
      const e = new THREE.Group()
      const head = prongHead(0.5, mt, 4); e.add(head)
      e.add(new THREE.Mesh(brilliant(0.5, 16), dm))
      e.rotation.x = 0.9; e.rotation.z = s * 0.25
      e.position.set(s * 0.8, 0, 0)
      g.add(e)
    }
    return g
  },
  cuff(metal = 'yellow') {
    const g = new THREE.Group(), mt = MAT[metal]()
    const geo = new THREE.TorusGeometry(1.4, 0.07, 48, 260, Math.PI * 1.74)
    geo.scale(1, 0.8, 5.2)
    const c = new THREE.Mesh(geo, mt)
    c.rotation.z = Math.PI * 0.63
    g.add(c)
    for (const s of [0, Math.PI * 1.74]) {
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 16), mt)
      const a = s + Math.PI * 0.63
      cap.position.set(Math.cos(a) * 1.4, Math.sin(a) * 1.12, 0)
      cap.scale.set(1, 1, 3.3)
      g.add(cap)
    }
    return g
  },
  tennis(metal = 'white') {
    const g = new THREE.Group(), mt = MAT[metal](), dm = MAT.diamond()
    const n = 30
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2
      const p = new THREE.Vector3(Math.cos(a) * 1.5, Math.sin(a) * 1.2, 0)
      const cell = new THREE.Group()
      const box = new THREE.Mesh(new RoundedBoxGeometry(0.26, 0.26, 0.14, 3, 0.04), mt); box.position.z = -0.06; cell.add(box)
      const st = new THREE.Mesh(brilliant(0.12, 16), dm); st.rotation.x = Math.PI / 2; st.position.z = 0.04; cell.add(st)
      cell.position.copy(p)
      cell.rotation.z = a
      g.add(cell)
    }
    return g
  },
  chainBracelet(metal = 'yellow') {
    const g = new THREE.Group(), mt = MAT[metal]()
    const pts = []
    for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; pts.push([Math.cos(a) * 1.5, Math.sin(a) * 1.2 + (a > Math.PI ? 0 : 0), Math.sin(a * 2) * 0.12]) }
    g.add(cableChain(chainCurve(pts, true), 0.34, 0.055, mt))
    return g
  },
  ingots() {
    const g = new THREE.Group(), mt = MAT.brushed()
    const geo = new RoundedBoxGeometry(1.6, 0.42, 0.8, 6, 0.12)
    const pos = [[0, 0, 0, 0.1], [1.25, 0.05, -1.0, -0.4], [-1.4, 0.0, -0.9, 0.5], [0.4, 0.44, -0.3, 0.25]]
    for (const [x, y, z, r] of pos) { const m = new THREE.Mesh(geo, mt); m.position.set(x, y, z); m.rotation.y = r; m.castShadow = true; g.add(m) }
    return g
  },
  stack() {
    const g = new THREE.Group()
    const a = PIECES.solitaire('yellow'); a.rotation.set(0.3, 0.6, 0); g.add(a)
    const b = PIECES.paveBand('white'); b.position.set(1.6, -0.5, -0.8); b.rotation.set(1.1, 0.2, 0.3); g.add(b)
    const c = PIECES.sculptRing('rose'); c.position.set(-1.7, -0.6, -0.6); c.rotation.set(1.2, -0.3, 0); c.scale.setScalar(0.8); g.add(c)
    return g
  },
  loose() {
    const g = new THREE.Group(), dm = MAT.diamond()
    const spots = [[0, 0, 0, 0.7], [1.5, -0.5, -0.8, 0.4], [-1.4, -0.3, -0.4, 0.45], [0.7, 0.9, -1.6, 0.3], [-0.6, -1.0, 0.6, 0.25], [2.2, 0.6, -2, 0.3], [-2.3, 0.7, -1.8, 0.28]]
    for (const [x, y, z, r] of spots) {
      const d = new THREE.Mesh(brilliant(r, 16), dm); d.position.set(x, y, z); d.rotation.set(0.5 + x, y, 0.2); g.add(d)
    }
    return g
  }
}


/* ---------- Display pieces (velvet bust, plinths, sparkle glints) ---------- */
/** Bust profile radius (before z-flattening) at height y (0 = base, 1 = top of neck). */
function bustR(y) {
  // jeweller's display bust: short neck, trapezius slope, rounded shoulders, cut chest
  const ss = (a, b, t) => { const k = Math.min(1, Math.max(0, (t - a) / (b - a))); return k * k * (3 - 2 * k) }
  if (y >= 0.66) return 0.088 + 0.008 * ss(0.8, 0.66, y)                        // neck
  if (y >= 0.55) return 0.096 + 0.2 * Math.pow(ss(0.66, 0.55, y), 0.75)          // trapezius
  if (y >= 0.42) return 0.296 + 0.08 * Math.sin(ss(0.55, 0.42, y) * Math.PI / 2) // shoulder round
  return 0.376 - 0.07 * ss(0.42, 0.0, y)                                         // chest
}
const BUST_Z = 0.5
export function velvetBust(color = 0x050404) {
  const pts = []
  for (let i = 0; i <= 90; i++) { const y = i / 90 * 0.8; pts.push(new THREE.Vector2(bustR(y), y)) }
  pts.push(new THREE.Vector2(0.09, 0.81)); pts.push(new THREE.Vector2(0.0001, 0.81))
  const g = new THREE.LatheGeometry(pts, 96)
  g.scale(1, 1, BUST_Z)
  g.computeVertexNormals()
  const light = new THREE.Color(color).getHSL({}).l > 0.4
  const mat = new THREE.MeshPhysicalMaterial({ color: light ? color : 0x020202, roughness: light ? 1 : 0.92, sheen: light ? 0.4 : 0.3, sheenRoughness: 0.6, sheenColor: new THREE.Color(light ? 0xfff4e4 : 0x1c1510), envMapIntensity: light ? 0.15 : 0.015 })
  const m = new THREE.Mesh(g, mat)
  m.castShadow = m.receiveShadow = true
  return m
}
/** A necklace draped around the bust's neck with a pear pendant on the chest. */
export function bustNecklace(metal = 'yellow', { rope = false } = {}) {
  const g = new THREE.Group(), mt = MAT[metal](), dm = MAT.diamond()
  const pts = []
  for (let i = 0; i < 64; i++) {
    const a = (i / 64) * Math.PI * 2                       // a = 0 → front
    const front = Math.pow((1 + Math.cos(a)) / 2, 2.2)
    const y = 0.64 - front * 0.12
    const r = bustR(y) + 0.01
    pts.push(new THREE.Vector3(r * Math.sin(a), y, r * Math.cos(a) * BUST_Z + 0.008 * front))
  }
  const curve = new THREE.CatmullRomCurve3(pts, true, 'centripetal')
  g.add(rope ? ropeChain(curve, 0.0042, 0.0036, mt, 140) : cableChain(curve, 0.016, 0.0024, mt))
  const front = curve.getPointAt(0)
  const p = new THREE.Group()
  const stone = new THREE.Mesh(pear(0.05), dm); stone.rotation.x = Math.PI / 2; stone.rotation.z = Math.PI
  p.add(stone)
  const outline = []
  for (let i = 0; i <= 120; i++) {
    const a = (i / 120) * Math.PI * 2
    let x = Math.cos(a) * 0.051, z = Math.sin(a) * 0.051
    if (z > 0) { const k = z / 0.051; z *= 1.75; x *= 1 - 0.82 * Math.pow(k, 1.6) }
    outline.push(new THREE.Vector3(x, -z, 0))
  }
  p.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(outline, true), 200, 0.0032, 8, true), mt))
  const halo = pave(0.066, 24, 0.0065, dm, mt, Math.PI * 0.05, Math.PI * 1.95, 0)
  halo.scale.set(0.82, 1.2, 1); halo.position.y = -0.03; halo.rotation.z = Math.PI / 2
  p.add(halo)
  const bail = new THREE.Mesh(new THREE.TorusGeometry(0.01, 0.0026, 10, 32), mt); bail.position.y = 0.058; bail.rotation.y = Math.PI / 2
  p.add(bail)
  p.position.set(front.x, front.y - 0.07, front.z + 0.03)
  p.rotation.x = -0.32
  g.add(p)
  g.userData.glints = [p.position.clone().add(new THREE.Vector3(0, -0.015, 0.02))]
  return g
}
/** Travertine / marble plinth. */
export function plinth(w = 0.5, h = 1.05, color = 0xbfae94) {
  const g = new THREE.Group()
  const mat = new THREE.MeshPhysicalMaterial({ color, roughness: 0.42, clearcoat: 0.4, clearcoatRoughness: 0.25, envMapIntensity: 0.45 })
  const add = (geo, y) => { const m = new THREE.Mesh(geo, mat); m.position.y = y; m.castShadow = m.receiveShadow = true; g.add(m) }
  add(new RoundedBoxGeometry(w + 0.12, 0.08, w + 0.12, 3, 0.015), 0.04)
  add(new RoundedBoxGeometry(w, h - 0.16, w, 3, 0.01), h / 2)
  add(new RoundedBoxGeometry(w + 0.1, 0.08, w + 0.1, 3, 0.015), h - 0.04)
  return g
}
/** Twinkling star glints placed on diamonds (additive sprites). */
export function glints(points, size = 0.09) {
  const c = document.createElement('canvas'); c.width = c.height = 128
  const x = c.getContext('2d')
  const grd = x.createRadialGradient(64, 64, 0, 64, 64, 64)
  grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(0.08, 'rgba(255,250,240,0.8)'); grd.addColorStop(0.3, 'rgba(255,240,220,0.08)'); grd.addColorStop(1, 'rgba(255,240,220,0)')
  x.fillStyle = grd; x.fillRect(0, 0, 128, 128)
  x.globalCompositeOperation = 'lighter'
  for (const [w, h] of [[128, 3], [3, 128]]) {
    const gg = x.createLinearGradient(w > h ? 0 : 64, w > h ? 64 : 0, w > h ? 128 : 64, w > h ? 64 : 128)
    gg.addColorStop(0, 'rgba(255,255,255,0)'); gg.addColorStop(0.5, 'rgba(255,255,255,0.9)'); gg.addColorStop(1, 'rgba(255,255,255,0)')
    x.fillStyle = gg; x.fillRect(64 - w / 2, 64 - h / 2, w, h)
  }
  const tex = new THREE.CanvasTexture(c)
  const grp = new THREE.Group()
  points.forEach((p, i) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, opacity: 0 }))
    s.position.copy(p)
    s.userData.phase = i * 1.7 + Math.random() * 3
    s.userData.base = size
    grp.add(s)
  })
  grp.userData.update = (t) => grp.children.forEach(s => {
    const k = Math.pow(Math.max(0, Math.sin(t * 1.3 + s.userData.phase)), 14)
    s.material.opacity = k
    s.material.rotation = t * 0.4 + s.userData.phase
    s.scale.setScalar(s.userData.base * (0.4 + k))
  })
  return grp
}

/* ---------- Statement necklaces worn on the bust ---------- */
/** Closed curve hugging the bust: yBack = height at the nape, drop = how far the front falls. */
export function neckCurve(yBack = 0.66, drop = 0.12, power = 2.2, lift = 0.01, n = 96) {
  const pts = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const front = Math.pow((1 + Math.cos(a)) / 2, power)
    const y = yBack - front * drop
    const r = bustR(y) + lift
    pts.push(new THREE.Vector3(r * Math.sin(a), y, r * Math.cos(a) * BUST_Z + 0.006 * front))
  }
  return new THREE.CatmullRomCurve3(pts, true, 'centripetal')
}
const outward = (p) => new THREE.Vector3(p.x, 0, p.z / BUST_Z).normalize()

/** Graduated diamond rivière in collet settings. */
function riviere(metal = 'white') {
  const g = new THREE.Group(), mt = MAT[metal](), dm = MAT.diamond()
  const curve = neckCurve(0.645, 0.13, 2.0, 0.016)
  const n = 41
  const gem = (r) => brilliant(r, 16)
  for (let i = 0; i < n; i++) {
    const t = (i / n + 0.5) % 1 // t=0.5 → back
    const fromFront = Math.min(Math.abs(t), Math.abs(1 - t)) * 2 // 0 front … 1 back
    if (fromFront > 0.72) continue
    const r = 0.0105 + 0.012 * Math.pow(1 - fromFront / 0.72, 1.6)
    const p = curve.getPointAt(t)
    const o = outward(p)
    const set = new THREE.Group()
    const collet = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.08, r * 0.7, r * 0.9, 24, 1, true), mt); collet.position.y = -r * 0.35; set.add(collet)
    const st = new THREE.Mesh(gem(r), dm); set.add(st)
    set.position.copy(p).add(o.clone().multiplyScalar(r * 0.55))
    set.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), o.clone().add(new THREE.Vector3(0, 0.35, 0)).normalize())
    g.add(set)
  }
  // fine chain completing the back
  g.add(cableChain(neckCurve(0.65, 0.13, 2.0, 0.008), 0.012, 0.0018, mt))
  return g
}
/** Multi-row sculpted gold collar (seven graduated rows). */
function collar(metal = 'yellow') {
  const g = new THREE.Group(), mt = MAT[metal]()
  for (let k = 0; k < 7; k++) {
    const c = neckCurve(0.655 - k * 0.006, 0.07 + k * 0.016, 1.8, 0.008 + k * 0.0015)
    const m = new THREE.Mesh(new THREE.TubeGeometry(c, 420, 0.0062, 12, true), mt)
    m.castShadow = true
    g.add(m)
  }
  // central sculpted clasp-medallion
  const front = neckCurve(0.655 - 6 * 0.006, 0.07 + 6 * 0.016, 1.8, 0.02).getPointAt(0)
  const med = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.009, 24, 64), mt)
  med.position.copy(front).add(new THREE.Vector3(0, -0.012, 0.006)); med.rotation.x = -0.35
  g.add(med)
  const st = new THREE.Mesh(brilliant(0.02, 16), MAT.diamond()); st.position.copy(med.position).add(new THREE.Vector3(0, 0, 0.004)); st.rotation.x = Math.PI / 2 - 0.35
  g.add(st)
  return g
}
/** Diamond cascade: fine chain with a fringe of pear drops, longest at the centre. */
function cascade(metal = 'white') {
  const g = new THREE.Group(), mt = MAT[metal](), dm = MAT.diamond()
  const curve = neckCurve(0.645, 0.1, 2.0, 0.012)
  g.add(cableChain(curve, 0.011, 0.0017, mt))
  const n = 15
  for (let i = 0; i < n; i++) {
    const u = (i - (n - 1) / 2) / ((n - 1) / 2)     // -1 … 1
    const t = ((u * 0.22) + 1) % 1
    const p = curve.getPointAt(t)
    const o = outward(p)
    const len = 0.02 + 0.075 * Math.pow(1 - Math.abs(u), 1.4)
    const top = p.clone().add(o.clone().multiplyScalar(0.006))
    // drop line of small brilliants
    const k = Math.max(1, Math.round(len / 0.016))
    for (let j = 0; j < k; j++) {
      const sp = top.clone().add(new THREE.Vector3(0, -j * 0.016, 0)).add(o.clone().multiplyScalar(j * 0.004))
      const s = new THREE.Mesh(brilliant(0.0055, 12), dm); s.position.copy(sp); s.rotation.x = Math.PI / 2; g.add(s)
    }
    const pr = new THREE.Mesh(pear(0.011 + 0.008 * (1 - Math.abs(u))), dm)
    pr.position.copy(top).add(new THREE.Vector3(0, -k * 0.016 - 0.012, 0)).add(o.clone().multiplyScalar(k * 0.004 + 0.004))
    pr.rotation.set(Math.PI / 2, 0, Math.PI)
    pr.rotation.y = Math.atan2(o.x, o.z)
    g.add(pr)
  }
  return g
}
/** Chunky polished gold chain (oversized cable links). */
function chunky(metal = 'yellow') {
  const g = new THREE.Group(), mt = MAT[metal]()
  g.add(cableChain(neckCurve(0.66, 0.15, 1.8, 0.02), 0.052, 0.0085, mt))
  const front = neckCurve(0.66, 0.15, 1.8, 0.03).getPointAt(0)
  const tag = new THREE.Mesh(new RoundedBoxGeometry(0.05, 0.065, 0.01, 4, 0.004), mt); tag.position.copy(front).add(new THREE.Vector3(0, -0.045, 0.01)); tag.rotation.x = -0.3
  g.add(tag)
  return g
}
/** Pendant & rope variants (existing bustNecklace) */
export const WORN = {
  lumiere: (m = 'yellow') => bustNecklace(m),
  celeste: (m = 'yellow') => { const g = new THREE.Group(); g.add(ropeChain(neckCurve(0.65, 0.11, 2.0, 0.012), 0.0065, 0.0055, MAT[m](), 90)); return g },
  riviere, collar, cascade, chunky,
  layered: (m = 'yellow') => { const g = new THREE.Group(); const mt = MAT[m](); g.add(cableChain(neckCurve(0.66, 0.06, 2, 0.01), 0.012, 0.0018, mt)); g.add(ropeChain(neckCurve(0.65, 0.12, 2, 0.014), 0.004, 0.0034, mt, 120)); g.add(cableChain(neckCurve(0.64, 0.2, 2, 0.02), 0.03, 0.005, mt)); return g }
}
/** A bust wearing a piece, ready to drop on a plinth. */
export function wornBust(piece, metal, bustColor = 0x050404) {
  const g = new THREE.Group()
  g.add(velvetBust(bustColor))
  g.add(WORN[piece](metal))
  return g
}

export { MAT, PIECES, brilliant, pear, bokeh, drape, buildEnv }
