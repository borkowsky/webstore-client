<script setup lang="ts">
const store = useAppStore()
const {t} = useI18n()
const route = useRoute()
const basketStore = useBasketStore()
const favoritesStore = useFavoritesStore()
const {notify} = useNotification()
const {formatTimeAbsolute, paymentStatusIcons, orderStatusIcons} = useMixins()
store.setTitle(t('orders.orderTitle'))
useHead({
  title: t('orders.orderTitle')
})
definePageMeta({
  validate: (route) => {
    return typeof route.params.id === 'string' && /^\d+$/.test(route.params.id)
  }
})
const id = computed(() => route?.params?.id)
const {data: orderData} = await useAsyncData('order', () => $api(`/orders/${id.value}`).catch(() => null))
const order = computed(() => orderData.value?.payload)
const showPayModal: Ref<boolean> = ref(false)
if (!order.value) {
  await navigateTo("/")
}
const cards: Ref<any> = ref([{
  id: '39783-25',
  number: ['****', '****', '****', '1234'],
  type: 'mastercard'
}, {
  id: '48976-02',
  number: ['****', '****', '****', '5678'],
  type: 'visa'
}, {
  id: '46464-27',
  number: ['****', '****', '****', '9012'],
  type: 'mastercard'
}])
const selectedCard: Ref<any> = ref({
  id: '39783-25',
  number: ['****', '****', '****', '1234'],
  type: 'mastercard'
})
const breadcrumbItems = computed(() => ([{
  title: t('me.title'),
  path: '/me',
}, {
  title: t('orders.title'),
  path: '/me/orders'
}, {
  title: `${t('orders.orderTitle')} #${id.value}`,
  path: `/me/orders/${id.value}`
}]))

const pay = (): void => {
  $api("/payments", {
    method: "post",
    body: JSON.stringify({
      payment_id: order.value.payment?.id
    })
  }).then(() => {
    showPayModal.value = false
    notify({
      type: 'success',
      title: t('information'),
      text: t('payment.paymentOk')
    })
  }).catch(() => {
    notify({
      type: 'error',
      title: t('error'),
      text: t('payment.paymentError')
    })
  }).finally(() => {
    refreshNuxtData('order')
  })
}
</script>

