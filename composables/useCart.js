import { PRODUCTS, metalName, productImages } from '~/data/catalog'

/**
 * Shopping bag. Lines are keyed by product + metal + size.
 * Persisted locally; replace with your commerce cart API when connecting a backend.
 */
export function useCart() {
  const lines = useStoredState('cart', () => [])
  const { toast, open } = useUi()

  const items = computed(() => lines.value
    .map(l => {
      const p = PRODUCTS.find(x => x.slug === l.slug)
      if (!p) return null
      return { ...l, name: p.name, price: p.price, category: p.category, metalName: metalName(l.metal), image: productImages(p, l.metal)[0] }
    })
    .filter(Boolean))
  const count = computed(() => lines.value.reduce((s, l) => s + l.qty, 0))
  const subtotal = computed(() => items.value.reduce((s, i) => s + i.price * i.qty, 0))
  const shipping = computed(() => (subtotal.value === 0 || subtotal.value >= 1000 ? 0 : 35))
  const total = computed(() => subtotal.value + shipping.value)

  const key = (slug, metal, size) => `${slug}|${metal}|${size || ''}`

  function add(slug, { metal, size = '', qty = 1, openBag = true } = {}) {
    const p = PRODUCTS.find(x => x.slug === slug)
    if (!p) return
    const m = metal || p.metals[0]
    const k = key(slug, m, size)
    const existing = lines.value.find(l => l.key === k)
    if (existing) existing.qty = Math.min(10, existing.qty + qty)
    else lines.value.push({ key: k, slug, metal: m, size, qty })
    toast(`${p.name} added to your bag`)
    if (openBag) open('bag')
  }
  function setQty(k, qty) {
    const l = lines.value.find(x => x.key === k)
    if (!l) return
    if (qty <= 0) remove(k)
    else l.qty = Math.min(10, qty)
  }
  function remove(k) { lines.value = lines.value.filter(l => l.key !== k) }
  function clear() { lines.value = [] }

  return { lines, items, count, subtotal, shipping, total, add, setQty, remove, clear }
}
