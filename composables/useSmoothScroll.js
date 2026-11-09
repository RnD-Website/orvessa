import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let lenis = null
let tick = null

/**
 * Lenis smooth scrolling synced to GSAP's ticker so ScrollTrigger
 * scrubs stay frame-perfect. Touch devices keep native scrolling.
 */
export function useSmoothScroll() {
  function init() {
    if (lenis || !import.meta.client) return lenis
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null
    lenis = new Lenis({ duration: 1.25, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, syncTouch: false })
    lenis.on('scroll', ScrollTrigger.update)
    tick = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return lenis
  }
  function scrollTo(target, opts = {}) {
    if (lenis) lenis.scrollTo(target, { duration: 1.6, ...opts })
    else if (typeof target === 'number') window.scrollTo({ top: target, behavior: 'smooth' })
    else document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
  }
  function stop() { lenis?.stop() }
  function start() { lenis?.start() }
  function reset() { lenis ? lenis.scrollTo(0, { immediate: true }) : window.scrollTo(0, 0) }
  return { init, scrollTo, stop, start, reset, get lenis() { return lenis } }
}
