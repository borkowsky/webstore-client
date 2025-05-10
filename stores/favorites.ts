export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    list: [] as any[],
    total: 0 as number
  }),
  getters: {
    isFavorite: (state: any): (itemId: number) => boolean => {
      return (itemId: number): boolean => state.list.findIndex((i: any) => i?.product?.id === itemId) > -1
    },
    getFavoriteId: (state: any): (productId: number) => (number | null) => {
      return (productId: number): number | null => state.list.find((i: any) => i?.product?.id === productId)?.id || null
    }
  },
  actions: {
    async fetch (): Promise<any> {
      await $api("/favorites").then((res: any) => {
        this.total = res?.total || 0
        this.list = res?.payload || []
      }).catch((err: Error) => {
        console.log(err)
      })
    },
    async addFavorite (productId: number): Promise<any> {
      if (!productId) return Promise.reject(new Error('Product ID not defined'))
      await $api("/favorites", {
        method: "post",
        body: JSON.stringify({
          product_id: productId
        })
      }).finally(() => this.fetch())
    },
    async removeFavorite (favoriteId: number): Promise<any> {
      if (!favoriteId) return Promise.reject(new Error('Favorite ID not defined'))
      await $api(`/favorites/${favoriteId}`, {
        method: "delete"
      }).finally(() => this.fetch())
    }
  }
})

