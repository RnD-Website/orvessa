<template>
  <div class="about">
    <header class="about__hero grain">
      <img ref="heroImg" class="about__bg" src="/images/scenes/about.webp" alt="Gold bars in the ORVESSA atelier">
      <div class="about__hero-in wrap">
        <p class="t-paren">(Our story — since 1987)</p>
        <h1 class="about__h"><span ref="h1" class="t-grotesk">A house of</span> <span ref="h2" class="t-display">quiet brilliance</span></h1>
      </div>
    </header>

    <section class="about__intro ivory">
      <div class="wrap about__cols">
        <p ref="lead" class="t-lead about__lead">ORVESSA was founded in a two-room workshop behind Via della Spiga by goldsmith Elena Varesi, who believed a necklace should be made the way a portrait is painted: slowly, by one hand, for one person.</p>
        <div class="about__text">
          <p>Almost four decades later, the workshop has grown into a Maison of twenty-two artisans — yet every piece still passes through the hands of a single goldsmith from first wire to final polish, and is signed by them on the clasp.</p>
          <p>We make only necklaces: gold collars, ropes and chains, diamond rivières, cascades and pendants. Focusing on one gesture, close to the heart, lets us perfect it.</p>
        </div>
      </div>
    </section>

    <section class="about__values">
      <div class="wrap">
        <div v-for="(v, i) in VALUES" :key="v.t" class="about__value">
          <span class="t-paren">({{ String(i + 1).padStart(2, '0') }})</span>
          <h3 class="t-display">{{ v.t }}</h3>
          <p>{{ v.d }}</p>
        </div>
      </div>
    </section>

    <section class="about__imgs">
      <div class="wrap about__img-grid">
        <div class="mask about__img a"><img src="/images/scenes/story-bust.webp" alt="Celeste rope necklace on an ivory bust"></div>
        <div class="mask about__img b"><img src="/images/scenes/cat-pendants.webp" alt="Lumière pear diamond pendant"></div>
        <div class="mask about__img c"><img src="/images/craft/diamonds.webp" alt="Loose brilliant diamonds"></div>
      </div>
    </section>

    <section class="about__timeline ivory">
      <div class="wrap">
        <h2 class="about__th"><span class="t-grotesk">Four decades,</span> <span class="t-display">one gesture</span></h2>
        <ol>
          <li v-for="m in MILESTONES" :key="m.y"><b class="t-display">{{ m.y }}</b><p>{{ m.t }}</p></li>
        </ol>
        <NuxtLink to="/collections" class="btn btn--dark">Discover the collections</NuxtLink>
      </div>
    </section>
  </div>
</template>
<script setup>
const VALUES = [
  { t: 'One pair of hands', d: 'Each necklace is made from start to finish by a single goldsmith, who signs the clasp.' },
  { t: 'Traceable gold', d: 'Recycled 18k gold, alloyed in-house, with every gram documented from refiner to atelier.' },
  { t: 'Natural diamonds', d: 'Chosen one by one under the loupe for life and fire, never by certificate alone.' },
  { t: 'Made to last', d: 'Lifetime cleaning, re-polishing and resizing for every piece we have ever made.' }
]
const MILESTONES = [
  { y: '1987', t: 'Elena Varesi opens a two-room workshop in Milan, making gold ropes for the city’s jewelers.' },
  { y: '1996', t: 'The first ORVESSA rivière is made for a private client; it takes eleven weeks.' },
  { y: '2008', t: 'The Maison moves to Via della Spiga and opens its salon to the public.' },
  { y: '2019', t: 'ORVESSA commits to 100% recycled, traceable gold across every collection.' },
  { y: 'Today', t: 'Twenty-two artisans, one gesture: necklaces made to be worn for a lifetime.' }
]
const heroImg = ref(null), h1 = ref(null), h2 = ref(null), lead = ref(null)
const { charsIn, linesIn, maskIn, parallax, fadeUp } = useAnimations()
onMounted(() => {
  charsIn(h1.value, { trigger: false, delay: 0.5 }); charsIn(h2.value, { trigger: false, delay: 0.65 })
  parallax(heroImg.value, { y: 20, scale: [1.15, 1.05] })
  linesIn(lead.value)
  fadeUp(document.querySelectorAll('.about__value'), { stagger: 0.12 })
  document.querySelectorAll('.about__img').forEach((el, i) => maskIn(el, { from: ['bottom', 'top', 'right'][i], delay: i * 0.1 }))
  fadeUp(document.querySelectorAll('.about__timeline li'), { stagger: 0.1 })
})
useHead({ title: 'Our Story — ORVESSA' })
</script>
<style scoped>
.about__hero { position: relative; height: 92vh; min-height: 560px; overflow: hidden; display: flex; align-items: flex-end; background: var(--black); }
.about__bg { position: absolute; inset: 0; width: 100%; height: 100%; }
.about__hero::before { content: ''; position: absolute; inset: 0; z-index: 1; background: linear-gradient(0deg, rgba(10, 7, 5, 0.8), transparent 60%); }
.about__hero-in { position: relative; z-index: 2; padding-bottom: clamp(40px, 8vh, 100px); display: grid; gap: 18px; }
.about__h { font-weight: 400; font-size: clamp(56px, 9.6vw, 176px); line-height: 0.86; }
.about__h span { display: inline-block; }
.about__intro { padding: var(--section) 0; }
.about__cols { display: grid; grid-template-columns: 1.3fr 1fr; gap: clamp(30px, 6vw, 110px); }
.about__lead { font-size: clamp(26px, 2.8vw, 44px); }
.about__text { display: grid; gap: 20px; font-size: 16px; line-height: 1.75; opacity: 0.8; align-content: end; }
.about__values { background: var(--umber); padding: var(--section) 0; }
.about__values .wrap { display: grid; grid-template-columns: repeat(4, 1fr); gap: clamp(20px, 3vw, 50px); }
.about__value { display: grid; gap: 14px; align-content: start; border-top: 1px solid var(--line); padding-top: 24px; }
.about__value h3 { font-size: clamp(32px, 3vw, 50px); }
.about__value p { font-size: 15px; line-height: 1.65; opacity: 0.8; }
.about__imgs { background: var(--umber); padding-bottom: var(--section); }
.about__img-grid { display: grid; grid-template-columns: 1fr 1.3fr 0.8fr; gap: clamp(16px, 2.4vw, 40px); align-items: start; }
.about__img { aspect-ratio: 3 / 4; }
.about__img.b { aspect-ratio: 16 / 10; margin-top: 18vh; }
.about__img.c { aspect-ratio: 1; margin-top: 6vh; }
.about__timeline { padding: var(--section) 0; }
.about__th { font-weight: 400; font-size: clamp(44px, 6vw, 110px); line-height: 0.86; margin-bottom: clamp(40px, 6vw, 90px); }
.about__th span { display: inline-block; }
.about__timeline ol { list-style: none; display: grid; margin-bottom: 60px; }
.about__timeline li { display: grid; grid-template-columns: 220px 1fr; gap: 30px; padding: 26px 0; border-top: 1px solid var(--line-dark); align-items: baseline; }
.about__timeline b { font-size: clamp(40px, 4vw, 66px); font-weight: 400; color: var(--gold-deep); }
.about__timeline li p { font-size: 17px; max-width: 56ch; }
@media (max-width: 900px) {
  .about__cols, .about__img-grid { grid-template-columns: 1fr; }
  .about__values .wrap { grid-template-columns: 1fr 1fr; }
  .about__img.b, .about__img.c { margin-top: 0; }
  .about__timeline li { grid-template-columns: 1fr; gap: 8px; }
}
</style>
