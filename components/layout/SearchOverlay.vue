<template>
  <div class="search" :class="{ 'is-open': searchOpen }" :aria-hidden="!searchOpen" role="dialog" aria-label="Search">
    <div class="search__inner wrap">
      <div class="search__top">
        <span class="t-paren">(Search the Maison)</span>
        <button class="t-label" @click="searchOpen = false">Close ×</button>
      </div>
      <form class="search__form" role="search" @submit.prevent="submit">
        <input ref="input" v-model="q" type="search" placeholder="Diamond, collar, pendant…" aria-label="Search products" autocomplete="off">
        <button type="submit" class="btn btn--gold">Search</button>
      </form>
      <div v-if="!q" class="search__chips">
        <button v-for="s in suggestions" :key="s" class="search__chip" @click="q = s">{{ s }}</button>
      </div>
      <p v-else-if="!results.length" class="search__none t-lead">No pieces match “{{ q }}”. Try “gold” or “diamond”.</p>
      <ul v-else class="search__results" data-lenis-prevent>
        <li v-for="p in results" :key="p.slug">
          <NuxtLink :to="`/products/${p.slug}`" class="search__res" @click="searchOpen = false">
            <img :src="productImages(p)[0]" :alt="p.name">
            <span class="search__name">{{ p.name }}</span>
            <span class="search__price">{{ formatPrice(p.price) }}</span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { searchSync } from '~/services/commerce'
import { productImages } from '~/data/catalog'
const { searchOpen } = useUi()
const router = useRouter()
const q = ref('')
const input = ref(null)
const suggestions = ['Diamond', 'Gold collar', 'Pendant', 'Chain', 'Rivière', 'White gold']
const results = computed(() => searchSync(q.value))
watch(searchOpen, v => { if (v) nextTick(() => setTimeout(() => input.value?.focus(), 300)) })
function submit() { searchOpen.value = false; router.push({ path: '/collections', query: q.value ? { q: q.value } : {} }) }
</script>

<style scoped>
.search { position: fixed; inset: 0; z-index: var(--z-drawer); background: var(--espresso); color: var(--ink); clip-path: inset(0 0 100% 0); transition: clip-path 1s var(--ease-in-out); }
.search.is-open { clip-path: inset(0 0 0 0); }
.search__inner { padding-top: 40px; padding-bottom: 40px; height: 100%; display: flex; flex-direction: column; }
.search__top { display: flex; justify-content: space-between; align-items: center; }
.search__form { display: flex; gap: 20px; align-items: center; margin: 9vh 0 40px; border-bottom: 1px solid var(--line); padding-bottom: 18px; }
.search__form input { flex: 1; background: none; border: 0; outline: none; font-family: var(--serif); font-size: clamp(40px, 7vw, 110px); text-transform: uppercase; color: var(--ink); line-height: 1; }
.search__form input::placeholder { color: rgba(242, 236, 225, 0.25); }
.search__chips { display: flex; flex-wrap: wrap; gap: 12px; }
.search__chip { padding: 12px 22px; border: 1px solid var(--line); border-radius: 40px; font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase; transition: border-color 0.3s, color 0.3s; }
.search__chip:hover { border-color: var(--gold); color: var(--gold); }
.search__results { list-style: none; display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 24px; overflow-y: auto; }
.search__res { display: grid; gap: 10px; }
.search__res img { aspect-ratio: 4/5; width: 100%; }
.search__name { font-family: var(--serif); font-size: 24px; text-transform: uppercase; line-height: 1; }
.search__price { font-size: 13px; opacity: 0.7; }
@media (max-width: 600px) { .search__form .btn { display: none; } }
</style>
