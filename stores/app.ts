export const useAppStore = defineStore('app', {
  state: () => ({
    title: 'Web Store' as string,
    showLoginModal: false as boolean,
    showRegisterModal: false as boolean,
    showLogoutModal: false as boolean,
    searchPending: false as boolean,
    searchString: '' as string,
    searchResults: null as any
  }),
  getters: {},
  actions: {
    setSearchPending (bool: boolean): void {
      this.searchPending = bool
    },
    setSearchString (query: string): void {
      this.searchString = query
    },
    setSearchResults (results: any): void {
      this.searchResults = results
    },
    setTitle (title: string): void {
      this.title = title
      if (import.meta.client) {
        document.title = title
      }
    },
    setShowLoginModal (showLoginModal: boolean): void {
      this.showLoginModal = showLoginModal
    },
    setShowLogoutModal (showLogoutModal: boolean): void {
      this.showLogoutModal = showLogoutModal
    },
    setShowRegisterModal (showRegisterModal: boolean): void {
      this.showRegisterModal = showRegisterModal
    }
  }
})

