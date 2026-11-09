/**
 * Room furniture and surreal set pieces. Each chapter of the maison is
 * staged like the reference: a rug, one piece of furniture and one
 * oversized, slightly surreal jewelry object.
 */
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { PIECES, MAT } from '../jewelry.js'

const shadow = o => { o.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true } }); return o }

export function rug(w, d, tex) {
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, 0.02, d, 2, 0.008), new THREE.MeshStandardMaterial({ map: tex, roughness: 1, envMapIntensity: 0.15 }))
  m.position.y = 0.01
  m.receiveShadow = true
  return m
}

/** A strand of oversized pearls snaking across the floor. */
export function pearlStrand(points, size = 0.09) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)))
  const n = Math.floor(curve.getLength() / (size * 2.05))
  const mat = new THREE.MeshPhysicalMaterial({ color: 0xf3ece0, roughness: 0.18, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08, iridescence: 0.6, iridescenceIOR: 1.6, sheen: 0.6, sheenColor: new THREE.Color(0xffe8d2), envMapIntensity: 1.2 })
  const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(size, 32, 24), mat, n)
  const m = new THREE.Matrix4()
  for (let i = 0; i < n; i++) {
    const p = curve.getPointAt(i / n)
    m.makeTranslation(p.x, size, p.z)
    mesh.setMatrixAt(i, m)
  }
  mesh.castShadow = true
  return mesh
}

/** Velvet armchair (simple tailored silhouette). */
export function armchair(mats) {
  const g = new THREE.Group()
  const seat = new THREE.Mesh(new RoundedBoxGeometry(0.72, 0.18, 0.66, 4, 0.06), mats.velvet); seat.position.y = 0.46; g.add(seat)
  const back = new THREE.Mesh(new RoundedBoxGeometry(0.72, 0.62, 0.14, 4, 0.06), mats.velvet); back.position.set(0, 0.84, -0.27); back.rotation.x = -0.12; g.add(back)
  for (const s of [-1, 1]) {
    const arm = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.26, 0.6, 4, 0.05), mats.velvet); arm.position.set(s * 0.36, 0.64, 0.0); g.add(arm)
    for (const z of [-0.26, 0.26]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.016, 0.38, 12), mats.brass); leg.position.set(s * 0.3, 0.19, z); g.add(leg)
    }
  }
  return shadow(g)
}

/** A tumbling pile of leather jewelry boxes (echoes the reference's book pile). */
export function boxPile(count = 70, seed = 17) {
  const g = new THREE.Group()
  let s = seed
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647
  const leathers = [0x6e2a22, 0x2a2622, 0xd8cbb9, 0x3b4048, 0x8a6a46, 0x1d1a17].map(c => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.55, clearcoat: 0.35, clearcoatRoughness: 0.4, envMapIntensity: 0.5 }))
  const gold = new THREE.MeshStandardMaterial({ color: 0xc6a46a, metalness: 1, roughness: 0.3 })
  for (let i = 0; i < count; i++) {
    const w = 0.18 + rnd() * 0.22, h = 0.08 + rnd() * 0.08, d = 0.14 + rnd() * 0.16
    const bx = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, 0.015), leathers[Math.floor(rnd() * leathers.length)])
    const rad = Math.pow(rnd(), 0.8) * 1.4
    const a = rnd() * Math.PI * 2
    const height = Math.max(0, (1.4 - rad) * 0.55 * rnd())
    bx.position.set(Math.cos(a) * rad, h / 2 + height, Math.sin(a) * rad * 0.8)
    bx.rotation.set((rnd() - 0.5) * 0.4, rnd() * Math.PI, (rnd() - 0.5) * 0.4)
    g.add(bx)
    if (rnd() > 0.6) { const line = new THREE.Mesh(new THREE.BoxGeometry(w * 0.8, 0.006, 0.004), gold); line.position.set(0, h * 0.2, d / 2 + 0.002); bx.add(line) }
  }
  return shadow(g)
}

/** Goldsmith's bench with tools, ingots and a lamp. */
export function goldsmithBench(mats) {
  const g = new THREE.Group()
  const top = new THREE.Shape()
  top.moveTo(-0.9, -0.35); top.lineTo(0.9, -0.35); top.lineTo(0.9, 0.35); top.lineTo(0.28, 0.35)
  top.absarc(0, 0.35, 0.28, 0, Math.PI, true)
  top.lineTo(-0.9, 0.35); top.closePath()
  const tgeo = new THREE.ExtrudeGeometry(top, { depth: 0.07, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 2 })
  tgeo.rotateX(-Math.PI / 2)
  const t = new THREE.Mesh(tgeo, mats.wood); t.position.y = 0.9; g.add(t)
  for (const [x, z] of [[-0.82, -0.28], [0.82, -0.28], [-0.82, 0.28], [0.82, 0.28]]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.9, 0.07), mats.wood); leg.position.set(x, 0.45, -z); g.add(leg)
  }
  const back = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 0.05), mats.wood); back.position.set(0, 1.2, -0.37); g.add(back)
  // tools rack
  for (let i = 0; i < 9; i++) {
    const tool = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 8), mats.brass)
    tool.position.set(-0.6 + i * 0.07, 1.25, -0.33); g.add(tool)
  }
  // bench pin
  const pin = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.22), mats.woodLight); pin.position.set(0, 0.96, 0.4); g.add(pin)
  // ingots
  const ing = PIECES.ingots(); ing.scale.setScalar(0.07); ing.position.set(0.55, 0.995, 0.05); g.add(ing)
  // a gold chain being finished on the bench pin
  const chain = PIECES.chainBracelet('yellow'); chain.scale.setScalar(0.09); chain.rotation.x = -Math.PI / 2; chain.position.set(-0.45, 0.975, 0.12); g.add(chain)
  // lamp
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.7, 8), mats.brass); arm.position.set(0.7, 1.3, -0.25); arm.rotation.z = 0.5; g.add(arm)
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.16, 24, 1, true), mats.brass); shade.position.set(0.52, 1.62, -0.2); shade.rotation.z = 0.4; g.add(shade)
  return shadow(g)
}

