<template>
  <div class="home">
    <IntroExperience v-if="showIntro" :progress="progress" @logo="load = true" @start="started = true" @done="finish" />
    <MaisonHero :intro="playIntro" :load="load" :started="started" @progress="p => (progress = p)" @revealed="introDone = true" />
    <BrandStory />
    <CategoryExperience />
    <CollectionShowcase />
    <CraftsmanshipSection />
    <FeaturedProducts />
    <CampaignSection />
    <FinalExperience />
  </div>
</template>

<script setup>
import gsap from 'gsap'
// Scene 01: the logo preloader plays once per visit, then the camera pulls
// back out of the arch painting. Scrolling then carries the camera through
// the Maison (Scene 02) before the editorial chapters below.
const { introDone } = useUi()
const { stop, reset } = useSmoothScroll()
const playIntro = !introDone.value
const showIntro = ref(playIntro)
const started = ref(false)
const progress = ref(0)
// the logo plays first; only then does the heavy WebGL scene build
const load = ref(!playIntro)
// while the scene compiles the main thread can stall; keep GSAP from
// jumping its clock forward so the opening is never skipped
function finish() { showIntro.value = false; gsap.ticker.lagSmoothing(0) }
onMounted(() => { if (playIntro) { reset(); stop(); gsap.ticker.lagSmoothing(500, 33) } })
useHead({ title: 'ORVESSA — The Art of Timeless Beauty' })
</script>
