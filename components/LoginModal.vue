<script setup lang="ts">
const store = useAppStore()
const authStore = useAuthStore()
const {notify} = useNotification()
const {t} = useI18n()
const show = computed({
  get() {
    return store.showLoginModal
  },
  set(val: boolean) {
    store.setShowLoginModal(val)
  }
})
const inputed = reactive({
  username: '',
  password: ''
})
const ready = computed(() => !!inputed.username.length && !!inputed.password.length)
const login = () => {
  if (!ready.value) return false
  authStore.login(inputed.username, inputed.password).then(() => {
    window.location.reload()
  }).catch(() => {
    notify({
      type: 'error',
      title: t('error'),
      text: t('login_error')
    })
  })
}
const showRegister = () => {
  show.value = false
  nextTick(() => {
    store.setShowRegisterModal(true)
  })
}
</script>

<template>
  <Modal
      v-model="show"
  >
    <template #title>
      {{ t('login') }}
    </template>
    <div class="flex flex-col gap-2">
      <label for="username_input">{{ t('username') }}</label>
      <input id="username_input"
             type="text"
             :placeholder="t('input_text')"
             @keyup.enter="login"
             v-model="inputed.username">
      <label for="password_input">{{ t('password') }}</label>
      <input id="password_input"
             type="password"
             :placeholder="t('input_text')"
             @keyup.enter="login"
             v-model="inputed.password">
      <div class="flex items-center gap-2 my-2 px-4">
        <div>
          {{ t('notHaveAccountQuestion') }}
        </div>
        <div class="cursor-pointer transition hover:text-accent-600 underline decoration-accent-800 underline-offset-2" @click="showRegister">
          {{ t('createAccount') }}
        </div>
      </div>
      <div class="flex justify-end mt-2">
        <button :disabled="!ready" @click="login">{{ t('login') }}</button>
      </div>
    </div>
  </Modal>
</template>
