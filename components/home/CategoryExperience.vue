<template>
  <section ref="root" class="cats" aria-label="Collections">
    <div ref="pin" class="cats__pin">
      <article v-for="(c, i) in CATEGORIES" :key="c.slug" class="cats__scene" :style="{ zIndex: i + 1 }">
        <div class="cats__media"><img :src="c.image" :alt="`${c.name} — ORVESSA`" :loading="i ? 'lazy' : 'eager'"></div>
        <div class="cats__shade" />
        <div class="cats__content wrap">
          <p class="t-paren cats__idx">({{ c.index }} — {{ c.name }})</p>
          <h3 class="t-display cats__h"><span class="cats__line" v-for="(line, li) in splitHeadline(c.headline)" :key="li"><span class="cats__in">{{ line }}</span></span></h3>
          <p class="cats__intro">{{ c.intro }}</p>
          <NuxtLink :to="`/collections/${c.slug}`" class="btn btn--gold cats__cta">{{ c.cta }}</NuxtLink>
        </div>
      </article>
      <div class="cats__counter t-label" aria-hidden="true"><b>{{ String(active + 1).padStart(2, '0') }}</b> / {{ String(CATEGORIES.length).padStart(2, '0') }}</div>
      <div class="cats__bar" aria-hidden="true"><i ref="bar" /></div>
    </div>
  </section>
</template>

<script setup>
import { CATEGORIES } from '~/data/catalog'
const root = ref(null), pin = ref(null), bar = ref(null)
const active = ref(0)
const { add, gsap, ScrollTrigger } = useAnimations()
const splitHeadline = (h) => { const w = h.split(' '); const mid = Math.ceil(w.length / 2); return [w.slice(0, mid).join(' '), w.slice(mid).join(' ')] }

onMounted(() => {
  const scenes = [...pin.value.querySelectorAll('.cats__scene')]
  const mm = gsap.matchMedia()
  add(() => {
    // Desktop & tablet: pinned stack, each scene wipes up over the previous one
    mm.add('(min-width: 761px)', () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.value, start: 'top top', end: () => `+=${window.innerHeight * (scenes.length - 0.2) * 1.1}`,
          pin: pin.value, scrub: 1, anticipatePin: 1,
          onUpdate: (self) => { active.value = Math.min(scenes.length - 1, Math.round(self.progress * (scenes.length - 1))); gsap.set(bar.value, { scaleX: self.progress }) }
        }
      })
      scenes.forEach((s, i) => {
        const inner = s.querySelectorAll('.cats__in')
        const extras = s.querySelectorAll('.cats__idx, .cats__intro, .cats__cta')
        if (i === 0) {
          gsap.set(s, { clipPath: 'inset(0% 0% 0% 0%)' })
          return
        }
        const prev = scenes[i - 1]
        tl.fromTo(s, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.inOut', duration: 1 }, i - 1)
          .fromTo(s.querySelector('img'), { scale: 1.3, yPercent: 8 }, { scale: 1, yPercent: 0, ease: 'power2.out', duration: 1.2 }, i - 1)
          .to(prev.querySelector('img'), { scale: 0.92, yPercent: -6, ease: 'power2.inOut', duration: 1 }, i - 1)
          .to(prev.querySelectorAll('.cats__in'), { yPercent: -110, ease: 'power2.in', duration: 0.4 }, i - 1)
          .fromTo(inner, { yPercent: 110 }, { yPercent: 0, ease: 'expo.out', duration: 0.6, stagger: 0.08 }, i - 0.45)
          .fromTo(extras, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.05 }, i - 0.35)
      })
      tl.to({}, { duration: 0.3 })
      // first scene entrance
      gsap.fromTo(scenes[0].querySelectorAll('.cats__in'), { yPercent: 110 }, { yPercent: 0, duration: 1.4, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: root.value, start: 'top 60%' } })
    })
    // Mobile: vertical storytelling, each scene reveals on its own
    mm.add('(max-width: 760px)', () => {
      scenes.forEach(s => {
        gsap.set(s, { clipPath: 'none' })
        gsap.fromTo(s.querySelector('.cats__media'), { clipPath: 'inset(12% 8% 12% 8%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: s, start: 'top bottom', end: 'top 20%', scrub: true } })
        gsap.fromTo(s.querySelectorAll('.cats__in'), { yPercent: 110 }, { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: s, start: 'top 55%' } })
      })
    })
  })
  setTimeout(() => ScrollTrigger.refresh(), 400)
})
</script>

<style scoped>
.cats { position: relative; background: var(--black); }
.cats__pin { position: relative; height: 100vh; overflow: hidden; }
.cats__scene { position: absolute; inset: 0; clip-path: inset(100% 0 0 0); }
.cats__media { position: absolute; inset: 0; overflow: hidden; }
.cats__media img { width: 100%; height: 100%; transform-origin: 60% 50%; }
.cats__shade { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(10, 7, 5, 0.75) 0%, rgba(10, 7, 5, 0.3) 45%, transparent 70%); }
.cats__content { position: relative; height: 100%; display: flex; flex-direction: column; justify-content: center; max-width: 58vw; gap: 22px; }
.cats__idx { opacity: 0.8; }
.cats__h { font-size: clamp(60px, 9.6vw, 176px); }
.cats__line { display: block; overflow: hidden; padding-bottom: 0.04em; }
.cats__in { display: inline-block; }
.cats__intro { max-width: 38ch; font-size: var(--fs-lg); line-height: 1.5; opacity: 0.86; }
.cats__cta { align-self: flex-start; margin-top: 8px; }
.cats__counter { position: absolute; z-index: 10; right: var(--gutter); top: calc(var(--nav-h) + 20px); }
.cats__counter b { color: var(--gold); font-weight: 500; }
.cats__bar { position: absolute; z-index: 10; left: var(--gutter); right: var(--gutter); bottom: 34px; height: 1px; background: var(--line); }
.cats__bar i { display: block; height: 100%; background: var(--gold); transform-origin: left; transform: scaleX(0); }
@media (max-width: 760px) {
  .cats__pin { height: auto; }
  .cats__scene { position: relative; height: 100svh; clip-path: none; }
  .cats__content { max-width: none; justify-content: flex-end; padding-bottom: 60px; }
  .cats__shade { background: linear-gradient(0deg, rgba(10, 7, 5, 0.85) 0%, rgba(10, 7, 5, 0.25) 60%, transparent); }
  .cats__media img { object-position: 70% 50%; }
  .cats__counter, .cats__bar { display: none; }
}
</style>
