/**
 * Commerce adapter — the ONLY place the UI talks to for catalogue and orders.
 *
 * Today it serves local demo data with small artificial latency so loading
 * states are exercised. To go live, re-implement these async functions
 * against your platform (Shopify Storefront API, Medusa, Commerce Layer…);
 * the composables and components stay unchanged.
 */
import { PRODUCTS, CATEGORIES } from '~/data/catalog'

const wait = (ms = 120) => new Promise(r => setTimeout(r, ms))

export async function listProducts({ category, metal, sort = 'featured', query } = {}) {
  await wait()
  let list = PRODUCTS.slice()
  if (category && category !== 'all') list = list.filter(p => p.category === category)
  if (metal && metal !== 'all') list = list.filter(p => p.metals.includes(metal))
  if (query) list = searchSync(query, list)
  if (sort === 'price-asc') list.sort((a, b) => a.price - b.price)
  if (sort === 'price-desc') list.sort((a, b) => b.price - a.price)
  if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name))
  return list
}

export async function getProduct(slug) {
  await wait(80)
  return PRODUCTS.find(p => p.slug === slug) ?? null
}

export function getCategory(slug) {
  return CATEGORIES.find(c => c.slug === slug) ?? null
}

export function related(product, n = 4) {
  const same = PRODUCTS.filter(p => p.slug !== product.slug && p.category === product.category)
  const rest = PRODUCTS.filter(p => p.slug !== product.slug && p.category !== product.category)
  return [...same, ...rest].slice(0, n)
}

function norm(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase() }
export function searchSync(query, list = PRODUCTS) {
  const q = norm(query.trim())
  if (!q) return []
  return list.filter(p => norm(`${p.name} ${p.category} ${p.stone} ${p.short}`).includes(q))
}

/** Demo checkout: validates and returns an order reference. */
export async function placeOrder({ items, customer }) {
  await wait(900)
  if (!items?.length) throw new Error('Your bag is empty.')
  if (!customer?.email || !/^\S+@\S+\.\S+$/.test(customer.email)) throw new Error('Please enter a valid email.')
  const ref = 'ORV-' + Math.random().toString(36).slice(2, 8).toUpperCase()
  return { ref, total: items.reduce((s, i) => s + i.price * i.qty, 0) }
}

export async function subscribe(email) {
  await wait(500)
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Please enter a valid email address.')
  return true
}
