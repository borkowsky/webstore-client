<script setup lang="ts">
const authStore = useAuthStore()
const store = useBasketStore()
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
  <NuxtLink to="/me/basket"
            class="basket_widget"
            :class="route.fullPath === '/me/basket' ? 'active' : ''">
    <div v-if="store.total" class="badge">{{ store.total }}</div>
    <Icon name="solar:cart-4-line-duotone" class="text-2xl leading-none"/>
    <span>
      {{ t('cart') }}
    </span>
  </NuxtLink>
</template>
