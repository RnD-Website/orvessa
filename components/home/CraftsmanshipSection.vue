<template>
  <section ref="root" class="craft grain" id="craftsmanship">
    <div class="craft__head wrap">
      <p class="t-paren">(The Atelier)</p>
      <h2 class="craft__h">
        <span ref="h1" class="t-grotesk craft__l1">Crafted with purpose.</span>
        <span ref="h2" class="t-display craft__l2">Designed to last.</span>
      </h2>
    </div>

    <!-- One card at a time: scrolling (or clicking a step) reveals the next -->
    <div ref="pin" class="craft__pin">
      <div class="craft__body wrap">
        <div class="craft__steps">
          <ol>
            <li v-for="(s, i) in STEPS" :key="s.title" :class="{ on: i === active }" @click="go(i)">
              <span class="t-paren">({{ String(i + 1).padStart(2, '0') }})</span>
              <div>
                <h3 class="t-display">{{ s.title }}</h3>
                <p>{{ s.text }}</p>
              </div>
            </li>
          </ol>
          <div class="craft__nav">
            <button class="craft__arrow" :disabled="active === 0" aria-label="Previous step" @click="go(active - 1)">←</button>
            <span class="t-label">{{ String(active + 1).padStart(2, '0') }} / {{ String(STEPS.length).padStart(2, '0') }}</span>
            <button class="craft__arrow" :disabled="active === STEPS.length - 1" aria-label="Next step" @click="go(active + 1)">→</button>
            <NuxtLink v-if="link" to="/craftsmanship" class="btn btn--ghost craft__cta">Inside the atelier</NuxtLink>
          </div>
        </div>

        <div class="craft__media">
          <div class="craft__frame">
            <figure v-for="(s, i) in STEPS" :key="s.img" :ref="el => (figs[i] = el)" class="craft__card" :class="{ on: i === active }" :aria-hidden="i !== active">
              <img :src="s.img" :alt="s.alt" loading="lazy">
            </figure>
          </div>
          <p class="craft__cap t-paren">({{ STEPS[active].caption }})</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({ link: { type: Boolean, default: true } })
const STEPS = [
  { title: 'The Gold', text: 'We alloy our own 18k gold from recycled, traceable bullion — yellow, white and rose — then roll and draw it into wire by hand.', img: '/images/craft/gold.webp', alt: 'Bars of 18k gold in the atelier', caption: 'Recycled 18k bullion' },
  { title: 'The Setting', text: 'Each diamond is chosen under the loupe and set in an open collet so light enters from every side. A rivière can take three weeks.', img: '/images/craft/setting.webp', alt: 'Macro of graduated diamonds set in collets', caption: 'Open collets, set by hand' },
  { title: 'The Chain', text: 'Ropes are twisted from three strands; cable links are formed, soldered and closed one at a time, so the chain falls like silk.', img: '/images/craft/chain.webp', alt: 'Hand-twisted gold rope chain', caption: 'Three strands, twisted by hand' },
  { title: 'The Polish', text: 'Finally every surface is polished in four stages, from felt to rouge, until the gold holds a mirror without a single mark.', img: '/images/craft/polish.webp', alt: 'Polished oversized gold chain links', caption: 'Four-stage mirror polish' }
]
const root = ref(null), pin = ref(null), h1 = ref(null), h2 = ref(null)
const figs = []
const active = ref(0)
const { charsIn, add, gsap } = useAnimations()
const { scrollTo } = useSmoothScroll()
let st = null

/* card transition: the new card wipes up over the current one */
watch(active, (i, prev) => {
  const inc = figs[i], out = figs[prev]
  if (!inc || !out) return
  const down = i > prev
  gsap.killTweensOf([inc, out, inc.querySelector('img'), out.querySelector('img')])
  gsap.set(inc, { zIndex: 2 }); gsap.set(out, { zIndex: 1 })
  gsap.fromTo(inc, { clipPath: down ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'expo.inOut' })
  gsap.fromTo(inc.querySelector('img'), { scale: 1.25 }, { scale: 1, duration: 1.5, ease: 'expo.out' })
  gsap.to(out.querySelector('img'), { scale: 0.92, duration: 1.1, ease: 'expo.inOut' })
})

