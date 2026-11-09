/**
 * MaisonScene — the ORVESSA WebGL house.
 *
 * A neoclassical foyer (the hall) opens onto three chambers, one per
 * chapter, each reached by a continuous camera move through its doorway:
 *   CH. I   — La Maison      (left door)   pile of jewel boxes + armchair
 *   CH. II  — Collections    (central arch) giant solitaire, vitrine, pearls
 *   CH. III — Atelier        (right door)  goldsmith's bench, ingots
 *
 * Framework-agnostic: the Vue component only creates it, forwards pointer
 * and resize events, and calls goTo(). GSAP drives every camera move.
 */
import * as THREE from 'three'
import gsap from 'gsap'
import { initJewelry, wornBust, plinth, glints } from '../jewelry.js'
import { paneledWall, doorLeaves, skylightCeiling, floor, room } from './architecture.js'
import { plasterTexture, basketTexture, parquetTexture, woodTexture, rugTexture, goboTexture, velvetTexture } from './textures.js'
import { rug, pearlStrand, armchair, boxPile, goldsmithBench, dust, butterflies } from './props.js'

const H = 7.2

export const CHAPTERS = [
  { id: 'hall', index: 0 },
  { id: 'maison', index: 1 },
  { id: 'collections', index: 2 },
  { id: 'atelier', index: 3 }
]

