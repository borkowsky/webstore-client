<script setup lang="ts">
import min from 'lodash/min'

const store = useAppStore()
const basketStore = useBasketStore()
const authStore = useAuthStore()
const router = useRouter()
const {declOfNum} = useMixins()
const {notify} = useNotification()
const {t} = useI18n()
store.setTitle(t('cart'))
useHead({
  title: t('cart')
})
basketStore.fetch()
const { data: addressesData } = await useAsyncData("addresses", () => $api("/me/addresses").catch(() => null))
const basket = computed(() => basketStore.list)
const user = computed(() => authStore.user)
const addresses = computed(() => addressesData.value?.payload || [])

const selectedItems: Ref<number[], number[]> = ref([])
const showRemoveModal: Ref<boolean> = ref(false)
const changeAmountPending: Ref<boolean> = ref(false)
const selectedAddress: Ref<any> = ref(null)
const canProcessOrder = computed(() => selectedItems.value.length > 0 && !!selectedAddress.value)

onBeforeMount(() => {
  authStore.fetch()
})

const getItemPrice = (product: any): number => {
  if (!product.price) return 0
  if (product.discountPrice) return min([parseFloat(product.discountPrice), parseFloat(product.price)]) ?? product.price
  return product.price
}
const incProductsAmount = (itemId: number): void => {
  if (!itemId || itemId < 0 || changeAmountPending.value) return
  changeAmountPending.value = true
  basketStore.incAmount(itemId).catch(() => {
    notify({
      type: 'error',
      title: t('error'),
      text: t('changeAmountError')
    })
  }).finally(() => {
    changeAmountPending.value = false
  })
}
const decProductsAmount = (itemId: number): void => {
  if (!itemId || itemId < 0 || changeAmountPending.value) return
  changeAmountPending.value = true
  basketStore.decAmount(itemId).catch(() => {
    notify({
      type: 'error',
      title: t('error'),
      text: t('changeAmountError')
    })
  }).finally(() => {
    changeAmountPending.value = false
  })
}
const remove = (): void => {
  if (!selectedItems.value.length) return
  basketStore.removeBaskets(selectedItems.value).then(() => {
    selectedItems.value = []
    showRemoveModal.value = false
    notify({
      type: 'success',
      title: t('information'),
      text: t('removeBasketItemsOk')
    })
  }).catch(() => {
    notify({
      type: 'error',
      title: t('error'),
      text: t('removeBasketItemsFailed')
    })
  })
}

