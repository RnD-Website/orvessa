<template>
  <div v-if="enabled" class="cursor" aria-hidden="true">
    <div ref="dot" class="cursor__eye" :class="state">
      <svg viewBox="0 0 56 30" aria-hidden="true"><path d="M2 15 Q28 -7 54 15 Q28 37 2 15Z" /><circle cx="28" cy="15" r="7" /></svg>
    </div>
    <div ref="ring" class="cursor__ring" :class="state"><span>{{ label }}</span></div>
  </div>
</template>

<script setup>
import gsap from 'gsap'
// A dot that follows exactly and a ring that trails with inertia.
// Elements opt in with data-cursor="view|drag|link" (and data-cursor-label).
const enabled = ref(false)
const dot = ref(null)
const ring = ref(null)
const state = ref('')
const label = ref('')

function onMove(e) {
  gsap.set(dot.value, { x: e.clientX, y: e.clientY })
  gsap.to(ring.value, { x: e.clientX, y: e.clientY, duration: 0.55, ease: 'power3.out' })
  const t = e.target.closest?.('[data-cursor], a, button, input, select, label')
  if (!t) { state.value = ''; label.value = ''; return }
  const kind = t.dataset?.cursor
  state.value = kind ? `is-${kind}` : 'is-link'
  label.value = t.dataset?.cursorLabel || (kind === 'view' ? 'View' : kind === 'drag' ? 'Drag' : kind === 'explore' ? 'Explore' : '')
}
function onDown() { gsap.to(ring.value, { scale: 0.8, duration: 0.2 }) }
function onUp() { gsap.to(ring.value, { scale: 1, duration: 0.4 }) }
onMounted(() => {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
  enabled.value = true
  document.documentElement.classList.add('has-cursor')
  window.addEventListener('mousemove', onMove, { passive: true })
  window.addEventListener('mousedown', onDown)
  window.addEventListener('mouseup', onUp)
})
onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('mousedown', onDown)
  window.removeEventListener('mouseup', onUp)
})
</script>

<style scoped>
.cursor { position: fixed; inset: 0; pointer-events: none; z-index: var(--z-cursor); }
.cursor__ring { position: fixed; top: 0; left: 0; border-radius: 50%; transform: translate(-50%, -50%); will-change: transform; }
.cursor__eye { position: fixed; top: 0; left: 0; width: 44px; height: 24px; margin: -12px 0 0 -22px; transition: opacity 0.3s, transform 0.4s var(--ease-out); }
.cursor__eye svg { width: 100%; height: 100%; overflow: visible; }
.cursor__eye path { fill: none; stroke: var(--ink); stroke-width: 1.6; }
.cursor__eye circle { fill: var(--gold); transform-origin: 28px 15px; animation: cblink 4.5s infinite; }
@keyframes cblink { 0%, 93%, 100% { transform: scaleY(1); } 96% { transform: scaleY(0.1); } }
.cursor__eye.is-view, .cursor__eye.is-drag, .cursor__eye.is-explore { opacity: 0; }
.cursor__ring {
  width: 0; height: 0; margin: 0; transform: none;
  border: 1px solid transparent;
  display: grid; place-items: center;
  transition: width 0.5s var(--ease-out), height 0.5s var(--ease-out), margin 0.5s var(--ease-out), background 0.4s, border-color 0.4s;
  mix-blend-mode: normal;
}
.cursor__ring span { font-size: 10px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: var(--black); opacity: 0; transition: opacity 0.3s; }
.cursor__ring.is-link { width: 58px; height: 58px; margin: -29px 0 0 -29px; border-color: rgba(198, 164, 106, 0.7); }
.cursor__ring.is-view, .cursor__ring.is-drag, .cursor__ring.is-explore { width: 92px; height: 92px; margin: -46px 0 0 -46px; background: var(--gold); border-color: var(--gold); }
.cursor__ring.is-view span, .cursor__ring.is-drag span, .cursor__ring.is-explore span { opacity: 1; }
</style>
