import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default defineNuxtPlugin(() => {
  gsap.registerPlugin(ScrollTrigger)
  gsap.defaults({ ease: 'power3.out', duration: 1 })
  ScrollTrigger.config({ ignoreMobileResize: true })
  return { provide: { gsap, ScrollTrigger } }
})
