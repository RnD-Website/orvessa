<template>
  <div class="shop">
    <header class="shop__hero grain">
      <img class="shop__bg" src="/images/scenes/cat-gold.webp" alt="">
      <div class="shop__hero-in wrap">
        <p class="t-paren">(Necklaces · High jewelry)</p>
        <h1 class="shop__h"><span ref="h1" class="t-grotesk">The</span> <span ref="h2" class="t-display">Collections</span></h1>
        <p class="shop__lead">Gold and diamond necklaces made by hand in Milan — from everyday chains to once-in-a-lifetime rivières.</p>
      </div>
    </header>
    <section class="shop__body ivory">
      <div class="wrap">
        <p v-if="query" class="shop__q t-label">Results for “{{ query }}” <NuxtLink :to="{ query: { ...$route.query, q: undefined } }" class="u-link">Clear</NuxtLink></p>
        <ShopToolbar v-model:metal="metal" v-model:sort="sort" :count="products.length" />
        <ProductGrid :products="products" light>
          <template #empty><NuxtLink to="/collections" class="btn btn--dark">Reset filters</NuxtLink></template>
        </ProductGrid>
      </div>
    </section>
  </div>
</template>
<script setup>
const { metal, sort, query, products } = useListing(ref('all'))
const h1 = ref(null), h2 = ref(null)
const { charsIn } = useAnimations()
onMounted(() => { charsIn(h1.value, { trigger: false, delay: 0.5 }); charsIn(h2.value, { trigger: false, delay: 0.62 }) })
useHead({ title: 'Collections — ORVESSA' })
</script>
<style scoped>
.shop__hero { position: relative; height: 78vh; min-height: 520px; overflow: hidden; display: flex; align-items: flex-end; background: var(--black); }
.shop__bg { position: absolute; inset: 0; width: 100%; height: 100%; object-position: 70% 50%; opacity: 0.9; }
.shop__hero::before { content: ''; position: absolute; inset: 0; z-index: 1; background: linear-gradient(90deg, rgba(10, 7, 5, 0.75), transparent 65%); }
.shop__hero-in { position: relative; z-index: 2; padding-bottom: clamp(40px, 8vh, 90px); display: grid; gap: 20px; }
.shop__h { font-weight: 400; font-size: clamp(60px, 11vw, 200px); line-height: 0.86; }
.shop__h span { display: inline-block; }
.shop__lead { max-width: 40ch; font-size: var(--fs-lg); opacity: 0.86; }
.shop__body { padding: clamp(40px, 6vw, 80px) 0 var(--section); }
.shop__q { margin-bottom: 18px; display: flex; gap: 16px; }
</style>
