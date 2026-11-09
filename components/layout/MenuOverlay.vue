<template>
  <div ref="root" class="menu" :class="{ 'is-open': menuOpen }" :aria-hidden="!menuOpen" role="dialog" aria-label="Menu">
    <div class="menu__bg" />
    <div class="menu__inner">
      <div class="menu__top">
        <span class="menu__logo">ORVESSA</span>
        <button class="menu__close t-label" @click="menuOpen = false">Close <i>×</i></button>
      </div>
      <nav class="menu__list">
        <NuxtLink v-for="m in MENU" :key="m.to" :to="m.to" class="menu__item" @mouseenter="hover = m.index" @click="menuOpen = false">
          <span class="menu__idx t-paren">({{ m.index }})</span>
          <span class="menu__label t-display">{{ m.label }}</span>
        </NuxtLink>
      </nav>
      <div class="menu__foot">
        <div>
          <p class="t-eyebrow">Concierge</p>
          <a :href="`mailto:${CONTACT.email}`" class="u-link">{{ CONTACT.email }}</a>
          <span>{{ CONTACT.phone }}</span>
        </div>
        <div>
          <p class="t-eyebrow">Shop</p>
          <NuxtLink v-for="c in CATEGORIES" :key="c.slug" :to="`/collections/${c.slug}`" class="u-link" @click="menuOpen = false">{{ c.name }}</NuxtLink>
        </div>
      </div>
    </div>
    <div class="menu__media">
      <div class="menu__img"><img src="/images/scenes/menu.webp" alt="Solenne gold collar on a velvet bust"></div>
      <p class="menu__caption t-paren">(Solenne — Gold Collar)</p>
    </div>
  </div>
</template>

<script setup>
import gsap from 'gsap'
import { MENU, CONTACT } from '~/data/site'
import { CATEGORIES } from '~/data/catalog'
const { menuOpen } = useUi()
const { stop, start } = useSmoothScroll()
const root = ref(null)
const hover = ref(null)

watch(menuOpen, (open) => {
  const el = root.value
  if (!el) return
  const labels = el.querySelectorAll('.menu__label')
  const img = el.querySelector('.menu__img')
  if (open) {
    stop()
    gsap.timeline()
      .set(el, { visibility: 'visible' })
      .fromTo(el.querySelector('.menu__bg'), { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1, ease: 'expo.inOut' })
      .fromTo(img, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.3, ease: 'expo.inOut' }, 0.25)
      .fromTo(img.querySelector('img'), { scale: 1.35 }, { scale: 1, duration: 1.8, ease: 'expo.out' }, 0.25)
      .fromTo(labels, { yPercent: 110 }, { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.06 }, 0.5)
      .fromTo(el.querySelectorAll('.menu__idx, .menu__foot, .menu__top, .menu__caption'), { opacity: 0 }, { opacity: 1, duration: 0.8, stagger: 0.04 }, 0.7)
  } else {
    gsap.timeline({ onComplete: () => { gsap.set(el, { visibility: 'hidden' }); start() } })
      .to(labels, { yPercent: -110, duration: 0.6, ease: 'power3.in', stagger: 0.03 })
      .to(el.querySelector('.menu__bg'), { clipPath: 'inset(100% 0 0% 0)', duration: 0.9, ease: 'expo.inOut' }, 0.2)
      .to(img, { clipPath: 'inset(0 0 100% 0)', duration: 0.8, ease: 'expo.inOut' }, 0.1)
      .to(el.querySelectorAll('.menu__idx, .menu__foot, .menu__top, .menu__caption'), { opacity: 0, duration: 0.3 }, 0)
  }
})
const route = useRoute()
watch(() => route.fullPath, () => { menuOpen.value = false })
onMounted(() => { root.value.style.visibility = 'hidden' })
</script>

<style scoped>
.menu { position: fixed; inset: 0; z-index: var(--z-menu); display: grid; grid-template-columns: 1.3fr 1fr; color: var(--ink); }
.menu__bg { position: absolute; inset: 0; background: var(--espresso); }
.menu__inner { position: relative; display: flex; flex-direction: column; padding: 32px var(--gutter) 40px; }
.menu__top { display: flex; justify-content: space-between; align-items: center; height: calc(var(--nav-h) - 32px); }
.menu__logo { font-family: var(--serif); font-size: 32px; letter-spacing: 0.16em; }
.menu__close i { font-style: normal; font-size: 20px; margin-left: 8px; vertical-align: -2px; }
.menu__list { margin: auto 0; display: flex; flex-direction: column; gap: 6px; }
.menu__item { display: flex; align-items: flex-start; gap: 18px; overflow: hidden; width: fit-content; }
.menu__idx { padding-top: 0.7em; opacity: 0.6; }
.menu__label { display: block; font-size: clamp(54px, 7.4vw, 124px); transition: color 0.5s var(--ease-out), transform 0.7s var(--ease-out); }
.menu__item:hover .menu__label { color: var(--gold); transform: translateX(18px); }
.menu__foot { display: flex; gap: clamp(32px, 6vw, 90px); font-size: 14px; }
.menu__foot div { display: flex; flex-direction: column; gap: 6px; }
.menu__foot .t-eyebrow { color: var(--gold); margin-bottom: 6px; }
.menu__media { position: relative; padding: 32px var(--gutter) 40px 0; display: flex; flex-direction: column; justify-content: center; }
.menu__img { height: 76vh; overflow: hidden; }
.menu__img img { width: 100%; height: 100%; }
.menu__caption { margin-top: 14px; opacity: 0.7; }
@media (max-width: 900px) {
  .menu { grid-template-columns: 1fr; }
  .menu__media { display: none; }
}
</style>
