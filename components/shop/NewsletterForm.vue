<template>
  <form class="nl" novalidate @submit.prevent="submit">
    <label for="nl-email" class="sr-only">Email address</label>
    <input id="nl-email" v-model="email" type="email" placeholder="Your email address" :disabled="state === 'done'" required>
    <button class="nl__btn" :disabled="state === 'loading' || state === 'done'" type="submit">
      {{ state === 'loading' ? 'Joining…' : state === 'done' ? 'Welcome' : 'Subscribe' }}
    </button>
    <p class="nl__msg" :class="state" aria-live="polite">{{ msg }}</p>
  </form>
</template>
<script setup>
import { subscribe } from '~/services/commerce'
const email = ref('')
const state = ref('idle')
const msg = ref('')
async function submit() {
  state.value = 'loading'; msg.value = ''
  try { await subscribe(email.value); state.value = 'done'; msg.value = 'Thank you — private previews will arrive in your inbox.' }
  catch (e) { state.value = 'error'; msg.value = e.message }
}
</script>
<style scoped>
.nl { display: grid; grid-template-columns: 1fr auto; border-bottom: 1px solid currentColor; position: relative; }
.nl input { background: none; border: 0; outline: none; padding: 16px 0; font-size: 16px; }
.nl input::placeholder { color: inherit; opacity: 0.5; }
.nl__btn { font-size: 12px; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; padding-left: 20px; transition: color 0.3s; }
.nl__btn:hover { color: var(--gold); }
.nl__msg { position: absolute; top: calc(100% + 10px); left: 0; font-size: 12px; opacity: 0.8; }
.nl__msg.error { color: #d98a6c; opacity: 1; }
</style>
