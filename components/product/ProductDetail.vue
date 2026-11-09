<template>
  <div class="pd">
    <nav class="pd__crumbs t-eyebrow" aria-label="Breadcrumb">
      <NuxtLink to="/collections" class="u-link">Collections</NuxtLink> /
      <NuxtLink :to="`/collections/${product.category}`" class="u-link">{{ category?.name }}</NuxtLink>
    </nav>
    <h1 ref="title" class="t-display pd__name">{{ product.name }}</h1>
    <p class="pd__price">{{ formatPrice(product.price) }} <small>incl. VAT</small></p>
    <p class="pd__short t-lead">{{ product.short }}</p>
    <p class="pd__desc">{{ product.description }}</p>

    <fieldset class="pd__opt">
      <legend class="t-eyebrow">Metal — <span>{{ metalName(metal) }}</span></legend>
      <div class="pd__metals">
        <label v-for="m in product.metals" :key="m" class="pd__metal" :class="{ on: m === metal }">
          <input v-model="metal" type="radio" name="metal" :value="m" class="sr-only">
          <i :style="{ background: METALS.find(x => x.id === m).swatch }" />{{ metalName(m) }}
        </label>
      </div>
    </fieldset>

    <fieldset v-if="product.sizes.length" class="pd__opt">
      <legend class="t-eyebrow">Length — <span>{{ size || 'Select' }}</span> <button type="button" class="pd__guide u-link" @click="guide = !guide">Size guide</button></legend>
      <div class="pd__sizes" :class="{ err: sizeError }">
        <label v-for="s in product.sizes" :key="s" class="pd__size" :class="{ on: s === size }">
          <input v-model="size" type="radio" name="size" :value="s" class="sr-only">{{ s }}
        </label>
      </div>
      <p v-if="sizeError" class="pd__err" role="alert">Please select a length.</p>
      <p v-if="guide" class="pd__guide-txt">Collar lengths sit at the base of the neck; 40–42cm rests on the collarbone; 45cm falls just below; 50cm reaches the upper chest. Our concierge can resize any chain free of charge.</p>
    </fieldset>

    <div class="pd__buy">
      <QuantityStepper v-model="qty" />
      <button class="btn btn--dark pd__add" @click="addToBag">Add to bag — {{ formatPrice(product.price * qty) }}</button>
      <WishlistButton :slug="product.slug" label class="pd__wish" />
    </div>

    <ul class="pd__service">
      <li><b>Complimentary insured delivery</b> · 2–4 working days, signature on delivery</li>
      <li><b>30-day returns</b> · Free collection from your door</li>
      <li><b>Presented in the ORVESSA case</b> · With certificate of authenticity</li>
    </ul>

    <div class="pd__acc">
      <details v-for="(sec, i) in sections" :key="sec.title" :open="i === 0">
        <summary class="t-label">{{ sec.title }}<i /></summary>
        <div class="pd__acc-body"><p v-for="(l, j) in sec.lines" :key="j">{{ l }}</p></div>
      </details>
    </div>
  </div>
</template>

<script setup>
import { METALS, CATEGORIES, metalName } from '~/data/catalog'
const props = defineProps({ product: Object })
const metal = defineModel('metal')
const size = ref('')
const qty = ref(1)
const guide = ref(false)
const sizeError = ref(false)
const { add } = useCart()
const category = computed(() => CATEGORIES.find(c => c.slug === props.product.category))
watch(size, () => (sizeError.value = false))
function addToBag() {
  if (props.product.sizes.length && !size.value) { sizeError.value = true; return }
  add(props.product.slug, { metal: metal.value, size: size.value, qty: qty.value })
}
const sections = computed(() => [
  { title: 'Product details', lines: [`Stones: ${props.product.stone}.`, `Metal: ${metalName(metal.value)}, hallmarked in Italy.`, `Lengths: ${props.product.sizes.join(', ')}.`, `Reference: ORV-${props.product.slug.slice(0, 3).toUpperCase()}-${props.product.price}`] },
  { title: 'Materials & craftsmanship', lines: ['Made by hand in our Milan atelier from recycled, fully traceable 18k gold.', 'Natural diamonds only, conflict-free under the Kimberley Process and selected individually under the loupe.', 'Each piece is signed and numbered by the goldsmith who finished it.'] },
  { title: 'Care', lines: ['Store each piece separately in its ORVESSA pouch to protect the polish.', 'Remove before swimming, sport or applying perfume and creams.', 'Clean gently with warm water and a soft brush; we offer complimentary professional cleaning for life.'] }
])
</script>

<style scoped>
.pd { display: grid; gap: 22px; align-content: start; }
.pd__crumbs { opacity: 0.6; display: flex; gap: 8px; }
.pd__name { font-size: clamp(52px, 5.6vw, 100px); }
.pd__price { font-size: 20px; }
.pd__price small { font-size: 12px; opacity: 0.6; margin-left: 6px; }
.pd__short { font-size: clamp(22px, 2vw, 30px); }
.pd__desc { font-size: 15px; line-height: 1.75; opacity: 0.8; max-width: 52ch; }
.pd__opt { border: 0; display: grid; gap: 12px; padding-top: 18px; border-top: 1px solid var(--line-dark); }
.pd__opt legend { display: flex; gap: 6px; width: 100%; margin-bottom: 12px; float: left; }
.pd__opt legend span { opacity: 0.6; }
.pd__guide { margin-left: auto; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; }
.pd__metals, .pd__sizes { display: flex; flex-wrap: wrap; gap: 10px; clear: both; }
.pd__metal, .pd__size { display: inline-flex; align-items: center; gap: 10px; height: 44px; padding: 0 18px; border: 1px solid var(--line-dark); border-radius: 40px; font-size: 13px; cursor: pointer; transition: border-color 0.3s, background 0.3s, color 0.3s; }
.pd__metal i { width: 14px; height: 14px; border-radius: 50%; box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.15); }
.pd__metal.on, .pd__size.on { border-color: var(--ink-dark); background: var(--ink-dark); color: var(--ivory); }
.pd__sizes.err .pd__size { border-color: #b4553a; }
.pd__err { color: #b4553a; font-size: 13px; }
.pd__guide-txt { font-size: 13px; line-height: 1.6; opacity: 0.75; }
.pd__buy { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; padding-top: 10px; }
.pd__add { flex: 1; min-width: 240px; }
.pd__service { list-style: none; display: grid; gap: 8px; font-size: 13px; opacity: 0.8; padding: 18px 0; border-top: 1px solid var(--line-dark); border-bottom: 1px solid var(--line-dark); }
.pd__service b { font-weight: 600; }
.pd__acc details { border-bottom: 1px solid var(--line-dark); }
.pd__acc summary { list-style: none; display: flex; justify-content: space-between; align-items: center; padding: 20px 0; cursor: pointer; }
.pd__acc summary::-webkit-details-marker { display: none; }
.pd__acc summary i { width: 11px; height: 11px; position: relative; }
.pd__acc summary i::before, .pd__acc summary i::after { content: ''; position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: currentColor; transition: transform 0.4s var(--ease-out); }
.pd__acc summary i::after { transform: rotate(90deg); }
.pd__acc details[open] summary i::after { transform: rotate(0); }
.pd__acc-body { padding-bottom: 22px; display: grid; gap: 8px; font-size: 14px; line-height: 1.7; opacity: 0.8; }
</style>
