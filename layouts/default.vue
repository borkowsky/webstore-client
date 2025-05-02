<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <main>
    <Header/>
    <div class="flex gap-2">
      <CategoriesLister v-if="route.fullPath === '/' || route.fullPath.startsWith('/category')"/>
      <NuxtPage class="flex-1 page_content"/>
    </div>
    <RegisterModal />
    <LoginModal/>
    <LogoutModal/>
    <div class="fixed bottom-0 inset-x-0 h-12 z-[9999] pointer-events-none">
      <div class="relative mx-6 bottom-6 h-12">
        <NuxtNotifications position="bottom right" :duration="5000" :speed="500"/>
      </div>
    </div>
  </main>
</template>
