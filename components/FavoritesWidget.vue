<script setup lang="ts">
const authStore = useAuthStore()
const store = useFavoritesStore()
const route = useRoute()
const {t} = useI18n()
const user = computed(() => authStore.user)

watch(() => user.value, (): void => {
  if (user.value?.id) {
    store.fetch()
  }
})
onBeforeMount(() => {
  if (user?.value?.id) {
    store.fetch()
  }
})
</script>

<template>
  <NuxtLink to="/me/favorites"
            class="favorites_widget"
            :class="route.fullPath === '/me/favorites' ? 'active' : ''">
    <div v-if="store.total" class="badge">{{ store.total }}</div>
    <Icon name="lucide:heart" class="text-2xl leading-none"/>
    <span>
      {{ t('favorites') }}
    </span>
  </NuxtLink>
</template>
