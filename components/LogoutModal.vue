<script setup lang="ts">
const store = useAppStore()
const authStore = useAuthStore()
const { notify } = useNotification()
const { t } = useI18n()
const show = computed({
  get() {
    return store.showLogoutModal
  },
  set(val: boolean) {
    store.setShowLogoutModal(val)
  }
})
const logout = () => {
  authStore.logout().then(() => {
    window.location.reload()
  }).catch(() => {
    notify({
      type: 'error',
      title: t('error'),
      text: t('errorOccurredTryAgain')
    })
  })
}
</script>

<template>
  <Modal
      v-model="show"
  >
    <template #title>
      {{ t('logout') }}
    </template>
    <div class="flex flex-col gap-2">
      {{ t('logoutQuestion') }}
    </div>
    <div class="confirm_buttons">
      <div @click="show=false">
        {{ t('cancel') }}
      </div>
      <div class="error" @click="logout">
        {{ t('logout') }}
      </div>
    </div>
  </Modal>
</template>
