<template>
  <article class="card" :class="{ 'card--light': light }">
    <NuxtLink :to="`/products/${product.slug}`" class="card__media" data-cursor="view" :aria-label="product.name">
      <img class="card__img card__img--a" :src="imgs[0]" :alt="product.name" loading="lazy">
      <img class="card__img card__img--b" :src="imgs[1]" alt="" loading="lazy" aria-hidden="true">
      <span v-if="product.signature" class="card__tag t-eyebrow">Signature</span>
    </NuxtLink>
    <WishlistButton class="card__wish" :slug="product.slug" />
    <div class="card__body">
      <p class="card__cat t-eyebrow">{{ categoryName }}</p>
      <NuxtLink :to="`/products/${product.slug}`" class="card__name">{{ product.name }}</NuxtLink>
      <div class="card__row">
        <span class="card__price">{{ formatPrice(product.price) }}</span>
        <span class="card__metals" :aria-label="`Available in ${product.metals.map(metalName).join(', ')}`">
          <button
            v-for="m in product.metals" :key="m" class="card__swatch" :class="{ on: m === metal }"
            :style="{ background: METALS.find(x => x.id === m).swatch }" :title="metalName(m)" :aria-label="metalName(m)"
            @click="metal = m"
          />
        </span>
      </div>
      <p class="card__material">{{ metalName(metal) }}</p>
    </div>
  </article>
</template>

<script setup>
import { METALS, CATEGORIES, productImages, metalName } from '~/data/catalog'
const props = defineProps({ product: Object, light: Boolean })
const metal = ref(props.product.metals[0])
const imgs = computed(() => productImages(props.product, metal.value))
const categoryName = computed(() => CATEGORIES.find(c => c.slug === props.product.category)?.name)
</script>

<style scoped>
.card { position: relative; display: flex; flex-direction: column; gap: 18px; }
.card__media { position: relative; display: block; aspect-ratio: 4 / 5; overflow: hidden; background: var(--sand); }
.card__img { position: absolute; inset: 0; width: 100%; height: 100%; transition: opacity 0.9s var(--ease-out), transform 1.4s var(--ease-out); }
.card__img--b { opacity: 0; transform: scale(1.08); }
.card__media:hover .card__img--a { opacity: 0; transform: scale(1.06); }
.card__media:hover .card__img--b { opacity: 1; transform: scale(1); }
.card__tag { position: absolute; left: 16px; top: 16px; color: var(--ink-dark); background: rgba(245, 241, 233, 0.85); padding: 7px 12px; border-radius: 30px; }
.card__wish { position: absolute; right: 14px; top: 14px; width: 40px; height: 40px; justify-content: center; border-radius: 50%; background: rgba(245, 241, 233, 0.85); color: var(--ink-dark); }
.card__body { display: grid; gap: 6px; }
.card__cat { opacity: 0.6; }
.card__name { font-family: var(--serif); font-size: clamp(26px, 2.2vw, 34px); line-height: 0.95; text-transform: uppercase; }
.card__row { display: flex; justify-content: space-between; align-items: center; margin-top: 6px; }
.card__price { font-size: 15px; }
.card__metals { display: flex; gap: 8px; }
.card__swatch { width: 14px; height: 14px; border-radius: 50%; box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.15); outline: 1px solid transparent; outline-offset: 3px; transition: outline-color 0.3s; }
.card__swatch.on { outline-color: currentColor; }
.card__material { font-size: 12px; opacity: 0.6; letter-spacing: 0.04em; }
</style>
