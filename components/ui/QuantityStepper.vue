<template>
  <div class="qty" role="group" aria-label="Quantity">
    <button type="button" aria-label="Decrease quantity" :disabled="modelValue <= min" @click="$emit('update:modelValue', modelValue - 1)">−</button>
    <output aria-live="polite">{{ modelValue }}</output>
    <button type="button" aria-label="Increase quantity" :disabled="modelValue >= max" @click="$emit('update:modelValue', modelValue + 1)">+</button>
  </div>
</template>
<script setup>
defineProps({ modelValue: { type: Number, default: 1 }, min: { type: Number, default: 1 }, max: { type: Number, default: 10 } })
defineEmits(['update:modelValue'])
</script>
<style scoped>
.qty { display: inline-flex; align-items: center; height: 44px; border: 1px solid currentColor; border-radius: 40px; }
.qty button { width: 40px; height: 100%; font-size: 16px; }
.qty button:disabled { opacity: 0.3; }
.qty output { min-width: 26px; text-align: center; font-size: 14px; }
</style>
