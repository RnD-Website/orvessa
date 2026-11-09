import { PRODUCTS } from '~/data/catalog'

export function useWishlist() {
  const slugs = useStoredState('wishlist', () => [])
  const { toast } = useUi()
  const items = computed(() => slugs.value.map(s => PRODUCTS.find(p => p.slug === s)).filter(Boolean))
  const has = (slug) => slugs.value.includes(slug)
  function toggle(slug) {
    const p = PRODUCTS.find(x => x.slug === slug)
    if (has(slug)) { slugs.value = slugs.value.filter(s => s !== slug); toast(`${p?.name} removed from wishlist`) }
    else { slugs.value = [...slugs.value, slug]; toast(`${p?.name} saved to wishlist`) }
  }
  return { slugs, items, has, toggle, count: computed(() => slugs.value.length) }
}
