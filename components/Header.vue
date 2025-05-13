<script setup lang="ts">
const store = useAppStore()
const authStore = useAuthStore()
const { t } = useI18n()
const user = computed(() => authStore.user)
</script>

<template>
  <header class="app_header">
    <NuxtLink to="/">
      <img src="/images/logo.png" class="h-8" alt="">
    </NuxtLink>
    <div class="flex-1 flex gap-2 items-center">
      <SearchComponent />
    </div>
    <div class="flex items-center gap-2">
      <div class="header-links">
        <BasketWidget />
        <FavoritesWidget />
      </div>
      <NuxtLink to="/me" v-if="user" class="avatar">
        {{ user.username[0] }}
      </NuxtLink>
      <button v-else @click="store.setShowLoginModal(true)">
        {{ t('login') }}
      </button>
    </div>
  </header>
</template>
