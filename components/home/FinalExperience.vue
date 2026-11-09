<template>
  <section ref="root" class="final grain">
    <div class="final__media"><img ref="img" src="/images/scenes/final.webp" alt="Aurora diamond rivière in the dark"></div>
    <div class="final__content wrap">
      <p class="t-paren">(Forever yours)</p>
      <h2 class="final__h">
        <span ref="h1" class="t-grotesk">Timeless beauty.</span>
        <span ref="h2" class="t-display">Forever yours.</span>
      </h2>
      <NuxtLink to="/collections" class="btn btn--gold">Explore ORVESSA</NuxtLink>
      <div class="final__services">
        <div><b class="t-eyebrow">Private appointments</b><span>In our Milan salon or by video, with a jewelry advisor.</span></div>
        <div><b class="t-eyebrow">Complimentary delivery</b><span>Insured, signature-on-delivery, in 2–4 working days.</span></div>
        <div><b class="t-eyebrow">Lifetime care</b><span>Cleaning, re-polishing and resizing for every piece, always.</span></div>
      </div>
    </div>
  </section>
</template>
<script setup>
const root = ref(null), img = ref(null), h1 = ref(null), h2 = ref(null)
const { charsIn, parallax, fadeUp } = useAnimations()
onMounted(() => {
  parallax(img.value, { y: 18, trigger: root.value, scale: [1.2, 1.05] })
  charsIn(h1.value, { trigger: root.value, start: 'top 55%' })
  charsIn(h2.value, { trigger: root.value, start: 'top 55%', delay: 0.15 })
  fadeUp(root.value.querySelectorAll('.final__content > .btn, .final__services > div'), { trigger: root.value, start: 'top 45%', delay: 0.4 })
})
</script>
<style scoped>
.final { position: relative; min-height: 110vh; overflow: hidden; display: flex; align-items: center; background: var(--black); padding: var(--section) 0; }
.final__media { position: absolute; inset: 0; }
.final__media img { width: 100%; height: 100%; opacity: 0.85; }
.final__media::after { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 60%, transparent 20%, rgba(5, 4, 3, 0.6) 70%), linear-gradient(transparent 60%, var(--black)); }
.final__content { position: relative; width: 100%; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 28px; }
.final__h { display: flex; flex-direction: column; font-weight: 400; }
.final__h .t-grotesk { font-size: clamp(46px, 7.4vw, 136px); }
.final__h .t-display { font-size: clamp(58px, 10.4vw, 190px); }
.final__services { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(20px, 4vw, 70px); margin-top: clamp(60px, 10vh, 120px); width: 100%; text-align: left; border-top: 1px solid var(--line); padding-top: 28px; }
.final__services div { display: grid; gap: 8px; font-size: 14px; opacity: 0.88; }
.final__services b { color: var(--gold); font-weight: 500; }
@media (max-width: 760px) { .final__services { grid-template-columns: 1fr; } }
</style>