const createOrder = (): void => {
  if (!selectedItems.value.length) return
  $api("/orders", {
    method: "post",
    body: JSON.stringify({
      basket_ids: selectedItems.value,
      address_id: selectedAddress.value
    })
  }).then((res: any) => {
    notify({
      type: 'success',
      title: t('information'),
      text: t('orders.createOk')
    })
    selectedItems.value = []
    selectedAddress.value = null
    router.push(`/me/orders/${res.payload?.id}`)
  }).catch(() => {
    notify({
      type: 'error',
      title: t('error'),
      text: t('orders.createError')
    })
  }).finally(() => {
    basketStore.fetch()
  })
}
</script>
<template>
  <div class="side_menu">
    <div class="heading">
      {{ t('orderingProducts') }}
    </div>
    <div v-if="selectedItems.length" class="px-4 table_list">
      <div class="list_item">
        <div>
          {{ t('total') }}
        </div>
        <div>
          {{
            `${basketStore.totalOfSelectedItems(selectedItems)} ${declOfNum(basketStore.totalOfSelectedItems(selectedItems),
                [t('item'), t('items'), t('items')].map((i: string) => i.toLowerCase()))}`
          }}
        </div>
      </div>
      <div class="list_item">
        <div>{{ t('totalSum') }}</div>
        <div>
          {{ `$${basketStore.totalSumOfSelectedItems(selectedItems).toFixed(2)}` }}
        </div>
      </div>
      <div>
        <div class="heading" style="margin-left: -2.5rem;margin-right: -2.5rem;">
          {{ t('orders.selectAddress') }}
        </div>
        <div v-for="address in addresses"
             :key="`user-address-${address.id}`"
             class="flex items-center gap-2 transition cursor-pointer rounded-xl px-3 py-2"
             :class="selectedAddress===address.id ? 'bg-secondary-100' : ''"
             @click="selectedAddress=address.id"
        >
          <Icon :name="selectedAddress===address.id ? 'ri:checkbox-circle-line' : 'ri:checkbox-blank-circle-line'"
                class="text-2xl"/>
          <div>
            <div class="text-sm">{{ address.address }}</div>
            <div class="text-xs">{{
                [address.city, address.region, address.country, address.postalCode].join(', ')
              }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="flex px-6 text-secondary-800 items-center gap-2">
      <Icon name="solar:info-circle-line-duotone"/>
      {{ t('selectProductsToOrder') }}
    </div>
    <button class="order_button"
            :disabled="!selectedItems.length || !user?.addresses?.length || !canProcessOrder"
            @click.stop="createOrder">
      <Icon name="hugeicons:credit-card" class="text-xl"/>
      {{ t('placeAnOrder') }}
    </button>
    <template v-if="!addresses?.length">
      <div class="bg-red-700/10 rounded-xl p-4">
        <div class="font-bold text-sm flex items-center gap-2">
          <Icon name="hugeicons:information-circle" class="-mt-1 text-lg"/>
          {{ t('information') }}
        </div>
        <div class="my-2">
          {{ t('orders.deliveryAddressWarn') }}
        </div>
        <div class="flex justify-end">
          <NuxtLink to="/me/addresses" class="px-3 py-1.5 bg-secondary-100 rounded-xl transition hover:underline mt-2">
            {{ t('orders.setupAddress') }}
          </NuxtLink>
        </div>
      </div>
    </template>
  </div>
  <section>
    <div class="scrolling_page_container">
      <div class="page-heading sticky-heading flex items-center">
        <div class="flex-1">
          <h1>
            {{ t('cart') }}
          </h1>
        </div>
        <button class="error" :disabled="!selectedItems.length" @click="showRemoveModal=true">
          <Icon name="hugeicons:shopping-cart-remove-02"/>
          {{ t('delete') }}
        </button>
      </div>
      <div>
        <div v-if="basket.length" class="basket_list">
          <div
              v-for="item in basket"
              :key="`basket-item-${item.id}`"
              class="list_item"
          >
            <div class="item_selector">
              <input type="checkbox" v-model="selectedItems" :value="item.id">
            </div>
            <div class="item_image">
              <img :src="item.product?.images?.[0]" :alt="item.product?.name">
            </div>
            <div class="item_content">
              <div class="name">
                {{ item.product?.name }}
              </div>
              <div class="description">
                <div class="font-semibold text-base">
                  ${{ getItemPrice(item.product).toFixed(2) }}
                  <sup v-if="item.product?.discountPrice && item.product.discountPrice < item.product.price"
                       class="opacity-70 line-through"
                  >
                    ${{ item.product?.price?.toFixed(2) }}
                  </sup>
                  x {{ item.amount }} = ${{ (getItemPrice(item.product) * item.amount).toFixed(2) }}
                </div>
              </div>
            </div>
            <div class="item_actions">
              <button :disabled="!item.can_dec_amount" class="modifier" @click="decProductsAmount(item.id)">
                <Icon name="hugeicons:minus-sign"/>
              </button>
              <input type="number" v-model.number="item.amount" readonly>
              <button class="modifier" :disabled="!item.can_inc_amount" @click="incProductsAmount(item.id)">
                <Icon name="hugeicons:plus-sign"/>
              </button>
            </div>
          </div>
        </div>
        <EmptyPlaceholder v-else>
          <template #icon>
            <Icon name="solar:cart-cross-bold-duotone"/>
          </template>
          <div>
            {{ t('basketEmpty') }}
          </div>
        </EmptyPlaceholder>
      </div>
    </div>

    <Modal v-model="showRemoveModal">
      <template #title>
        {{ t('deleteItems') }}
      </template>
      <div class="flex flex-col gap-2">
        {{ t('deleteBasketItemsQuestion') }}
      </div>
      <div class="confirm_buttons mt-6">
        <div @click="showRemoveModal=false">
          {{ t('cancel') }}
        </div>
        <div class="error" @click="remove">
          {{ t('delete') }}
        </div>
      </div>
    </Modal>
  </section>
</template>
