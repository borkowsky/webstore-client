<script setup lang="ts">
const authStore = useAuthStore()
const store = useFavoritesStore()
const route = useRoute()
const {t} = useI18n()
const user = computed(() => authStore.user)

if (user?.value?.id) {
  store.fetch()
}
watch(() => user.value, (): void => {
  if (user.value?.id) {
    store.fetch()
  }
})
</script>

<template>
  <NuxtLink to="/me/favorites"
            class="favorites_widget"
            :class="route.fullPath === '/me/favorites' ? 'active' : ''">
    <div v-if="store.total" class="badge">{{ store.total }}</div>
    <Icon :name="route.fullPath === '/me/favorites' ? 'solar:heart-pulse-2-bold-duotone' : 'solar:heart-outline'" class="text-2xl leading-none"/>
    <span>
      {{ t('favorites') }}
    </span>
  </NuxtLink>
</template>
