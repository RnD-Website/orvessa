/**
 * ORVESSA demo catalogue.
 * This is the single source of product truth for the frontend while no
 * commerce backend is connected. `services/commerce.js` reads from here;
 * swap that adapter for Shopify / Medusa / Commerce Layer later without
 * touching components.
 */

export const METALS = [
  { id: 'yellow', name: '18k Yellow Gold', swatch: '#d9b26a' },
  { id: 'white', name: '18k White Gold', swatch: '#e6e4df' },
  { id: 'rose', name: '18k Rose Gold', swatch: '#e2a78f' }
]

export const CATEGORIES = [
  {
    slug: 'diamond-necklaces', name: 'Diamond Necklaces', index: '01', headline: 'A Symbol of Forever.',
    intro: 'Rivières and cascades of white diamonds, each stone matched by eye and set by hand in our atelier.',
    image: '/images/scenes/cat-diamond.webp', cta: 'Explore Diamonds'
  },
  {
    slug: 'gold-necklaces', name: 'Gold Necklaces', index: '02', headline: 'Close to Your Heart.',
    intro: 'Sculpted collars and hand-twisted ropes in solid 18k gold, made to rest exactly where it matters.',
    image: '/images/scenes/cat-gold.webp', cta: 'Explore Gold'
  },
  {
    slug: 'pendants', name: 'Pendants', index: '03', headline: 'The Art of Detail.',
    intro: 'A single remarkable stone, held in the finest bezel we know how to make.',
    image: '/images/scenes/cat-pendants.webp', cta: 'Explore Pendants'
  },
  {
    slug: 'chains', name: 'Chains', index: '04', headline: 'A Touch of Elegance.',
    intro: 'Oversized cable links and layered fine chains — gold worn as a gesture.',
    image: '/images/scenes/cat-chains.webp', cta: 'Explore Chains'
  }
]

const LENGTHS = ['40cm', '42cm', '45cm', '50cm']
const COLLAR = ['S · 36cm', 'M · 38cm', 'L · 40cm']

/** image key → /images/products/{key}-{metal}-{1..3}.webp */
const P = (o) => ({ sizes: LENGTHS, metals: ['yellow', 'white', 'rose'], ...o })

export const PRODUCTS = [
  P({
    slug: 'aurora-diamond-riviere', name: 'Aurora Diamond Rivière', category: 'diamond-necklaces', image: 'ophelie-riviere', price: 38500, metals: ['white', 'yellow', 'rose'],
    stone: '41 graduated brilliant diamonds, 12.40ct total, F–G colour, VS', signature: true, featured: true, sizes: COLLAR,
    short: 'A graduated line of white diamonds in open collets.',
    description: 'Aurora rises from fine brilliants at the nape to two-carat stones at the heart. Every collet is open at the back so light passes straight through each diamond — the necklace seems to float on the skin.'
  }),
  P({
    slug: 'celeste-gold-necklace', name: 'Celeste Gold Necklace', category: 'gold-necklaces', image: 'celeste-necklace', price: 5200,
    stone: 'Solid 18k gold, three-strand rope', signature: true, featured: true,
    short: 'A hand-twisted rope chain that drapes like silk.',
    description: 'Three strands of gold are twisted by hand into a supple rope that follows the collarbone and never kinks. Simple, weighty, and meant to be worn every day for decades.'
  }),
  P({
    slug: 'elara-diamond-cascade', name: 'Elara Diamond Cascade', category: 'diamond-necklaces', image: 'cassia-cascade', price: 26900, metals: ['white', 'yellow', 'rose'],
    stone: '15 pear diamonds and 64 brilliants, 8.20ct total', signature: true, featured: true, sizes: COLLAR,
    short: 'A fringe of pear diamonds falling from a fine chain.',
    description: 'Elara hangs fifteen pear-shaped diamonds from lines of tiny brilliants, longest at the centre. When she moves, the fringe moves with her — the most kinetic piece in the Maison.'
  }),
  P({
    slug: 'solenne-gold-collar', name: 'Solenne Gold Collar', category: 'gold-necklaces', image: 'maelle-collar', price: 14800,
    stone: 'Seven rows of solid 18k gold, 0.30ct brilliant medallion', signature: true, featured: true, sizes: COLLAR,
    short: 'Seven sculpted rows of gold, worn high on the collarbone.',
    description: 'Solenne is built from seven graduated rows of polished gold that open like rings on water across the collarbone. A single brilliant, set in a gold medallion, marks the centre.'
  }),
  P({
    slug: 'lumiere-diamond-pendant', name: 'Lumière Diamond Pendant', category: 'pendants', image: 'lumiere-pendant', price: 6800,
    stone: '2.10ct pear-shaped diamond with a brilliant halo', signature: true, featured: true,
    short: 'A pear diamond held in a whisper of gold.',
    description: 'Our signature pendant: a pear-shaped diamond framed by the finest bezel we can make and a halo of small brilliants, hung from a delicate cable chain.'
  }),
  P({
    slug: 'etoile-gold-chain', name: 'Étoile Gold Chain', category: 'chains', image: 'atlas-chain', price: 9400,
    stone: 'Solid 18k gold oversized cable links', signature: true, featured: true,
    short: 'Oversized polished links with an engraved tag.',
    description: 'Étoile is made of oversized cable links, each one forged, soldered and polished by hand. The engraved tag at the front can be personalised with initials.'
  }),
  P({
    slug: 'aria-layered-chain', name: 'Aria Layered Chain', category: 'chains', image: 'aria-chain', price: 2900,
    stone: 'Solid 18k gold, three chains', featured: true,
    short: 'Three chains, three lengths, one gesture.',
    description: 'A fine cable, a rope and a bold link, already layered at the perfect lengths so they never tangle.'
  })
]

export const productImages = (p, metal = p.metals[0]) => [1, 2, 3].map(n => `/images/products/${p.image}-${metal}-${n}.webp`)
export const metalName = (id) => METALS.find(m => m.id === id)?.name ?? id
