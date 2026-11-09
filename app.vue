<template>
  <div class="app">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ShoppingBag />
    <SearchOverlay />
    <MenuOverlay />
    <ToastStack />
    <PageCurtain />
    <CustomCursor />
  </div>
</template>

<script setup>
const { init } = useSmoothScroll()
onMounted(() => init())
</script>
