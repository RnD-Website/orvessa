<template>
  <div class="grid-wrap">
    <TransitionGroup v-if="products.length" tag="div" name="grid" class="pgrid" :class="{ 'pgrid--light': light }">
      <ProductCard v-for="p in products" :key="p.slug" :product="p" :light="light" />
    </TransitionGroup>
    <div v-else class="pgrid__empty">
      <p class="t-lead">No pieces match these filters.</p>
      <slot name="empty" />
    </div>
  </div>
</template>
<script setup>
defineProps({ products: Array, light: Boolean })
</script>
<style scoped>
.pgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); gap: clamp(36px, 4vw, 64px) clamp(18px, 2.4vw, 36px); }
.pgrid__empty { padding: 80px 0; display: grid; gap: 20px; justify-items: start; }
.grid-move, .grid-enter-active, .grid-leave-active { transition: all 0.8s var(--ease-out); }
.grid-enter-from, .grid-leave-to { opacity: 0; transform: translateY(30px); }
.grid-leave-active { position: absolute; }
</style>
