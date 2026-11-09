<template>
  <section ref="root" class="maison" :class="{ 'is-focused': focused, 'is-travelling': !station }" aria-label="The ORVESSA Maison">
    <div ref="stage" class="maison__stage grain">
      <canvas ref="canvas" class="maison__canvas" />
      <img v-if="fallback" class="maison__poster" src="/images/scenes/maison-poster.webp" alt="The ORVESSA Maison hall">
      <div class="maison__vignette" />
      <div ref="dim" class="maison__dim" />

      <!-- Chapter title: appears as the camera arrives in each room -->
      <div ref="titleEl" class="maison__title">
        <p class="t-paren maison__paren"><span class="mline"><span class="mch">({{ shown.paren }})</span></span></p>
        <h1 class="maison__h">
          <span class="mline t-grotesk maison__l1"><span v-for="(w, wi) in words(shown.l1)" :key="shown.id + 'a' + wi" class="mword"><span v-for="(c, i) in w" :key="i" class="mch">{{ c }}</span></span></span>
          <span class="mline t-display maison__l2"><span v-for="(w, wi) in words(shown.l2)" :key="shown.id + 'b' + wi" class="mword"><span v-for="(c, i) in w" :key="i" class="mch">{{ c }}</span></span></span>
        </h1>
        <div class="maison__ctas">
          <template v-if="shown.id === 'hall'">
            <NuxtLink to="/collections" class="btn btn--gold">Explore collection</NuxtLink>
          </template>
          <NuxtLink v-else :to="shown.cta.to" class="btn btn--gold">{{ shown.cta.label }}</NuxtLink>
        </div>
      </div>

      <!-- Eye hotspots on the pieces in the current room -->
      <button
        v-for="h in spots" :key="h.id" :ref="el => (spotEls[h.id] = el)" class="maison__spot"
        :aria-label="`Look closer: ${h.name}`" data-cursor="explore" data-cursor-label="Look" @click="focusOn(h.id)"
      >
        <svg viewBox="0 0 56 30" aria-hidden="true"><path d="M2 15 Q28 -7 54 15 Q28 37 2 15Z" /><circle cx="28" cy="15" r="7.5" /></svg>
        <span class="maison__spot-name">{{ h.name }}</span>
      </button>

      <Transition name="card">
        <aside v-if="focusedSpot" class="maison__card">
          <button class="maison__close t-label" @click="unfocus">Back to the room ×</button>
          <p class="t-paren">({{ CHAPTER_BY_ID[focusedSpot.chapter].label }})</p>
          <h2 class="t-display maison__card-h">{{ focusedSpot.name }}</h2>
          <p class="maison__card-m">{{ focusedSpot.material }}</p>
          <p class="maison__card-p">{{ formatPrice(focusedSpot.price) }}</p>
          <div class="maison__card-ctas">
            <NuxtLink :to="`/products/${focusedSpot.slug}`" class="btn btn--gold">View piece</NuxtLink>
            <button class="btn btn--ghost" @click="addFocused">Add to bag</button>
          </div>
        </aside>
      </Transition>

      <!-- Journey index: where you are in the house (click to travel) -->
      <nav class="maison__index" aria-label="Rooms of the Maison">
        <button v-for="c in CHAPTERS" :key="c.id" :class="{ on: c.id === current }" @click="travelTo(c.id)">
          <span class="maison__index-n">{{ c.id === 'hall' ? '00' : c.paren.replace('Ch. ', '') }}</span>
          <span class="maison__index-l">{{ c.label }}</span>
        </button>
        <i class="maison__index-bar"><b :style="{ transform: `scaleY(${progressShown})` }" /></i>
      </nav>

      <div class="maison__cue t-eyebrow" :class="{ hide: progressShown > 0.02 }"><i /> Scroll to enter the Maison</div>
    </div>
  </section>
</template>

<script setup>
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CHAPTERS } from '~/data/site'
import { PRODUCTS } from '~/data/catalog'

const props = defineProps({ started: Boolean, intro: Boolean, load: { type: Boolean, default: true } })
const emit = defineEmits(['progress', 'revealed'])

const CHAPTER_BY_ID = Object.fromEntries(CHAPTERS.map(c => [c.id, c]))
const root = ref(null), stage = ref(null), canvas = ref(null), titleEl = ref(null), dim = ref(null)
const current = ref('hall')
const station = ref('hall')
const shown = ref(CHAPTERS[0])
const focused = ref(null)
const fallback = ref(false)
const spots = ref([])
const progressShown = ref(0)
const spotEls = {}
const { add } = useCart()
const { scrollTo, stop, start } = useSmoothScroll()

