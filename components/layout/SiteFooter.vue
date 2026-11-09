<template>
  <footer class="foot grain">
    <div class="foot__top wrap">
      <div class="foot__news">
        <p class="t-paren">(The private list)</p>
        <h3 class="t-display t-h3">Be the first<br>to see new pieces</h3>
        <NewsletterForm />
      </div>
      <div class="foot__cols">
        <div>
          <p class="t-eyebrow">Collections</p>
          <NuxtLink v-for="c in CATEGORIES" :key="c.slug" :to="`/collections/${c.slug}`" class="u-link">{{ c.name }}</NuxtLink>
          <NuxtLink to="/collections" class="u-link">All jewelry</NuxtLink>
        </div>
        <div>
          <p class="t-eyebrow">The Maison</p>
          <NuxtLink to="/about" class="u-link">Our story</NuxtLink>
          <NuxtLink to="/craftsmanship" class="u-link">Craftsmanship</NuxtLink>
          <a :href="CONTACT.instagram" target="_blank" rel="noopener" class="u-link">Instagram</a>
        </div>
        <div>
          <p class="t-eyebrow">Client care</p>
          <a :href="`mailto:${CONTACT.email}`" class="u-link">{{ CONTACT.email }}</a>
          <a :href="`tel:${CONTACT.phone.replace(/\s/g, '')}`" class="u-link">{{ CONTACT.phone }}</a>
          <span>{{ CONTACT.hours }}</span>
          <NuxtLink to="/account" class="u-link">My account</NuxtLink>
        </div>
        <div>
          <p class="t-eyebrow">Boutique</p>
          <span>{{ CONTACT.address }}</span>
          <span>Complimentary insured delivery</span>
          <span>30-day returns · Lifetime care</span>
        </div>
      </div>
    </div>
    <div class="foot__mark wrap" aria-hidden="true">ORVESSA</div>
    <div class="foot__base wrap">
      <span>© {{ year }} ORVESSA. The Art of Timeless Beauty.</span>
      <span>Demo storefront — frontend only, no real orders are placed.</span>
    </div>
  </footer>
</template>
<script setup>
import { CATEGORIES } from '~/data/catalog'
import { CONTACT } from '~/data/site'
const year = new Date().getFullYear()
</script>
<style scoped>
.foot { position: relative; overflow: hidden; background: var(--black); color: var(--ink); padding-top: var(--section); }
.foot__top { display: grid; grid-template-columns: 1fr 1.4fr; gap: clamp(40px, 8vw, 140px); }
.foot__news { display: grid; gap: 28px; align-content: start; }
.foot__cols { display: grid; grid-template-columns: repeat(4, 1fr); gap: 28px; font-size: 14px; }
.foot__cols div { display: flex; flex-direction: column; gap: 10px; align-items: flex-start; opacity: 0.86; }
.foot__cols .t-eyebrow { color: var(--gold); margin-bottom: 8px; opacity: 1; }
.foot__mark { font-family: var(--serif); font-size: 22.5vw; line-height: 0.8; letter-spacing: 0.02em; text-align: center; margin-top: clamp(60px, 10vw, 160px); color: rgba(198, 164, 106, 0.12); white-space: nowrap; }
.foot__base { display: flex; justify-content: space-between; gap: 20px; padding-top: 24px; padding-bottom: 28px; border-top: 1px solid var(--line); font-size: 12px; opacity: 0.6; flex-wrap: wrap; }
@media (max-width: 1000px) {
  .foot__top { grid-template-columns: 1fr; }
  .foot__cols { grid-template-columns: repeat(2, 1fr); }
}
</style>
