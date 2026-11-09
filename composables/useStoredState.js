/** useState that persists to localStorage (safe when storage is blocked). */
export function useStoredState(key, init) {
  const state = useState(key, init)
  const hydrated = useState(key + ':hydrated', () => false)
  if (import.meta.client && !hydrated.value) {
    hydrated.value = true
    try {
      const raw = localStorage.getItem('orvessa:' + key)
      if (raw) state.value = JSON.parse(raw)
    } catch { /* storage unavailable */ }
    watch(state, v => { try { localStorage.setItem('orvessa:' + key, JSON.stringify(v)) } catch {} }, { deep: true })
  }
  return state
}
