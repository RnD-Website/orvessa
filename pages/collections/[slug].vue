<template>
  <div v-if="category" class="cat">
    <header class="cat__hero grain">
      <div ref="media" class="cat__media"><img :src="category.image" :alt="category.name"></div>
      <div class="cat__in wrap">
        <p class="t-paren">({{ category.index }} — {{ category.name }})</p>
        <h1 ref="h" class="t-display cat__h">{{ category.headline }}</h1>
        <p class="cat__lead">{{ category.intro }}</p>
      </div>
    </header>
    <section class="cat__body ivory">
      <div class="wrap">
        <ShopToolbar v-model:metal="metal" v-model:sort="sort" :category="category.slug" :count="products.length" />
        <ProductGrid :products="products" light>
          <template #empty><NuxtLink :to="`/collections/${category.slug}`" class="btn btn--dark">Reset filters</NuxtLink></template>
        </ProductGrid>
      </div>
    </section>
  </div>
</template>
<script setup>
import { getCategory } from '~/services/commerce'
const route = useRoute()
const category = computed(() => getCategory(route.params.slug))
if (!category.value) throw createError({ statusCode: 404, statusMessage: 'Collection not found', fatal: true })
const { metal, sort, products } = useListing(computed(() => route.params.slug))
const h = ref(null), media = ref(null)
const { charsIn, gsap } = useAnimations()
onMounted(() => {
  charsIn(h.value, { trigger: false, delay: 0.5 })
  gsap.fromTo(media.value.querySelector('img'), { scale: 1.2 }, { scale: 1, duration: 2.4, ease: 'expo.out', delay: 0.3 })
})
useHead(() => ({ title: `${category.value?.name} — ORVESSA` }))
</script>
<style scoped>
.cat__hero { position: relative; height: 86vh; min-height: 560px; overflow: hidden; display: flex; align-items: center; background: var(--black); }
.cat__media { position: absolute; inset: 0; }
.cat__media img { width: 100%; height: 100%; object-position: 70% 50%; }
.cat__hero::before { content: ''; position: absolute; inset: 0; z-index: 1; background: linear-gradient(90deg, rgba(10, 7, 5, 0.8), transparent 65%); }
.cat__in { position: relative; z-index: 2; display: grid; gap: 22px; max-width: 64vw; }
.cat__h { font-size: clamp(60px, 9.6vw, 176px); }
.cat__lead { max-width: 38ch; font-size: var(--fs-lg); opacity: 0.86; }
.cat__body { padding: clamp(40px, 6vw, 80px) 0 var(--section); }
@media (max-width: 760px) { .cat__in { max-width: none; } }
</style>
