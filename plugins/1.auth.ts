export default defineNuxtPlugin(async (_nuxtApp) => {
  const auth = useAuthStore()
  await auth.reAuthenticate().catch((e: Error) => {
    console.log('Plugin: reauthenticate error', e)
  })
})
