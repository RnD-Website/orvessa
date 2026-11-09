<template>
  <section ref="root" class="camp grain" aria-label="Campaign — Your story, your forever">
    <div ref="media" class="camp__media">
      <picture>
        <source media="(max-width: 760px)" srcset="/images/scenes/campaign-mobile.webp">
        <img ref="img" src="/images/scenes/campaign.webp" alt="Elara diamond cascade worn on a black velvet bust">
      </picture>
    </div>
    <div class="camp__shade" />
    <div class="camp__content wrap">
      <p class="t-paren">(Campaign — Autumn {{ year }})</p>
      <h2 class="camp__h">
        <span ref="h1" class="t-display">Your story.</span>
        <span ref="h2" class="t-display camp__gold">Your forever.</span>
      </h2>
      <p class="camp__cap">Elara Diamond Cascade — fifteen pear diamonds, falling like light.</p>
      <NuxtLink to="/products/elara-diamond-cascade" class="btn btn--ghost">Discover Elara</NuxtLink>
    </div>
  </section>
</template>
<script setup>
const year = new Date().getFullYear()
const root = ref(null), media = ref(null), img = ref(null), h1 = ref(null), h2 = ref(null)
const { charsIn, add, gsap, fadeUp } = useAnimations()
onMounted(() => {
  add(() => {
    gsap.fromTo(media.value, { clipPath: 'inset(8% 8% 8% 8%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: root.value, start: 'top bottom', end: 'top top', scrub: true } })
    gsap.fromTo(img.value, { scale: 1.25 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: root.value, start: 'top bottom', end: 'bottom top', scrub: true } })
  })
  charsIn(h1.value, { trigger: root.value, start: 'top 40%' })
  charsIn(h2.value, { trigger: root.value, start: 'top 40%', delay: 0.2 })
  fadeUp(root.value.querySelectorAll('.camp__cap, .camp__content .btn, .camp__content .t-paren'), { trigger: root.value, start: 'top 35%', delay: 0.4 })
})
</script>
<style scoped>
.camp { position: relative; height: 120vh; min-height: 640px; overflow: hidden; background: var(--black); }
.camp__media { position: absolute; inset: 0; }
.camp__media img { width: 100%; height: 100%; }
.camp__shade { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(5, 4, 3, 0.7) 0%, rgba(5, 4, 3, 0.15) 50%, transparent 70%); }
.camp__content { position: relative; height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 22px; align-items: flex-start; max-width: 60vw; }
.camp__h { display: flex; flex-direction: column; font-weight: 400; font-size: clamp(64px, 10.4vw, 190px); }
.camp__gold { color: var(--gold); }
.camp__cap { max-width: 34ch; opacity: 0.85; font-size: var(--fs-lg); }
.camp .btn { color: var(--ink); }
@media (max-width: 760px) {
  .camp { height: 100svh; }
  .camp__content { max-width: none; justify-content: flex-end; padding-bottom: 80px; }
  .camp__shade { background: linear-gradient(0deg, rgba(5, 4, 3, 0.85) 0%, transparent 60%); }
}
</style>
