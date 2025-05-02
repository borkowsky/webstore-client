export default defineNuxtRouteMiddleware(async (to, _from) => {
  if (import.meta.client) return
  const auth = useAuthStore()
  if (!to.matched.length)
    return

  const adminRoutes: string[] = ['/admin']
  const adminStartRoutes: string[] = [
    '/admin/'
  ]

  await auth.reAuthenticate().catch(() => null)

  if (
    (adminRoutes.includes(to.path) ||
    adminStartRoutes.some((r: string) => to.path.startsWith(r))) &&
    auth.user?.role !== 'ADMINISTRATOR'
  ) {
    return navigateTo('/')
  }
})