<template>
  <div class="side_menu pt-6">
    <div class="heading">
      {{ t('orders.paymentInformation') }}
    </div>
    <div class="px-4">
      <div class="flex items-center gap-1">
        <Icon :name="paymentStatusIcons[order?.payment?.status]" />
        {{ t(`paymentStatus.${order?.payment?.status}`) }}
        <div v-if="order?.payment?.status !== 'CREATED' ">{{ t('at').toLowerCase() }} {{ formatTimeAbsolute(order?.payment?.updatedAt) }}</div>
      </div>
      <div class="text-center font-bold text-3xl my-4">
        ${{ (order.payment?.sum || 0).toFixed(2) }}
      </div>
      <button v-if="order.payment?.status === 'CREATED' && !['RECEIVED', 'REJECTED'].includes(order.status)"
              class="w-full justify-center success"
              @click="showPayModal=true"
      >
        <Icon name="hugeicons:credit-card"/>
        {{ t('orders.pay') }}
      </button>
    </div>
  </div>
  <section>
    <div class="scrolling_page_container">
      <Breadcrumbs :items="breadcrumbItems" class="h-12"/>
      <div class="page-heading sticky-heading">
        <h1>
          {{ t('orders.orderTitle') }} #{{ id }}
        </h1>
      </div>
      <div class="flex items-center justify-between text-xl font-bold">
        <div>
          {{ t('orders.from') }} {{ formatTimeAbsolute(order.createdAt) }}
        </div>
        <div class="flex items-center gap-2">
          <Icon :name="orderStatusIcons[order.status]" class="text-2xl" />
          {{ t(`orderStatus.${order.status}`) }}
        </div>
      </div>
      <div v-if="order.status === 'RECEIVED'" class="my-4">
        <NuxtLink to="/" class="bg-lime-600/30 text-lime-700 px-4 py-2 rounded-lg flex items-center gap-2 max-w-max hover:shadow-lg transition hover:bg-lime-600/70 hover:text-secondary-100">
          <Icon name="solar:stars-minimalistic-bold-duotone" class="text-lg leading-none" />
          {{ t('reviews.leaveReview') }}
        </NuxtLink>
      </div>
      <div class="flex flex-col my-4 gap-2 border-y border-dashed border-secondary-200 py-4">
        <div class="font-bold">
          {{ t('orders.shippingInfo') }}
        </div>
        <div>
          {{ t('orders.deliveryAddress') }}
        </div>
        <div class="flex items-center gap-2">
          <div class="w-12 h-12 flex items-center justify-center rounded-full bg-secondary-200">
            <Icon name="solar:map-point-bold-duotone" class="text-2xl" />
          </div>
          <div class="flex-1">
            <div>{{ order.address?.address }}</div>
            <div class="text-sm">{{ [order.address?.city, order.address?.region, order.address?.country, order?.address?.postalCode].join(', ') }}</div>
          </div>
        </div>
      </div>
      <div class="mt-4 divide-y divide-secondary-100">
        <NuxtLink v-for="item in order.products"
                  :key="`order-${order.id}-product-${item.id}`"
                  :to="`/item/${getCanonicalUrl(item.product)}`"
                  class="py-4 flex gap-4 transition hover:bg-secondary-100 px-4 rounded-lg"
        >
          <div class="flex items-center justify-center shrink-0 w-36">
            <img :src="item.product?.images?.[0]"
                 class="w-full h-full object-contain"
                 :alt="item.product?.name">
          </div>
          <div class="flex-1 flex flex-col justify-between py-2 gap-2">
            <div class="font-bold">
              {{ item.product?.name }}
            </div>
            <div class="line-clamp-3">
              {{ item.product?.description }}
            </div>
            <div class="flex items-center gap-4">
              <div v-if="basketStore.isBasket(item.product?.id)"
                   class="flex items-center justify-center px-3 py-2 bg-primary-100 rounded-lg text-sm gap-2">
                <Icon name="hugeicons:shopping-cart-check-02" class="text-lg leading-none"/>
                {{ t('inCart') }}
              </div>
              <div v-if="favoritesStore.isFavorite(item.product?.id)" class="text-2xl mt-0.5 leading-none flat">
                <Icon name="solar:heart-bold"
                      class="text-red-400"
                />
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>

    <Modal v-model="showPayModal">
      <template #title>
        {{ t('payment.payment') }}
      </template>
      <div>
        <div class="font-bold">
          {{ t('payment.sum') }}
        </div>
        <div class="font-bold text-4xl my-4">
          ${{ order.payment.sum }}
        </div>
        <div class="font-bold">
          {{ t('payment.selectMethod') }}
        </div>
        <div class="my-2">
          {{ t('payment.creditCard') }}
        </div>
        <div class="flex flex-col gap-2">
          <div v-for="(card, idx) in cards"
               :key="`card-${idx}`"
               :class="selectedCard?.id === card.id ? 'payment_card' : 'payment_card collapsed'"
               @click="selectedCard=card"
               class="cursor-pointer">
            <div>
              <div class="font-bold text-sm">
                {{ t('payment.creditCard') }} #{{ card.id }}
              </div>
              <div></div>
            </div>
            <div>
              <div class="flex gap-4 items-center">
                <div v-for="(num, i) in card.number" :key="`c-${idx}-${i}`">{{ num }}</div>
              </div>
              <div>
                <Icon :name="card.type === 'visa' ? 'ri:visa-line' : 'ri:mastercard-fill'" class="text-5xl"/>
              </div>
            </div>
          </div>
        </div>
        <div class="my-4">
          <button class="success large w-full" style="justify-content:center;" @click="pay">
            <Icon name="hugeicons:credit-card-pos" />
            {{ t('orders.pay') }}
          </button>
        </div>
      </div>
      <div class="confirm_buttons mt-6">
        <button class="flat" @click.stop="showPayModal=false">
          <span class="text-secondary-900">
            {{ t('cancel') }}
          </span>
        </button>
      </div>
    </Modal>
  </section>
</template>
