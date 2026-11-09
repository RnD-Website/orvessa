<template>
  <header class="nav" :class="{ 'is-hidden': hidden, 'is-solid': solid, 'is-light': lightPage }">
    <NuxtLink to="/" class="nav__logo" aria-label="ORVESSA home">ORVESSA</NuxtLink>

    <nav class="nav__links" aria-label="Primary">
      <NuxtLink v-for="l in NAV" :key="l.to" :to="l.to" class="u-link" :class="{ 'is-active': isActive(l.to) }">{{ l.label }}</NuxtLink>
    </nav>

    <div class="nav__util">
      <button class="nav__btn u-link" @click="open('search')">Search</button>
      <NuxtLink to="/account" class="nav__btn u-link hide-sm">Account</NuxtLink>
      <NuxtLink to="/wishlist" class="nav__btn u-link hide-sm">Wishlist<sup v-if="wishCount">{{ wishCount }}</sup></NuxtLink>
      <button class="nav__bag" @click="open('bag')">Bag <span>({{ count }})</span></button>
      <button class="nav__menu" :aria-expanded="menuOpen" aria-label="Open menu" @click="open('menu')">
        <span /><span />
      </button>
    </div>
  </header>
</template>

<script setup>
import { NAV } from '~/data/site'
const route = useRoute()
const { open, menuOpen } = useUi()
const { count } = useCart()
const { count: wishCount } = useWishlist()

const hidden = ref(false)
const solid = ref(false)
// pages with an ivory top get dark navigation text
const lightPage = computed(() => ['/wishlist', '/account', '/checkout'].includes(route.path))
const isActive = (to) => (to === '/' ? route.path === '/' : route.path.startsWith(to))

let last = 0
function onScroll() {
  const y = window.scrollY
  // on the home page the nav floats over the whole Maison journey
  const maison = document.querySelector('.maison')
  const heroEnd = maison ? maison.offsetHeight - window.innerHeight : window.innerHeight * 0.6
  solid.value = y > heroEnd
  hidden.value = y > last && y > Math.max(240, heroEnd)
  last = y
}
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
watch(() => route.fullPath, () => { hidden.value = false })
</script>

<style scoped>
.nav {
  position: fixed; inset: 0 0 auto; z-index: var(--z-nav);
  height: var(--nav-h); padding: 0 var(--gutter);
  display: grid; grid-template-columns: 1fr auto 1fr; align-items: center;
  color: var(--ink);
  transition: transform 0.8s var(--ease-out), background 0.6s var(--ease-out), color 0.4s;
}
.nav.is-hidden { transform: translateY(-100%); }
.nav.is-solid { background: rgba(26, 19, 13, 0.92); }
.nav.is-light:not(.is-solid) { color: var(--ink-dark); }
.nav__logo { font-family: var(--serif); font-size: clamp(26px, 2.4vw, 38px); letter-spacing: 0.16em; line-height: 1; justify-self: start; }
.nav__links { display: flex; gap: clamp(28px, 4vw, 64px); font-size: 14px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; }
.nav__util { justify-self: end; display: flex; align-items: center; gap: 24px; font-size: 12px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; }
.nav__btn sup { font-size: 9px; margin-left: 2px; color: var(--gold); }
.nav__bag { white-space: nowrap; height: 36px; padding: 0 16px; border-radius: 40px; background: var(--ink); color: var(--black); font-size: 12px; letter-spacing: 0.08em; transition: background 0.3s; }
.nav__bag:hover { background: var(--gold); }
.is-light:not(.is-solid) .nav__bag { background: var(--black); color: var(--ivory); }
.nav__menu { width: 36px; height: 36px; display: flex; flex-direction: column; justify-content: center; gap: 7px; }
.nav__menu span { display: block; height: 1px; background: currentColor; }
.nav__menu span:last-child { width: 60%; margin-left: auto; }
@media (max-width: 1320px) {
  .nav { grid-template-columns: 1fr auto; }
  .nav__links { display: none; }
  .nav__menu { display: flex; }
}
@media (max-width: 760px) {
  .hide-sm { display: none; }
  .nav__util { gap: 16px; }
}
</style>
