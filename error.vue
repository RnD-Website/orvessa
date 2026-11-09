<template>
  <div class="err grain">
    <p class="t-paren">({{ error?.statusCode || 404 }})</p>
    <h1 class="t-display t-h2">This piece<br>is not in the Maison</h1>
    <NuxtLink class="btn btn--gold" to="/" @click="clearError()">Return home</NuxtLink>
  </div>
</template>
<script setup>
defineProps({ error: Object })
</script>
<style scoped>
.err { min-height: 100vh; display: grid; place-content: center; gap: 32px; text-align: center; padding: var(--gutter); background: var(--espresso); position: relative; overflow: hidden; }
.err .btn { justify-self: center; }
</style>
