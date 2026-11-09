<template>
  <section ref="root" class="story" id="story">
    <div class="story__intro wrap">
      <p class="t-paren story__paren">(The Maison)</p>
      <h2 class="story__h">
        <span ref="h1" class="t-grotesk story__l1">More than</span>
        <span ref="h2" class="t-display story__l2">an ornament.</span>
      </h2>
    </div>

    <!-- full-bleed image that opens from an inset frame as you scroll -->
    <div ref="frame" class="story__frame">
      <div class="story__frame-inner"><img ref="frameImg" src="/images/scenes/story-wide.webp" alt="Solenne gold collar, macro detail"></div>
      <p class="story__frame-cap t-paren">(Solenne — seven rows of hand-polished gold)</p>
    </div>

    <div class="story__grid wrap">
      <div class="story__copy">
        <p ref="lead" class="t-lead">An expression of individuality. A celebration of craftsmanship. A timeless connection between beauty and emotion.</p>
        <p ref="body" class="t-body">Every ORVESSA piece begins as a drawing in our Milan atelier and ends in the hands of the goldsmith who made it. We work in solid 18k gold and natural diamonds only, in small numbers, so that each necklace feels like it was made for one person — because it was.</p>
        <NuxtLink to="/about" class="btn btn--ghost story__cta">Our story</NuxtLink>
      </div>
      <div ref="tall" class="story__tall mask"><img src="/images/scenes/story-bust.webp" alt="Celeste rope necklace on an ivory bust"></div>
      <div ref="small" class="story__small mask"><img src="/images/scenes/pendant-macro.webp" alt="Lumière pear diamond pendant"></div>
    </div>
  </section>
</template>

<script setup>
const root = ref(null), h1 = ref(null), h2 = ref(null), frame = ref(null), frameImg = ref(null), lead = ref(null), body = ref(null), tall = ref(null), small = ref(null)
const { charsIn, linesIn, maskIn, parallax, add, gsap } = useAnimations()
onMounted(() => {
  charsIn(h1.value, { trigger: h1.value })
  charsIn(h2.value, { trigger: h1.value, delay: 0.15 })
  add(() => {
    gsap.fromTo(frame.value.querySelector('.story__frame-inner'), { clipPath: 'inset(22% 30% 22% 30%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)', ease: 'none',
      scrollTrigger: { trigger: frame.value, start: 'top 85%', end: 'center center', scrub: true }
    })
    gsap.fromTo(frameImg.value, { scale: 1.18 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: frame.value, start: 'top 85%', end: 'center center', scrub: true } })
  })
  linesIn(lead.value)
  linesIn(body.value, { delay: 0.1 })
  maskIn(tall.value, { from: 'bottom' })
  maskIn(small.value, { from: 'top', delay: 0.15 })
  parallax(tall.value, { y: -14, trigger: root.value })
  parallax(small.value, { y: 22, trigger: root.value })
})
</script>

<style scoped>
.story { z-index: 1; background: var(--espresso); padding: calc(var(--section) * 1.6) 0 var(--section); position: relative; }
/* soft hand-off from the Maison into the editorial chapters */
.story::before { content: ''; position: absolute; left: 50%; top: calc(var(--section) * 0.55); width: 1px; height: calc(var(--section) * 0.6); background: linear-gradient(transparent, var(--gold)); }
.story__intro { text-align: center; }
.story__paren { opacity: 0.7; margin-bottom: 20px; }
.story__h { display: flex; flex-direction: column; align-items: center; font-weight: 400; }
.story__l1 { font-size: clamp(48px, 8.2vw, 150px); }
.story__l2 { font-size: clamp(58px, 11vw, 200px); }
.story__frame { margin: clamp(60px, 9vw, 140px) 0; }
.story__frame-inner { aspect-ratio: 2400 / 1100; width: 100%; overflow: hidden; }
.story__frame-inner img { width: 100%; height: 100%; }
.story__frame-cap { text-align: center; margin-top: 18px; opacity: 0.6; }
.story__grid { display: grid; grid-template-columns: 1.1fr 1fr 0.7fr; gap: clamp(24px, 4vw, 70px); align-items: start; }
.story__copy { display: grid; gap: 28px; padding-top: 40px; }
.story__cta { justify-self: start; color: var(--ink); }
.story__tall { aspect-ratio: 3 / 4; }
.story__small { aspect-ratio: 4 / 5; margin-top: 40%; }
@media (max-width: 900px) {
  .story__grid { grid-template-columns: 1fr 1fr; }
  .story__copy { grid-column: 1 / -1; }
}
</style>
