export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    list: [] as number[],
    total: 0 as number
  }),
  getters: {},
  actions: {
    fetch (): void {
      $api("/favorites").then((res: any) => {
        this.total = res?.total || 0
        this.list = res?.payload || []
      }).catch((err: Error) => {
        console.log(err)
      })
    },
    addFavorite (productId: number): Promise<any> {
      if (!productId) return Promise.reject(new Error('Product ID not defined'))
      return $api("/favorites", {
        method: "post",
        body: JSON.stringify({
          product_id: productId
        })
      }).finally(() => this.fetch())
    }
  }
})

