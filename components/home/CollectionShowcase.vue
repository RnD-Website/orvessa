<template>
  <section ref="root" class="show" aria-label="The Signature Collection">
    <div ref="pin" class="show__pin">
      <header class="show__head wrap">
        <p class="t-paren">(High jewelry · {{ items.length }} pieces)</p>
        <h2 class="show__h"><span ref="h1" class="t-grotesk">The Signature</span> <span ref="h2" class="t-display">Collection</span></h2>
      </header>
      <div ref="track" class="show__track" data-cursor="drag">
        <article v-for="(p, i) in items" :key="p.slug" class="show__item" :class="`v${i % 3}`">
          <NuxtLink :to="`/products/${p.slug}`" class="show__media" data-cursor="view">
            <img :src="productImages(p, p.metals[0])[i % 2 ? 1 : 0]" :alt="p.name" loading="lazy">
          </NuxtLink>
          <div class="show__meta">
            <span class="show__n t-paren">({{ String(i + 1).padStart(2, '0') }})</span>
            <NuxtLink :to="`/products/${p.slug}`" class="show__name t-display">{{ p.name }}</NuxtLink>
            <p class="show__mat">{{ metalName(p.metals[0]) }} · {{ p.stone.split(',')[0] }}</p>
            <div class="show__row">
              <span>{{ formatPrice(p.price) }}</span>
              <NuxtLink :to="`/products/${p.slug}`" class="u-link t-label">Explore piece</NuxtLink>
            </div>
          </div>
        </article>
        <NuxtLink to="/collections" class="show__end" data-cursor="explore">
          <span class="t-display">View all<br>jewelry</span><i>→</i>
        </NuxtLink>
      </div>
      <div class="show__progress wrap" aria-hidden="true"><i ref="bar" /></div>
    </div>
  </section>
</template>

<script setup>
import { PRODUCTS, productImages, metalName } from '~/data/catalog'
const items = PRODUCTS.filter(p => p.signature)
const root = ref(null), pin = ref(null), track = ref(null), bar = ref(null), h1 = ref(null), h2 = ref(null)
const { add, gsap, charsIn } = useAnimations()

onMounted(() => {
  charsIn(h1.value, { trigger: root.value, start: 'top 70%' })
  charsIn(h2.value, { trigger: root.value, start: 'top 70%', delay: 0.15 })
  const mm = gsap.matchMedia()
  add(() => {
    mm.add('(min-width: 761px)', () => {
      const dist = () => track.value.scrollWidth - window.innerWidth
      const tween = gsap.to(track.value, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: root.value, start: 'top top', end: () => `+=${dist()}`, pin: pin.value, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: s => gsap.set(bar.value, { scaleX: s.progress })
        }
      })
      // each image counter-drifts inside its frame while the track moves
      track.value.querySelectorAll('.show__media img').forEach(img => {
        gsap.fromTo(img, { xPercent: -8, scale: 1.18 }, { xPercent: 8, scale: 1.18, ease: 'none', scrollTrigger: { trigger: img.parentElement, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } })
      })
      track.value.querySelectorAll('.show__item').forEach(it => {
        gsap.fromTo(it.querySelector('.show__media'), { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: it, containerAnimation: tween, start: 'left 105%', end: 'left 55%', scrub: true } })
      })
    })
  })
})
</script>

<style scoped>
.show { background: var(--sand); color: var(--ink-dark); }
.show__pin { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; padding: calc(var(--nav-h) + 10px) 0 40px; overflow: hidden; }
.show__head { display: flex; justify-content: space-between; align-items: flex-end; gap: 30px; margin-bottom: clamp(24px, 4vh, 50px); }
.show__h { font-weight: 400; font-size: clamp(42px, 6vw, 110px); line-height: 0.86; text-align: right; }
.show__h span { display: inline-block; }
.show__track { display: flex; gap: clamp(30px, 4vw, 70px); padding: 0 var(--gutter); width: max-content; align-items: flex-start; }
.show__item { width: clamp(280px, 26vw, 440px); display: grid; gap: 18px; }
.show__item.v1 { width: clamp(300px, 32vw, 540px); margin-top: 6vh; }
.show__item.v2 { width: clamp(260px, 22vw, 380px); margin-top: 14vh; }
.show__media { display: block; aspect-ratio: 4 / 5; overflow: hidden; background: var(--beige); }
.show__item.v1 .show__media { aspect-ratio: 5 / 6; }
.show__media img { width: 100%; height: 100%; }
.show__meta { display: grid; gap: 6px; }
.show__n { opacity: 0.6; }
.show__name { font-size: clamp(30px, 2.6vw, 46px); }
.show__mat { font-size: 13px; opacity: 0.7; }
.show__row { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; font-size: 15px; }
.show__end { align-self: center; display: flex; align-items: center; gap: 24px; padding: 0 8vw 0 4vw; }
.show__end span { font-size: clamp(50px, 6vw, 100px); }
.show__end i { width: 80px; height: 80px; border-radius: 50%; background: var(--black); color: var(--ivory); display: grid; place-items: center; font-style: normal; font-size: 24px; transition: background 0.4s, transform 0.6s var(--ease-out); }
.show__end:hover i { background: var(--gold); color: var(--black); transform: scale(1.1); }
.show__progress { margin-top: clamp(24px, 4vh, 44px); }
.show__progress::before { content: ''; display: block; height: 1px; background: var(--line-dark); }
.show__progress i { display: block; height: 1px; margin-top: -1px; background: var(--ink-dark); transform-origin: left; transform: scaleX(0); }
@media (max-width: 760px) {
  .show__pin { padding-top: var(--section); }
  .show__head { flex-direction: column; align-items: flex-start; }
  .show__h { text-align: left; }
  .show__track { width: auto; overflow-x: auto; scroll-snap-type: x mandatory; padding-bottom: 20px; -webkit-overflow-scrolling: touch; }
  .show__item, .show__item.v1, .show__item.v2 { width: 78vw; margin-top: 0; scroll-snap-align: start; flex-shrink: 0; }
  .show__end { flex-shrink: 0; }
  .show__progress { display: none; }
}
</style>