let scene = null, raf = 0, io = null, inView = true, st = null, exitSt = null
let targetP = 0, currentP = 0, titleVisible = false, ready = false, lastT = 0
const focusedSpot = computed(() => focused.value && spots.value.find(s => s.id === focused.value))
const words = (s = '') => s.toUpperCase().split(' ').map((w, i, a) => [...w, ...(i < a.length - 1 ? [' '] : [])])

/* ---------- Title motion: letters dissolve from a blur ---------- */
function titleIn() {
  titleVisible = true
  const chars = titleEl.value.querySelectorAll('.mch')
  gsap.killTweensOf(chars)
  gsap.fromTo(chars, { opacity: 0, filter: 'blur(14px)', yPercent: 18 }, { opacity: 1, filter: 'blur(0px)', yPercent: 0, duration: 1.3, ease: 'power3.out', stagger: { each: 0.035, from: 'random' } })
  gsap.fromTo(titleEl.value.querySelector('.maison__ctas'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1, delay: 0.5, ease: 'power3.out' })
}
function titleOut() {
  titleVisible = false
  const chars = titleEl.value.querySelectorAll('.mch')
  gsap.killTweensOf(chars)
  gsap.to(chars, { opacity: 0, filter: 'blur(10px)', duration: 0.45, ease: 'power2.in', stagger: { each: 0.01, from: 'random' } })
  gsap.to(titleEl.value.querySelector('.maison__ctas'), { opacity: 0, duration: 0.3 })
}
async function showStation(id) {
  if (!id) { if (titleVisible) titleOut(); spots.value = []; return }
  if (titleVisible && shown.value.id === id) return
  if (titleVisible) { titleOut(); await new Promise(r => setTimeout(r, 380)) }
  if (station.value !== id) return
  shown.value = CHAPTER_BY_ID[id]
  await nextTick()
  titleIn()
  spots.value = scene ? scene.hotspots.filter(h => h.chapter === id).map(h => ({ ...h })) : []
}

