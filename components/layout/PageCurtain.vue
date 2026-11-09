<template>
  <div ref="el" class="curtain" aria-hidden="true" />
</template>

<script setup>
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
// Page transition: an espresso curtain rises over the page, the route
// changes underneath, scroll resets, and the curtain lifts away.
const el = ref(null)
const router = useRouter()
const { reset } = useSmoothScroll()
let first = true

onMounted(() => {
  gsap.set(el.value, { yPercent: 100 })
  router.beforeEach((to, from) => {
    if (first || to.path === from.path) return true
    return new Promise(resolve => {
      gsap.timeline({ onComplete: resolve })
        .set(el.value, { yPercent: 100, visibility: 'visible' })
        .to(el.value, { yPercent: 0, duration: 0.75, ease: 'power3.inOut' })
    })
  })
  router.afterEach((to, from) => {
    if (first) { first = false; return }
    if (to.path === from.path) return
    nextTick(() => {
      reset()
      setTimeout(() => {
        ScrollTrigger.refresh()
        gsap.timeline()
          .to(el.value, { yPercent: -100, duration: 0.9, ease: 'power3.inOut' })
          .set(el.value, { visibility: 'hidden' })
      }, 120)
    })
  })
})
</script>

<style scoped>
.curtain { position: fixed; inset: 0; z-index: var(--z-curtain); background: var(--gold-deep); visibility: hidden; }
</style>
