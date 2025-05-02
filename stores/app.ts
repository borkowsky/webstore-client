export const useAppStore = defineStore('app', {
  state: () => ({
    title: 'Web Store' as string,
    showLoginModal: false as boolean,
    showRegisterModal: false as boolean,
    showLogoutModal: false as boolean
  }),
  getters: {},
  actions: {
    setTitle (title: string) {
      this.title = title
      if (import.meta.client) {
        document.title = title
      }
    },
    setShowLoginModal (showLoginModal: boolean) {
      this.showLoginModal = showLoginModal
    },
    setShowLogoutModal (showLogoutModal: boolean) {
      this.showLogoutModal = showLogoutModal
    },
    setShowRegisterModal (showRegisterModal: boolean) {
      this.showRegisterModal = showRegisterModal
    }
  }
})

