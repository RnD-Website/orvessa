<template>
  <div class="cp">
    <header class="cp__hero grain">
      <img ref="bg" class="cp__bg" src="/images/craft/polish.webp" alt="Hand-polished oversized gold links">
      <div class="cp__in wrap">
        <p class="t-paren">(Craftsmanship)</p>
        <h1 class="cp__h"><span ref="h1" class="t-grotesk">Inside the</span> <span ref="h2" class="t-display">atelier</span></h1>
        <p class="cp__lead">Twenty-two artisans, four disciplines and hundreds of hours behind every necklace.</p>
      </div>
    </header>
    <CraftsmanshipSection :link="false" />
    <section class="cp__numbers ivory">
      <div class="wrap">
        <div v-for="n in NUMBERS" :key="n.l" class="cp__num"><b class="t-display">{{ n.v }}</b><span class="t-label">{{ n.l }}</span></div>
      </div>
    </section>
    <section class="cp__cta grain">
      <div class="wrap">
        <h2 class="t-display cp__cta-h">See the work up close</h2>
        <NuxtLink to="/products/aurora-diamond-riviere" class="btn btn--gold">Discover the Aurora rivière</NuxtLink>
      </div>
    </section>
  </div>
</template>
<script setup>
const NUMBERS = [{ v: '320h', l: 'To make one rivière' }, { v: '41', l: 'Diamonds matched by eye' }, { v: '7', l: 'Rows in the Solenne collar' }, { v: '100%', l: 'Recycled, traceable gold' }]
const bg = ref(null), h1 = ref(null), h2 = ref(null)
const { charsIn, parallax, fadeUp } = useAnimations()
onMounted(() => {
  charsIn(h1.value, { trigger: false, delay: 0.5 }); charsIn(h2.value, { trigger: false, delay: 0.65 })
  parallax(bg.value, { y: 20, scale: [1.15, 1.05] })
  fadeUp(document.querySelectorAll('.cp__num'), { stagger: 0.1 })
})
useHead({ title: 'Craftsmanship — ORVESSA' })
</script>
<style scoped>
.cp__hero { position: relative; height: 90vh; min-height: 540px; overflow: hidden; display: flex; align-items: flex-end; background: var(--black); }
.cp__bg { position: absolute; inset: 0; width: 100%; height: 100%; }
.cp__hero::before { content: ''; position: absolute; inset: 0; z-index: 1; background: linear-gradient(0deg, rgba(10, 7, 5, 0.85), transparent 65%); }
.cp__in { position: relative; z-index: 2; padding-bottom: clamp(40px, 8vh, 100px); display: grid; gap: 18px; }
.cp__h { font-weight: 400; font-size: clamp(56px, 9.6vw, 176px); line-height: 0.86; }
.cp__h span { display: inline-block; }
.cp__lead { max-width: 40ch; font-size: var(--fs-lg); opacity: 0.86; }
.cp__numbers { padding: var(--section) 0; }
.cp__numbers .wrap { display: grid; grid-template-columns: repeat(4, 1fr); gap: 30px; }
.cp__num { display: grid; gap: 10px; border-top: 1px solid var(--line-dark); padding-top: 24px; }
.cp__num b { font-size: clamp(60px, 7vw, 130px); font-weight: 400; }
.cp__cta { position: relative; overflow: hidden; background: var(--umber); padding: var(--section) 0; text-align: center; }
.cp__cta .wrap { display: grid; gap: 30px; justify-items: center; }
.cp__cta-h { font-size: clamp(48px, 7vw, 128px); }
@media (max-width: 760px) { .cp__numbers .wrap { grid-template-columns: 1fr 1fr; } }
</style>
