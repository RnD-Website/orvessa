<template>
  <div v-if="product" class="pdp">
    <section class="pdp__main ivory">
      <div class="pdp__grid wrap">
        <ProductGallery :images="images" :name="product.name" />
        <div class="pdp__side"><ProductDetail v-model:metal="metal" :product="product" /></div>
      </div>
    </section>

    <section class="pdp__story grain">
      <div ref="band" class="pdp__band"><img ref="bandImg" :src="images[2]" :alt="`${product.name} — detail`"></div>
      <div class="pdp__quote wrap">
        <p class="t-paren">(The detail)</p>
        <p ref="quote" class="t-display pdp__q">Made by one pair of hands, for one person.</p>
      </div>
    </section>

    <section class="pdp__related ivory">
      <div class="wrap">
        <header class="pdp__rel-head">
          <h2 class="feat-h"><span class="t-grotesk">You may</span> <span class="t-display">also love</span></h2>
          <NuxtLink to="/collections" class="u-link t-label">View all</NuxtLink>
        </header>
        <ProductGrid :products="relatedProducts" light />
      </div>
    </section>
  </div>
</template>

<script setup>
import { getProduct, related } from '~/services/commerce'
import { productImages } from '~/data/catalog'
const route = useRoute()
const product = ref(await getProduct(route.params.slug))
if (!product.value) throw createError({ statusCode: 404, statusMessage: 'Piece not found', fatal: true })
const metal = ref(product.value.metals[0])
const images = computed(() => productImages(product.value, metal.value))
const relatedProducts = computed(() => related(product.value, 3))
const band = ref(null), bandImg = ref(null), quote = ref(null)
const { charsIn, parallax, gsap, add } = useAnimations()
onMounted(() => {
  gsap.fromTo('.pdp__side .pd > *', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', stagger: 0.05, delay: 0.4 })
  gsap.fromTo('.gal__stage', { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.6, ease: 'expo.inOut', delay: 0.2 })
  add(() => gsap.fromTo(band.value, { clipPath: 'inset(15% 20% 15% 20%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: band.value, start: 'top bottom', end: 'center center', scrub: true } }))
  parallax(bandImg.value, { y: 16, trigger: band.value, scale: [1.25, 1.1] })
  charsIn(quote.value)
})
useHead(() => ({ title: `${product.value?.name} — ORVESSA`, meta: [{ name: 'description', content: product.value?.short }] }))
</script>

<style scoped>
.pdp__main { padding: calc(var(--nav-h) + 40px) 0 var(--section); }
.pdp__grid { display: grid; grid-template-columns: 1.15fr 1fr; gap: clamp(30px, 6vw, 110px); align-items: start; }
.pdp__side { position: sticky; top: calc(var(--nav-h) + 20px); }
.pdp__story { position: relative; overflow: hidden; background: var(--black); padding-bottom: var(--section); }
.pdp__band { height: 100vh; overflow: hidden; }
.pdp__band img { width: 100%; height: 100%; }
.pdp__quote { margin-top: clamp(50px, 8vw, 120px); text-align: center; display: grid; gap: 18px; justify-items: center; }
.pdp__q { font-size: clamp(48px, 7vw, 128px); max-width: 14ch; }
.pdp__related { padding: var(--section) 0; }
.pdp__rel-head { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: clamp(36px, 5vw, 70px); }
.feat-h { font-weight: 400; font-size: clamp(40px, 5.4vw, 96px); line-height: 0.86; }
.feat-h span { display: inline-block; }
@media (max-width: 900px) {
  .pdp__grid { grid-template-columns: 1fr; }
  .pdp__side { position: static; }
  .pdp__band { height: 60vh; }
}
</style>
