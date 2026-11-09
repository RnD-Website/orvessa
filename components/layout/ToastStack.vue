<template>
  <div class="toasts" aria-live="polite">
    <TransitionGroup name="toast">
      <div v-for="t in toasts" :key="t.id" class="toast"><i />{{ t.text }}</div>
    </TransitionGroup>
  </div>
</template>
<script setup>
const { toasts } = useUi()
</script>
<style scoped>
.toasts { position: fixed; left: var(--gutter); bottom: 28px; z-index: calc(var(--z-drawer) + 1); display: grid; gap: 10px; pointer-events: none; }
.toast { display: flex; align-items: center; gap: 12px; padding: 14px 22px; border-radius: 40px; background: var(--ivory); color: var(--ink-dark); font-size: 13px; letter-spacing: 0.03em; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25); }
.toast i { width: 6px; height: 6px; border-radius: 50%; background: var(--gold); }
.toast-enter-active, .toast-leave-active { transition: all 0.6s var(--ease-out); }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(16px); }
</style>
