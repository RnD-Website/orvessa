<template>
  <button class="wish" :class="{ on: has(slug), dark }" :aria-pressed="has(slug)" :aria-label="has(slug) ? 'Remove from wishlist' : 'Save to wishlist'" @click.prevent.stop="pop">
    <svg ref="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.3-9.6C1.5 7.4 3.8 4 7.2 4c2 0 3.6 1.1 4.8 2.8C13.2 5.1 14.8 4 16.8 4c3.4 0 5.7 3.4 4.5 6.9-1.8 5-9.3 9.6-9.3 9.6z" /></svg>
    <span v-if="label" class="wish__label">{{ has(slug) ? 'Saved' : 'Wishlist' }}</span>
  </button>
</template>
<script setup>
import gsap from 'gsap'
const props = defineProps({ slug: String, label: Boolean, dark: Boolean })
const { has, toggle } = useWishlist()
const icon = ref(null)
function pop() {
  toggle(props.slug)
  gsap.fromTo(icon.value, { scale: 0.6 }, { scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.45)' })
}
</script>
<style scoped>
.wish { display: inline-flex; align-items: center; gap: 10px; }
.wish svg { width: 20px; height: 20px; fill: transparent; stroke: currentColor; stroke-width: 1.3; transition: fill 0.4s, stroke 0.4s; }
.wish.on svg { fill: var(--gold); stroke: var(--gold); }
.wish__label { font-size: 12px; font-weight: 500; letter-spacing: 0.16em; text-transform: uppercase; }
</style>
