<script setup lang="ts">
const store = useAppStore()
const authStore = useAuthStore()
const {notify} = useNotification()
const {t} = useI18n()
const show = computed({
  get() {
    return store.showRegisterModal
  },
  set(val: boolean) {
    store.setShowRegisterModal(val)
  }
})
const inputed = reactive({
  username: '',
  password: '',
  email: ''
})
const ready = computed(() => !!inputed.username.length && !!inputed.password.length && !!inputed.email.length)
const register = () => {
  if (!ready.value) return false
  $api('/auth/register', {
    method: 'post',
    body: JSON.stringify(inputed)
  }).then(() => {
    authStore.login(inputed.username, inputed.password).then(() => {
      window.location.reload()
    }).catch((e) => {
      notify({
        type: 'error',
        title: t('error'),
        text: t('login_error')
      })
    })
  }).catch(() => {
    notify({
      type: 'error',
      title: t('error'),
      text: t('createAccountError')
    })
  })
}
</script>

<template>
  <Modal
      v-model="show"
  >
    <template #title>
      {{ t('createAccount') }}
    </template>
    <div class="flex flex-col gap-2">
      <label for="username_input">{{ t('username') }}</label>
      <input id="username_input"
             type="text"
             :placeholder="t('input_text')"
             @keyup.enter="register"
             v-model="inputed.username">
      <label for="email_input">{{ t('email') }}</label>
      <input id="email_input"
             type="email"
             :placeholder="t('input_text')"
             @keyup.enter="register"
             v-model="inputed.email">
      <label for="password_input">{{ t('password') }}</label>
      <input id="password_input"
             type="password"
             :placeholder="t('input_text')"
             @keyup.enter="register"
             v-model="inputed.password">
      <div class="flex justify-end mt-2">
        <button :disabled="!ready" @click="register">{{ t('register') }}</button>
      </div>
    </div>
  </Modal>
</template>
