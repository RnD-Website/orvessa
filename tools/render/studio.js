/**
 * ORVESSA — procedural jewelry studio
 * ------------------------------------------------------------
 * Builds every piece in the catalogue from code (gold bands, chains,
 * brilliant / pear diamonds, cuffs, drops) and lights them in a dark
 * studio made of emissive light-formers. `tools/render/render.mjs`
 * drives this page with Playwright and saves every shot into
 * /public/images. Re-run `npm run render` after editing a piece.
 */
import * as THREE from 'three'
import { initJewelry, MAT, PIECES, bokeh, drape, velvetBust, bustNecklace, glints } from '../../scene/jewelry.js'

const W = 1600
const H = 2000
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
renderer.setPixelRatio(1)
renderer.setSize(W, H)
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.05
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
document.body.appendChild(renderer.domElement)

const { studioEnv: ENV } = initJewelry(renderer)
import { buildEnv } from '../../scene/jewelry.js'
const ENV_LIGHT = buildEnv(1, 0x5a4c3e)

/* ---------- Background: radial spotlight on deep black ---------- */
function gradientTex(inner = '#2b241b', outer = '#060606', cx = 0.5, cy = 0.42, r = 0.75) {
  const c = document.createElement('canvas')
  c.width = 1024; c.height = 1280
  const g = c.getContext('2d')
  const grd = g.createRadialGradient(c.width * cx, c.height * cy, 0, c.width * cx, c.height * cy, c.width * r)
  grd.addColorStop(0, inner)
  grd.addColorStop(0.45, mix(inner, outer, 0.55))
  grd.addColorStop(1, outer)
  g.fillStyle = grd
  g.fillRect(0, 0, c.width, c.height)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}
function mix(a, b, t) {
  const ca = new THREE.Color(a), cb = new THREE.Color(b)
  return '#' + ca.lerp(cb, t).getHexString()
}

