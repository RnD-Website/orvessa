<template>
  <div class="acc ivory">
    <div class="wrap acc__grid">
      <header class="acc__head">
        <p class="t-paren">(My ORVESSA)</p>
        <h1 class="acc__h"><span class="t-grotesk">{{ user ? 'Welcome,' : 'Your' }}</span> <span class="t-display">{{ user ? user.name.split(' ')[0] : 'Account' }}</span></h1>
        <p class="acc__note">Demo account — details are stored only in this browser. Connect a commerce backend to enable real customer accounts.</p>
      </header>

      <form v-if="!user" class="acc__form" novalidate @submit.prevent="submit">
        <label><span class="t-eyebrow">Full name</span><input v-model="name" type="text" autocomplete="name" required></label>
        <label><span class="t-eyebrow">Email</span><input v-model="email" type="email" autocomplete="email" required></label>
        <p v-if="error" class="acc__err" role="alert">{{ error }}</p>
        <button class="btn btn--dark" type="submit">Sign in</button>
      </form>

      <div v-else class="acc__panel">
        <div class="acc__cards">
          <NuxtLink to="/wishlist" class="acc__card"><b class="t-display">{{ wishCount }}</b><span class="t-label">Saved pieces</span></NuxtLink>
          <button class="acc__card" @click="open('bag')"><b class="t-display">{{ count }}</b><span class="t-label">In your bag</span></button>
          <div class="acc__card"><b class="t-display">{{ orders.length }}</b><span class="t-label">Orders</span></div>
        </div>
        <h2 class="t-label acc__sub">Order history</h2>
        <ul v-if="orders.length" class="acc__orders">
          <li v-for="o in orders" :key="o.ref"><span>{{ o.ref }}</span><span>{{ new Date(o.date).toLocaleDateString('en-GB') }}</span><span>{{ o.items }} items</span><span>{{ formatPrice(o.total) }}</span></li>
        </ul>
        <p v-else class="acc__empty">No orders yet.</p>
        <button class="u-link t-label acc__out" @click="signOut">Sign out</button>
      </div>
    </div>
  </div>
</template>
<script setup>
const { user, orders, signIn, signOut } = useAccount()
const { count: wishCount } = useWishlist()
const { count } = useCart()
const { open } = useUi()
const name = ref(''), email = ref(''), error = ref('')
function submit() {
  if (name.value.trim().length < 2) return (error.value = 'Please enter your name.')
  if (!/^\S+@\S+\.\S+$/.test(email.value)) return (error.value = 'Please enter a valid email.')
  error.value = ''
  signIn({ name: name.value, email: email.value })
}
useHead({ title: 'Account — ORVESSA' })
</script>
<style scoped>
.acc { min-height: 100vh; padding: calc(var(--nav-h) + 60px) 0 var(--section); }
.acc__grid { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(30px, 6vw, 110px); }
.acc__head { display: grid; gap: 16px; align-content: start; }
.acc__h { font-weight: 400; font-size: clamp(56px, 8vw, 140px); line-height: 0.86; }
.acc__h span { display: inline-block; }
.acc__note { font-size: 13px; opacity: 0.6; max-width: 42ch; }
.acc__form { display: grid; gap: 22px; align-content: start; padding-top: 20px; }
.acc__form label { display: grid; gap: 8px; }
.acc__form input { background: none; border: 0; border-bottom: 1px solid var(--line-dark); padding: 12px 0; font-size: 18px; outline: none; }
.acc__form input:focus { border-color: var(--ink-dark); }
.acc__form .btn { justify-self: start; margin-top: 10px; }
.acc__err { color: #b4553a; font-size: 13px; }
.acc__cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.acc__card { display: grid; gap: 6px; padding: 24px; border: 1px solid var(--line-dark); text-align: left; transition: border-color 0.3s; }
.acc__card:hover { border-color: var(--ink-dark); }
.acc__card b { font-size: 60px; font-weight: 400; line-height: 0.9; }
.acc__sub { margin: 40px 0 10px; }
.acc__orders { list-style: none; }
.acc__orders li { display: grid; grid-template-columns: 1.2fr 1fr 1fr 1fr; padding: 16px 0; border-top: 1px solid var(--line-dark); font-size: 14px; }
.acc__empty { opacity: 0.6; font-size: 14px; }
.acc__out { margin-top: 30px; }
@media (max-width: 900px) { .acc__grid { grid-template-columns: 1fr; } }
</style>
