/** Global UI state: drawers, overlays and toasts. */
export function useUi() {
  const bagOpen = useState('ui:bag', () => false)
  const menuOpen = useState('ui:menu', () => false)
  const searchOpen = useState('ui:search', () => false)
  const introDone = useState('ui:intro', () => false)
  const toasts = useState('ui:toasts', () => [])

  function closeAll() { bagOpen.value = false; menuOpen.value = false; searchOpen.value = false }
  function open(which) { closeAll(); ({ bag: bagOpen, menu: menuOpen, search: searchOpen })[which].value = true }
  function toast(text, action) {
    const id = Date.now() + Math.random()
    toasts.value.push({ id, text, action })
    setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id) }, 3200)
  }
  return { bagOpen, menuOpen, searchOpen, introDone, toasts, open, closeAll, toast }
}