/** Dust motes floating in the light. */
export function dust(count = 600, box = [10, 6, 10]) {
  const c = document.createElement('canvas'); c.width = c.height = 32
  const x = c.getContext('2d')
  const grd = x.createRadialGradient(16, 16, 0, 16, 16, 16)
  grd.addColorStop(0, 'rgba(255,240,215,1)'); grd.addColorStop(1, 'rgba(255,240,215,0)')
  x.fillStyle = grd; x.fillRect(0, 0, 32, 32)
  const pos = new Float32Array(count * 3)
  const seeds = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * box[0]
    pos[i * 3 + 1] = Math.random() * box[1]
    pos[i * 3 + 2] = (Math.random() - 0.5) * box[2]
    seeds[i] = Math.random() * 100
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ map: new THREE.CanvasTexture(c), size: 0.025, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending }))
  pts.userData.update = (t) => {
    const p = geo.attributes.position
    for (let i = 0; i < count; i++) {
      const s = seeds[i]
      p.array[i * 3] += Math.sin(t * 0.2 + s) * 0.0006
      p.array[i * 3 + 1] += Math.cos(t * 0.15 + s) * 0.0004 + 0.00015
      if (p.array[i * 3 + 1] > box[1]) p.array[i * 3 + 1] = 0
    }
    p.needsUpdate = true
  }
  return pts
}

/** Volumetric-looking light shaft (additive gradient prism). */
export function lightShaft(w = 2.2, h = 7, color = 0xffe2b8, opacity = 0.09) {
  const c = document.createElement('canvas'); c.width = 64; c.height = 256
  const x = c.getContext('2d')
  const grd = x.createLinearGradient(0, 0, 0, 256)
  grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(1, 'rgba(255,255,255,0)')
  x.fillStyle = grd; x.fillRect(0, 0, 64, 256)
  const side = x.createLinearGradient(0, 0, 64, 0)
  const tex = new THREE.CanvasTexture(c)
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }))
  return m
}

/** Gold-leaf butterflies drifting through the rooms (the reference's living detail). */
export function butterflies(count = 8) {
  const grp = new THREE.Group()
  const wing = new THREE.Shape()
  wing.moveTo(0, 0)
  wing.bezierCurveTo(0.02, 0.06, 0.09, 0.08, 0.11, 0.04)
  wing.bezierCurveTo(0.12, 0.0, 0.07, -0.02, 0.05, -0.02)
  wing.bezierCurveTo(0.08, -0.05, 0.06, -0.09, 0.03, -0.07)
  wing.bezierCurveTo(0.01, -0.05, 0.0, -0.02, 0, 0)
  const geo = new THREE.ShapeGeometry(wing, 12)
  const mat = new THREE.MeshStandardMaterial({ color: 0xd9b36c, metalness: 1, roughness: 0.28, side: THREE.DoubleSide, envMapIntensity: 1.4 })
  const spots = [[0, 2.4, 0.5], [-2.5, 3.2, -2], [2.2, 2.0, -3], [0.6, 2.8, -11], [-1.6, 2.2, -12.5], [1.8, 3.1, -13], [-7, 2.4, -7], [7, 2.6, -7], [-1, 3.6, 3]]
  for (let i = 0; i < count; i++) {
    const b = new THREE.Group()
    const l = new THREE.Mesh(geo, mat), r = new THREE.Mesh(geo, mat)
    r.scale.x = -1
    b.add(l, r)
    const s = spots[i % spots.length]
    b.userData = { home: new THREE.Vector3(...s), phase: i * 2.1, speed: 0.18 + (i % 3) * 0.05, l, r }
    b.scale.setScalar(1.1 + (i % 3) * 0.25)
    grp.add(b)
  }
  grp.userData.update = (t) => {
    for (const b of grp.children) {
      const { home, phase, speed, l, r } = b.userData
      const k = t * speed + phase
      const x = home.x + Math.sin(k) * 1.4 + Math.sin(k * 2.3) * 0.3
      const y = home.y + Math.sin(k * 1.7) * 0.35
      const z = home.z + Math.cos(k * 0.9) * 1.2
      const dx = Math.cos(k) * 1.4, dz = -Math.sin(k * 0.9) * 1.2
      b.position.set(x, y, z)
      b.rotation.set(-0.3, Math.atan2(dx, dz), 0)
      const flap = Math.sin(t * 16 + phase * 3) * 0.9
      l.rotation.y = flap
      r.rotation.y = -flap
    }
  }
  return grp
}
