<template>
  <div class="co ivory">
    <div class="wrap">
      <header class="co__head">
        <p class="t-paren">(Secure checkout — demo)</p>
        <h1 class="co__h"><span class="t-grotesk">{{ done ? 'Thank' : 'Your' }}</span> <span class="t-display">{{ done ? 'you' : 'Order' }}</span></h1>
      </header>

      <div v-if="done" class="co__done">
        <p class="t-lead">Your order <b>{{ done.ref }}</b> has been received.</p>
        <p>This is a demo storefront, so no payment was taken and nothing will ship. In production this step hands over to your commerce platform’s payment flow.</p>
        <NuxtLink to="/collections" class="btn btn--dark">Continue exploring</NuxtLink>
      </div>

      <div v-else-if="!items.length" class="co__done">
        <p class="t-lead">Your bag is empty.</p>
        <NuxtLink to="/collections" class="btn btn--dark">Explore the collections</NuxtLink>
      </div>

      <div v-else class="co__grid">
        <form class="co__form" novalidate @submit.prevent="place">
          <fieldset>
            <legend class="t-label">Contact</legend>
            <label><span class="t-eyebrow">Email</span><input v-model="f.email" type="email" autocomplete="email" required></label>
          </fieldset>
          <fieldset>
            <legend class="t-label">Delivery</legend>
            <div class="co__two">
              <label><span class="t-eyebrow">First name</span><input v-model="f.first" autocomplete="given-name" required></label>
              <label><span class="t-eyebrow">Last name</span><input v-model="f.last" autocomplete="family-name" required></label>
            </div>
            <label><span class="t-eyebrow">Address</span><input v-model="f.address" autocomplete="street-address" required></label>
            <div class="co__two">
              <label><span class="t-eyebrow">City</span><input v-model="f.city" autocomplete="address-level2" required></label>
              <label><span class="t-eyebrow">Postcode</span><input v-model="f.zip" autocomplete="postal-code" required></label>
            </div>
            <label><span class="t-eyebrow">Country</span>
              <select v-model="f.country"><option>Italy</option><option>France</option><option>United Kingdom</option><option>United States</option><option>United Arab Emirates</option><option>Bangladesh</option></select>
            </label>
          </fieldset>
          <label class="co__gift"><input v-model="f.gift" type="checkbox"> Gift-wrap with a handwritten card</label>
          <p v-if="error" class="co__err" role="alert">{{ error }}</p>
          <button class="btn btn--dark co__btn" :disabled="busy" type="submit">{{ busy ? 'Placing order…' : `Place demo order — ${formatPrice(total)}` }}</button>
        </form>

        <aside class="co__sum">
          <h2 class="t-label">Summary</h2>
          <ul>
            <li v-for="i in items" :key="i.key">
              <img :src="i.image" :alt="i.name">
              <div><b>{{ i.name }}</b><span>{{ i.metalName }}<template v-if="i.size"> · {{ i.size }}</template> · ×{{ i.qty }}</span></div>
              <span>{{ formatPrice(i.price * i.qty) }}</span>
            </li>
          </ul>
          <div class="co__line"><span>Subtotal</span><span>{{ formatPrice(subtotal) }}</span></div>
          <div class="co__line"><span>Insured delivery</span><span>{{ shipping ? formatPrice(shipping) : 'Complimentary' }}</span></div>
          <div class="co__line co__total"><span>Total</span><span>{{ formatPrice(total) }}</span></div>
        </aside>
      </div>
    </div>
  </div>
</template>
<script setup>
import { placeOrder } from '~/services/commerce'
const { items, subtotal, shipping, total, count, clear } = useCart()
const { user, recordOrder } = useAccount()
const f = reactive({ email: user.value?.email || '', first: user.value?.name.split(' ')[0] || '', last: '', address: '', city: '', zip: '', country: 'Italy', gift: false })
const busy = ref(false), error = ref(''), done = ref(null)
async function place() {
  error.value = ''
  if (!f.first || !f.last || !f.address || !f.city || !f.zip) return (error.value = 'Please complete your delivery details.')
  busy.value = true
  try {
    const res = await placeOrder({ items: items.value, customer: { ...f } })
    recordOrder({ ref: res.ref, total: res.total + shipping.value, items: count.value })
    clear()
    done.value = res
    window.scrollTo(0, 0)
  } catch (e) { error.value = e.message } finally { busy.value = false }
}
useHead({ title: 'Checkout — ORVESSA' })
</script>
<style scoped>
.co { min-height: 100vh; padding: calc(var(--nav-h) + 60px) 0 var(--section); }
.co__head { display: grid; gap: 14px; margin-bottom: 50px; }
.co__h { font-weight: 400; font-size: clamp(56px, 8vw, 140px); line-height: 0.86; }
.co__h span { display: inline-block; }
.co__grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: clamp(30px, 6vw, 110px); align-items: start; }
.co__form { display: grid; gap: 34px; }
.co__form fieldset { border: 0; display: grid; gap: 18px; }
.co__form legend { margin-bottom: 14px; }
.co__form label { display: grid; gap: 6px; }
.co__form input:not([type=checkbox]), .co__form select { background: none; border: 0; border-bottom: 1px solid var(--line-dark); padding: 10px 0; font-size: 16px; outline: none; }
.co__two { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.co__gift { display: flex !important; grid-auto-flow: column; align-items: center; gap: 10px; font-size: 14px; }
.co__err { color: #b4553a; font-size: 13px; }
.co__btn { justify-self: start; }
.co__sum { position: sticky; top: calc(var(--nav-h) + 20px); padding: 30px; background: var(--sand); display: grid; gap: 12px; }
.co__sum ul { list-style: none; display: grid; gap: 14px; margin: 10px 0; }
.co__sum li { display: grid; grid-template-columns: 64px 1fr auto; gap: 14px; align-items: center; font-size: 14px; }
.co__sum li img { aspect-ratio: 4/5; width: 64px; }
.co__sum li b { display: block; font-family: var(--serif); font-weight: 400; font-size: 20px; text-transform: uppercase; line-height: 1; }
.co__sum li span { font-size: 12px; opacity: 0.7; }
.co__line { display: flex; justify-content: space-between; font-size: 14px; }
.co__total { font-size: 17px; font-weight: 600; border-top: 1px solid var(--line-dark); padding-top: 12px; }
.co__done { display: grid; gap: 22px; justify-items: start; max-width: 60ch; }
@media (max-width: 900px) { .co__grid { grid-template-columns: 1fr; } .co__sum { position: static; } }
</style>