/* ---------- Scene assembly ---------- */
let scene, camera
function fresh({ bg = ['#2b241b', '#060606'], cx = 0.5, cy = 0.42, r = 0.75, w = W, h = H, fov = 30, light = false } = {}) {
  renderer.setSize(w, h)
  scene = new THREE.Scene()
  scene.environment = light ? ENV_LIGHT : ENV
  scene.background = gradientTex(bg[0], bg[1], cx, cy, r)
  camera = new THREE.PerspectiveCamera(fov, w / h, 0.05, 200)
  const key = new THREE.SpotLight(0xfff0dc, 60, 40, 0.5, 0.8, 1.5)
  key.position.set(3, 9, 6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0004
  scene.add(key)
  scene.add(new THREE.AmbientLight(0xffffff, 0.06))
  return scene
}
function look(pos, target = [0, 0, 0]) {
  camera.position.set(...pos)
  camera.lookAt(new THREE.Vector3(...target))
}

/* Each shot: name -> builder. Ratios: p = 4:5 product, w = 16:9 wide, t = 3:4 tall */
const P = { w: 1600, h: 2000 }, WIDE = { w: 2400, h: 1350 }, TALL = { w: 1500, h: 2000 }, SQ = { w: 1600, h: 1600 }

const METALS = ['yellow', 'white', 'rose']
const WARM = { bg: ['#e6dccb', '#9d8a70'], cx: 0.5, cy: 0.4, r: 0.85, light: true }
function productShots(key, piece, _metal, views) {
  const out = {}
  for (const metal of METALS) {
    views.forEach((v, i) => {
      out[`products/${key}-${metal}-${i + 1}`] = () => {
        fresh({ ...P, ...WARM, ...(v.bg ? {} : {}) })
        const g = PIECES[piece](metal)
        g.rotation.set(...(v.rot || [0, 0, 0]))
        if (v.scale) g.scale.setScalar(v.scale)
        scene.add(g)
        look(v.cam, v.target)
      }
    })
  }
  return out
}

const SHOTS = {
  ...productShots('aurora-ring', 'solitaire', 'yellow', [
    { cam: [0, 0.6, 8.2], target: [0, 0.25, 0], rot: [0.18, 0.5, 0] },
    { cam: [3.5, 4.6, 5.2], target: [0, 0.5, 0], rot: [0, 0.2, 0] },
    { cam: [0.8, 2.0, 2.4], target: [0, 1.25, 0], rot: [0.2, 0.3, 0], bg: { bg: ['#3a2f22', '#080706'] } }
  ]),
  ...productShots('etoile-ring', 'etoile', 'yellow', [
    { cam: [0, 0.6, 8], target: [0, 0.2, 0], rot: [0.25, -0.5, 0] },
    { cam: [-4, 3.5, 5], target: [0, 0.4, 0], rot: [0, 0.3, 0] },
    { cam: [0.5, 1.7, 2.6], target: [0, 1.05, 0], rot: [0.15, -0.2, 0], bg: { bg: ['#3a2f22', '#080706'] } }
  ]),
  ...productShots('noor-band', 'paveBand', 'white', [
    { cam: [0, 0.3, 7], rot: [0.5, 0.4, 0] },
    { cam: [3, 3, 5], rot: [1.3, 0, 0.2] },
    { cam: [0.6, 1.2, 2.2], target: [0, 0.9, 0], rot: [0.3, 0.2, 0] }
  ]),
  ...productShots('elara-earrings', 'drops', 'yellow', [
    { cam: [0, -0.2, 7.4], target: [0, -0.2, 0], rot: [0.05, 0, 0] },
    { cam: [3, 0.8, 5.5], target: [0, -0.2, 0], rot: [0, -0.6, 0] },
    { cam: [1.2, 0.1, 2.6], target: [0.8, -0.3, 0], rot: [0, 0.2, 0], bg: { bg: ['#3a2f22', '#080706'] } }
  ]),
  ...productShots('vela-hoops', 'hoops', 'yellow', [
    { cam: [0, 0.2, 7.5], rot: [0, 0, 0] },
    { cam: [0, 3.5, 6], rot: [0.3, 0.4, 0] },
    { cam: [1.6, 0.6, 2.8], target: [1, 0, 0], rot: [0, 0, 0] }
  ]),
  ...productShots('iris-studs', 'studs', 'white', [
    { cam: [0, 0.6, 6.4], target: [0, 0, 0], rot: [0, 0, 0] },
    { cam: [2.5, 2.8, 4.5], rot: [0, 0.4, 0] },
    { cam: [0.9, 0.9, 1.9], target: [0.8, 0.1, 0], rot: [0, 0, 0], bg: { bg: ['#3a2f22', '#080706'] } }
  ]),
  ...productShots('solenne-bracelet', 'cuff', 'yellow', [
    { cam: [0, 1.4, 8.4], rot: [0.35, 0.5, 0] },
    { cam: [4, 4, 5], rot: [1.0, 0.2, 0] },
    { cam: [1.2, 1.6, 2.8], target: [0.6, 0.8, 0], rot: [0.35, 0.5, 0], bg: { bg: ['#3a2f22', '#080706'] } }
  ]),
  ...productShots('seraphine-tennis', 'tennis', 'white', [
    { cam: [0, 3.5, 7.4], rot: [-0.9, 0, 0.1] },
    { cam: [0, 0.4, 7.4], rot: [-0.25, 0.3, 0] },
    { cam: [0.8, 1.4, 2.6], target: [0.8, 0.4, 0], rot: [-0.9, 0, 0.1] }
  ]),
  ...productShots('lys-chain-bracelet', 'chainBracelet', 'yellow', [
    { cam: [0, 2.2, 7.2], rot: [-0.7, 0.2, 0] },
    { cam: [0, 0.2, 7], rot: [-0.2, 0.6, 0] },
    { cam: [1.1, 0.9, 2.6], target: [1.0, 0.2, 0], rot: [-0.7, 0.2, 0] }
  ]),

  /* ---- Editorial / cinematic (necklaces worn on the bust) ---- */
  'scenes/cat-diamond': () => {
    fresh({ ...WIDE, bg: ['#3a2c1f', '#050404'], cx: 0.64, cy: 0.5, r: 0.5, fov: 24 })
    const b = wornBust('riviere', 'white'); b.rotation.y = -0.3; b.position.x = 0.36; scene.add(b)
    scene.add(bokeh(120, 4, [-6, -2], 0xffffff, 0.025))
    look([0.05, 0.6, 1.75], [0.2, 0.5, 0])
  },
  'scenes/cat-gold': () => {
    fresh({ ...WIDE, bg: ['#3a2c1f', '#050404'], cx: 0.64, cy: 0.5, r: 0.5, fov: 24 })
    const b = wornBust('collar', 'yellow'); b.rotation.y = -0.35; b.position.x = 0.36; scene.add(b)
    look([0.05, 0.6, 1.75], [0.2, 0.5, 0])
  },
  'scenes/cat-pendants': () => {
    fresh({ ...WIDE, bg: ['#3a2c1f', '#050404'], cx: 0.64, cy: 0.5, r: 0.45, fov: 20 })
    const b = wornBust('lumiere', 'yellow'); b.rotation.y = -0.25; b.position.x = 0.2; scene.add(b)
    look([0.02, 0.52, 0.9], [0.1, 0.47, 0.1])
  },
  'scenes/cat-chains': () => {
    fresh({ ...WIDE, bg: ['#3a2c1f', '#050404'], cx: 0.66, cy: 0.5, r: 0.55, fov: 26 })
    const a = wornBust('chunky', 'yellow'); a.rotation.y = -0.3; a.position.set(0.25, 0, 0); scene.add(a)
    const b = wornBust('layered', 'yellow'); b.rotation.y = -0.6; b.position.set(0.95, 0, -0.6); scene.add(b)
    look([0, 0.62, 2.0], [0.32, 0.47, 0])
  },
  'scenes/campaign': () => {
    fresh({ ...WIDE, bg: ['#3a2c1f', '#040303'], cx: 0.62, cy: 0.45, r: 0.5, fov: 22 })
    const b = wornBust('cascade', 'white'); b.rotation.y = -0.35; b.position.x = 0.3; scene.add(b)
    scene.add(bokeh(140, 4, [-6, -2], 0xffe0b0, 0.03))
    look([0.05, 0.6, 1.5], [0.16, 0.5, 0])
  },
  'scenes/campaign-mobile': () => {
    fresh({ w: 1200, h: 2100, bg: ['#3a2c1f', '#040303'], cx: 0.5, cy: 0.42, r: 0.7, fov: 30 })
    const b = wornBust('cascade', 'white'); b.rotation.y = -0.2; scene.add(b)
    look([0, 0.6, 1.45], [0, 0.48, 0])
  },
  'scenes/story-bust': () => {
    fresh({ ...TALL, bg: ['#e6dccb', '#8a765e'], cx: 0.5, cy: 0.35, r: 0.8, fov: 26, light: true })
    const b = wornBust('celeste', 'yellow', 0xd8cbb9); b.rotation.y = 0.3; scene.add(b)
    look([0, 0.6, 1.9], [0, 0.46, 0])
  },
  'scenes/story-wide': () => {
    // wide editorial: the whole Solenne collar on the bust, nothing cropped
    fresh({ w: 2400, h: 1100, bg: ['#3a2c1f', '#050404'], cx: 0.5, cy: 0.5, r: 0.42, fov: 22 })
    const b = wornBust('collar', 'yellow'); b.rotation.y = -0.25; scene.add(b)
    scene.add(bokeh(160, 6, [-8, -2], 0xffe0b0, 0.035))
    look([0, 0.56, 2.55], [0, 0.44, 0])
  },
  'scenes/pendant-macro': () => {
    fresh({ ...WIDE, bg: ['#3a2c1f', '#060505'], cx: 0.45, cy: 0.5, r: 0.5, fov: 20 })
    const b = wornBust('lumiere', 'yellow'); scene.add(b)
    look([0.12, 0.5, 0.55], [0.03, 0.45, 0.15])
  },
  'craft/gold': () => {
    fresh({ ...SQ, bg: ['#2a2219', '#060606'], fov: 26 })
    const g = PIECES.ingots(); scene.add(g)
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), MAT.stone()); floor.rotation.x = -Math.PI / 2; floor.position.y = -0.22; floor.receiveShadow = true; scene.add(floor)
    look([2.8, 3.4, 5.4], [0, 0, -0.4])
  },
  'craft/setting': () => {
    fresh({ ...SQ, bg: ['#3a2f22', '#070605'], fov: 18 })
    const b = wornBust('riviere', 'white'); scene.add(b)
    look([0.1, 0.52, 0.55], [0, 0.5, 0.15])
  },
  'craft/diamonds': () => {
    fresh({ ...SQ, bg: ['#2a2219', '#060606'], fov: 26 })
    scene.add(PIECES.loose())
    look([0, 2.4, 5.2], [0, -0.2, 0])
  },
  'craft/chain': () => {
    fresh({ ...WIDE, bg: ['#2d251b', '#060606'], fov: 18 })
    const g = PIECES.rope('yellow'); g.rotation.set(0, 0.2, 0); scene.add(g)
    look([0.8, -0.6, 3.4], [0, -1.0, 0.3])
  },
  'craft/polish': () => {
    fresh({ ...SQ, bg: ['#2a2219', '#060606'], fov: 16 })
    const b = wornBust('chunky', 'yellow'); b.rotation.y = 0.4; scene.add(b)
    look([0.25, 0.52, 0.75], [0.02, 0.5, 0.12])
  },
  'scenes/final': () => {
    fresh({ ...WIDE, bg: ['#241c14', '#040404'], cx: 0.5, cy: 0.55, r: 0.5, fov: 24 })
    const b = wornBust('riviere', 'white'); scene.add(b)
    scene.add(bokeh(220, 6, [-8, -2], 0xffe0b0, 0.04))
    look([0, 0.62, 2.3], [0, 0.48, 0])
  },
  'scenes/menu': () => {
    fresh({ ...TALL, bg: ['#2d251b', '#050505'], fov: 24 })
    const b = wornBust('collar', 'yellow'); b.rotation.y = -0.3; scene.add(b)
    look([0, 0.6, 1.6], [0, 0.48, 0])
  },
  'scenes/about': () => {
    fresh({ ...WIDE, bg: ['#2a2219', '#050505'], fov: 26 })
    const g = PIECES.ingots(); g.position.x = 1.6; scene.add(g)
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), MAT.stone()); floor.rotation.x = -Math.PI / 2; floor.position.y = -0.22; floor.receiveShadow = true; scene.add(floor)
    look([0, 2.6, 7.4], [0.4, 0.2, -0.4])
  }
}

