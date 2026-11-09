<template>
  <div ref="root" class="intro" aria-label="Loading ORVESSA" role="status">
    <div class="intro__center">
      <h1 class="intro__logo" aria-label="ORVESSA">
        <span v-for="(c, i) in 'ORVESSA'" :key="i" class="intro__char"><span>{{ c }}</span></span>
      </h1>
      <div class="intro__line"><i :style="{ transform: `scaleX(${shown.p})` }" /></div>
    </div>
  </div>
</template>

<script setup>
// Preloader: only the logo and a hairline of loading progress.
// As soon as the Maison is ready (and the logo has had its moment) it
// dissolves by itself and hands over to the cinematic opening.
import gsap from 'gsap'
const props = defineProps({ progress: { type: Number, default: 0 } })
const emit = defineEmits(['logo', 'start', 'done'])
const root = ref(null)
const shown = reactive({ p: 0 })
let logoIn = false, leaving = false

watch(() => props.progress, p => { gsap.to(shown, { p, duration: 0.8, ease: 'power2.out' }); tryLeave() })

function tryLeave() {
  if (leaving || !logoIn || props.progress < 1) return
  leaving = true
  const el = root.value
  gsap.timeline({ delay: 0.5 })
    .to(shown, { p: 1, duration: 0.4 })
    .add(() => emit('start'))
    .to(el.querySelectorAll('.intro__char > span'), { yPercent: -110, opacity: 0, filter: 'blur(8px)', duration: 0.9, ease: 'power3.in', stagger: 0.05 }, '<')
    .to(el.querySelector('.intro__line'), { scaleX: 0, opacity: 0, duration: 0.7, ease: 'power3.in' }, '<0.2')
    .to(el, { opacity: 0, duration: 1.1, ease: 'power2.inOut', onComplete: () => emit('done') }, '-=0.2')
}

onMounted(() => {
  const el = root.value
  gsap.timeline({ delay: 0.15, onComplete: () => { logoIn = true; emit('logo'); tryLeave() } })
    .fromTo(el.querySelectorAll('.intro__char > span'), { yPercent: 115, filter: 'blur(10px)' }, { yPercent: 0, filter: 'blur(0px)', duration: 1.5, ease: 'expo.out', stagger: 0.08 })
    .fromTo(el.querySelector('.intro__logo'), { letterSpacing: '0.42em' }, { letterSpacing: '0.2em', duration: 2.2, ease: 'expo.out' }, 0)
    .fromTo(el.querySelector('.intro__line'), { opacity: 0 }, { opacity: 1, duration: 0.8 }, 0.6)
})
</script>

<style scoped>
.intro { position: fixed; inset: 0; z-index: var(--z-intro); display: grid; place-items: center; color: var(--ink); background: var(--espresso); }
.intro__center { display: flex; flex-direction: column; align-items: center; }
.intro__logo { font-family: var(--serif); font-weight: 400; font-size: clamp(54px, 10vw, 180px); line-height: 0.9; letter-spacing: 0.2em; margin-right: -0.2em; display: flex; }
.intro__char { display: inline-block; overflow: hidden; padding-bottom: 0.04em; }
.intro__char > span { display: inline-block; }
.intro__line { width: min(260px, 50vw); height: 1px; background: rgba(198, 164, 106, 0.18); margin-top: 26px; }
.intro__line i { display: block; height: 100%; background: var(--gold); transform-origin: left; transform: scaleX(0); }
</style>
