const tokenName: string = 'authToken'

interface accessTokenInterface {
  accessToken: string,
  createdAt: string,
  expiresIn: string
}

interface loginResponseInterface {
  success: boolean,
  user: any,
  accessToken: accessTokenInterface
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as any,
    loggedIn: false as boolean,
    accessToken: null as string | null
  }),
  getters: {},
  actions: {
    async fetch (): Promise<any> {
      await $api("/me").then((r: any) => {
        this.setUser(r?.payload || null)
        this.setLoggedIn(!!r?.payload?.id)
        this.setAccessToken(r?.accessToken || null)
        // console.log('reAuthenticate ok', r)
      }).catch((e: Error) => {
        // console.log('reAuthenticate error', e)
      })
    },
    async reAuthenticate(): Promise<boolean> {
      return new Promise((resolve, reject) => {
        const token: string | null = this.getAuthToken()
        if (!token) return reject(false)
        this.accessToken = token
        return $api('/me').then((r: any) => {
          this.setUser(r?.payload || null)
          this.setLoggedIn(!!r?.payload?.id)
          this.setAccessToken(r?.accessToken || null)
          // console.log('reAuthenticate ok', r)
          return resolve(true)
        }).catch((e: Error) => {
          // console.log('reAuthenticate error', e)
          return reject(e)
        })
      })
    },
    login(username: string, password: string): Promise<any> {
      return new Promise((resolve, reject) => {
        $api('/auth/login', {
          method: 'post',
          body: JSON.stringify({
            username,
            password
          })
        }).then((r: any) => {
          this.setUser(r?.user || null)
          this.setAccessToken(r?.token || null)
          this.setLoggedIn(!!r?.user)
          if (this.accessToken) {
            const cookie = useCookie(tokenName, {
              path: '/',
              maxAge: 60 * 60 * 24 * 5
            })
            cookie.value = this.accessToken
          }
          resolve(true)
        })
          .catch((e: Error) => {
            // console.log(e)
            reject(`Authentication error: ${e.message}`)
          })
      })
    },
    logout(): Promise<any> {
      return new Promise((resolve) => {
        const token = useCookie(tokenName)
        token.value = null
        resolve(true)
      })
    },
    getAuthToken(): string | null {
      const token = useCookie(tokenName)
      return token.value || null
    },
    setUser(user: any): void {
      this.user = user
    },
    setAccessToken(accessToken: string): void {
      this.accessToken = accessToken
    },
    setLoggedIn(loggedIn: boolean): void {
      this.loggedIn = loggedIn
    }
  }
})

