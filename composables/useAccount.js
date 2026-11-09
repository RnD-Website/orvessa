/** Demo account: profile + order history stored locally (no backend). */
export function useAccount() {
  const user = useStoredState('account', () => null)
  const orders = useStoredState('orders', () => [])
  function signIn({ name, email }) { user.value = { name: name.trim(), email: email.trim(), since: new Date().toISOString() } }
  function signOut() { user.value = null }
  function recordOrder(o) { orders.value = [{ ...o, date: new Date().toISOString() }, ...orders.value] }
  return { user, orders, signIn, signOut, recordOrder }
}
