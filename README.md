# ORVESSA — The Art of Timeless Beauty

A cinematic luxury jewelry e-commerce experience for **ORVESSA**, a contemporary Milanese jewelry house.
Its interaction language follows **pasqua.it**: a real-time WebGL maison you walk through room by room,
editorial typography over the scene, eye-shaped hotspots, then a scroll-driven editorial site and a
fully working storefront.

**Stack:** Nuxt 3 · Vue 3 · GSAP + ScrollTrigger · Lenis · Three.js — no other runtime dependencies.

---

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build  →  node .output/server/index.mjs
npm run generate   # static export     →  .output/public (deploy to any static host)
```

Node 18.18+ (Node 20/22 recommended).

---

## The experience

| Scene | Where | What happens |
|---|---|---|
| 01 Intro | `components/maison/IntroExperience.vue` | Logo-only preloader tied to real WebGL loading; it dissolves automatically and the camera pulls back out of the arch painting into the hall |
| 02 Hero — the Maison | `components/maison/MaisonHero.vue` + `scene/hall/*` | Live Three.js neoclassical hall. **Scrolling drives one continuous camera journey** (`MaisonScene.buildJourney`): Hall → **CH. I La Maison** → through La Maison's far door into **CH. II Collections**, then its side door into → **CH. III Atelier**. Titles dissolve in from a blur as the camera arrives; eye hotspots fly in to a necklace with price, *View piece* and *Add to bag* |
| 03 Brand story | `components/home/BrandStory.vue` | "More than an ornament." — scroll-scrubbed frame opening to full-bleed macro |
| 04 Collections | `components/home/CategoryExperience.vue` | Pinned stack; each category wipes up over the last (vertical storytelling on mobile) |
| 05 Signature collection | `components/home/CollectionShowcase.vue` | Pinned horizontal scroll with counter-drifting imagery (native swipe on mobile) |
| 06 Craftsmanship | `components/home/CraftsmanshipSection.vue` | Sticky step list synced to masked macro images |
| 07 Featured products | `components/home/FeaturedProducts.vue` | Filterable product grid with wishlist + metal swatches |
| 08 Product detail | `pages/products/[slug].vue` | Gallery with lens zoom, fullscreen zoom, swipe; metal & length variants; quantity; bag; wishlist; delivery; accordions; related |
| 09 Campaign | `components/home/CampaignSection.vue` | "Your story. Your forever." full-screen campaign |
| 10 Final | `components/home/FinalExperience.vue` + `components/layout/SiteFooter.vue` | Closing statement, services, newsletter, contact, navigation |

Global: full-screen editorial menu, search overlay, shopping-bag drawer, toasts, custom cursor
(fine pointers only), espresso curtain page transitions, Lenis smooth scrolling synced to GSAP.

---

## Project structure

```
ORVESSA_shop/
├─ app.vue                     global overlays (bag, search, menu, cursor, curtain)
├─ nuxt.config.js
├─ assets/css/                 tokens.css (palette, type, motion) · base.css · typography.css
├─ components/
│  ├─ maison/                  IntroExperience, MaisonHero (WebGL hero + chapters + hotspots)
│  ├─ home/                    BrandStory, CategoryExperience, CollectionShowcase,
│  │                           CraftsmanshipSection, FeaturedProducts, CampaignSection, FinalExperience
│  ├─ layout/                  MainNavigation, MenuOverlay, SearchOverlay, ShoppingBag,
│  │                           CustomCursor, PageCurtain, ToastStack, SiteFooter
│  ├─ product/                 ProductCard, ProductGallery, ProductDetail, WishlistButton
│  ├─ shop/                    ProductGrid, ShopToolbar, NewsletterForm
│  └─ ui/                      QuantityStepper
├─ composables/                useAnimations · useSmoothScroll · useCart · useWishlist ·
│                              useListing · useAccount · useUi · useStoredState
├─ data/                       catalog.js (products, categories, metals) · site.js (nav, chapters, contact)
├─ services/commerce.js        ← the ONLY data boundary (swap for Shopify/Medusa later)
├─ pages/                      index · collections/index · collections/[slug] · products/[slug] ·
│                              about · craftsmanship · wishlist · account · checkout
├─ scene/
│  ├─ jewelry.js               procedural jewelry: gold, diamonds, velvet bust, statement necklaces
│  └─ hall/                    MaisonScene.js (rooms, lights, camera flights, hotspots),
│                              architecture.js, props.js, textures.js
├─ public/images/              products/ · scenes/ · craft/  (rendered from scene/jewelry.js)
└─ tools/
   ├─ render/                  offline studio renderer that produced every image
   └─ prototype/               standalone page to iterate on the 3D maison without Nuxt
```

---

## Commerce: frontend now, backend later

Everything a shopper can click works — filtering, sorting, search, variants, bag, quantities,
wishlist, newsletter, demo account, demo checkout with order confirmation.

- Catalogue lives in `data/catalog.js`.
- Components never import data directly for lists/orders; they call `services/commerce.js`
  (`listProducts`, `getProduct`, `searchSync`, `placeOrder`, `subscribe`).
- Bag, wishlist, account and orders persist in `localStorage` via `useStoredState`.

To go live, re-implement the functions in `services/commerce.js` against your platform's API and
replace `useCart` storage with the platform cart. No component changes are required.

---

## Imagery

All jewelry imagery is **rendered from the same procedural 3D models** that appear in the live maison,
so lighting and grading stay consistent across the site:

- `public/images/products/{piece}-{metal}-{1|2|3}.webp` — 7 necklaces × 3 golds × 3 views
  (the metal selector on product pages swaps the real photography)
- `public/images/scenes/*` — editorial, category and campaign images
- `public/images/craft/*` — atelier macros

**Using your own photography:** keep the same filenames (or update `image` keys in `data/catalog.js`
and paths in the home components). A model campaign photo can replace `scenes/campaign.webp`.

**Re-rendering** after editing `scene/jewelry.js`:

```bash
npm i -D playwright && npx playwright install chromium
npm run render                         # everything
npm run render -- products/            # only product shots
npm run render -- scenes/campaign      # a single shot
```

---

## Design system

- Palette: Deep Black `#101010`, Champagne Gold `#C6A46A` (accent only), Warm Ivory `#F5F1E9`,
  Soft Beige `#D8CBB9`, Muted Gray `#85817B`, plus maison sepia surfaces (`--espresso`, `--umber`, `--sand`).
- Type: **Instrument Serif** (condensed high-contrast display) + **Manrope** (light grotesk caps),
  self-hosted via `@fontsource`.
- Motion: one vocabulary in `composables/useAnimations.js` — characters rise from clipped lines
  (`expo.out`), images open with clip-path while settling from 1.3× scale, parallax is always scrubbed.
  `prefers-reduced-motion` is respected.

## Performance notes

- Three.js is code-split and only loaded on the home page; the render loop pauses when the hero leaves
  the viewport. Mobile gets a lower pixel ratio, smaller shadow maps and fewer particles.
- If WebGL is unavailable, the hero falls back to `scenes/maison-poster.webp`.
