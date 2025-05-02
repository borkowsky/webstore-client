export default defineNuxtRouteMiddleware(async (to, _from) => {
  if (import.meta.client) return
  const auth = useAuthStore()
  if (!to.matched.length)
    return

  const publicRoutes: string[] = ['/login', '/register', '/']
  const publicStartsRoutes: string[] = [
    '/category/'
  ]

  await auth.reAuthenticate().catch(() => null)

  if (!auth.user) {
    if (!publicRoutes.includes(to.path) && !publicStartsRoutes.some((r: string) => to.path.startsWith(r)))
      return navigateTo('/')
  }
})
