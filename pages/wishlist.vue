<template>
  <div class="wl ivory">
    <div class="wrap">
      <header class="wl__head">
        <p class="t-paren">(Saved pieces)</p>
        <h1 class="wl__h"><span class="t-grotesk">Your</span> <span class="t-display">Wishlist</span></h1>
      </header>
      <div v-if="items.length" class="wl__actions">
        <span class="t-label">{{ items.length }} {{ items.length === 1 ? 'piece' : 'pieces' }}</span>
        <button class="btn btn--dark" @click="addAll">Add all to bag</button>
      </div>
      <ProductGrid v-if="items.length" :products="items" light />
      <div v-else class="wl__empty">
        <p class="t-lead">Tap the heart on any piece to keep it here.</p>
        <NuxtLink to="/collections" class="btn btn--dark">Explore the collections</NuxtLink>
      </div>
    </div>
  </div>
</template>
<script setup>
const { items } = useWishlist()
const { add } = useCart()
function addAll() { items.value.forEach((p, i) => add(p.slug, { metal: p.metals[0], size: p.sizes[1] || p.sizes[0] || '', openBag: i === items.value.length - 1 })) }
useHead({ title: 'Wishlist — ORVESSA' })
</script>
<style scoped>
.wl { min-height: 100vh; padding: calc(var(--nav-h) + 60px) 0 var(--section); }
.wl__head { margin-bottom: 40px; display: grid; gap: 14px; }
.wl__h { font-weight: 400; font-size: clamp(56px, 9vw, 160px); line-height: 0.86; }
.wl__h span { display: inline-block; }
.wl__actions { display: flex; justify-content: space-between; align-items: center; padding: 18px 0; border-top: 1px solid var(--line-dark); margin-bottom: 50px; }
.wl__empty { display: grid; gap: 26px; justify-items: start; padding: 40px 0; }
</style>
