import { listProducts } from '~/services/commerce'

/** Shared listing logic: filters live in the URL so results are shareable. */
export function useListing(categoryRef) {
  const route = useRoute()
  const router = useRouter()
  const metal = computed({ get: () => route.query.metal || 'all', set: v => router.replace({ query: { ...route.query, metal: v === 'all' ? undefined : v } }) })
  const sort = computed({ get: () => route.query.sort || 'featured', set: v => router.replace({ query: { ...route.query, sort: v === 'featured' ? undefined : v } }) })
  const query = computed(() => route.query.q || '')
  const products = ref([])
  const loading = ref(true)
  async function load() {
    loading.value = true
    products.value = await listProducts({ category: unref(categoryRef), metal: metal.value, sort: sort.value, query: query.value })
    loading.value = false
  }
  watch([() => unref(categoryRef), metal, sort, query], load, { immediate: true })
  return { metal, sort, query, products, loading }
}
