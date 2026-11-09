<template>
  <div class="gal">
    <div class="gal__thumbs" role="tablist" aria-label="Product views">
      <button v-for="(src, i) in images" :key="src" class="gal__thumb" :class="{ on: i === active }" role="tab" :aria-selected="i === active" :aria-label="`View ${i + 1}`" @click="show(i)">
        <img :src="src" alt="">
      </button>
    </div>
    <div
      ref="stage" class="gal__stage" data-cursor="view" :data-cursor-label="zoomed ? 'Close' : 'Zoom'"
      @mousemove="onMove" @mouseleave="lens = false" @mouseenter="lens = true" @click="toggleZoom"
      @touchstart.passive="onTouchStart" @touchend.passive="onTouchEnd"
    >
      <img v-for="(src, i) in images" :key="src" :ref="el => (imgs[i] = el)" :src="src" :alt="`${name} — view ${i + 1}`" class="gal__img" :class="{ on: i === active }">
      <div v-show="lens && !isTouch && !zoomed" class="gal__lens" :style="lensStyle" aria-hidden="true" />
      <span class="gal__count t-label">{{ String(active + 1).padStart(2, '0') }} / {{ String(images.length).padStart(2, '0') }}</span>
    </div>
    <Teleport to="body">
      <Transition name="zoom">
        <div v-if="zoomed" class="gal__full" @click="zoomed = false">
          <img :src="images[active]" :alt="name" :style="{ transformOrigin: `${pos.x * 100}% ${pos.y * 100}%` }">
          <button class="gal__close t-label" @click.stop="zoomed = false">Close ×</button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import gsap from 'gsap'
const props = defineProps({ images: Array, name: String })
const active = ref(0)
const stage = ref(null)
const imgs = []
const lens = ref(false)
const zoomed = ref(false)
const pos = reactive({ x: 0.5, y: 0.5 })
const isTouch = import.meta.client && window.matchMedia('(pointer: coarse)').matches
const lensStyle = computed(() => ({
  left: `${pos.x * 100}%`, top: `${pos.y * 100}%`,
  backgroundImage: `url(${props.images[active.value]})`,
  backgroundPosition: `${pos.x * 100}% ${pos.y * 100}%`
}))
function show(i) {
  if (i === active.value) return
  const from = imgs[active.value], to = imgs[i]
  active.value = i
  gsap.fromTo(to, { clipPath: 'inset(100% 0 0 0)', scale: 1.15 }, { clipPath: 'inset(0% 0 0 0)', scale: 1, duration: 1.2, ease: 'expo.inOut' })
  gsap.fromTo(from, { scale: 1 }, { scale: 0.96, duration: 1.2, ease: 'expo.inOut' })
}
function onMove(e) {
  const r = stage.value.getBoundingClientRect()
  pos.x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
  pos.y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))
}
function toggleZoom() { zoomed.value = !zoomed.value }
let tx = 0
const onTouchStart = (e) => { tx = e.touches[0].clientX }
const onTouchEnd = (e) => {
  const dx = e.changedTouches[0].clientX - tx
  if (Math.abs(dx) > 40) show((active.value + (dx < 0 ? 1 : -1) + props.images.length) % props.images.length)
}
watch(() => props.images, () => { imgs.forEach(el => el && gsap.set(el, { clearProps: 'all' })) })
</script>

<style scoped>
.gal { display: grid; grid-template-columns: 84px 1fr; gap: 18px; align-items: start; }
.gal__thumbs { display: grid; gap: 12px; position: sticky; top: calc(var(--nav-h) + 20px); }
.gal__thumb { aspect-ratio: 4 / 5; overflow: hidden; opacity: 0.5; outline: 1px solid transparent; outline-offset: 3px; transition: opacity 0.4s, outline-color 0.4s; }
.gal__thumb.on { opacity: 1; outline-color: var(--ink-dark); }
.gal__thumb img { width: 100%; height: 100%; }
.gal__stage { position: relative; aspect-ratio: 4 / 5; overflow: hidden; background: var(--sand); }
.gal__img { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; }
.gal__img.on { opacity: 1; z-index: 1; }
.gal__lens { position: absolute; z-index: 3; width: 220px; height: 220px; border-radius: 50%; transform: translate(-50%, -50%); background-size: 320%; background-repeat: no-repeat; box-shadow: 0 0 0 1px rgba(198, 164, 106, 0.8), 0 20px 50px rgba(0, 0, 0, 0.3); pointer-events: none; }
.gal__count { position: absolute; z-index: 2; left: 18px; bottom: 16px; color: var(--ink-dark); opacity: 0.7; }
.gal__full { position: fixed; inset: 0; z-index: 95; background: var(--sand); display: grid; place-items: center; cursor: zoom-out; }
.gal__full img { height: 100vh; width: auto; max-width: none; transform: scale(1.6); }
.gal__close { position: absolute; top: 28px; right: var(--gutter); color: var(--ink-dark); }
.zoom-enter-active, .zoom-leave-active { transition: opacity 0.6s var(--ease-out); }
.zoom-enter-from, .zoom-leave-to { opacity: 0; }
@media (max-width: 900px) {
  .gal { grid-template-columns: 1fr; }
  .gal__thumbs { position: static; grid-auto-flow: column; grid-template-columns: repeat(3, 72px); order: 2; }
  .gal__full img { width: 100vw; height: auto; transform: scale(1.4); }
}
</style>
