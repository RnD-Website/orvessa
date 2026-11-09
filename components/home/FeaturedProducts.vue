<template>
  <section ref="root" class="feat ivory">
    <div class="wrap">
      <header class="feat__head">
        <div>
          <p class="t-paren">(The ORVESSA edit)</p>
          <h2 class="feat__h"><span ref="h1" class="t-grotesk">Pieces to</span> <span ref="h2" class="t-display">keep forever</span></h2>
        </div>
        <div class="feat__filters" role="tablist" aria-label="Filter by category">
          <button v-for="f in filters" :key="f.slug" role="tab" :aria-selected="filter === f.slug" class="feat__chip" :class="{ on: filter === f.slug }" @click="filter = f.slug">{{ f.name }}</button>
        </div>
      </header>
      <ProductGrid :products="shown" light />
      <div class="feat__foot"><NuxtLink to="/collections" class="btn btn--dark">View all jewelry</NuxtLink></div>
    </div>
  </section>
</template>

<script setup>
import { PRODUCTS, CATEGORIES } from '~/data/catalog'
const filters = [{ slug: 'all', name: 'All' }, ...CATEGORIES.map(c => ({ slug: c.slug, name: c.name }))]
const filter = ref('all')
const shown = computed(() => PRODUCTS.filter(p => p.featured && (filter.value === 'all' || p.category === filter.value)).slice(0, 6))
const root = ref(null), h1 = ref(null), h2 = ref(null)
const { charsIn, fadeUp } = useAnimations()
onMounted(() => {
  charsIn(h1.value); charsIn(h2.value, { delay: 0.12, trigger: h1.value })
  fadeUp(root.value.querySelectorAll('.card'), { trigger: root.value.querySelector('.pgrid'), stagger: 0.1 })
})
</script>

<style scoped>
.feat { padding: var(--section) 0; }
.feat__head { display: flex; justify-content: space-between; align-items: flex-end; gap: 30px; margin-bottom: clamp(40px, 6vw, 90px); flex-wrap: wrap; }
.feat__h { font-weight: 400; font-size: clamp(44px, 6.4vw, 116px); line-height: 0.86; margin-top: 14px; }
.feat__h span { display: inline-block; }
.feat__filters { display: flex; gap: 8px; flex-wrap: wrap; }
.feat__chip { height: 40px; padding: 0 18px; border-radius: 40px; border: 1px solid var(--line-dark); font-size: 12px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; transition: all 0.4s var(--ease-out); }
.feat__chip.on, .feat__chip:hover { background: var(--black); color: var(--ivory); border-color: var(--black); }
.feat__foot { display: flex; justify-content: center; margin-top: clamp(50px, 6vw, 90px); }
</style>
