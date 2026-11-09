// ORVESSA — Nuxt configuration
// The experience is WebGL/GSAP-driven and fully client-rendered (SPA).
// Switch `ssr` to true later if you connect a commerce backend that needs SEO pages;
// every browser-only API is already guarded inside onMounted / .client plugins.
export default defineNuxtConfig({
  compatibilityDate: '2024-09-01',
  ssr: false,
  devtools: { enabled: false },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'ORVESSA — The Art of Timeless Beauty',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'ORVESSA is a contemporary luxury jewelry house. Discover rings, necklaces, earrings and bracelets shaped by artistry, emotion and timeless elegance.' },
        { name: 'theme-color', content: '#101010' },
        { property: 'og:title', content: 'ORVESSA — The Art of Timeless Beauty' },
        { property: 'og:image', content: '/images/scenes/maison-poster.webp' }
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }]
    },
    pageTransition: false
  },

  css: [
    '@fontsource/instrument-serif/400.css',
    '@fontsource/instrument-serif/400-italic.css',
    '@fontsource/manrope/300.css',
    '@fontsource/manrope/400.css',
    '@fontsource/manrope/500.css',
    '@fontsource/manrope/600.css',
    '~/assets/css/tokens.css',
    '~/assets/css/base.css',
    '~/assets/css/typography.css'
  ],

  components: [
    { path: '~/components', pathPrefix: false }
  ],

  vite: {
    optimizeDeps: { include: ['gsap', 'gsap/ScrollTrigger', 'lenis', 'three'] },
    build: { chunkSizeWarningLimit: 1200 }
  }
})
