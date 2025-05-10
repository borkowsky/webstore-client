import sum from 'lodash/sum'
import min from 'lodash/min'

export const useBasketStore = defineStore('basket', {
  state: () => ({
    list: [] as any[],
    total: 0 as number
  }),
  getters: {
    isBasket: (state: any): (itemId: number) => boolean => {
      return (itemId: number): boolean => state.list.findIndex((i: any) => i?.product?.id === itemId) > -1
    },
    getBasketId: (state: any): (productId: number) => (number | null) => {
      return (productId: number): number | null => state.list.find((i: any) => i?.product?.id === productId)?.id || null
    },
    totalOfSelectedItems: (state: any): (itemIds: number[]) => number => {
      return (itemIds: number[]) => sum(state.list.filter((i: any) => itemIds.includes(+i.id)).map((i: any) => +i.amount))
    },
    totalSumOfSelectedItems: (state: any): (itemIds: number[]) => number => {
      return (itemIds: number[]) => sum(state.list.filter((i: any) => itemIds.includes(+i.id)).map(
        (i: any) => i.amount * (min([parseFloat(i.product.discountPrice || i.product.price), parseFloat(i.product.price)]) ?? 0.00))
      )
    },
    totalItems: (state: any) => sum(state.list.map((i: any) => +i.amount)),
    totalSum: (state: any) => sum(state.list.map(
      (i: any) => parseFloat(+i.amount * (i.product?.discountPrice && (i.product?.discountPrice < i.product?.price)) ? i.product?.discountPrice : i.product?.price))
    ),
  },
  actions: {
    async fetch (): Promise<any> {
      await $api("/basket").then((res: any) => {
        this.total = res?.total || 0
        this.list = res?.payload || []
      }).catch((err: Error) => {
        console.log(err)
      })
    },
    async addBasket (productId: number, amount: number): Promise<any> {
      if (!productId) return Promise.reject(new Error('Product ID not defined'))
      await $api("/basket", {
        method: "post",
        body: JSON.stringify({
          product_id: productId,
          amount
        })
      }).finally(() => this.fetch())
    },
    async removeBasket (basketId: number): Promise<any> {
      if (!basketId) return Promise.reject(new Error('Basket ID not defined'))
      await $api(`/basket/${basketId}`, {
        method: "delete"
      }).finally(() => this.fetch())
    },
    async removeBaskets (basketIds: number[]): Promise<any> {
      if (!basketIds.length) return Promise.reject(new Error('Basket IDs not defined or empty'))
      await $api(`/basket`, {
        method: "delete",
        body: JSON.stringify({
          basket_ids: basketIds
        })
      }).finally(() => this.fetch())
    },
    async incAmount (itemId: number): Promise<any> {
      if (!itemId || itemId < 0) return Promise.reject(new Error('Item Id not defined'))
      const item: any = this.list.find((i: any) => +i.id === +itemId)
      if (!item) return Promise.reject(new Error('Item not found'))
      await $api(`/basket/${itemId}`, {
        method: "patch",
        body: JSON.stringify({
          amount: (item.amount || 0) + 1
        })
      }).finally(() => this.fetch())
    },
    async decAmount (itemId: number): Promise<any> {
      if (!itemId || itemId < 0) return Promise.reject(new Error('Item Id not defined'))
      const item: any = this.list.find((i: any) => +i.id === +itemId)
      if (!item) return Promise.reject(new Error('Item not found'))
      if (item.amount < 1) return Promise.reject(new Error('Invalid amount'))
      await $api(`/basket/${itemId}`, {
        method: "patch",
        body: JSON.stringify({
          amount: (item.amount || 2) - 1
        })
      }).finally(() => this.fetch())
    }
  }
})