export class MaisonScene {
  constructor(canvas, { mobile = false, onProgress } = {}) {
    this.canvas = canvas
    this.mobile = mobile
    this.onProgress = onProgress
    this.pointer = new THREE.Vector2()
    this.look = new THREE.Vector2()
    this.current = 'hall'
    this.clock = new THREE.Clock()
    this.animated = []
    this.running = false

    const r = (this.renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, powerPreference: 'high-performance', preserveDrawingBuffer: false }))
    r.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 1.75))
    r.outputColorSpace = THREE.SRGBColorSpace
    r.toneMapping = THREE.AgXToneMapping
    r.toneMappingExposure = 0.92
    r.shadowMap.enabled = true
    r.shadowMap.type = THREE.PCFSoftShadowMap

    const { studioEnv } = initJewelry(r)
    this.scene = new THREE.Scene()
    this.scene.environment = studioEnv
    this.scene.background = new THREE.Color(0x1a130d)
    this.scene.fog = new THREE.Fog(0x1e160f, 22, 60)

    this.camera = new THREE.PerspectiveCamera(mobile ? 62 : 48, 1, 0.05, 120)
    this.target = new THREE.Vector3()

    this.buildMaterials()
    this.buildHall()
    this.buildChambers()
    this.buildLights()
    this.views = this.computeViews()
    this.buildJourney()
    this.setView('hall')
    this.resize()
  }

  /* ------------------------------------------------------------ */
  buildMaterials() {
    const plaster = plasterTexture('#cdbb9f', 3)
    const plasterWarm = plasterTexture('#c4ad8c', 8)
    const wood = woodTexture(13, '#3b2517')
    const woodLight = woodTexture(19, '#6b4a2e')
    this.mats = {
      plaster: new THREE.MeshStandardMaterial({ map: plaster, color: 0xe6d7bf, roughness: 0.96, envMapIntensity: 0.12 }),
      plasterWarm: new THREE.MeshStandardMaterial({ map: plasterWarm, color: 0xdcc8aa, roughness: 0.96, envMapIntensity: 0.12 }),
      trim: new THREE.MeshStandardMaterial({ map: plaster, color: 0xf1e3cc, roughness: 0.9, envMapIntensity: 0.14 }),
      wood: new THREE.MeshStandardMaterial({ map: wood, roughness: 0.42, envMapIntensity: 0.4 }),
      woodTrim: new THREE.MeshStandardMaterial({ map: wood, color: 0xb59a86, roughness: 0.4, envMapIntensity: 0.4 }),
      woodLight: new THREE.MeshStandardMaterial({ map: woodLight, roughness: 0.5, envMapIntensity: 0.3 }),
      brass: new THREE.MeshStandardMaterial({ color: 0xc6a46a, metalness: 1, roughness: 0.32, envMapIntensity: 0.9 }),
      velvet: new THREE.MeshPhysicalMaterial({ map: velvetTexture('#4a2a24'), roughness: 1, sheen: 1, sheenRoughness: 0.5, sheenColor: new THREE.Color(0xa0705a), envMapIntensity: 0.2 }),
      sky: new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.05, 1.85) }),
      mullion: new THREE.MeshStandardMaterial({ color: 0x2b2722, roughness: 0.6 }),
      hallFloor: new THREE.MeshStandardMaterial({ map: basketTexture(9), roughness: 0.38, envMapIntensity: 0.7 }),
      roomFloor: new THREE.MeshStandardMaterial({ map: parquetTexture(5), roughness: 0.38, envMapIntensity: 0.7 })
    }
    this.gobo = goboTexture(31)
  }

  /* ------------------------------------------------------------ */
  buildHall() {
    const m = this.mats
    const hall = (this.hall = new THREE.Group())
    // back wall with the arch to Collections
    const back = paneledWall({ w: 5.6, h: H, mats: m, openings: [{ type: 'arch', x: 0, w: 3.0, h: 5.1 }], bay: 1.3 })
    back.position.z = -6
    hall.add(back)
    // angled walls with doors to Maison (left) and Atelier (right)
    for (const s of [-1, 1]) {
      const wall = paneledWall({ w: 4.39, h: H, mats: m, openings: [{ type: 'rect', x: 0, w: 1.9, h: 3.7 }], bay: 1.3 })
      wall.position.set(s * 4.4, 0, -4.5)
      wall.rotation.y = -s * 0.753
      hall.add(wall)
      if (s === 1) { const shut = doorLeaves(1.9, 3.7, m); shut.position.z = -0.2; wall.add(shut) }
      // side walls with tall closed lacquered doors
      const side = paneledWall({ w: 11, h: H, mats: m, openings: [{ type: 'rect', x: s * 1.6, w: 2.1, h: 4.3 }, { type: 'rect', x: s * -3.4, w: 2.1, h: 4.3 }] })
      side.position.set(s * 6, 0, 2.5)
      side.rotation.y = -s * Math.PI / 2
      hall.add(side)
      for (const lx of [s * 1.6, s * -3.4]) {
        const d = doorLeaves(2.1, 4.3, m)
        d.position.set(lx, 0, -0.22)
        side.add(d)
      }
    }
    const f = floor(13, 15, m.hallFloor)
    f.position.z = 1
    hall.add(f)
    const ceil = skylightCeiling(12, 14, m, { lw: 6, ld: 6, cols: 4, rows: 4 })
    ceil.position.set(0, H, 0.6)
    hall.add(ceil)
    // the ORVESSA painting fills the arch — the intro camera starts inside it
    const tex = new THREE.TextureLoader().load('/images/scenes/painting.webp', t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.needsUpdate = true })
    tex.colorSpace = THREE.SRGBColorSpace
    const painting = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 5.1), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }))
    painting.position.set(0, 2.55, -6.33)
    hall.add(painting)
    this.painting = painting
    this.scene.add(hall)
    this.butterflies = butterflies(this.mobile ? 5 : 9)
    this.scene.add(this.butterflies)
  }

  /**
   * Places a hero jewel on a plinth with its own spotlight, twinkling
   * glints and a hotspot the UI can show and the camera can fly to.
   */
  showcase(parent, { id, chapter, pos, rot = 0, plinthH = 1.0, plinthW = 0.46, build, lift = 0.25, spin = true, glintPts = [], info, dist = 1.15, focusAt = [0, 0, 0], keyIntensity = 34 }) {
    const g = new THREE.Group()
    g.position.set(...pos)
    g.rotation.y = rot
    if (plinthH > 0) g.add(plinth(plinthW, plinthH))
    const jewel = build()
    jewel.position.y = plinthH + lift
    g.add(jewel)
    parent.add(g)
    this.scene.updateMatrixWorld(true)
    if (spin) this.animated.push(jewel)
    const anchor = jewel.localToWorld(new THREE.Vector3(...focusAt))
    // dedicated key light
    const key = new THREE.SpotLight(0xfff2de, keyIntensity, 0, 0.13, 0.75, 0)
    key.position.copy(anchor).add(new THREE.Vector3(0.9, 3.4, 1.8))
    key.target.position.copy(anchor)
    this.scene.add(key, key.target)
    // glints follow the jewel
    if (glintPts.length) {
      const gl = glints(glintPts, 0.12 / jewel.scale.x)
      jewel.add(gl)
      this.glints.push(gl)
    }
    this.hotspots.push({ id, chapter, anchor, dist, ...info })
    return jewel
  }

  /* ------------------------------------------------------------ */
  buildChambers() {
    const m = this.mats
    this.glints = []
    this.hotspots = []

    const bust = (piece, metal, color) => () => { const g = wornBust(piece, metal, color); g.scale.setScalar(1.45); return g }
    const BUST = { plinthW: 0.58, lift: 0, spin: false, dist: 1.25, focusAt: [0, 0.56, 0.14] }

    // HALL — the Maëlle gold collar, centre stage
    this.showcase(this.hall, {
      ...BUST, id: 'solenne', chapter: 'hall', pos: [0, 0, 2.2], plinthH: 1.0, build: bust('collar', 'yellow'),
      glintPts: [new THREE.Vector3(0, 0.52, 0.2)],
      info: { name: 'Solenne Gold Collar', material: '18k yellow gold · seven sculpted rows', price: 14800, slug: 'solenne-gold-collar' }
    })

    // The rooms form a chain, like a real enfilade:
    // Hall → (left door) La Maison → (back door) Collections → (side door) Atelier
    const DOOR = { type: 'rect', w: 1.9, h: 3.7 }

    // CH. I — La Maison, through the hall's left door
    const mai = (this.maison = room({ w: 7.2, d: 7, h: H - 0.4, mats: m, floorMat: m.roomFloor, entrance: DOOR, offsetX: -2.4, sideOpenings: { back: [{ x: 0, ...DOOR }] } }))
    mai.position.set(-4.4, 0, -4.5)
    mai.rotation.y = 0.753
    this.scene.add(mai)
    const rugM = rug(3.4, 2.4, rugTexture('stone', 27)); rugM.position.set(-1.6, 0.01, -3.9); mai.add(rugM)
    const pile = boxPile(80); pile.position.set(-4.6, 0, -5.2); mai.add(pile)
    this.showcase(mai, {
      ...BUST, id: 'celeste', chapter: 'maison', pos: [-0.3, 0.02, -4.4], rot: 0.35, plinthH: 1.0, build: bust('celeste', 'yellow', 0xbfae96), keyIntensity: 12,
      info: { name: 'Celeste Gold Necklace', material: '18k yellow gold · hand-twisted rope', price: 5200, slug: 'celeste-gold-necklace' }
    })
    this.showcase(mai, {
      ...BUST, id: 'aria', chapter: 'maison', pos: [-3.7, 0.02, -3.4], rot: 0.8, plinthH: 0.75, build: bust('layered', 'yellow', 0xbfae96), keyIntensity: 12,
      info: { name: 'Aria Layered Chain', material: '18k yellow gold · three chains', price: 2900, slug: 'aria-layered-chain' }
    })

    // CH. II — Collections, through La Maison's back door
    const col = (this.collections = room({ w: 8, d: 11, h: H - 0.4, mats: { ...m, plaster: m.plasterWarm }, floorMat: m.roomFloor, entrance: DOOR, sideOpenings: { right: [{ x: 0, ...DOOR }] } }))
    col.position.set(-2.4, 0, -6.99)
    mai.add(col)
    const rugA = rug(4.2, 2.8, rugTexture('red', 21)); rugA.position.set(-0.6, 0.01, -7.6); rugA.rotation.y = 0.08; col.add(rugA)
    const rugB = rug(2.4, 1.8, rugTexture('stone', 23)); rugB.position.set(-2.4, 0.012, -4.4); rugB.rotation.y = -0.3; col.add(rugB)
    this.showcase(col, {
      ...BUST, id: 'aurora', chapter: 'collections', pos: [-2.2, 0.02, -7.4], rot: 0.35, plinthH: 0.9, build: bust('riviere', 'white'),
      glintPts: [new THREE.Vector3(0, 0.56, 0.19), new THREE.Vector3(-0.1, 0.6, 0.15), new THREE.Vector3(0.11, 0.59, 0.15)],
      info: { name: 'Aurora Diamond Rivière', material: '18k white gold · 12.4ct graduated diamonds', price: 38500, slug: 'aurora-diamond-riviere' }
    })
    this.showcase(col, {
      ...BUST, id: 'elara', chapter: 'collections', pos: [-0.65, 0.02, -8.2], rot: 0, plinthH: 1.15, build: bust('cascade', 'white'),
      glintPts: [new THREE.Vector3(0, 0.47, 0.2), new THREE.Vector3(-0.05, 0.5, 0.19), new THREE.Vector3(0.06, 0.51, 0.19)],
      info: { name: 'Elara Diamond Cascade', material: '18k white gold · pear diamond fringe', price: 26900, slug: 'elara-diamond-cascade' }
    })
    this.showcase(col, {
      ...BUST, id: 'lumiere', chapter: 'collections', pos: [0.9, 0.02, -7.4], rot: -0.35, plinthH: 0.8, build: bust('lumiere', 'yellow'),
      glintPts: [new THREE.Vector3(0, 0.47, 0.21)],
      info: { name: 'Lumière Diamond Pendant', material: '18k yellow gold · 2.1ct pear diamond', price: 6800, slug: 'lumiere-diamond-pendant' }
    })
    col.add(pearlStrand([[-1.6, 0, -6.0], [-0.8, 0, -6.3], [-0.4, 0, -6.7], [-0.9, 0, -7.0], [-0.1, 0, -7.3]], 0.06))
    const chair = armchair(m); chair.position.set(-3.1, 0.02, -9.4); chair.rotation.y = 0.7; col.add(chair)

    // CH. III — Atelier, through Collections' side door
    const ate = (this.atelier = room({ w: 7.2, d: 7, h: H - 0.4, mats: m, floorMat: m.roomFloor, entrance: DOOR }))
    ate.position.set(3.99, 0, -5.5)
    ate.rotation.y = -Math.PI / 2
    col.add(ate)
    const rugT = rug(3.0, 2.2, rugTexture('red', 29)); rugT.position.set(0.2, 0.01, -4.2); ate.add(rugT)
    const bench = goldsmithBench(m); bench.position.set(1.0, 0, -5.4); bench.rotation.y = Math.PI; ate.add(bench)
    this.showcase(ate, {
      ...BUST, id: 'etoile', chapter: 'atelier', pos: [-0.9, 0.02, -4.2], rot: -0.3, plinthH: 1.0, build: bust('chunky', 'yellow'),
      info: { name: 'Étoile Gold Chain', material: '18k yellow gold · oversized cable links', price: 9400, slug: 'etoile-gold-chain' }
    })

    const motes = dust(this.mobile ? 250 : 700, [12, 6.5, 22])
    motes.position.z = -4
    this.scene.add(motes)
    this.motes = motes
  }

  /** Fly the camera in close to a hero piece (Pasqua-style hotspot). */
  focus(id, { duration = 1.8 } = {}) {
    const h = this.hotspots.find(x => x.id === id)
    if (!h || this.moving) return Promise.resolve()
    if (!this.home) this.home = { pos: this.camera.position.clone(), target: this.target.clone() }
    this.flying = true
    const from = this.views[h.chapter].pos
    const dir = new THREE.Vector3().subVectors(from, h.anchor).setY(0).normalize()
    const pos = h.anchor.clone().add(dir.multiplyScalar(h.dist)).add(new THREE.Vector3(0, 0.12, 0))
    const right = new THREE.Vector3().crossVectors(new THREE.Vector3().subVectors(h.anchor, pos).normalize(), new THREE.Vector3(0, 1, 0)).normalize()
    const target = h.anchor.clone().add(right.multiplyScalar(this.camera.aspect > 1 ? h.dist * 0.28 : 0)).add(new THREE.Vector3(0, this.camera.aspect > 1 ? 0 : -h.dist * 0.18, 0))
    return this.flyTo(pos, target, duration).then(() => { this.focused = id })
  }
  unfocus(duration = 1.6) {
    if (!this.home) return Promise.resolve()
    const { pos, target } = this.home
    this.home = null
    return this.flyTo(pos, target, duration).then(() => { this.focused = null; this.flying = false })
  }
  flyTo(pos, target, duration) {
    this.moving = true
    const p0 = this.camera.position.clone(), t0 = this.target.clone(), s = { k: 0 }
    return new Promise(res => gsap.to(s, {
      k: 1, duration, ease: 'power3.inOut',
      onUpdate: () => { this.camera.position.lerpVectors(p0, pos, s.k); this.target.lerpVectors(t0, target, s.k) },
      onComplete: () => { this.moving = false; res() }
    }))
  }
  /** Screen-space positions of hotspots in the current chapter (for UI markers). */
  projectHotspots(w, h) {
    return this.hotspots.filter(x => x.chapter === (this.station || this.current)).map(x => {
      const v = x.anchor.clone().project(this.camera)
      return { ...x, x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h, visible: v.z < 1 }
    })
  }

  /* ------------------------------------------------------------ */
  buildLights() {
    const s = this.scene
    s.add(new THREE.HemisphereLight(0xf2e2c8, 0x2a1a0f, 0.62))
    const size = this.mobile ? 1024 : 2048
    const gobo = (pos, target, intensity = 9, angle = 0.62) => {
      const l = new THREE.SpotLight(0xffd29c, intensity * 1.7, 0, angle, 0.5, 0)
      l.position.set(...pos)
      l.target.position.set(...target)
      l.map = this.gobo
      l.castShadow = true
      l.shadow.mapSize.set(size, size)
      l.shadow.bias = -0.0006
      l.shadow.camera.near = 1
      l.shadow.camera.far = 40
      s.add(l, l.target)
      return l
    }
    // hall: sun through the skylight, patterning the right walls
    gobo([-4.5, 13, 4], [3.2, 2.6, -5.2], 10, 0.5)
    // collections: patch across back-right corner
    // side chambers
    const loc = (grp, v) => grp.localToWorld(new THREE.Vector3(...v)).toArray()
    this.scene.updateMatrixWorld(true)
    gobo(loc(this.maison, [1.5, 11, -1]), loc(this.maison, [-4.5, 2.5, -7]), 8, 0.5)
    gobo(loc(this.collections, [-5, 12, -3]), loc(this.collections, [3.2, 2.8, -10.5]), 9, 0.45)
    gobo(loc(this.atelier, [-3, 11, -1]), loc(this.atelier, [2, 2.5, -7]), 8, 0.5)
    // warm fill from the front (camera side) and a soft key on the centrepiece
    const fill = new THREE.PointLight(0xffd7a8, 10, 18, 1.6); fill.position.set(0, 4, 5); s.add(fill)
        for (const [g, v] of [[this.maison, [-2.4, 4.5, -3.5]], [this.atelier, [0, 4.5, -3.5]], [this.collections, [0, 5, -6]]]) {
      const pl = new THREE.PointLight(0xffd9a6, 14, 14, 1.4); pl.position.copy(g.localToWorld(new THREE.Vector3(...v))); s.add(pl)
    }
  }

  /* ------------------------------------------------------------ */
  computeViews() {
    const w = (g, v) => { g.updateMatrixWorld(); return g.localToWorld(new THREE.Vector3(...v)) }
    const mob = this.mobile
    const views = {
      hall: { pos: new THREE.Vector3(0, 1.62, mob ? 7.6 : 6.3), target: new THREE.Vector3(0, 1.95, -6) },
      collections: { pos: w(this.collections, [-0.3, 1.85, mob ? -1.6 : -2.5]), target: w(this.collections, [-0.65, 1.15, -8.6]) },
      maison: { pos: w(this.maison, [0.7, 1.8, -1.2]), target: w(this.maison, [-1.7, 1.0, -4.5]) },
      atelier: { pos: w(this.atelier, [1.3, 1.8, -1.2]), target: w(this.atelier, [-0.2, 1.0, -4.8]) }
    }
    // doorway waypoints (outside, inside)
    const door = (g, depthIn = -1.6) => [w(g, [0, 1.8, 1.4]), w(g, [0, 1.8, depthIn])]
    views.collections.door = door(this.collections, -1.0)
    views.maison.door = door(this.maison)
    views.atelier.door = door(this.atelier)
    return views
  }


  /* ------------------------------------------------------------ */
  /**
   * One continuous, scroll-driven camera journey through the Maison:
   * Hall → La Maison → (its back door) Collections → (side door) Atelier.
   * Scroll progress 0…1 maps onto the spline; the camera eases into each
   * room and holds there while that chapter's title is on screen.
   */
  buildJourney() {
    const V = this.views
    const w = (g, v) => { g.updateMatrixWorld(); return g.localToWorld(new THREE.Vector3(...v)) }
    const v3 = (...a) => new THREE.Vector3(...a)
    const M = this.maison, C = this.collections, A = this.atelier
    const K = [
      { pos: V.hall.pos, target: V.hall.target, station: 'hall' },
      { pos: v3(-1.1, 1.72, 2.6), target: w(M, [0, 1.7, -1.5]) },
      { pos: w(M, [0, 1.8, 1.3]), target: w(M, [-1.0, 1.45, -3.5]) },
      { pos: w(M, [0.15, 1.8, -1.1]), target: V.maison.target },
      { pos: V.maison.pos, target: V.maison.target, station: 'maison' },
      // on to La Maison's far door…
      { pos: w(M, [-1.1, 1.8, -3.0]), target: w(M, [-2.4, 1.8, -9]) },
      { pos: w(M, [-2.4, 1.8, -5.7]), target: w(M, [-2.4, 1.7, -11]) },
      // …and into Collections
      { pos: w(C, [0, 1.85, -1.2]), target: V.collections.target },
      { pos: V.collections.pos, target: V.collections.target, station: 'collections' },
      // across the room to its side door…
      { pos: w(C, [1.6, 1.85, -4.0]), target: w(C, [7, 1.7, -5.5]) },
      { pos: w(C, [3.0, 1.8, -5.5]), target: w(A, [0, 1.7, -3]) },
      // …into the Atelier
      { pos: w(A, [0.4, 1.8, -1.1]), target: V.atelier.target },
      { pos: V.atelier.pos, target: V.atelier.target, station: 'atelier' }
    ]
    this.journey = {
      keys: K,
      pos: new THREE.CatmullRomCurve3(K.map(k => k.pos.clone()), false, 'centripetal', 0.5),
      tgt: new THREE.CatmullRomCurve3(K.map(k => k.target.clone()), false, 'centripetal', 0.5)
    }
    // timeline of holds (at stations) and moves (between keyframes)
    const spans = []
    K.forEach((k, i) => {
      if (k.station) spans.push({ hold: true, k: i, w: i === 0 ? 1.1 : i === K.length - 1 ? 2.4 : 1.7, station: k.station })
      if (i < K.length - 1) spans.push({ hold: false, k: i, w: 1 })
    })
    let acc = 0
    for (const sp of spans) { sp.a = acc; acc += sp.w; sp.b = acc }
    for (const sp of spans) { sp.a /= acc; sp.b /= acc }
    this.journey.spans = spans
  }
  /** Scroll position (0…1) at which a station's hold is centred. */
  stationProgress(id) {
    const sp = this.journey.spans.find(s => s.hold && s.station === id)
    return sp ? (sp.a + sp.b) / 2 : 0
  }
  journeyAt(p) {
    p = Math.min(1, Math.max(0, p))
    const n = this.journey.keys.length - 1
    const sp = this.journey.spans.find(s => p <= s.b) || this.journey.spans[this.journey.spans.length - 1]
    if (sp.hold) return { u: sp.k / n, station: sp.station, local: (p - sp.a) / (sp.b - sp.a) }
    const t = (p - sp.a) / (sp.b - sp.a)
    const e = t * t * t * (t * (t * 6 - 15) + 10) // smootherstep: ease out of and into each room
    return { u: (sp.k + e) / n, station: null }
  }
  /** Drive the camera from scroll. Ignored during the intro or a close-up. */
  setProgress(p) {
    const j = this.journeyAt(p)
    this.station = j.station
    if (this.introLock || this.focused || this.home || this.flying) return j
    this.camera.position.copy(this.journey.pos.getPoint(j.u))
    this.target.copy(this.journey.tgt.getPoint(j.u))
    if (j.station) this.current = j.station
    return j
  }

  setView(id) {
    const v = this.views[id]
    this.camera.position.copy(v.pos)
    this.target.copy(v.target)
    this.current = id
  }

  /**
   * Continuous camera flight between chapters, through the doorways.
   * Like the reference, the camera does not simply dolly: mid-flight it
   * whips round to look along its own path, sweeping past walls and
   * frames, then settles on the new room's vignette.
   */
  goTo(id, { duration = 2.4 } = {}) {
    if (id === this.current || this.moving) return Promise.resolve()
    const from = this.views[this.current], to = this.views[id]
    const hallMid = new THREE.Vector3(0, 1.8, 1.6)
    const pts = [this.camera.position.clone()]
    if (this.current !== 'hall') pts.push(from.door[1], from.door[0])
    if (this.current !== 'hall' && id !== 'hall') pts.push(hallMid)
    if (id !== 'hall') pts.push(to.door[0], to.door[1])
    if (id === 'hall' && this.current !== 'hall') pts.push(hallMid)
    pts.push(to.pos.clone())
    const path = new THREE.CatmullRomCurve3(pts, false, 'centripetal', 0.5)
    const t0 = this.target.clone()
    const ease = gsap.parseEase('power2.inOut')
    const state = { p: 0 }
    this.moving = true
    return new Promise(resolve => {
      gsap.to(state, {
        p: 1,
        duration,
        ease: 'power2.inOut',
        onUpdate: () => {
          const p = state.p
          this.camera.position.copy(path.getPointAt(p))
          const base = t0.clone().lerp(to.target, ease(p))
          const ahead = path.getPointAt(Math.min(1, p + 0.14))
          const dir = ahead.sub(this.camera.position).setY(0)
          if (dir.lengthSq() > 1e-6) dir.normalize()
          const lookAhead = this.camera.position.clone().add(dir.multiplyScalar(4)).setY(1.7)
          const w = Math.pow(Math.sin(Math.PI * p), 0.7) * 0.9
          this.target.copy(base.lerp(lookAhead, w))
          this.onProgress?.(p)
        },
        onComplete: () => { this.current = id; this.moving = false; resolve() }
      })
    })
  }

  /** Camera pose that frames the arch painting edge to edge (matches the intro image). */
  paintingPose() {
    const t = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2))
    const a = this.camera.aspect
    const d = Math.min(1.5 / (t * a), 2.55 / t)
    return { pos: new THREE.Vector3(0, 2.55, -6.33 + d), target: new THREE.Vector3(0, 2.55, -6.33) }
  }
  setIntroPose() {
    const { pos, target } = this.paintingPose()
    this.camera.position.copy(pos)
    this.target.copy(target)
    this.introLock = true
    this.look.set(0, 0)
  }

  /** The opening: pull back out of the painting, through the arch, into the hall. */
  introReveal(duration = 3.6) {
    const v = this.views.hall
    if (!this.introLock) this.setIntroPose()
    const start = this.camera.position.clone(), t0 = this.target.clone()
    const path = new THREE.CatmullRomCurve3([start, new THREE.Vector3(0, 2.3, -3.2), new THREE.Vector3(0, 1.9, 1.5), v.pos.clone()], false, 'centripetal')
    const s = { k: 0 }
    const ease = gsap.parseEase('power2.inOut')
    return gsap.to(s, {
      k: 1, duration, ease: 'power3.inOut',
      onUpdate: () => {
        this.camera.position.copy(path.getPointAt(s.k))
        this.target.lerpVectors(t0, v.target, ease(Math.min(1, s.k * 1.15)))
      },
      onComplete: () => { this.introLock = false }
    })
  }

  setPointer(x, y) { this.pointer.set(x, y) }

  resize() {
    const w = this.canvas.clientWidth || window.innerWidth
    const h = this.canvas.clientHeight || window.innerHeight
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.fov = w / h < 0.8 ? 64 : 48
    this.camera.updateProjectionMatrix()
  }

  renderFrame() {
    const t = this.clock.getElapsedTime()
    this.look.lerp(this.introLock ? new THREE.Vector2() : this.pointer, 0.045)
    this.camera.lookAt(this.target)
    this.camera.rotateY(-this.look.x * 0.045)
    this.camera.rotateX(this.look.y * 0.025)
    for (const j of this.animated) j.rotation.y += 0.0025
    for (const g of this.glints) g.userData.update(t)
    this.motes.userData.update(t)
    this.butterflies.userData.update(t)
    this.renderer.render(this.scene, this.camera)
  }

  start() {
    if (this.running) return
    this.running = true
    const loop = () => { if (!this.running) return; this.renderFrame(); this.raf = requestAnimationFrame(loop) }
    loop()
  }
  stop() { this.running = false; cancelAnimationFrame(this.raf) }

  dispose() {
    this.stop()
    this.scene.traverse(o => {
      if (o.geometry) o.geometry.dispose()
      if (o.material) [].concat(o.material).forEach(m => { Object.values(m).forEach(v => v?.isTexture && v.dispose()); m.dispose() })
    })
    this.renderer.dispose()
  }
}