function go(i) {
  i = Math.max(0, Math.min(STEPS.length - 1, i))
  if (st) {
    // desktop: scroll to the point in the pinned range that shows step i
    scrollTo(st.start + ((i + 0.5) / STEPS.length) * (st.end - st.start), { duration: 1.2 })
  } else active.value = i
}

onMounted(() => {
  charsIn(h1.value)
  charsIn(h2.value, { delay: 0.15, trigger: h1.value })
  figs.forEach((f, i) => gsap.set(f, { clipPath: i === 0 ? 'inset(0% 0% 0% 0%)' : 'inset(100% 0% 0% 0%)', zIndex: i === 0 ? 2 : 0 }))
  const mm = gsap.matchMedia()
  add(() => {
    mm.add('(min-width: 901px)', () => {
      st = gsap.timeline({
        scrollTrigger: {
          trigger: pin.value, start: 'top top', end: () => `+=${window.innerHeight * (STEPS.length - 0.4)}`,
          pin: true, anticipatePin: 1,
          onUpdate: (s) => { const i = Math.min(STEPS.length - 1, Math.floor(s.progress * STEPS.length)); if (i !== active.value) active.value = i }
        }
      }).scrollTrigger
      return () => { st = null }
    })
  })
})
</script>

<style scoped>
.craft { position: relative; overflow: hidden; background: var(--umber); color: var(--ink); padding: var(--section) 0 0; }
.craft__head { margin-bottom: clamp(40px, 6vw, 80px); }
.craft__h { display: flex; flex-direction: column; font-weight: 400; margin-top: 16px; }
.craft__l1 { font-size: clamp(42px, 7vw, 128px); }
.craft__l2 { font-size: clamp(54px, 9.6vw, 176px); color: var(--gold); }
.craft__pin { min-height: 100vh; display: flex; align-items: center; padding: calc(var(--nav-h) + 10px) 0 40px; }
.craft__body { width: 100%; display: grid; grid-template-columns: 0.9fr 1.1fr; gap: clamp(30px, 6vw, 110px); align-items: center; }
.craft__steps { display: grid; gap: 30px; }
.craft__steps ol { list-style: none; display: grid; gap: 4px; }
.craft__steps li { display: grid; grid-template-columns: 56px 1fr; gap: 12px; padding: 20px 0; border-top: 1px solid var(--line); opacity: 0.38; transition: opacity 0.6s var(--ease-out); cursor: pointer; }
.craft__steps li.on { opacity: 1; }
.craft__steps h3 { font-size: clamp(32px, 3vw, 52px); }
.craft__steps p { max-height: 0; overflow: hidden; opacity: 0; transition: max-height 0.8s var(--ease-out), opacity 0.6s, margin 0.6s; font-size: 15px; line-height: 1.65; max-width: 44ch; }
.craft__steps li.on p { max-height: 160px; opacity: 0.85; margin-top: 10px; }
.craft__nav { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.craft__arrow { width: 52px; height: 52px; border-radius: 50%; border: 1px solid var(--line); font-size: 18px; transition: background 0.4s, color 0.4s, border-color 0.4s; }
.craft__arrow:hover:not(:disabled) { background: var(--gold); color: var(--black); border-color: var(--gold); }
.craft__arrow:disabled { opacity: 0.3; }
.craft__cta { margin-left: auto; color: var(--ink); }
.craft__frame { position: relative; aspect-ratio: 1; width: min(100%, 74vh); margin-left: auto; overflow: hidden; background: var(--espresso); }
.craft__card { position: absolute; inset: 0; margin: 0; }
.craft__card img { width: 100%; height: 100%; }
.craft__cap { margin-top: 14px; opacity: 0.6; text-align: right; }
@media (max-width: 900px) {
  .craft { padding-bottom: var(--section); }
  .craft__pin { min-height: 0; padding: 0; }
  .craft__body { grid-template-columns: 1fr; }
  .craft__media { order: -1; }
  .craft__frame { width: 100%; }
  .craft__cap { text-align: left; }
  .craft__cta { margin-left: 0; }
}
</style>
