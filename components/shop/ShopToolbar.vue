<template>
  <div class="bar">
    <div class="bar__cats" role="tablist" aria-label="Category">
      <NuxtLink v-for="c in cats" :key="c.slug" :to="c.to" class="bar__chip" :class="{ on: c.slug === category }" role="tab" :aria-selected="c.slug === category">{{ c.name }}</NuxtLink>
    </div>
    <div class="bar__right">
      <label class="bar__sel">
        <span class="t-eyebrow">Metal</span>
        <select :value="metal" @change="$emit('update:metal', $event.target.value)">
          <option value="all">All metals</option>
          <option v-for="m in METALS" :key="m.id" :value="m.id">{{ m.name }}</option>
        </select>
      </label>
      <label class="bar__sel">
        <span class="t-eyebrow">Sort</span>
        <select :value="sort" @change="$emit('update:sort', $event.target.value)">
          <option value="featured">Featured</option>
          <option value="price-asc">Price, low to high</option>
          <option value="price-desc">Price, high to low</option>
          <option value="name">Name</option>
        </select>
      </label>
      <span class="bar__count t-label">{{ count }} {{ count === 1 ? 'piece' : 'pieces' }}</span>
    </div>
  </div>
</template>
<script setup>
import { METALS, CATEGORIES } from '~/data/catalog'
defineProps({ category: { type: String, default: 'all' }, metal: String, sort: String, count: Number })
defineEmits(['update:metal', 'update:sort'])
const route = useRoute()
const cats = computed(() => [{ slug: 'all', name: 'All', to: { path: '/collections', query: route.query } }, ...CATEGORIES.map(c => ({ slug: c.slug, name: c.name, to: { path: `/collections/${c.slug}`, query: route.query } }))])
</script>
<style scoped>
.bar { display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap; padding: 22px 0; border-top: 1px solid var(--line-dark); border-bottom: 1px solid var(--line-dark); margin-bottom: clamp(36px, 5vw, 70px); }
.bar__cats { display: flex; gap: 8px; flex-wrap: wrap; }
.bar__chip { height: 38px; padding: 0 16px; display: inline-flex; align-items: center; border-radius: 40px; border: 1px solid var(--line-dark); font-size: 12px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; transition: all 0.4s var(--ease-out); }
.bar__chip.on, .bar__chip:hover { background: var(--black); color: var(--ivory); border-color: var(--black); }
.bar__right { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }
.bar__sel { display: flex; align-items: center; gap: 10px; }
.bar__sel select { background: none; border: 0; border-bottom: 1px solid var(--line-dark); padding: 6px 4px; font-size: 13px; outline: none; }
.bar__count { opacity: 0.6; }
</style>
