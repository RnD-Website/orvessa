import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Shared motion vocabulary. Every scene uses the same eases and timings:
 *  - characters rise from a clipped line (expo.out, 1.2s, 0.02 stagger)
 *  - images open from a clip-path inset while scaling down from 1.25
 *  - parallax is always scrubbed, never time-based
 */
export const EASE = 'expo.out'
export const EASE_IO = 'power3.inOut'

/** Split an element's text into line > word > char spans (no plugin needed). */
export function splitText(el, { type = 'chars' } = {}) {
  if (!el || el.dataset.split) return el?._split
  const text = el.textContent
  const lines = el.innerHTML.split(/<br\s*\/?>/i).map(s => s.replace(/<[^>]+>/g, '').trim())
  el.innerHTML = ''
  const chars = [], words = []
  lines.forEach(line => {
    const l = document.createElement('span')
    l.className = 'split-line'
    line.split(' ').forEach((w, wi, arr) => {
      const word = document.createElement('span')
      word.className = 'split-word'
      if (type === 'chars') {
        for (const ch of w) {
          const c = document.createElement('span')
          c.className = 'split-char'
          c.textContent = ch
          word.appendChild(c)
          chars.push(c)
        }
      } else word.textContent = w
      words.push(word)
      l.appendChild(word)
      if (wi < arr.length - 1) l.appendChild(document.createTextNode(' '))
    })
    el.appendChild(l)
  })
  el.setAttribute('aria-label', text.replace(/\s+/g, ' ').trim())
  el.dataset.split = '1'
  el._split = { chars, words, lines: [...el.querySelectorAll('.split-line')] }
  return el._split
}

export function useAnimations() {
  const ctx = gsap.context(() => {})
  const reduced = import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  /** Characters rising into view. */
  function charsIn(el, { delay = 0, stagger = 0.022, duration = 1.25, trigger, start = 'top 85%', y = '110%' } = {}) {
    const s = splitText(el)
    if (!s) return
    return ctx.add(() => gsap.fromTo(s.chars, { yPercent: reduced ? 0 : 110, opacity: reduced ? 0 : 1 }, {
      yPercent: 0, opacity: 1, duration, ease: EASE, stagger, delay,
      scrollTrigger: trigger === false ? undefined : { trigger: trigger || el, start }
    }))
  }
  /** Words/lines fading up (for body copy). */
  function linesIn(el, { delay = 0, trigger, start = 'top 88%' } = {}) {
    const s = splitText(el, { type: 'words' })
    if (!s) return
    return ctx.add(() => gsap.fromTo(s.words, { yPercent: 100, opacity: 0 }, {
      yPercent: 0, opacity: 1, duration: 1.1, ease: EASE, stagger: 0.012, delay,
      scrollTrigger: trigger === false ? undefined : { trigger: trigger || el, start }
    }))
  }
  /** Image mask reveal: clip-path opens while the image settles from 1.25 scale. */
  function maskIn(wrap, { from = 'bottom', delay = 0, start = 'top 85%', duration = 1.6 } = {}) {
    if (!wrap) return
    const img = wrap.querySelector('img, video, canvas')
    const clip = { bottom: 'inset(100% 0% 0% 0%)', top: 'inset(0% 0% 100% 0%)', left: 'inset(0% 100% 0% 0%)', right: 'inset(0% 0% 0% 100%)', center: 'inset(18% 18% 18% 18%)' }[from]
    return ctx.add(() => {
      const tl = gsap.timeline({ delay, scrollTrigger: { trigger: wrap, start } })
      tl.fromTo(wrap, { clipPath: clip }, { clipPath: 'inset(0% 0% 0% 0%)', duration, ease: 'expo.inOut' })
      if (img) tl.fromTo(img, { scale: 1.3 }, { scale: 1, duration: duration + 0.4, ease: EASE }, 0)
      return tl
    })
  }
  /** Scrubbed parallax on any element. */
  function parallax(el, { y = -12, trigger, scale } = {}) {
    if (!el || reduced) return
    return ctx.add(() => gsap.fromTo(el, { yPercent: -y / 2, ...(scale ? { scale: scale[0] } : {}) }, {
      yPercent: y / 2, ...(scale ? { scale: scale[1] } : {}), ease: 'none',
      scrollTrigger: { trigger: trigger || el, start: 'top bottom', end: 'bottom top', scrub: true }
    }))
  }
  /** Simple fade-up for groups. */
  function fadeUp(targets, { stagger = 0.08, trigger, start = 'top 88%', y = 40, delay = 0 } = {}) {
    return ctx.add(() => gsap.fromTo(targets, { y, opacity: 0 }, {
      y: 0, opacity: 1, duration: 1.2, ease: EASE, stagger, delay,
      scrollTrigger: trigger === false ? undefined : { trigger: trigger || targets, start }
    }))
  }
  function add(fn) { return ctx.add(fn) }

  onBeforeUnmount(() => ctx.revert())
  return { gsap, ScrollTrigger, charsIn, linesIn, maskIn, parallax, fadeUp, add, ctx, reduced }
}
