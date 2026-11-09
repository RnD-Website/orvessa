<template>
  <div class="bag" :class="{ 'is-open': bagOpen }" :aria-hidden="!bagOpen">
    <div class="bag__shade" @click="bagOpen = false" />
    <aside class="bag__panel" role="dialog" aria-label="Shopping bag">
      <header class="bag__head">
        <h2 class="t-display t-h4">Your Bag <sup>({{ count }})</sup></h2>
        <button class="t-label" @click="bagOpen = false">Close ×</button>
      </header>

      <div v-if="!items.length" class="bag__empty">
        <p class="t-lead">Your bag is waiting for its first piece.</p>
        <NuxtLink to="/collections" class="btn btn--dark" @click="bagOpen = false">Explore the collections</NuxtLink>
      </div>

      <ul v-else class="bag__list" data-lenis-prevent>
        <li v-for="i in items" :key="i.key" class="bag__item">
          <NuxtLink :to="`/products/${i.slug}`" class="bag__img" @click="bagOpen = false"><img :src="i.image" :alt="i.name"></NuxtLink>
          <div class="bag__info">
            <NuxtLink :to="`/products/${i.slug}`" class="bag__name" @click="bagOpen = false">{{ i.name }}</NuxtLink>
            <p class="bag__meta">{{ i.metalName }}<template v-if="i.size"> · {{ i.size }}</template></p>
            <div class="bag__row">
              <QuantityStepper :model-value="i.qty" :min="0" @update:model-value="v => setQty(i.key, v)" />
              <span class="bag__price">{{ formatPrice(i.price * i.qty) }}</span>
            </div>
            <button class="bag__remove u-link" @click="remove(i.key)">Remove</button>
          </div>
        </li>
      </ul>

      <footer v-if="items.length" class="bag__foot">
        <div class="bag__line"><span>Subtotal</span><span>{{ formatPrice(subtotal) }}</span></div>
        <div class="bag__line"><span>Insured delivery</span><span>{{ shipping ? formatPrice(shipping) : 'Complimentary' }}</span></div>
        <div class="bag__line bag__total"><span>Total</span><span>{{ formatPrice(total) }}</span></div>
        <NuxtLink to="/checkout" class="btn btn--dark bag__cta" @click="bagOpen = false">Proceed to checkout</NuxtLink>
        <p class="bag__note">Every piece arrives in an ORVESSA case with a certificate of authenticity.</p>
      </footer>
    </aside>
  </div>
</template>

<script setup>
const { bagOpen } = useUi()
const { items, count, subtotal, shipping, total, setQty, remove } = useCart()
const { stop, start } = useSmoothScroll()
watch(bagOpen, v => (v ? stop() : start()))
</script>

<style scoped>
.bag { position: fixed; inset: 0; z-index: var(--z-drawer); pointer-events: none; }
.bag.is-open { pointer-events: auto; }
.bag__shade { position: absolute; inset: 0; background: rgba(10, 8, 6, 0.55); opacity: 0; transition: opacity 0.6s var(--ease-out); }
.is-open .bag__shade { opacity: 1; }
.bag__panel {
  position: absolute; top: 0; right: 0; bottom: 0; width: min(520px, 100vw);
  background: var(--ivory); color: var(--ink-dark);
  display: flex; flex-direction: column; padding: 32px clamp(20px, 3vw, 40px);
  transform: translateX(100%); transition: transform 0.9s var(--ease-out);
}
.is-open .bag__panel { transform: none; }
.bag__head { display: flex; justify-content: space-between; align-items: baseline; padding-bottom: 24px; border-bottom: 1px solid var(--line-dark); }
.bag__head sup { font-size: 0.4em; vertical-align: top; }
.bag__empty { margin: auto 0; display: grid; gap: 28px; justify-items: start; }
.bag__list { list-style: none; overflow-y: auto; flex: 1; padding: 8px 0; }
.bag__item { display: grid; grid-template-columns: 110px 1fr; gap: 20px; padding: 22px 0; border-bottom: 1px solid var(--line-dark); }
.bag__img { aspect-ratio: 4/5; background: var(--sand); overflow: hidden; }
.bag__img img { width: 100%; height: 100%; }
.bag__name { font-family: var(--serif); font-size: 26px; line-height: 1; text-transform: uppercase; }
.bag__meta { font-size: 13px; color: var(--gray); margin: 6px 0 14px; }
.bag__row { display: flex; justify-content: space-between; align-items: center; }
.bag__price { font-size: 15px; }
.bag__remove { margin-top: 12px; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--gray); }
.bag__foot { padding-top: 20px; display: grid; gap: 10px; }
.bag__line { display: flex; justify-content: space-between; font-size: 14px; }
.bag__total { font-size: 17px; font-weight: 600; padding-top: 10px; border-top: 1px solid var(--line-dark); }
.bag__cta { margin-top: 10px; width: 100%; }
.bag__note { font-size: 12px; color: var(--gray); text-align: center; }
</style>