window.SHOT_NAMES = Object.keys(SHOTS)
window.renderShot = async (name) => {
  SHOTS[name]()
  renderer.render(scene, camera)
  renderer.render(scene, camera)
  return renderer.domElement.toDataURL('image/png')
}
window.READY = true

/* ---- Necklace product photography: worn on the velvet bust ---- */
import { wornBust } from '../../scene/jewelry.js'
const NECKLACES = { 'maelle-collar': 'collar', 'ophelie-riviere': 'riviere', 'cassia-cascade': 'cascade', 'atlas-chain': 'chunky', 'lumiere-pendant': 'lumiere', 'celeste-necklace': 'celeste', 'aria-chain': 'layered' }
const BUST_VIEWS = [
  { cam: [0, 0.6, 1.75], target: [0, 0.47, 0], rot: -0.2 },
  { cam: [0.9, 0.66, 1.35], target: [0, 0.5, 0], rot: 0 },
  { cam: [0.08, 0.53, 0.62], target: [0, 0.5, 0.12], rot: -0.1 }
]
for (const [key, piece] of Object.entries(NECKLACES)) {
  for (const metal of METALS) {
    BUST_VIEWS.forEach((v, i) => {
      SHOTS[`products/${key}-${metal}-${i + 1}`] = () => {
        fresh({ ...P, ...WARM, fov: 28 })
        const b = wornBust(piece, metal); b.rotation.y = v.rot; scene.add(b)
        look(v.cam, v.target)
      }
    })
  }
}
// necklaces no longer rendered as floating objects
for (const k of Object.keys(SHOTS)) if (/^products\/(celeste-necklace|lumiere-pendant|aria-chain)-\w+-\d$/.test(k) && !k.includes('bust')) {}
window.SHOT_NAMES = Object.keys(SHOTS)

