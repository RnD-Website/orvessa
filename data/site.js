/** Navigation, chapters and global copy. */
export const NAV = [
  { label: 'Home', to: '/' },
  { label: 'Collections', to: '/collections' },
  { label: 'Our Story', to: '/about' },
  { label: 'Craftsmanship', to: '/craftsmanship' }
]

export const MENU = [
  { label: 'The Maison', to: '/', index: '00' },
  { label: 'Collections', to: '/collections', index: '01' },
  { label: 'Our Story', to: '/about', index: '02' },
  { label: 'Craftsmanship', to: '/craftsmanship', index: '03' },
  { label: 'Wishlist', to: '/wishlist', index: '04' }
]

/** The four rooms of the WebGL Maison, in navigation order. */
export const CHAPTERS = [
  { id: 'hall', paren: 'Orvessa presents', l1: 'Beauty that', l2: 'Transcends time.', label: 'The Hall', body: 'Discover exceptional jewelry shaped by artistry, emotion and timeless elegance.' },
  { id: 'maison', paren: 'Ch. I', l1: 'La', l2: 'Maison', label: 'La Maison', cta: { label: 'Our story', to: '/about' } },
  { id: 'collections', paren: 'Ch. II', l1: 'The', l2: 'Collections', label: 'Collections', cta: { label: 'Discover', to: '/collections' } },
  { id: 'atelier', paren: 'Ch. III', l1: 'The', l2: 'Atelier', label: 'Atelier', cta: { label: 'Craftsmanship', to: '/craftsmanship' } }
]

export const CONTACT = {
  email: 'concierge@orvessa.com',
  phone: '+39 02 8899 1200',
  address: 'Via della Spiga 21, 20121 Milano',
  instagram: 'https://instagram.com/orvessa',
  hours: 'Monday – Saturday, 10:00 – 19:00 CET'
}