/* ---------- Scroll journey ---------- */
function journeyScroll(p) {
  const el = root.value
  const startY = el.offsetTop
  const len = el.offsetHeight - window.innerHeight
  return startY + p * len
}
function travelTo(id) {
  if (!scene) return
  if (focused.value) unfocus()
  scrollTo(journeyScroll(scene.stationProgress(id)), { duration: 2.4 })
}
function tick(now = 0) {
  const dt = Math.min(0.1, (now - lastT) / 1000 || 0.016)
  lastT = now
  if (scene && ready) {
    currentP += (targetP - currentP) * (1 - Math.exp(-dt * 3.2))
    if (Math.abs(targetP - currentP) < 0.0002) currentP = targetP
    progressShown.value = currentP
    const j = scene.setProgress(currentP)
    if (j.station !== station.value) { station.value = j.station; showStation(j.station) }
    if (j.station) current.value = j.station
    placeSpots()
  }
  raf = requestAnimationFrame(tick)
}
function placeSpots() {
  if (!scene || focused.value || !station.value) return
  const w = stage.value.clientWidth, h = stage.value.clientHeight
  for (const p of scene.projectHotspots(w, h)) {
    const el = spotEls[p.id]
    if (el) el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`
  }
}

/* ---------- Close-up on a piece ---------- */
async function focusOn(id) {
  if (!scene || scene.flying) return
  focused.value = id
  titleOut()
  await scene.focus(id)
}
async function unfocus() {
  if (!focused.value || !scene) return
  focused.value = null
  await scene.unfocus()
  if (station.value) titleIn()
}
function addFocused() {
  const p = PRODUCTS.find(x => x.slug === focusedSpot.value.slug)
  if (p) add(p.slug, { metal: p.metals[0], size: p.sizes[1] || p.sizes[0] || '' })
}

/* ---------- Lifecycle ---------- */
function onPointer(e) { scene?.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1) }
function onWheelWhileFocused() { if (focused.value) unfocus() }
function onResize() { scene?.resize() }

async function boot() {
  emit('progress', 0.15)
  try {
    const { MaisonScene } = await import('~/scene/hall/MaisonScene.js')
    emit('progress', 0.4)
    await new Promise(r => setTimeout(r, 30))
    const mobile = window.matchMedia('(max-width: 760px), (pointer: coarse)').matches
    scene = new MaisonScene(canvas.value, { mobile })
    emit('progress', 0.75)
    await new Promise(r => setTimeout(r, 30))
    if (props.intro) scene.setIntroPose()
    scene.renderer.compile(scene.scene, scene.camera)
    scene.renderFrame()
    scene.start()
    emit('progress', 1)
  } catch (err) {
    console.warn('[ORVESSA] WebGL unavailable, showing poster', err)
    fallback.value = true
    emit('progress', 1)
  }
}

function reveal(fromPainting) {
  if (fromPainting && scene) {
    stop()
    scene.introReveal(3.8).then(() => { ready = true; start(); showStation('hall'); emit('revealed') })
  } else {
    ready = true
    showStation(station.value || 'hall')
    emit('revealed')
  }
}
watch(() => props.started, (s) => { if (s) reveal(true) })

onMounted(async () => {
  gsap.set(titleEl.value.querySelectorAll('.mch'), { opacity: 0 })
  gsap.set(titleEl.value.querySelector('.maison__ctas'), { opacity: 0 })
  if (!props.load) await new Promise(r => { const stopW = watch(() => props.load, v => { if (v) { stopW(); r() } }) })
  await new Promise(r => requestAnimationFrame(() => setTimeout(r, 30)))
  await boot()
  st = ScrollTrigger.create({ trigger: root.value, start: 'top top', end: 'bottom bottom', onUpdate: s => { targetP = s.progress } })
  // hand-off to the editorial page: as the Maison scrolls away the room dims
  // to black, drifts back and the title fades, so nothing overlaps visibly
  exitSt = ScrollTrigger.create({
    trigger: root.value, start: 'bottom bottom', end: 'bottom 35%', scrub: true,
    animation: gsap.timeline()
      .to(dim.value, { opacity: 1, ease: 'power1.in' }, 0)
      .to(stage.value.querySelectorAll('.maison__title, .maison__index, .maison__cue, .maison__spot'), { opacity: 0, ease: 'none', duration: 0.5 }, 0)
      .fromTo(canvas.value, { scale: 1, yPercent: 0 }, { scale: 1.06, yPercent: 8, ease: 'none' }, 0)
  })
  window.addEventListener('pointermove', onPointer, { passive: true })
  window.addEventListener('wheel', onWheelWhileFocused, { passive: true })
  window.addEventListener('touchmove', onWheelWhileFocused, { passive: true })
  window.addEventListener('resize', onResize)
  io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; if (!scene) return; e.isIntersecting ? scene.start() : scene.stop() })
  io.observe(root.value)
  raf = requestAnimationFrame(tick)
  if (!props.intro) reveal(false)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  io?.disconnect()
  st?.kill()
  exitSt?.kill()
  window.removeEventListener('pointermove', onPointer)
  window.removeEventListener('wheel', onWheelWhileFocused)
  window.removeEventListener('touchmove', onWheelWhileFocused)
  window.removeEventListener('resize', onResize)
  scene?.dispose()
  scene = null
})
</script>

<style scoped>
/* The section is tall; the stage sticks while scroll drives the camera */
.maison { position: relative; height: 1250vh; background: var(--espresso); color: var(--ink); }
.maison__stage { position: sticky; top: 0; height: 100vh; height: 100svh; min-height: 520px; overflow: hidden; }
.maison__canvas, .maison__poster { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.maison__canvas { filter: sepia(0.14) saturate(0.86) contrast(1.1); }
.maison__dim { position: absolute; inset: 0; z-index: 6; pointer-events: none; background: var(--espresso); opacity: 0; }
.maison__vignette { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(16, 10, 6, 0.55) 100%); }
.maison__stage::after { z-index: 2; }

.maison__title {
  position: absolute; inset: 0; z-index: 3; pointer-events: none;
  display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;
  padding: var(--nav-h) var(--gutter) 6vh;
}
.mline { display: block; padding-bottom: 0.04em; }
.mch { display: inline-block; will-change: transform, opacity, filter; }
.mword { display: inline-block; white-space: nowrap; }
.maison__paren { margin-bottom: 10px; opacity: 0.88; font-size: clamp(18px, 1.6vw, 26px); }
.maison__l1 { font-size: clamp(54px, 9.2vw, 172px); }
.maison__l2 { font-size: clamp(62px, 12.4vw, 232px); }
.maison__ctas { position: absolute; left: 50%; bottom: clamp(36px, 7vh, 70px); transform: translateX(-50%); display: flex; gap: 14px; pointer-events: auto; }
.is-travelling .maison__ctas, .is-focused .maison__ctas { pointer-events: none; }
/* hero CTA: high-contrast black pill with a gold rim so it stands out on the warm room */
.maison__ctas .btn { height: 58px; padding: 0 40px; font-size: 13px; font-weight: 600; letter-spacing: 0.2em; background: var(--black); color: var(--ivory); box-shadow: 0 0 0 1px var(--gold), 0 14px 40px rgba(10, 6, 3, 0.45); }
.maison__ctas .btn::before { background: var(--gold); }
.maison__ctas .btn:hover { color: var(--black); }
.maison__ctas .btn { animation: ctaPulse 2.6s var(--ease-out) infinite; }
.maison__ctas .btn:hover { animation: none; }
@keyframes ctaPulse { 0% { box-shadow: 0 0 0 1px var(--gold), 0 0 0 0 rgba(198, 164, 106, 0.55), 0 14px 40px rgba(10, 6, 3, 0.45); } 100% { box-shadow: 0 0 0 1px var(--gold), 0 0 0 16px rgba(198, 164, 106, 0), 0 14px 40px rgba(10, 6, 3, 0.45); } }

.maison__spot { position: absolute; top: 0; left: 0; z-index: 4; width: 56px; height: 30px; margin: -15px 0 0 -28px; animation: spotIn 0.8s var(--ease-out) both 0.6s; }
@keyframes spotIn { from { opacity: 0; } to { opacity: 1; } }
.maison__spot svg { width: 56px; height: 30px; overflow: visible; }
.maison__spot path { fill: rgba(16, 10, 6, 0.15); stroke: var(--ink); stroke-width: 1.3; }
.maison__spot circle { fill: var(--gold); transform-origin: 28px 15px; animation: blink 4s infinite; }
@keyframes blink { 0%, 92%, 100% { transform: scaleY(1); } 95% { transform: scaleY(0.1); } }
.maison__spot-name { position: absolute; left: 50%; top: calc(100% + 10px); transform: translateX(-50%); white-space: nowrap; font-size: 11px; font-weight: 500; letter-spacing: 0.16em; text-transform: uppercase; opacity: 0; transition: opacity 0.4s; }
.maison__spot:hover .maison__spot-name { opacity: 1; }
.is-focused .maison__spot { opacity: 0; pointer-events: none; }

.maison__card { position: absolute; z-index: 5; right: var(--gutter); top: 50%; transform: translateY(-50%); width: min(420px, calc(100vw - 2 * var(--gutter))); padding: 36px 0 36px 36px; }
.maison__card::before { content: ''; position: absolute; inset: -40vh calc(-1 * var(--gutter)) -40vh -120px; background: linear-gradient(90deg, transparent, rgba(20, 14, 9, 0.6) 45%); z-index: -1; pointer-events: none; }
.maison__close { display: block; margin-bottom: 40px; opacity: 0.8; }
.maison__card-h { font-size: clamp(48px, 5vw, 84px); margin: 12px 0 18px; }
.maison__card-m { font-size: 13px; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.85; }
.maison__card-p { font-size: 18px; margin-top: 8px; }
.maison__card-ctas { display: flex; gap: 12px; margin-top: 30px; flex-wrap: wrap; }
.card-enter-active { transition: opacity 0.9s var(--ease-out) 0.7s, transform 1.1s var(--ease-out) 0.7s; }
.card-leave-active { transition: opacity 0.4s, transform 0.4s; }
.card-enter-from, .card-leave-to { opacity: 0; transform: translateY(-46%); }

.maison__index { position: absolute; z-index: 4; left: var(--gutter); bottom: clamp(30px, 6vh, 60px); display: grid; gap: 10px; padding-left: 18px; }
.maison__index button { display: flex; align-items: baseline; gap: 12px; text-align: left; opacity: 0.45; transition: opacity 0.5s var(--ease-out); }
.maison__index button.on, .maison__index button:hover { opacity: 1; }
.maison__index-n { font-family: var(--serif); font-size: 15px; width: 22px; }
.maison__index-l { font-size: 11px; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; }
.maison__index button.on .maison__index-n { color: var(--gold); }
.maison__index-bar { position: absolute; left: 0; top: 4px; bottom: 4px; width: 1px; background: var(--line); }
.maison__index-bar b { position: absolute; inset: 0; background: var(--gold); transform-origin: top; }

.maison__cue { position: absolute; z-index: 4; right: var(--gutter); bottom: clamp(30px, 6vh, 60px); display: flex; align-items: center; gap: 12px; opacity: 0.85; transition: opacity 0.8s; }
.maison__cue.hide { opacity: 0; }
.maison__cue i { width: 1px; height: 34px; background: linear-gradient(var(--ink), transparent); animation: drip 2.2s var(--ease-in-out) infinite; transform-origin: top; }
@keyframes drip { 0% { transform: scaleY(0); } 50% { transform: scaleY(1); } 100% { transform: scaleY(1); opacity: 0; } }

@media (max-width: 760px) {
  .maison { height: 900vh; }
  .maison__l1 { font-size: 10.5vw; }
  .maison__l2 { font-size: 12.5vw; }
  .maison__ctas .btn { height: 44px; }
  .maison__index-l { display: none; }
  .maison__cue { display: none; }
  .maison__card { top: auto; bottom: 90px; transform: none; padding: 24px 0 0; }
  .maison__card::before { inset: -30px calc(-1 * var(--gutter)) -140px; background: linear-gradient(transparent, rgba(20, 14, 9, 0.8) 30%); }
  .card-enter-from, .card-leave-to { transform: translateY(20px); }
}
</style>