/* ---- The arch painting (source for public/images/scenes/painting.webp) ---- */
SHOTS['scenes/painting-src'] = () => {
  // still life for the arch painting: necklaces laid on velvet (no bust, so it
  // never doubles up with the real bust standing in front of the arch)
  fresh({ w: 1200, h: 2040, bg: ['#3a2418', '#120a07'], cx: 0.5, cy: 0.45, r: 0.8, fov: 30 })
  const d = drape(8, 12, 0x4a1c16); d.scale.z = 0.35; d.position.set(0, 0, -0.3); scene.add(d)
  const laid = (piece, metal, scale, x, y, rz) => {
    const pivot = new THREE.Group()
    const n = wornBust(piece, metal); n.children[0].visible = false; n.position.y = -0.55
    pivot.add(n); pivot.rotation.set(Math.PI / 2 - 0.15, rz, 0); pivot.scale.setScalar(scale); pivot.position.set(x, y, 0.25)
    scene.add(pivot)
  }
  laid('riviere', 'white', 1.25, 0, 0.42, 0.1)
  laid('lumiere', 'yellow', 1.15, 0.08, -0.38, -0.3)
  const g = PIECES.loose(); g.scale.setScalar(0.06); g.position.set(-0.32, 0.02, 0.3); scene.add(g)
  look([0, 0, 3.6], [0, 0, 0])
}
window.SHOT_NAMES = Object.keys(SHOTS)
